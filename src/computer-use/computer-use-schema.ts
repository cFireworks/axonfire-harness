import { z } from "zod3";
export const computerUseCoordinate = z
  .array(z.number())
  .length(2)
  .describe("[x, y] in logical pixels, top-left origin.");
export const computerUseParameters = z.object({
  action: z
    .enum([
      "screenshot",
      "left_click",
      "right_click",
      "middle_click",
      "double_click",
      "triple_click",
      "mouse_move",
      "left_click_drag",
      "type",
      "key",
      "hold_key",
      "scroll",
      "wait",
      "cursor_position",
    ])
    .describe("Which desktop action to perform."),
  coordinate: computerUseCoordinate.optional(),
  start_coordinate: computerUseCoordinate.optional(),
  text: z.string().optional(),
  scroll_direction: z.enum(["up", "down", "left", "right"]).optional(),
  scroll_amount: z.number().optional(),
  duration: z.number().optional(),
});
export function requireCoordinate(eA: any, el: any): any {
  let ec: any = eA[el];
  if (
    !Array.isArray(ec) ||
    2 !== ec.length ||
    "number" != typeof ec[0] ||
    "number" != typeof ec[1]
  )
    throw Error(`action=${eA.action} requires "${el}": [x, y].`);
  return [ec[0], ec[1]];
}
export function validateNonCoordFields(eA: any): any {
  switch (eA.action) {
    case "type":
      if ("string" != typeof eA.text)
        throw Error('action=type requires a "text" string.');
      return;
    case "key":
      if ("string" != typeof eA.text || 0 === eA.text.length)
        throw Error('action=key requires a non-empty "text" string.');
      return;
    case "hold_key":
      if ("string" != typeof eA.text || 0 === eA.text.length)
        throw Error('action=hold_key requires a non-empty "text" string.');
      if ("number" != typeof eA.duration)
        throw Error('action=hold_key requires numeric "duration" (seconds).');
      return;
    case "wait":
      if ("number" != typeof eA.duration)
        throw Error('action=wait requires numeric "duration" (seconds).');
      return;
    case "scroll":
      if (!eA.scroll_direction)
        throw Error(
          'action=scroll requires "scroll_direction" (up/down/left/right).',
        );
      return;
    default:
      return;
  }
}
