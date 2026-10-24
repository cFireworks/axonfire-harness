const $ = (id) => document.getElementById(id);
let csrf,
  sessionId,
  busy = false;
function notice(text) {
  $("notice").textContent = text;
  $("notice").hidden = !text;
}
async function api(path, body) {
  const response = await fetch(
    path,
    body === undefined
      ? {}
      : {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-axonfire-csrf": csrf,
          },
          body: JSON.stringify(body),
        },
  );
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error ?? `HTTP ${response.status}`);
  }
  return response;
}
function message(role, text = "") {
  $("welcome").hidden = true;
  const article = document.createElement("article");
  article.className = `message ${role}`;
  const label = document.createElement("div");
  label.className = "message-label";
  label.textContent = role === "user" ? "YOU" : "AXONFIRE";
  const content = document.createElement("div");
  content.className = "message-content";
  content.textContent = text;
  article.append(label, content);
  $("messages").append(article);
  return content;
}
function setBusy(value) {
  busy = value;
  for (const id of ["send", "new-session", "compact"]) $(id).disabled = value;
  $("cancel").hidden = !value;
  $("sessions").inert = value;
  document.querySelectorAll(".suggestions button").forEach((button) => {
    button.disabled = value;
  });
}
function setSession(id) {
  sessionId = id;
  $("session-id").textContent = id ? `/ ${id.slice(0, 12)}` : "/ 新会话";
}
async function sessions() {
  const items = await (await api("/api/sessions")).json();
  $("sessions").replaceChildren();
  $("session-count").textContent = items.length;
  for (const item of items) {
    const button = document.createElement("button");
    button.textContent = `${item.id.slice(0, 8)} · ${new Date(item.updatedAt).toLocaleDateString()}`;
    button.classList.toggle("selected", item.id === sessionId);
    button.onclick = async () => {
      try {
        const history = await (
          await api(`/api/history?id=${encodeURIComponent(item.id)}`)
        ).json();
        setSession(item.id);
        $("messages").replaceChildren();
        $("welcome").hidden = true;
        for (const entry of history)
          if (entry.text)
            message(entry.role === "user" ? "user" : "assistant", entry.text);
        await sessions();
      } catch (error) {
        notice(error.message);
      }
    };
    $("sessions").append(button);
  }
}
function decision(type, data) {
  const card = document.createElement("div");
  card.className = "decision";
  const title = document.createElement("strong");
  title.textContent =
    type === "approval" ? `工具审批 · ${data.name}` : "Agent 需要你的回答";
  card.append(title);
  const inputs = [];
  if (type === "approval") {
    if (data.context?.sandbox) {
      const explanation = document.createElement("p");
      explanation.textContent = data.context.bypass
        ? "Sandbox 已拦截此操作。允许本次会在 sandbox 隔离外重新执行此命令。"
        : "Sandbox 已拦截此操作，需要你决定是否继续。";
      card.append(explanation);
      if (data.context.target) {
        const target = document.createElement("p");
        target.textContent = `受影响目标：${data.context.target}`;
        card.append(target);
      }
    }
    const pre = document.createElement("pre");
    pre.textContent = JSON.stringify(data.input, null, 2);
    card.append(pre);
  } else
    for (const question of data.input.questions) {
      const label = document.createElement("label");
      label.textContent = question.question;
      const options = document.createElement("p");
      options.textContent = question.options
        .map((option) => `${option.label}：${option.description}`)
        .join(" / ");
      const input = document.createElement("input");
      input.placeholder = question.multiSelect
        ? "填写答案，多选可用逗号分隔"
        : "填写选项或自由回答";
      inputs.push([question.question, input]);
      label.append(options, input);
      card.append(label);
    }
  const decide = async (allow) => {
    card.querySelectorAll("button").forEach((button) => {
      button.disabled = true;
    });
    try {
      await api(
        type === "approval" ? "/api/approve" : "/api/answer",
        type === "approval"
          ? { id: data.id, allow }
          : {
              id: data.id,
              answers: allow
                ? Object.fromEntries(
                    inputs.map(([key, input]) => [key, input.value]),
                  )
                : { _action: "skip_question" },
            },
      );
      card.remove();
    } catch (error) {
      card.remove();
      notice(error.message);
    }
  };
  for (const [text, allow] of [
    [type === "approval" ? "拒绝" : "跳过", false],
    [type === "approval" ? "允许本次" : "提交回答", true],
  ]) {
    const button = document.createElement("button");
    button.textContent = text;
    button.onclick = () => decide(allow);
    card.append(button);
  }
  $("decisions").append(card);
  card.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
async function run(path, body) {
  if (busy) return;
  setBusy(true);
  notice("");
  let output,
    failure,
    terminal = false;
  try {
    const response = await api(path, {
      ...body,
      ...(sessionId ? { sessionId } : {}),
    });
    const reader = response.body.getReader(),
      decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      let split;
      while ((split = buffer.indexOf("\n\n")) >= 0) {
        const packet = buffer.slice(0, split);
        buffer = buffer.slice(split + 2);
        const event = packet
          .split("\n")
          .find((line) => line.startsWith("event: "))
          ?.slice(7);
        const raw = packet
          .split("\n")
          .find((line) => line.startsWith("data: "))
          ?.slice(6);
        if (!raw) continue;
        const data = JSON.parse(raw);
        if (event === "session") setSession(data.id);
        if (event === "delta") {
          output ??= message("assistant");
          output.textContent += data.text;
        }
        if (event === "approval" || event === "question") decision(event, data);
        if (event === "done") {
          terminal = true;
          if (data.compacted) notice("上下文已压缩，完整本地记录仍保留。");
          else if (!output)
            message("assistant", data.text || "本轮已完成（没有文本输出）。");
        }
        if (event === "error") {
          terminal = true;
          failure = data.error;
        }
      }
      if (done) break;
    }
    if (!terminal) throw new Error("连接中断；请恢复会话检查本轮记录。");
    if (failure) notice(failure);
  } catch (error) {
    notice(error.message);
  } finally {
    setBusy(false);
    $("decisions").replaceChildren();
    await sessions().catch((error) => notice(error.message));
  }
}
$("composer").onsubmit = (event) => {
  event.preventDefault();
  const prompt = $("prompt").value.trim();
  if (!prompt || busy) return;
  message("user", prompt);
  $("prompt").value = "";
  void run("/api/prompt", { prompt });
};
$("prompt").onkeydown = (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    $("composer").requestSubmit();
  }
};
$("new-session").onclick = () => {
  if (busy) return;
  setSession(undefined);
  $("messages").replaceChildren();
  $("welcome").hidden = false;
  notice("");
  $("prompt").focus();
  void sessions();
};
$("compact").onclick = () => {
  if (sessionId) void run("/api/compact", {});
  else notice("先开始一个会话。");
};
$("cancel").onclick = () => {
  void api("/api/cancel", {}).catch((error) => notice(error.message));
};
document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.onclick = () => {
    $("prompt").value = button.dataset.prompt;
    $("prompt").focus();
  };
});
try {
  const status = await (await api("/api/status")).json();
  csrf = status.csrf;
  $("mode").textContent = status.mode === "demo" ? "离线演示" : "本地运行";
  $("model").textContent = status.model;
  $("connection").textContent = location.host;
  if (!status.configured)
    notice(
      status.configurationMessage ??
        "尚未配置模型。在仓库根目录复制 .env.example 为 .env，填写密钥、接口和模型后重启。也可运行 npm run demo 离线体验。",
    );
  else if (status.mode === "demo")
    notice(
      "离线演示模式：使用真实 SDK 与还原 harness，回复为固定示例，不调用远端模型或工具。",
    );
  await sessions();
} catch (error) {
  notice(`无法连接本地服务：${error.message}`);
}
