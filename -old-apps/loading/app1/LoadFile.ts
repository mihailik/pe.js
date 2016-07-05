module pe.app1.loading {

  /**
   * Backing file loading screen.
   * This class is ViewModel bound to DOM with Knockout.js.
   * Parametrized with an ArrayBuffer loading function (async)
   * and a scheduler that can yield. 
   */
  export class LoadFile {

    className = ko.observable('');
    shortText = ko.observable('');
    progressRatio = ko.observable(0);
    loadedPage = ko.observable(null);
    error: Error = null;

    private static _loadWorkPart = 0.3;
    private static _loadHeadersPart = 0.2;
    private static _loadAssembly = 0.48;

    private _reader: io.BufferReader = null;
    private _headers: headers.PEFileHeaders = null;
    private _assembly: managed.Assembly = null;
    private _oncomplete: AsyncCallback<any>[] = [];

    constructor(
      arrayBufferSource: (callback: AsyncCallback<ArrayBuffer>) => void,
      private _yieldScheduler: () => AsyncCallback.YieldCallback) {

      var callback: any = (error, arrayBuffer) =>
        this._arrayBufferComplete(error, arrayBuffer);

      callback.progress = (current, total, text) => {
        this.progressRatio(LoadFile._loadWorkPart * current / total);
        if (text)
          this.shortText(text);
        return this._yieldScheduler();
      };

      this.className('pe-loading-getdata');
      this.shortText('wait');
      this.progressRatio(0);
      arrayBufferSource(callback);

    }

    oncomplete(handler: AsyncCallback<any>) {
      if (this.loadedPage()) {
        handler(null, this.loadedPage());
        return;
      }
      else if (this.error) {
        handler(this.error, null);
        return;
      }
      else {
        this._oncomplete.push(handler);
      }
    }

    private _arrayBufferComplete(error: Error, arrayBuffer: ArrayBuffer) {
      if (this._handleError(error))
        return;

      this.className('pe-loading-unmanaged');
      this.shortText('PE headers');
      this.progressRatio(LoadFile._loadWorkPart);

      this._reader = new io.BufferReader(arrayBuffer);
      this._headers = new headers.PEFileHeaders();

      var callback: any = (error, none) =>
        this._headersComplete(error);

      callback.progress = (current, total, text = this.shortText()) => {
        this.progressRatio(LoadFile._loadWorkPart + LoadFile._loadHeadersPart * current / total);
        this.shortText(text);
        return this._yieldScheduler();
      };

      this._headers.read(this._reader, callback);
    }

    private _headersComplete(error: Error) {
      if (this._handleError(error))
        return;

      if (!this._headers.optionalHeader.dataDirectories[headers.DataDirectoryKind.Clr]) {
        this._buildUnmanagedResult();
        return;
      }

      this.className('pe-loading-managed');
      this.shortText('Assembly');
      this.progressRatio(LoadFile._loadWorkPart + LoadFile._loadHeadersPart);

      var callback: any = (error, assembly) =>
        this._assemblyComplete(error, assembly);

      callback.progress = (current, total, text = this.shortText()) => {
        this.progressRatio(LoadFile._loadWorkPart + LoadFile._loadHeadersPart + LoadFile._loadAssembly * current / total);
        this.shortText(text);
        return this._yieldScheduler();
      };

      var dom = new managed.AppDomain();
      dom.read(this._reader, callback);
    }

    private _assemblyComplete(error: Error, assembly: managed.Assembly) {
      if (this._handleError(error))
        return;

      this._assembly = assembly;

      this._buildManagedResult();
    }

    private _buildUnmanagedResult() {
      // TODO: keep yielding here too

      var unmanagedPage = new loaded.PageUnmanaged(this._headers);
      this.loadedPage(unmanagedPage);
      
      for (var i = 0; i < this._oncomplete.length; i++) {
        var h = this._oncomplete[i];
        h(null, unmanagedPage);
      }
      this._oncomplete = [];
    }

    private _buildManagedResult() {
      // TODO: keep yielding here too

      var page = new loaded.Page(this._assembly);
      this.loadedPage(page);

      for (var i = 0; i < this._oncomplete.length; i++) {
        var h = this._oncomplete[i];
        h(null, page);
      }
      this._oncomplete = [];
    }

    private _handleError(error: Error) {
      if (error) {
        this.className('pe-loading-error');
        this.progressRatio(1);
        this.shortText(error.message);
        for (var i = 0; i < this._oncomplete.length; i++) {
          var h = this._oncomplete[i];
          h(error, null);
        }
        this._oncomplete = [];
      }

      return error;
    }


  }

}