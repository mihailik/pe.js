// Type definitions for Raphael 2.1
// Project: http://raphaeljs.com
// Definitions by: https://github.com/CheCoxshall
// DefinitelyTyped: https://github.com/borisyankov/DefinitelyTyped

declare function Raphael(container: HTMLElement, width: number, height: number): Raphael.Paper;
declare function Raphael(container: HTMLElement, width: number, height: number, callback: (result: Raphael.Paper) => void): void;

declare function Raphael(container: string, width: number, height: number): Raphael.Paper;
declare function Raphael(container: string, width: number, height: number, callback: (result: Raphael.Paper) => void): void;

declare function Raphael(x: number, y: number, width: number, height: number): Raphael.Paper;
declare function Raphael(x: number, y: number, width: number, height: number, callback: (result: Raphael.Paper) => void): void;

declare function Raphael(all: any[]): Raphael.Paper;
declare function Raphael(all: any[], callback: (result: Raphael.Paper) => void): void;

declare function Raphael(callback: (result: Raphael.Paper) => void): void;


declare module Raphael {

  export function angle(x1: number, y1: number, x2: number, y2: number, x3?: number, y3?: number): number;
  export function animation(params: any, ms: number, easing?: string, callback?: Function): Animation;
  export function bezierBBox(p1x: number, p1y: number, c1x: number, c1y: number, c2x: number, c2y: number, p2x: number, p2y: number): { min: { x: number; y: number; }; max: { x: number; y: number; }; };
  export function bezierBBox(bez: any[]): { min: { x: number; y: number; }; max: { x: number; y: number; }; };
  export function color(clr: string): { r: number; g: number; b: number; hex: string; error: boolean; h: number; s: number; v: number; l: number; };
  export function createUUID(): string;
  export function deg(deg: number): number;
  export var easing_formulas: any;
  export var el: any;
  export function findDotsAtSegment(p1x: number, p1y: number, c1x: number, c1y: number, c2x: number, c2y: number, p2x: number, p2y: number, t: number): { x: number; y: number; m: { x: number; y: number; }; n: { x: number; y: number; }; start: { x: number; y: number; }; end: { x: number; y: number; }; alpha: number; };
  export var fn: any;
  export function format(token: string, ...parameters: any[]): string;
  export function fullfill(token: string, json: JSON): string;

  export var getColor: {
    (value?: number): string;
    reset(): void;
  };

  export function getPointAtLength(path: string, length: number): { x: number; y: number; alpha: number; };
  export function getRGB(colour: string): { r: number; g: number; b: number; hex: string; error: boolean; };
  export function getSubpath(path: string, from: number, to: number): string;
  export function getTotalLength(path: string): number;
  export function hsb(h: number, s: number, b: number): string;
  export function hsb2rgb(h: number, s: number, v: number): { r: number; g: number; b: number; hex: string; };
  export function hsl(h: number, s: number, l: number): string;
  export function hsl2rgb(h: number, s: number, l: number): { r: number; g: number; b: number; hex: string; };
  export function is(o: any, type: string): boolean;
  export function isBBoxIntersect(bbox1: string, bbox2: string): boolean;
  export function isPointInsideBBox(bbox: string, x: number, y: number): boolean;
  export function isPointInsidePath(path: string, x: number, y: number): boolean;
  export function matrix(a: number, b: number, c: number, d: number, e: number, f: number): Matrix;
  export function ninja(): void;
  export function parsePathString(pathString: string): string[];
  export function parsePathString(pathString: string[]): string[];
  export function parseTransformString(TString: string): string[];
  export function parseTransformString(TString: string[]): string[];
  export function path2curve(pathString: string): string[];
  export function path2curve(pathString: string[]): string[];
  export function pathBBox(path: string): BoundingBox;
  export function pathIntersection(path1: string, path2: string): { x: number; y: number; t1: number; t2: number; segment1: number; segment2: number; bez1: any[]; bez2: any[]; }[];
  export function pathToRelative(pathString: string): string[];
  export function pathToRelative(pathString: string[]): string[];
  export function rad(deg: number): number;
  export function registerFont(font: Font): Font;
  export function rgb(r: number, g: number, b: number): string;
  export function rgb2hsb(r: number, g: number, b: number): { h: number; s: number; b: number; };
  export function rgb2hsl(r: number, g: number, b: number): { h: number; s: number; l: number; };
  export function setWindow(newwin: Window): void;
  export function snapTo(values: number, value: number, tolerance?: number): number;
  export function snapTo(values: number[], value: number, tolerance?: number): number;
  export var st: any;
  export var svg: boolean;
  export function toMatrix(path: string, transform: string): Matrix;
  export function toMatrix(path: string, transform: string[]): Matrix;
  export function transformPath(path: string, transform: string): string;
  export function transformPath(path: string, transform: string[]): string;
  export var type: string;
  export var vml: boolean;


  export interface BoundingBox {
    x: number;
    y: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
  }

  export interface Animation {
    delay(delay: number): Animation;
    repeat(repeat: number): Animation;
  }

  export interface Font {

  }

  export interface Element {
    animate(params: { [key: string]: any; }, ms: number, easing?: string, callback?: Function): Element;
    animate(animation: Animation): Element;
    animateWith(el: Element, anim: Animation, params: any, ms: number, easing?: string, callback?: Function): Element;
    animateWith(el: Element, anim: Animation, animation: Animation): Element;
    attr(attrName: string, value: any): Element;
    attr(params: any): Element;
    attr(attrName: string): any;
    attr(attrNames: string[]): any[];
    click(handler: Function): Element;
    clone(): Element;
    data(key: string): any;
    data(key: string, value: any): Element;
    dblclick(handler: Function): Element;
    drag(onmove: (dx: number, dy: number, x: number, y: number, event: DragEvent) => {}, onstart: (x: number, y: number, event: DragEvent) => {}, onend: (DragEvent: any) => {}, mcontext?: any, scontext?: any, econtext?: any): Element;
    getBBox(isWithoutTransform?: boolean): BoundingBox;
    glow(glow?: { width?: number; fill?: boolean; opacity?: number; offsetx?: number; offsety?: number; color?: string; }): Set;
    hide(): Element;
    hover(f_in: Function, f_out: Function, icontext?: any, ocontext?: any): Element;
    id: string;
    insertAfter(): Element;
    insertBefore(): Element;
    isPointInside(x: number, y: number): boolean;
    isVisible(): boolean;
    matrix: Matrix;
    mousedown(handler: Function): Element;
    mousemove(handler: Function): Element;
    mouseout(handler: Function): Element;
    mouseover(handler: Function): Element;
    mouseup(handler: Function): Element;
    next: Element;
    node: SVGElement;
    onDragOver(f: Function): Element;
    paper: Paper;
    pause(anim?: Animation): Element;
    prev: Element;
    raphael: typeof Raphael;
    remove(): void;
    removeData(key?: string): Element;
    resume(anim?: Animation): Element;
    setTime(anim: Animation): void;
    setTime(anim: Animation, value: number): Element;
    show(): Element;
    status(): { anim: Animation; status: number; }[];
    status(anim: Animation): number;
    status(anim: Animation, value: number): Element;
    stop(anim?: Animation): Element;
    toBack(): Element;
    toFront(): Element;
    touchcancel(handler: Function): Element;
    touchend(handler: Function): Element;
    touchmove(handler: Function): Element;
    touchstart(handler: Function): Element;
    transform(): string;
    transform(tstr: string): Element;
    unclick(handler: Function): Element;
    undblclick(handler: Function): Element;
    undrag(): Element;
    unhover(): Element;
    unhover(f_in: Function, f_out: Function): Element;
    unmousedown(handler: Function): Element;
    unmousemove(handler: Function): Element;
    unmouseout(handler: Function): Element;
    unmouseover(handler: Function): Element;
    unmouseup(handler: Function): Element;
    untouchcancel(handler: Function): Element;
    untouchend(handler: Function): Element;
    untouchmove(handler: Function): Element;
    untouchstart(handler: Function): Element;
  }

  export interface Path extends Element {
    getPointAtLength(length: number): { x: number; y: number; alpha: number; };
    getSubpath(from: number, to: number): string;
    getTotalLength(): number;
  }

  export interface Set {
    clear(): void;
    exclude(element: Element): boolean;
    forEach(callback: Function, thisArg?: any): Set;
    pop(): Element;
    push(...Element: any[]): Element;
    splice(index: number, count: number): Set;
    splice(index: number, count: number, ...insertion: Element[]): Set;
    length: number;

    [key: number]: Element;
    animate(params: { [key: string]: any; }, ms: number, easing?: string, callback?: Function): Element;
    animate(animation: Animation): Element;
    animateWith(el: Element, anim: Animation, params: any, ms: number, easing?: string, callback?: Function): Element;
    animateWith(el: Element, anim: Animation, animation: Animation): Element;
    attr(attrName: string, value: any): Element;
    attr(params: { [key: string]: any; }): Element;
    attr(attrName: string): any;
    attr(attrNames: string[]): any[];
    click(handler: Function): Element;
    clone(): Element;
    data(key: string): any;
    data(key: string, value: any): Element;
    dblclick(handler: Function): Element;
    drag(onmove: (dx: number, dy: number, x: number, y: number, event: DragEvent) => {}, onstart: (x: number, y: number, event: DragEvent) => {}, onend: (DragEvent: any) => {}, mcontext?: any, scontext?: any, econtext?: any): Element;
    getBBox(isWithoutTransform?: boolean): BoundingBox;
    glow(glow?: { width?: number; fill?: boolean; opacity?: number; offsetx?: number; offsety?: number; color?: string; }): Set;
    hide(): Element;
    hover(f_in: Function, f_out: Function, icontext?: any, ocontext?: any): Element;
    id: string;
    insertAfter(): Element;
    insertBefore(): Element;
    isPointInside(x: number, y: number): boolean;
    isVisible(): boolean;
    matrix: Matrix;
    mousedown(handler: Function): Element;
    mousemove(handler: Function): Element;
    mouseout(handler: Function): Element;
    mouseover(handler: Function): Element;
    mouseup(handler: Function): Element;
    next: Element;
    onDragOver(f: Function): Element;
    paper: Paper;
    pause(anim?: Animation): Element;
    prev: Element;
    raphael: typeof Raphael;
    remove(): void;
    removeData(key?: string): Element;
    resume(anim?: Animation): Element;
    setTime(anim: Animation): void;
    setTime(anim: Animation, value: number): Element;
    show(): Element;
    status(): { anim: Animation; status: number; }[];
    status(anim: Animation): number;
    status(anim: Animation, value: number): Element;
    stop(anim?: Animation): Element;
    toBack(): Element;
    toFront(): Element;
    touchcancel(handler: Function): Element;
    touchend(handler: Function): Element;
    touchmove(handler: Function): Element;
    touchstart(handler: Function): Element;
    transform(): string;
    transform(tstr: string): Element;
    unclick(handler: Function): Element;
    undblclick(handler: Function): Element;
    undrag(): Element;
    unhover(): Element;
    unhover(f_in: Function, f_out: Function): Element;
    unmousedown(handler: Function): Element;
    unmousemove(handler: Function): Element;
    unmouseout(handler: Function): Element;
    unmouseover(handler: Function): Element;
    unmouseup(handler: Function): Element;
    untouchcancel(handler: Function): Element;
    untouchend(handler: Function): Element;
    untouchmove(handler: Function): Element;
    untouchstart(handler: Function): Element;
  }

  export interface Matrix {
    add(a: number, b: number, c: number, d: number, e: number, f: number, matrix: Matrix): Matrix;
    clone(): Matrix;
    invert(): Matrix;
    rotate(a: number, x: number, y: number): void;
    scale(x: number, y?: number, cx?: number, cy?: number): void;
    split(): { dx: number; dy: number; scalex: number; scaley: number; shear: number; rotate: number; isSimple: boolean; };
    toTransformString(): string;
    translate(x: number, y: number): void;
    x(x: number, y: number): number;
    y(x: number, y: number): number;
  }

  export interface Paper {
    add(arr: { type: string; }[]): Set;
    bottom: Element;
    canvas: SVGSVGElement;
    circle(x: number, y: number, r: number): Element;
    clear(): void;
    customAttributes: any;
    defs: SVGDefsElement;
    ellipse(x: number, y: number, rx: number, ry: number): Element;
    forEach(callback: (el: Element) => boolean, thisArg?: any): Paper;
    getById(id: number): Element;
    getElementByPoint(x: number, y: number): Element;
    getElementsByPoint(x: number, y: number): Set;
    getFont(family: string, weight?: string, style?: string, stretch?: string): Font;
    getFont(family: string, weight?: number, style?: string, stretch?: string): Font;
    height: number;
    image(src: string, x: number, y: number, width: number, height: number): Element;
    path(pathString?: string): Path;
    print(x: number, y: number, str: string, font: Font, size?: number, origin?: string, letter_spacing?: number): Path;
    rect(x: number, y: number, width: number, height: number, r?: number): Element;
    remove(): void;
    renderfix(): void;
    safari(): void;
    set(elements?: Element[]): Set;
    set(...elements: Element[]): Set;
    setFinish(): void;
    setSize(width: number, height: number): void;
    setStart(): void;
    setViewBox(x: number, y: number, w: number, h: number, fit: boolean): void;
    text(x: number, y: number, text: string): Element;
    top: Element;
    width: number;
  }

}