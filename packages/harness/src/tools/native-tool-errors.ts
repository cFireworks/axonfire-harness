// Original ToolError, PermissionDeniedError and complete ToolErrorCode mapping.
let eu: any;
(function (eA: any): any {
  ((eA.Success = "0"),
    (eA.ReadFileError = "1000"),
    (eA.ReadFileNotFoundError = "1001"),
    (eA.ReadFilePermissionError = "1002"),
    (eA.ReadFilePathError = "1003"),
    (eA.ReadFileEncodingError = "1004"),
    (eA.ReadFileTokenLimitExceededError = "1005"),
    (eA.ReadFileTooLargeError = "1006"),
    (eA.ReadFileBinaryError = "1007"),
    (eA.ReadFileOffsetBeyondEOFError = "1008"),
    (eA.ReadFileInvalidParamsError = "1009"),
    (eA.ReadFileModelNoImageSupportError = "1010"),
    (eA.ReadFileImageTooLargeError = "1011"),
    (eA.ReadFileInvalidNotebookError = "1012"),
    (eA.ReadFileStreamReadError = "1013"),
    (eA.WriteFileError = "2000"),
    (eA.WriteFilePermissionError = "2001"),
    (eA.WriteFilePathError = "2002"),
    (eA.WriteFileLockError = "2003"),
    (eA.WriteFileEncodingError = "2004"),
    (eA.WriteFileContentError = "2005"),
    (eA.WriteFileArtifactPathError = "2006"),
    (eA.WriteFileDiskFullError = "2007"),
    (eA.WriteFileSandboxError = "2008"),
    (eA.ReplaceInFileError = "4000"),
    (eA.ReplaceExecuteError = "4001"),
    (eA.ReplaceTimeoutError = "4002"),
    (eA.ReplaceNoMatchesError = "4003"),
    (eA.ReplaceNoContentChangedError = "4004"),
    (eA.ReplaceUnKnownError = "4005"),
    (eA.ReplaceCommitFileError = "4006"),
    (eA.ReplaceVscodeError = "4007"),
    (eA.ReplaceMultipleMatchesError = "4008"),
    (eA.ReplaceArtifactPathError = "4009"),
    (eA.ReplaceFileNotReadError = "4010"),
    (eA.ReplaceFileModifiedSinceReadError = "4011"),
    (eA.ReplaceFilePathError = "4012"),
    (eA.ReplacePermissionError = "4013"),
    (eA.ReplaceSandboxError = "4014"),
    (eA.ReplaceInternalError = "4015"),
    (eA.ReplaceDiskFullError = "4016"),
    (eA.SearchContentError = "7100"),
    (eA.SearchContentPathError = "7101"),
    (eA.SearchContentPatternError = "7102"),
    (eA.SearchContentParseError = "7103"),
    (eA.SearchContentPermissionError = "7104"),
    (eA.ExecuteCommandError = "8000"),
    (eA.ExecuteCommandTimeoutError = "8001"),
    (eA.ExecuteCommandExitCodeError = "8002"),
    (eA.ExecuteCommandMissingError = "8003"),
    (eA.ExecuteCommandEnvError = "8004"),
    (eA.ExecuteCommandKilledError = "8005"),
    (eA.ExecuteCommandSandboxDeniedError = "8006"),
    (eA.ExecuteCommandSandboxInfrastructureError = "8007"),
    (eA.ExecuteCommandSecurityBlockedError = "8008"),
    (eA.ExecuteCommandBackgroundUnsupportedError = "8009"),
    (eA.ExecuteCommandEscalationDeniedError = "8010"),
    (eA.ExecuteCommandSystemToolDisabledError = "8011"),
    (eA.ExecuteCommandCancelledError = "8012"),
    (eA.ExecuteCommandSignalTerminatedError = "8013"),
    (eA.ExecuteCommandRootResolveError = "8014"),
    (eA.AskFollowupQuestionError = "19200"),
    (eA.AskFollowupMissingToolCallIdError = "19201"),
    (eA.AskFollowupNoAnswersError = "19202"),
    (eA.AskFollowupInvalidParamsError = "19203"),
    (eA.AskFollowupUserDeclinedError = "19204"),
    (eA.PresentFilesError = "19910"),
    (eA.PresentFilesInvalidParamsError = "19911"),
    (eA.PresentFilesPermissionDeniedError = "19912"),
    (eA.PresentFilesTimeoutError = "19913"),
    (eA.AgentExecutionError = "19920"),
    (eA.AgentSessionRequiredError = "19921"),
    (eA.AgentInvalidParamsError = "19922"),
    (eA.AgentMaxTurnsError = "19923"),
    (eA.InvalidParameterError = "90000"),
    (eA.ExecuteError = "90001"),
    (eA.ExecuteTimeoutError = "90002"),
    (eA.ToolTimeoutError = "90003"),
    (eA.ToolCancelledError = "90004"),
    (eA.UnknownToolError = "99999"));
})(eu || (eu = {}));
const ed: any = (() => {
  let eA: any = {};
  for (let [el, ec] of Object.entries(eu))
    "string" == typeof ec && (eA[ec] = el);
  return eA;
})();
export const ToolErrorCode = eu;
export function getToolErrorName(eA: any): any {
  return ed[eA] ?? "UnknownToolError";
}
export class ToolError extends Error {
  isToolError(): any {
    return !0;
  }
}
export class PermissionDeniedError extends ToolError {
  declare toolName: any;
  declare rule: any;
  constructor(eA: any, el: any, ec?: any) {
    (super(el),
      (this.toolName = eA),
      (this.rule = ec),
      (this.name = "PermissionDeniedError"));
  }
}
