var monoCorlib: ArrayBuffer;

namespace tests {

  var strlist: string[] = <any>monoCorlib;
  var byteCount = 0;
  for (var i = 0; i < strlist.length; i++) {
    strlist[i] = atob(strlist[i]);
    byteCount += strlist[i].length;
  }

  var buffer: ArrayBuffer;;
  var binary: Uint8Array;
  if (typeof ArrayBuffer !== 'undefined' && typeof Uint8Array !== 'undefined') {
    buffer = new ArrayBuffer(byteCount);
   	binary = new Uint8Array(buffer);
  }
  else {
    buffer = <any>(binary = <any>[]);
  }

  var pos = 0;
  for (var i = 0; i < strlist.length; i++) {
    for (var j = 0; j < strlist[i].length; j++) {
      binary[pos] = strlist[i].charCodeAt(j);
      pos++;
    }
  }

  monoCorlib = buffer;


}