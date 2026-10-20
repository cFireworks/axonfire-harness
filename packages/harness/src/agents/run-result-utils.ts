/** Native 13255534: finalOutput is unsafe until a streamed run has a final step. */
export class RunResultUtils {
  static isStream(result: any): boolean { return "currentTurn" in result; }
  static isFinalOutput(result: any): boolean { return !this.isStream(result) || result.state?._currentStep?.type === "next_step_final_output"; }
  static extractFinalOutput(result: any): unknown { if (this.isFinalOutput(result)) return result.finalOutput; }
}
