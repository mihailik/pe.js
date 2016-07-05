module pe.managed.metadata {

  export function calcRequredBitCount(maxValue) {
    var bitMask = maxValue;
    var result = 0;

    while (bitMask != 0) {
      result++;
      bitMask >>= 1;
    }

    return result;
  }

}