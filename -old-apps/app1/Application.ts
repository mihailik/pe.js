module pe.app1 {

  /**
   * Entry point and root ViewModel for the PE.js application.
   */
  export class Application {

    constructor(
      private _host: HTMLElement,
      private _window: pe.app1.Application.MinWindow = window) {

      registerKnockoutBindings(ko);

      this._loadFromDom();
    }


    private _loadFromHref(data) {
      if (typeof data !== 'object') {

        alert('load from href! ' + data);
        this._loadFromDom();
      }
      else {
        var bootVM = new app1.boot.Boot();
        bootVM.loading = new loading.LoadFile(
          callback => pe.app1.loading.FileReaderSource.load(callback, data),
          () => work => setTimeout(work, 10));
        

        var popupView = document.createElement('div');
        popupView.style.position = 'absolute';
        popupView.style.left = '2em';
        popupView.style.top = '2em';
        popupView.style.bottom = '2em';
        popupView.style.right = '2em';
        popupView.style.border = '1px solid black';

        this._host.appendChild(popupView);
        
        ko.renderTemplate('Boot', bootVM, null, popupView);

        
        if (!this._checkBootComplete(bootVM.loading.loadedPage())) {
          bootVM.loading.loadedPage.subscribe(page => this._checkBootComplete(bootVM.loading.loadedPage()));
        }

      }
    }

    private _loadFromDom() {
      var ids = [];
      for (var i = 0; i < 16; i++) {
        var nextId = i.toString();
        if (nextId.length < 2) nextId = '0' + nextId;
        nextId = 'data' + nextId;
        ids.push(nextId);
      }

      var bootVM = new boot.Boot();
      bootVM.loading = new loading.LoadFile(
        callback => new loading.DomBase64Source(callback, ids),
        () => work => setTimeout(work, 10));

      ko.renderTemplate('Boot', bootVM, null, this._host);

      if (!this._checkBootComplete(bootVM.loading.loadedPage())) {
        bootVM.loading.loadedPage.subscribe(page => this._checkBootComplete(bootVM.loading.loadedPage()));
      }
    }

    private _checkBootComplete(loadedPage: any) {
      if (!loadedPage) return false;

      if (loadedPage.open) {
        loadedPage.open = (data) => {
          this._onopenAnother(data);
        };
      }

      var template = loadedPage.details ? 'Managed' : 'Unmanaged';
      ko.renderTemplate('Managed', loadedPage, null, this._host);

      on(<any>this._window, 'keydown', e => this._onkeydown(e));
    }

    private _onkeydown(e: KeyboardEvent) {
      if (e.keyCode === ('O').charCodeAt(0) && (e.altKey || e.ctrlKey)) {
        this._onopenAnother(null);
        e.cancelBubble = true;
        if (e.preventDefault)
          e.preventDefault();
        return false;
      }
    }

    private _onopenAnother(data) {
      this._loadFromHref(data);
    }
  }

  export module Application {

    export interface MinWindow { 
      location: { href: string; };
      links?: any;
      opener: { links?: any; };
      open(url: string, frame?: string): any;
      _data?: any;
    }
    
  }
}