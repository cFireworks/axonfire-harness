import nunjucks from "nunjucks";
import type { ProductConfiguration } from "../config/product-config.js";
import type { PromptContextProvider } from "./prompt-context.js";

export type PromptVariables = Record<string, unknown>;

/** Mirrors WorkBuddy's DefaultPromptRenderer: autoescape=false + compiled template cache. */
export class DefaultPromptRenderer {
  private readonly environment = new nunjucks.Environment(null, {
    autoescape: false,
  });
  private readonly templateCache = new Map<string, nunjucks.Template>();

  renderTemplate(template: string, variables: PromptVariables = {}): string {
    let compiled = this.templateCache.get(template);
    if (!compiled) {
      compiled = nunjucks.compile(template, this.environment);
      this.templateCache.set(template, compiled);
    }
    try {
      return compiled.render(variables);
    } catch {
      return template;
    }
  }
}

/** Resolves product prompt names before delegating to DefaultPromptRenderer. */
export class ProductPromptRenderer {
  private contextProvider: PromptContextProvider | undefined;
  constructor(
    private readonly product: ProductConfiguration,
    private readonly renderer = new DefaultPromptRenderer(),
  ) {}

  attachContextProvider(provider: PromptContextProvider): void { this.contextProvider = provider; }
  async renderAsync(nameOrTemplate: string, variables: PromptVariables = {}): Promise<string> {
    if (!nameOrTemplate) return "";
    return this.render(nameOrTemplate, { ...await this.contextProvider?.get(), ...variables });
  }

  has(name: string): boolean {
    return this.product.promptsByName.has(name);
  }

  template(nameOrTemplate: string): string {
    return (
      this.product.promptsByName.get(nameOrTemplate)?.template ?? nameOrTemplate
    );
  }

  render(nameOrTemplate: string, variables: PromptVariables = {}): string {
    return this.renderer.renderTemplate(
      this.template(nameOrTemplate),
      variables,
    );
  }
}
