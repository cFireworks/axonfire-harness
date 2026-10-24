// @ts-nocheck
export const CONTEXT_VARIABLE_SERVICES_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const CONTEXT_VARIABLE_SERVICES_MODULES = [
  [66915, 15121534, 15122179],
  [1674, 15120733, 15121146],
  [73815, 15118157, 15120655],
  [83216, 15120656, 15120732],
  [2493, 15121147, 15121533],
  [39233, 15122614, 15123464],
  [8563, 15124462, 15124537],
  [17613, 15124308, 15124384],
  [41441, 15122306, 15122382],
  [25117, 15124692, 15124768],
  [56272, 15124538, 15124614],
  [38761, 15124615, 15124691],
  [11636, 15123894, 15124230],
  [74295, 15123817, 15123893],
  [60689, 15123663, 15123739],
  [81429, 15122383, 15122459],
  [62621, 15122460, 15122536],
  [38915, 15123465, 15123662],
  [29884, 15122537, 15122613],
  [66949, 15124385, 15124461],
  [41850, 15124769, 15124845],
  [16844, 15123740, 15123816],
  [91734, 15124231, 15124307],
] as const;
export function createNativeContextVariableServices(runtime: any) {
  if (!runtime?.di?.Reflect)
    throw Error("Explicit context-variable DI required");
  const Reflect = runtime.di.Reflect;
  // prettier-ignore
  const factories={66915(eA,el,ec){"use strict";var eu=this&&this.__createBinding||(Object.create?function(eA,el,ec,eu){void 0===eu&&(eu=ec);var ed=Object.getOwnPropertyDescriptor(el,ec);(!ed||("get"in ed?!el.__esModule:ed.writable||ed.configurable))&&(ed={enumerable:!0,get:function(){return el[ec]}}),Object.defineProperty(eA,eu,ed)}:function(eA,el,ec,eu){void 0===eu&&(eu=ec),eA[eu]=el[ec]}),ed=this&&this.__exportStar||function(eA,el){for(var ec in eA)"default"===ec||Object.prototype.hasOwnProperty.call(el,ec)||eu(el,eA,ec)};Object.defineProperty(el,"__esModule",{value:!0}),ed(ec(1674),el),ed(ec(73815),el),ed(ec(83216),el),ed(ec(2493),el),ed(ec(39233),el)},1674(eA,el){"use strict";Object.defineProperty(el,"__esModule",{value:!0}),el.ContextVariableManager=el.ContextVariableResolver=el.ContextVariable=el.ContextVariableDefinition=void 0,el.ContextVariableDefinition=Symbol("ContextVariableDefinition"),el.ContextVariable=Symbol("ContextVariable"),el.ContextVariableResolver=Symbol("ContextVariableResolver"),el.ContextVariableManager=Symbol("ContextVariableManager")},73815(eA,el,ec){"use strict";var eu=this&&this.__decorate||function(eA,el,ec,eu){var ed,ep=arguments.length,eg=ep<3?el:null===eu?eu=Object.getOwnPropertyDescriptor(el,ec):eu;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)eg=Reflect.decorate(eA,el,ec,eu);else for(var eh=eA.length-1;eh>=0;eh--)(ed=eA[eh])&&(eg=(ep<3?ed(eg):ep>3?ed(el,ec,eg):ed(el,ec))||eg);return ep>3&&eg&&Object.defineProperty(el,ec,eg),eg},ed=this&&this.__metadata||function(eA,el){if("object"==typeof Reflect&&"function"==typeof Reflect.metadata)return Reflect.metadata(eA,el)};Object.defineProperty(el,"__esModule",{value:!0}),el.ContextVariableManagerImpl=void 0;let ep=ec(80699),eg=ec(1674),eh=class{constructor(){this.contextVariableResolvers=[],this.collectionContextVariableResolvers=[]}init(){this.logger.info("ContextVariableManagerImpl")}registerContextVariableResolver(eA){this.collectionContextVariableResolvers.push(eA)}async getContextVariable(eA,el){return(await this.resolveContextVariables([eA],el))[0]}async getContextVariables(eA,el){let ec=[...eA||[]];return this.resolveContextVariables(ec,el)}async getContextVariablesMap(eA,el){return{...(await this.getContextVariables(eA,el)).reduce((eA,el)=>(eA[el.name]=el.value,eA),{})}}async resolveContextVariables(eA,el){let ec=[];for(let eu of eA){let eA=await this.getResolver(eu);if(!eA)continue;let ed=Date.now();try{let ep=await eA.resolve(eu,el);this.logger.debug(`Resolved context variable: ${eu.name} (${Date.now()-ed}ms)`),ep&&ec.push(ep)}catch(eA){this.logger.error(`Failed to resolve ${eu.name} context variable: ${eA}`)}}return ec}async getResolver(eA,el){return(await this.prioritizeResolvers(eA,el))[0]}getResolvers(eA){return[...this.contextVariableResolvers,...this.collectionContextVariableResolvers].filter(el=>el.name===eA)}async prioritizeResolvers(eA,el){let ec=this.getResolvers(eA.name);return ec?(await ep.Prioritizeable.prioritizeAll(ec,async ec=>{try{return await ec.priority(eA,el)}catch(eA){return 0}})).filter(eA=>eA.priority>0).map(eA=>eA.value):[]}};el.ContextVariableManagerImpl=eh,eu([(0,ep.Autowired)(eg.ContextVariableResolver),ed("design:type",Array)],eh.prototype,"contextVariableResolvers",void 0),eu([(0,ep.Autowired)(ep.Logger),ed("design:type",Object)],eh.prototype,"logger",void 0),eu([(0,ep.PostConstruct)(),ed("design:type",Function),ed("design:paramtypes",[]),ed("design:returntype",void 0)],eh.prototype,"init",null),el.ContextVariableManagerImpl=eu([(0,ep.Component)(eg.ContextVariableManager)],eh)},83216(eA,el){"use strict";Object.defineProperty(el,"__esModule",{value:!0})},2493(eA,el){"use strict";Object.defineProperty(el,"__esModule",{value:!0}),el.ContextVariableUtils=void 0;let ContextVariableUtils=class ContextVariableUtils{static toObject(eA){let el={};for(let ec of eA)el[ec.name]=ec.value;return el}static toArray(eA){let el=[];for(let[ec,eu]of Object.entries(eA))el.push({name:ec,value:eu});return el}};el.ContextVariableUtils=ContextVariableUtils},39233(eA,el,ec){"use strict";var eu=this&&this.__createBinding||(Object.create?function(eA,el,ec,eu){void 0===eu&&(eu=ec);var ed=Object.getOwnPropertyDescriptor(el,ec);(!ed||("get"in ed?!el.__esModule:ed.writable||ed.configurable))&&(ed={enumerable:!0,get:function(){return el[ec]}}),Object.defineProperty(eA,eu,ed)}:function(eA,el,ec,eu){void 0===eu&&(eu=ec),eA[eu]=el[ec]}),ed=this&&this.__exportStar||function(eA,el){for(var ec in eA)"default"===ec||Object.prototype.hasOwnProperty.call(el,ec)||eu(el,eA,ec)};Object.defineProperty(el,"__esModule",{value:!0}),ed(ec(8563),el),ed(ec(17613),el),ed(ec(41441),el),ed(ec(25117),el),ed(ec(56272),el),ed(ec(38761),el),ed(ec(11636),el),ed(ec(74295),el),ed(ec(60689),el),ed(ec(81429),el),ed(ec(62621),el),ed(ec(38915),el),ed(ec(29884),el),ed(ec(66949),el),ed(ec(41850),el),ed(ec(16844),el),ed(ec(91734),el)},8563(eA,el){"use strict";Object.defineProperty(el,"__esModule",{value:!0})},17613(eA,el){"use strict";Object.defineProperty(el,"__esModule",{value:!0})},41441(eA,el){"use strict";Object.defineProperty(el,"__esModule",{value:!0})},25117(eA,el){"use strict";Object.defineProperty(el,"__esModule",{value:!0})},56272(eA,el){"use strict";Object.defineProperty(el,"__esModule",{value:!0})},38761(eA,el){"use strict";Object.defineProperty(el,"__esModule",{value:!0})},11636(eA,el){"use strict";var ec;Object.defineProperty(el,"__esModule",{value:!0}),el.RelatedFileRelatedType=void 0,function(eA){eA.RECENTLY_OPENED="RECENTLY_OPENED",eA.PATH_ASSOCIATED="PATH_ASSOCIATED",eA.AST_DEPENDENCE="AST_DEPENDENCE",eA.CURRENT_TEST="CURRENT_TEST",eA.OTHER_TEST="OTHER_TEST"}(ec||(el.RelatedFileRelatedType=ec={}))},74295(eA,el){"use strict";Object.defineProperty(el,"__esModule",{value:!0})},60689(eA,el){"use strict";Object.defineProperty(el,"__esModule",{value:!0})},81429(eA,el){"use strict";Object.defineProperty(el,"__esModule",{value:!0})},62621(eA,el){"use strict";Object.defineProperty(el,"__esModule",{value:!0})},38915(eA,el){"use strict";var ec;Object.defineProperty(el,"__esModule",{value:!0}),el.KnowledgeBaseType=void 0,function(eA){eA.Custom="custom",eA.Common="common"}(ec||(el.KnowledgeBaseType=ec={}))},29884(eA,el){"use strict";Object.defineProperty(el,"__esModule",{value:!0})},66949(eA,el){"use strict";Object.defineProperty(el,"__esModule",{value:!0})},41850(eA,el){"use strict";Object.defineProperty(el,"__esModule",{value:!0})},16844(eA,el){"use strict";Object.defineProperty(el,"__esModule",{value:!0})},91734(eA,el){"use strict";Object.defineProperty(el,"__esModule",{value:!0})}};
  const cache = Object.create(null);
  function ec(id: number) {
    if (cache[id]) return cache[id].exports;
    if (id === 80699) return runtime.di;
    if (!factories[id]) throw Error("Unknown context-variable module: " + id);
    const module = { id, loaded: false, exports: {} };
    cache[id] = module;
    factories[id].call(module.exports, module, module.exports, ec);
    module.loaded = true;
    return module.exports;
  }
  return { load: () => ec(66915), getModule: ec };
}
