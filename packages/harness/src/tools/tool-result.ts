/** Native module57651. Deliberately retains the null TypeError in is(). */
export const ToolResult = {
  is(value: any): boolean {
    return typeof value === "object" && "content" in value;
  },
  from(value: any): { content: any } {
    return { content: value };
  },
};
