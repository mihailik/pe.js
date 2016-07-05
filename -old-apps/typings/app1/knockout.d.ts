// Type definitions for Knockout 2.3
// Project: http://knockoutjs.com
// Definitions by: Boris Yankov <https://github.com/borisyankov/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped


declare module ko {

  export module utils {

    //////////////////////////////////
    // utils.domManipulation.js
    //////////////////////////////////

    export function simpleHtmlParse(html: string): any[];

    export function jQueryHtmlParse(html: string): any[];

    export function parseHtmlFragment(html: string): any[];

    export function setHtml(node: Element, html: string): void;

    export function setHtml(node: Element, html: () => string): void;

    //////////////////////////////////
    // utils.domData.js
    //////////////////////////////////

    export module domData {
      export function get(node: Element, key: string): any;

      export function set(node: Element, key: string, value: any): void;

      export function getAll(node: Element, createIfNotFound: boolean): any;

      export function clear(node: Element): boolean;
    }

    //////////////////////////////////
    // utils.domNodeDisposal.js
    //////////////////////////////////

    export module domNodeDisposal {
      export function addDisposeCallback(node: Element, callback: Function): void;

      export function removeDisposeCallback(node: Element, callback: Function): void;

      export function cleanNode(node: Element): Element;

      export function removeNode(node: Element): void;
    }

    //////////////////////////////////
    // utils.js
    //////////////////////////////////

    export var fieldsIncludedWithJsonPost: any[];

    export function compareArrays<T>(a: T[], b: T[]): Array<KnockoutArrayChange<T>>;

    export function arrayForEach<T>(array: T[], action: (item: T) => void): void;

    export function arrayIndexOf<T>(array: T[], item: T): number;

    export function arrayFirst<T>(array: T[], predicate: (item: T) => boolean, predicateOwner?: any): T;

    export function arrayRemoveItem(array: any[], itemToRemove: any): void;

    export function arrayGetDistinctValues<T>(array: T[]): T[];

    export function arrayMap<T, U>(array: T[], mapping: (item: T) => U): U[];

    export function arrayFilter<T>(array: T[], predicate: (item: T) => boolean): T[];

    export function arrayPushAll<T>(array: T[], valuesToPush: T[]): T[];

    export function arrayPushAll<T>(array: ObservableArray<T>, valuesToPush: T[]): T[];

    export function extend(target: Object, source: Object): Object;

    export function emptyDomNode(domNode: HTMLElement): void;

    export function moveCleanedNodesToContainerElement(nodes: any[]): HTMLElement;

    export function cloneNodes(nodesArray: any[], shouldCleanNodes: boolean): any[];

    export function setDomNodeChildren(domNode: any, childNodes: any[]): void;

    export function replaceDomNodes(nodeToReplaceOrNodeArray: any, newNodesArray: any[]): void;

    export function setOptionNodeSelectionState(optionNode: any, isSelected: boolean): void;

    export function stringTrim(str: string): string;

    export function stringTokenize(str: string, delimiter: string): string;

    export function stringStartsWith(str: string, startsWith: string): string;

    export function domNodeIsContainedBy(node: any, containedByNode: any): boolean;

    export function domNodeIsAttachedToDocument(node: any): boolean;

    export function tagNameLower(element: any): string;

    export function registerEventHandler(element: any, eventType: any, handler: Function): void;

    export function triggerEvent(element: any, eventType: any): void;

    export function unwrapObservable<T>(value: Observable<T>): T;

    export function peekObservable<T>(value: Observable<T>): T;

    export function toggleDomNodeCssClass(node: any, className: string, shouldHaveClass: boolean): void;

    //setTextContent(element: any, textContent: string): void; // NOT PART OF THE MINIFIED API SURFACE (ONLY IN knockout-{version}.debug.js) https://github.com/SteveSanderson/knockout/issues/670

    export function setElementName(element: any, name: string): void;

    export function forceRefresh(node: any): void;

    export function ensureSelectElementIsRenderedCorrectly(selectElement: any): void;

    export function range(min: any, max: any): any;

    export function makeArray(arrayLikeObject: any): any[];

    export function getFormFields(form: any, fieldName: string): any[];

    export function parseJson(jsonString: string): any;

    export function stringifyJson(data: any, replacer: Function, space: string): string;

    export function postJson(urlOrForm: any, data: any, options: any): void;

    export var ieVersion: number;

    export var isIe6: boolean;

    export var isIe7: boolean;
  }

  export module memoization {

  }

  export module bindingHandlers {

    // Controlling text and appearance
    export var visible: BindingHandler;
    export var text: BindingHandler;
    export var html: BindingHandler;
    export var css: BindingHandler;
    export var style: BindingHandler;
    export var attr: BindingHandler;

    // Control Flow
    export var foreach: BindingHandler;
    export var ifnot: BindingHandler;

    /*export var if: BindingHandler;*/
    /*export var with: BindingHandler;*/

    // Working with form fields
    export var click: BindingHandler;
    export var event: BindingHandler;
    export var submit: BindingHandler;
    export var enable: BindingHandler;
    export var disable: BindingHandler;
    export var value: BindingHandler;
    export var hasfocus: BindingHandler;
    export var checked: BindingHandler;
    export var options: BindingHandler;
    export var selectedOptions: BindingHandler;
    export var uniqueName: BindingHandler;

    // Rendering templates
    export var template: BindingHandler;
  }

  export module virtualElements {
  }

  export module extenders {
    export function throttle(target: any, timeout: number): ko.Computed<any>;
    export function notify(target: any, notifyWhen: string): any;
  }

  export function applyBindings(viewModel: any, rootNode?: any): void;
  export function applyBindingsToDescendants(viewModel: any, rootNode: any): void;
  export function applyBindingsToNode(node: Element, options: any, viewModel: any): void;

  export interface Subscribable<T> extends subscribable.CustomFunctions<T> {
    subscribe(callback: (newValue: T) => void, target?: any, event?: string): Disposable;
    subscribe<TEvent>(callback: (newValue: TEvent) => void, target: any, event: string): Disposable;
    extend(requestedExtenders: { [key: string]: any; }): Subscribable<T>;
    getSubscriptionsCount(): number;
  }

  export module subscribable {

    export var fn: CustomFunctions<any>;

    export interface CustomFunctions<T> {
      notifySubscribers(valueToWrite: T, event?: string): void;
    }

  }

  export interface Disposable {
    dispose(): void;
  }

  export function observable<T>(value?: T): Observable<T>;

  export interface Observable<T> extends observable.CustomFunctions, Subscribable<T> {

    (): T;
    (value: T): void;

    peek(): T;
    valueHasMutated(): void;
    valueWillMutate(): void;
    extend(requestedExtenders: { [key: string]: any; }): Observable<T>;
  }

  export module observable {

    export var fn: CustomFunctions;

    export interface CustomFunctions {
      equalityComparer(a: any, b: any): boolean;
    }
  }



  export function computed<T>(): Computed<T>;
  export function computed<T>(read: () => T, context?: any, options?: any): Computed<T>;
  export function computed<T>(definition: computed.Definition<T>): Computed<T>;
  export function computed(options?: any): Computed<any>;

  export interface Computed<T> {
    (): T;
    (value: T): void;

    peek(): T;
    dispose(): void;
    isActive(): boolean;
    getDependenciesCount(): number;
    extend(requestedExtenders: { [key: string]: any; }): Computed<T>;
  }

  export module computed {

    export var fn: CustomFunctions;

    export interface CustomFunctions {
    }

    export interface Definition<T> {
      read(): T;
      write? (value: T): void;
      disposeWhenNodeIsRemoved?: Node;
      disposeWhen? (): boolean;
      owner?: any;
      deferEvaluation?: boolean;
    }
  }



  export function observableArray<T>(value?: T[]): ObservableArray<T>;

  export interface ObservableArray<T> extends Observable<T[]>, observableArray.CustomFunctions<T> {
  }

  export module observableArray {

    export var fn: CustomFunctions<any>;

    export interface CustomFunctions<T> {
      indexOf(searchElement: T, fromIndex?: number): number;
      slice(start: number, end?: number): T[];
      splice(start: number): T[];
      splice(start: number, deleteCount: number, ...items: T[]): T[];
      pop(): T;
      push(...items: T[]): void;
      shift(): T;
      unshift(...items: T[]): number;
      reverse(): T[];
      sort(): void;
      sort(compareFunction: (left: T, right: T) => number): void;

      // Ko specific
      replace(oldItem: T, newItem: T): void;

      remove(item: T): T[];
      remove(removeFunction: (item: T) => boolean): T[];
      removeAll(items: T[]): T[];
      removeAll(): T[];

      destroy(item: T): void;
      destroyAll(items: T[]): void;
      destroyAll(): void;
    }
  }

  export function contextFor(node: any): any;
  export function isSubscribable(instance: any): boolean;
  export function toJSON(viewModel: any, replacer?: Function, space?: any): string;
  export function toJS(viewModel: any): any;
  export function isObservable(instance: any): boolean;
  export function isWriteableObservable(instance: any): boolean;
  export function isComputed(instance: any): boolean;
  export function dataFor(node: any): any;
  export function removeNode(node: Element): void;
  export function cleanNode(node: Element): Element;
  export function renderTemplate(template: Function, viewModel: any, options?: any, target?: any, renderMode?: any): any;
  export function renderTemplate(template: string, viewModel: any, options?: any, target?: any, renderMode?: any): any;
  export function unwrap(value: any): any;

  export module templateSources /* KnockoutTemplateSources */ {

  }


  export class templateEngine extends nativeTemplateEngine {

    createJavaScriptEvaluatorBlock(script: string): string;

    makeTemplateSource(template: any, templateDocument?: Document): any;

    renderTemplate(template: any, bindingContext: BindingContext, options: Object, templateDocument: Document): any;

    isTemplateRewritten(template: any, templateDocument: Document): boolean;

    rewriteTemplate(template: any, rewriterCallback: Function, templateDocument: Document): void;

  }

  //////////////////////////////////
  // templateRewriting.js
  //////////////////////////////////

  export module templateRewriting {

    export function ensureTemplateIsRewritten(template: Node, templateEngine: templateEngine, templateDocument: Document): any;
    export function ensureTemplateIsRewritten(template: string, templateEngine: templateEngine, templateDocument: Document): any;

    export function memoizeBindingAttributeSyntax(htmlString: string, templateEngine: templateEngine): any;

    export function applyMemoizedBindingsToNextSibling(bindings: any, nodeName: string): string;
  }

  //////////////////////////////////
  // nativeTemplateEngine.js
  //////////////////////////////////

  export class nativeTemplateEngine {
    renderTemplateSource(templateSource: Object, bindingContext?: BindingContext, options?: Object): any[];
  }

  //////////////////////////////////
  // jqueryTmplTemplateEngine.js
  //////////////////////////////////

  export class jqueryTmplTemplateEngine extends templateEngine {

    renderTemplateSource(templateSource: Object, bindingContext: BindingContext, options: Object): Node[];

    createJavaScriptEvaluatorBlock(script: string): string;

    addTemplate(templateName: string, templateMarkup: string): void;

  }

  //////////////////////////////////
  // templating.js
  //////////////////////////////////

  export function setTemplateEngine(templateEngine: nativeTemplateEngine): void;

  export function renderTemplate(template: Function, dataOrBindingContext: BindingContext, options: Object, targetNodeOrNodeArray: Node, renderMode: string): any;
  export function renderTemplate(template: any, dataOrBindingContext: BindingContext, options: Object, targetNodeOrNodeArray: Node, renderMode: string): any;
  export function renderTemplate(template: Function, dataOrBindingContext: any, options: Object, targetNodeOrNodeArray: Node, renderMode: string): any;
  export function renderTemplate(template: any, dataOrBindingContext: any, options: Object, targetNodeOrNodeArray: Node, renderMode: string): any;
  export function renderTemplate(template: Function, dataOrBindingContext: BindingContext, options: Object, targetNodeOrNodeArray: Node[], renderMode: string): any;
  export function renderTemplate(template: any, dataOrBindingContext: BindingContext, options: Object, targetNodeOrNodeArray: Node[], renderMode: string): any;
  export function renderTemplate(template: Function, dataOrBindingContext: any, options: Object, targetNodeOrNodeArray: Node[], renderMode: string): any;
  export function renderTemplate(template: any, dataOrBindingContext: any, options: Object, targetNodeOrNodeArray: Node[], renderMode: string): any;

  export function renderTemplateForEach(template: Function, arrayOrObservableArray: any[], options: Object, targetNode: Node, parentBindingContext: BindingContext): any;
  export function renderTemplateForEach(template: any, arrayOrObservableArray: any[], options: Object, targetNode: Node, parentBindingContext: BindingContext): any;
  export function renderTemplateForEach(template: Function, arrayOrObservableArray: Observable<any>, options: Object, targetNode: Node, parentBindingContext: BindingContext): any;
  export function renderTemplateForEach(template: any, arrayOrObservableArray: Observable<any>, options: Object, targetNode: Node, parentBindingContext: BindingContext): any;

  export module expressionRewriting {
    export var bindingRewriteValidators: any;
  }

  /////////////////////////////////

  export module bindingProvider {

  }

  /////////////////////////////////
  // selectExtensions.js
  /////////////////////////////////

  export module selectExtensions {

    export function readValue(element: HTMLElement): any;

    export function writeValue(element: HTMLElement, value: any): void;
  }

  export interface BindingContext {
    $parent: any;
    $parents: any[];
    $root: any;
    $data: any;
    $index?: number;
    $parentContext?: BindingContext;

    extend(properties: any): any;
    createChildContext(dataItemOrAccessor: any, dataItemAlias?: any, extendCallback?: Function): any;
  }

  export interface BindingHandler {
    init? (element: any, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any, bindingContext: BindingContext): void;
    update? (element: any, valueAccessor: () => any, allBindingsAccessor: () => any, viewModel: any, bindingContext: BindingContext): void;
    options?: any;
  }

}



interface KnockoutMemoization {
  memoize(callback: () => string): string;
  unmemoize(memoId: string, callbackParams: any[]): boolean;
  unmemoizeDomNodeAndDescendants(domNode: any, extraCallbackParamsArray: any[]): boolean;
  parseMemoText(memoText: string): string;
}

interface KnockoutVirtualElement { }

interface KnockoutVirtualElements {
  allowedBindings: { [bindingName: string]: boolean; };
  emptyNode(node: KnockoutVirtualElement): void;
  firstChild(node: KnockoutVirtualElement): KnockoutVirtualElement;
  insertAfter(container: KnockoutVirtualElement, nodeToInsert: HTMLElement, insertAfter: HTMLElement): void;
  nextSibling(node: KnockoutVirtualElement): HTMLElement;
  prepend(node: KnockoutVirtualElement, toInsert: HTMLElement): void;
  setDomNodeChildren(node: KnockoutVirtualElement, newChildren: { length: number;[index: number]: HTMLElement; }): void;
  childNodes(node: KnockoutVirtualElement): HTMLElement[];
}



interface KnockoutArrayChange<T> {
  status: string;
  value: T;
  index: number;
}

//////////////////////////////////
// templateSources.js
//////////////////////////////////

interface KnockoutTemplateSourcesDomElement {

  text(valueToWrite?: any): any;

  data(key: string, valueToWrite?: any): any;
}


interface KnockoutTemplateSources {

  domElement: KnockoutTemplateSourcesDomElement;

  anonymousTemplate: {

    prototype: KnockoutTemplateSourcesDomElement;

    new (element: Element): KnockoutTemplateSourcesDomElement;
  };
}



declare module "knockout" {
  export = ko;
}
