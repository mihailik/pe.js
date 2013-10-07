module pe.tool {

  /**
   * loading embedded mscorlib.dll into a [typed] array of 32-bit integers
   */
  export function loadMscorlib(
    callback: (bufer: Uint32Array, error: Error) => void,
    restIntervalMs: number,
    log: (msg: string) => void): void {
    
    var pieceCount = 16;
    var i = 0;
    var base64: string = null;
    var binText: string = null;
    var buf: Uint32Array = null;

    setTimeout(nextGetBase64, restIntervalMs);
  
    function nextGetBase64() {
      try {
        log('nextGetBase64:'+i+'...');
        base64 = getBase64(i);
        setTimeout(nextGetBinText, restIntervalMs);
      }
      catch (error) {
        callback(null, error);
      }
    }
  
    function nextGetBinText() {
      try {
        log('nextGetBinText:'+i+'...');
        binText = getBinText(base64);
        if (buf===null)
          buf = createBuffer(binText.length*pieceCount);
  
        setTimeout(nextCopyBinTextToBuffer, restIntervalMs);
      }
      catch (error) {
        callback(null, error);
      }
    }
  
    function nextCopyBinTextToBuffer() {
      try {
        log('nextCopyBinTextToBuffer:'+i+'...');
        var pieceLength = buf.length/pieceCount;
        copyBinTextToBuffer(binText, buf, i*pieceLength, pieceLength);
        i++;
  
        if (i<pieceCount) {
          setTimeout(nextGetBase64, restIntervalMs);
        }
        else {
          log('mscorlib.dll['+buf.length+'/'+pieceCount+'] completed');
          callback(buf, null);
        }
      }
      catch (error) {
        callback(null, error);
      }
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
    if (window.atob && false) {
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
          var bc: any = 0, bs: any, buffer: any, idx: any = 0, output: any = '';
          // get next character
          buffer = input.charAt(idx++);
          // character found in table? initialize bit storage and add its ascii value;
          ~buffer && (bs = bc % 4 ? <any>(bs * 64) + buffer : buffer,
            // and if not first of each 4 characters,
            // convert the first 8 bits to one ascii character
            <any>(bc++ % 4)) ? output += <any>String.fromCharCode(255 & bs >> (-2 * bc & 6)) : <any>0
        ) {
          // try to find character in table (0-63, not found => -1)
          buffer = chars.indexOf(buffer);
        }
        return output;
      };
    }
  }

}