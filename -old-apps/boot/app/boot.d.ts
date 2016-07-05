declare module pe.app.boot {

  export var status: HTMLDivElement;
  export var progress: HTMLDivElement;
  export var uisite: HTMLDivElement;

  export function set(elem: Element, text: string);
  export function set(elem: Element, style: any);

}