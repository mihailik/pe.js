module pe.io {

  export function formatEnum(value, type): string {
    if (!value) {
      if (typeof value == "null")
        return "null";
      else if (typeof value == "undefined")
        return "undefined";
    }

    var textValue = null;

    if (type._map) {
      textValue = type._map[value];

      if (!type._map_fixed) {
        // fix for typescript bug
        for (var e in type) {
          var num = type[e];
          if (typeof num=="number")
            type._map[num] = e;
        }
        type._map_fixed = true;

        textValue = type._map[value];
      }
    }
    
    if (textValue == null) {
      if (typeof value == "number") {
        var enumValues = [];
        var accountedEnumValueMask = 0;
        var zeroName = null;
        for (var kvValueStr in type._map) {
          var kvValue;
          try { kvValue = Number(kvValueStr); }
          catch (errorConverting) { continue; }

          if (kvValue == 0) {
            zeroName = kvKey;
            continue;
          }

          var kvKey = type._map[kvValueStr];
          if (typeof kvValue != "number")
            continue;

          if ((value & kvValue) == kvValue) {
            enumValues.push(kvKey);
            accountedEnumValueMask = accountedEnumValueMask | kvValue;
          }
        }

        var spill = value & accountedEnumValueMask;
        if (!spill)
          enumValues.push("#" + spill.toString(16).toUpperCase() + "h");

        if (enumValues.length == 0) {
          if (zeroName)
            textValue = zeroName;
          else
            textValue = "0";
        }
        else {
          textValue = enumValues.join('|');
        }
      }
      else {
        textValue = "enum:" + value;
      }
    }

    return textValue;
  }
}