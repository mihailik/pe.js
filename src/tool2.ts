/// <reference path='pe2.d.ts' />


declare var sampleBuf: Uint8Array;

var loadedFiles = {};

function init() {
  try {
    var logElement;
    function log(txt) {
      if (!logElement) {
        logElement = document.createElement('div');
        document.body.appendChild(logElement);
      }
      var current = logElement.textContent || logElement.innerText;
      var newText = current + txt;
      logElement.textContent = newText;
      logElement.innerText = newText;
    }

    var pageLoad = Date.now() - window['startPageLoading'];
    log('page '+pageLoad/1000+'... ');

    setTimeout(() => {
      try {
        loadMscorlib((buffer, mscorlibLoad, error) =>
        {
          if (error) {
            alert(error+' '+error.message);
            return;
          }

          log('mscorlib ' + mscorlibLoad/1000 + '...');
        });
      }
      catch (error) {
        alert(error+' '+error.message);
      }
    }, 100);
    
    
  
  }
  catch (error) {
    alert(error);
  }
}

function loadMscorlib(oncomplete: (buf, timeMs: number, e: Error) => void) {

  /*task.queueWork(50, function() {  
    var base64 = getBase64();
    if (!base64) {
      oncomplete(null, task.spentMs, new Error('Element mscorlib.dll is absent.'));
      return;
    }
  }, 50);*/

  function getBase64() {
    var mscorlibDllScript = document.getElementById('mscorlib.dll');
    if (mscorlibDllScript===null) {
      return null;
    }
  
    return mscorlibDllScript.innerHTML || mscorlibDllScript.textContent;
  }
  
  function getBinText(base64: string) {
    if (window.atob) {
      return atob(base64);
    }
    else {
      var polyfill =
      'function() {' +
      'var exports = {};'+
      '(function(){var t="undefined"!=typeof exports?exports:window,'+
      'r="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",'+
      'o=function(){try{document.createElement("$")}catch(t){return t}}();'+
      't.btoa||(t.btoa=function(t){for(var e,n,a=0,c=r,f="";t.charAt(0|a)||'+
      '(c="=",a%1);f+=c.charAt(63&e>>8-8*(a%1))){if(n=t.charCodeAt(a+=.75),n>255)'+
      'throw o;e=e<<8|n}return f}),t.atob||(t.atob=function(t){if(t=t.replace(/=+$/,""),'+
      '1==t.length%4)throw o;for(var e,n,a=0,c=0,f="";n=t.charAt(c++);~n&&'+
      '(e=a%4?64*e+n:n,a++%4)?f+=String.fromCharCode(255&e>>(6&-2*a)):0)n=r.indexOf(n);'+
      'return f})})();'+
      'return exports; }';
      var atob_ = eval(polyfill).atob;
      return atob_(base64);
    }
  }

  function createBuffer(int32Length: number): Uint32Array {
    if ('Uint32Array' in window)
      return new Uint32Array(int32Length);
    else
      return <any>[];
  }

  function copyBinTextToBuffer(
    binText: string,
    buf: Uint32Array,
    bufOffset: number, bufCount: number) {

    for (var i = bufOffset; i < bufCount; i++) {
      buf[i] =
        binText.charCodeAt(i/4) |
        binText.charCodeAt(i/4 + 1) << 8 |
        binText.charCodeAt(i/4 + 2) << 16 |
        binText.charCodeAt(i/4 + 3) << 24;
    }
  }
}

window.onload = init;
