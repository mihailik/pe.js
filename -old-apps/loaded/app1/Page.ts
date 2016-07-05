module pe.app1.loaded {

  export class Page {

    details: AssemblyDetails;

    peHeaders: PEHeadersNode;
    references: ReferencesNode;
    namespaces: NamespaceNode[];

    unmanagedImports: UnmanagedImportsNode;
    unmanagedResources: UnmanagedResourcesNode;

    selectedNode = ko.observable<BaseNode>(null);

    constructor(
      private _assembly: managed.Assembly) {

      this.details = new AssemblyDetails(this._assembly);
      this.peHeaders = new PEHeadersNode(null, this._assembly.fileHeaders);
      this.references = new ReferencesNode(null, this._assembly);

      this.namespaces = Page.createNamespaceNodes(this._assembly);

      this.unmanagedImports = new UnmanagedImportsNode(null);
      this.unmanagedResources = new UnmanagedResourcesNode(null);

    }

    open(data) { 
      alert('Page.open()');
    }

    attachFileInput(input: HTMLInputElement) {
      input.onchange = () => {
        if (input.files && input.files.length) {
          this.open(input.files[0]);
        }
      };
    }

    static createNamespaceNodes(assembly: managed.Assembly) { 
      var byNamespace: { [namespace: string]: { [name: string]: managed.Type; }; } = {};

      assembly.types.forEach(t=> {
        var nsTypes = byNamespace[t.namespace] || (byNamespace[t.namespace] = {});
        nsTypes[t.name] = t;
      });

      var orderedNsNames = Object.keys(byNamespace).sort();
      var namespaces = orderedNsNames
        .filter(nsName => byNamespace.hasOwnProperty(nsName))
        .map(nsName => new NamespaceNode(null, nsName, byNamespace[nsName]));

      return namespaces;
    }

    nodeClick(node, event: Event) {
      var srcElement = event.srcElement;
      while (srcElement) {

        var isHandled = false;
        var data = ko.dataFor(srcElement);

        if (typeof data.isExpanded === 'function') {
          data.isExpanded(!data.isExpanded());
          isHandled = true;
        }

        if (typeof data.click === 'function') {
          data.click();
          isHandled = true;
        }
        
        if (data && data.details) {
          this.selectedNode(data);
          isHandled = true;
        }

        if (isHandled) { 
          if (event.preventDefault)
            event.preventDefault();
          if ('cancelBubble' in event)
            event.cancelBubble = true;
          return;
        }

        srcElement = (<HTMLElement>srcElement).parentElement;
      }
    }

  }

}