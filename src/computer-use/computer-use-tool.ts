import { zodToJsonSchema } from "zod-to-json-schema";
import { ToolNames } from "../tools/tool-names.js";
import {
  computerUseParameters as u3,
  requireCoordinate,
  validateNonCoordFields,
} from "./computer-use-schema.js";
import {
  defaultComputerUseExecutor,
  type ComputerUseExecutor,
} from "./computer-use-executor.js";
import {
  createComputerUseRuntime,
  type ComputerUseRuntime,
} from "./computer-use-runtime.js";
import type { ToolManager } from "../tools/tool-manager.js";
const nC = { ToolNames },
  iq = {
    ENV_KEY_CODEBUDDY_COMPUTER_USE_ENABLED: "CODEBUDDY_COMPUTER_USE_ENABLED",
  };
// Extracted from codebuddy.js UTF-16 offsets 12149394..12152228.
export class ComputerUseTool {
  name: any;
  description: any;
  parameters: any;
  isEnabled: any;
  shouldShowInToolSearch: any;

  constructor(
    readonly executor: ComputerUseExecutor = defaultComputerUseExecutor,
    readonly runtime: ComputerUseRuntime = createComputerUseRuntime(),
  ) {
    ((this.name = nC.ToolNames.COMPUTER_USE),
      (this.description =
        "Control the macOS desktop: take screenshots and simulate mouse/keyboard."),
      (this.parameters = u3),
      (this.isEnabled = async (eA: any) => this.isComputerUseEnabled()),
      (this.shouldShowInToolSearch = () => this.isComputerUseEnabled()));
  }
  isComputerUseEnabled(): any {
    if (!this.executor.isDarwin()) return !1;
    let eA: any = this.runtime.env[iq.ENV_KEY_CODEBUDDY_COMPUTER_USE_ENABLED];
    return "true" === eA || "1" === eA;
  }
  async execute(eA: any, el: any): Promise<any> {
    try {
      validateNonCoordFields(eA);
      let el: any = await this.dispatch(eA);
      if ("screenshot" === el.action)
        return await this.formatScreenshot(el.screenshot_path);
      return this.formatResult(el);
    } catch (el: any) {
      let eA: any = el instanceof Error ? el.message : String(el);
      return { content: `Error: ${eA}`, error: eA };
    }
  }
  async formatScreenshot(eA: any): Promise<any> {
    try {
      let el: any = (await this.runtime.readFile(eA)).toString("base64"),
        ec: any = {
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${el}` },
        };
      return { title: "Screenshot", content: [ec], renderer: { type: "text" } };
    } catch (el: any) {
      return (
        this.runtime.logger?.warn?.(
          "[ComputerUse] Failed to read screenshot:",
          el,
        ),
        {
          content: `Screenshot saved to ${eA}`,
          error: "Failed to read screenshot",
        }
      );
    }
  }
  async dispatch(eA: any): Promise<any> {
    switch (eA.action) {
      case "screenshot":
        return this.executor.takeScreenshot();
      case "left_click":
      case "right_click":
      case "middle_click":
      case "double_click":
      case "triple_click":
      case "mouse_move": {
        let [el, ec] = requireCoordinate(eA, "coordinate");
        return this.executor.mouseAction(eA.action, el, ec);
      }
      case "left_click_drag": {
        let [el, ec] = requireCoordinate(eA, "start_coordinate"),
          [eu, ed] = requireCoordinate(eA, "coordinate");
        return this.executor.leftClickDrag(el, ec, eu, ed);
      }
      case "type":
        return this.executor.typeText(eA.text);
      case "key":
        return this.executor.pressKey(eA.text);
      case "hold_key":
        return this.executor.holdKey(eA.text, eA.duration);
      case "scroll": {
        let [el, ec] = requireCoordinate(eA, "coordinate");
        return this.executor.scrollAt(
          el,
          ec,
          eA.scroll_direction,
          "number" == typeof eA.scroll_amount ? eA.scroll_amount : 3,
        );
      }
      case "wait":
        return this.executor.wait(eA.duration);
      case "cursor_position":
        return this.executor.getCursorPosition();
    }
  }
  formatResult(eA: any): any {
    let el: any = { type: "computer_use_tool_result", ...eA },
      ec: any = this.describeAction(eA);
    return {
      title: ec,
      content: JSON.stringify(el),
      renderer: { type: "text", value: ec },
      rawResponse: el,
    };
  }
  describeAction(eA: any): any {
    switch (eA.action) {
      case "left_click":
      case "right_click":
      case "middle_click":
      case "double_click":
      case "triple_click":
      case "mouse_move":
        return `${eA.action} at (${eA.x}, ${eA.y})`;
      case "left_click_drag":
        return `Dragged from (${eA.start_x}, ${eA.start_y}) to (${eA.end_x}, ${eA.end_y})`;
      case "type":
        return `Typed ${eA.text_length} character(s)`;
      case "key":
        return `Pressed ${eA.text}`;
      case "hold_key":
        return `Held ${eA.text} for ${eA.duration}s`;
      case "scroll":
        return `Scrolled ${eA.scroll_direction} ${eA.scroll_amount} tick(s) at (${eA.x}, ${eA.y})`;
      case "wait":
        return `Waited ${eA.duration}s`;
      case "cursor_position":
        return `Cursor at (${eA.x}, ${eA.y})`;
      case "screenshot":
        return `Screenshot saved to ${eA.screenshot_path}`;
    }
  }

  register(tools: ToolManager): void {
    tools.register(this.name, {
      parameters: zodToJsonSchema(this.parameters as any),
      parseInput: false,
      isEnabled: (session) => this.isEnabled(session),
      shouldShowInToolSearch: () => this.shouldShowInToolSearch(),
      execute: (input, context) => this.execute(input, context),
    });
  }
}
