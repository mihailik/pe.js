module pe.io {

  var checkBufferReaderOverrideOnFirstCreation: boolean = false;

  export class BufferReader {
    public offset: number = 0;

    public sections: headers.AddressRangeMap[] = [];
    private _currentSectionIndex: number = 0;
    private _currentView: DataView = null;

    constructor(array: number[]);
    constructor(buffer: ArrayBuffer);
    constructor(view: DataView);
    constructor(view: any) {
      if (checkBufferReaderOverrideOnFirstCreation) {
        // whatever we discover, stick to it, don't repeat it again
        checkBufferReaderOverrideOnFirstCreation = false;

        var global = (function () { return this; })();
        if (!("DataView" in global)) {
          // the environment doesn't support DataView,
          // fall back on ArrayBuffer
          io.BufferReader = <any>ArrayReader;
          return new ArrayReader(view);
        }
      }

      if (!view)
        return;

      if ("getUint8" in view) {
        this._currentView = <DataView>view;
      }
      else if ("byteLength" in view) {
        this._currentView = new DataView(<ArrayBuffer>view);
      }
      else {
        var arrb = new ArrayBuffer(view.length);
        this._currentView = new DataView(arrb);
        for (var i = 0; i < view.length; i++) {
          this._currentView.setUint8(i, view[i]);
        }
      }
    }

    readByte(): number {
      var v = this._getView(1);
      var result = v.getUint8(this.offset);
      this.offset++;
      return result;
    }

    peekByte(): number {
      var v = this._getView(1);
      var result = v.getUint8(this.offset);
      return result;
    }

    readShort(): number {
      var v = this._getView(2);
      var result = v.getUint16(this.offset, true);
      this.offset += 2;
      return result;
    }

    readInt(): number {
      var v = this._getView(4);
      var result = v.getUint32(this.offset, true);
      this.offset += 4;
      return result;
    }

    readLong(): Long {
      var v = this._getView(8);
      var lo = v.getUint32(this.offset, true);
      var hi = v.getUint32(this.offset + 4, true);
      this.offset += 8;
      return new Long(lo, hi);
    }

    readBytes(length: number): Uint8Array {
      var v = this._getView(length);
      var result = new Uint8Array(
        v.buffer,
        v.byteOffset + this.offset,
        length);

      this.offset += length;
      return result;
    }

    readZeroFilledAscii(length: number) {
      var v = this._getView(length);
      var chars = [];

      for (var i = 0; i < length; i++) {
        var charCode = v.getUint8(this.offset + i);

        if (charCode == 0)
          continue;

        chars.push(String.fromCharCode(charCode));
      }

      this.offset += length;

      return chars.join("");
    }

    readAsciiZ(maxLength: number = 1024): string {
      var v = this._getView(length);
      
      var chars = [];

      var byteLength = 0;
      while (true) {
        var nextChar = v.getUint8(this.offset + chars.length);
        if (nextChar == 0) {
          byteLength = chars.length + 1;
          break;
        }

        chars.push(String.fromCharCode(nextChar));
        if (chars.length == maxLength) {
          byteLength = chars.length;
          break;
        }
      }

      this.offset += byteLength;

      return chars.join("");
    }

    readUtf8Z(maxLength: number): string {

      var v = this._getView(maxLength);
      
      var buffer = [];
      var isConversionRequired = false;

      for (var i = 0; !maxLength || i < maxLength; i++) {
        var b = v.getUint8(this.offset + i);

        if (b == 0) {
          i++;
          break;
        }

        buffer.push(hexUtf[b]);
        if (b >= 127)
          isConversionRequired = true;
      }

      this.offset += i;

      if (isConversionRequired)
        return decodeURIComponent(buffer.join(""));
      else
        return buffer.join("");
    }

    getVirtualOffset(): number {
      var result = this._tryMapToVirtual(this.offset);
      if (result <0)
        throw new Error("Cannot map current position into virtual address space.");
      return result;
    }

    setVirtualOffset(rva: number): void {
      if (this._currentSectionIndex >= 0
        && this._currentSectionIndex < this.sections.length) {
        var s = this.sections[this._currentSectionIndex];
        var relative = rva - s.virtualAddress;
        if (relative >= 0 && relative < s.size) {
          this.offset = relative + s.address;
          return;
        }
      }

      for (var i = 0; i < this.sections.length; i++) {
        var s = this.sections[i];
        var relative = rva - s.virtualAddress;
        if (relative >=0 && relative < s.size) {
          this._currentSectionIndex = i;
          this.offset = relative + s.address;
          return;
        }
      }

      throw new Error("Address 0x" + rva.toString(16).toUpperCase() + " is outside of virtual address space.");
    }

    private _getView(numBytes: number): DataView {
      return this._currentView;
    }


    private _tryMapToVirtual(offset: number): number {
      if (this._currentSectionIndex >= 0
        && this._currentSectionIndex < this.sections.length) {
        var s = this.sections[this._currentSectionIndex];
        var relative = offset - s.address;
        if (relative >=0 && relative < s.size)
          return relative + s.virtualAddress;
      }

      for (var i = 0; i < this.sections.length; i++) {
        var s = this.sections[i];
        var relative = offset - s.address;
        if (relative >=0 && relative < s.size) {
          this._currentSectionIndex = i;
          return relative + s.virtualAddress;
        }
      }

      return -1;
    }
  }

  export class ArrayReader extends BufferReader {
    public offset: number = 0;

    public sections: headers.AddressRangeMap[] = [];

    constructor(private _array: number[]) {
      super(null);
    }

    readByte(): number {
      var result = this._array[this.offset];
      this.offset++;
      return result;
    }

    peekByte(): number {
      var result = this._array[this.offset];
      return result;
    }

    readShort(): number {
      var result =
        this._array[this.offset] +
        (this._array[this.offset + 1] << 8);
      this.offset += 2;
      return result;
    }

    readInt(): number {
      var result =
        this._array[this.offset] +
        (this._array[this.offset + 1] << 8) +
        (this._array[this.offset + 2] << 16) +
        (this._array[this.offset + 3] * 0x1000000);
      this.offset += 4;
      return result;
    }

    readLong(): Long {
      var lo = this.readInt();
      var hi = this.readInt();
      return new Long(lo, hi);
    }

    readBytes(length: number): Uint8Array {
      var result = this._array.slice(this.offset, this.offset + length);
      this.offset += length;
      return <any>result;
    }

    readZeroFilledAscii(length: number) {
      var chars = [];

      for (var i = 0; i < length; i++) {
        var charCode = this._array[this.offset + i];

        if (charCode == 0)
          continue;

        chars.push(String.fromCharCode(charCode));
      }

      this.offset += length;

      return chars.join("");
    }

    readAsciiZ(maxLength: number = 1024): string {
      var chars = [];

      var byteLength = 0;
      while (true) {
        var nextChar = this._array[this.offset + chars.length];
        if (nextChar == 0) {
          byteLength = chars.length + 1;
          break;
        }

        chars.push(String.fromCharCode(nextChar));
        if (chars.length == maxLength) {
          byteLength = chars.length;
          break;
        }
      }

      this.offset += byteLength;

      return chars.join("");
    }

    readUtf8Z(maxLength: number): string {
      var buffer = "";
      var isConversionRequired = false;

      for (var i = 0; !maxLength || i < maxLength; i++) {
        var b = this._array[this.offset + i];

        if (b == 0) {
          i++;
          break;
        }

        if (b < 127) {
          buffer += String.fromCharCode(b);
        }
        else {
          isConversionRequired = true;
          buffer += "%";
          buffer += b.toString(16);
        }
      }

      this.offset += i;

      if (isConversionRequired)
        return decodeURIComponent(buffer);
      else
        return buffer;
    }

    getVirtualOffset(): number {
      var result = this._tryMapToVirtual2(this.offset);
      if (result <0)
        throw new Error("Cannot map current position into virtual address space.");
      return result;
    }

    setVirtualOffset(rva: number): void {
      if ((<any>this)._currentSectionIndex >= 0
        && (<any>this)._currentSectionIndex < this.sections.length) {
        var s = this.sections[(<any>this)._currentSectionIndex];
        var relative = rva - s.virtualAddress;
        if (relative >= 0 && relative < s.size) {
          this.offset = relative + s.address;
          return;
        }
      }

      for (var i = 0; i < this.sections.length; i++) {
        var s = this.sections[i];
        var relative = rva - s.virtualAddress;
        if (relative >=0 && relative < s.size) {
          (<any>this)._currentSectionIndex = i;
          this.offset = relative + s.address;
          return;
        }
      }

      throw new Error("Address is outside of virtual address space.");
    }

    private _tryMapToVirtual2(offset: number): number {
      if ((<any>this)._currentSectionIndex >= 0
        && (<any>this)._currentSectionIndex < this.sections.length) {
        var s = this.sections[(<any>this)._currentSectionIndex];
        var relative = offset - s.address;
        if (relative >=0 && relative < s.size)
          return relative + s.virtualAddress;
      }

      for (var i = 0; i < this.sections.length; i++) {
        var s = this.sections[i];
        var relative = offset - s.address;
        if (relative >=0 && relative < s.size) {
          (<any>this)._currentSectionIndex = i;
          return relative + s.virtualAddress;
        }
      }

      return -1;
    }
  }

  var hexUtf = (function () {
    var buf = [];
    for (var i = 0; i < 127; i++) {
      buf.push(String.fromCharCode(i));
    }
    for (var i = 127; i < 256; i++) {
      buf.push("%" + i.toString(16));
    }
    return buf;
  })();

  export function getFileBufferReader(
    file: File,
    onsuccess: (BufferReader) => void,
    onfailure: (Error) => void ) {
    
    var reader = new FileReader();
    
    reader.onerror = onfailure;
    reader.onloadend = () => {
      if (reader.readyState != 2) {
        onfailure(reader.error);
        return;
      }

      var result: BufferReader;

      try {
        var resultArrayBuffer: ArrayBuffer;
        resultArrayBuffer = reader.result;

        result = new BufferReader(resultArrayBuffer);
      }
      catch (error) {
        onfailure(error);
      }

      onsuccess(result);
    };

    reader.readAsArrayBuffer(file);
  }

  declare var VBArray;

  export function getUrlBufferReader(
    url: string,
    onsuccess: (BufferReader) => void,
    onfailure: (Error) => void ) {

    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    var requestLoadCompleteCalled = false;
    function requestLoadComplete() {
      if (requestLoadCompleteCalled)
        return;

      requestLoadCompleteCalled = true;

      var result: BufferReader;

      try {
        var response: ArrayBuffer = request.response;
        if (response) {
          var resultDataView = new DataView(response);
          result = new BufferReader(resultDataView);
        }
        else {
          var responseBody: number[] = new VBArray((<any>request).responseBody).toArray();
          var result = new BufferReader(<any>responseBody);
        }
      }
      catch (error) {
        onfailure(error);
        return;
      }

      onsuccess(result);
    };

    request.onerror = onfailure;
    request.onloadend = () => requestLoadComplete;
    request.onreadystatechange = () => {
      if (request.readyState == 4) {
        requestLoadComplete();
      }
    };

    request.send();
  }

}