module pe.app1 { 

  export function on(host: Element, eventName: string, handler: Function) { 
    if (host.addEventListener) {
      (<any>host).addEventListener(eventName, handler, false);
    }
    else if ((<any>host).attachEvent) {
      (<any>host).attachEvent('on' + eventName, handler);
    }
    else if ('on' + eventName in host) {
      host['on' + eventName] = handler;
    }
  }

}