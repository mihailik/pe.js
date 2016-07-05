module pe.app1.loading {

  export class DomBase64Source {

    private _loaded: string[] = [];
    private _loadedSize = 0;

    constructor(
      private _callback: AsyncCallback<ArrayBuffer>,
      private _ids: string[],
      private _doc = document) {

      this._continueReading();
    }

    private _continueReading() {
      while (this._loaded.length < this._ids.length) {

        var nextId = this._ids[this._loaded.length];
        var nextElement = this._doc.getElementById(nextId);

        var nextBase64 = nextElement.innerHTML || nextElement.textContent || nextElement.innerText;
        var nextBinary = atob(nextBase64);

        this._loaded.push(nextBinary);
        this._loadedSize += nextBinary.length;

        if (this._callback.progress) {
          var estimatedTotalSize = this._loadedSize * this._ids.length / this._loaded.length;
          var shouldYield = this._callback.progress(this._loadedSize, estimatedTotalSize, 'extracting from HTML');
          if (shouldYield) {
            shouldYield(() => this._continueReading());
            return;
          }
        }
      }

      this._complete();

    }

    private _complete() {
      var buffer = new ArrayBuffer(this._loadedSize);
      var binary = new Uint8Array(buffer);
      var pos = 0;
      for (var i = 0; i < this._loaded.length; i++) {
        for (var j = 0; j < this._loaded[i].length; j++) {
          binary[pos] = this._loaded[i].charCodeAt(j);
          pos++;
        }
      }

      this._callback(null, buffer);
    }
  }

}