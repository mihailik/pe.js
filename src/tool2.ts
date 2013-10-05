/// <reference path='pe2.d.ts' />

declare var startPageLoading: number;

var loadedFiles = {};

function getTime() {
  if (Date.now)
    return Date.now();
  else
    return new Date().getTime();
}

function init() {
  try {
    var mscStart = getTime();
    var pageLoadTime = (mscStart - startPageLoading)/1000;
    var preLog = 'page '+pageLoadTime+'s.';
    log(preLog);

    var buf: Uint32Array = null;
    var pieceCount = 16;
    var i = 0;
    var base64: string;
    var binText: string;
    
    function nextGetBase64() {
      try {
        log(preLog+' nextGetBase64:'+i+'...');
        base64 = getBase64(i);
        setTimeout(nextGetBinText, 50);
      }
      catch (error) {
        alert(error+' '+error.message);
      }
    }

    function nextGetBinText() {
      try {
        log(preLog+' nextGetBinText:'+i+'...');
        binText = getBinText(base64);
        if (buf===null)
          buf = createBuffer(binText.length*pieceCount);
  
        setTimeout(nextCopyBinTextToBuffer, 50);
      }
      catch (error) {
        alert(error+' '+error.message);
      }
    }

    function nextCopyBinTextToBuffer() {
      try {
        log(preLog+' nextCopyBinTextToBuffer:'+i+'...');
        var pieceLength = buf.length/pieceCount;
        copyBinTextToBuffer(binText, buf, i*pieceLength, pieceLength);
        i++;
  
        if (i<pieceCount) {
          setTimeout(nextGetBase64, 50);
        }
        else {
          var mscTime = (getTime() - mscStart)/1000;
          log(preLog+' mscorlib.dll['+buf.length+'/'+pieceCount+'] '+mscTime+'s.');
        }
      }
      catch (error) {
        alert(error+' '+error.message);
      }
    }
    
    setTimeout(nextGetBase64, 50);
  }
  catch (error) {
    alert(error+' '+error.message);
  }

  var logElement;
  function log(txt) {
    if (!logElement) {
      logElement = document.createElement('div');
      document.body.appendChild(logElement);
    }
    //var current = logElement.textContent || logElement.innerText;
    var newText = /*current +*/ txt;
    logElement.textContent = newText;
    logElement.innerText = newText;
  }
  log.toString = function() {
    return logElement.textContent || logElement.innerText;
  }
}

function getBase64(i: number) {
  var mscorlibDllScript = document.getElementById('mscorlib'+i+'.dll');
  if (mscorlibDllScript===null) {
    return null;
  }

  return mscorlibDllScript.innerHTML || mscorlibDllScript.textContent;
}

function getBinText(base64: string) {
  if (!_atob)
    createAtob();
  return _atob(base64);
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

var _atob;
function createAtob() {
  if (window.atob) {
    _atob = window.atob;
  }
  else {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
      INVALID_CHARACTER_ERR = (function () {
        // fabricate a suitable error object
        try { document.createElement('$'); }
        catch (error) { return error; }}());
    _atob = function (input) {
      input = input.replace(/=+$/, '')
      if (input.length % 4 == 1) throw INVALID_CHARACTER_ERR;
      for (
        // initialize result and counters
        var bc = 0, bs, buffer, idx = 0, output = '';
        // get next character
        buffer = input.charAt(idx++);
        // character found in table? initialize bit storage and add its ascii value;
        ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
          // and if not first of each 4 characters,
          // convert the first 8 bits to one ascii character
          bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
      ) {
        // try to find character in table (0-63, not found => -1)
        buffer = chars.indexOf(buffer);
      }
      return output;
    };
    alert(_atob);
  }
}

window.onload = init;
