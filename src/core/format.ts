module pe {

  /**
   * Convert enum value to string, considering the bit flags.
   */
  export function formatEnum(value, type): string {
    if (!value) {
      if (typeof value == "null")
        return "null";
      else if (typeof value == "undefined")
        return "undefined";
    }

    var textValue = type[value];
    if (textValue) return textValue;

    // find bit flags matching the provided value,
    // collect what bits are covered that way
    var enumValues = [];
    var accountedEnumValueMask = 0;

    for (var kvKey in type) {
      var kvValue = type[kvKey];
      if (typeof kvValue!=='number') continue;

      if (kvValue && (value & kvValue) === kvValue) {
        enumValues.push(kvKey);
        accountedEnumValueMask = accountedEnumValueMask | kvValue;
      }
    }

    // uncovered bits are taken as a hex literal
    var spill = value & ~accountedEnumValueMask;
    if (spill)
      enumValues.push("0x" + spill.toString(16).toUpperCase());

    textValue = enumValues.join(' | ');

    return textValue;
  }

  export function bytesToHex(bytes: Uint8Array): string {
    if (!bytes)
      return null;
    
    var result = "";
    for (var i = 0; i < bytes.length; i++) {
      var hex = bytes[i].toString(16).toUpperCase();
      if (hex.length==1)
        hex = "0" + hex;
      result += hex;
    }

    return result;
  }

}