import { ToolNames } from "../tools/tool-names.js";
import { ToolArgType, ToolPermissionType } from "./native-permission-policy.js";
const nC = { ToolNames, ToolArgType },
  ed = { ToolArgType, ToolPermissionType };
class BasePermissionMetadata {
  resolveNeedPermissionArgs(eA: any, el: any, ec: any): any {
    return [
      {
        type: ed.ToolArgType.Unknown,
        value: "string" == typeof el ? el : JSON.stringify(el.value),
      },
    ];
  }
  resolveToolType(eA: any): any {
    return eA.includes(ed.ToolPermissionType.Read)
      ? ed.ToolPermissionType.Read
      : eA.includes(ed.ToolPermissionType.Bash)
        ? ed.ToolPermissionType.Bash
        : eA.includes(ed.ToolPermissionType.Edit)
          ? ed.ToolPermissionType.Edit
          : ed.ToolPermissionType.Unknown;
  }
}
const metadata: any[] = [
  Object.assign(
    new (class extends BasePermissionMetadata {
      resolveNeedPermissionArgs(eA: any, el: any, ec: any): any {
        return [{ type: nC.ToolArgType.FilePath, value: el.file_path }];
      }
    })(),
    { name: nC.ToolNames.READ, aliases: ["read"] },
  ),
  Object.assign(
    new (class extends BasePermissionMetadata {
      resolveNeedPermissionArgs(eA: any, el: any, ec: any): any {
        return [{ type: nC.ToolArgType.FilePath, value: el.file_path }];
      }
    })(),
    { name: nC.ToolNames.WRITE, aliases: ["edit", "write"] },
  ),
  Object.assign(
    new (class extends BasePermissionMetadata {
      resolveNeedPermissionArgs(eA: any, el: any, ec: any): any {
        return [{ type: nC.ToolArgType.FilePath, value: el.file_path }];
      }
    })(),
    { name: nC.ToolNames.EDIT, aliases: ["edit"] },
  ),
  Object.assign(
    new (class extends BasePermissionMetadata {
      resolveNeedPermissionArgs(eA: any, el: any, ec: any): any {
        return [{ type: nC.ToolArgType.Command, value: el.command }];
      }
    })(),
    { name: nC.ToolNames.BASH, aliases: ["bash"] },
  ),
  Object.assign(
    new (class extends BasePermissionMetadata {
      resolveNeedPermissionArgs(eA: any, el: any, ec: any): any {
        return [{ type: nC.ToolArgType.FilePath, value: el.path || "" }];
      }
    })(),
    { name: nC.ToolNames.GLOB, aliases: ["read", "glob"] },
  ),
  Object.assign(
    new (class extends BasePermissionMetadata {
      resolveNeedPermissionArgs(eA: any, el: any, ec: any): any {
        return [{ type: nC.ToolArgType.FilePath, value: el.path || "" }];
      }
    })(),
    { name: nC.ToolNames.GREP, aliases: ["read", "grep"] },
  ),
  Object.assign(
    new (class extends BasePermissionMetadata {
      resolveNeedPermissionArgs(eA: any, el: any, ec: any): any {
        return [{ type: nC.ToolArgType.URL, value: el.url }];
      }
    })(),
    { name: nC.ToolNames.WEB_FETCH, aliases: [] },
  ),
  Object.assign(
    new (class extends BasePermissionMetadata {
      resolveNeedPermissionArgs(eA: any, el: any, ec: any): any {
        return [{ type: nC.ToolArgType.FilePath, value: el.file_path }];
      }
    })(),
    {
      name: nC.ToolNames.MULTI_EDIT,
      aliases: ["edit", "write", "edit-file", "multi-edit-file"],
    },
  ),
  Object.assign(
    new (class extends BasePermissionMetadata {
      resolveNeedPermissionArgs(eA: any, el: any, ec: any): any {
        return [{ type: nC.ToolArgType.FilePath, value: el.notebook_path }];
      }
    })(),
    {
      name: nC.ToolNames.NOTEBOOK_READ,
      aliases: ["read", "notebook-read", "read-notebook", "ipynb-read"],
    },
  ),
  Object.assign(
    new (class extends BasePermissionMetadata {
      resolveNeedPermissionArgs(eA: any, el: any, ec: any): any {
        return [{ type: nC.ToolArgType.FilePath, value: el.notebook_path }];
      }
    })(),
    {
      name: "NotebookEdit",
      aliases: ["edit", "notebook-edit", "edit-notebook", "ipynb-edit"],
    },
  ),
  Object.assign(
    new (class extends BasePermissionMetadata {
      resolveNeedPermissionArgs(eA: any, el: any, ec: any): any {
        return [{ type: nC.ToolArgType.SlashCommand, value: el.command }];
      }
    })(),
    { name: nC.ToolNames.SLASH_COMMAND, aliases: ["slash-command"] },
  ),
  Object.assign(
    new (class extends BasePermissionMetadata {
      resolveNeedPermissionArgs(eA: any, el: any, ec: any): any {
        let eu: any = el.skill || el.command || "";
        return eu.trim().startsWith("/")
          ? [{ type: nC.ToolArgType.SlashCommand, value: eu }]
          : [{ type: nC.ToolArgType.Skill, value: eu }];
      }
    })(),
    { name: nC.ToolNames.SKILL, aliases: ["skill"] },
  ),
  Object.assign(
    new (class extends BasePermissionMetadata {
      resolveNeedPermissionArgs(eA: any, el: any, ec: any): any {
        return [{ type: nC.ToolArgType.Command, value: el.command }];
      }
    })(),
    { name: nC.ToolNames.POWERSHELL, aliases: ["pwsh", "ps"] },
  ),
];
export function nativeToolPermissionMetadata(name: string) {
  const original = metadata.find((x) => x.name === name);
  // Native tool constructors own their alias arrays; descriptors must not share mutations across hosts.
  return original
    ? Object.assign(Object.create(Object.getPrototypeOf(original)), original, {
        aliases: [...original.aliases],
      })
    : Object.assign(new BasePermissionMetadata(), { name, aliases: [] });
}
