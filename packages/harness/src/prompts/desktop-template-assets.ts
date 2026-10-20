import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { originalConfigPath } from "../config/product-config.js";
export const DESKTOP_TEMPLATE_ASSETS = [
  {
    file: "ask-mode-reminder.tpl",
    sha256: "3c7b5ff920e924b4570d8917cf01547cad3242573693f323032df1e158c15dcc",
    bytes: 582,
  },
  {
    file: "craft-mode-reminder.tpl",
    sha256: "6f8aceac4f024b710c7b00aabd190eb8e27e05933d534a87c17ee06bc911f83a",
    bytes: 254,
  },
  {
    file: "style/style-creative.md",
    sha256: "f90bdd7b3b91d2ae2bd39aa3e72b20b5cb18c4301b3bd53ef596d14b786c4a1f",
    bytes: 2017,
  },
  {
    file: "style/style-efficient.md",
    sha256: "42c999b846d2ecbcc29f63f0c2426998afea3f59e2ee2fbef28a71ddd471ed9e",
    bytes: 1907,
  },
  {
    file: "style/style-friendly.md",
    sha256: "bddb8c8057874482a17f9309a72f5132eead39e324996f27b30cf260f802b7eb",
    bytes: 1884,
  },
  {
    file: "style/style-professional.md",
    sha256: "0fbc8c94dc0173a7c692a11ee13a2f21bb688e4aa19b37cf7014e3daa8f14e19",
    bytes: 2120,
  },
  {
    file: "style/style-sarcastic.md",
    sha256: "4b7555a0a9a6e49258d237b62c34c1bdaed58ac742ed013c06796282372c60a5",
    bytes: 2579,
  },
  {
    file: "style/style-socratic.md",
    sha256: "6e4e1d91fa78e983a8a688bcec70cd3f38229bf96fe861c8f6223e075e163a11",
    bytes: 2303,
  },
  {
    file: "style/style-straightforward.md",
    sha256: "803c6bb2e8aaced156b92f1ae01aeeae5e1d458e06de9d066cc823c531ddcfb4",
    bytes: 1839,
  },
  {
    file: "system-reminder.tpl",
    sha256: "ffcb8b7b1592b1909b99a189703e6ca4ab5a60e41abd2a60b6453e14565da2a6",
    bytes: 37,
  },
  {
    file: "user-context-expert-identity.tpl",
    sha256: "5e9770abee2d4c87f08368d454a7dd3e834e0f3c165ddeb9b35748aa01b74394",
    bytes: 919,
  },
  {
    file: "user-context-identity.tpl",
    sha256: "a1fb4071914a188d6cbc87ec8d86481c3ad6cb0e3052b4b3abaf967f7338960f",
    bytes: 1984,
  },
  {
    file: "workbuddy-ask-code-prompt.tpl",
    sha256: "16526e9cd58c5b241adb971128e6283da2d2176c5276ddac80e5894e02216cb3",
    bytes: 13534,
  },
  {
    file: "workbuddy-ask-coding-prompt.tpl",
    sha256: "c25de7ac6039884f330bc1b24fb5ddc72eef4d29c4be6bef0a197313aec0ad2d",
    bytes: 10592,
  },
  {
    file: "workbuddy-ask-prompt.tpl",
    sha256: "893e47645737c7adb7b6c9ea373bd110f55259e2f4a827cf9ad4f6d33ecaaefc",
    bytes: 12344,
  },
  {
    file: "workbuddy-craft-code-prompt.tpl",
    sha256: "0552dc282d196b739a45f73078c24b4e707c37157c7b61a1d631b5b13a13107e",
    bytes: 37222,
  },
  {
    file: "workbuddy-craft-coding-prompt.tpl",
    sha256: "d0bb46750729033f693a34e6d9ee634eecd61d5d3b61ba729c90f3ab500ab2c4",
    bytes: 36772,
  },
  {
    file: "workbuddy-craft-design-prompt.tpl",
    sha256: "0fb1cb634de1f4658e65930799cafae6a97e6a8236466095f1289540aeba1ae5",
    bytes: 29451,
  },
  {
    file: "workbuddy-expert-code-prompt.tpl",
    sha256: "0acbbe6fff4652aed79fabad2d8dd4d6b2a38ef6a3ba0097de935c1dcb266e3c",
    bytes: 37058,
  },
  {
    file: "workbuddy-expert-coding-prompt.tpl",
    sha256: "8d4430498abad3af5d703c4a738ae0d12ee5c50479a9f50daa1cb4cb8cae6081",
    bytes: 35610,
  },
  {
    file: "workbuddy-expert-prompt.tpl",
    sha256: "0acbbe6fff4652aed79fabad2d8dd4d6b2a38ef6a3ba0097de935c1dcb266e3c",
    bytes: 37058,
  },
  {
    file: "workbuddy-prompt.tpl",
    sha256: "c788854d388e86db0ab3cf7a925d2d07ccda44c052fa886995028c6bf2f1a4b2",
    bytes: 36292,
  },
] as const;
export function desktopTemplateDirectory() {
  return resolve(
    dirname(originalConfigPath("product.json")),
    "../desktop-prompts",
  );
}
export function verifyDesktopTemplateAssets(
  directory = desktopTemplateDirectory(),
) {
  let bytes = 0;
  for (const asset of DESKTOP_TEMPLATE_ASSETS) {
    const data = readFileSync(resolve(directory, asset.file));
    if (createHash("sha256").update(data).digest("hex") !== asset.sha256)
      throw Error("Desktop prompt asset hash: " + asset.file);
    bytes += data.length;
  }
  return { files: DESKTOP_TEMPLATE_ASSETS.length, bytes };
}
