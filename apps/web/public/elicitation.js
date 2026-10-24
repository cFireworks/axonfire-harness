// Browser presentation only; the original controller owns the request lifecycle.
export function elicitationCard(request, submit) {
  const card = document.createElement("form");
  card.className = "decision";
  const heading = document.createElement("strong");
  heading.textContent = "Agent 需要补充信息";
  const message = document.createElement("p");
  message.textContent = request.message ?? "";
  card.append(heading, message);
  const fields = [];
  let canAccept = true;
  if (request.mode === "url") {
    try {
      const url = new URL(request.url);
      if (!["https:", "http:"].includes(url.protocol)) throw new Error();
      const link = document.createElement("a");
      link.href = url.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = `打开 ${url.host}`;
      card.append(link);
      const hint = document.createElement("p");
      hint.textContent = "请在新窗口完成操作后确认；仅打开链接不会自动提交。";
      card.append(hint);
    } catch {
      canAccept = false;
      message.textContent += " 链接无效或不支持。";
    }
  } else if (request.requestedSchema?.type === "object") {
    const schema = request.requestedSchema;
    for (const [name, property] of Object.entries(schema.properties ?? {})) {
      const label = document.createElement("label");
      const required = schema.required?.includes(name);
      label.textContent = (property.title ?? name) + (required ? " *" : "");
      let input, read;
      if (Array.isArray(property.enum)) {
        input = document.createElement("select");
        const empty = document.createElement("option");
        empty.value = "";
        empty.textContent = "请选择";
        input.append(empty);
        property.enum.forEach((value, index) => {
          const option = document.createElement("option");
          option.value = String(index);
          option.textContent = property.enumNames?.[index] ?? String(value);
          input.append(option);
        });
        if (property.default !== undefined)
          input.value = String(property.enum.indexOf(property.default));
        read = () =>
          input.value === "" ? undefined : property.enum[Number(input.value)];
      } else if (property.type === "boolean") {
        input = document.createElement("input");
        input.type = "checkbox";
        input.checked = property.default === true;
        read = () => input.checked;
      } else if (["string", "number", "integer"].includes(property.type)) {
        input = document.createElement("input");
        input.type =
          property.type === "string"
            ? ({ email: "email", date: "date", uri: "url" }[property.format] ??
              "text")
            : "number";
        if (property.type !== "string")
          input.step = property.type === "integer" ? "1" : "any";
        for (const [key, attribute] of [
          ["minimum", "min"],
          ["maximum", "max"],
          ["minLength", "minlength"],
          ["maxLength", "maxlength"],
          ["pattern", "pattern"],
        ])
          if (property[key] !== undefined)
            input.setAttribute(attribute, String(property[key]));
        if (property.default !== undefined)
          input.value = String(property.default);
        read = () =>
          input.value === "" && !required
            ? undefined
            : property.type === "string"
              ? input.value
              : Number(input.value);
      } else {
        input = document.createElement("textarea");
        input.placeholder =
          property.type === "array" ? '["选项一", "选项二"]' : "JSON";
        if (property.default !== undefined)
          input.value = JSON.stringify(property.default);
        read = () => (input.value.trim() ? JSON.parse(input.value) : undefined);
      }
      if (required && property.type !== "boolean") input.required = true;
      if (property.description) {
        const description = document.createElement("p");
        description.textContent = property.description;
        label.append(description);
      }
      label.append(input);
      card.append(label);
      fields.push([name, read]);
    }
  } else {
    canAccept = false;
    message.textContent += " 此请求的表单格式暂不支持。";
  }
  const error = document.createElement("p");
  error.setAttribute("role", "alert");
  card.append(error);
  const send = async (action) => {
    if (action === "accept" && !card.reportValidity()) return;
    const buttons = [...card.querySelectorAll("button")];
    try {
      const content =
        action === "accept"
          ? Object.fromEntries(
              fields
                .map(([name, read]) => [name, read()])
                .filter(([, value]) => value !== undefined),
            )
          : undefined;
      buttons.forEach((button) => (button.disabled = true));
      await submit({
        action,
        ...(action === "accept" && request.mode !== "url" ? { content } : {}),
      });
      card.remove();
    } catch (cause) {
      error.textContent = cause.message;
      buttons.forEach(
        (button) =>
          (button.disabled = button.dataset.accept === "true" && !canAccept),
      );
    }
  };
  for (const [action, text] of [
    ["cancel", "取消"],
    ["decline", "拒绝"],
    ["accept", request.mode === "url" ? "已完成操作" : "提交"],
  ]) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.dataset.accept = String(action === "accept");
    button.disabled = action === "accept" && !canAccept;
    button.onclick = () => send(action);
    card.append(button);
  }
  card.onsubmit = (event) => {
    event.preventDefault();
    if (canAccept) void send("accept");
  };
  return card;
}
