module pe.app.layout {

  export class ApplicationLayout {

    root: Raphael.Paper;

    constructor(private _uisite: HTMLDivElement) {
      //boot.set(this._uisite, '');

      this.root = Raphael(this._uisite, 500, 500);
      var circles = this.root.set(
        this.root.circle(100, 100, 80),
        this.root.circle(200, 200, 70));
      circles.attr('fill', '#000').attr('stroke', 'red').transform('s2,2').click(() => { 
        this.saveHtml();
      });
    }

    
    /**
     * Suggested name for file save operation.
     */
    saveFileName() {
      var urlParts = window.location.pathname.split('/');
      var currentFileName = decodeURI(urlParts[urlParts.length - 1]);
      var lastDot = currentFileName.indexOf('.');
      if (lastDot > 0) {
        currentFileName = currentFileName.slice(0, lastDot) + '.html';
      }
      else {
        currentFileName += '.html';
      }
      return currentFileName;
    }

    /**
     * Triggers a download of the whole current HTML, which contains the filesystem state and all the necessary code.
     * Relies on blob URLs, doesn't work in old browsers.
     * Exposed as a button bound using Knockout.
     */
    saveHtml() {

      var filename = this.saveFileName();
      var blob: Blob = new (<any>Blob)(['<!doctype html>\n', document.documentElement.outerHTML], { type: 'application/octet-stream' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', filename);
      try {
        // safer save method, supposed to work with FireFox
        var evt = document.createEvent("MouseEvents");
        (<any>evt).initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(evt);
      }
      catch (e) {
        a.click();
      }
    }

  }

}