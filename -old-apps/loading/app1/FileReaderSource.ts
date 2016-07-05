module pe.app1.loading.FileReaderSource { 

  export function load(
    callback: AsyncCallback<ArrayBuffer>,
    file: File) {

      var fileReader = new FileReader();
      fileReader.onerror = (er: ErrorEvent) => {
        callback(<any>er, null);
      };
      fileReader.onloadend = (ev) => {
        if (fileReader.readyState !== 2) {
          callback(new Error('Read ' + fileReader.readyState + fileReader.error+'.'), null);
          return;
        }
        
        callback(null, fileReader.result);
      };
      if (callback.progress) { 
        fileReader.onprogress = (ev) => {
          callback.progress(ev.loaded, ev.total, 'Loading...');
        };
      }

      fileReader.readAsArrayBuffer(file);
  }

}