import vm from "node:vm";
import type { ParsedWorkflow, CompiledWorkflow, WorkflowViolation } from "./workflow-types.js";
import {
  WorkflowCompileError,
  WorkflowDeterminismError,
} from "./workflow-errors.js";
const FORBIDDEN_CALLS = [
  { pattern: "Date.now", regex: /\bDate\s*\.\s*now\b/g },
  { pattern: "Math.random", regex: /\bMath\s*\.\s*random\b/g },
  { pattern: "new Date()", regex: /\bnew\s+Date\s*\(/g },
];
/** Native 8852562..8856864. Lexical heuristics (including template/regex blind spots) are intentionally preserved. */
export class WorkflowCompiler {
  compile(eA: ParsedWorkflow): CompiledWorkflow {
    let el = this.scanDeterminism(eA.sourceText, eA.metaLoc);
    if (el.length > 0)
      throw new WorkflowDeterminismError(
        el.map((eA) => ({
          pattern: eA.pattern,
          line: eA.line,
          column: eA.column,
        })),
      );
    let ec = this.wrapSource(eA.sourceText);
    return { script: this.compileScript(ec), violations: el };
  }
  scanDeterminism(eA: string, el?: { start: number; end: number }): WorkflowViolation[] {
    let ec: WorkflowViolation[] = [];
    for (let eu of FORBIDDEN_CALLS) {
      let ed = new RegExp(eu.regex.source, eu.regex.flags),
        ep = ed.exec(eA);
      for (; null !== ep; ) {
        let eg = ep.index;
        if (
          (el && eg >= el.start && eg < el.end) ||
          this.isInsideStringOrComment(eA, eg)
        ) {
          ep = ed.exec(eA);
          continue;
        }
        let { line: eh, column: ef } = this.offsetToLineCol(eA, eg);
        (ec.push({ pattern: eu.pattern, offset: eg, line: eh, column: ef }),
          (ep = ed.exec(eA)));
      }
    }
    return ec;
  }
  isInsideStringOrComment(eA: any, el: any): any {
    let ec = 0,
      eu = !1,
      ed = !1,
      ep = !1,
      eg = !1,
      eh = !1;
    for (; ec < el; ) {
      let el = eA[ec],
        ef = eA[ec + 1];
      if (eg) {
        ("\n" === el && (eg = !1), ec++);
        continue;
      }
      if (eh) {
        if ("*" === el && "/" === ef) {
          ((eh = !1), (ec += 2));
          continue;
        }
        ec++;
        continue;
      }
      if (eu) {
        if ("\\" === el && void 0 !== ef) {
          ec += 2;
          continue;
        }
        ("'" === el && (eu = !1), ec++);
        continue;
      }
      if (ed) {
        if ("\\" === el && void 0 !== ef) {
          ec += 2;
          continue;
        }
        ('"' === el && (ed = !1), ec++);
        continue;
      }
      if (ep) {
        if ("\\" === el && void 0 !== ef) {
          ec += 2;
          continue;
        }
        ("`" === el && (ep = !1), ec++);
        continue;
      }
      if ("/" === el && "/" === ef) {
        ((eg = !0), (ec += 2));
        continue;
      }
      if ("/" === el && "*" === ef) {
        ((eh = !0), (ec += 2));
        continue;
      }
      if ("'" === el) {
        ((eu = !0), ec++);
        continue;
      }
      if ('"' === el) {
        ((ed = !0), ec++);
        continue;
      }
      if ("`" === el) {
        ((ep = !0), ec++);
        continue;
      }
      ec++;
    }
    return eu || ed || ep || eg || eh;
  }
  offsetToLineCol(eA: any, el: any): any {
    let ec = 1,
      eu = 1;
    for (let ed = 0; ed < el && ed < eA.length; ed++)
      "\n" === eA[ed] ? (ec++, (eu = 1)) : eu++;
    return { line: ec, column: eu };
  }
  wrapSource(eA: any): any {
    let el = eA.trim();
    if ("" === el) return "(async () => undefined)()";
    if (this.isSingleExpression(el)) {
      let eA = el.replace(/;\s*$/, "");
      return `(async () => (${eA}))()`;
    }
    return `(async () => {
${eA}
})()`;
  }
  isSingleExpression(eA: any): any {
    let el = this.stripLeadingWhitespaceAndComments(eA);
    if (
      /^(const|let|var|function|class|async\s+function|return|if|for|while|do|switch|try|throw|import|export)\b/.test(
        el,
      )
    )
      return !1;
    let ec = 0,
      eu = !1,
      ed = !1,
      ep = !1,
      eg = !1,
      eh = !1,
      ef = 0,
      em = 0,
      eE = 0;
    for (; ec < eA.length; ) {
      let el = eA[ec],
        eC = eA[ec + 1];
      if (eg) {
        ("\n" === el && (eg = !1), ec++);
        continue;
      }
      if (eh) {
        if ("*" === el && "/" === eC) {
          ((eh = !1), (ec += 2));
          continue;
        }
        ec++;
        continue;
      }
      if (eu) {
        if ("\\" === el) {
          ec += 2;
          continue;
        }
        ("'" === el && (eu = !1), ec++);
        continue;
      }
      if (ed) {
        if ("\\" === el) {
          ec += 2;
          continue;
        }
        ('"' === el && (ed = !1), ec++);
        continue;
      }
      if (ep) {
        if ("\\" === el) {
          ec += 2;
          continue;
        }
        ("`" === el && (ep = !1), ec++);
        continue;
      }
      if ("/" === el && "/" === eC) {
        ((eg = !0), (ec += 2));
        continue;
      }
      if ("/" === el && "*" === eC) {
        ((eh = !0), (ec += 2));
        continue;
      }
      if ("'" === el) {
        ((eu = !0), ec++);
        continue;
      }
      if ('"' === el) {
        ((ed = !0), ec++);
        continue;
      }
      if ("`" === el) {
        ((ep = !0), ec++);
        continue;
      }
      if ("{" === el) {
        (ef++, ec++);
        continue;
      }
      if ("}" === el) {
        (ef--, ec++);
        continue;
      }
      if ("(" === el) {
        (em++, ec++);
        continue;
      }
      if (")" === el) {
        (em--, ec++);
        continue;
      }
      if ("[" === el) {
        (eE++, ec++);
        continue;
      }
      if ("]" === el) {
        (eE--, ec++);
        continue;
      }
      if (";" === el && 0 === ef && 0 === em && 0 === eE) {
        if (0 === eA.slice(ec + 1).trim().length) return !0;
        return !1;
      }
      ec++;
    }
    return !0;
  }
  stripLeadingWhitespaceAndComments(eA: any): any {
    let el = 0;
    for (; el < eA.length; ) {
      let ec = eA[el],
        eu = eA[el + 1];
      if (" " === ec || "	" === ec || "\r" === ec || "\n" === ec) {
        el++;
        continue;
      }
      if ("/" === ec && "/" === eu) {
        for (; el < eA.length && "\n" !== eA[el]; ) el++;
        continue;
      }
      if ("/" === ec && "*" === eu) {
        for (
          el += 2;
          el < eA.length && ("*" !== eA[el] || "/" !== eA[el + 1]);

        )
          el++;
        el < eA.length && (el += 2);
        continue;
      }
      break;
    }
    return eA.slice(el);
  }
  hasTopLevelReturn(eA: any): any {
    let el = 0,
      ec = !1,
      eu = !1,
      ed = !1,
      ep = !1,
      eg = !1,
      eh = 0,
      ef = 0,
      em = 0;
    for (; el < eA.length; ) {
      let eE = eA[el],
        eC = eA[el + 1];
      if (ep) {
        ("\n" === eE && (ep = !1), el++);
        continue;
      }
      if (eg) {
        if ("*" === eE && "/" === eC) {
          ((eg = !1), (el += 2));
          continue;
        }
        el++;
        continue;
      }
      if (ec) {
        if ("\\" === eE) {
          el += 2;
          continue;
        }
        ("'" === eE && (ec = !1), el++);
        continue;
      }
      if (eu) {
        if ("\\" === eE) {
          el += 2;
          continue;
        }
        ('"' === eE && (eu = !1), el++);
        continue;
      }
      if (ed) {
        if ("\\" === eE) {
          el += 2;
          continue;
        }
        ("`" === eE && (ed = !1), el++);
        continue;
      }
      if ("/" === eE && "/" === eC) {
        ((ep = !0), (el += 2));
        continue;
      }
      if ("/" === eE && "*" === eC) {
        ((eg = !0), (el += 2));
        continue;
      }
      if ("'" === eE) {
        ((ec = !0), el++);
        continue;
      }
      if ('"' === eE) {
        ((eu = !0), el++);
        continue;
      }
      if ("`" === eE) {
        ((ed = !0), el++);
        continue;
      }
      if ("{" === eE) {
        (eh++, el++);
        continue;
      }
      if ("}" === eE) {
        (eh--, el++);
        continue;
      }
      if ("(" === eE) {
        (ef++, el++);
        continue;
      }
      if (")" === eE) {
        (ef--, el++);
        continue;
      }
      if ("[" === eE) {
        (em++, el++);
        continue;
      }
      if ("]" === eE) {
        (em--, el++);
        continue;
      }
      if (
        0 === eh &&
        0 === ef &&
        0 === em &&
        "r" === eE &&
        "return" === eA.slice(el, el + 6) &&
        /[\s;{(]/.test(eA[el + 6] ?? " ") &&
        (0 === el || /[\s;{}]/.test(eA[el - 1] ?? " "))
      )
        return !0;
      el++;
    }
    return !1;
  }
  compileScript(eA: any): any {
    try {
      return new vm.Script(eA, {
        filename: "workflow.js",
        lineOffset: 0,
        columnOffset: 0,
      });
    } catch (eA: any) {
      throw new WorkflowCompileError(
        `Workflow script failed to compile: ${eA.message}`,
        { cause: eA },
      );
    }
  }
}
