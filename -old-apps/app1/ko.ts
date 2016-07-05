module pe.app1 { 

  export function registerKnockoutBindings(ko: any) {
    if ((<any>ko.bindingHandlers).attach)
      return;

    (<any>ko.bindingHandlers).attach = {
      init: function(element, valueAccessor) {
        valueAccessor();
      }
    };
  }
  
}