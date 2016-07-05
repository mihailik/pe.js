module pe.app1 {

  export function formatHex(data) {
    if (!data && data !== 0)
      return '';

    var result = data.toString(16) + 'h';
    return result;
  }

  export function formatAddress(data) {
    return formatHex(data);
  }

  export function formatBytes(bytes: Uint8Array) {
    if (!bytes) return '';

    var result = [];
    for (var i = 0; i < bytes.length; i++) {
      var hh = bytes[i].toString(16);
      if (hh.length == 1)
        hh = '0' + hh;
      result.push(hh);
    }
    return result.join(' ');
  }

}