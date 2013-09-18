var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var pe;
(function (pe) {
    (function (io) {
        var Long = (function () {
            function Long(lo, hi) {
                this.lo = lo;
                this.hi = hi;
            }
            Long.prototype.toString = function () {
                var result;
                result = this.lo.toString(16);
                if(this.hi != 0) {
                    result = ("0000").substring(result.length) + result;
                    result = this.hi.toString(16) + result;
                }
                result = result.toUpperCase() + "h";
                return result;
            };
            return Long;
        })();
        io.Long = Long;        
        var AddressRange = (function () {
            function AddressRange(address, size) {
                this.address = address;
                this.size = size;
                if(!this.address) {
                    this.address = 0;
                }
                if(!this.size) {
                    this.size = 0;
                }
            }
            AddressRange.prototype.mapRelative = function (offset) {
                var result = offset - this.address;
                if(result >= 0 && result < this.size) {
                    return result;
                } else {
                    return -1;
                }
            };
            AddressRange.prototype.toString = function () {
                return this.address.toString(16).toUpperCase() + ":" + this.size.toString(16).toUpperCase() + "h";
            };
            return AddressRange;
        })();
        io.AddressRange = AddressRange;        
        var AddressRangeMap = (function (_super) {
            __extends(AddressRangeMap, _super);
            function AddressRangeMap(address, size, virtualAddress) {
                        _super.call(this, address, size);
                this.virtualAddress = virtualAddress;
                if(!this.virtualAddress) {
                    this.virtualAddress = 0;
                }
            }
            AddressRangeMap.prototype.toString = function () {
                return this.address.toString(16).toUpperCase() + ":" + this.size.toString(16).toUpperCase() + "@" + this.virtualAddress + "h";
            };
            return AddressRangeMap;
        })(AddressRange);
        io.AddressRangeMap = AddressRangeMap;        
        var checkBufferReaderOverrideOnFirstCreation = true;
        var hexUtf = (function () {
            var buf = [];
            for(var i = 0; i < 127; i++) {
                buf.push(String.fromCharCode(i));
            }
            for(var i = 127; i < 256; i++) {
                buf.push("%" + i.toString(16));
            }
            return buf;
        })();
        var BufferReader = (function () {
            function BufferReader(view) {
                this.offset = 0;
                this.sections = [];
                this._currentSectionIndex = 0;
                if(checkBufferReaderOverrideOnFirstCreation) {
                    checkBufferReaderOverrideOnFirstCreation = false;
                    var global = (function () {
                        return this;
                    })();
                    if(!("DataView" in global)) {
                        io.BufferReader = ArrayReader;
                        return new ArrayReader(view);
                    }
                }
                if(!view) {
                    return;
                }
                if("getUint8" in view) {
                    this._view = view;
                } else {
                    if("byteLength" in view) {
                        this._view = new DataView(view);
                    } else {
                        var arrb = new ArrayBuffer(view.length);
                        this._view = new DataView(arrb);
                        for(var i = 0; i < view.length; i++) {
                            this._view.setUint8(i, view[i]);
                        }
                    }
                }
            }
            BufferReader.prototype.readByte = function () {
                var result = this._view.getUint8(this.offset);
                this.offset++;
                return result;
            };
            BufferReader.prototype.peekByte = function () {
                var result = this._view.getUint8(this.offset);
                return result;
            };
            BufferReader.prototype.readShort = function () {
                var result = this._view.getUint16(this.offset, true);
                this.offset += 2;
                return result;
            };
            BufferReader.prototype.readInt = function () {
                var result = this._view.getUint32(this.offset, true);
                this.offset += 4;
                return result;
            };
            BufferReader.prototype.readLong = function () {
                var lo = this._view.getUint32(this.offset, true);
                var hi = this._view.getUint32(this.offset + 4, true);
                this.offset += 8;
                return new Long(lo, hi);
            };
            BufferReader.prototype.readBytes = function (length) {
                var result = new Uint8Array(this._view.buffer, this._view.byteOffset + this.offset, length);
                this.offset += length;
                return result;
            };
            BufferReader.prototype.readZeroFilledAscii = function (length) {
                var chars = [];
                for(var i = 0; i < length; i++) {
                    var charCode = this._view.getUint8(this.offset + i);
                    if(charCode == 0) {
                        continue;
                    }
                    chars.push(String.fromCharCode(charCode));
                }
                this.offset += length;
                return chars.join("");
            };
            BufferReader.prototype.readAsciiZ = function (maxLength) {
                if (typeof maxLength === "undefined") { maxLength = 1024; }
                var chars = [];
                var byteLength = 0;
                while(true) {
                    var nextChar = this._view.getUint8(this.offset + chars.length);
                    if(nextChar == 0) {
                        byteLength = chars.length + 1;
                        break;
                    }
                    chars.push(String.fromCharCode(nextChar));
                    if(chars.length == maxLength) {
                        byteLength = chars.length;
                        break;
                    }
                }
                this.offset += byteLength;
                return chars.join("");
            };
            BufferReader.prototype.readUtf8Z = function (maxLength) {
                var buffer = [];
                var isConversionRequired = false;
                for(var i = 0; !maxLength || i < maxLength; i++) {
                    var b = this._view.getUint8(this.offset + i);
                    if(b == 0) {
                        i++;
                        break;
                    }
                    buffer.push(hexUtf[b]);
                    if(b >= 127) {
                        isConversionRequired = true;
                    }
                }
                this.offset += i;
                if(isConversionRequired) {
                    return decodeURIComponent(buffer.join(""));
                } else {
                    return buffer.join("");
                }
            };
            BufferReader.prototype.getVirtualOffset = function () {
                var result = this.tryMapToVirtual(this.offset);
                if(result < 0) {
                    throw new Error("Cannot map current position into virtual address space.");
                }
                return result;
            };
            BufferReader.prototype.setVirtualOffset = function (rva) {
                if(this._currentSectionIndex >= 0 && this._currentSectionIndex < this.sections.length) {
                    var s = this.sections[this._currentSectionIndex];
                    var relative = rva - s.virtualAddress;
                    if(relative >= 0 && relative < s.size) {
                        this.offset = relative + s.address;
                        return;
                    }
                }
                for(var i = 0; i < this.sections.length; i++) {
                    var s = this.sections[i];
                    var relative = rva - s.virtualAddress;
                    if(relative >= 0 && relative < s.size) {
                        this._currentSectionIndex = i;
                        this.offset = relative + s.address;
                        return;
                    }
                }
                throw new Error("Address 0x" + rva.toString(16).toUpperCase() + " is outside of virtual address space.");
            };
            BufferReader.prototype.tryMapToVirtual = function (offset) {
                if(this._currentSectionIndex >= 0 && this._currentSectionIndex < this.sections.length) {
                    var s = this.sections[this._currentSectionIndex];
                    var relative = offset - s.address;
                    if(relative >= 0 && relative < s.size) {
                        return relative + s.virtualAddress;
                    }
                }
                for(var i = 0; i < this.sections.length; i++) {
                    var s = this.sections[i];
                    var relative = offset - s.address;
                    if(relative >= 0 && relative < s.size) {
                        this._currentSectionIndex = i;
                        return relative + s.virtualAddress;
                    }
                }
                return -1;
            };
            return BufferReader;
        })();
        io.BufferReader = BufferReader;        
        var ArrayReader = (function (_super) {
            __extends(ArrayReader, _super);
            function ArrayReader(_array) {
                        _super.call(this, null);
                this._array = _array;
                this.offset = 0;
                this.sections = [];
                this._currentSectionIndex = 0;
            }
            ArrayReader.prototype.readByte = function () {
                var result = this._array[this.offset];
                this.offset++;
                return result;
            };
            ArrayReader.prototype.peekByte = function () {
                var result = this._array[this.offset];
                return result;
            };
            ArrayReader.prototype.readShort = function () {
                var result = this._array[this.offset] + (this._array[this.offset + 1] << 8);
                this.offset += 2;
                return result;
            };
            ArrayReader.prototype.readInt = function () {
                var result = this._array[this.offset] + (this._array[this.offset + 1] << 8) + (this._array[this.offset + 2] << 16) + (this._array[this.offset + 3] * 16777216);
                this.offset += 4;
                return result;
            };
            ArrayReader.prototype.readLong = function () {
                var lo = this.readInt();
                var hi = this.readInt();
                return new Long(lo, hi);
            };
            ArrayReader.prototype.readBytes = function (length) {
                var result = this._array.slice(this.offset, this.offset + length);
                this.offset += length;
                return result;
            };
            ArrayReader.prototype.readZeroFilledAscii = function (length) {
                var chars = [];
                for(var i = 0; i < length; i++) {
                    var charCode = this._array[this.offset + i];
                    if(charCode == 0) {
                        continue;
                    }
                    chars.push(String.fromCharCode(charCode));
                }
                this.offset += length;
                return chars.join("");
            };
            ArrayReader.prototype.readAsciiZ = function (maxLength) {
                if (typeof maxLength === "undefined") { maxLength = 1024; }
                var chars = [];
                var byteLength = 0;
                while(true) {
                    var nextChar = this._array[this.offset + chars.length];
                    if(nextChar == 0) {
                        byteLength = chars.length + 1;
                        break;
                    }
                    chars.push(String.fromCharCode(nextChar));
                    if(chars.length == maxLength) {
                        byteLength = chars.length;
                        break;
                    }
                }
                this.offset += byteLength;
                return chars.join("");
            };
            ArrayReader.prototype.readUtf8Z = function (maxLength) {
                var buffer = "";
                var isConversionRequired = false;
                for(var i = 0; !maxLength || i < maxLength; i++) {
                    var b = this._array[this.offset + i];
                    if(b == 0) {
                        i++;
                        break;
                    }
                    if(b < 127) {
                        buffer += String.fromCharCode(b);
                    } else {
                        isConversionRequired = true;
                        buffer += "%";
                        buffer += b.toString(16);
                    }
                }
                this.offset += i;
                if(isConversionRequired) {
                    return decodeURIComponent(buffer);
                } else {
                    return buffer;
                }
            };
            ArrayReader.prototype.getVirtualOffset = function () {
                var result = this.tryMapToVirtual(this.offset);
                if(result < 0) {
                    throw new Error("Cannot map current position into virtual address space.");
                }
                return result;
            };
            ArrayReader.prototype.setVirtualOffset = function (rva) {
                if(this._currentSectionIndex >= 0 && this._currentSectionIndex < this.sections.length) {
                    var s = this.sections[this._currentSectionIndex];
                    var relative = rva - s.virtualAddress;
                    if(relative >= 0 && relative < s.size) {
                        this.offset = relative + s.address;
                        return;
                    }
                }
                for(var i = 0; i < this.sections.length; i++) {
                    var s = this.sections[i];
                    var relative = rva - s.virtualAddress;
                    if(relative >= 0 && relative < s.size) {
                        this._currentSectionIndex = i;
                        this.offset = relative + s.address;
                        return;
                    }
                }
                throw new Error("Address is outside of virtual address space.");
            };
            ArrayReader.prototype.tryMapToVirtual = function (offset) {
                if(this._currentSectionIndex >= 0 && this._currentSectionIndex < this.sections.length) {
                    var s = this.sections[this._currentSectionIndex];
                    var relative = offset - s.address;
                    if(relative >= 0 && relative < s.size) {
                        return relative + s.virtualAddress;
                    }
                }
                for(var i = 0; i < this.sections.length; i++) {
                    var s = this.sections[i];
                    var relative = offset - s.address;
                    if(relative >= 0 && relative < s.size) {
                        this._currentSectionIndex = i;
                        return relative + s.virtualAddress;
                    }
                }
                return -1;
            };
            return ArrayReader;
        })(BufferReader);
        io.ArrayReader = ArrayReader;        
        function getFileBufferReader(file, onsuccess, onfailure) {
            var reader = new FileReader();
            reader.onerror = onfailure;
            reader.onloadend = function () {
                if(reader.readyState != 2) {
                    onfailure(reader.error);
                    return;
                }
                var result;
                try  {
                    var resultArrayBuffer;
                    resultArrayBuffer = reader.result;
                    result = new BufferReader(resultArrayBuffer);
                } catch (error) {
                    onfailure(error);
                }
                onsuccess(result);
            };
            reader.readAsArrayBuffer(file);
        }
        io.getFileBufferReader = getFileBufferReader;
        function getUrlBufferReader(url, onsuccess, onfailure) {
            var request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.responseType = "arraybuffer";
            var requestLoadCompleteCalled = false;
            function requestLoadComplete() {
                if(requestLoadCompleteCalled) {
                    return;
                }
                requestLoadCompleteCalled = true;
                var result;
                try  {
                    var response = request.response;
                    if(response) {
                        var resultDataView = new DataView(response);
                        result = new BufferReader(resultDataView);
                    } else {
                        var responseBody = new VBArray(request.responseBody).toArray();
                        var result = new BufferReader(responseBody);
                    }
                } catch (error) {
                    onfailure(error);
                    return;
                }
                onsuccess(result);
            }
            ; ;
            request.onerror = onfailure;
            request.onloadend = function () {
                return requestLoadComplete;
            };
            request.onreadystatechange = function () {
                if(request.readyState == 4) {
                    requestLoadComplete();
                }
            };
            request.send();
        }
        io.getUrlBufferReader = getUrlBufferReader;
        function bytesToHex(bytes) {
            if(!bytes) {
                return null;
            }
            var result = "";
            for(var i = 0; i < bytes.length; i++) {
                var hex = bytes[i].toString(16).toUpperCase();
                if(hex.length == 1) {
                    hex = "0" + hex;
                }
                result += hex;
            }
            return result;
        }
        io.bytesToHex = bytesToHex;
        function formatEnum(value, type) {
            if(!value) {
                if(typeof value == "null") {
                    return "null";
                } else {
                    if(typeof value == "undefined") {
                        return "undefined";
                    }
                }
            }
            var textValue = null;
            if(type._map) {
                textValue = type._map[value];
                if(!type._map_fixed) {
                    for(var e in type) {
                        var num = type[e];
                        if(typeof num == "number") {
                            type._map[num] = e;
                        }
                    }
                    type._map_fixed = true;
                    textValue = type._map[value];
                }
            }
            if(textValue == null) {
                if(typeof value == "number") {
                    var enumValues = [];
                    var accountedEnumValueMask = 0;
                    var zeroName = null;
                    for(var kvValueStr in type._map) {
                        var kvValue;
                        try  {
                            kvValue = Number(kvValueStr);
                        } catch (errorConverting) {
                            continue;
                        }
                        if(kvValue == 0) {
                            zeroName = kvKey;
                            continue;
                        }
                        var kvKey = type._map[kvValueStr];
                        if(typeof kvValue != "number") {
                            continue;
                        }
                        if((value & kvValue) == kvValue) {
                            enumValues.push(kvKey);
                            accountedEnumValueMask = accountedEnumValueMask | kvValue;
                        }
                    }
                    var spill = value & accountedEnumValueMask;
                    if(!spill) {
                        enumValues.push("#" + spill.toString(16).toUpperCase() + "h");
                    }
                    if(enumValues.length == 0) {
                        if(zeroName) {
                            textValue = zeroName;
                        } else {
                            textValue = "0";
                        }
                    } else {
                        textValue = enumValues.join('|');
                    }
                } else {
                    textValue = "enum:" + value;
                }
            }
            return textValue;
        }
        io.formatEnum = formatEnum;
    })(pe.io || (pe.io = {}));
    var io = pe.io;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (headers) {
        var PEFileHeaders = (function () {
            function PEFileHeaders() {
                this.dosHeader = new DosHeader();
                this.peHeader = new PEHeader();
                this.optionalHeader = new OptionalHeader();
                this.sectionHeaders = [];
            }
            PEFileHeaders.prototype.toString = function () {
                var result = "dosHeader: " + (this.dosHeader ? this.dosHeader + "" : "null") + " " + "dosStub: " + (this.dosStub ? "[" + this.dosStub.length + "]" : "null") + " " + "peHeader: " + (this.peHeader ? "[" + this.peHeader.machine + "]" : "null") + " " + "optionalHeader: " + (this.optionalHeader ? "[" + pe.io.formatEnum(this.optionalHeader.subsystem, Subsystem) + "," + this.optionalHeader.imageVersion + "]" : "null") + " " + "sectionHeaders: " + (this.sectionHeaders ? "[" + this.sectionHeaders.length + "]" : "null");
                return result;
            };
            PEFileHeaders.prototype.read = function (reader) {
                var dosHeaderSize = 64;
                if(!this.dosHeader) {
                    this.dosHeader = new DosHeader();
                }
                this.dosHeader.read(reader);
                var dosHeaderLength = this.dosHeader.lfanew - dosHeaderSize;
                if(dosHeaderLength > 0) {
                    this.dosStub = reader.readBytes(dosHeaderLength);
                } else {
                    this.dosStub = null;
                }
                if(!this.peHeader) {
                    this.peHeader = new PEHeader();
                }
                this.peHeader.read(reader);
                if(!this.optionalHeader) {
                    this.optionalHeader = new OptionalHeader();
                }
                this.optionalHeader.read(reader);
                if(this.peHeader.numberOfSections > 0) {
                    if(!this.sectionHeaders || this.sectionHeaders.length != this.peHeader.numberOfSections) {
                        this.sectionHeaders = Array(this.peHeader.numberOfSections);
                    }
                    for(var i = 0; i < this.sectionHeaders.length; i++) {
                        if(!this.sectionHeaders[i]) {
                            this.sectionHeaders[i] = new SectionHeader();
                        }
                        this.sectionHeaders[i].read(reader);
                    }
                }
            };
            return PEFileHeaders;
        })();
        headers.PEFileHeaders = PEFileHeaders;        
        var DosHeader = (function () {
            function DosHeader() {
                this.mz = MZSignature.MZ;
                this.cblp = 144;
                this.cp = 3;
                this.crlc = 0;
                this.cparhdr = 4;
                this.minalloc = 0;
                this.maxalloc = 65535;
                this.ss = 0;
                this.sp = 184;
                this.csum = 0;
                this.ip = 0;
                this.cs = 0;
                this.lfarlc = 64;
                this.ovno = 0;
                this.res1 = new pe.io.Long(0, 0);
                this.oemid = 0;
                this.oeminfo = 0;
                this.reserved = [
                    0, 
                    0, 
                    0, 
                    0, 
                    0
                ];
                this.lfanew = 0;
            }
            DosHeader.prototype.toString = function () {
                var result = "[" + (this.mz === MZSignature.MZ ? "MZ" : typeof this.mz === "number" ? (this.mz).toString(16).toUpperCase() + "h" : typeof this.mz) + "]" + ".lfanew=" + (typeof this.lfanew === "number" ? this.lfanew.toString(16).toUpperCase() + "h" : typeof this.lfanew);
                return result;
            };
            DosHeader.prototype.read = function (reader) {
                this.mz = reader.readShort();
                if(this.mz != MZSignature.MZ) {
                    throw new Error("MZ signature is invalid: " + ((this.mz)).toString(16).toUpperCase() + "h.");
                }
                this.cblp = reader.readShort();
                this.cp = reader.readShort();
                this.crlc = reader.readShort();
                this.cparhdr = reader.readShort();
                this.minalloc = reader.readShort();
                this.maxalloc = reader.readShort();
                this.ss = reader.readShort();
                this.sp = reader.readShort();
                this.csum = reader.readShort();
                this.ip = reader.readShort();
                this.cs = reader.readShort();
                this.lfarlc = reader.readShort();
                this.ovno = reader.readShort();
                this.res1 = reader.readLong();
                this.oemid = reader.readShort();
                this.oeminfo = reader.readShort();
                if(!this.reserved) {
                    this.reserved = [];
                }
                for(var i = 0; i < 5; i++) {
                    this.reserved[i] = reader.readInt();
                }
                this.reserved.length = 5;
                this.lfanew = reader.readInt();
            };
            return DosHeader;
        })();
        headers.DosHeader = DosHeader;        
        (function (MZSignature) {
            MZSignature._map = [];
            MZSignature.MZ = "M".charCodeAt(0) + ("Z".charCodeAt(0) << 8);
        })(headers.MZSignature || (headers.MZSignature = {}));
        var MZSignature = headers.MZSignature;
        var PEHeader = (function () {
            function PEHeader() {
                this.pe = PESignature.PE;
                this.machine = Machine.I386;
                this.numberOfSections = 0;
                this.timestamp = new Date(0);
                this.pointerToSymbolTable = 0;
                this.numberOfSymbols = 0;
                this.sizeOfOptionalHeader = 0;
                this.characteristics = ImageCharacteristics.Dll | ImageCharacteristics.Bit32Machine;
            }
            PEHeader.prototype.toString = function () {
                var result = pe.io.formatEnum(this.machine, Machine) + " " + pe.io.formatEnum(this.characteristics, ImageCharacteristics) + " " + "Sections[" + this.numberOfSections + "]";
                return result;
            };
            PEHeader.prototype.read = function (reader) {
                this.pe = reader.readInt();
                if(this.pe != PESignature.PE) {
                    throw new Error("PE signature is invalid: " + ((this.pe)).toString(16).toUpperCase() + "h.");
                }
                this.machine = reader.readShort();
                this.numberOfSections = reader.readShort();
                if(!this.timestamp) {
                    this.timestamp = new Date(0);
                }
                this.timestamp.setTime(reader.readInt() * 1000);
                this.pointerToSymbolTable = reader.readInt();
                this.numberOfSymbols = reader.readInt();
                this.sizeOfOptionalHeader = reader.readShort();
                this.characteristics = reader.readShort();
            };
            return PEHeader;
        })();
        headers.PEHeader = PEHeader;        
        (function (PESignature) {
            PESignature._map = [];
            PESignature.PE = "P".charCodeAt(0) + ("E".charCodeAt(0) << 8);
        })(headers.PESignature || (headers.PESignature = {}));
        var PESignature = headers.PESignature;
        (function (Machine) {
            Machine._map = [];
            Machine.Unknown = 0;
            Machine.I386 = 332;
            Machine.R3000 = 354;
            Machine.R4000 = 358;
            Machine.R10000 = 360;
            Machine.WCEMIPSV2 = 361;
            Machine.Alpha = 388;
            Machine.SH3 = 418;
            Machine.SH3DSP = 419;
            Machine.SH3E = 420;
            Machine.SH4 = 422;
            Machine.SH5 = 424;
            Machine.ARM = 448;
            Machine.Thumb = 450;
            Machine.AM33 = 467;
            Machine.PowerPC = 496;
            Machine.PowerPCFP = 497;
            Machine.IA64 = 512;
            Machine.MIPS16 = 614;
            Machine.Alpha64 = 644;
            Machine.MIPSFPU = 870;
            Machine.MIPSFPU16 = 1126;
            Machine.AXP64 = Machine.Alpha64;
            Machine.Tricore = 1312;
            Machine.CEF = 3311;
            Machine.EBC = 3772;
            Machine.AMD64 = 34404;
            Machine.M32R = 36929;
            Machine.CEE = 49390;
        })(headers.Machine || (headers.Machine = {}));
        var Machine = headers.Machine;
        (function (ImageCharacteristics) {
            ImageCharacteristics._map = [];
            ImageCharacteristics.RelocsStripped = 1;
            ImageCharacteristics.ExecutableImage = 2;
            ImageCharacteristics.LineNumsStripped = 4;
            ImageCharacteristics.LocalSymsStripped = 8;
            ImageCharacteristics.AggressiveWsTrim = 16;
            ImageCharacteristics.LargeAddressAware = 32;
            ImageCharacteristics.BytesReversedLo = 128;
            ImageCharacteristics.Bit32Machine = 256;
            ImageCharacteristics.DebugStripped = 512;
            ImageCharacteristics.RemovableRunFromSwap = 1024;
            ImageCharacteristics.NetRunFromSwap = 2048;
            ImageCharacteristics.System = 4096;
            ImageCharacteristics.Dll = 8192;
            ImageCharacteristics.UpSystemOnly = 16384;
            ImageCharacteristics.BytesReversedHi = 32768;
        })(headers.ImageCharacteristics || (headers.ImageCharacteristics = {}));
        var ImageCharacteristics = headers.ImageCharacteristics;
        var OptionalHeader = (function () {
            function OptionalHeader() {
                this.peMagic = PEMagic.NT32;
                this.linkerVersion = "";
                this.sizeOfCode = 0;
                this.sizeOfInitializedData = 0;
                this.sizeOfUninitializedData = 0;
                this.addressOfEntryPoint = 0;
                this.baseOfCode = 8192;
                this.baseOfData = 16384;
                this.imageBase = 16384;
                this.sectionAlignment = 8192;
                this.fileAlignment = 512;
                this.operatingSystemVersion = "";
                this.imageVersion = "";
                this.subsystemVersion = "";
                this.win32VersionValue = 0;
                this.sizeOfImage = 0;
                this.sizeOfHeaders = 0;
                this.checkSum = 0;
                this.subsystem = Subsystem.WindowsCUI;
                this.dllCharacteristics = DllCharacteristics.NxCompatible;
                this.sizeOfStackReserve = 1048576;
                this.sizeOfStackCommit = 4096;
                this.sizeOfHeapReserve = 1048576;
                this.sizeOfHeapCommit = 4096;
                this.loaderFlags = 0;
                this.numberOfRvaAndSizes = 16;
                this.dataDirectories = [];
            }
            OptionalHeader.prototype.toString = function () {
                var result = [];
                var peMagicText = pe.io.formatEnum(this.peMagic, PEMagic);
                if(peMagicText) {
                    result.push(peMagicText);
                }
                var subsystemText = pe.io.formatEnum(this.subsystem, Subsystem);
                if(subsystemText) {
                    result.push(subsystemText);
                }
                var dllCharacteristicsText = pe.io.formatEnum(this.dllCharacteristics, DllCharacteristics);
                if(dllCharacteristicsText) {
                    result.push(dllCharacteristicsText);
                }
                var nonzeroDataDirectoriesText = [];
                if(this.dataDirectories) {
                    for(var i = 0; i < this.dataDirectories.length; i++) {
                        if(!this.dataDirectories[i] || this.dataDirectories[i].size <= 0) {
                            continue;
                        }
                        var kind = pe.io.formatEnum(i, DataDirectoryKind);
                        nonzeroDataDirectoriesText.push(kind);
                    }
                }
                result.push("dataDirectories[" + nonzeroDataDirectoriesText.join(",") + "]");
                var resultText = result.join(" ");
                return resultText;
            };
            OptionalHeader.prototype.read = function (reader) {
                this.peMagic = reader.readShort();
                if(this.peMagic != PEMagic.NT32 && this.peMagic != PEMagic.NT64) {
                    throw Error("Unsupported PE magic value " + (this.peMagic).toString(16).toUpperCase() + "h.");
                }
                this.linkerVersion = reader.readByte() + "." + reader.readByte();
                this.sizeOfCode = reader.readInt();
                this.sizeOfInitializedData = reader.readInt();
                this.sizeOfUninitializedData = reader.readInt();
                this.addressOfEntryPoint = reader.readInt();
                this.baseOfCode = reader.readInt();
                if(this.peMagic == PEMagic.NT32) {
                    this.baseOfData = reader.readInt();
                    this.imageBase = reader.readInt();
                } else {
                    this.imageBase = reader.readLong();
                }
                this.sectionAlignment = reader.readInt();
                this.fileAlignment = reader.readInt();
                this.operatingSystemVersion = reader.readShort() + "." + reader.readShort();
                this.imageVersion = reader.readShort() + "." + reader.readShort();
                this.subsystemVersion = reader.readShort() + "." + reader.readShort();
                this.win32VersionValue = reader.readInt();
                this.sizeOfImage = reader.readInt();
                this.sizeOfHeaders = reader.readInt();
                this.checkSum = reader.readInt();
                this.subsystem = reader.readShort();
                this.dllCharacteristics = reader.readShort();
                if(this.peMagic == PEMagic.NT32) {
                    this.sizeOfStackReserve = reader.readInt();
                    this.sizeOfStackCommit = reader.readInt();
                    this.sizeOfHeapReserve = reader.readInt();
                    this.sizeOfHeapCommit = reader.readInt();
                } else {
                    this.sizeOfStackReserve = reader.readLong();
                    this.sizeOfStackCommit = reader.readLong();
                    this.sizeOfHeapReserve = reader.readLong();
                    this.sizeOfHeapCommit = reader.readLong();
                }
                this.loaderFlags = reader.readInt();
                this.numberOfRvaAndSizes = reader.readInt();
                if(this.dataDirectories == null || this.dataDirectories.length != this.numberOfRvaAndSizes) {
                    this.dataDirectories = (Array(this.numberOfRvaAndSizes));
                }
                for(var i = 0; i < this.numberOfRvaAndSizes; i++) {
                    if(this.dataDirectories[i]) {
                        this.dataDirectories[i].address = reader.readInt();
                        this.dataDirectories[i].size = reader.readInt();
                    } else {
                        this.dataDirectories[i] = new pe.io.AddressRange(reader.readInt(), reader.readInt());
                    }
                }
            };
            return OptionalHeader;
        })();
        headers.OptionalHeader = OptionalHeader;        
        (function (PEMagic) {
            PEMagic._map = [];
            PEMagic.NT32 = 267;
            PEMagic.NT64 = 523;
            PEMagic.ROM = 263;
        })(headers.PEMagic || (headers.PEMagic = {}));
        var PEMagic = headers.PEMagic;
        (function (Subsystem) {
            Subsystem._map = [];
            Subsystem.Unknown = 0;
            Subsystem.Native = 1;
            Subsystem.WindowsGUI = 2;
            Subsystem.WindowsCUI = 3;
            Subsystem.OS2CUI = 5;
            Subsystem.POSIXCUI = 7;
            Subsystem.NativeWindows = 8;
            Subsystem.WindowsCEGUI = 9;
            Subsystem.EFIApplication = 10;
            Subsystem.EFIBootServiceDriver = 11;
            Subsystem.EFIRuntimeDriver = 12;
            Subsystem.EFIROM = 13;
            Subsystem.XBOX = 14;
            Subsystem.BootApplication = 16;
        })(headers.Subsystem || (headers.Subsystem = {}));
        var Subsystem = headers.Subsystem;
        (function (DllCharacteristics) {
            DllCharacteristics._map = [];
            DllCharacteristics.ProcessInit = 1;
            DllCharacteristics.ProcessTerm = 2;
            DllCharacteristics.ThreadInit = 4;
            DllCharacteristics.ThreadTerm = 8;
            DllCharacteristics.DynamicBase = 64;
            DllCharacteristics.ForceIntegrity = 128;
            DllCharacteristics.NxCompatible = 256;
            DllCharacteristics.NoIsolation = 512;
            DllCharacteristics.NoSEH = 1024;
            DllCharacteristics.NoBind = 2048;
            DllCharacteristics.AppContainer = 4096;
            DllCharacteristics.WdmDriver = 8192;
            DllCharacteristics.Reserved = 16384;
            DllCharacteristics.TerminalServerAware = 32768;
        })(headers.DllCharacteristics || (headers.DllCharacteristics = {}));
        var DllCharacteristics = headers.DllCharacteristics;
        (function (DataDirectoryKind) {
            DataDirectoryKind._map = [];
            DataDirectoryKind.ExportSymbols = 0;
            DataDirectoryKind.ImportSymbols = 1;
            DataDirectoryKind.Resources = 2;
            DataDirectoryKind.Exception = 3;
            DataDirectoryKind.Security = 4;
            DataDirectoryKind.BaseRelocation = 5;
            DataDirectoryKind.Debug = 6;
            DataDirectoryKind.CopyrightString = 7;
            DataDirectoryKind.Unknown = 8;
            DataDirectoryKind.ThreadLocalStorage = 9;
            DataDirectoryKind.LoadConfiguration = 10;
            DataDirectoryKind.BoundImport = 11;
            DataDirectoryKind.ImportAddressTable = 12;
            DataDirectoryKind.DelayImport = 13;
            DataDirectoryKind.Clr = 14;
        })(headers.DataDirectoryKind || (headers.DataDirectoryKind = {}));
        var DataDirectoryKind = headers.DataDirectoryKind;
        var SectionHeader = (function (_super) {
            __extends(SectionHeader, _super);
            function SectionHeader() {
                        _super.call(this);
                this.name = "";
                this.pointerToRelocations = 0;
                this.pointerToLinenumbers = 0;
                this.numberOfRelocations = 0;
                this.numberOfLinenumbers = 0;
                this.characteristics = SectionCharacteristics.ContainsCode;
            }
            SectionHeader.prototype.toString = function () {
                var result = this.name + " " + _super.prototype.toString.call(this);
                return result;
            };
            SectionHeader.prototype.read = function (reader) {
                this.name = reader.readZeroFilledAscii(8);
                this.virtualSize = reader.readInt();
                this.virtualAddress = reader.readInt();
                var sizeOfRawData = reader.readInt();
                var pointerToRawData = reader.readInt();
                this.size = sizeOfRawData;
                this.address = pointerToRawData;
                this.pointerToRelocations = reader.readInt();
                this.pointerToLinenumbers = reader.readInt();
                this.numberOfRelocations = reader.readShort();
                this.numberOfLinenumbers = reader.readShort();
                this.characteristics = reader.readInt();
            };
            return SectionHeader;
        })(pe.io.AddressRangeMap);
        headers.SectionHeader = SectionHeader;        
        (function (SectionCharacteristics) {
            SectionCharacteristics._map = [];
            SectionCharacteristics.Reserved_0h = 0;
            SectionCharacteristics.Reserved_1h = 1;
            SectionCharacteristics.Reserved_2h = 2;
            SectionCharacteristics.Reserved_4h = 4;
            SectionCharacteristics.NoPadding = 8;
            SectionCharacteristics.Reserved_10h = 16;
            SectionCharacteristics.ContainsCode = 32;
            SectionCharacteristics.ContainsInitializedData = 64;
            SectionCharacteristics.ContainsUninitializedData = 128;
            SectionCharacteristics.LinkerOther = 256;
            SectionCharacteristics.LinkerInfo = 512;
            SectionCharacteristics.Reserved_400h = 1024;
            SectionCharacteristics.LinkerRemove = 2048;
            SectionCharacteristics.LinkerCOMDAT = 4096;
            SectionCharacteristics.Reserved_2000h = 8192;
            SectionCharacteristics.NoDeferredSpeculativeExecution = 16384;
            SectionCharacteristics.GlobalPointerRelative = 32768;
            SectionCharacteristics.Reserved_10000h = 65536;
            SectionCharacteristics.MemoryPurgeable = 131072;
            SectionCharacteristics.MemoryLocked = 262144;
            SectionCharacteristics.MemoryPreload = 524288;
            SectionCharacteristics.Align1Bytes = 1048576;
            SectionCharacteristics.Align2Bytes = 2097152;
            SectionCharacteristics.Align4Bytes = 3145728;
            SectionCharacteristics.Align8Bytes = 4194304;
            SectionCharacteristics.Align16Bytes = 5242880;
            SectionCharacteristics.Align32Bytes = 6291456;
            SectionCharacteristics.Align64Bytes = 7340032;
            SectionCharacteristics.Align128Bytes = 8388608;
            SectionCharacteristics.Align256Bytes = 9437184;
            SectionCharacteristics.Align512Bytes = 10485760;
            SectionCharacteristics.Align1024Bytes = 11534336;
            SectionCharacteristics.Align2048Bytes = 12582912;
            SectionCharacteristics.Align4096Bytes = 13631488;
            SectionCharacteristics.Align8192Bytes = 14680064;
            SectionCharacteristics.LinkerRelocationOverflow = 16777216;
            SectionCharacteristics.MemoryDiscardable = 33554432;
            SectionCharacteristics.MemoryNotCached = 67108864;
            SectionCharacteristics.MemoryNotPaged = 134217728;
            SectionCharacteristics.MemoryShared = 268435456;
            SectionCharacteristics.MemoryExecute = 536870912;
            SectionCharacteristics.MemoryRead = 1073741824;
            SectionCharacteristics.MemoryWrite = 2147483648;
        })(headers.SectionCharacteristics || (headers.SectionCharacteristics = {}));
        var SectionCharacteristics = headers.SectionCharacteristics;
    })(pe.headers || (pe.headers = {}));
    var headers = pe.headers;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (unmanaged) {
        var DllExport = (function () {
            function DllExport() { }
            DllExport.readExports = function readExports(reader, range) {
                var result = [];
                result.flags = reader.readInt();
                if(!result.timestamp) {
                    result.timestamp = new Date(0);
                }
                result.timestamp.setTime(reader.readInt() * 1000);
                var majorVersion = reader.readShort();
                var minorVersion = reader.readShort();
                result.version = majorVersion + "." + minorVersion;
                var nameRva = reader.readInt();
                result.ordinalBase = reader.readInt();
                var addressTableEntries = reader.readInt();
                var numberOfNamePointers = reader.readInt();
                var exportAddressTableRva = reader.readInt();
                var namePointerRva = reader.readInt();
                var ordinalTableRva = reader.readInt();
                if(nameRva == 0) {
                    result.dllName = null;
                } else {
                    var saveOffset = reader.offset;
                    reader.setVirtualOffset(nameRva);
                    result.dllName = reader.readAsciiZ();
                    reader.offset = saveOffset;
                }
                result.length = addressTableEntries;
                for(var i = 0; i < addressTableEntries; i++) {
                    var exportEntry = new DllExport();
                    exportEntry.readExportEntry(reader, range);
                    exportEntry.ordinal = i + this.ordinalBase;
                    result[i] = exportEntry;
                }
                if(numberOfNamePointers != 0 && namePointerRva != 0 && ordinalTableRva != 0) {
                    saveOffset = reader.offset;
                    for(var i = 0; i < numberOfNamePointers; i++) {
                        reader.setVirtualOffset(ordinalTableRva + 2 * i);
                        var ordinal = reader.readShort();
                        reader.setVirtualOffset(namePointerRva + 4 * i);
                        var functionNameRva = reader.readInt();
                        var functionName;
                        if(functionNameRva == 0) {
                            functionName = null;
                        } else {
                            reader.setVirtualOffset(functionNameRva);
                            functionName = reader.readAsciiZ();
                        }
                        this.exports[ordinal].name = functionName;
                    }
                    reader.offset = saveOffset;
                }
                return result;
            }
            DllExport.prototype.readExportEntry = function (reader, range) {
                var exportOrForwarderRva = reader.readInt();
                if(range.mapRelative(exportOrForwarderRva) >= 0) {
                    this.exportRva = 0;
                    var forwarderRva = reader.readInt();
                    if(forwarderRva == 0) {
                        this.forwarder = null;
                    } else {
                        var saveOffset = reader.offset;
                        reader.setVirtualOffset(forwarderRva);
                        this.forwarder = reader.readAsciiZ();
                        reader.offset = saveOffset;
                    }
                } else {
                    this.exportRva = reader.readInt();
                    this.forwarder = null;
                }
                this.name = null;
            };
            return DllExport;
        })();
        unmanaged.DllExport = DllExport;        
        var DllImport = (function () {
            function DllImport() {
                this.name = "";
                this.ordinal = 0;
                this.dllName = "";
                this.timeDateStamp = new Date(0);
            }
            DllImport.read = function read(reader, result) {
                if(!result) {
                    result = [];
                }
                var readLength = 0;
                while(true) {
                    var originalFirstThunk = reader.readInt();
                    var timeDateStamp = new Date(0);
                    timeDateStamp.setTime(reader.readInt());
                    var forwarderChain = reader.readInt();
                    var nameRva = reader.readInt();
                    var firstThunk = reader.readInt();
                    var thunkAddressPosition = originalFirstThunk == 0 ? firstThunk : originalFirstThunk;
                    if(thunkAddressPosition == 0) {
                        break;
                    }
                    var saveOffset = reader.offset;
                    var libraryName;
                    if(nameRva === 0) {
                        libraryName = null;
                    } else {
                        reader.setVirtualOffset(nameRva);
                        libraryName = reader.readAsciiZ();
                    }
                    reader.setVirtualOffset(thunkAddressPosition);
                    while(true) {
                        var newEntry = result[readLength];
                        if(!newEntry) {
                            newEntry = new DllImport();
                            result[readLength] = newEntry;
                        }
                        if(!newEntry.readEntry(reader)) {
                            break;
                        }
                        newEntry.dllName = libraryName;
                        newEntry.timeDateStamp = timeDateStamp;
                        readLength++;
                    }
                    reader.offset = saveOffset;
                }
                result.length = readLength;
                return result;
            }
            DllImport.prototype.readEntry = function (reader) {
                var importPosition = reader.readInt();
                if(importPosition == 0) {
                    return false;
                }
                if(importPosition & (1 << 31)) {
                    this.ordinal = importPosition & 2147483647;
                    this.name = null;
                } else {
                    var saveOffset = reader.offset;
                    reader.setVirtualOffset(importPosition);
                    var hint = reader.readShort();
                    var fname = reader.readAsciiZ();
                    this.ordinal = hint;
                    this.name = fname;
                    reader.offset = saveOffset;
                }
                return true;
            };
            return DllImport;
        })();
        unmanaged.DllImport = DllImport;        
        var ResourceDirectory = (function () {
            function ResourceDirectory() {
                this.characteristics = 0;
                this.timestamp = new Date(0);
                this.version = "";
                this.subdirectories = [];
                this.dataEntries = [];
            }
            ResourceDirectory.prototype.toString = function () {
                return "subdirectories[" + (this.subdirectories ? this.subdirectories.length : "null") + "] " + "dataEntries[" + (this.dataEntries ? this.dataEntries.length : "null") + "]";
            };
            ResourceDirectory.prototype.read = function (reader) {
                var baseVirtualOffset = reader.getVirtualOffset();
                this.readCore(reader, baseVirtualOffset);
            };
            ResourceDirectory.prototype.readCore = function (reader, baseVirtualOffset) {
                this.characteristics = reader.readInt();
                if(!this.timestamp) {
                    this.timestamp = new Date(0);
                }
                this.timestamp.setTime(reader.readInt() * 1000);
                this.version = reader.readShort() + "." + reader.readShort();
                var nameEntryCount = reader.readShort();
                var idEntryCount = reader.readShort();
                var dataEntryCount = 0;
                var directoryEntryCount = 0;
                for(var i = 0; i < nameEntryCount + idEntryCount; i++) {
                    var idOrNameRva = reader.readInt();
                    var contentRva = reader.readInt();
                    var saveOffset = reader.offset;
                    var name;
                    var id;
                    var highBit = 2147483648;
                    if(idOrNameRva < highBit) {
                        id = idOrNameRva;
                        name = null;
                    } else {
                        id = 0;
                        reader.setVirtualOffset(baseVirtualOffset + idOrNameRva - highBit);
                        name = this.readName(reader);
                    }
                    if(contentRva < highBit) {
                        reader.setVirtualOffset(baseVirtualOffset + contentRva);
                        var dataEntry = this.dataEntries[dataEntryCount];
                        if(!dataEntry) {
                            this.dataEntries[dataEntryCount] = dataEntry = new ResourceDataEntry();
                        }
                        dataEntry.name = name;
                        dataEntry.integerId = id;
                        dataEntry.dataRva = reader.readInt();
                        dataEntry.size = reader.readInt();
                        dataEntry.codepage = reader.readInt();
                        dataEntry.reserved = reader.readInt();
                        dataEntryCount++;
                    } else {
                        contentRva = contentRva - highBit;
                        reader.setVirtualOffset(baseVirtualOffset + contentRva);
                        var directoryEntry = this.subdirectories[directoryEntryCount];
                        if(!directoryEntry) {
                            this.subdirectories[directoryEntryCount] = directoryEntry = new ResourceDirectoryEntry();
                        }
                        directoryEntry.name = name;
                        directoryEntry.integerId = id;
                        directoryEntry.directory = new ResourceDirectory();
                        directoryEntry.directory.readCore(reader, baseVirtualOffset);
                        directoryEntryCount++;
                    }
                }
                this.dataEntries.length = dataEntryCount;
                this.subdirectories.length = directoryEntryCount;
            };
            ResourceDirectory.prototype.readName = function (reader) {
                var length = reader.readShort();
                var result = "";
                for(var i = 0; i < length; i++) {
                    result += String.fromCharCode(reader.readShort());
                }
                return result;
            };
            return ResourceDirectory;
        })();
        unmanaged.ResourceDirectory = ResourceDirectory;        
        var ResourceDirectoryEntry = (function () {
            function ResourceDirectoryEntry() {
                this.name = "";
                this.integerId = 0;
                this.directory = new ResourceDirectory();
            }
            ResourceDirectoryEntry.prototype.toString = function () {
                return (this.name ? this.name + " " : "") + this.integerId + (this.directory ? "[" + (this.directory.dataEntries ? this.directory.dataEntries.length : 0) + (this.directory.subdirectories ? this.directory.subdirectories.length : 0) + "]" : "[null]");
            };
            return ResourceDirectoryEntry;
        })();
        unmanaged.ResourceDirectoryEntry = ResourceDirectoryEntry;        
        var ResourceDataEntry = (function () {
            function ResourceDataEntry() {
                this.name = "";
                this.integerId = 0;
                this.dataRva = 0;
                this.size = 0;
                this.codepage = 0;
                this.reserved = 0;
            }
            ResourceDataEntry.prototype.toString = function () {
                return (this.name ? this.name + " " : "") + this.integerId;
            };
            return ResourceDataEntry;
        })();
        unmanaged.ResourceDataEntry = ResourceDataEntry;        
    })(pe.unmanaged || (pe.unmanaged = {}));
    var unmanaged = pe.unmanaged;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed) {
        (function (ClrImageFlags) {
            ClrImageFlags._map = [];
            ClrImageFlags.ILOnly = 1;
            ClrImageFlags._32BitRequired = 2;
            ClrImageFlags.ILLibrary = 4;
            ClrImageFlags.StrongNameSigned = 8;
            ClrImageFlags.NativeEntryPoint = 16;
            ClrImageFlags.TrackDebugData = 65536;
            ClrImageFlags.IsIbcoptimized = 131072;
        })(managed.ClrImageFlags || (managed.ClrImageFlags = {}));
        var ClrImageFlags = managed.ClrImageFlags;
        (function (ClrMetadataSignature) {
            ClrMetadataSignature._map = [];
            ClrMetadataSignature.Signature = 1112167234;
        })(managed.ClrMetadataSignature || (managed.ClrMetadataSignature = {}));
        var ClrMetadataSignature = managed.ClrMetadataSignature;
        (function (AssemblyHashAlgorithm) {
            AssemblyHashAlgorithm._map = [];
            AssemblyHashAlgorithm.None = 0;
            AssemblyHashAlgorithm.Reserved = 32771;
            AssemblyHashAlgorithm.Sha1 = 32772;
        })(managed.AssemblyHashAlgorithm || (managed.AssemblyHashAlgorithm = {}));
        var AssemblyHashAlgorithm = managed.AssemblyHashAlgorithm;
        (function (AssemblyFlags) {
            AssemblyFlags._map = [];
            AssemblyFlags.PublicKey = 1;
            AssemblyFlags.Retargetable = 256;
            AssemblyFlags.DisableJITcompileOptimizer = 16384;
            AssemblyFlags.EnableJITcompileTracking = 32768;
        })(managed.AssemblyFlags || (managed.AssemblyFlags = {}));
        var AssemblyFlags = managed.AssemblyFlags;
        (function (ElementType) {
            ElementType._map = [];
            ElementType.End = 0;
            ElementType.Void = 1;
            ElementType.Boolean = 2;
            ElementType.Char = 3;
            ElementType.I1 = 4;
            ElementType.U1 = 5;
            ElementType.I2 = 6;
            ElementType.U2 = 7;
            ElementType.I4 = 8;
            ElementType.U4 = 9;
            ElementType.I8 = 10;
            ElementType.U8 = 11;
            ElementType.R4 = 12;
            ElementType.R8 = 13;
            ElementType.String = 14;
            ElementType.Ptr = 15;
            ElementType.ByRef = 16;
            ElementType.ValueType = 17;
            ElementType.Class = 18;
            ElementType.Var = 19;
            ElementType.Array = 20;
            ElementType.GenericInst = 21;
            ElementType.TypedByRef = 22;
            ElementType.I = 24;
            ElementType.U = 25;
            ElementType.FnPtr = 27;
            ElementType.Object = 28;
            ElementType.SZArray = 29;
            ElementType.MVar = 30;
            ElementType.CMod_ReqD = 31;
            ElementType.CMod_Opt = 32;
            ElementType.Internal = 33;
            ElementType.Modifier = 64;
            ElementType.Sentinel = 1 | ElementType.Modifier;
            ElementType.Pinned = 5 | ElementType.Modifier;
            ElementType.R4_Hfa = 6 | ElementType.Modifier;
            ElementType.R8_Hfa = 7 | ElementType.Modifier;
            ElementType.ArgumentType_ = 16 | ElementType.Modifier;
            ElementType.CustomAttribute_BoxedObject_ = 17 | ElementType.Modifier;
            ElementType.CustomAttribute_Field_ = 19 | ElementType.Modifier;
            ElementType.CustomAttribute_Property_ = 20 | ElementType.Modifier;
            ElementType.CustomAttribute_Enum_ = 85;
        })(managed.ElementType || (managed.ElementType = {}));
        var ElementType = managed.ElementType;
        (function (SecurityAction) {
            SecurityAction._map = [];
            SecurityAction.Assert = 3;
            SecurityAction.Demand = 2;
            SecurityAction.Deny = 4;
            SecurityAction.InheritanceDemand = 7;
            SecurityAction.LinkDemand = 6;
            SecurityAction.NonCasDemand = 0;
            SecurityAction.NonCasLinkDemand = 0;
            SecurityAction.PrejitGrant = 0;
            SecurityAction.PermitOnly = 5;
            SecurityAction.RequestMinimum = 8;
            SecurityAction.RequestOptional = 9;
            SecurityAction.RequestRefuse = 10;
        })(managed.SecurityAction || (managed.SecurityAction = {}));
        var SecurityAction = managed.SecurityAction;
        (function (EventAttributes) {
            EventAttributes._map = [];
            EventAttributes.SpecialName = 512;
            EventAttributes.RTSpecialName = 1024;
        })(managed.EventAttributes || (managed.EventAttributes = {}));
        var EventAttributes = managed.EventAttributes;
        (function (TypeAttributes) {
            TypeAttributes._map = [];
            TypeAttributes.VisibilityMask = 7;
            TypeAttributes.NotPublic = 0;
            TypeAttributes.Public = 1;
            TypeAttributes.NestedPublic = 2;
            TypeAttributes.NestedPrivate = 3;
            TypeAttributes.NestedFamily = 4;
            TypeAttributes.NestedAssembly = 5;
            TypeAttributes.NestedFamANDAssem = 6;
            TypeAttributes.NestedFamORAssem = 7;
            TypeAttributes.LayoutMask = 24;
            TypeAttributes.AutoLayout = 0;
            TypeAttributes.SequentialLayout = 8;
            TypeAttributes.ExplicitLayout = 16;
            TypeAttributes.ClassSemanticsMask = 32;
            TypeAttributes.Class = 0;
            TypeAttributes.Interface = 32;
            TypeAttributes.Abstract = 128;
            TypeAttributes.Sealed = 256;
            TypeAttributes.SpecialName = 1024;
            TypeAttributes.Import = 4096;
            TypeAttributes.Serializable = 8192;
            TypeAttributes.StringFormatMask = 196608;
            TypeAttributes.AnsiClass = 0;
            TypeAttributes.UnicodeClass = 65536;
            TypeAttributes.AutoClass = 131072;
            TypeAttributes.CustomFormatClass = 196608;
            TypeAttributes.CustomStringFormatMask = 12582912;
            TypeAttributes.BeforeFieldInit = 1048576;
            TypeAttributes.RTSpecialName = 2048;
            TypeAttributes.HasSecurity = 262144;
            TypeAttributes.IsTypeForwarder = 2097152;
        })(managed.TypeAttributes || (managed.TypeAttributes = {}));
        var TypeAttributes = managed.TypeAttributes;
        (function (FieldAttributes) {
            FieldAttributes._map = [];
            FieldAttributes.FieldAccessMask = 7;
            FieldAttributes.CompilerControlled = 0;
            FieldAttributes.Private = 1;
            FieldAttributes.FamANDAssem = 2;
            FieldAttributes.Assembly = 3;
            FieldAttributes.Family = 4;
            FieldAttributes.FamORAssem = 5;
            FieldAttributes.Public = 6;
            FieldAttributes.Static = 16;
            FieldAttributes.InitOnly = 32;
            FieldAttributes.Literal = 64;
            FieldAttributes.NotSerialized = 128;
            FieldAttributes.SpecialName = 512;
            FieldAttributes.PInvokeImpl = 8192;
            FieldAttributes.RTSpecialName = 1024;
            FieldAttributes.HasFieldMarshal = 4096;
            FieldAttributes.HasDefault = 32768;
            FieldAttributes.HasFieldRVA = 256;
        })(managed.FieldAttributes || (managed.FieldAttributes = {}));
        var FieldAttributes = managed.FieldAttributes;
        (function (FileAttributes) {
            FileAttributes._map = [];
            FileAttributes.ContainsMetaData = 0;
            FileAttributes.ContainsNoMetaData = 1;
        })(managed.FileAttributes || (managed.FileAttributes = {}));
        var FileAttributes = managed.FileAttributes;
        (function (GenericParamAttributes) {
            GenericParamAttributes._map = [];
            GenericParamAttributes.VarianceMask = 3;
            GenericParamAttributes.None = 0;
            GenericParamAttributes.Covariant = 1;
            GenericParamAttributes.Contravariant = 2;
            GenericParamAttributes.SpecialConstraintMask = 28;
            GenericParamAttributes.ReferenceTypeConstraint = 4;
            GenericParamAttributes.NotNullableValueTypeConstraint = 8;
            GenericParamAttributes.DefaultConstructorConstraint = 16;
        })(managed.GenericParamAttributes || (managed.GenericParamAttributes = {}));
        var GenericParamAttributes = managed.GenericParamAttributes;
        (function (PInvokeAttributes) {
            PInvokeAttributes._map = [];
            PInvokeAttributes.NoMangle = 1;
            PInvokeAttributes.CharSetMask = 6;
            PInvokeAttributes.CharSetNotSpec = 0;
            PInvokeAttributes.CharSetAnsi = 2;
            PInvokeAttributes.CharSetUnicode = 4;
            PInvokeAttributes.CharSetAuto = 6;
            PInvokeAttributes.SupportsLastError = 64;
            PInvokeAttributes.CallConvMask = 1792;
            PInvokeAttributes.CallConvPlatformapi = 256;
            PInvokeAttributes.CallConvCdecl = 512;
            PInvokeAttributes.CallConvStdcall = 768;
            PInvokeAttributes.CallConvThiscall = 1024;
            PInvokeAttributes.CallConvFastcall = 1280;
        })(managed.PInvokeAttributes || (managed.PInvokeAttributes = {}));
        var PInvokeAttributes = managed.PInvokeAttributes;
        (function (ManifestResourceAttributes) {
            ManifestResourceAttributes._map = [];
            ManifestResourceAttributes.VisibilityMask = 7;
            ManifestResourceAttributes.Public = 1;
            ManifestResourceAttributes.Private = 2;
        })(managed.ManifestResourceAttributes || (managed.ManifestResourceAttributes = {}));
        var ManifestResourceAttributes = managed.ManifestResourceAttributes;
        (function (MethodImplAttributes) {
            MethodImplAttributes._map = [];
            MethodImplAttributes.CodeTypeMask = 3;
            MethodImplAttributes.IL = 0;
            MethodImplAttributes.Native = 1;
            MethodImplAttributes.OPTIL = 2;
            MethodImplAttributes.Runtime = 3;
            MethodImplAttributes.ManagedMask = 4;
            MethodImplAttributes.Unmanaged = 4;
            MethodImplAttributes.Managed = 0;
            MethodImplAttributes.ForwardRef = 16;
            MethodImplAttributes.PreserveSig = 128;
            MethodImplAttributes.InternalCall = 4096;
            MethodImplAttributes.Synchronized = 32;
            MethodImplAttributes.NoInlining = 8;
            MethodImplAttributes.MaxMethodImplVal = 65535;
            MethodImplAttributes.NoOptimization = 64;
        })(managed.MethodImplAttributes || (managed.MethodImplAttributes = {}));
        var MethodImplAttributes = managed.MethodImplAttributes;
        (function (MethodAttributes) {
            MethodAttributes._map = [];
            MethodAttributes.MemberAccessMask = 7;
            MethodAttributes.CompilerControlled = 0;
            MethodAttributes.Private = 1;
            MethodAttributes.FamANDAssem = 2;
            MethodAttributes.Assem = 3;
            MethodAttributes.Family = 4;
            MethodAttributes.FamORAssem = 5;
            MethodAttributes.Public = 6;
            MethodAttributes.Static = 16;
            MethodAttributes.Final = 32;
            MethodAttributes.Virtual = 64;
            MethodAttributes.HideBySig = 128;
            MethodAttributes.VtableLayoutMask = 256;
            MethodAttributes.ReuseSlot = 0;
            MethodAttributes.NewSlot = 256;
            MethodAttributes.Strict = 512;
            MethodAttributes.Abstract = 1024;
            MethodAttributes.SpecialName = 2048;
            MethodAttributes.PInvokeImpl = 8192;
            MethodAttributes.UnmanagedExport = 8;
            MethodAttributes.RTSpecialName = 4096;
            MethodAttributes.HasSecurity = 16384;
            MethodAttributes.RequireSecObject = 32768;
        })(managed.MethodAttributes || (managed.MethodAttributes = {}));
        var MethodAttributes = managed.MethodAttributes;
        (function (MethodSemanticsAttributes) {
            MethodSemanticsAttributes._map = [];
            MethodSemanticsAttributes.Setter = 1;
            MethodSemanticsAttributes.Getter = 2;
            MethodSemanticsAttributes.Other = 4;
            MethodSemanticsAttributes.AddOn = 8;
            MethodSemanticsAttributes.RemoveOn = 16;
            MethodSemanticsAttributes.Fire = 32;
        })(managed.MethodSemanticsAttributes || (managed.MethodSemanticsAttributes = {}));
        var MethodSemanticsAttributes = managed.MethodSemanticsAttributes;
        (function (ParamAttributes) {
            ParamAttributes._map = [];
            ParamAttributes.In = 1;
            ParamAttributes.Out = 2;
            ParamAttributes.Optional = 16;
            ParamAttributes.HasDefault = 4096;
            ParamAttributes.HasFieldMarshal = 8192;
            ParamAttributes.Unused = 53216;
        })(managed.ParamAttributes || (managed.ParamAttributes = {}));
        var ParamAttributes = managed.ParamAttributes;
        (function (PropertyAttributes) {
            PropertyAttributes._map = [];
            PropertyAttributes.SpecialName = 512;
            PropertyAttributes.RTSpecialName = 1024;
            PropertyAttributes.HasDefault = 4096;
            PropertyAttributes.Unused = 59903;
        })(managed.PropertyAttributes || (managed.PropertyAttributes = {}));
        var PropertyAttributes = managed.PropertyAttributes;
        (function (CallingConventions) {
            CallingConventions._map = [];
            CallingConventions.Default = 0;
            CallingConventions.C = 1;
            CallingConventions.StdCall = 2;
            CallingConventions.FastCall = 4;
            CallingConventions.VarArg = 5;
            CallingConventions.Generic = 16;
            CallingConventions.HasThis = 32;
            CallingConventions.ExplicitThis = 64;
            CallingConventions.Sentinel = 65;
        })(managed.CallingConventions || (managed.CallingConventions = {}));
        var CallingConventions = managed.CallingConventions;
        (function (TableKind) {
            TableKind._map = [];
            TableKind.ModuleDefinition = 0;
            TableKind.ExternalType = 1;
            TableKind.TypeDefinition = 2;
            TableKind.FieldDefinition = 4;
            TableKind.MethodDefinition = 6;
            TableKind.ParameterDefinition = 8;
            TableKind.MemberRef = 10;
            TableKind.Constant = 11;
            TableKind.CustomAttribute = 12;
            TableKind.FieldMarshal = 13;
            TableKind.DeclSecurity = 14;
            TableKind.ClassLayout = 15;
            TableKind.InterfaceImpl = 9;
            TableKind.FieldLayout = 16;
            TableKind.StandAloneSig = 17;
            TableKind.EventMap = 18;
            TableKind.Event = 20;
            TableKind.PropertyMap = 21;
            TableKind.PropertyDefinition = 23;
            TableKind.MethodSemantics = 24;
            TableKind.MethodImpl = 25;
            TableKind.ModuleRef = 26;
            TableKind.TypeSpec = 27;
            TableKind.ImplMap = 28;
            TableKind.FieldRVA = 29;
            TableKind.AssemblyDefinition = 32;
            TableKind.AssemblyProcessor = 33;
            TableKind.AssemblyOS = 34;
            TableKind.AssemblyRef = 35;
            TableKind.AssemblyRefProcessor = 36;
            TableKind.AssemblyRefOS = 37;
            TableKind.File = 38;
            TableKind.ExportedType = 39;
            TableKind.ManifestResource = 40;
            TableKind.NestedClass = 41;
            TableKind.GenericParam = 42;
            TableKind.MethodSpec = 43;
            TableKind.GenericParamConstraint = 44;
        })(managed.TableKind || (managed.TableKind = {}));
        var TableKind = managed.TableKind;
        var AssemblyDefinition = (function () {
            function AssemblyDefinition() {
                this.headers = null;
                this.hashAlgId = AssemblyHashAlgorithm.None;
                this.version = "";
                this.flags = 0;
                this.publicKey = "";
                this.name = "";
                this.culture = "";
                this.modules = [];
            }
            AssemblyDefinition.prototype.read = function (reader) {
                var asmReader = new AssemblyReader();
                asmReader.read(reader, this);
            };
            AssemblyDefinition.prototype.toString = function () {
                return this.name + ", version=" + this.version + (this.publicKey ? ", publicKey=" + this.publicKey : "");
            };
            AssemblyDefinition.prototype.internalReadRow = function (reader) {
                this.hashAlgId = reader.readInt();
                this.version = reader.readShort() + "." + reader.readShort() + "." + reader.readShort() + "." + reader.readShort();
                this.flags = reader.readInt();
                this.publicKey = reader.readBlobHex();
                this.name = reader.readString();
                this.culture = reader.readString();
            };
            return AssemblyDefinition;
        })();
        managed.AssemblyDefinition = AssemblyDefinition;        
        var ModuleDefinition = (function () {
            function ModuleDefinition() {
                this.runtimeVersion = "";
                this.specificRuntimeVersion = "";
                this.imageFlags = 0;
                this.metadataVersion = "";
                this.tableStreamVersion = "";
                this.generation = 0;
                this.name = "";
                this.mvid = "";
                this.encId = "";
                this.encBaseId = "";
                this.types = [];
                this.debugExternalTypeReferences = [];
            }
            ModuleDefinition.prototype.toString = function () {
                return this.name + " " + this.imageFlags;
            };
            ModuleDefinition.prototype.internalReadRow = function (reader) {
                this.generation = reader.readShort();
                this.name = reader.readString();
                this.mvid = reader.readGuid();
                this.encId = reader.readGuid();
                this.encBaseId = reader.readGuid();
            };
            return ModuleDefinition;
        })();
        managed.ModuleDefinition = ModuleDefinition;        
        var TypeReference = (function () {
            function TypeReference() { }
            TypeReference.prototype.getName = function () {
                throw new Error("Not implemented.");
            };
            TypeReference.prototype.getNamespace = function () {
                throw new Error("Not implemented.");
            };
            TypeReference.prototype.toString = function () {
                var ns = this.getNamespace();
                var nm = this.getName();
                if(ns && ns.length) {
                    return ns + "." + nm;
                } else {
                    return nm;
                }
            };
            return TypeReference;
        })();
        managed.TypeReference = TypeReference;        
        var MVar = (function (_super) {
            __extends(MVar, _super);
            function MVar(index) {
                        _super.call(this);
                this.index = index;
            }
            MVar.prototype.getName = function () {
                return "M" + this.index;
            };
            MVar.prototype.getNamespace = function () {
                return null;
            };
            return MVar;
        })(TypeReference);
        managed.MVar = MVar;        
        var Var = (function (_super) {
            __extends(Var, _super);
            function Var(index) {
                        _super.call(this);
                this.index = index;
            }
            Var.prototype.getName = function () {
                return "T" + this.index;
            };
            Var.prototype.getNamespace = function () {
                return null;
            };
            return Var;
        })(TypeReference);
        managed.Var = Var;        
        var TypeDefinition = (function (_super) {
            __extends(TypeDefinition, _super);
            function TypeDefinition() {
                        _super.call(this);
                this.attributes = 0;
                this.name = "";
                this.namespace = "";
                this.fields = [];
                this.methods = [];
                this.baseType = null;
            }
            TypeDefinition.prototype.getName = function () {
                return this.name;
            };
            TypeDefinition.prototype.getNamespace = function () {
                return this.namespace;
            };
            TypeDefinition.prototype.internalReadRow = function (reader) {
                this.attributes = reader.readInt();
                this.name = reader.readString();
                this.namespace = reader.readString();
                this.baseType = reader.readTypeDefOrRef();
                this.internalFieldList = reader.readTableRowIndex(TableKind.FieldDefinition);
                this.internalMethodList = reader.readTableRowIndex(TableKind.MethodDefinition);
            };
            return TypeDefinition;
        })(TypeReference);
        managed.TypeDefinition = TypeDefinition;        
        var FieldDefinition = (function () {
            function FieldDefinition() {
                this.attributes = 0;
                this.name = "";
                this.customModifiers = null;
                this.customAttributes = null;
                this.type = null;
            }
            FieldDefinition.prototype.toString = function () {
                return this.name + (this.value ? " = " + this.value : "");
            };
            FieldDefinition.prototype.internalReadRow = function (reader) {
                this.attributes = reader.readShort();
                this.name = reader.readString();
                reader.readFieldSignature(this);
            };
            return FieldDefinition;
        })();
        managed.FieldDefinition = FieldDefinition;        
        var FieldSignature = (function () {
            function FieldSignature() { }
            return FieldSignature;
        })();
        managed.FieldSignature = FieldSignature;        
        var MethodDefinition = (function () {
            function MethodDefinition() {
                this.attributes = 0;
                this.implAttributes = 0;
                this.name = "";
                this.parameters = [];
                this.signature = new MethodSignature();
                this.locals = [];
                this.internalRva = 0;
                this.internalParamList = 0;
            }
            MethodDefinition.prototype.toString = function () {
                var result = this.name;
                result += "(";
                if(this.parameters) {
                    for(var i = 0; i < this.parameters.length; i++) {
                        if(i > 0) {
                            result += ", ";
                        }
                        result += this.parameters[i];
                        if(this.signature && this.signature.parameters && i < this.signature.parameters.length) {
                            result += ": " + this.signature.parameters[i].type;
                        }
                    }
                }
                result += ")";
                return result;
            };
            MethodDefinition.prototype.internalReadRow = function (reader) {
                this.internalRva = reader.readInt();
                this.implAttributes = reader.readShort();
                this.attributes = reader.readShort();
                this.name = reader.readString();
                reader.readMethodSignature(this.signature);
                this.internalParamList = reader.readTableRowIndex(TableKind.ParameterDefinition);
            };
            return MethodDefinition;
        })();
        managed.MethodDefinition = MethodDefinition;        
        var CustomModifier = (function () {
            function CustomModifier(required, type) {
                this.required = required;
                this.type = type;
            }
            CustomModifier.prototype.toString = function () {
                return (this.required ? "<req> " : "") + this.type;
            };
            return CustomModifier;
        })();
        managed.CustomModifier = CustomModifier;        
        var ParameterDefinition = (function () {
            function ParameterDefinition() {
                this.attributes = 0;
                this.name = "";
                this.index = 0;
            }
            ParameterDefinition.prototype.internalReadRow = function (reader) {
                this.attributes = reader.readShort();
                this.index = reader.readShort();
                this.name = reader.readString();
            };
            ParameterDefinition.prototype.toString = function () {
                return this.name;
            };
            return ParameterDefinition;
        })();
        managed.ParameterDefinition = ParameterDefinition;        
        var PropertyDefinition = (function () {
            function PropertyDefinition() {
                this.attributes = 0;
                this.name = "";
                this.isStatic = false;
            }
            PropertyDefinition.prototype.internalReadRow = function (reader) {
                this.attributes = reader.readShort();
                this.name = reader.readString();
                reader.readPropertySignature(this);
            };
            PropertyDefinition.prototype.toString = function () {
                return this.name + (this.parameters ? "[" + this.parameters.length + "]" : "") + ":" + this.type;
            };
            return PropertyDefinition;
        })();
        managed.PropertyDefinition = PropertyDefinition;        
        var LocalVariable = (function () {
            function LocalVariable() { }
            return LocalVariable;
        })();
        managed.LocalVariable = LocalVariable;        
        var ExternalType = (function (_super) {
            __extends(ExternalType, _super);
            function ExternalType(assemblyRef, name, namespace) {
                        _super.call(this);
                this.assemblyRef = assemblyRef;
                this.name = name;
                this.namespace = namespace;
            }
            ExternalType.prototype.getName = function () {
                return this.name;
            };
            ExternalType.prototype.getNamespace = function () {
                return this.namespace;
            };
            ExternalType.prototype.internalReadRow = function (reader) {
                this.assemblyRef = reader.readResolutionScope();
                this.name = reader.readString();
                this.namespace = reader.readString();
            };
            return ExternalType;
        })(TypeReference);
        managed.ExternalType = ExternalType;        
        var PointerType = (function (_super) {
            __extends(PointerType, _super);
            function PointerType(baseType) {
                        _super.call(this);
                this.baseType = baseType;
            }
            PointerType.prototype.getName = function () {
                return this.baseType.getName() + "*";
            };
            PointerType.prototype.getNamespace = function () {
                return this.baseType.getNamespace();
            };
            return PointerType;
        })(TypeReference);
        managed.PointerType = PointerType;        
        var ByRefType = (function (_super) {
            __extends(ByRefType, _super);
            function ByRefType(baseType) {
                        _super.call(this);
                this.baseType = baseType;
            }
            ByRefType.prototype.getName = function () {
                return this.baseType.getName() + "&";
            };
            ByRefType.prototype.getNamespace = function () {
                return this.baseType.getNamespace();
            };
            return ByRefType;
        })(TypeReference);
        managed.ByRefType = ByRefType;        
        var SZArrayType = (function (_super) {
            __extends(SZArrayType, _super);
            function SZArrayType(elementType) {
                        _super.call(this);
                this.elementType = elementType;
            }
            SZArrayType.prototype.getName = function () {
                return this.elementType.getName() + "[]";
            };
            SZArrayType.prototype.getNamespace = function () {
                return this.elementType.getNamespace();
            };
            SZArrayType.prototype.toString = function () {
                return this.getNamespace() + "." + this.getName();
            };
            return SZArrayType;
        })(TypeReference);
        managed.SZArrayType = SZArrayType;        
        var SentinelType = (function (_super) {
            __extends(SentinelType, _super);
            function SentinelType(baseType) {
                        _super.call(this);
                this.baseType = baseType;
            }
            SentinelType.prototype.getName = function () {
                return this.baseType.getName() + "!sentinel";
            };
            SentinelType.prototype.getNamespace = function () {
                return this.baseType.getNamespace();
            };
            SentinelType.prototype.toString = function () {
                return this.getNamespace() + "." + this.getName();
            };
            return SentinelType;
        })(TypeReference);
        managed.SentinelType = SentinelType;        
        var KnownType = (function (_super) {
            __extends(KnownType, _super);
            function KnownType(name, internalElementType) {
                        _super.call(this);
                this.name = name;
                this.internalElementType = internalElementType;
                KnownType.byElementType[internalElementType] = this;
            }
            KnownType.byElementType = [];
            KnownType.prototype.getName = function () {
                return this.name;
            };
            KnownType.prototype.getNamespace = function () {
                return "System";
            };
            KnownType.internalGetByElementName = function internalGetByElementName(elementType) {
                var result = KnownType.byElementType[elementType];
                return result;
            }
            KnownType.Void = new KnownType("Void", ElementType.Void);
            KnownType.Boolean = new KnownType("Boolean", ElementType.Boolean);
            KnownType.Char = new KnownType("Char", ElementType.Char);
            KnownType.SByte = new KnownType("SByte", ElementType.I1);
            KnownType.Byte = new KnownType("Byte", ElementType.U1);
            KnownType.Int16 = new KnownType("Int16", ElementType.I2);
            KnownType.UInt16 = new KnownType("UInt16", ElementType.U2);
            KnownType.Int32 = new KnownType("Int32", ElementType.I4);
            KnownType.UInt32 = new KnownType("UInt32", ElementType.U4);
            KnownType.Int64 = new KnownType("Int64", ElementType.I8);
            KnownType.UInt64 = new KnownType("UInt64", ElementType.U8);
            KnownType.Single = new KnownType("Single", ElementType.R4);
            KnownType.Double = new KnownType("Double", ElementType.R8);
            KnownType.String = new KnownType("String", ElementType.String);
            KnownType.TypedReference = new KnownType("TypedReference", ElementType.TypedByRef);
            KnownType.IntPtr = new KnownType("IntPtr", ElementType.I);
            KnownType.UIntPtr = new KnownType("UIntPtr", ElementType.U);
            KnownType.Object = new KnownType("Object", ElementType.Object);
            KnownType.prototype.toString = function () {
                return this.getNamespace() + "." + this.getName();
            };
            return KnownType;
        })(TypeReference);
        managed.KnownType = KnownType;        
        var GenericInstantiation = (function (_super) {
            __extends(GenericInstantiation, _super);
            function GenericInstantiation() {
                _super.apply(this, arguments);

                this.genericType = null;
                this.arguments = null;
            }
            GenericInstantiation.prototype.getName = function () {
                return this.genericType.getName();
            };
            GenericInstantiation.prototype.getNamespace = function () {
                return this.genericType.getNamespace();
            };
            GenericInstantiation.prototype.toString = function () {
                return this.getNamespace() + "." + this.getName();
            };
            return GenericInstantiation;
        })(TypeReference);
        managed.GenericInstantiation = GenericInstantiation;        
        var FunctionPointerType = (function (_super) {
            __extends(FunctionPointerType, _super);
            function FunctionPointerType() {
                _super.apply(this, arguments);

                this.methodSignature = null;
            }
            FunctionPointerType.prototype.getName = function () {
                return this.methodSignature.toString();
            };
            FunctionPointerType.prototype.getNamespace = function () {
                return "<function*>";
            };
            FunctionPointerType.prototype.toString = function () {
                return this.getNamespace() + "." + this.getName();
            };
            return FunctionPointerType;
        })(TypeReference);
        managed.FunctionPointerType = FunctionPointerType;        
        var ArrayType = (function (_super) {
            __extends(ArrayType, _super);
            function ArrayType(elementType, dimensions) {
                        _super.call(this);
                this.elementType = elementType;
                this.dimensions = dimensions;
            }
            ArrayType.prototype.getName = function () {
                return this.elementType.getName() + "[" + this.dimensions.join(", ") + "]";
            };
            ArrayType.prototype.getNamespace = function () {
                return this.elementType.getNamespace();
            };
            ArrayType.prototype.toString = function () {
                return this.getNamespace() + "." + this.getName();
            };
            return ArrayType;
        })(TypeReference);
        managed.ArrayType = ArrayType;        
        var ArrayDimensionRange = (function () {
            function ArrayDimensionRange() {
                this.lowBound = 0;
                this.length = 0;
            }
            ArrayDimensionRange.prototype.toString = function () {
                return this.lowBound + ".managed." + (this.lowBound + this.length - 1) + "]";
            };
            return ArrayDimensionRange;
        })();
        managed.ArrayDimensionRange = ArrayDimensionRange;        
        var MethodSignature = (function () {
            function MethodSignature() {
                this.callingConvention = 0;
                this.parameters = [];
                this.extraParameters = null;
                this.returnType = null;
            }
            MethodSignature.prototype.toString = function () {
                var result = "(" + this.parameters.join(", ");
                if(this.extraParameters && this.extraParameters.length) {
                    if(result.length > 1) {
                        result += ", " + this.extraParameters.join(", ");
                    }
                }
                result += ")";
                result += " => " + this.returnType;
                return result;
            };
            return MethodSignature;
        })();
        managed.MethodSignature = MethodSignature;        
        var ParameterSignature = (function () {
            function ParameterSignature(customModifiers, type) {
                this.customModifiers = customModifiers;
                this.type = type;
            }
            ParameterSignature.prototype.toString = function () {
                return "_: " + this.type;
            };
            return ParameterSignature;
        })();
        managed.ParameterSignature = ParameterSignature;        
        var ConstantValue = (function () {
            function ConstantValue(type, value) {
                this.type = type;
                this.value = value;
            }
            ConstantValue.prototype.valueOf = function () {
                return this.value;
            };
            return ConstantValue;
        })();
        managed.ConstantValue = ConstantValue;        
        var CustomAttributeData = (function () {
            function CustomAttributeData() {
            }
            return CustomAttributeData;
        })();
        managed.CustomAttributeData = CustomAttributeData;        
        var TableStreamReader = (function () {
            function TableStreamReader(baseReader, streams, tables) {
                this.baseReader = baseReader;
                this.streams = streams;
                this.tables = tables;
                this.stringHeapCache = [];
                this.readResolutionScope = this.createCodedIndexReader(TableKind.ModuleDefinition, TableKind.ModuleRef, TableKind.AssemblyRef, TableKind.ExternalType);
                this.readTypeDefOrRef = this.createCodedIndexReader(TableKind.TypeDefinition, TableKind.ExternalType, TableKind.TypeSpec);
                this.readHasConstant = this.createCodedIndexReader(TableKind.FieldDefinition, TableKind.ParameterDefinition, TableKind.PropertyDefinition);
                this.readHasCustomAttribute = this.createCodedIndexReader(TableKind.MethodDefinition, TableKind.FieldDefinition, TableKind.ExternalType, TableKind.TypeDefinition, TableKind.ParameterDefinition, TableKind.InterfaceImpl, TableKind.MemberRef, TableKind.ModuleDefinition, 65535, TableKind.PropertyDefinition, TableKind.Event, TableKind.StandAloneSig, TableKind.ModuleRef, TableKind.TypeSpec, TableKind.AssemblyDefinition, TableKind.AssemblyRef, TableKind.File, TableKind.ExportedType, TableKind.ManifestResource, TableKind.GenericParam, TableKind.GenericParamConstraint, TableKind.MethodSpec);
                this.readCustomAttributeType = this.createCodedIndexReader(65535, 65535, TableKind.MethodDefinition, TableKind.MemberRef, 65535);
                this.readHasDeclSecurity = this.createCodedIndexReader(TableKind.TypeDefinition, TableKind.MethodDefinition, TableKind.AssemblyDefinition);
                this.readImplementation = this.createCodedIndexReader(TableKind.File, TableKind.AssemblyRef, TableKind.ExportedType);
                this.readHasFieldMarshal = this.createCodedIndexReader(TableKind.FieldDefinition, TableKind.ParameterDefinition);
                this.readTypeOrMethodDef = this.createCodedIndexReader(TableKind.TypeDefinition, TableKind.MethodDefinition);
                this.readMemberForwarded = this.createCodedIndexReader(TableKind.FieldDefinition, TableKind.MethodDefinition);
                this.readMemberRefParent = this.createCodedIndexReader(TableKind.TypeDefinition, TableKind.ExternalType, TableKind.ModuleRef, TableKind.MethodDefinition, TableKind.TypeSpec);
                this.readMethodDefOrRef = this.createCodedIndexReader(TableKind.MethodDefinition, TableKind.MemberRef);
                this.readHasSemantics = this.createCodedIndexReader(TableKind.Event, TableKind.PropertyDefinition);
            }
            TableStreamReader.prototype.readByte = function () {
                return this.baseReader.readByte();
            };
            TableStreamReader.prototype.readInt = function () {
                return this.baseReader.readInt();
            };
            TableStreamReader.prototype.readShort = function () {
                return this.baseReader.readShort();
            };
            TableStreamReader.prototype.readString = function () {
                var pos = this.readPos(this.streams.strings.size);
                var result;
                if(pos == 0) {
                    result = null;
                } else {
                    result = this.stringHeapCache[pos];
                    if(!result) {
                        if(pos > this.streams.strings.size) {
                            throw new Error("String heap position overflow.");
                        }
                        var saveOffset = this.baseReader.offset;
                        this.baseReader.setVirtualOffset(this.streams.strings.address + pos);
                        result = this.baseReader.readUtf8Z(1024 * 1024 * 1024);
                        this.baseReader.offset = saveOffset;
                        this.stringHeapCache[pos] = result;
                    }
                }
                return result;
            };
            TableStreamReader.prototype.readGuid = function () {
                var index = this.readPos(this.streams.guids.length);
                if(index == 0) {
                    return null;
                } else {
                    return this.streams.guids[(index - 1) / 16];
                }
            };
            TableStreamReader.prototype.readBlobHex = function () {
                var blobIndex = this.readBlobIndex();
                var saveOffset = this.baseReader.offset;
                this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
                var length = this.readBlobSize();
                var result = "";
                for(var i = 0; i < length; i++) {
                    var hex = this.baseReader.readByte().toString(16);
                    if(hex.length == 1) {
                        result += "0";
                    }
                    result += hex;
                }
                this.baseReader.offset = saveOffset;
                return result;
            };
            TableStreamReader.prototype.readBlob = function () {
                var blobIndex = this.readBlobIndex();
                var saveOffset = this.baseReader.offset;
                this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
                var length = this.readBlobSize();
                var result = this.baseReader.readBytes(length);
                this.baseReader.offset = saveOffset;
                return result;
            };
            TableStreamReader.prototype.readBlobIndex = function () {
                return this.readPos(this.streams.blobs.size);
            };
            TableStreamReader.prototype.readBlobSize = function () {
                var length;
                var b0 = this.baseReader.readByte();
                if(b0 < 128) {
                    length = b0;
                } else {
                    var b1 = this.baseReader.readByte();
                    if((b0 & 192) == 128) {
                        length = ((b0 & 63) << 8) + b1;
                    } else {
                        var b2 = this.baseReader.readByte();
                        var b3 = this.baseReader.readByte();
                        length = ((b0 & 63) << 24) + (b1 << 16) + (b2 << 8) + b3;
                    }
                }
                return length;
            };
            TableStreamReader.prototype.readTableRowIndex = function (tableIndex) {
                var tableRows = this.tables[tableIndex];
                return this.readPos(tableRows ? tableRows.length : 0);
            };
            TableStreamReader.prototype.createCodedIndexReader = function () {
                var _this = this;
                var tableTypes = [];
                for (var _i = 0; _i < (arguments.length - 0); _i++) {
                    tableTypes[_i] = arguments[_i + 0];
                }
                var tableDebug = [];
                var maxTableLength = 0;
                for(var i = 0; i < tableTypes.length; i++) {
                    var table = this.tables[tableTypes[i]];
                    if(!table) {
                        tableDebug.push(null);
                        continue;
                    }
                    tableDebug.push(table.length);
                    maxTableLength = Math.max(maxTableLength, table.length);
                }
                function calcRequredBitCount(maxValue) {
                    var bitMask = maxValue;
                    var result = 0;
                    while(bitMask != 0) {
                        result++;
                        bitMask >>= 1;
                    }
                    return result;
                }
                var tableKindBitCount = calcRequredBitCount(tableTypes.length - 1);
                var tableIndexBitCount = calcRequredBitCount(maxTableLength);
                return function () {
                    var result = tableKindBitCount + tableIndexBitCount <= 16 ? _this.baseReader.readShort() : _this.baseReader.readInt();
                    var resultIndex = result >> tableKindBitCount;
                    var resultTableIndex = result - (resultIndex << tableKindBitCount);
                    var table = tableTypes[resultTableIndex];
                    if(resultIndex == 0) {
                        return null;
                    }
                    resultIndex--;
                    var row = _this.tables[table][resultIndex];
                    return row;
                }
            };
            TableStreamReader.prototype.readPos = function (spaceSize) {
                if(spaceSize < 65535) {
                    return this.baseReader.readShort();
                } else {
                    return this.baseReader.readInt();
                }
            };
            TableStreamReader.prototype.readMethodSignature = function (definition) {
                var blobIndex = this.readBlobIndex();
                var saveOffset = this.baseReader.offset;
                this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
                var length = this.readBlobSize();
                this.readSigMethodDefOrRefOrStandalone(definition);
                this.baseReader.offset = saveOffset;
            };
            TableStreamReader.prototype.readMethodSpec = function (instantiation) {
                var blobIndex = this.readBlobIndex();
                var saveOffset = this.baseReader.offset;
                this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
                var length = this.readBlobSize();
                var leadByte = this.baseReader.readByte();
                if(leadByte !== 10) {
                    throw new Error("Incorrect lead byte " + leadByte + " in MethodSpec signature.");
                }
                var genArgCount = this.readCompressedInt();
                instantiation.length = genArgCount;
                for(var i = 0; i < genArgCount; i++) {
                    var type = this.readSigTypeReference();
                    instantiation.push(type);
                }
                this.baseReader.offset = saveOffset;
            };
            TableStreamReader.prototype.readSigMethodDefOrRefOrStandalone = function (sig) {
                var b = this.baseReader.readByte();
                sig.callingConvention = b;
                var genParameterCount = b & CallingConventions.Generic ? this.readCompressedInt() : 0;
                var paramCount = this.readCompressedInt();
                var returnTypeCustomModifiers = this.readSigCustomModifierList();
                var returnType = this.readSigTypeReference();
                sig.parameters = [];
                sig.extraParameters = (sig.callingConvention & CallingConventions.VarArg) || (sig.callingConvention & CallingConventions.C) ? [] : null;
                for(var i = 0; i < paramCount; i++) {
                    var p = this.readSigParam();
                    if(sig.extraParameters && sig.extraParameters.length > 0) {
                        sig.extraParameters.push(p);
                    } else {
                        if(sig.extraParameters && this.baseReader.peekByte() === CallingConventions.Sentinel) {
                            this.baseReader.offset++;
                            sig.extraParameters.push(p);
                        } else {
                            sig.parameters.push(p);
                        }
                    }
                }
            };
            TableStreamReader.prototype.readFieldSignature = function (definition) {
                var blobIndex = this.readBlobIndex();
                var saveOffset = this.baseReader.offset;
                this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
                var length = this.readBlobSize();
                var leadByte = this.baseReader.readByte();
                if(leadByte !== 6) {
                    throw new Error("Field signature lead byte 0x" + leadByte.toString(16).toUpperCase() + " is invalid.");
                }
                definition.customModifiers = this.readSigCustomModifierList();
                definition.type = this.readSigTypeReference();
                this.baseReader.offset = saveOffset;
            };
            TableStreamReader.prototype.readPropertySignature = function (definition) {
                var blobIndex = this.readBlobIndex();
                var saveOffset = this.baseReader.offset;
                this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
                var length = this.readBlobSize();
                var leadByte = this.baseReader.readByte();
                if(!(leadByte & 8)) {
                    throw new Error("Property signature lead byte 0x" + leadByte.toString(16).toUpperCase() + " is invalid.");
                }
                definition.isStatic = !(leadByte & CallingConventions.HasThis);
                var paramCount = this.readCompressedInt();
                definition.customModifiers = this.readSigCustomModifierList();
                definition.type = this.readSigTypeReference();
                if(!definition.parameters) {
                    definition.parameters = [];
                }
                definition.parameters.length = paramCount;
                for(var i = 0; i < paramCount; i++) {
                    definition.parameters[i] = this.readSigParam();
                }
                this.baseReader.offset = saveOffset;
            };
            TableStreamReader.prototype.readSigLocalVar = function () {
                var leadByte = this.baseReader.readByte();
                if(leadByte !== 7) {
                    throw new Error("LocalVarSig signature lead byte 0x" + leadByte.toString(16).toUpperCase() + " is invalid.");
                }
                var count = this.readCompressedInt();
                var result = Array(count);
                for(var i = 0; i < count; i++) {
                    var v = new LocalVariable();
                    var varLeadByte = this.baseReader.peekByte();
                    if(varLeadByte === ElementType.TypedByRef) {
                        this.baseReader.offset++;
                        v.type = KnownType.TypedReference;
                    } else {
                        while(true) {
                            var cmod = this.readSigCustomModifierOrNull();
                            if(cmod) {
                                if(!v.customModifiers) {
                                    v.customModifiers = [];
                                }
                                v.customModifiers.push(cmod);
                                continue;
                            }
                            if(this.baseReader.peekByte() === ElementType.Pinned) {
                                this.baseReader.offset++;
                                v.isPinned = true;
                                continue;
                            }
                        }
                        v.type = this.readSigTypeReference();
                    }
                    result.push(v);
                }
                return result;
            };
            TableStreamReader.prototype.readSigCustomModifierOrNull = function () {
                var s = this.baseReader.peekByte();
                switch(s) {
                    case ElementType.CMod_Opt: {
                        this.baseReader.offset++;
                        return new CustomModifier(false, this.readSigTypeDefOrRefOrSpecEncoded());

                    }
                    case ElementType.CMod_ReqD: {
                        this.baseReader.offset++;
                        return new CustomModifier(true, this.readSigTypeDefOrRefOrSpecEncoded());

                    }
                    default: {
                        return null;

                    }
                }
            };
            TableStreamReader.prototype.readSigTypeDefOrRefOrSpecEncoded = function () {
                var uncompressed = this.readCompressedInt();
                var index = Math.floor(uncompressed / 4);
                var tableKind = uncompressed - index * 4;
                var table;
                switch(tableKind) {
                    case 0: {
                        table = this.tables[TableKind.TypeDefinition];
                        break;

                    }
                    case 1: {
                        table = this.tables[TableKind.ExternalType];
                        break;

                    }
                    case 2: {
                        table = this.tables[TableKind.TypeSpec];
                        break;

                    }
                    default: {
                        throw new Error("Unknown table kind " + tableKind + " in encoded index.");

                    }
                }
                var typeReference = table[index];
                return typeReference.definition ? typeReference.definition : typeReference;
            };
            TableStreamReader.prototype.readSigCustomModifierList = function () {
                var result = null;
                while(true) {
                    var mod = this.readSigCustomModifierOrNull();
                    if(!mod) {
                        return result;
                    }
                    if(!result) {
                        result = [];
                    }
                    result.push(mod);
                }
            };
            TableStreamReader.prototype.readSigParam = function () {
                var customModifiers = this.readSigCustomModifierList();
                var type = this.readSigTypeReference();
                return new ParameterSignature(customModifiers, type);
            };
            TableStreamReader.prototype.readSigTypeReference = function () {
                var etype = this.baseReader.readByte();
                var directResult = KnownType.internalGetByElementName(etype);
                if(directResult) {
                    return directResult;
                }
                switch(etype) {
                    case ElementType.Ptr: {
                        return new PointerType(this.readSigTypeReference());

                    }
                    case ElementType.ByRef: {
                        return new ByRefType(this.readSigTypeReference());

                    }
                    case ElementType.ValueType: {
                        var value_type = this.readSigTypeDefOrRefOrSpecEncoded();
                        return value_type;

                    }
                    case ElementType.Class: {
                        var value_type = this.readSigTypeDefOrRefOrSpecEncoded();
                        return value_type;

                    }
                    case ElementType.Var: {
                        var varIndex = this.readCompressedInt();
                        return new Var(varIndex);

                    }
                    case ElementType.Array: {
                        var arrayElementType = this.readSigTypeReference();
                        return this.readSigArrayShape(arrayElementType);

                    }
                    case ElementType.GenericInst: {
                        var genInst = new GenericInstantiation();
                        var genLead = this.baseReader.readByte();
                        var isValueType;
                        switch(genLead) {
                            case ElementType.Class: {
                                (genInst).isValueType = false;
                                break;

                            }
                            case ElementType.ValueType: {
                                (genInst).isValueType = true;
                                break;

                            }
                            default: {
                                throw new Error("Unexpected lead byte 0x" + genLead.toString(16).toUpperCase() + " in GenericInst type signature.");

                            }
                        }
                        genInst.genericType = this.readSigTypeDefOrRefOrSpecEncoded();
                        var genArgCount = this.readCompressedInt();
                        genInst.arguments = Array(genArgCount);
                        for(var iGen = 0; iGen < genArgCount; iGen++) {
                            genInst.arguments.push(this.readSigTypeReference());
                        }
                        return genInst;
                    }

                    case ElementType.FnPtr: {
                        var fnPointer = new FunctionPointerType();
                        fnPointer.methodSignature = new MethodSignature();
                        this.readSigMethodDefOrRefOrStandalone(fnPointer.methodSignature);
                        return fnPointer;

                    }
                    case ElementType.SZArray: {
                        return new SZArrayType(this.readSigTypeReference());

                    }
                    case ElementType.MVar: {
                        var mvarIndex = this.readCompressedInt();
                        return new MVar(mvarIndex);

                    }
                    case ElementType.Sentinel: {
                        return new SentinelType(this.readSigTypeReference());

                    }
                    case ElementType.Pinned:
                    case ElementType.End:
                    case ElementType.Internal:
                    case ElementType.Modifier:
                    case ElementType.R4_Hfa:
                    case ElementType.R8_Hfa:
                    case ElementType.ArgumentType_:
                    case ElementType.CustomAttribute_BoxedObject_:
                    case ElementType.CustomAttribute_Field_:
                    case ElementType.CustomAttribute_Property_:
                    case ElementType.CustomAttribute_Enum_:
                    default: {
                        throw new Error("Unknown element type " + pe.io.formatEnum(etype, ElementType) + ".");

                    }
                }
            };
            TableStreamReader.prototype.readSigArrayShape = function (arrayElementType) {
                var rank = this.readCompressedInt();
                var dimensions = Array(rank);
                for(var i = 0; i < rank; i++) {
                    dimensions[i] = new ArrayDimensionRange();
                }
                var numSizes = this.readCompressedInt();
                for(var i = 0; i < numSizes; i++) {
                    dimensions[i].length = this.readCompressedInt();
                }
                var numLoBounds = this.readCompressedInt();
                for(var i = 0; i < numLoBounds; i++) {
                    dimensions[i].lowBound = this.readCompressedInt();
                }
                return new ArrayType(arrayElementType, dimensions);
            };
            TableStreamReader.prototype.readMemberSignature = function () {
                var blobIndex = this.readBlobIndex();
                var saveOffset = this.baseReader.offset;
                this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
                var length = this.readBlobSize();
                var result;
                var leadByte = this.baseReader.peekByte();
                if(leadByte & 5) {
                    this.baseReader.offset++;
                    result = new FieldSignature();
                    result.customModifiers = this.readSigCustomModifierOrNull();
                    result.type = this.readSigTypeReference();
                } else {
                    result = new MethodSignature();
                    this.readSigMethodDefOrRefOrStandalone(result);
                }
                this.baseReader.offset = saveOffset;
                return result;
            };
            TableStreamReader.prototype.readCompressedInt = function () {
                var result;
                var b0 = this.baseReader.readByte();
                if(b0 < 128) {
                    result = b0;
                } else {
                    var b1 = this.baseReader.readByte();
                    if((b0 & 192) == 128) {
                        result = ((b0 & 63) << 8) + b1;
                    } else {
                        var b2 = this.baseReader.readByte();
                        var b3 = this.baseReader.readByte();
                        result = ((b0 & 63) << 24) + (b1 << 16) + (b2 << 8) + b3;
                    }
                }
                return result;
            };
            TableStreamReader.prototype.readConstantValue = function (etype) {
                var blobIndex = this.readBlobIndex();
                var saveOffset = this.baseReader.offset;
                this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
                var length = this.readBlobSize();
                var result = this.readSigValue(etype, length);
                this.baseReader.offset = saveOffset;
                return result;
            };
            TableStreamReader.prototype.readSigValue = function (etype, length) {
                switch(etype) {
                    case ElementType.Boolean: {
                        return this.baseReader.readByte() !== 0;

                    }
                    case ElementType.Char: {
                        return String.fromCharCode(this.baseReader.readShort());

                    }
                    case ElementType.I1: {
                        var result = this.baseReader.readByte();
                        if(result > 127) {
                            result -= 255;
                        }
                        return result;

                    }
                    case ElementType.U1: {
                        return this.baseReader.readByte();

                    }
                    case ElementType.I2: {
                        var result = this.baseReader.readShort();
                        if(result > 32767) {
                            result -= 65535;
                        }
                        return result;

                    }
                    case ElementType.U2: {
                        return this.baseReader.readShort();

                    }
                    case ElementType.I4: {
                        var result = this.baseReader.readInt();
                        if(result > 2147483647) {
                            result -= 4294967295;
                        }
                        return result;

                    }
                    case ElementType.U4: {
                        return this.baseReader.readInt();

                    }
                    case ElementType.I8:
                    case ElementType.U8: {
                        return this.baseReader.readLong();

                    }
                    case ElementType.R4: {
                        return this.baseReader.readInt();

                    }
                    case ElementType.R8: {
                        return this.baseReader.readLong();

                    }
                    case ElementType.String: {
                        var stringValue = "";
                        for(var iChar = 0; iChar < length / 2; iChar++) {
                            stringValue += String.fromCharCode(this.baseReader.readShort());
                        }
                        return stringValue;

                    }
                    case ElementType.Class: {
                        var classRef = this.baseReader.readInt();
                        if(classRef === 0) {
                            return null;
                        } else {
                            return classRef;
                        }

                    }
                    default: {
                        return "Unknown element type " + etype + ".";

                    }
                }
            };
            TableStreamReader.prototype.readCustomAttribute = function (ctorSignature) {
                var blobIndex = this.readBlobIndex();
                var saveOffset = this.baseReader.offset;
                this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
                var length = this.readBlobSize();
                var customAttribute = new CustomAttributeData();
                var prolog = this.baseReader.readShort();
                if(prolog !== 1) {
                    throw new Error("Incorrect prolog value 0x" + prolog.toString(16).toUpperCase() + " for CustomAttribute.");
                }
                customAttribute.fixedArguments = [];
                for(var i = 0; i < ctorSignature.parameters.length; i++) {
                    var pType = ctorSignature.parameters[i].type;
                    customAttribute.fixedArguments.push(this.readSigFixedArg(pType));
                }
                var numNamed = this.baseReader.readShort();
                for(var i = 0; i < numNamed; i++) {
                    var namedLeadByte = this.baseReader.readByte();
                    var isField;
                    switch(namedLeadByte) {
                        case 83: {
                            isField = true;

                        }
                        case 84: {
                            isField = false;

                        }
                        default: {
                            throw new Error("Incorrect leading byte " + namedLeadByte + " for named CustomAttribute argument.");

                        }
                    }
                    var fieldOrPropType = this.readSigFieldOrPropType();
                    var fieldOrPropName = this.readSigSerString();
                    var value = this.readSigFixedArg(fieldOrPropType);
                    customAttribute.namedArguments.push({
                        name: fieldOrPropName,
                        type: fieldOrPropType,
                        value: value
                    });
                }
                this.baseReader.offset = saveOffset;
                return customAttribute;
            };
            TableStreamReader.prototype.readSigFixedArg = function (type) {
                var isArray = (type).elementType && !(type).dimensions;
                if(isArray) {
                    var szElements = [];
                    var numElem = this.baseReader.readInt();
                    for(var i = 0; i < numElem; i++) {
                        szElements.push(this.readSigElem((type).elementType));
                    }
                    return szElements;
                } else {
                    return this.readSigElem(type);
                }
            };
            TableStreamReader.prototype.readSigFieldOrPropType = function () {
                var etype = this.baseReader.readByte();
                var result = KnownType.internalGetByElementName(etype);
                if(result) {
                    return result;
                }
                switch(etype) {
                    case ElementType.SZArray: {
                        var elementType = this.readSigFieldOrPropType();
                        return new SZArrayType(elementType);

                    }
                    case ElementType.CustomAttribute_Enum_: {
                        var enumName = this.readSigSerString();
                        return new ExternalType(null, null, enumName);

                    }
                }
            };
            TableStreamReader.prototype.readSigSerString = function () {
                if(this.baseReader.peekByte() === 255) {
                    return null;
                }
                var packedLen = this.readCompressedInt();
                var result = this.baseReader.readUtf8Z(packedLen);
                return result;
            };
            TableStreamReader.prototype.readSigElem = function (type) {
            };
            return TableStreamReader;
        })();
        managed.TableStreamReader = TableStreamReader;        
        var TableStream = (function () {
            function TableStream() {
                this.reserved0 = 0;
                this.version = "";
                this.heapSizes = 0;
                this.reserved1 = 0;
                this.tables = null;
                this.externalTypes = [];
                this.module = null;
                this.assembly = null;
            }
            TableStream.prototype.read = function (tableReader, streams) {
                this.reserved0 = tableReader.readInt();
                this.version = tableReader.readByte() + "." + tableReader.readByte();
                this.heapSizes = tableReader.readByte();
                this.reserved1 = tableReader.readByte();
                var valid = tableReader.readLong();
                var sorted = tableReader.readLong();
                var tableCounts = this.readTableCounts(tableReader, valid);
                this.initTables(tableReader, tableCounts);
                this.readTables(tableReader, streams);
            };
            TableStream.prototype.readTableCounts = function (reader, valid) {
                var result = [];
                var bits = valid.lo;
                for(var tableIndex = 0; tableIndex < 32; tableIndex++) {
                    if(bits & 1) {
                        var rowCount = reader.readInt();
                        result[tableIndex] = rowCount;
                    }
                    bits = bits >> 1;
                }
                bits = valid.hi;
                for(var i = 0; i < 32; i++) {
                    var tableIndex = i + 32;
                    if(bits & 1) {
                        var rowCount = reader.readInt();
                        result[tableIndex] = rowCount;
                    }
                    bits = bits >> 1;
                }
                return result;
            };
            TableStream.prototype.initTables = function (reader, tableCounts) {
                this.tables = [];
                var tableTypes = [];
                for(var tk in TableKind) {
                    if(!TableKind.hasOwnProperty(tk)) {
                        continue;
                    }
                    var tkValue = TableKind[tk];
                    if(typeof (tkValue) !== "number") {
                        continue;
                    }
                    tableTypes[tkValue] = managed[tk];
                }
                for(var tableIndex = 0; tableIndex < tableCounts.length; tableIndex++) {
                    var rowCount = tableCounts[tableIndex];
                    if(!rowCount) {
                        continue;
                    }
                    this.initTable(tableIndex, rowCount, tableTypes[tableIndex]);
                }
            };
            TableStream.prototype.initTable = function (tableIndex, rowCount, TableType) {
                var tableRows = this.tables[tableIndex] = Array(rowCount);
                if(tableIndex === TableKind.ModuleDefinition && tableRows.length > 0) {
                    tableRows[0] = this.module;
                }
                if(tableIndex === TableKind.AssemblyDefinition && tableRows.length > 0) {
                    tableRows[0] = this.assembly;
                }
                for(var i = 0; i < rowCount; i++) {
                    if(!tableRows[i]) {
                        tableRows[i] = new TableType();
                    }
                    if(i === 0 && tableRows[i].isSingleton) {
                        break;
                    }
                }
            };
            TableStream.prototype.readTables = function (reader, streams) {
                var tableStreamReader = new TableStreamReader(reader, streams, this.tables);
                for(var tableIndex = 0; tableIndex < 64; tableIndex++) {
                    var tableRows = this.tables[tableIndex];
                    if(!tableRows) {
                        continue;
                    }
                    var singletonRow = null;
                    for(var i = 0; i < tableRows.length; i++) {
                        if(singletonRow) {
                            singletonRow.internalReadRow(tableStreamReader);
                            continue;
                        }
                        tableRows[i].internalReadRow(tableStreamReader);
                        if(i === 0) {
                            if(tableRows[i].isSingleton) {
                                singletonRow = tableRows[i];
                            }
                        }
                    }
                }
            };
            return TableStream;
        })();
        managed.TableStream = TableStream;        
        var AssemblyReader = (function () {
            function AssemblyReader() { }
            AssemblyReader.prototype.read = function (reader, assembly) {
                if(!assembly.headers) {
                    assembly.headers = new pe.headers.PEFileHeaders();
                    assembly.headers.read(reader);
                }
                reader.sections = assembly.headers.sectionHeaders;
                reader.setVirtualOffset(assembly.headers.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
                var cdi = new ClrDirectory();
                cdi.read(reader);
                var saveOffset = reader.offset;
                reader.setVirtualOffset(cdi.metadataDir.address);
                var cme = new ClrMetadata();
                cme.read(reader);
                var mes = new MetadataStreams();
                mes.read(cdi.metadataDir.address, cme.streamCount, reader);
                if(!assembly.modules) {
                    assembly.modules = [];
                }
                if(!assembly.modules[0]) {
                    assembly.modules[0] = new ModuleDefinition();
                }
                var mainModule = assembly.modules[0];
                mainModule.runtimeVersion = cdi.runtimeVersion;
                mainModule.imageFlags = cdi.imageFlags;
                mainModule.specificRuntimeVersion = cme.runtimeVersion;
                reader.setVirtualOffset(mes.tables.address);
                var tas = new TableStream();
                tas.module = mainModule;
                tas.assembly = assembly;
                tas.read(reader, mes);
                this.populateTypes(mainModule, tas.tables);
                if(tas.tables[TableKind.ExternalType]) {
                    mainModule.debugExternalTypeReferences = tas.tables[TableKind.ExternalType];
                }
                this.populateMembers(tas.tables[TableKind.TypeDefinition], function (parent) {
                    return parent.internalFieldList;
                }, function (parent) {
                    return parent.fields;
                }, tas.tables[TableKind.FieldDefinition], function (child) {
                    return child;
                });
                this.populateMembers(tas.tables[TableKind.TypeDefinition], function (parent) {
                    return parent.internalMethodList;
                }, function (parent) {
                    return parent.methods;
                }, tas.tables[TableKind.MethodDefinition], function (child) {
                    return child;
                });
                this.populateMembers(tas.tables[TableKind.MethodDefinition], function (parent) {
                    return parent.internalParamList;
                }, function (parent) {
                    return parent.parameters;
                }, tas.tables[TableKind.ParameterDefinition], function (child) {
                    return child;
                });
                reader.offset = saveOffset;
            };
            AssemblyReader.prototype.populateTypes = function (mainModule, tables) {
                mainModule.types = tables[TableKind.TypeDefinition];
                if(!mainModule.types) {
                    mainModule.types = [];
                }
            };
            AssemblyReader.prototype.populateMembers = function (parentTable, getChildIndex, getChildren, childTable, getChildEntity) {
                if(!parentTable) {
                    return;
                }
                var childIndex = 0;
                for(var iParent = 0; iParent < parentTable.length; iParent++) {
                    var childCount = !childTable ? 0 : iParent + 1 < parentTable.length ? getChildIndex(parentTable[iParent + 1]) - 1 - childIndex : childTable.length - childIndex;
                    var parent = parentTable[iParent];
                    var children = getChildren(parent);
                    children.length = childCount;
                    for(var iChild = 0; iChild < childCount; iChild++) {
                        var entity = getChildEntity(childTable[childIndex + iChild]);
                        children[iChild] = entity;
                    }
                    childIndex += childCount;
                }
            };
            return AssemblyReader;
        })();
        managed.AssemblyReader = AssemblyReader;        
        var AssemblyOS = (function () {
            function AssemblyOS() { }
            AssemblyOS.prototype.internalReadRow = function (reader) {
                this.osplatformID = reader.readInt();
                this.osVersion = reader.readInt() + "." + reader.readInt();
            };
            return AssemblyOS;
        })();
        managed.AssemblyOS = AssemblyOS;        
        var AssemblyProcessor = (function () {
            function AssemblyProcessor() { }
            AssemblyProcessor.prototype.internalReadRow = function (reader) {
                this.processor = reader.readInt();
            };
            return AssemblyProcessor;
        })();
        managed.AssemblyProcessor = AssemblyProcessor;        
        var AssemblyRef = (function () {
            function AssemblyRef() { }
            AssemblyRef.prototype.internalReadRow = function (reader) {
                if(!this.definition) {
                    this.definition = new AssemblyDefinition();
                }
                this.definition.version = reader.readShort() + "." + reader.readShort() + "." + reader.readShort() + "." + reader.readShort();
                this.definition.flags = reader.readInt();
                this.definition.publicKey = reader.readBlobHex();
                this.definition.name = reader.readString();
                this.definition.culture = reader.readString();
                this.hashValue = reader.readBlobHex();
            };
            AssemblyRef.prototype.toString = function () {
                return this.definition + " #" + this.hashValue;
            };
            return AssemblyRef;
        })();
        managed.AssemblyRef = AssemblyRef;        
        var AssemblyRefOS = (function () {
            function AssemblyRefOS() { }
            AssemblyRefOS.prototype.internalReadRow = function (reader) {
                if(!this.definition) {
                    this.definition = new AssemblyDefinition();
                }
                this.definition.version = reader.readShort() + "." + reader.readShort() + "." + reader.readShort() + "." + reader.readShort();
                this.definition.flags = reader.readInt();
                this.definition.publicKey = reader.readBlobHex();
                this.definition.name = reader.readString();
                this.definition.culture = reader.readString();
                this.hashValue = reader.readBlobHex();
            };
            return AssemblyRefOS;
        })();
        managed.AssemblyRefOS = AssemblyRefOS;        
        var AssemblyRefProcessor = (function () {
            function AssemblyRefProcessor() { }
            AssemblyRefProcessor.prototype.internalReadRow = function (reader) {
                this.processor = reader.readInt();
            };
            return AssemblyRefProcessor;
        })();
        managed.AssemblyRefProcessor = AssemblyRefProcessor;        
        var ClassLayout = (function () {
            function ClassLayout() { }
            ClassLayout.prototype.internalReadRow = function (reader) {
                this.packingSize = reader.readShort();
                this.classSize = reader.readInt();
                this.parent = reader.readTableRowIndex(TableKind.TypeDefinition);
            };
            return ClassLayout;
        })();
        managed.ClassLayout = ClassLayout;        
        var ClrDirectory = (function () {
            function ClrDirectory() {
                this.cb = 0;
                this.runtimeVersion = "";
                this.imageFlags = 0;
                this.metadataDir = null;
                this.entryPointToken = 0;
                this.resourcesDir = null;
                this.strongNameSignatureDir = null;
                this.codeManagerTableDir = null;
                this.vtableFixupsDir = null;
                this.exportAddressTableJumpsDir = null;
                this.managedNativeHeaderDir = null;
            }
            ClrDirectory.clrHeaderSize = 72;
            ClrDirectory.prototype.read = function (clrDirReader) {
                this.cb = clrDirReader.readInt();
                if(this.cb < ClrDirectory.clrHeaderSize) {
                    throw new Error("Unexpectedly short CLR header structure " + this.cb + " reported by Cb field " + "(expected at least " + ClrDirectory.clrHeaderSize + ").");
                }
                this.runtimeVersion = clrDirReader.readShort() + "." + clrDirReader.readShort();
                this.metadataDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                this.imageFlags = clrDirReader.readInt();
                this.entryPointToken = clrDirReader.readInt();
                this.resourcesDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                this.strongNameSignatureDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                this.codeManagerTableDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                this.vtableFixupsDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                this.exportAddressTableJumpsDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                this.managedNativeHeaderDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
            };
            return ClrDirectory;
        })();
        managed.ClrDirectory = ClrDirectory;        
        var ClrMetadata = (function () {
            function ClrMetadata() {
                this.mdSignature = ClrMetadataSignature.Signature;
                this.metadataVersion = "";
                this.runtimeVersion = "";
                this.mdReserved = 0;
                this.mdFlags = 0;
                this.streamCount = 0;
            }
            ClrMetadata.prototype.read = function (reader) {
                this.mdSignature = reader.readInt();
                if(this.mdSignature != ClrMetadataSignature.Signature) {
                    throw new Error("Invalid CLR metadata signature field " + (this.mdSignature).toString(16) + "h (expected " + (ClrMetadataSignature.Signature).toString(16).toUpperCase() + "h).");
                }
                this.metadataVersion = reader.readShort() + "." + reader.readShort();
                this.mdReserved = reader.readInt();
                var metadataStringVersionLength = reader.readInt();
                this.runtimeVersion = reader.readZeroFilledAscii(metadataStringVersionLength);
                this.mdFlags = reader.readShort();
                this.streamCount = reader.readShort();
            };
            return ClrMetadata;
        })();
        managed.ClrMetadata = ClrMetadata;        
        var Constant = (function () {
            function Constant() {
                this.isSingleton = true;
            }
            Constant.prototype.internalReadRow = function (reader) {
                var type = reader.readByte();
                var padding = reader.readByte();
                var parent = reader.readHasConstant();
                var constValue = new ConstantValue(KnownType.internalGetByElementName(type), reader.readConstantValue(type));
                parent.value = constValue;
            };
            return Constant;
        })();
        managed.Constant = Constant;        
        var CustomAttribute = (function () {
            function CustomAttribute() { }
            CustomAttribute.prototype.internalReadRow = function (reader) {
                this.parent = reader.readHasCustomAttribute();
                this.type = reader.readCustomAttributeType();
                var attrBlob = reader.readBlob();
                this.value = new CustomAttributeData();
            };
            return CustomAttribute;
        })();
        managed.CustomAttribute = CustomAttribute;        
        var DeclSecurity = (function () {
            function DeclSecurity() { }
            DeclSecurity.prototype.internalReadRow = function (reader) {
                this.action = reader.readShort();
                this.parent = reader.readHasDeclSecurity();
                this.permissionSet = reader.readBlob();
            };
            return DeclSecurity;
        })();
        managed.DeclSecurity = DeclSecurity;        
        var Event = (function () {
            function Event() { }
            Event.prototype.internalReadRow = function (reader) {
                this.eventFlags = reader.readShort();
                this.name = reader.readString();
                this.eventType = reader.readTypeDefOrRef();
            };
            return Event;
        })();
        managed.Event = Event;        
        var EventMap = (function () {
            function EventMap() { }
            EventMap.prototype.internalReadRow = function (reader) {
                this.parent = reader.readTableRowIndex(TableKind.TypeDefinition);
                this.eventList = reader.readTableRowIndex(TableKind.Event);
            };
            return EventMap;
        })();
        managed.EventMap = EventMap;        
        var ExportedType = (function () {
            function ExportedType() { }
            ExportedType.prototype.internalReadRow = function (reader) {
                this.flags = reader.readInt();
                this.typeDefId = reader.readInt();
                this.typeName = reader.readString();
                this.typeNamespace = reader.readString();
                this.implementation = reader.readImplementation();
            };
            return ExportedType;
        })();
        managed.ExportedType = ExportedType;        
        var FieldLayout = (function () {
            function FieldLayout() { }
            FieldLayout.prototype.internalReadRow = function (reader) {
                this.offset = reader.readInt();
                this.field = reader.readTableRowIndex(TableKind.FieldDefinition);
            };
            return FieldLayout;
        })();
        managed.FieldLayout = FieldLayout;        
        var FieldMarshal = (function () {
            function FieldMarshal() { }
            FieldMarshal.prototype.internalReadRow = function (reader) {
                this.parent = reader.readHasFieldMarshal();
                this.nativeType = new MarshalSpec(reader.readBlob());
            };
            return FieldMarshal;
        })();
        managed.FieldMarshal = FieldMarshal;        
        var MarshalSpec = (function () {
            function MarshalSpec(blob) {
                this.blob = blob;
            }
            return MarshalSpec;
        })();
        managed.MarshalSpec = MarshalSpec;        
        var FieldRVA = (function () {
            function FieldRVA() { }
            FieldRVA.prototype.internalReadRow = function (reader) {
                this.rva = reader.readInt();
                this.field = reader.readTableRowIndex(TableKind.FieldDefinition);
            };
            return FieldRVA;
        })();
        managed.FieldRVA = FieldRVA;        
        var File = (function () {
            function File() { }
            File.prototype.internalReadRow = function (reader) {
                this.flags = reader.readInt();
                this.name = reader.readString();
                this.hashValue = reader.readBlobHex();
            };
            return File;
        })();
        managed.File = File;        
        var GenericParam = (function () {
            function GenericParam() { }
            GenericParam.prototype.internalReadRow = function (reader) {
                this.number = reader.readShort();
                this.flags = reader.readShort();
                this.owner = reader.readTypeOrMethodDef();
                this.name = reader.readString();
            };
            return GenericParam;
        })();
        managed.GenericParam = GenericParam;        
        var GenericParamConstraint = (function () {
            function GenericParamConstraint() { }
            GenericParamConstraint.prototype.internalReadRow = function (reader) {
                this.owner = reader.readTableRowIndex(TableKind.GenericParam);
                this.constraint = reader.readTypeDefOrRef();
            };
            return GenericParamConstraint;
        })();
        managed.GenericParamConstraint = GenericParamConstraint;        
        var ImplMap = (function () {
            function ImplMap() { }
            ImplMap.prototype.internalReadRow = function (reader) {
                this.mappingFlags = reader.readShort();
                this.memberForwarded = reader.readMemberForwarded();
                this.importName = reader.readString();
                this.importScope = reader.readTableRowIndex(TableKind.ModuleRef);
            };
            return ImplMap;
        })();
        managed.ImplMap = ImplMap;        
        var InterfaceImpl = (function () {
            function InterfaceImpl() { }
            InterfaceImpl.prototype.internalReadRow = function (reader) {
                this.classIndex = reader.readTableRowIndex(TableKind.TypeDefinition);
                this.interface = reader.readTypeDefOrRef();
            };
            return InterfaceImpl;
        })();
        managed.InterfaceImpl = InterfaceImpl;        
        var ManifestResource = (function () {
            function ManifestResource() { }
            ManifestResource.prototype.internalReadRow = function (reader) {
                this.offset = reader.readInt();
                this.flags = reader.readInt();
                this.name = reader.readString();
                this.implementation = reader.readImplementation();
            };
            return ManifestResource;
        })();
        managed.ManifestResource = ManifestResource;        
        var MemberRef = (function () {
            function MemberRef() { }
            MemberRef.prototype.internalReadRow = function (reader) {
                this.classIndex = reader.readMemberRefParent();
                this.name = reader.readString();
                this.signature = reader.readMemberSignature();
            };
            return MemberRef;
        })();
        managed.MemberRef = MemberRef;        
        var MetadataStreams = (function () {
            function MetadataStreams() {
                this.guids = [];
                this.strings = null;
                this.blobs = null;
                this.tables = null;
            }
            MetadataStreams.prototype.read = function (metadataBaseAddress, streamCount, reader) {
                var guidRange;
                for(var i = 0; i < streamCount; i++) {
                    var range = new pe.io.AddressRange(reader.readInt(), reader.readInt());
                    range.address += metadataBaseAddress;
                    var name = this.readAlignedNameString(reader);
                    switch(name) {
                        case "#GUID": {
                            guidRange = range;
                            continue;

                        }
                        case "#Strings": {
                            this.strings = range;
                            continue;

                        }
                        case "#Blob": {
                            this.blobs = range;
                            continue;

                        }
                        case "#~":
                        case "#-": {
                            this.tables = range;
                            continue;

                        }
                    }
                    (this)[name] = range;
                }
                if(guidRange) {
                    var saveOffset = reader.offset;
                    reader.setVirtualOffset(guidRange.address);
                    this.guids = Array(guidRange.size / 16);
                    for(var i = 0; i < this.guids.length; i++) {
                        var guid = this.readGuidForStream(reader);
                        this.guids[i] = guid;
                    }
                    reader.offset = saveOffset;
                }
            };
            MetadataStreams.prototype.readAlignedNameString = function (reader) {
                var result = "";
                while(true) {
                    var b = reader.readByte();
                    if(b == 0) {
                        break;
                    }
                    result += String.fromCharCode(b);
                }
                var skipCount = -1 + ((result.length + 4) & ~3) - result.length;
                for(var i = 0; i < skipCount; i++) {
                    reader.readByte();
                }
                return result;
            };
            MetadataStreams.prototype.readGuidForStream = function (reader) {
                var guid = "{";
                for(var i = 0; i < 4; i++) {
                    var hex = reader.readInt().toString(16);
                    guid += "00000000".substring(0, 8 - hex.length) + hex;
                }
                guid += "}";
                return guid;
            };
            return MetadataStreams;
        })();
        managed.MetadataStreams = MetadataStreams;        
        var MethodImpl = (function () {
            function MethodImpl() { }
            MethodImpl.prototype.internalReadRow = function (reader) {
                this.classIndex = reader.readTableRowIndex(TableKind.TypeDefinition);
                this.methodBody = reader.readMethodDefOrRef();
                this.methodDeclaration = reader.readMethodDefOrRef();
            };
            return MethodImpl;
        })();
        managed.MethodImpl = MethodImpl;        
        var MethodSemantics = (function () {
            function MethodSemantics() { }
            MethodSemantics.prototype.internalReadRow = function (reader) {
                this.semantics = reader.readShort();
                this.method = reader.readTableRowIndex(TableKind.MethodDefinition);
                this.association = reader.readHasSemantics();
            };
            return MethodSemantics;
        })();
        managed.MethodSemantics = MethodSemantics;        
        var MethodSpec = (function () {
            function MethodSpec() {
                this.instantiation = [];
            }
            MethodSpec.prototype.internalReadRow = function (reader) {
                this.method = reader.readMethodDefOrRef();
                reader.readMethodSpec(this.instantiation);
            };
            return MethodSpec;
        })();
        managed.MethodSpec = MethodSpec;        
        var MethodSpecSig = (function () {
            function MethodSpecSig(blob) {
                this.blob = blob;
            }
            return MethodSpecSig;
        })();
        managed.MethodSpecSig = MethodSpecSig;        
        var ModuleRef = (function () {
            function ModuleRef() { }
            ModuleRef.prototype.internalReadRow = function (reader) {
                this.name = reader.readString();
            };
            return ModuleRef;
        })();
        managed.ModuleRef = ModuleRef;        
        var NestedClass = (function () {
            function NestedClass() { }
            NestedClass.prototype.internalReadRow = function (reader) {
                this.nestedClass = reader.readTableRowIndex(TableKind.TypeDefinition);
                this.enclosingClass = reader.readTableRowIndex(TableKind.TypeDefinition);
            };
            return NestedClass;
        })();
        managed.NestedClass = NestedClass;        
        var PropertyMap = (function () {
            function PropertyMap() { }
            PropertyMap.prototype.internalReadRow = function (reader) {
                this.parent = reader.readTableRowIndex(TableKind.TypeDefinition);
                this.propertyList = reader.readTableRowIndex(TableKind.PropertyDefinition);
            };
            return PropertyMap;
        })();
        managed.PropertyMap = PropertyMap;        
        var StandAloneSig = (function () {
            function StandAloneSig() { }
            StandAloneSig.prototype.internalReadRow = function (reader) {
                this.signatureBlob = reader.readBlob();
            };
            return StandAloneSig;
        })();
        managed.StandAloneSig = StandAloneSig;        
        var TypeSpec = (function () {
            function TypeSpec() { }
            TypeSpec.prototype.internalReadRow = function (reader) {
                this.definition = reader.readBlob();
            };
            return TypeSpec;
        })();
        managed.TypeSpec = TypeSpec;        
    })(pe.managed || (pe.managed = {}));
    var managed = pe.managed;
})(pe || (pe = {}));
var pe;
(function (pe) {
    (function (managed2) {
        var AppDomain = (function () {
            function AppDomain() {
                this.assemblies = [];
                this.mscorlib = new Assembly();
                this.mscorlib.name = "mscorlib";
                var objectType = new Type(null, this.mscorlib, "System", "Object");
                var valueType = new Type(objectType, this.mscorlib, "System", "ValueType");
                var enumType = new Type(valueType, this.mscorlib, "System", "Enum");
                this.mscorlib.types.push(new Type(valueType, this.mscorlib, "System", "Void"), new Type(valueType, this.mscorlib, "System", "Boolean"), new Type(valueType, this.mscorlib, "System", "Char"), new Type(valueType, this.mscorlib, "System", "SByte"), new Type(valueType, this.mscorlib, "System", "Byte"), new Type(valueType, this.mscorlib, "System", "Int16"), new Type(valueType, this.mscorlib, "System", "UInt16"), new Type(valueType, this.mscorlib, "System", "Int32"), new Type(valueType, this.mscorlib, "System", "UInt32"), new Type(valueType, this.mscorlib, "System", "Int64"), new Type(valueType, this.mscorlib, "System", "UInt64"), new Type(valueType, this.mscorlib, "System", "Single"), new Type(valueType, this.mscorlib, "System", "Double"), new Type(valueType, this.mscorlib, "System", "String"), new Type(objectType, this.mscorlib, "System", "TypedReference"), new Type(valueType, this.mscorlib, "System", "IntPtr"), new Type(valueType, this.mscorlib, "System", "UIntPtr"), objectType, valueType, enumType, new Type(objectType, this.mscorlib, "System", "Type"));
                this.assemblies.push(this.mscorlib);
            }
            AppDomain.prototype.read = function (reader) {
                var context = new AssemblyReading(this);
                var result = context.read(reader);
                this.assemblies.push(result);
                return result;
            };
            AppDomain.prototype.resolveAssembly = function (name, version, publicKey, culture) {
                var asm;
                for(var i = 0; i < this.assemblies.length; i++) {
                    var asm = this.assemblies[i];
                    if((asm.name && name && asm.name.toLowerCase() === name.toLowerCase()) || (!asm.name && !name)) {
                        return asm;
                    }
                }
                if(name && name.toLowerCase() === "mscorlib" && this.assemblies[0].isSpeculative) {
                    return this.assemblies[0];
                }
                asm = new Assembly();
                asm.name = name;
                asm.version = version;
                asm.publicKey = publicKey;
                asm.culture = culture;
                return asm;
            };
            return AppDomain;
        })();
        managed2.AppDomain = AppDomain;        
        var Assembly = (function () {
            function Assembly() {
                this.fileHeaders = new pe.headers.PEFileHeaders();
                this.name = "";
                this.version = null;
                this.publicKey = null;
                this.culture = null;
                this.attributes = 0;
                this.isSpeculative = true;
                this.runtimeVersion = "";
                this.specificRuntimeVersion = "";
                this.imageFlags = 0;
                this.metadataVersion = "";
                this.tableStreamVersion = "";
                this.generation = 0;
                this.moduleName = "";
                this.mvid = "";
                this.encId = "";
                this.encBaseId = "";
                this.types = [];
                this.customAttributes = [];
            }
            Assembly.prototype.toString = function () {
                return this.name + ", Version=" + this.version + ", Culture=" + (this.culture ? this.culture : "neutral") + ", PublicKeyToken=" + (this.publicKey && this.publicKey.length ? this.publicKey : "null");
            };
            return Assembly;
        })();
        managed2.Assembly = Assembly;        
        var Type = (function () {
            function Type(baseType, assembly, namespace, name) {
                this.baseType = baseType;
                this.assembly = assembly;
                this.namespace = namespace;
                this.name = name;
                this.isSpeculative = true;
                this.attributes = 0;
                this.fields = [];
                this.methods = [];
                this.properties = [];
                this.events = [];
                this.customAttributes = [];
            }
            Type.prototype.getBaseType = function () {
                return this.baseType;
            };
            Type.prototype.getAssembly = function () {
                return this.assembly;
            };
            Type.prototype.getFullName = function () {
                if(this.namespace && this.namespace.length) {
                    return this.namespace + "." + this.name;
                } else {
                    return this.name;
                }
            };
            Type.prototype.toString = function () {
                return this.getFullName();
            };
            return Type;
        })();
        managed2.Type = Type;        
        var ConstructedGenericType = (function () {
            function ConstructedGenericType(genericType, genericArguments) {
                this.genericType = genericType;
                this.genericArguments = genericArguments;
            }
            ConstructedGenericType.prototype.getBaseType = function () {
                return this.genericType.getBaseType();
            };
            ConstructedGenericType.prototype.getAssembly = function () {
                return this.genericType.getAssembly();
            };
            ConstructedGenericType.prototype.getFullName = function () {
                return this.genericType.getFullName() + "[" + this.genericArguments.join(",") + "]";
            };
            ConstructedGenericType.prototype.toString = function () {
                return this.getFullName();
            };
            return ConstructedGenericType;
        })();
        managed2.ConstructedGenericType = ConstructedGenericType;        
        var FieldInfo = (function () {
            function FieldInfo() {
                this.attributes = 0;
                this.name = "";
                this.fieldType = null;
            }
            return FieldInfo;
        })();
        managed2.FieldInfo = FieldInfo;        
        var PropertyInfo = (function () {
            function PropertyInfo() {
                this.propertyType = null;
            }
            return PropertyInfo;
        })();
        managed2.PropertyInfo = PropertyInfo;        
        var MethodInfo = (function () {
            function MethodInfo() { }
            return MethodInfo;
        })();
        managed2.MethodInfo = MethodInfo;        
        var ParameterInfo = (function () {
            function ParameterInfo() { }
            return ParameterInfo;
        })();
        managed2.ParameterInfo = ParameterInfo;        
        var EventInfo = (function () {
            function EventInfo() { }
            return EventInfo;
        })();
        managed2.EventInfo = EventInfo;        
        var AssemblyReading = (function () {
            function AssemblyReading(appDomain) {
                this.appDomain = appDomain;
                this.reader = null;
                this.fileHeaders = null;
                this.clrDirectory = null;
                this.clrMetadata = null;
                this.metadataStreams = null;
                this.tableStream = null;
            }
            AssemblyReading.prototype.read = function (reader) {
                this.reader = reader;
                this.readFileHeaders();
                this.readClrDirectory();
                this.readClrMetadata();
                this.readMetadataStreams();
                this.readTableStream();
                this.populateStrings(this.tableStream.stringIndices, reader);
                return this._createAssemblyFromTables();
            };
            AssemblyReading.prototype._createAssemblyFromTables = function () {
                var stringIndices = this.tableStream.stringIndices;
                var assemblyTable = this.tableStream.tables[32];
                if(!assemblyTable || !assemblyTable.length) {
                    return;
                }
                var assemblyRow = assemblyTable[0];
                var typeDefTable = this.tableStream.tables[2];
                var assembly = this._getMscorlibIfThisShouldBeOne();
                var replaceMscorlibTypes = assembly ? assembly.types.slice(0, assembly.types.length) : null;
                if(!assembly) {
                    assembly = new Assembly();
                }
                assembly.name = stringIndices[assemblyRow.name];
                assembly.version = assemblyRow.majorVersion + "." + assemblyRow.minorVersion + "." + assemblyRow.revisionNumber + "." + assemblyRow.buildNumber;
                assembly.attributes = assemblyRow.flags;
                assembly.publicKey = this._readBlobHex(assemblyRow.publicKey);
                assembly.culture = stringIndices[assemblyRow.culture];
                var referencedAssemblies = [];
                var assemblyRefTable = this.tableStream.tables[35];
                if(assemblyRefTable) {
                    for(var i = 0; i < assemblyRefTable.length; i++) {
                        var assemblyRefRow = assemblyRefTable[i];
                        var assemblyRefName = stringIndices[assemblyRow.name];
                        var assemblyRefVersion = assemblyRow.majorVersion + "." + assemblyRow.minorVersion + "." + assemblyRow.revisionNumber + "." + assemblyRow.buildNumber;
                        var assemblyRefAttributes = assemblyRow.flags;
                        var assemblyRefPublicKey = this._readBlobHex(assemblyRow.publicKey);
                        var assemblyRefCulture = stringIndices[assemblyRow.culture];
                        var referencedAssembly = this.appDomain.resolveAssembly(assemblyRefName, assemblyRefVersion, assemblyRefPublicKey, assemblyRefCulture);
                        if(referencedAssembly.isSpeculative) {
                            referencedAssembly.attributes = assemblyRefAttributes;
                        }
                        referencedAssemblies.push(referencedAssembly);
                    }
                }
                for(var i = 0; i < typeDefTable.length; i++) {
                    var typeDefRow = typeDefTable[i];
                    var typeName = stringIndices[typeDefRow.name];
                    var typeNamespace = stringIndices[typeDefRow.namespace];
                    var type = null;
                    if(replaceMscorlibTypes && typeNamespace === "System") {
                        for(var ityp = 0; ityp < replaceMscorlibTypes.length; ityp++) {
                            var typ = replaceMscorlibTypes[ityp];
                            if(typ.name === typeName) {
                                type = typ;
                                break;
                            }
                        }
                    }
                    if(!type) {
                        type = new Type(null, assembly, typeNamespace, typeName);
                        assembly.types.push(type);
                    }
                    type.isSpeculative = false;
                }
                assembly.isSpeculative = false;
                return assembly;
            };
            AssemblyReading.prototype._getMscorlibIfThisShouldBeOne = function () {
                var stringIndices = this.tableStream.stringIndices;
                var assemblyTable = this.tableStream.tables[32];
                if(!assemblyTable || !assemblyTable.length) {
                    return null;
                }
                var assemblyRow = assemblyTable[0];
                var simpleAssemblyName = stringIndices[assemblyRow.name];
                if(!simpleAssemblyName || simpleAssemblyName.toLowerCase() !== "mscorlib") {
                    return null;
                }
                if(!this.appDomain.assemblies[0].isSpeculative) {
                    return null;
                }
                var typeDefTable = this.tableStream.tables[2];
                if(!typeDefTable) {
                    return null;
                }
                var containsSystemObject = false;
                var containsSystemString = false;
                for(var i = 0; i < typeDefTable.length; i++) {
                    var typeDefRow = typeDefTable[i];
                    var name = stringIndices[typeDefRow.name];
                    var namespace = stringIndices[typeDefRow.namespace];
                    if(namespace !== "System") {
                        continue;
                    }
                    if(name === "Object") {
                        containsSystemObject = true;
                    } else {
                        if(name === "String") {
                            containsSystemString = true;
                        }
                    }
                }
                if(containsSystemObject && containsSystemString) {
                    return this.appDomain.assemblies[0];
                } else {
                    return null;
                }
            };
            AssemblyReading.prototype._readBlobHex = function (blobIndex) {
                var saveOffset = this.reader.offset;
                this.reader.setVirtualOffset(this.metadataStreams.blobs.address + blobIndex);
                var length = this._readBlobSize();
                var result = "";
                for(var i = 0; i < length; i++) {
                    var hex = this.reader.readByte().toString(16);
                    if(hex.length == 1) {
                        result += "0";
                    }
                    result += hex;
                }
                this.reader.offset = saveOffset;
                return result.toUpperCase();
            };
            AssemblyReading.prototype._readBlobSize = function () {
                var length;
                var b0 = this.reader.readByte();
                if(b0 < 128) {
                    length = b0;
                } else {
                    var b1 = this.reader.readByte();
                    if((b0 & 192) == 128) {
                        length = ((b0 & 63) << 8) + b1;
                    } else {
                        var b2 = this.reader.readByte();
                        var b3 = this.reader.readByte();
                        length = ((b0 & 63) << 24) + (b1 << 16) + (b2 << 8) + b3;
                    }
                }
                return length;
            };
            AssemblyReading.prototype.readFileHeaders = function () {
                this.fileHeaders = new pe.headers.PEFileHeaders();
                this.fileHeaders.read(this.reader);
                this.reader.sections = this.fileHeaders.sectionHeaders;
            };
            AssemblyReading.prototype.readClrDirectory = function () {
                var clrDataDirectory = this.fileHeaders.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr];
                this.reader.setVirtualOffset(clrDataDirectory.address);
                this.clrDirectory = new ClrDirectory();
                this.clrDirectory.read(this.reader);
            };
            AssemblyReading.prototype.readClrMetadata = function () {
                this.reader.setVirtualOffset(this.clrDirectory.metadataDir.address);
                this.clrMetadata = new ClrMetadata();
                this.clrMetadata.read(this.reader);
            };
            AssemblyReading.prototype.readMetadataStreams = function () {
                this.metadataStreams = new MetadataStreams();
                this.metadataStreams.read(this.clrDirectory.metadataDir.address, this.clrMetadata.streamCount, this.reader);
            };
            AssemblyReading.prototype.readTableStream = function () {
                this.tableStream = new TableStream();
                this.tableStream.read(this.reader, this.metadataStreams.strings.size, this.metadataStreams.guids.length, this.metadataStreams.blobs.size);
            };
            AssemblyReading.prototype.populateStrings = function (stringIndices, reader) {
                var saveOffset = reader.offset;
                stringIndices[0] = null;
                for(var i in stringIndices) {
                    if(i > 0) {
                        var iNum = Number(i);
                        reader.setVirtualOffset(this.metadataStreams.strings.address + iNum);
                        stringIndices[iNum] = reader.readUtf8Z(1024 * 1024 * 1024);
                    }
                }
            };
            return AssemblyReading;
        })();        
        var ClrDirectory = (function () {
            function ClrDirectory() {
                this.cb = 0;
                this.runtimeVersion = "";
                this.imageFlags = 0;
                this.metadataDir = null;
                this.entryPointToken = 0;
                this.resourcesDir = null;
                this.strongNameSignatureDir = null;
                this.codeManagerTableDir = null;
                this.vtableFixupsDir = null;
                this.exportAddressTableJumpsDir = null;
                this.managedNativeHeaderDir = null;
            }
            ClrDirectory._clrHeaderSize = 72;
            ClrDirectory.prototype.read = function (readerAtClrDataDirectory) {
                var clrDirReader = readerAtClrDataDirectory;
                this.cb = clrDirReader.readInt();
                if(this.cb < ClrDirectory._clrHeaderSize) {
                    throw new Error("Unexpectedly short CLR header structure " + this.cb + " reported by Cb field " + "(expected at least " + ClrDirectory._clrHeaderSize + ").");
                }
                this.runtimeVersion = clrDirReader.readShort() + "." + clrDirReader.readShort();
                this.metadataDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                this.imageFlags = clrDirReader.readInt();
                this.entryPointToken = clrDirReader.readInt();
                this.resourcesDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                this.strongNameSignatureDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                this.codeManagerTableDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                this.vtableFixupsDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                this.exportAddressTableJumpsDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                this.managedNativeHeaderDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
            };
            return ClrDirectory;
        })();        
        var ClrMetadata = (function () {
            function ClrMetadata() {
                this.mdSignature = metadata.ClrMetadataSignature.Signature;
                this.metadataVersion = "";
                this.runtimeVersion = "";
                this.mdReserved = 0;
                this.mdFlags = 0;
                this.streamCount = 0;
            }
            ClrMetadata.prototype.read = function (clrDirReader) {
                this.mdSignature = clrDirReader.readInt();
                if(this.mdSignature != metadata.ClrMetadataSignature.Signature) {
                    throw new Error("Invalid CLR metadata signature field " + (this.mdSignature).toString(16) + "h (expected " + (metadata.ClrMetadataSignature.Signature).toString(16).toUpperCase() + "h).");
                }
                this.metadataVersion = clrDirReader.readShort() + "." + clrDirReader.readShort();
                this.mdReserved = clrDirReader.readInt();
                var metadataStringVersionLength = clrDirReader.readInt();
                this.runtimeVersion = clrDirReader.readZeroFilledAscii(metadataStringVersionLength);
                this.mdFlags = clrDirReader.readShort();
                this.streamCount = clrDirReader.readShort();
            };
            return ClrMetadata;
        })();        
        var MetadataStreams = (function () {
            function MetadataStreams() {
                this.guids = [];
                this.strings = null;
                this.blobs = null;
                this.tables = null;
            }
            MetadataStreams.prototype.read = function (metadataBaseAddress, streamCount, reader) {
                var guidRange;
                for(var i = 0; i < streamCount; i++) {
                    var range = new pe.io.AddressRange(reader.readInt(), reader.readInt());
                    range.address += metadataBaseAddress;
                    var name = this._readAlignedNameString(reader);
                    switch(name) {
                        case "#GUID": {
                            guidRange = range;
                            continue;

                        }
                        case "#Strings": {
                            this.strings = range;
                            continue;

                        }
                        case "#Blob": {
                            this.blobs = range;
                            continue;

                        }
                        case "#~":
                        case "#-": {
                            this.tables = range;
                            continue;

                        }
                    }
                    (this)[name] = range;
                }
                if(guidRange) {
                    var saveOffset = reader.offset;
                    reader.setVirtualOffset(guidRange.address);
                    this.guids = Array(guidRange.size / 16);
                    for(var i = 0; i < this.guids.length; i++) {
                        var guid = this._readGuidForStream(reader);
                        this.guids[i] = guid;
                    }
                    reader.offset = saveOffset;
                }
            };
            MetadataStreams.prototype._readAlignedNameString = function (reader) {
                var result = "";
                while(true) {
                    var b = reader.readByte();
                    if(b == 0) {
                        break;
                    }
                    result += String.fromCharCode(b);
                }
                var skipCount = -1 + ((result.length + 4) & ~3) - result.length;
                for(var i = 0; i < skipCount; i++) {
                    reader.readByte();
                }
                return result;
            };
            MetadataStreams.prototype._readGuidForStream = function (reader) {
                var guid = "{";
                for(var i = 0; i < 4; i++) {
                    var hex = reader.readInt().toString(16);
                    guid += "00000000".substring(0, 8 - hex.length) + hex;
                }
                guid += "}";
                return guid;
            };
            return MetadataStreams;
        })();        
        var TableStream = (function () {
            function TableStream() {
                this.reserved0 = 0;
                this.version = "";
                this.heapSizes = 0;
                this.reserved1 = 0;
                this.tables = [];
                this.stringIndices = [];
                this.allTypes = [];
                this.allFields = [];
                this.allMethods = [];
                this.allParameters = [];
            }
            TableStream.prototype.read = function (reader, stringCount, guidCount, blobCount) {
                this.reserved0 = reader.readInt();
                this.version = reader.readByte() + "." + reader.readByte();
                this.heapSizes = reader.readByte();
                this.reserved1 = reader.readByte();
                var valid = reader.readLong();
                var sorted = reader.readLong();
                var tableCounts = this._readTableRowCounts(valid, reader);
                this._populateApiObjects(tableCounts);
                var tableTypes = this._populateTableTypes();
                this._populateTableRows(tableCounts, tableTypes);
                var reader = new TableReader(reader, this.tables, stringCount, guidCount, blobCount);
                this._readTableRows(tableCounts, tableTypes, reader);
                this.stringIndices = reader.stringIndices;
            };
            TableStream.prototype._readTableRowCounts = function (valid, tableReader) {
                var tableCounts = [];
                var bits = valid.lo;
                for(var tableIndex = 0; tableIndex < 32; tableIndex++) {
                    if(bits & 1) {
                        var rowCount = tableReader.readInt();
                        tableCounts[tableIndex] = rowCount;
                    }
                    bits = bits >> 1;
                }
                bits = valid.hi;
                for(var i = 0; i < 32; i++) {
                    var tableIndex = i + 32;
                    if(bits & 1) {
                        var rowCount = tableReader.readInt();
                        tableCounts[tableIndex] = rowCount;
                    }
                    bits = bits >> 1;
                }
                return tableCounts;
            };
            TableStream.prototype._populateApiObjects = function (tableCounts) {
                this._populateTableObjects(this.allTypes, Type, tableCounts[2]);
                this._populateTableObjects(this.allFields, FieldInfo, tableCounts[4]);
                this._populateTableObjects(this.allMethods, MethodInfo, tableCounts[6]);
            };
            TableStream.prototype._populateTableObjects = function (table, Ctor, count) {
                for(var i = 0; i < count; i++) {
                    table.push(new Ctor());
                }
            };
            TableStream.prototype._populateTableTypes = function () {
                var tableTypes = [];
                for(var p in tables) {
                    var table = tables[p];
                    if(typeof (table) === "function") {
                        var dummyRow = new table();
                        tableTypes[dummyRow.TableKind] = table;
                    }
                }
                return tableTypes;
            };
            TableStream.prototype._populateTableRows = function (tableCounts, tableTypes) {
                for(var i = 0; i < tableCounts.length; i++) {
                    var table = [];
                    this.tables[i] = table;
                    var TableType = tableTypes[i];
                    if(typeof (TableType) === "undefined") {
                        if(tableCounts[i]) {
                            throw new Error("Table 0x" + i.toString(16).toUpperCase() + " has " + tableCounts[i] + " rows but no definition.");
                        }
                        continue;
                    }
                    this._populateTableObjects(table, TableType, tableCounts[i]);
                }
            };
            TableStream.prototype._readTableRows = function (tableCounts, tableTypes, reader) {
                for(var i = 0; i < tableCounts.length; i++) {
                    var table = this.tables[i];
                    var TableType = tableTypes[i];
                    for(var iRow = 0; iRow < tableCounts[i]; iRow++) {
                        table[iRow].read(reader);
                    }
                }
            };
            return TableStream;
        })();        
        function calcRequredBitCount(maxValue) {
            var bitMask = maxValue;
            var result = 0;
            while(bitMask != 0) {
                result++;
                bitMask >>= 1;
            }
            return result;
        }
        var TableReader = (function () {
            function TableReader(_reader, _tables, stringCount, guidCount, blobCount) {
                this._reader = _reader;
                this._tables = _tables;
                this.stringIndices = [];
                this.readStringIndex = this._getDirectReader(stringCount);
                this.readGuid = this._getDirectReader(guidCount);
                this.readBlobIndex = this._getDirectReader(blobCount);
                this.readResolutionScope = this._getCodedIndexReader(TableReader.resolutionScopeTables);
                this.readTypeDefOrRef = this._getCodedIndexReader(TableReader.typeDefOrRefTables);
                this.readHasConstant = this._getCodedIndexReader(TableReader.hasConstantTables);
                this.readHasCustomAttribute = this._getCodedIndexReader(TableReader.hasCustomAttributeTables);
                this.readCustomAttributeType = this._getCodedIndexReader(TableReader.customAttributeTypeTables);
                this.readHasDeclSecurity = this._getCodedIndexReader(TableReader.hasDeclSecurityTables);
                this.readImplementation = this._getCodedIndexReader(TableReader.implementationTables);
                this.readHasFieldMarshal = this._getCodedIndexReader(TableReader.hasFieldMarshalTables);
                this.readTypeOrMethodDef = this._getCodedIndexReader(TableReader.typeOrMethodDefTables);
                this.readMemberForwarded = this._getCodedIndexReader(TableReader.memberForwardedTables);
                this.readMemberRefParent = this._getCodedIndexReader(TableReader.memberRefParentTables);
                this.readMethodDefOrRef = this._getCodedIndexReader(TableReader.methodDefOrRefTables);
                this.readHasSemantics = this._getCodedIndexReader(TableReader.hasSemanticsTables);
                this.readGenericParamTableIndex = this._getTableIndexReader(42);
                this.readParamTableIndex = this._getTableIndexReader(8);
                this.readFieldTableIndex = this._getTableIndexReader(4);
                this.readMethodDefTableIndex = this._getTableIndexReader(6);
                this.readTypeDefTableIndex = this._getTableIndexReader(2);
                this.readEventTableIndex = this._getTableIndexReader(20);
                this.readPropertyTableIndex = this._getTableIndexReader(23);
                this.readModuleRefTableIndex = this._getTableIndexReader(26);
                this.readAssemblyTableIndex = this._getTableIndexReader(32);
            }
            TableReader.resolutionScopeTables = [
                0, 
                26, 
                35, 
                1
            ];
            TableReader.typeDefOrRefTables = [
                2, 
                1, 
                27
            ];
            TableReader.hasConstantTables = [
                4, 
                8, 
                23
            ];
            TableReader.hasCustomAttributeTables = [
                6, 
                4, 
                1, 
                2, 
                8, 
                9, 
                10, 
                0, 
                255, 
                23, 
                20, 
                17, 
                26, 
                27, 
                32, 
                35, 
                38, 
                39, 
                40, 
                42, 
                44, 
                43
            ];
            TableReader.customAttributeTypeTables = [
                255, 
                255, 
                6, 
                10, 
                255
            ];
            TableReader.hasDeclSecurityTables = [
                2, 
                6, 
                32
            ];
            TableReader.implementationTables = [
                38, 
                35, 
                39
            ];
            TableReader.hasFieldMarshalTables = [
                4, 
                8
            ];
            TableReader.typeOrMethodDefTables = [
                2, 
                6
            ];
            TableReader.memberForwardedTables = [
                4, 
                6
            ];
            TableReader.memberRefParentTables = [
                2, 
                1, 
                26, 
                6, 
                27
            ];
            TableReader.methodDefOrRefTables = [
                6, 
                10
            ];
            TableReader.hasSemanticsTables = [
                20, 
                23
            ];
            TableReader.prototype.readString = function () {
                var index = this.readStringIndex();
                this.stringIndices[index] = "";
                return index;
            };
            TableReader.prototype._getDirectReader = function (spaceSize) {
                return spaceSize > 65535 ? this.readInt : this.readShort;
            };
            TableReader.prototype._getTableIndexReader = function (tableKind) {
                var table = this._tables[tableKind];
                return this._getDirectReader(table ? table.length : 0);
            };
            TableReader.prototype._getCodedIndexReader = function (tables) {
                var maxTableLength = 0;
                for(var i = 0; i < tables.length; i++) {
                    var tableIndex = tables[i];
                    var table = this._tables[tableIndex];
                    maxTableLength = Math.max(maxTableLength, table ? table.length : 0);
                }
                var tableKindBitCount = calcRequredBitCount(tables.length - 1);
                var tableIndexBitCount = calcRequredBitCount(maxTableLength);
                var totalBitCount = tableKindBitCount + tableIndexBitCount;
                return totalBitCount <= 16 ? this.readShort : this.readInt;
            };
            TableReader.prototype.readByte = function () {
                return this._reader.readByte();
            };
            TableReader.prototype.readShort = function () {
                return this._reader.readShort();
            };
            TableReader.prototype.readInt = function () {
                return this._reader.readInt();
            };
            return TableReader;
        })();        
        var TableCompletionReader = (function () {
            function TableCompletionReader(_tableStream, _metadataStreams) {
                this._tableStream = _tableStream;
                this._metadataStreams = _metadataStreams;
            }
            TableCompletionReader.prototype.readString = function (index) {
                return this._tableStream.stringIndices[index];
            };
            TableCompletionReader.prototype.readGuid = function (index) {
                return this._metadataStreams.guids[index];
            };
            TableCompletionReader.prototype.copyFieldRange = function (fields, start, end) {
                var table = this._tableStream.tables[4];
                if(!end && typeof (end) === "undefined") {
                    end = table.length;
                }
                for(var i = start; i < end; i++) {
                    var fieldRow = table[i];
                    fields.push(fieldRow.def);
                }
            };
            TableCompletionReader.prototype.copyMethodRange = function (methods, start, end) {
                var table = this._tableStream.tables[6];
                if(!end && typeof (end) === "undefined") {
                    end = table.length;
                }
                for(var i = start; i < end; i++) {
                    var methodRow = table[i];
                    methods.push(methodRow.def);
                }
                this.lookupResolutionScope = this._createLookup(TableReader.resolutionScopeTables);
                this.lookupTypeDefOrRef = this._createLookup(TableReader.typeDefOrRefTables);
            };
            TableCompletionReader.prototype._createLookup = function (tables) {
                var _this = this;
                var tableKindBitCount = calcRequredBitCount(tables.length);
                return function (codedIndex) {
                    var rowIndex = codedIndex >> tableKindBitCount;
                    if(rowIndex === 0) {
                        return null;
                    }
                    var tableKind = codedIndex - (rowIndex << tableKindBitCount);
                    var table = _this._tableStream.tables[tableKind];
                    var row = table[rowIndex];
                    var result = row.def;
                    return result;
                }
            };
            TableCompletionReader.prototype.resolveTypeReference = function (resolutionScope, namespace, name) {
                return null;
            };
            TableCompletionReader.prototype.readFieldSignature = function (field, blobIndex) {
            };
            return TableCompletionReader;
        })();        
        var CodedIndexReader = (function () {
            function CodedIndexReader(tableKinds, tableCounts) {
                this.tableKinds = tableKinds;
                this.tableKindBitCount = calcRequredBitCount(tableKinds.length);
                var maxTableLength = 0;
                for(var i = 0; i < tableKinds.length; i++) {
                    var tableLength = tableCounts[tableKinds[i]];
                    if(tableLength > maxTableLength) {
                        maxTableLength = tableLength;
                    }
                }
                this.rowIndexBitCount = calcRequredBitCount(maxTableLength);
                this.isShortForm = this.tableKindBitCount + this.rowIndexBitCount <= 16;
            }
            CodedIndexReader.prototype.createLookup = function (tables) {
                return null;
            };
            return CodedIndexReader;
        })();        
        var tables;
        (function (tables) {
            var Module = (function () {
                function Module() {
                    this.TableKind = 0;
                    this.def = null;
                    this.generation = 0;
                    this.name = 0;
                    this.mvid = 0;
                    this.encId = 0;
                    this.encBaseId = 0;
                }
                Module.prototype.read = function (reader) {
                    this.generation = reader.readShort();
                    this.name = reader.readString();
                    this.mvid = reader.readGuid();
                    this.encId = reader.readGuid();
                    this.encBaseId = reader.readGuid();
                };
                Module.prototype.complete = function (reader) {
                    this.def.generation = this.generation;
                    this.def.name = reader.readString(this.name);
                    this.def.mvid = reader.readGuid(this.mvid);
                    this.def.encId = reader.readGuid(this.encId);
                    this.def.encBaseId = reader.readGuid(this.encBaseId);
                };
                return Module;
            })();
            tables.Module = Module;            
            var TypeRef = (function () {
                function TypeRef() {
                    this.TableKind = 1;
                    this.def = new Type();
                    this.resolutionScope = 0;
                    this.name = 0;
                    this.namespace = 0;
                }
                TypeRef.prototype.read = function (reader) {
                    this.resolutionScope = reader.readResolutionScope();
                    this.name = reader.readString();
                    this.namespace = reader.readString();
                };
                TypeRef.prototype.complete = function (reader) {
                    var resolutionScope = reader.lookupResolutionScope(this.resolutionScope);
                    var name = reader.readString(this.name);
                    var namespace = reader.readString(this.namespace);
                    this.def = reader.resolveTypeReference(resolutionScope, namespace, name);
                };
                return TypeRef;
            })();
            tables.TypeRef = TypeRef;            
            var TypeDef = (function () {
                function TypeDef() {
                    this.TableKind = 2;
                    this.def = new Type();
                    this.flags = 0;
                    this.name = 0;
                    this.namespace = 0;
                    this.extends = 0;
                    this.fieldList = 0;
                    this.methodList = 0;
                }
                TypeDef.prototype.read = function (reader) {
                    this.flags = reader.readInt();
                    this.name = reader.readString();
                    this.namespace = reader.readString();
                    this.extends = reader.readTypeDefOrRef();
                    this.fieldList = reader.readFieldTableIndex();
                    this.methodList = reader.readMethodDefTableIndex();
                };
                TypeDef.prototype.complete = function (reader, nextTypeDef) {
                    this.def.attributes = this.flags;
                    this.def.name = reader.readString(this.name);
                    this.def.namespace = reader.readString(this.namespace);
                    this.def.baseType = reader.lookupTypeDefOrRef(this.extends);
                    var nextFieldList;
                    if(nextTypeDef) {
                        nextFieldList = nextTypeDef.fieldList;
                    }
                    reader.copyFieldRange(this.def.fields, this.fieldList, nextFieldList);
                    var nextMethodList;
                    if(nextTypeDef) {
                        nextMethodList = nextTypeDef.methodList;
                    }
                    reader.copyMethodRange(this.def.methods, this.methodList, nextMethodList);
                };
                return TypeDef;
            })();
            tables.TypeDef = TypeDef;            
            var Field = (function () {
                function Field() {
                    this.TableKind = 4;
                    this.def = new FieldInfo();
                    this.attributes = 0;
                    this.name = 0;
                    this.signature = 0;
                }
                Field.prototype.read = function (reader) {
                    this.attributes = reader.readShort();
                    this.name = reader.readString();
                    this.signature = reader.readBlobIndex();
                };
                Field.prototype.complete = function (reader) {
                    this.def.attributes = this.attributes;
                    this.def.name = reader.readString(this.name);
                    reader.readFieldSignature(this.def, this.signature);
                };
                return Field;
            })();
            tables.Field = Field;            
            var MethodDef = (function () {
                function MethodDef() {
                    this.TableKind = 6;
                    this.def = new MethodInfo();
                    this.rva = 0;
                    this.implAttributes = 0;
                    this.attributes = 0;
                    this.name = 0;
                    this.signature = 0;
                    this.paramList = 0;
                }
                MethodDef.prototype.read = function (reader) {
                    this.rva = reader.readInt();
                    this.implAttributes = reader.readShort();
                    this.attributes = reader.readShort();
                    this.name = reader.readString();
                    this.signature = reader.readBlobIndex();
                    this.paramList = reader.readParamTableIndex();
                };
                return MethodDef;
            })();
            tables.MethodDef = MethodDef;            
            var Param = (function () {
                function Param() {
                    this.TableKind = 8;
                    this.def = new ParameterInfo();
                    this.flags = 0;
                    this.sequence = 0;
                    this.name = 0;
                }
                Param.prototype.read = function (reader) {
                    this.flags = reader.readShort();
                    this.sequence = reader.readShort();
                    this.name = reader.readString();
                };
                return Param;
            })();
            tables.Param = Param;            
            var InterfaceImpl = (function () {
                function InterfaceImpl() {
                    this.TableKind = 9;
                    this.class = 0;
                    this.interface = 0;
                }
                InterfaceImpl.prototype.read = function (reader) {
                    this.class = reader.readTypeDefTableIndex();
                    this.interface = reader.readTypeDefOrRef();
                };
                return InterfaceImpl;
            })();
            tables.InterfaceImpl = InterfaceImpl;            
            var MemberRef = (function () {
                function MemberRef() {
                    this.TableKind = 10;
                    this.class = 0;
                    this.name = 0;
                    this.signature = 0;
                }
                MemberRef.prototype.read = function (reader) {
                    this.class = reader.readMemberRefParent();
                    this.name = reader.readString();
                    this.signature = reader.readBlobIndex();
                };
                return MemberRef;
            })();
            tables.MemberRef = MemberRef;            
            var Constant = (function () {
                function Constant() {
                    this.TableKind = 11;
                    this.type = 0;
                    this.parent = 0;
                    this.value = 0;
                }
                Constant.prototype.read = function (reader) {
                    this.type = reader.readByte();
                    var padding = reader.readByte();
                    this.parent = reader.readHasConstant();
                    this.value = reader.readBlobIndex();
                };
                return Constant;
            })();
            tables.Constant = Constant;            
            var CustomAttribute = (function () {
                function CustomAttribute() {
                    this.TableKind = 12;
                    this.parent = 0;
                    this.type = 0;
                    this.value = 0;
                }
                CustomAttribute.prototype.read = function (reader) {
                    this.parent = reader.readHasCustomAttribute();
                    this.type = reader.readCustomAttributeType();
                    this.value = reader.readBlobIndex();
                };
                return CustomAttribute;
            })();
            tables.CustomAttribute = CustomAttribute;            
            var FieldMarshal = (function () {
                function FieldMarshal() {
                    this.TableKind = 13;
                    this.parent = 0;
                    this.nativeType = 0;
                }
                FieldMarshal.prototype.read = function (reader) {
                    this.parent = reader.readHasFieldMarshal();
                    this.nativeType = reader.readBlobIndex();
                };
                return FieldMarshal;
            })();
            tables.FieldMarshal = FieldMarshal;            
            var DeclSecurity = (function () {
                function DeclSecurity() {
                    this.TableKind = 14;
                    this.action = 0;
                    this.parent = 0;
                    this.permissionSet = 0;
                }
                DeclSecurity.prototype.read = function (reader) {
                    this.action = reader.readShort();
                    this.parent = reader.readHasDeclSecurity();
                    this.permissionSet = reader.readBlobIndex();
                };
                return DeclSecurity;
            })();
            tables.DeclSecurity = DeclSecurity;            
            var ClassLayout = (function () {
                function ClassLayout() {
                    this.TableKind = 15;
                    this.packingSize = 0;
                    this.classSize = 0;
                    this.parent = 0;
                }
                ClassLayout.prototype.read = function (reader) {
                    this.packingSize = reader.readShort();
                    this.classSize = reader.readInt();
                    this.parent = reader.readTypeDefTableIndex();
                };
                return ClassLayout;
            })();
            tables.ClassLayout = ClassLayout;            
            var FieldLayout = (function () {
                function FieldLayout() {
                    this.TableKind = 16;
                    this.offset = 0;
                    this.field = 0;
                }
                FieldLayout.prototype.read = function (reader) {
                    this.offset = reader.readInt();
                    this.field = reader.readFieldTableIndex();
                };
                return FieldLayout;
            })();
            tables.FieldLayout = FieldLayout;            
            var StandAloneSig = (function () {
                function StandAloneSig() {
                    this.TableKind = 17;
                    this.signature = 0;
                }
                StandAloneSig.prototype.read = function (reader) {
                    this.signature = reader.readBlobIndex();
                };
                return StandAloneSig;
            })();
            tables.StandAloneSig = StandAloneSig;            
            var EventMap = (function () {
                function EventMap() {
                    this.TableKind = 18;
                    this.parent = 0;
                    this.eventList = 0;
                }
                EventMap.prototype.read = function (reader) {
                    this.parent = reader.readTypeDefTableIndex();
                    this.eventList = reader.readEventTableIndex();
                };
                return EventMap;
            })();
            tables.EventMap = EventMap;            
            var Event = (function () {
                function Event() {
                    this.TableKind = 20;
                    this.def = new EventInfo();
                    this.eventFlags = 0;
                    this.name = 0;
                    this.eventType = 0;
                }
                Event.prototype.read = function (reader) {
                    this.eventFlags = reader.readShort();
                    this.name = reader.readString();
                    this.eventType = reader.readTypeDefOrRef();
                };
                return Event;
            })();
            tables.Event = Event;            
            var PropertyMap = (function () {
                function PropertyMap() {
                    this.TableKind = 21;
                    this.parent = 0;
                    this.propertyList = 0;
                }
                PropertyMap.prototype.read = function (reader) {
                    this.parent = reader.readTypeDefTableIndex();
                    this.propertyList = reader.readPropertyTableIndex();
                };
                return PropertyMap;
            })();
            tables.PropertyMap = PropertyMap;            
            var Property = (function () {
                function Property() {
                    this.TableKind = 23;
                    this.def = new PropertyInfo();
                    this.flags = 0;
                    this.name = 0;
                    this.type = 0;
                }
                Property.prototype.read = function (reader) {
                    this.flags = reader.readShort();
                    this.name = reader.readString();
                    this.type = reader.readBlobIndex();
                };
                return Property;
            })();
            tables.Property = Property;            
            var MethodSemantics = (function () {
                function MethodSemantics() {
                    this.TableKind = 24;
                    this.semantics = 0;
                    this.method = 0;
                    this.association = 0;
                }
                MethodSemantics.prototype.read = function (reader) {
                    this.semantics = reader.readShort();
                    this.method = reader.readMethodDefTableIndex();
                    this.association = reader.readHasSemantics();
                };
                return MethodSemantics;
            })();
            tables.MethodSemantics = MethodSemantics;            
            var MethodImpl = (function () {
                function MethodImpl() {
                    this.TableKind = 25;
                    this.class = 0;
                    this.methodBody = 0;
                    this.methodDeclaration = 0;
                }
                MethodImpl.prototype.read = function (reader) {
                    this.class = reader.readTypeDefTableIndex();
                    this.methodBody = reader.readMethodDefOrRef();
                    this.methodDeclaration = reader.readMethodDefOrRef();
                };
                return MethodImpl;
            })();
            tables.MethodImpl = MethodImpl;            
            var ModuleRef = (function () {
                function ModuleRef() {
                    this.TableKind = 26;
                    this.name = 0;
                }
                ModuleRef.prototype.read = function (reader) {
                    this.name = reader.readString();
                };
                return ModuleRef;
            })();
            tables.ModuleRef = ModuleRef;            
            var TypeSpec = (function () {
                function TypeSpec() {
                    this.TableKind = 27;
                }
                TypeSpec.prototype.read = function (reader) {
                    this.signature = reader.readBlobIndex();
                };
                return TypeSpec;
            })();
            tables.TypeSpec = TypeSpec;            
            var ImplMap = (function () {
                function ImplMap() {
                    this.TableKind = 28;
                    this.mappingFlags = 0;
                    this.memberForwarded = 0;
                    this.importName = 0;
                    this.importScope = 0;
                }
                ImplMap.prototype.read = function (reader) {
                    this.mappingFlags = reader.readShort();
                    this.memberForwarded = reader.readMemberForwarded();
                    this.importName = reader.readString();
                    this.importScope = reader.readModuleRefTableIndex();
                };
                return ImplMap;
            })();
            tables.ImplMap = ImplMap;            
            var FieldRva = (function () {
                function FieldRva() {
                    this.TableKind = 29;
                    this.rva = 0;
                    this.field = 0;
                }
                FieldRva.prototype.read = function (reader) {
                    this.rva = reader.readInt();
                    this.field = reader.readFieldTableIndex();
                };
                return FieldRva;
            })();
            tables.FieldRva = FieldRva;            
            var Assembly = (function () {
                function Assembly() {
                    this.TableKind = 32;
                    this.hashAlgId = 0;
                    this.majorVersion = 0;
                    this.minorVersion = 0;
                    this.buildNumber = 0;
                    this.revisionNumber = 0;
                    this.flags = 0;
                    this.publicKey = 0;
                    this.name = 0;
                    this.culture = 0;
                }
                Assembly.prototype.read = function (reader) {
                    this.hashAlgId = reader.readInt();
                    this.majorVersion = reader.readShort();
                    this.minorVersion = reader.readShort();
                    this.buildNumber = reader.readShort();
                    this.revisionNumber = reader.readShort();
                    this.flags = reader.readInt();
                    this.publicKey = reader.readBlobIndex();
                    this.name = reader.readString();
                    this.culture = reader.readString();
                };
                return Assembly;
            })();
            tables.Assembly = Assembly;            
            var AssemblyProcessor = (function () {
                function AssemblyProcessor() {
                    this.TableKind = 33;
                    this.processor = 0;
                }
                AssemblyProcessor.prototype.reader = function (reader) {
                    this.processor = reader.readInt();
                };
                return AssemblyProcessor;
            })();
            tables.AssemblyProcessor = AssemblyProcessor;            
            var AssemblyOS = (function () {
                function AssemblyOS() {
                    this.TableKind = 34;
                    this.osPlatformId = 0;
                    this.osMajorVersion = 0;
                    this.osMinorVersion = 0;
                }
                AssemblyOS.prototype.read = function (reader) {
                    this.osPlatformId = reader.readInt();
                    this.osMajorVersion = reader.readShort();
                    this.osMinorVersion = reader.readShort();
                };
                return AssemblyOS;
            })();
            tables.AssemblyOS = AssemblyOS;            
            var AssemblyRef = (function () {
                function AssemblyRef() {
                    this.TableKind = 35;
                    this.majorVersion = 0;
                    this.minorVersion = 0;
                    this.buildNumber = 0;
                    this.revisionNumber = 0;
                    this.flags = 0;
                    this.publicKeyOrToken = 0;
                    this.name = 0;
                    this.culture = 0;
                    this.hashValue = 0;
                }
                AssemblyRef.prototype.read = function (reader) {
                    this.majorVersion = reader.readShort();
                    this.minorVersion = reader.readShort();
                    this.buildNumber = reader.readShort();
                    this.revisionNumber = reader.readShort();
                    this.flags = reader.readInt();
                    this.publicKeyOrToken = reader.readBlobIndex();
                    this.name = reader.readString();
                    this.culture = reader.readString();
                    this.hashValue = reader.readBlobIndex();
                };
                return AssemblyRef;
            })();
            tables.AssemblyRef = AssemblyRef;            
            var AssemblyRefProcessor = (function () {
                function AssemblyRefProcessor() {
                    this.TableKind = 36;
                }
                AssemblyRefProcessor.prototype.read = function (reader) {
                    this.processor = reader.readInt();
                };
                return AssemblyRefProcessor;
            })();
            tables.AssemblyRefProcessor = AssemblyRefProcessor;            
            var AssemblyRefOs = (function () {
                function AssemblyRefOs() {
                    this.TableKind = 37;
                    this.osPlatformId = 0;
                    this.osMajorVersion = 0;
                    this.osMinorVersion = 0;
                    this.assemblyRef = 0;
                }
                AssemblyRefOs.prototype.read = function (reader) {
                    this.osPlatformId = reader.readInt();
                    this.osMajorVersion = reader.readInt();
                    this.osMinorVersion = reader.readInt();
                    this.assemblyRef = reader.readAssemblyTableIndex();
                };
                return AssemblyRefOs;
            })();
            tables.AssemblyRefOs = AssemblyRefOs;            
            var File = (function () {
                function File() {
                    this.TableKind = 38;
                    this.flags = 0;
                    this.name = 0;
                    this.hashValue = 0;
                }
                File.prototype.read = function (reader) {
                    this.flags = reader.readInt();
                    this.name = reader.readString();
                    this.hashValue = reader.readBlobIndex();
                };
                return File;
            })();
            tables.File = File;            
            var ExportedType = (function () {
                function ExportedType() {
                    this.TableKind = 39;
                    this.flags = 0;
                    this.typeDefId = 0;
                    this.typeName = 0;
                    this.typeNamespace = 0;
                    this.implementation = 0;
                }
                ExportedType.prototype.read = function (reader) {
                    this.flags = reader.readInt();
                    this.typeDefId = reader.readInt();
                    this.typeName = reader.readString();
                    this.typeNamespace = reader.readString();
                    this.implementation = reader.readImplementation();
                };
                return ExportedType;
            })();
            tables.ExportedType = ExportedType;            
            var ManifestResource = (function () {
                function ManifestResource() {
                    this.TableKind = 40;
                    this.offset = 0;
                    this.flags = 0;
                    this.name = 0;
                    this.implementation = 0;
                }
                ManifestResource.prototype.read = function (reader) {
                    this.offset = reader.readInt();
                    this.flags = reader.readInt();
                    this.name = reader.readString();
                    this.implementation = reader.readImplementation();
                };
                return ManifestResource;
            })();
            tables.ManifestResource = ManifestResource;            
            var NestedClass = (function () {
                function NestedClass() {
                    this.TableKind = 41;
                    this.nestedClass = 0;
                    this.enclosingClass = 0;
                }
                NestedClass.prototype.read = function (reader) {
                    this.nestedClass = reader.readTypeDefTableIndex();
                    this.enclosingClass = reader.readTypeDefTableIndex();
                };
                return NestedClass;
            })();
            tables.NestedClass = NestedClass;            
            var GenericParam = (function () {
                function GenericParam() {
                    this.TableKind = 42;
                    this.number = 0;
                    this.flags = 0;
                    this.owner = 0;
                    this.name = 0;
                }
                GenericParam.prototype.read = function (reader) {
                    this.number = reader.readShort();
                    this.flags = reader.readShort();
                    this.owner = reader.readTypeOrMethodDef();
                    this.name = reader.readString();
                };
                return GenericParam;
            })();
            tables.GenericParam = GenericParam;            
            var MethodSpec = (function () {
                function MethodSpec() {
                    this.TableKind = 43;
                    this.method = 0;
                    this.instantiation = 0;
                }
                MethodSpec.prototype.read = function (reader) {
                    this.method = reader.readMethodDefOrRef();
                    this.instantiation = reader.readBlobIndex();
                };
                return MethodSpec;
            })();
            tables.MethodSpec = MethodSpec;            
            var GenericParamConstraint = (function () {
                function GenericParamConstraint() {
                    this.TableKind = 44;
                    this.owner = 0;
                    this.constraint = 0;
                }
                GenericParamConstraint.prototype.read = function (reader) {
                    this.owner = reader.readGenericParamTableIndex();
                    this.constraint = reader.readTypeDefOrRef();
                };
                return GenericParamConstraint;
            })();
            tables.GenericParamConstraint = GenericParamConstraint;            
        })(tables || (tables = {}));
        (function (metadata) {
            (function (ClrImageFlags) {
                ClrImageFlags._map = [];
                ClrImageFlags.ILOnly = 1;
                ClrImageFlags._32BitRequired = 2;
                ClrImageFlags.ILLibrary = 4;
                ClrImageFlags.StrongNameSigned = 8;
                ClrImageFlags.NativeEntryPoint = 16;
                ClrImageFlags.TrackDebugData = 65536;
                ClrImageFlags.IsIbcoptimized = 131072;
            })(metadata.ClrImageFlags || (metadata.ClrImageFlags = {}));
            var ClrImageFlags = metadata.ClrImageFlags;
            (function (ClrMetadataSignature) {
                ClrMetadataSignature._map = [];
                ClrMetadataSignature.Signature = 1112167234;
            })(metadata.ClrMetadataSignature || (metadata.ClrMetadataSignature = {}));
            var ClrMetadataSignature = metadata.ClrMetadataSignature;
            (function (AssemblyHashAlgorithm) {
                AssemblyHashAlgorithm._map = [];
                AssemblyHashAlgorithm.None = 0;
                AssemblyHashAlgorithm.Reserved = 32771;
                AssemblyHashAlgorithm.Sha1 = 32772;
            })(metadata.AssemblyHashAlgorithm || (metadata.AssemblyHashAlgorithm = {}));
            var AssemblyHashAlgorithm = metadata.AssemblyHashAlgorithm;
            (function (AssemblyFlags) {
                AssemblyFlags._map = [];
                AssemblyFlags.PublicKey = 1;
                AssemblyFlags.Retargetable = 256;
                AssemblyFlags.DisableJITcompileOptimizer = 16384;
                AssemblyFlags.EnableJITcompileTracking = 32768;
            })(metadata.AssemblyFlags || (metadata.AssemblyFlags = {}));
            var AssemblyFlags = metadata.AssemblyFlags;
            (function (ElementType) {
                ElementType._map = [];
                ElementType.End = 0;
                ElementType.Void = 1;
                ElementType.Boolean = 2;
                ElementType.Char = 3;
                ElementType.I1 = 4;
                ElementType.U1 = 5;
                ElementType.I2 = 6;
                ElementType.U2 = 7;
                ElementType.I4 = 8;
                ElementType.U4 = 9;
                ElementType.I8 = 10;
                ElementType.U8 = 11;
                ElementType.R4 = 12;
                ElementType.R8 = 13;
                ElementType.String = 14;
                ElementType.Ptr = 15;
                ElementType.ByRef = 16;
                ElementType.ValueType = 17;
                ElementType.Class = 18;
                ElementType.Var = 19;
                ElementType.Array = 20;
                ElementType.GenericInst = 21;
                ElementType.TypedByRef = 22;
                ElementType.I = 24;
                ElementType.U = 25;
                ElementType.FnPtr = 27;
                ElementType.Object = 28;
                ElementType.SZArray = 29;
                ElementType.MVar = 30;
                ElementType.CMod_ReqD = 31;
                ElementType.CMod_Opt = 32;
                ElementType.Internal = 33;
                ElementType.Modifier = 64;
                ElementType.Sentinel = 1 | ElementType.Modifier;
                ElementType.Pinned = 5 | ElementType.Modifier;
                ElementType.R4_Hfa = 6 | ElementType.Modifier;
                ElementType.R8_Hfa = 7 | ElementType.Modifier;
                ElementType.ArgumentType_ = 16 | ElementType.Modifier;
                ElementType.CustomAttribute_BoxedObject_ = 17 | ElementType.Modifier;
                ElementType.CustomAttribute_Field_ = 19 | ElementType.Modifier;
                ElementType.CustomAttribute_Property_ = 20 | ElementType.Modifier;
                ElementType.CustomAttribute_Enum_ = 85;
            })(metadata.ElementType || (metadata.ElementType = {}));
            var ElementType = metadata.ElementType;
            (function (SecurityAction) {
                SecurityAction._map = [];
                SecurityAction.Assert = 3;
                SecurityAction.Demand = 2;
                SecurityAction.Deny = 4;
                SecurityAction.InheritanceDemand = 7;
                SecurityAction.LinkDemand = 6;
                SecurityAction.NonCasDemand = 0;
                SecurityAction.NonCasLinkDemand = 0;
                SecurityAction.PrejitGrant = 0;
                SecurityAction.PermitOnly = 5;
                SecurityAction.RequestMinimum = 8;
                SecurityAction.RequestOptional = 9;
                SecurityAction.RequestRefuse = 10;
            })(metadata.SecurityAction || (metadata.SecurityAction = {}));
            var SecurityAction = metadata.SecurityAction;
            (function (EventAttributes) {
                EventAttributes._map = [];
                EventAttributes.SpecialName = 512;
                EventAttributes.RTSpecialName = 1024;
            })(metadata.EventAttributes || (metadata.EventAttributes = {}));
            var EventAttributes = metadata.EventAttributes;
            (function (TypeAttributes) {
                TypeAttributes._map = [];
                TypeAttributes.VisibilityMask = 7;
                TypeAttributes.NotPublic = 0;
                TypeAttributes.Public = 1;
                TypeAttributes.NestedPublic = 2;
                TypeAttributes.NestedPrivate = 3;
                TypeAttributes.NestedFamily = 4;
                TypeAttributes.NestedAssembly = 5;
                TypeAttributes.NestedFamANDAssem = 6;
                TypeAttributes.NestedFamORAssem = 7;
                TypeAttributes.LayoutMask = 24;
                TypeAttributes.AutoLayout = 0;
                TypeAttributes.SequentialLayout = 8;
                TypeAttributes.ExplicitLayout = 16;
                TypeAttributes.ClassSemanticsMask = 32;
                TypeAttributes.Class = 0;
                TypeAttributes.Interface = 32;
                TypeAttributes.Abstract = 128;
                TypeAttributes.Sealed = 256;
                TypeAttributes.SpecialName = 1024;
                TypeAttributes.Import = 4096;
                TypeAttributes.Serializable = 8192;
                TypeAttributes.StringFormatMask = 196608;
                TypeAttributes.AnsiClass = 0;
                TypeAttributes.UnicodeClass = 65536;
                TypeAttributes.AutoClass = 131072;
                TypeAttributes.CustomFormatClass = 196608;
                TypeAttributes.CustomStringFormatMask = 12582912;
                TypeAttributes.BeforeFieldInit = 1048576;
                TypeAttributes.RTSpecialName = 2048;
                TypeAttributes.HasSecurity = 262144;
                TypeAttributes.IsTypeForwarder = 2097152;
            })(metadata.TypeAttributes || (metadata.TypeAttributes = {}));
            var TypeAttributes = metadata.TypeAttributes;
            (function (FieldAttributes) {
                FieldAttributes._map = [];
                FieldAttributes.FieldAccessMask = 7;
                FieldAttributes.CompilerControlled = 0;
                FieldAttributes.Private = 1;
                FieldAttributes.FamANDAssem = 2;
                FieldAttributes.Assembly = 3;
                FieldAttributes.Family = 4;
                FieldAttributes.FamORAssem = 5;
                FieldAttributes.Public = 6;
                FieldAttributes.Static = 16;
                FieldAttributes.InitOnly = 32;
                FieldAttributes.Literal = 64;
                FieldAttributes.NotSerialized = 128;
                FieldAttributes.SpecialName = 512;
                FieldAttributes.PInvokeImpl = 8192;
                FieldAttributes.RTSpecialName = 1024;
                FieldAttributes.HasFieldMarshal = 4096;
                FieldAttributes.HasDefault = 32768;
                FieldAttributes.HasFieldRVA = 256;
            })(metadata.FieldAttributes || (metadata.FieldAttributes = {}));
            var FieldAttributes = metadata.FieldAttributes;
            (function (FileAttributes) {
                FileAttributes._map = [];
                FileAttributes.ContainsMetaData = 0;
                FileAttributes.ContainsNoMetaData = 1;
            })(metadata.FileAttributes || (metadata.FileAttributes = {}));
            var FileAttributes = metadata.FileAttributes;
            (function (GenericParamAttributes) {
                GenericParamAttributes._map = [];
                GenericParamAttributes.VarianceMask = 3;
                GenericParamAttributes.None = 0;
                GenericParamAttributes.Covariant = 1;
                GenericParamAttributes.Contravariant = 2;
                GenericParamAttributes.SpecialConstraintMask = 28;
                GenericParamAttributes.ReferenceTypeConstraint = 4;
                GenericParamAttributes.NotNullableValueTypeConstraint = 8;
                GenericParamAttributes.DefaultConstructorConstraint = 16;
            })(metadata.GenericParamAttributes || (metadata.GenericParamAttributes = {}));
            var GenericParamAttributes = metadata.GenericParamAttributes;
            (function (PInvokeAttributes) {
                PInvokeAttributes._map = [];
                PInvokeAttributes.NoMangle = 1;
                PInvokeAttributes.CharSetMask = 6;
                PInvokeAttributes.CharSetNotSpec = 0;
                PInvokeAttributes.CharSetAnsi = 2;
                PInvokeAttributes.CharSetUnicode = 4;
                PInvokeAttributes.CharSetAuto = 6;
                PInvokeAttributes.SupportsLastError = 64;
                PInvokeAttributes.CallConvMask = 1792;
                PInvokeAttributes.CallConvPlatformapi = 256;
                PInvokeAttributes.CallConvCdecl = 512;
                PInvokeAttributes.CallConvStdcall = 768;
                PInvokeAttributes.CallConvThiscall = 1024;
                PInvokeAttributes.CallConvFastcall = 1280;
            })(metadata.PInvokeAttributes || (metadata.PInvokeAttributes = {}));
            var PInvokeAttributes = metadata.PInvokeAttributes;
            (function (ManifestResourceAttributes) {
                ManifestResourceAttributes._map = [];
                ManifestResourceAttributes.VisibilityMask = 7;
                ManifestResourceAttributes.Public = 1;
                ManifestResourceAttributes.Private = 2;
            })(metadata.ManifestResourceAttributes || (metadata.ManifestResourceAttributes = {}));
            var ManifestResourceAttributes = metadata.ManifestResourceAttributes;
            (function (MethodImplAttributes) {
                MethodImplAttributes._map = [];
                MethodImplAttributes.CodeTypeMask = 3;
                MethodImplAttributes.IL = 0;
                MethodImplAttributes.Native = 1;
                MethodImplAttributes.OPTIL = 2;
                MethodImplAttributes.Runtime = 3;
                MethodImplAttributes.ManagedMask = 4;
                MethodImplAttributes.Unmanaged = 4;
                MethodImplAttributes.Managed = 0;
                MethodImplAttributes.ForwardRef = 16;
                MethodImplAttributes.PreserveSig = 128;
                MethodImplAttributes.InternalCall = 4096;
                MethodImplAttributes.Synchronized = 32;
                MethodImplAttributes.NoInlining = 8;
                MethodImplAttributes.MaxMethodImplVal = 65535;
                MethodImplAttributes.NoOptimization = 64;
            })(metadata.MethodImplAttributes || (metadata.MethodImplAttributes = {}));
            var MethodImplAttributes = metadata.MethodImplAttributes;
            (function (MethodAttributes) {
                MethodAttributes._map = [];
                MethodAttributes.MemberAccessMask = 7;
                MethodAttributes.CompilerControlled = 0;
                MethodAttributes.Private = 1;
                MethodAttributes.FamANDAssem = 2;
                MethodAttributes.Assem = 3;
                MethodAttributes.Family = 4;
                MethodAttributes.FamORAssem = 5;
                MethodAttributes.Public = 6;
                MethodAttributes.Static = 16;
                MethodAttributes.Final = 32;
                MethodAttributes.Virtual = 64;
                MethodAttributes.HideBySig = 128;
                MethodAttributes.VtableLayoutMask = 256;
                MethodAttributes.ReuseSlot = 0;
                MethodAttributes.NewSlot = 256;
                MethodAttributes.Strict = 512;
                MethodAttributes.Abstract = 1024;
                MethodAttributes.SpecialName = 2048;
                MethodAttributes.PInvokeImpl = 8192;
                MethodAttributes.UnmanagedExport = 8;
                MethodAttributes.RTSpecialName = 4096;
                MethodAttributes.HasSecurity = 16384;
                MethodAttributes.RequireSecObject = 32768;
            })(metadata.MethodAttributes || (metadata.MethodAttributes = {}));
            var MethodAttributes = metadata.MethodAttributes;
            (function (MethodSemanticsAttributes) {
                MethodSemanticsAttributes._map = [];
                MethodSemanticsAttributes.Setter = 1;
                MethodSemanticsAttributes.Getter = 2;
                MethodSemanticsAttributes.Other = 4;
                MethodSemanticsAttributes.AddOn = 8;
                MethodSemanticsAttributes.RemoveOn = 16;
                MethodSemanticsAttributes.Fire = 32;
            })(metadata.MethodSemanticsAttributes || (metadata.MethodSemanticsAttributes = {}));
            var MethodSemanticsAttributes = metadata.MethodSemanticsAttributes;
            (function (ParamAttributes) {
                ParamAttributes._map = [];
                ParamAttributes.In = 1;
                ParamAttributes.Out = 2;
                ParamAttributes.Optional = 16;
                ParamAttributes.HasDefault = 4096;
                ParamAttributes.HasFieldMarshal = 8192;
                ParamAttributes.Unused = 53216;
            })(metadata.ParamAttributes || (metadata.ParamAttributes = {}));
            var ParamAttributes = metadata.ParamAttributes;
            (function (PropertyAttributes) {
                PropertyAttributes._map = [];
                PropertyAttributes.SpecialName = 512;
                PropertyAttributes.RTSpecialName = 1024;
                PropertyAttributes.HasDefault = 4096;
                PropertyAttributes.Unused = 59903;
            })(metadata.PropertyAttributes || (metadata.PropertyAttributes = {}));
            var PropertyAttributes = metadata.PropertyAttributes;
            (function (CallingConventions) {
                CallingConventions._map = [];
                CallingConventions.Default = 0;
                CallingConventions.C = 1;
                CallingConventions.StdCall = 2;
                CallingConventions.FastCall = 4;
                CallingConventions.VarArg = 5;
                CallingConventions.Generic = 16;
                CallingConventions.HasThis = 32;
                CallingConventions.ExplicitThis = 64;
                CallingConventions.Sentinel = 65;
            })(metadata.CallingConventions || (metadata.CallingConventions = {}));
            var CallingConventions = metadata.CallingConventions;
            (function (TableKind) {
                TableKind._map = [];
                TableKind.ModuleDefinition = 0;
                TableKind.ExternalType = 1;
                TableKind.TypeDefinition = 2;
                TableKind.FieldDefinition = 4;
                TableKind.MethodDefinition = 6;
                TableKind.ParameterDefinition = 8;
                TableKind.MemberRef = 10;
                TableKind.Constant = 11;
                TableKind.CustomAttribute = 12;
                TableKind.FieldMarshal = 13;
                TableKind.DeclSecurity = 14;
                TableKind.ClassLayout = 15;
                TableKind.InterfaceImpl = 9;
                TableKind.FieldLayout = 16;
                TableKind.StandAloneSig = 17;
                TableKind.EventMap = 18;
                TableKind.Event = 20;
                TableKind.PropertyMap = 21;
                TableKind.PropertyDefinition = 23;
                TableKind.MethodSemantics = 24;
                TableKind.MethodImpl = 25;
                TableKind.ModuleRef = 26;
                TableKind.TypeSpec = 27;
                TableKind.ImplMap = 28;
                TableKind.FieldRVA = 29;
                TableKind.AssemblyDefinition = 32;
                TableKind.AssemblyProcessor = 33;
                TableKind.AssemblyOS = 34;
                TableKind.AssemblyRef = 35;
                TableKind.AssemblyRefProcessor = 36;
                TableKind.AssemblyRefOS = 37;
                TableKind.File = 38;
                TableKind.ExportedType = 39;
                TableKind.ManifestResource = 40;
                TableKind.NestedClass = 41;
                TableKind.GenericParam = 42;
                TableKind.MethodSpec = 43;
                TableKind.GenericParamConstraint = 44;
            })(metadata.TableKind || (metadata.TableKind = {}));
            var TableKind = metadata.TableKind;
        })(managed2.metadata || (managed2.metadata = {}));
        var metadata = managed2.metadata;
    })(pe.managed2 || (pe.managed2 = {}));
    var managed2 = pe.managed2;
})(pe || (pe = {}));
var sampleExe;
(function (sampleExe) {
    var sampleBuf = [
        77, 
        90, 
        144, 
        , 
        3, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        255, 
        255, 
        , 
        , 
        184, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        128, 
        , 
        , 
        , 
        14, 
        31, 
        186, 
        14, 
        , 
        180, 
        9, 
        205, 
        33, 
        184, 
        1, 
        76, 
        205, 
        33, 
        84, 
        104, 
        105, 
        115, 
        32, 
        112, 
        114, 
        111, 
        103, 
        114, 
        97, 
        109, 
        32, 
        99, 
        97, 
        110, 
        110, 
        111, 
        116, 
        32, 
        98, 
        101, 
        32, 
        114, 
        117, 
        110, 
        32, 
        105, 
        110, 
        32, 
        68, 
        79, 
        83, 
        32, 
        109, 
        111, 
        100, 
        101, 
        46, 
        13, 
        13, 
        10, 
        36, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        80, 
        69, 
        , 
        , 
        76, 
        1, 
        3, 
        , 
        195, 
        135, 
        151, 
        80, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        224, 
        , 
        2, 
        1, 
        11, 
        1, 
        8, 
        , 
        , 
        4, 
        , 
        , 
        , 
        6, 
        , 
        , 
        , 
        , 
        , 
        , 
        62, 
        35, 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        64, 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        32, 
        , 
        , 
        , 
        2, 
        , 
        , 
        4, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        128, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        3, 
        , 
        64, 
        133, 
        , 
        , 
        16, 
        , 
        , 
        16, 
        , 
        , 
        , 
        , 
        16, 
        , 
        , 
        16, 
        , 
        , 
        , 
        , 
        , 
        , 
        16, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        228, 
        34, 
        , 
        , 
        87, 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        160, 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        96, 
        , 
        , 
        12, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        8, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        8, 
        32, 
        , 
        , 
        72, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        46, 
        116, 
        101, 
        120, 
        116, 
        , 
        , 
        , 
        68, 
        3, 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        96, 
        46, 
        114, 
        115, 
        114, 
        99, 
        , 
        , 
        , 
        160, 
        2, 
        , 
        , 
        , 
        64, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        6, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        64, 
        46, 
        114, 
        101, 
        108, 
        111, 
        99, 
        , 
        , 
        12, 
        , 
        , 
        , 
        , 
        96, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        10, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        66, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        35, 
        , 
        , 
        , 
        , 
        , 
        , 
        72, 
        , 
        , 
        , 
        2, 
        , 
        5, 
        , 
        104, 
        32, 
        , 
        , 
        124, 
        2, 
        , 
        , 
        1, 
        , 
        , 
        , 
        1, 
        , 
        , 
        6, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        54, 
        , 
        114, 
        1, 
        , 
        , 
        112, 
        40, 
        3, 
        , 
        , 
        10, 
        , 
        42, 
        30, 
        2, 
        40, 
        4, 
        , 
        , 
        10, 
        42, 
        , 
        , 
        66, 
        83, 
        74, 
        66, 
        1, 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        12, 
        , 
        , 
        , 
        118, 
        50, 
        46, 
        48, 
        46, 
        53, 
        48, 
        55, 
        50, 
        55, 
        , 
        , 
        , 
        , 
        5, 
        , 
        108, 
        , 
        , 
        , 
        228, 
        , 
        , 
        , 
        35, 
        126, 
        , 
        , 
        80, 
        1, 
        , 
        , 
        184, 
        , 
        , 
        , 
        35, 
        83, 
        116, 
        114, 
        105, 
        110, 
        103, 
        115, 
        , 
        , 
        , 
        , 
        8, 
        2, 
        , 
        , 
        32, 
        , 
        , 
        , 
        35, 
        85, 
        83, 
        , 
        40, 
        2, 
        , 
        , 
        16, 
        , 
        , 
        , 
        35, 
        71, 
        85, 
        73, 
        68, 
        , 
        , 
        , 
        56, 
        2, 
        , 
        , 
        68, 
        , 
        , 
        , 
        35, 
        66, 
        108, 
        111, 
        98, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        2, 
        , 
        , 
        1, 
        71, 
        20, 
        , 
        , 
        9, 
        , 
        , 
        , 
        , 
        250, 
        1, 
        51, 
        , 
        22, 
        , 
        , 
        1, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        10, 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        6, 
        , 
        45, 
        , 
        38, 
        , 
        6, 
        , 
        95, 
        , 
        63, 
        , 
        6, 
        , 
        127, 
        , 
        63, 
        , 
        6, 
        , 
        164, 
        , 
        38, 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        1, 
        , 
        , 
        , 
        16, 
        , 
        21, 
        , 
        , 
        , 
        5, 
        , 
        1, 
        , 
        1, 
        , 
        80, 
        32, 
        , 
        , 
        , 
        , 
        145, 
        , 
        52, 
        , 
        10, 
        , 
        1, 
        , 
        94, 
        32, 
        , 
        , 
        , 
        , 
        134, 
        24, 
        57, 
        , 
        14, 
        , 
        1, 
        , 
        17, 
        , 
        57, 
        , 
        18, 
        , 
        25, 
        , 
        57, 
        , 
        14, 
        , 
        33, 
        , 
        172, 
        , 
        23, 
        , 
        9, 
        , 
        57, 
        , 
        14, 
        , 
        46, 
        , 
        11, 
        , 
        28, 
        , 
        46, 
        , 
        19, 
        , 
        37, 
        , 
        4, 
        128, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        157, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        29, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        60, 
        77, 
        111, 
        100, 
        117, 
        108, 
        101, 
        62, 
        , 
        115, 
        97, 
        109, 
        112, 
        108, 
        101, 
        46, 
        101, 
        120, 
        101, 
        , 
        80, 
        114, 
        111, 
        103, 
        114, 
        97, 
        109, 
        , 
        109, 
        115, 
        99, 
        111, 
        114, 
        108, 
        105, 
        98, 
        , 
        83, 
        121, 
        115, 
        116, 
        101, 
        109, 
        , 
        79, 
        98, 
        106, 
        101, 
        99, 
        116, 
        , 
        77, 
        97, 
        105, 
        110, 
        , 
        46, 
        99, 
        116, 
        111, 
        114, 
        , 
        83, 
        121, 
        115, 
        116, 
        101, 
        109, 
        46, 
        82, 
        117, 
        110, 
        116, 
        105, 
        109, 
        101, 
        46, 
        67, 
        111, 
        109, 
        112, 
        105, 
        108, 
        101, 
        114, 
        83, 
        101, 
        114, 
        118, 
        105, 
        99, 
        101, 
        115, 
        , 
        67, 
        111, 
        109, 
        112, 
        105, 
        108, 
        97, 
        116, 
        105, 
        111, 
        110, 
        82, 
        101, 
        108, 
        97, 
        120, 
        97, 
        116, 
        105, 
        111, 
        110, 
        115, 
        65, 
        116, 
        116, 
        114, 
        105, 
        98, 
        117, 
        116, 
        101, 
        , 
        82, 
        117, 
        110, 
        116, 
        105, 
        109, 
        101, 
        67, 
        111, 
        109, 
        112, 
        97, 
        116, 
        105, 
        98, 
        105, 
        108, 
        105, 
        116, 
        121, 
        65, 
        116, 
        116, 
        114, 
        105, 
        98, 
        117, 
        116, 
        101, 
        , 
        115, 
        97, 
        109, 
        112, 
        108, 
        101, 
        , 
        67, 
        111, 
        110, 
        115, 
        111, 
        108, 
        101, 
        , 
        87, 
        114, 
        105, 
        116, 
        101, 
        76, 
        105, 
        110, 
        101, 
        , 
        , 
        , 
        , 
        27, 
        72, 
        , 
        101, 
        , 
        108, 
        , 
        108, 
        , 
        111, 
        , 
        44, 
        , 
        32, 
        , 
        87, 
        , 
        111, 
        , 
        114, 
        , 
        108, 
        , 
        100, 
        , 
        33, 
        , 
        , 
        , 
        , 
        , 
        146, 
        199, 
        156, 
        13, 
        90, 
        202, 
        19, 
        73, 
        158, 
        118, 
        143, 
        24, 
        114, 
        188, 
        194, 
        39, 
        , 
        8, 
        183, 
        122, 
        92, 
        86, 
        25, 
        52, 
        224, 
        137, 
        3, 
        , 
        , 
        1, 
        3, 
        32, 
        , 
        1, 
        4, 
        32, 
        1, 
        1, 
        8, 
        4, 
        , 
        1, 
        1, 
        14, 
        8, 
        1, 
        , 
        8, 
        , 
        , 
        , 
        , 
        , 
        30, 
        1, 
        , 
        1, 
        , 
        84, 
        2, 
        22, 
        87, 
        114, 
        97, 
        112, 
        78, 
        111, 
        110, 
        69, 
        120, 
        99, 
        101, 
        112, 
        116, 
        105, 
        111, 
        110, 
        84, 
        104, 
        114, 
        111, 
        119, 
        115, 
        1, 
        12, 
        35, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        46, 
        35, 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        35, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        95, 
        67, 
        111, 
        114, 
        69, 
        120, 
        101, 
        77, 
        97, 
        105, 
        110, 
        , 
        109, 
        115, 
        99, 
        111, 
        114, 
        101, 
        101, 
        46, 
        100, 
        108, 
        108, 
        , 
        , 
        , 
        , 
        , 
        255, 
        37, 
        , 
        32, 
        64, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        16, 
        , 
        , 
        , 
        24, 
        , 
        , 
        128, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        1, 
        , 
        , 
        , 
        48, 
        , 
        , 
        128, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        72, 
        , 
        , 
        , 
        88, 
        64, 
        , 
        , 
        68, 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        68, 
        2, 
        52, 
        , 
        , 
        , 
        86, 
        , 
        83, 
        , 
        95, 
        , 
        86, 
        , 
        69, 
        , 
        82, 
        , 
        83, 
        , 
        73, 
        , 
        79, 
        , 
        78, 
        , 
        95, 
        , 
        73, 
        , 
        78, 
        , 
        70, 
        , 
        79, 
        , 
        , 
        , 
        , 
        , 
        189, 
        4, 
        239, 
        254, 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        63, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        68, 
        , 
        , 
        , 
        1, 
        , 
        86, 
        , 
        97, 
        , 
        114, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        73, 
        , 
        110, 
        , 
        102, 
        , 
        111, 
        , 
        , 
        , 
        , 
        , 
        36, 
        , 
        4, 
        , 
        , 
        , 
        84, 
        , 
        114, 
        , 
        97, 
        , 
        110, 
        , 
        115, 
        , 
        108, 
        , 
        97, 
        , 
        116, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        176, 
        4, 
        164, 
        1, 
        , 
        , 
        1, 
        , 
        83, 
        , 
        116, 
        , 
        114, 
        , 
        105, 
        , 
        110, 
        , 
        103, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        73, 
        , 
        110, 
        , 
        102, 
        , 
        111, 
        , 
        , 
        , 
        128, 
        1, 
        , 
        , 
        1, 
        , 
        48, 
        , 
        48, 
        , 
        48, 
        , 
        48, 
        , 
        48, 
        , 
        52, 
        , 
        98, 
        , 
        48, 
        , 
        , 
        , 
        44, 
        , 
        2, 
        , 
        1, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        68, 
        , 
        101, 
        , 
        115, 
        , 
        99, 
        , 
        114, 
        , 
        105, 
        , 
        112, 
        , 
        116, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        48, 
        , 
        8, 
        , 
        1, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        86, 
        , 
        101, 
        , 
        114, 
        , 
        115, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        , 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        , 
        , 
        56, 
        , 
        11, 
        , 
        1, 
        , 
        73, 
        , 
        110, 
        , 
        116, 
        , 
        101, 
        , 
        114, 
        , 
        110, 
        , 
        97, 
        , 
        108, 
        , 
        78, 
        , 
        97, 
        , 
        109, 
        , 
        101, 
        , 
        , 
        , 
        115, 
        , 
        97, 
        , 
        109, 
        , 
        112, 
        , 
        108, 
        , 
        101, 
        , 
        46, 
        , 
        101, 
        , 
        120, 
        , 
        101, 
        , 
        , 
        , 
        , 
        , 
        40, 
        , 
        2, 
        , 
        1, 
        , 
        76, 
        , 
        101, 
        , 
        103, 
        , 
        97, 
        , 
        108, 
        , 
        67, 
        , 
        111, 
        , 
        112, 
        , 
        121, 
        , 
        114, 
        , 
        105, 
        , 
        103, 
        , 
        104, 
        , 
        116, 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        64, 
        , 
        11, 
        , 
        1, 
        , 
        79, 
        , 
        114, 
        , 
        105, 
        , 
        103, 
        , 
        105, 
        , 
        110, 
        , 
        97, 
        , 
        108, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        110, 
        , 
        97, 
        , 
        109, 
        , 
        101, 
        , 
        , 
        , 
        115, 
        , 
        97, 
        , 
        109, 
        , 
        112, 
        , 
        108, 
        , 
        101, 
        , 
        46, 
        , 
        101, 
        , 
        120, 
        , 
        101, 
        , 
        , 
        , 
        , 
        , 
        52, 
        , 
        8, 
        , 
        1, 
        , 
        80, 
        , 
        114, 
        , 
        111, 
        , 
        100, 
        , 
        117, 
        , 
        99, 
        , 
        116, 
        , 
        86, 
        , 
        101, 
        , 
        114, 
        , 
        115, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        , 
        , 
        56, 
        , 
        8, 
        , 
        1, 
        , 
        65, 
        , 
        115, 
        , 
        115, 
        , 
        101, 
        , 
        109, 
        , 
        98, 
        , 
        108, 
        , 
        121, 
        , 
        32, 
        , 
        86, 
        , 
        101, 
        , 
        114, 
        , 
        115, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        12, 
        , 
        , 
        , 
        64, 
        51
    ];
    sampleBuf[3071] = 0;
    for(var i = 0; i < sampleBuf.length; i++) {
        if(!sampleBuf[i]) {
            sampleBuf[i] = 0;
        }
    }
    var global = (function () {
        return this;
    })();
    if("ArrayBuffer" in global) {
        var arrb = new ArrayBuffer(sampleBuf.length);
        var vi = new DataView(arrb);
        for(var i = 0; i < sampleBuf.length; i++) {
            vi.setUint8(i, sampleBuf[i]);
        }
        sampleBuf = arrb;
    }
    sampleExe.bytes = sampleBuf;
})(sampleExe || (sampleExe = {}));
var test_AppDomain_sampleExe;
(function (test_AppDomain_sampleExe) {
    function constructor_succeeds() {
        var appDomain = new pe.managed2.AppDomain();
    }
    test_AppDomain_sampleExe.constructor_succeeds = constructor_succeeds;
    function constructor_hasMscorlib() {
        var appDomain = new pe.managed2.AppDomain();
        if(appDomain.assemblies.length !== 1) {
            throw "incorrect number of assemblies: " + appDomain.assemblies.length;
        }
        var mscorlib = appDomain.assemblies[0];
        if(mscorlib.name !== "mscorlib") {
            throw "incorrect name of mscorlib: " + mscorlib.name;
        }
        if(!mscorlib.isSpeculative) {
            throw "mscorlib should be marked as speculative on init";
        }
    }
    test_AppDomain_sampleExe.constructor_hasMscorlib = constructor_hasMscorlib;
    function read_succeeds() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var appDomain = new pe.managed2.AppDomain();
        var asm = appDomain.read(bi);
    }
    test_AppDomain_sampleExe.read_succeeds = read_succeeds;
    function read_has2Assemblies() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var appDomain = new pe.managed2.AppDomain();
        var asm = appDomain.read(bi);
        if(appDomain.assemblies.length != 2) {
            throw "incorrect number of assemblies: " + appDomain.assemblies.length;
        }
    }
    test_AppDomain_sampleExe.read_has2Assemblies = read_has2Assemblies;
    function read_toString() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var appDomain = new pe.managed2.AppDomain();
        var asm = appDomain.read(bi);
        var expectedFullName = "sample, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null";
        if(asm.toString() !== expectedFullName) {
            throw asm.toString() + " expected " + expectedFullName;
        }
    }
    test_AppDomain_sampleExe.read_toString = read_toString;
    function read_types_length2() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var appDomain = new pe.managed2.AppDomain();
        var asm = appDomain.read(bi);
        if(asm.types.length !== 2) {
            throw asm.types.length;
        }
    }
    test_AppDomain_sampleExe.read_types_length2 = read_types_length2;
    function read_types_0_toString() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var appDomain = new pe.managed2.AppDomain();
        var asm = appDomain.read(bi);
        var t0 = asm.types[0];
        var expectedFullName = "<Module>";
        if(t0.toString() !== expectedFullName) {
            throw t0.toString() + " expected " + expectedFullName;
        }
    }
    test_AppDomain_sampleExe.read_types_0_toString = read_types_0_toString;
    function read_types_1_toString() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var appDomain = new pe.managed2.AppDomain();
        var asm = appDomain.read(bi);
        var t0 = asm.types[1];
        var expectedFullName = "Program";
        if(t0.toString() !== expectedFullName) {
            throw t0.toString() + " expected " + expectedFullName;
        }
    }
    test_AppDomain_sampleExe.read_types_1_toString = read_types_1_toString;
})(test_AppDomain_sampleExe || (test_AppDomain_sampleExe = {}));
var sample64Exe;
(function (sample64Exe) {
    var sampleBuf = [
        77, 
        90, 
        144, 
        , 
        3, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        255, 
        255, 
        , 
        , 
        184, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        128, 
        , 
        , 
        , 
        14, 
        31, 
        186, 
        14, 
        , 
        180, 
        9, 
        205, 
        33, 
        184, 
        1, 
        76, 
        205, 
        33, 
        84, 
        104, 
        105, 
        115, 
        32, 
        112, 
        114, 
        111, 
        103, 
        114, 
        97, 
        109, 
        32, 
        99, 
        97, 
        110, 
        110, 
        111, 
        116, 
        32, 
        98, 
        101, 
        32, 
        114, 
        117, 
        110, 
        32, 
        105, 
        110, 
        32, 
        68, 
        79, 
        83, 
        32, 
        109, 
        111, 
        100, 
        101, 
        46, 
        13, 
        13, 
        10, 
        36, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        80, 
        69, 
        , 
        , 
        100, 
        134, 
        2, 
        , 
        160, 
        22, 
        193, 
        80, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        240, 
        , 
        34, 
        , 
        11, 
        2, 
        11, 
        , 
        , 
        4, 
        , 
        , 
        , 
        6, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        , 
        , 
        64, 
        1, 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        2, 
        , 
        , 
        4, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        96, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        3, 
        , 
        64, 
        133, 
        , 
        , 
        64, 
        , 
        , 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        16, 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        16, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        224, 
        4, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        72, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        46, 
        116, 
        101, 
        120, 
        116, 
        , 
        , 
        , 
        232, 
        2, 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        96, 
        46, 
        114, 
        115, 
        114, 
        99, 
        , 
        , 
        , 
        224, 
        4, 
        , 
        , 
        , 
        64, 
        , 
        , 
        , 
        6, 
        , 
        , 
        , 
        6, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        64, 
        46, 
        114, 
        101, 
        108, 
        111, 
        99, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        96, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        12, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        64, 
        , 
        , 
        66, 
        72, 
        , 
        , 
        , 
        2, 
        , 
        5, 
        , 
        104, 
        32, 
        , 
        , 
        128, 
        2, 
        , 
        , 
        1, 
        , 
        , 
        , 
        1, 
        , 
        , 
        6, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        54, 
        , 
        114, 
        1, 
        , 
        , 
        112, 
        40, 
        3, 
        , 
        , 
        10, 
        , 
        42, 
        30, 
        2, 
        40, 
        4, 
        , 
        , 
        10, 
        42, 
        , 
        , 
        66, 
        83, 
        74, 
        66, 
        1, 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        12, 
        , 
        , 
        , 
        118, 
        52, 
        46, 
        48, 
        46, 
        51, 
        48, 
        51, 
        49, 
        57, 
        , 
        , 
        , 
        , 
        5, 
        , 
        108, 
        , 
        , 
        , 
        228, 
        , 
        , 
        , 
        35, 
        126, 
        , 
        , 
        80, 
        1, 
        , 
        , 
        188, 
        , 
        , 
        , 
        35, 
        83, 
        116, 
        114, 
        105, 
        110, 
        103, 
        115, 
        , 
        , 
        , 
        , 
        12, 
        2, 
        , 
        , 
        32, 
        , 
        , 
        , 
        35, 
        85, 
        83, 
        , 
        44, 
        2, 
        , 
        , 
        16, 
        , 
        , 
        , 
        35, 
        71, 
        85, 
        73, 
        68, 
        , 
        , 
        , 
        60, 
        2, 
        , 
        , 
        68, 
        , 
        , 
        , 
        35, 
        66, 
        108, 
        111, 
        98, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        2, 
        , 
        , 
        1, 
        71, 
        20, 
        , 
        , 
        9, 
        , 
        , 
        , 
        , 
        250, 
        37, 
        51, 
        , 
        22, 
        , 
        , 
        1, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        2, 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        10, 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        6, 
        , 
        47, 
        , 
        40, 
        , 
        6, 
        , 
        97, 
        , 
        65, 
        , 
        6, 
        , 
        129, 
        , 
        65, 
        , 
        6, 
        , 
        168, 
        , 
        40, 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        1, 
        , 
        , 
        , 
        16, 
        , 
        23, 
        , 
        , 
        , 
        5, 
        , 
        1, 
        , 
        1, 
        , 
        80, 
        32, 
        , 
        , 
        , 
        , 
        145, 
        , 
        54, 
        , 
        10, 
        , 
        1, 
        , 
        94, 
        32, 
        , 
        , 
        , 
        , 
        134, 
        24, 
        59, 
        , 
        14, 
        , 
        1, 
        , 
        17, 
        , 
        59, 
        , 
        18, 
        , 
        25, 
        , 
        59, 
        , 
        14, 
        , 
        33, 
        , 
        176, 
        , 
        23, 
        , 
        9, 
        , 
        59, 
        , 
        14, 
        , 
        46, 
        , 
        11, 
        , 
        28, 
        , 
        46, 
        , 
        19, 
        , 
        37, 
        , 
        4, 
        128, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        159, 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        31, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        60, 
        77, 
        111, 
        100, 
        117, 
        108, 
        101, 
        62, 
        , 
        115, 
        97, 
        109, 
        112, 
        108, 
        101, 
        54, 
        52, 
        46, 
        101, 
        120, 
        101, 
        , 
        80, 
        114, 
        111, 
        103, 
        114, 
        97, 
        109, 
        , 
        109, 
        115, 
        99, 
        111, 
        114, 
        108, 
        105, 
        98, 
        , 
        83, 
        121, 
        115, 
        116, 
        101, 
        109, 
        , 
        79, 
        98, 
        106, 
        101, 
        99, 
        116, 
        , 
        77, 
        97, 
        105, 
        110, 
        , 
        46, 
        99, 
        116, 
        111, 
        114, 
        , 
        83, 
        121, 
        115, 
        116, 
        101, 
        109, 
        46, 
        82, 
        117, 
        110, 
        116, 
        105, 
        109, 
        101, 
        46, 
        67, 
        111, 
        109, 
        112, 
        105, 
        108, 
        101, 
        114, 
        83, 
        101, 
        114, 
        118, 
        105, 
        99, 
        101, 
        115, 
        , 
        67, 
        111, 
        109, 
        112, 
        105, 
        108, 
        97, 
        116, 
        105, 
        111, 
        110, 
        82, 
        101, 
        108, 
        97, 
        120, 
        97, 
        116, 
        105, 
        111, 
        110, 
        115, 
        65, 
        116, 
        116, 
        114, 
        105, 
        98, 
        117, 
        116, 
        101, 
        , 
        82, 
        117, 
        110, 
        116, 
        105, 
        109, 
        101, 
        67, 
        111, 
        109, 
        112, 
        97, 
        116, 
        105, 
        98, 
        105, 
        108, 
        105, 
        116, 
        121, 
        65, 
        116, 
        116, 
        114, 
        105, 
        98, 
        117, 
        116, 
        101, 
        , 
        115, 
        97, 
        109, 
        112, 
        108, 
        101, 
        54, 
        52, 
        , 
        67, 
        111, 
        110, 
        115, 
        111, 
        108, 
        101, 
        , 
        87, 
        114, 
        105, 
        116, 
        101, 
        76, 
        105, 
        110, 
        101, 
        , 
        , 
        , 
        , 
        27, 
        72, 
        , 
        101, 
        , 
        108, 
        , 
        108, 
        , 
        111, 
        , 
        44, 
        , 
        32, 
        , 
        87, 
        , 
        111, 
        , 
        114, 
        , 
        108, 
        , 
        100, 
        , 
        33, 
        , 
        , 
        , 
        , 
        , 
        202, 
        173, 
        71, 
        97, 
        31, 
        64, 
        83, 
        71, 
        138, 
        19, 
        175, 
        127, 
        84, 
        43, 
        181, 
        190, 
        , 
        8, 
        183, 
        122, 
        92, 
        86, 
        25, 
        52, 
        224, 
        137, 
        3, 
        , 
        , 
        1, 
        3, 
        32, 
        , 
        1, 
        4, 
        32, 
        1, 
        1, 
        8, 
        4, 
        , 
        1, 
        1, 
        14, 
        8, 
        1, 
        , 
        8, 
        , 
        , 
        , 
        , 
        , 
        30, 
        1, 
        , 
        1, 
        , 
        84, 
        2, 
        22, 
        87, 
        114, 
        97, 
        112, 
        78, 
        111, 
        110, 
        69, 
        120, 
        99, 
        101, 
        112, 
        116, 
        105, 
        111, 
        110, 
        84, 
        104, 
        114, 
        111, 
        119, 
        115, 
        1, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        2, 
        , 
        16, 
        , 
        , 
        , 
        32, 
        , 
        , 
        128, 
        24, 
        , 
        , 
        , 
        56, 
        , 
        , 
        128, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        1, 
        , 
        , 
        , 
        80, 
        , 
        , 
        128, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        1, 
        , 
        , 
        , 
        104, 
        , 
        , 
        128, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        128, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        144, 
        , 
        , 
        , 
        160, 
        64, 
        , 
        , 
        76, 
        2, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        240, 
        66, 
        , 
        , 
        234, 
        1, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        76, 
        2, 
        52, 
        , 
        , 
        , 
        86, 
        , 
        83, 
        , 
        95, 
        , 
        86, 
        , 
        69, 
        , 
        82, 
        , 
        83, 
        , 
        73, 
        , 
        79, 
        , 
        78, 
        , 
        95, 
        , 
        73, 
        , 
        78, 
        , 
        70, 
        , 
        79, 
        , 
        , 
        , 
        , 
        , 
        189, 
        4, 
        239, 
        254, 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        63, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        4, 
        , 
        , 
        , 
        1, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        68, 
        , 
        , 
        , 
        1, 
        , 
        86, 
        , 
        97, 
        , 
        114, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        73, 
        , 
        110, 
        , 
        102, 
        , 
        111, 
        , 
        , 
        , 
        , 
        , 
        36, 
        , 
        4, 
        , 
        , 
        , 
        84, 
        , 
        114, 
        , 
        97, 
        , 
        110, 
        , 
        115, 
        , 
        108, 
        , 
        97, 
        , 
        116, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        176, 
        4, 
        172, 
        1, 
        , 
        , 
        1, 
        , 
        83, 
        , 
        116, 
        , 
        114, 
        , 
        105, 
        , 
        110, 
        , 
        103, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        73, 
        , 
        110, 
        , 
        102, 
        , 
        111, 
        , 
        , 
        , 
        136, 
        1, 
        , 
        , 
        1, 
        , 
        48, 
        , 
        48, 
        , 
        48, 
        , 
        48, 
        , 
        48, 
        , 
        52, 
        , 
        98, 
        , 
        48, 
        , 
        , 
        , 
        44, 
        , 
        2, 
        , 
        1, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        68, 
        , 
        101, 
        , 
        115, 
        , 
        99, 
        , 
        114, 
        , 
        105, 
        , 
        112, 
        , 
        116, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        48, 
        , 
        8, 
        , 
        1, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        86, 
        , 
        101, 
        , 
        114, 
        , 
        115, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        , 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        , 
        , 
        60, 
        , 
        13, 
        , 
        1, 
        , 
        73, 
        , 
        110, 
        , 
        116, 
        , 
        101, 
        , 
        114, 
        , 
        110, 
        , 
        97, 
        , 
        108, 
        , 
        78, 
        , 
        97, 
        , 
        109, 
        , 
        101, 
        , 
        , 
        , 
        115, 
        , 
        97, 
        , 
        109, 
        , 
        112, 
        , 
        108, 
        , 
        101, 
        , 
        54, 
        , 
        52, 
        , 
        46, 
        , 
        101, 
        , 
        120, 
        , 
        101, 
        , 
        , 
        , 
        , 
        , 
        40, 
        , 
        2, 
        , 
        1, 
        , 
        76, 
        , 
        101, 
        , 
        103, 
        , 
        97, 
        , 
        108, 
        , 
        67, 
        , 
        111, 
        , 
        112, 
        , 
        121, 
        , 
        114, 
        , 
        105, 
        , 
        103, 
        , 
        104, 
        , 
        116, 
        , 
        , 
        , 
        32, 
        , 
        , 
        , 
        68, 
        , 
        13, 
        , 
        1, 
        , 
        79, 
        , 
        114, 
        , 
        105, 
        , 
        103, 
        , 
        105, 
        , 
        110, 
        , 
        97, 
        , 
        108, 
        , 
        70, 
        , 
        105, 
        , 
        108, 
        , 
        101, 
        , 
        110, 
        , 
        97, 
        , 
        109, 
        , 
        101, 
        , 
        , 
        , 
        115, 
        , 
        97, 
        , 
        109, 
        , 
        112, 
        , 
        108, 
        , 
        101, 
        , 
        54, 
        , 
        52, 
        , 
        46, 
        , 
        101, 
        , 
        120, 
        , 
        101, 
        , 
        , 
        , 
        , 
        , 
        52, 
        , 
        8, 
        , 
        1, 
        , 
        80, 
        , 
        114, 
        , 
        111, 
        , 
        100, 
        , 
        117, 
        , 
        99, 
        , 
        116, 
        , 
        86, 
        , 
        101, 
        , 
        114, 
        , 
        115, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        , 
        , 
        56, 
        , 
        8, 
        , 
        1, 
        , 
        65, 
        , 
        115, 
        , 
        115, 
        , 
        101, 
        , 
        109, 
        , 
        98, 
        , 
        108, 
        , 
        121, 
        , 
        32, 
        , 
        86, 
        , 
        101, 
        , 
        114, 
        , 
        115, 
        , 
        105, 
        , 
        111, 
        , 
        110, 
        , 
        , 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        46, 
        , 
        48, 
        , 
        , 
        , 
        , 
        , 
        , 
        , 
        239, 
        187, 
        191, 
        60, 
        63, 
        120, 
        109, 
        108, 
        32, 
        118, 
        101, 
        114, 
        115, 
        105, 
        111, 
        110, 
        61, 
        34, 
        49, 
        46, 
        48, 
        34, 
        32, 
        101, 
        110, 
        99, 
        111, 
        100, 
        105, 
        110, 
        103, 
        61, 
        34, 
        85, 
        84, 
        70, 
        45, 
        56, 
        34, 
        32, 
        115, 
        116, 
        97, 
        110, 
        100, 
        97, 
        108, 
        111, 
        110, 
        101, 
        61, 
        34, 
        121, 
        101, 
        115, 
        34, 
        63, 
        62, 
        13, 
        10, 
        60, 
        97, 
        115, 
        115, 
        101, 
        109, 
        98, 
        108, 
        121, 
        32, 
        120, 
        109, 
        108, 
        110, 
        115, 
        61, 
        34, 
        117, 
        114, 
        110, 
        58, 
        115, 
        99, 
        104, 
        101, 
        109, 
        97, 
        115, 
        45, 
        109, 
        105, 
        99, 
        114, 
        111, 
        115, 
        111, 
        102, 
        116, 
        45, 
        99, 
        111, 
        109, 
        58, 
        97, 
        115, 
        109, 
        46, 
        118, 
        49, 
        34, 
        32, 
        109, 
        97, 
        110, 
        105, 
        102, 
        101, 
        115, 
        116, 
        86, 
        101, 
        114, 
        115, 
        105, 
        111, 
        110, 
        61, 
        34, 
        49, 
        46, 
        48, 
        34, 
        62, 
        13, 
        10, 
        32, 
        32, 
        60, 
        97, 
        115, 
        115, 
        101, 
        109, 
        98, 
        108, 
        121, 
        73, 
        100, 
        101, 
        110, 
        116, 
        105, 
        116, 
        121, 
        32, 
        118, 
        101, 
        114, 
        115, 
        105, 
        111, 
        110, 
        61, 
        34, 
        49, 
        46, 
        48, 
        46, 
        48, 
        46, 
        48, 
        34, 
        32, 
        110, 
        97, 
        109, 
        101, 
        61, 
        34, 
        77, 
        121, 
        65, 
        112, 
        112, 
        108, 
        105, 
        99, 
        97, 
        116, 
        105, 
        111, 
        110, 
        46, 
        97, 
        112, 
        112, 
        34, 
        47, 
        62, 
        13, 
        10, 
        32, 
        32, 
        60, 
        116, 
        114, 
        117, 
        115, 
        116, 
        73, 
        110, 
        102, 
        111, 
        32, 
        120, 
        109, 
        108, 
        110, 
        115, 
        61, 
        34, 
        117, 
        114, 
        110, 
        58, 
        115, 
        99, 
        104, 
        101, 
        109, 
        97, 
        115, 
        45, 
        109, 
        105, 
        99, 
        114, 
        111, 
        115, 
        111, 
        102, 
        116, 
        45, 
        99, 
        111, 
        109, 
        58, 
        97, 
        115, 
        109, 
        46, 
        118, 
        50, 
        34, 
        62, 
        13, 
        10, 
        32, 
        32, 
        32, 
        32, 
        60, 
        115, 
        101, 
        99, 
        117, 
        114, 
        105, 
        116, 
        121, 
        62, 
        13, 
        10, 
        32, 
        32, 
        32, 
        32, 
        32, 
        32, 
        60, 
        114, 
        101, 
        113, 
        117, 
        101, 
        115, 
        116, 
        101, 
        100, 
        80, 
        114, 
        105, 
        118, 
        105, 
        108, 
        101, 
        103, 
        101, 
        115, 
        32, 
        120, 
        109, 
        108, 
        110, 
        115, 
        61, 
        34, 
        117, 
        114, 
        110, 
        58, 
        115, 
        99, 
        104, 
        101, 
        109, 
        97, 
        115, 
        45, 
        109, 
        105, 
        99, 
        114, 
        111, 
        115, 
        111, 
        102, 
        116, 
        45, 
        99, 
        111, 
        109, 
        58, 
        97, 
        115, 
        109, 
        46, 
        118, 
        51, 
        34, 
        62, 
        13, 
        10, 
        32, 
        32, 
        32, 
        32, 
        32, 
        32, 
        32, 
        32, 
        60, 
        114, 
        101, 
        113, 
        117, 
        101, 
        115, 
        116, 
        101, 
        100, 
        69, 
        120, 
        101, 
        99, 
        117, 
        116, 
        105, 
        111, 
        110, 
        76, 
        101, 
        118, 
        101, 
        108, 
        32, 
        108, 
        101, 
        118, 
        101, 
        108, 
        61, 
        34, 
        97, 
        115, 
        73, 
        110, 
        118, 
        111, 
        107, 
        101, 
        114, 
        34, 
        32, 
        117, 
        105, 
        65, 
        99, 
        99, 
        101, 
        115, 
        115, 
        61, 
        34, 
        102, 
        97, 
        108, 
        115, 
        101, 
        34, 
        47, 
        62, 
        13, 
        10, 
        32, 
        32, 
        32, 
        32, 
        32, 
        32, 
        60, 
        47, 
        114, 
        101, 
        113, 
        117, 
        101, 
        115, 
        116, 
        101, 
        100, 
        80, 
        114, 
        105, 
        118, 
        105, 
        108, 
        101, 
        103, 
        101, 
        115, 
        62, 
        13, 
        10, 
        32, 
        32, 
        32, 
        32, 
        60, 
        47, 
        115, 
        101, 
        99, 
        117, 
        114, 
        105, 
        116, 
        121, 
        62, 
        13, 
        10, 
        32, 
        32, 
        60, 
        47, 
        116, 
        114, 
        117, 
        115, 
        116, 
        73, 
        110, 
        102, 
        111, 
        62, 
        13, 
        10, 
        60, 
        47, 
        97, 
        115, 
        115, 
        101, 
        109, 
        98, 
        108, 
        121, 
        62, 
        13, 
        10
    ];
    sampleBuf[3071] = 0;
    for(var i = 0; i < sampleBuf.length; i++) {
        if(!sampleBuf[i]) {
            sampleBuf[i] = 0;
        }
    }
    var global = (function () {
        return this;
    })();
    if("ArrayBuffer" in global) {
        var arrb = new ArrayBuffer(sampleBuf.length);
        var vi = new DataView(arrb);
        for(var i = 0; i < sampleBuf.length; i++) {
            vi.setUint8(i, sampleBuf[i]);
        }
        sampleBuf = arrb;
    }
    sample64Exe.bytes = sampleBuf;
})(sample64Exe || (sample64Exe = {}));
var test_AppDomain_sample64Exe;
(function (test_AppDomain_sample64Exe) {
    function read_succeeds() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var appDomain = new pe.managed2.AppDomain();
        var asm = appDomain.read(bi);
    }
    test_AppDomain_sample64Exe.read_succeeds = read_succeeds;
    function read_toString() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var appDomain = new pe.managed2.AppDomain();
        var asm = appDomain.read(bi);
        var expectedFullName = "sample64, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null";
        if(asm.toString() !== expectedFullName) {
            throw asm.toString() + " expected " + expectedFullName;
        }
    }
    test_AppDomain_sample64Exe.read_toString = read_toString;
    function read_types_length2() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var appDomain = new pe.managed2.AppDomain();
        var asm = appDomain.read(bi);
        if(asm.types.length !== 2) {
            throw asm.types.length;
        }
    }
    test_AppDomain_sample64Exe.read_types_length2 = read_types_length2;
    function read_types_0_toString() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var appDomain = new pe.managed2.AppDomain();
        var asm = appDomain.read(bi);
        var t0 = asm.types[0];
        var expectedFullName = "<Module>";
        if(t0.toString() !== expectedFullName) {
            throw t0.toString() + " expected " + expectedFullName;
        }
    }
    test_AppDomain_sample64Exe.read_types_0_toString = read_types_0_toString;
    function read_types_1_toString() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var appDomain = new pe.managed2.AppDomain();
        var asm = appDomain.read(bi);
        var t0 = asm.types[1];
        var expectedFullName = "Program";
        if(t0.toString() !== expectedFullName) {
            throw t0.toString() + " expected " + expectedFullName;
        }
    }
    test_AppDomain_sample64Exe.read_types_1_toString = read_types_1_toString;
})(test_AppDomain_sample64Exe || (test_AppDomain_sample64Exe = {}));
var test_AppDomain_monoCorlibDll;
(function (test_AppDomain_monoCorlibDll) {
    function constructor_succeeds() {
        var appDomain = new pe.managed2.AppDomain();
    }
    test_AppDomain_monoCorlibDll.constructor_succeeds = constructor_succeeds;
    function read_succeeds() {
        var bi = new pe.io.BufferReader(monoCorlib);
        var appDomain = new pe.managed2.AppDomain();
        var asm = appDomain.read(bi);
    }
    test_AppDomain_monoCorlibDll.read_succeeds = read_succeeds;
    function read_toString() {
        var bi = new pe.io.BufferReader(monoCorlib);
        var appDomain = new pe.managed2.AppDomain();
        var asm = appDomain.read(bi);
        var expectedFullName = "mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089";
        if(asm.toString() !== expectedFullName) {
            throw asm.toString() + " expected " + expectedFullName;
        }
    }
    test_AppDomain_monoCorlibDll.read_toString = read_toString;
    function read_types_length_2094() {
        var bi = new pe.io.BufferReader(monoCorlib);
        var appDomain = new pe.managed2.AppDomain();
        var asm = appDomain.read(bi);
        if(asm.types.length !== 2094) {
            throw asm.types.length;
        }
    }
    test_AppDomain_monoCorlibDll.read_types_length_2094 = read_types_length_2094;
    function read_types_0_toString() {
        var bi = new pe.io.BufferReader(monoCorlib);
        var appDomain = new pe.managed2.AppDomain();
        var asm = appDomain.read(bi);
        var t0 = asm.types[0];
        var expectedFullName = "System.Void";
        if(t0.toString() !== expectedFullName) {
            throw t0.toString() + " expected " + expectedFullName;
        }
    }
    test_AppDomain_monoCorlibDll.read_types_0_toString = read_types_0_toString;
    function read_types_21_toString() {
        var bi = new pe.io.BufferReader(monoCorlib);
        var appDomain = new pe.managed2.AppDomain();
        var asm = appDomain.read(bi);
        var t0 = asm.types[21];
        var expectedFullName = "<Module>";
        if(t0.toString() !== expectedFullName) {
            throw t0.toString() + " expected " + expectedFullName;
        }
    }
    test_AppDomain_monoCorlibDll.read_types_21_toString = read_types_21_toString;
})(test_AppDomain_monoCorlibDll || (test_AppDomain_monoCorlibDll = {}));
var test_DataDirectory;
(function (test_DataDirectory) {
    function constructor_succeeds() {
        var dd = new pe.io.AddressRange(0, 0);
    }
    test_DataDirectory.constructor_succeeds = constructor_succeeds;
    function constructor_assigns_address_654201() {
        var dd = new pe.io.AddressRange(654201, 0);
        if(dd.address !== 654201) {
            throw dd.address;
        }
    }
    test_DataDirectory.constructor_assigns_address_654201 = constructor_assigns_address_654201;
    function constructor_assigns_size_900114() {
        var dd = new pe.io.AddressRange(0, 900114);
        if(dd.size !== 900114) {
            throw dd.size;
        }
    }
    test_DataDirectory.constructor_assigns_size_900114 = constructor_assigns_size_900114;
    function toString_0xCEF_0x36A() {
        var dd = new pe.io.AddressRange(3311, 874);
        if(dd.toString() !== "CEF:36Ah") {
            throw dd.toString();
        }
    }
    test_DataDirectory.toString_0xCEF_0x36A = toString_0xCEF_0x36A;
    function mapRelative_default_0_minus1() {
        var dd = new pe.io.AddressRange(0, 0);
        var r = dd.mapRelative(0);
        if(r !== -1) {
            throw r;
        }
    }
    test_DataDirectory.mapRelative_default_0_minus1 = mapRelative_default_0_minus1;
    function mapRelative_default_64_minus1() {
        var dd = new pe.io.AddressRange(0, 0);
        var r = dd.mapRelative(64);
        if(r !== -1) {
            throw r;
        }
    }
    test_DataDirectory.mapRelative_default_64_minus1 = mapRelative_default_64_minus1;
    function mapRelative_default_minus64_minus1() {
        var dd = new pe.io.AddressRange(0, 0);
        var r = dd.mapRelative(-64);
        if(r !== -1) {
            throw r;
        }
    }
    test_DataDirectory.mapRelative_default_minus64_minus1 = mapRelative_default_minus64_minus1;
    function mapRelative_lowerEnd_below_minus1() {
        var dd = new pe.io.AddressRange(10, 20);
        var r = dd.mapRelative(9);
        if(r !== -1) {
            throw r;
        }
    }
    test_DataDirectory.mapRelative_lowerEnd_below_minus1 = mapRelative_lowerEnd_below_minus1;
    function mapRelative_lowerEnd_equal_0() {
        var dd = new pe.io.AddressRange(10, 20);
        var r = dd.mapRelative(10);
        if(r !== 0) {
            throw r;
        }
    }
    test_DataDirectory.mapRelative_lowerEnd_equal_0 = mapRelative_lowerEnd_equal_0;
    function mapRelative_lowerEnd_above_1() {
        var dd = new pe.io.AddressRange(10, 20);
        var r = dd.mapRelative(11);
        if(r !== 1) {
            throw r;
        }
    }
    test_DataDirectory.mapRelative_lowerEnd_above_1 = mapRelative_lowerEnd_above_1;
    function mapRelative_lowerEndPlusSize_above_minus1() {
        var dd = new pe.io.AddressRange(10, 20);
        var r = dd.mapRelative(31);
        if(r !== -1) {
            throw r;
        }
    }
    test_DataDirectory.mapRelative_lowerEndPlusSize_above_minus1 = mapRelative_lowerEndPlusSize_above_minus1;
    function mapRelative_lowerEndPlusSize_equal_minus1() {
        var dd = new pe.io.AddressRange(10, 20);
        var r = dd.mapRelative(30);
        if(r !== -1) {
            throw r;
        }
    }
    test_DataDirectory.mapRelative_lowerEndPlusSize_equal_minus1 = mapRelative_lowerEndPlusSize_equal_minus1;
    function mapRelative_lowerEndPlusSize_below_sizeMinus1() {
        var dd = new pe.io.AddressRange(10, 20);
        var r = dd.mapRelative(29);
        if(r !== 19) {
            throw r;
        }
    }
    test_DataDirectory.mapRelative_lowerEndPlusSize_below_sizeMinus1 = mapRelative_lowerEndPlusSize_below_sizeMinus1;
})(test_DataDirectory || (test_DataDirectory = {}));
var test_Long;
(function (test_Long) {
    function constructor_succeeds() {
        var lg = new pe.io.Long(0, 0);
    }
    test_Long.constructor_succeeds = constructor_succeeds;
    function constructor_assigns_lo_602048() {
        var lg = new pe.io.Long(602048, 0);
        if(lg.lo !== 602048) {
            throw lg.lo;
        }
    }
    test_Long.constructor_assigns_lo_602048 = constructor_assigns_lo_602048;
    function constructor_assigns_hi_2130006() {
        var lg = new pe.io.Long(0, 2130006);
        if(lg.hi !== 2130006) {
            throw lg.hi;
        }
    }
    test_Long.constructor_assigns_hi_2130006 = constructor_assigns_hi_2130006;
    function toString_zeros() {
        var lg = new pe.io.Long(0, 0);
        if(lg.toString() !== "0h") {
            throw lg.toString();
        }
    }
    test_Long.toString_zeros = toString_zeros;
    function toString_1() {
        var lg = new pe.io.Long(1, 0);
        if(lg.toString() !== "1h") {
            throw lg.toString();
        }
    }
    test_Long.toString_1 = toString_1;
    function toString_0xB() {
        var lg = new pe.io.Long(11, 0);
        if(lg.toString() !== "Bh") {
            throw lg.toString();
        }
    }
    test_Long.toString_0xB = toString_0xB;
    function toString_0xFFFF() {
        var lg = new pe.io.Long(65535, 0);
        if(lg.toString() !== "FFFFh") {
            throw lg.toString();
        }
    }
    test_Long.toString_0xFFFF = toString_0xFFFF;
    function toString_0xFFFF0() {
        var lg = new pe.io.Long(65520, 15);
        if(lg.toString() !== "FFFF0h") {
            throw lg.toString();
        }
    }
    test_Long.toString_0xFFFF0 = toString_0xFFFF0;
    function toString_0xFFFFFFFF() {
        var lg = new pe.io.Long(65535, 65535);
        if(lg.toString() !== "FFFFFFFFh") {
            throw lg.toString();
        }
    }
    test_Long.toString_0xFFFFFFFF = toString_0xFFFFFFFF;
})(test_Long || (test_Long = {}));
var test_DosHeader;
(function (test_DosHeader) {
    function constructor_succeeds() {
        var doh = new pe.headers.DosHeader();
    }
    test_DosHeader.constructor_succeeds = constructor_succeeds;
    function mz_defaultMZ() {
        var doh = new pe.headers.DosHeader();
        if(doh.mz !== pe.headers.MZSignature.MZ) {
            throw doh.mz;
        }
    }
    test_DosHeader.mz_defaultMZ = mz_defaultMZ;
    function cblp_default144() {
        var doh = new pe.headers.DosHeader();
        if(doh.cblp !== 144) {
            throw doh.cblp;
        }
    }
    test_DosHeader.cblp_default144 = cblp_default144;
    function cp_default3() {
        var doh = new pe.headers.DosHeader();
        if(doh.cp !== 3) {
            throw doh.cp;
        }
    }
    test_DosHeader.cp_default3 = cp_default3;
    function crlc_default0() {
        var doh = new pe.headers.DosHeader();
        if(doh.crlc !== 0) {
            throw doh.crlc;
        }
    }
    test_DosHeader.crlc_default0 = crlc_default0;
    function cparhdr_default4() {
        var doh = new pe.headers.DosHeader();
        if(doh.cparhdr !== 4) {
            throw doh.cparhdr;
        }
    }
    test_DosHeader.cparhdr_default4 = cparhdr_default4;
    function minalloc_default0() {
        var doh = new pe.headers.DosHeader();
        if(doh.minalloc !== 0) {
            throw doh.minalloc;
        }
    }
    test_DosHeader.minalloc_default0 = minalloc_default0;
    function maxalloc_default65535() {
        var doh = new pe.headers.DosHeader();
        if(doh.maxalloc !== 65535) {
            throw doh.maxalloc;
        }
    }
    test_DosHeader.maxalloc_default65535 = maxalloc_default65535;
    function ss_default0() {
        var doh = new pe.headers.DosHeader();
        if(doh.ss !== 0) {
            throw doh.ss;
        }
    }
    test_DosHeader.ss_default0 = ss_default0;
    function sp_default184() {
        var doh = new pe.headers.DosHeader();
        if(doh.sp !== 184) {
            throw doh.sp;
        }
    }
    test_DosHeader.sp_default184 = sp_default184;
    function csum_default0() {
        var doh = new pe.headers.DosHeader();
        if(doh.csum !== 0) {
            throw doh.csum;
        }
    }
    test_DosHeader.csum_default0 = csum_default0;
    function cs_default0() {
        var doh = new pe.headers.DosHeader();
        if(doh.cs !== 0) {
            throw doh.cs;
        }
    }
    test_DosHeader.cs_default0 = cs_default0;
    function lfarlc_default64() {
        var doh = new pe.headers.DosHeader();
        if(doh.lfarlc !== 64) {
            throw doh.lfarlc;
        }
    }
    test_DosHeader.lfarlc_default64 = lfarlc_default64;
    function ovno_default0() {
        var doh = new pe.headers.DosHeader();
        if(doh.ovno !== 0) {
            throw doh.ovno;
        }
    }
    test_DosHeader.ovno_default0 = ovno_default0;
    function res1_default0() {
        var doh = new pe.headers.DosHeader();
        if(doh.res1.hi !== 0 || doh.res1.lo !== 0) {
            throw doh.res1;
        }
    }
    test_DosHeader.res1_default0 = res1_default0;
    function oemid_default0() {
        var doh = new pe.headers.DosHeader();
        if(doh.oemid !== 0) {
            throw doh.oemid;
        }
    }
    test_DosHeader.oemid_default0 = oemid_default0;
    function oeminfo_default0() {
        var doh = new pe.headers.DosHeader();
        if(doh.oeminfo !== 0) {
            throw doh.oeminfo;
        }
    }
    test_DosHeader.oeminfo_default0 = oeminfo_default0;
    function reserved_defaultArray5() {
        var doh = new pe.headers.DosHeader();
        if(doh.reserved.length !== 5 || doh.reserved[0] !== 0 || doh.reserved[1] !== 0 || doh.reserved[2] !== 0 || doh.reserved[3] !== 0 || doh.reserved[4] !== 0) {
            throw doh.reserved;
        }
    }
    test_DosHeader.reserved_defaultArray5 = reserved_defaultArray5;
    function lfanew_default0() {
        var doh = new pe.headers.DosHeader();
        if(doh.lfanew !== 0) {
            throw doh.lfanew;
        }
    }
    test_DosHeader.lfanew_default0 = lfanew_default0;
    function toString_default() {
        var doh = new pe.headers.DosHeader();
        if(doh.toString() !== "[MZ].lfanew=0h") {
            throw doh.toString();
        }
    }
    test_DosHeader.toString_default = toString_default;
    function toString_mz_oxEA() {
        var doh = new pe.headers.DosHeader();
        doh.mz = 234;
        if(doh.toString() !== "[EAh].lfanew=0h") {
            throw doh.toString();
        }
    }
    test_DosHeader.toString_mz_oxEA = toString_mz_oxEA;
    function toString_lfanew_oxFF803() {
        var doh = new pe.headers.DosHeader();
        doh.lfanew = 1046531;
        if(doh.toString() !== "[MZ].lfanew=FF803h") {
            throw doh.toString();
        }
    }
    test_DosHeader.toString_lfanew_oxFF803 = toString_lfanew_oxFF803;
})(test_DosHeader || (test_DosHeader = {}));
var test_OptionalHeader;
(function (test_OptionalHeader) {
    function constructor_succeeds() {
        var oph = new pe.headers.OptionalHeader();
    }
    test_OptionalHeader.constructor_succeeds = constructor_succeeds;
    function peMagic_defaultNT32() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.peMagic !== pe.headers.PEMagic.NT32) {
            throw oph.peMagic;
        }
    }
    test_OptionalHeader.peMagic_defaultNT32 = peMagic_defaultNT32;
    function linkerVersion_defaultEmptyString() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.linkerVersion !== "") {
            throw oph.linkerVersion;
        }
    }
    test_OptionalHeader.linkerVersion_defaultEmptyString = linkerVersion_defaultEmptyString;
    function sizeOfCode_default0() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.sizeOfCode !== 0) {
            throw oph.sizeOfCode;
        }
    }
    test_OptionalHeader.sizeOfCode_default0 = sizeOfCode_default0;
    function sizeOfInitializedData_default0() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.sizeOfInitializedData !== 0) {
            throw oph.sizeOfInitializedData;
        }
    }
    test_OptionalHeader.sizeOfInitializedData_default0 = sizeOfInitializedData_default0;
    function sizeOfUninitializedData_default0() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.sizeOfUninitializedData !== 0) {
            throw oph.sizeOfUninitializedData;
        }
    }
    test_OptionalHeader.sizeOfUninitializedData_default0 = sizeOfUninitializedData_default0;
    function addressOfEntryPoint_default0() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.addressOfEntryPoint !== 0) {
            throw oph.addressOfEntryPoint;
        }
    }
    test_OptionalHeader.addressOfEntryPoint_default0 = addressOfEntryPoint_default0;
    function baseOfCode_default0x2000() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.baseOfCode !== 8192) {
            throw oph.baseOfCode;
        }
    }
    test_OptionalHeader.baseOfCode_default0x2000 = baseOfCode_default0x2000;
    function baseOfData_default0x4000() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.baseOfData !== 16384) {
            throw oph.baseOfData;
        }
    }
    test_OptionalHeader.baseOfData_default0x4000 = baseOfData_default0x4000;
    function imageBase_default0x4000() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.imageBase !== 16384) {
            throw oph.imageBase;
        }
    }
    test_OptionalHeader.imageBase_default0x4000 = imageBase_default0x4000;
    function sectionAlignment_default0x2000() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.sectionAlignment !== 8192) {
            throw oph.sectionAlignment;
        }
    }
    test_OptionalHeader.sectionAlignment_default0x2000 = sectionAlignment_default0x2000;
    function fileAlignment_default0x200() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.fileAlignment !== 512) {
            throw oph.fileAlignment;
        }
    }
    test_OptionalHeader.fileAlignment_default0x200 = fileAlignment_default0x200;
    function operatingSystemVersion_defaultEmptyString() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.operatingSystemVersion !== "") {
            throw oph.operatingSystemVersion;
        }
    }
    test_OptionalHeader.operatingSystemVersion_defaultEmptyString = operatingSystemVersion_defaultEmptyString;
    function imageVersion_defaultEmptyString() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.imageVersion !== "") {
            throw oph.imageVersion;
        }
    }
    test_OptionalHeader.imageVersion_defaultEmptyString = imageVersion_defaultEmptyString;
    function subsystemVersion_defaultEmptyString() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.subsystemVersion !== "") {
            throw oph.subsystemVersion;
        }
    }
    test_OptionalHeader.subsystemVersion_defaultEmptyString = subsystemVersion_defaultEmptyString;
    function win32VersionValue_default0() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.win32VersionValue !== 0) {
            throw oph.win32VersionValue;
        }
    }
    test_OptionalHeader.win32VersionValue_default0 = win32VersionValue_default0;
    function sizeOfImage_default0() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.sizeOfImage !== 0) {
            throw oph.sizeOfImage;
        }
    }
    test_OptionalHeader.sizeOfImage_default0 = sizeOfImage_default0;
    function sizeOfHeaders_default0() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.sizeOfHeaders !== 0) {
            throw oph.sizeOfHeaders;
        }
    }
    test_OptionalHeader.sizeOfHeaders_default0 = sizeOfHeaders_default0;
    function checkSum_default0() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.checkSum !== 0) {
            throw oph.checkSum;
        }
    }
    test_OptionalHeader.checkSum_default0 = checkSum_default0;
    function subsystem_defaultWindowsCUI() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.subsystem !== pe.headers.Subsystem.WindowsCUI) {
            throw oph.subsystem;
        }
    }
    test_OptionalHeader.subsystem_defaultWindowsCUI = subsystem_defaultWindowsCUI;
    function dllCharacteristics_defaultNxCompatible() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.dllCharacteristics !== pe.headers.DllCharacteristics.NxCompatible) {
            throw oph.dllCharacteristics;
        }
    }
    test_OptionalHeader.dllCharacteristics_defaultNxCompatible = dllCharacteristics_defaultNxCompatible;
    function sizeOfStackReserve_default0x100000() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.sizeOfStackReserve !== 1048576) {
            throw oph.sizeOfStackReserve;
        }
    }
    test_OptionalHeader.sizeOfStackReserve_default0x100000 = sizeOfStackReserve_default0x100000;
    function sizeOfStackCommit_default0x1000() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.sizeOfStackCommit !== 4096) {
            throw oph.sizeOfStackCommit;
        }
    }
    test_OptionalHeader.sizeOfStackCommit_default0x1000 = sizeOfStackCommit_default0x1000;
    function sizeOfHeapReserve_default0x100000() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.sizeOfHeapReserve !== 1048576) {
            throw oph.sizeOfHeapReserve;
        }
    }
    test_OptionalHeader.sizeOfHeapReserve_default0x100000 = sizeOfHeapReserve_default0x100000;
    function sizeOfHeapCommit_default0x1000() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.sizeOfHeapCommit !== 4096) {
            throw oph.sizeOfHeapCommit;
        }
    }
    test_OptionalHeader.sizeOfHeapCommit_default0x1000 = sizeOfHeapCommit_default0x1000;
    function loaderFlags_default0() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.loaderFlags !== 0) {
            throw oph.loaderFlags;
        }
    }
    test_OptionalHeader.loaderFlags_default0 = loaderFlags_default0;
    function numberOfRvaAndSizes_default16() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.numberOfRvaAndSizes !== 16) {
            throw oph.numberOfRvaAndSizes;
        }
    }
    test_OptionalHeader.numberOfRvaAndSizes_default16 = numberOfRvaAndSizes_default16;
    function dataDirectories_defaultZeroLength() {
        var oph = new pe.headers.OptionalHeader();
        if(oph.dataDirectories.length !== 0) {
            throw oph.dataDirectories.length;
        }
    }
    test_OptionalHeader.dataDirectories_defaultZeroLength = dataDirectories_defaultZeroLength;
    function toString_default() {
        var oph = new pe.headers.OptionalHeader();
        var expectedString = "NT32 WindowsCUI NxCompatible dataDirectories[]";
        if(oph.toString() !== expectedString) {
            throw oph.toString() + " expected " + expectedString;
        }
    }
    test_OptionalHeader.toString_default = toString_default;
    function toString_dataDirectories_1and7() {
        var oph = new pe.headers.OptionalHeader();
        oph.dataDirectories[1] = new pe.io.AddressRange(1, 1);
        oph.dataDirectories[7] = new pe.io.AddressRange(2, 2);
        var expectedString = "NT32 WindowsCUI NxCompatible dataDirectories[ImportSymbols,CopyrightString]";
        if(oph.toString() !== expectedString) {
            throw oph.toString() + " expected " + expectedString;
        }
    }
    test_OptionalHeader.toString_dataDirectories_1and7 = toString_dataDirectories_1and7;
})(test_OptionalHeader || (test_OptionalHeader = {}));
var test_PEFileHeaders;
(function (test_PEFileHeaders) {
    function constructor_succeeds() {
        var pefi = new pe.headers.PEFileHeaders();
    }
    test_PEFileHeaders.constructor_succeeds = constructor_succeeds;
    function dosHeader_defaultNotNull() {
        var pefi = new pe.headers.PEFileHeaders();
        if(!pefi.dosHeader) {
            throw pefi.dosHeader;
        }
    }
    test_PEFileHeaders.dosHeader_defaultNotNull = dosHeader_defaultNotNull;
    function peHeader_defaultNotNull() {
        var pefi = new pe.headers.PEFileHeaders();
        if(!pefi.peHeader) {
            throw pefi.peHeader;
        }
    }
    test_PEFileHeaders.peHeader_defaultNotNull = peHeader_defaultNotNull;
    function optionalHeader_defaultNotNull() {
        var pefi = new pe.headers.PEFileHeaders();
        if(!pefi.optionalHeader) {
            throw pefi.optionalHeader;
        }
    }
    test_PEFileHeaders.optionalHeader_defaultNotNull = optionalHeader_defaultNotNull;
    function sectionHeaders_defaultZeroLength() {
        var pefi = new pe.headers.PEFileHeaders();
        if(pefi.sectionHeaders.length !== 0) {
            throw pefi.sectionHeaders.length;
        }
    }
    test_PEFileHeaders.sectionHeaders_defaultZeroLength = sectionHeaders_defaultZeroLength;
    function toString_default() {
        var pefi = new pe.headers.PEFileHeaders();
        var expectedToString = "dosHeader: [MZ].lfanew=0h dosStub: null peHeader: [332] optionalHeader: [WindowsCUI,] sectionHeaders: [0]";
        if(pefi.toString() !== expectedToString) {
            throw pefi.toString() + " instead of expected " + expectedToString;
        }
    }
    test_PEFileHeaders.toString_default = toString_default;
})(test_PEFileHeaders || (test_PEFileHeaders = {}));
var test_PEHeader;
(function (test_PEHeader) {
    function constructor_succeeds() {
        var peh = new pe.headers.PEHeader();
    }
    test_PEHeader.constructor_succeeds = constructor_succeeds;
    function pe_defaultPE() {
        var peh = new pe.headers.PEHeader();
        if(peh.pe !== pe.headers.PESignature.PE) {
            throw peh.pe;
        }
    }
    test_PEHeader.pe_defaultPE = pe_defaultPE;
    function machine_defaultI386() {
        var peh = new pe.headers.PEHeader();
        if(peh.machine !== pe.headers.Machine.I386) {
            throw peh.machine;
        }
    }
    test_PEHeader.machine_defaultI386 = machine_defaultI386;
    function numberOfSections_default0() {
        var peh = new pe.headers.PEHeader();
        if(peh.numberOfSections !== 0) {
            throw peh.numberOfSections;
        }
    }
    test_PEHeader.numberOfSections_default0 = numberOfSections_default0;
    function timestamp_defaultZeroDate() {
        var peh = new pe.headers.PEHeader();
        if(peh.timestamp.getTime() !== new Date(0).getTime()) {
            throw peh.timestamp;
        }
    }
    test_PEHeader.timestamp_defaultZeroDate = timestamp_defaultZeroDate;
    function pointerToSymbolTable_default0() {
        var peh = new pe.headers.PEHeader();
        if(peh.pointerToSymbolTable !== 0) {
            throw peh.pointerToSymbolTable;
        }
    }
    test_PEHeader.pointerToSymbolTable_default0 = pointerToSymbolTable_default0;
    function numberOfSymbols_default0() {
        var peh = new pe.headers.PEHeader();
        if(peh.numberOfSymbols !== 0) {
            throw peh.numberOfSymbols;
        }
    }
    test_PEHeader.numberOfSymbols_default0 = numberOfSymbols_default0;
    function sizeOfOptionalHeader_default0() {
        var peh = new pe.headers.PEHeader();
        if(peh.sizeOfOptionalHeader !== 0) {
            throw peh.sizeOfOptionalHeader;
        }
    }
    test_PEHeader.sizeOfOptionalHeader_default0 = sizeOfOptionalHeader_default0;
    function characteristics_defaultDll() {
        var peh = new pe.headers.PEHeader();
        var expected = pe.headers.ImageCharacteristics.Dll | pe.headers.ImageCharacteristics.Bit32Machine;
        if(peh.characteristics !== expected) {
            throw peh.characteristics + " expected " + expected;
        }
    }
    test_PEHeader.characteristics_defaultDll = characteristics_defaultDll;
    function toString_default() {
        var peh = new pe.headers.PEHeader();
        if(peh.toString() !== "I386 Bit32Machine|Dll Sections[0]") {
            throw peh.toString();
        }
    }
    test_PEHeader.toString_default = toString_default;
})(test_PEHeader || (test_PEHeader = {}));
var test_SectionHeader;
(function (test_SectionHeader) {
    function constructor_succeeds() {
        var seh = new pe.headers.SectionHeader();
    }
    test_SectionHeader.constructor_succeeds = constructor_succeeds;
    function name_defaultEmptyString() {
        var seh = new pe.headers.SectionHeader();
        if(seh.name !== "") {
            throw seh.name;
        }
    }
    test_SectionHeader.name_defaultEmptyString = name_defaultEmptyString;
    function toString_default() {
        var seh = new pe.headers.SectionHeader();
        var expectedString = " 0:0@0h";
        if(seh.toString() != expectedString) {
            throw seh + " expected " + expectedString;
        }
    }
    test_SectionHeader.toString_default = toString_default;
    function pointerToRelocations_default0() {
        var seh = new pe.headers.SectionHeader();
        if(seh.pointerToRelocations !== 0) {
            throw seh.pointerToRelocations;
        }
    }
    test_SectionHeader.pointerToRelocations_default0 = pointerToRelocations_default0;
})(test_SectionHeader || (test_SectionHeader = {}));
var test_PEFileHeaders_read_sampleExe;
(function (test_PEFileHeaders_read_sampleExe) {
    function read_succeeds() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
    }
    test_PEFileHeaders_read_sampleExe.read_succeeds = read_succeeds;
    function read_dosHeader_mz_MZ() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        if(pef.dosHeader.mz !== pe.headers.MZSignature.MZ) {
            throw pef.dosHeader.mz;
        }
    }
    test_PEFileHeaders_read_sampleExe.read_dosHeader_mz_MZ = read_dosHeader_mz_MZ;
    function read_dosHeader_lfanew_128() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        if(pef.dosHeader.lfanew !== 128) {
            throw pef.dosHeader.lfanew;
        }
    }
    test_PEFileHeaders_read_sampleExe.read_dosHeader_lfanew_128 = read_dosHeader_lfanew_128;
    function read_dosStub_length_64() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        if(pef.dosStub.length !== 64) {
            throw pef.dosStub.length;
        }
    }
    test_PEFileHeaders_read_sampleExe.read_dosStub_length_64 = read_dosStub_length_64;
    function read_dosStub_matchesInputAt64() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        var dosStub = [];
        for(var i = 0; i < pef.dosStub.length; i++) {
            dosStub[i] = pef.dosStub[i];
        }
        var dosStubStr = dosStub.join(",");
        var arr = new Uint8Array(sampleExe.bytes, 64, dosStub.length);
        var inputAt64 = Array(arr.length);
        for(var i = 0; i < arr.length; i++) {
            inputAt64[i] = arr[i];
        }
        var inputAt64Str = inputAt64.join(",");
        if(dosStubStr !== inputAt64Str) {
            throw dosStubStr + " expected " + inputAt64Str;
        }
    }
    test_PEFileHeaders_read_sampleExe.read_dosStub_matchesInputAt64 = read_dosStub_matchesInputAt64;
    function read_peHeader_pe_PE() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        if(pef.peHeader.pe !== pe.headers.PESignature.PE) {
            throw pef.peHeader.pe;
        }
    }
    test_PEFileHeaders_read_sampleExe.read_peHeader_pe_PE = read_peHeader_pe_PE;
    function read_peHeader_machine_I386() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        if(pef.peHeader.machine !== pe.headers.Machine.I386) {
            throw pef.peHeader.machine;
        }
    }
    test_PEFileHeaders_read_sampleExe.read_peHeader_machine_I386 = read_peHeader_machine_I386;
    function read_optionalHeader_peMagic_NT32() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        if(pef.optionalHeader.peMagic !== pe.headers.PEMagic.NT32) {
            throw pef.optionalHeader.peMagic;
        }
    }
    test_PEFileHeaders_read_sampleExe.read_optionalHeader_peMagic_NT32 = read_optionalHeader_peMagic_NT32;
    function read_optionalHeader_numberOfRvaAndSizes_16() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        if(pef.optionalHeader.numberOfRvaAndSizes !== 16) {
            throw pef.optionalHeader.numberOfRvaAndSizes;
        }
    }
    test_PEFileHeaders_read_sampleExe.read_optionalHeader_numberOfRvaAndSizes_16 = read_optionalHeader_numberOfRvaAndSizes_16;
    function read_optionalHeader_dataDirectories_length_16() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        if(pef.optionalHeader.dataDirectories.length !== 16) {
            throw pef.optionalHeader.dataDirectories.length;
        }
    }
    test_PEFileHeaders_read_sampleExe.read_optionalHeader_dataDirectories_length_16 = read_optionalHeader_dataDirectories_length_16;
    function read_optionalHeader_dataDirectories_14_address_8200() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        if(pef.optionalHeader.dataDirectories[14].address !== 8200) {
            throw pef.optionalHeader.dataDirectories[14].address;
        }
    }
    test_PEFileHeaders_read_sampleExe.read_optionalHeader_dataDirectories_14_address_8200 = read_optionalHeader_dataDirectories_14_address_8200;
    function read_optionalHeader_dataDirectories_14_size_72() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        if(pef.optionalHeader.dataDirectories[14].size !== 72) {
            throw pef.optionalHeader.dataDirectories[14].size;
        }
    }
    test_PEFileHeaders_read_sampleExe.read_optionalHeader_dataDirectories_14_size_72 = read_optionalHeader_dataDirectories_14_size_72;
    function read_sectionHeaders_length_3() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        if(pef.sectionHeaders.length !== 3) {
            throw pef.sectionHeaders.length;
        }
    }
    test_PEFileHeaders_read_sampleExe.read_sectionHeaders_length_3 = read_sectionHeaders_length_3;
    function read_sectionHeaders_names_DOTtext_DOTrsrc_DOTreloc() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        var namesArray = [];
        for(var i = 0; i < pef.sectionHeaders.length; i++) {
            namesArray.push(pef.sectionHeaders[i].name);
        }
        var namesStr = namesArray.join(" ");
        if(namesStr !== ".text .rsrc .reloc") {
            throw namesStr;
        }
    }
    test_PEFileHeaders_read_sampleExe.read_sectionHeaders_names_DOTtext_DOTrsrc_DOTreloc = read_sectionHeaders_names_DOTtext_DOTrsrc_DOTreloc;
})(test_PEFileHeaders_read_sampleExe || (test_PEFileHeaders_read_sampleExe = {}));
var test_PEFileHeaders_read_sample64Exe;
(function (test_PEFileHeaders_read_sample64Exe) {
    function read_succeeds() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
    }
    test_PEFileHeaders_read_sample64Exe.read_succeeds = read_succeeds;
    function read_dosHeader_mz_MZ() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        if(pef.dosHeader.mz !== pe.headers.MZSignature.MZ) {
            throw pef.dosHeader.mz;
        }
    }
    test_PEFileHeaders_read_sample64Exe.read_dosHeader_mz_MZ = read_dosHeader_mz_MZ;
    function read_dosHeader_lfanew_128() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        if(pef.dosHeader.lfanew !== 128) {
            throw pef.dosHeader.lfanew;
        }
    }
    test_PEFileHeaders_read_sample64Exe.read_dosHeader_lfanew_128 = read_dosHeader_lfanew_128;
    function read_dosStub_length_64() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        if(pef.dosStub.length !== 64) {
            throw pef.dosStub.length;
        }
    }
    test_PEFileHeaders_read_sample64Exe.read_dosStub_length_64 = read_dosStub_length_64;
    function read_dosStub_matchesInputAt64() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        var dosStub = [];
        for(var i = 0; i < pef.dosStub.length; i++) {
            dosStub[i] = pef.dosStub[i];
        }
        var dosStubStr = dosStub.join(",");
        var arr = new Uint8Array(sample64Exe.bytes, 64, dosStub.length);
        var inputAt64 = Array(arr.length);
        for(var i = 0; i < arr.length; i++) {
            inputAt64[i] = arr[i];
        }
        var inputAt64Str = inputAt64.join(",");
        if(dosStubStr !== inputAt64Str) {
            throw dosStubStr + " expected " + inputAt64Str;
        }
    }
    test_PEFileHeaders_read_sample64Exe.read_dosStub_matchesInputAt64 = read_dosStub_matchesInputAt64;
    function read_peHeader_pe_PE() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        if(pef.peHeader.pe !== pe.headers.PESignature.PE) {
            throw pef.peHeader.pe;
        }
    }
    test_PEFileHeaders_read_sample64Exe.read_peHeader_pe_PE = read_peHeader_pe_PE;
    function read_peHeader_machine_AMD64() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        if(pef.peHeader.machine !== pe.headers.Machine.AMD64) {
            throw pef.peHeader.machine;
        }
    }
    test_PEFileHeaders_read_sample64Exe.read_peHeader_machine_AMD64 = read_peHeader_machine_AMD64;
    function read_optionalHeader_peMagic_NT64() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        if(pef.optionalHeader.peMagic !== pe.headers.PEMagic.NT64) {
            throw pef.optionalHeader.peMagic;
        }
    }
    test_PEFileHeaders_read_sample64Exe.read_optionalHeader_peMagic_NT64 = read_optionalHeader_peMagic_NT64;
    function read_optionalHeader_numberOfRvaAndSizes_16() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        if(pef.optionalHeader.numberOfRvaAndSizes !== 16) {
            throw pef.optionalHeader.numberOfRvaAndSizes;
        }
    }
    test_PEFileHeaders_read_sample64Exe.read_optionalHeader_numberOfRvaAndSizes_16 = read_optionalHeader_numberOfRvaAndSizes_16;
    function read_optionalHeader_dataDirectories_length_16() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        if(pef.optionalHeader.dataDirectories.length !== 16) {
            throw pef.optionalHeader.dataDirectories.length;
        }
    }
    test_PEFileHeaders_read_sample64Exe.read_optionalHeader_dataDirectories_length_16 = read_optionalHeader_dataDirectories_length_16;
    function read_optionalHeader_dataDirectories_14_address_8192() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        if(pef.optionalHeader.dataDirectories[14].address !== 8192) {
            throw pef.optionalHeader.dataDirectories[14].address;
        }
    }
    test_PEFileHeaders_read_sample64Exe.read_optionalHeader_dataDirectories_14_address_8192 = read_optionalHeader_dataDirectories_14_address_8192;
    function read_optionalHeader_dataDirectories_14_size_72() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        if(pef.optionalHeader.dataDirectories[14].size !== 72) {
            throw pef.optionalHeader.dataDirectories[14].size;
        }
    }
    test_PEFileHeaders_read_sample64Exe.read_optionalHeader_dataDirectories_14_size_72 = read_optionalHeader_dataDirectories_14_size_72;
    function read_sectionHeaders_length_2() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        if(pef.sectionHeaders.length !== 2) {
            throw pef.sectionHeaders.length;
        }
    }
    test_PEFileHeaders_read_sample64Exe.read_sectionHeaders_length_2 = read_sectionHeaders_length_2;
    function read_sectionHeaders_names_DOTtext_DOTrsrc() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        var namesArray = [];
        for(var i = 0; i < pef.sectionHeaders.length; i++) {
            namesArray.push(pef.sectionHeaders[i].name);
        }
        var namesStr = namesArray.join(" ");
        if(namesStr !== ".text .rsrc") {
            throw namesStr;
        }
    }
    test_PEFileHeaders_read_sample64Exe.read_sectionHeaders_names_DOTtext_DOTrsrc = read_sectionHeaders_names_DOTtext_DOTrsrc;
})(test_PEFileHeaders_read_sample64Exe || (test_PEFileHeaders_read_sample64Exe = {}));
var test_DosHeader_read_sampleExe;
(function (test_DosHeader_read_sampleExe) {
    function read_succeeds() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
    }
    test_DosHeader_read_sampleExe.read_succeeds = read_succeeds;
    function read_mz_MZ() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.mz !== pe.headers.MZSignature.MZ) {
            throw doh.mz;
        }
    }
    test_DosHeader_read_sampleExe.read_mz_MZ = read_mz_MZ;
    function read_cblp_144() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.cblp !== 144) {
            throw doh.cblp;
        }
    }
    test_DosHeader_read_sampleExe.read_cblp_144 = read_cblp_144;
    function read_cp_3() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.cp !== 3) {
            throw doh.cp;
        }
    }
    test_DosHeader_read_sampleExe.read_cp_3 = read_cp_3;
    function read_crlc_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.crlc !== 0) {
            throw doh.crlc;
        }
    }
    test_DosHeader_read_sampleExe.read_crlc_0 = read_crlc_0;
    function read_cparhdr_4() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.cparhdr !== 4) {
            throw doh.cparhdr;
        }
    }
    test_DosHeader_read_sampleExe.read_cparhdr_4 = read_cparhdr_4;
    function read_minalloc_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.minalloc !== 0) {
            throw doh.minalloc;
        }
    }
    test_DosHeader_read_sampleExe.read_minalloc_0 = read_minalloc_0;
    function read_maxalloc_65535() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.maxalloc !== 65535) {
            throw doh.maxalloc;
        }
    }
    test_DosHeader_read_sampleExe.read_maxalloc_65535 = read_maxalloc_65535;
    function read_ss_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.ss !== 0) {
            throw doh.ss;
        }
    }
    test_DosHeader_read_sampleExe.read_ss_0 = read_ss_0;
    function read_sp_184() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.sp !== 184) {
            throw doh.sp;
        }
    }
    test_DosHeader_read_sampleExe.read_sp_184 = read_sp_184;
    function read_csum_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.csum !== 0) {
            throw doh.csum;
        }
    }
    test_DosHeader_read_sampleExe.read_csum_0 = read_csum_0;
    function read_ip_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.ip !== 0) {
            throw doh.ip;
        }
    }
    test_DosHeader_read_sampleExe.read_ip_0 = read_ip_0;
    function read_cs_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.cs !== 0) {
            throw doh.cs;
        }
    }
    test_DosHeader_read_sampleExe.read_cs_0 = read_cs_0;
    function read_lfarc_64() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.lfarlc !== 64) {
            throw doh.lfarlc;
        }
    }
    test_DosHeader_read_sampleExe.read_lfarc_64 = read_lfarc_64;
    function read_ovno_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.ovno !== 0) {
            throw doh.ovno;
        }
    }
    test_DosHeader_read_sampleExe.read_ovno_0 = read_ovno_0;
    function read_res1_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.res1.toString() !== "0h") {
            throw doh.res1;
        }
    }
    test_DosHeader_read_sampleExe.read_res1_0 = read_res1_0;
    function read_oemid_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.oemid !== 0) {
            throw doh.oemid;
        }
    }
    test_DosHeader_read_sampleExe.read_oemid_0 = read_oemid_0;
    function read_oeminfo_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.oeminfo !== 0) {
            throw doh.oeminfo;
        }
    }
    test_DosHeader_read_sampleExe.read_oeminfo_0 = read_oeminfo_0;
    function read_reserved_00000() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        var reservedStr = doh.reserved.join(",");
        if(reservedStr !== "0,0,0,0,0") {
            throw reservedStr;
        }
    }
    test_DosHeader_read_sampleExe.read_reserved_00000 = read_reserved_00000;
    function read_dosHeader_lfanew_128() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.lfanew !== 128) {
            throw doh.lfanew;
        }
    }
    test_DosHeader_read_sampleExe.read_dosHeader_lfanew_128 = read_dosHeader_lfanew_128;
})(test_DosHeader_read_sampleExe || (test_DosHeader_read_sampleExe = {}));
var test_DosHeader_read_sample64Exe;
(function (test_DosHeader_read_sample64Exe) {
    function read_succeeds() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
    }
    test_DosHeader_read_sample64Exe.read_succeeds = read_succeeds;
    function read_mz_MZ() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.mz !== pe.headers.MZSignature.MZ) {
            throw doh.mz;
        }
    }
    test_DosHeader_read_sample64Exe.read_mz_MZ = read_mz_MZ;
    function read_cblp_144() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.cblp !== 144) {
            throw doh.cblp;
        }
    }
    test_DosHeader_read_sample64Exe.read_cblp_144 = read_cblp_144;
    function read_cp_3() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.cp !== 3) {
            throw doh.cp;
        }
    }
    test_DosHeader_read_sample64Exe.read_cp_3 = read_cp_3;
    function read_crlc_0() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.crlc !== 0) {
            throw doh.crlc;
        }
    }
    test_DosHeader_read_sample64Exe.read_crlc_0 = read_crlc_0;
    function read_cparhdr_4() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.cparhdr !== 4) {
            throw doh.cparhdr;
        }
    }
    test_DosHeader_read_sample64Exe.read_cparhdr_4 = read_cparhdr_4;
    function read_minalloc_0() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.minalloc !== 0) {
            throw doh.minalloc;
        }
    }
    test_DosHeader_read_sample64Exe.read_minalloc_0 = read_minalloc_0;
    function read_maxalloc_65535() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.maxalloc !== 65535) {
            throw doh.maxalloc;
        }
    }
    test_DosHeader_read_sample64Exe.read_maxalloc_65535 = read_maxalloc_65535;
    function read_ss_0() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.ss !== 0) {
            throw doh.ss;
        }
    }
    test_DosHeader_read_sample64Exe.read_ss_0 = read_ss_0;
    function read_sp_184() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.sp !== 184) {
            throw doh.sp;
        }
    }
    test_DosHeader_read_sample64Exe.read_sp_184 = read_sp_184;
    function read_csum_0() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.csum !== 0) {
            throw doh.csum;
        }
    }
    test_DosHeader_read_sample64Exe.read_csum_0 = read_csum_0;
    function read_ip_0() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.ip !== 0) {
            throw doh.ip;
        }
    }
    test_DosHeader_read_sample64Exe.read_ip_0 = read_ip_0;
    function read_cs_0() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.cs !== 0) {
            throw doh.cs;
        }
    }
    test_DosHeader_read_sample64Exe.read_cs_0 = read_cs_0;
    function read_lfarc_64() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.lfarlc !== 64) {
            throw doh.lfarlc;
        }
    }
    test_DosHeader_read_sample64Exe.read_lfarc_64 = read_lfarc_64;
    function read_ovno_0() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.ovno !== 0) {
            throw doh.ovno;
        }
    }
    test_DosHeader_read_sample64Exe.read_ovno_0 = read_ovno_0;
    function read_res1_0() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.res1.toString() !== "0h") {
            throw doh.res1;
        }
    }
    test_DosHeader_read_sample64Exe.read_res1_0 = read_res1_0;
    function read_oemid_0() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.oemid !== 0) {
            throw doh.oemid;
        }
    }
    test_DosHeader_read_sample64Exe.read_oemid_0 = read_oemid_0;
    function read_oeminfo_0() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.oeminfo !== 0) {
            throw doh.oeminfo;
        }
    }
    test_DosHeader_read_sample64Exe.read_oeminfo_0 = read_oeminfo_0;
    function read_reserved_00000() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        var reservedStr = doh.reserved.join(",");
        if(reservedStr !== "0,0,0,0,0") {
            throw reservedStr;
        }
    }
    test_DosHeader_read_sample64Exe.read_reserved_00000 = read_reserved_00000;
    function read_dosHeader_lfanew_128() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.lfanew !== 128) {
            throw doh.lfanew;
        }
    }
    test_DosHeader_read_sample64Exe.read_dosHeader_lfanew_128 = read_dosHeader_lfanew_128;
})(test_DosHeader_read_sample64Exe || (test_DosHeader_read_sample64Exe = {}));
var test_DosHeader_read_MZ2345;
(function (test_DosHeader_read_MZ2345) {
    var sampleBuf = (function () {
        var array = [
            ("M").charCodeAt(0), 
            ("Z").charCodeAt(0)
        ];
        for(var i = 0; i < 64; i++) {
            if(i == 0 || i == 1) {
                continue;
            }
            array[i] = i;
        }
        return array;
    })();
    var global = (function () {
        return this;
    })();
    if("ArrayBuffer" in global) {
        var arrb = new ArrayBuffer(sampleBuf.length);
        var vi = new DataView(arrb);
        for(var i = 0; i < sampleBuf.length; i++) {
            vi.setUint8(i, sampleBuf[i]);
        }
        sampleBuf = arrb;
    }
    test_DosHeader_read_MZ2345.bytes = sampleBuf;
    function read_succeeds() {
        var bi = new pe.io.BufferReader(test_DosHeader_read_MZ2345.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
    }
    test_DosHeader_read_MZ2345.read_succeeds = read_succeeds;
    function read_mz_MZ() {
        var bi = new pe.io.BufferReader(test_DosHeader_read_MZ2345.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.mz !== pe.headers.MZSignature.MZ) {
            throw doh.mz;
        }
    }
    test_DosHeader_read_MZ2345.read_mz_MZ = read_mz_MZ;
    function read_cblp_770() {
        var bi = new pe.io.BufferReader(test_DosHeader_read_MZ2345.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.cblp !== 770) {
            throw doh.cblp;
        }
    }
    test_DosHeader_read_MZ2345.read_cblp_770 = read_cblp_770;
    function read_cp_1284() {
        var bi = new pe.io.BufferReader(test_DosHeader_read_MZ2345.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.cp !== 1284) {
            throw doh.cp;
        }
    }
    test_DosHeader_read_MZ2345.read_cp_1284 = read_cp_1284;
    function read_crlc_1798() {
        var bi = new pe.io.BufferReader(test_DosHeader_read_MZ2345.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.crlc !== 1798) {
            throw doh.crlc;
        }
    }
    test_DosHeader_read_MZ2345.read_crlc_1798 = read_crlc_1798;
    function read_cparhdr_2312() {
        var bi = new pe.io.BufferReader(test_DosHeader_read_MZ2345.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.cparhdr !== 2312) {
            throw doh.cparhdr;
        }
    }
    test_DosHeader_read_MZ2345.read_cparhdr_2312 = read_cparhdr_2312;
    function read_minalloc_2826() {
        var bi = new pe.io.BufferReader(test_DosHeader_read_MZ2345.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.minalloc !== 2826) {
            throw doh.minalloc;
        }
    }
    test_DosHeader_read_MZ2345.read_minalloc_2826 = read_minalloc_2826;
    function read_maxalloc_3340() {
        var bi = new pe.io.BufferReader(test_DosHeader_read_MZ2345.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.maxalloc !== 3340) {
            throw doh.maxalloc;
        }
    }
    test_DosHeader_read_MZ2345.read_maxalloc_3340 = read_maxalloc_3340;
    function read_ss_3854() {
        var bi = new pe.io.BufferReader(test_DosHeader_read_MZ2345.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.ss !== 3854) {
            throw doh.ss;
        }
    }
    test_DosHeader_read_MZ2345.read_ss_3854 = read_ss_3854;
    function read_sp_4368() {
        var bi = new pe.io.BufferReader(test_DosHeader_read_MZ2345.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.sp !== 4368) {
            throw doh.sp;
        }
    }
    test_DosHeader_read_MZ2345.read_sp_4368 = read_sp_4368;
    function read_csum_4882() {
        var bi = new pe.io.BufferReader(test_DosHeader_read_MZ2345.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.csum !== 4882) {
            throw doh.csum;
        }
    }
    test_DosHeader_read_MZ2345.read_csum_4882 = read_csum_4882;
    function read_ip_5396() {
        var bi = new pe.io.BufferReader(test_DosHeader_read_MZ2345.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.ip !== 5396) {
            throw doh.ip;
        }
    }
    test_DosHeader_read_MZ2345.read_ip_5396 = read_ip_5396;
    function read_cs_5910() {
        var bi = new pe.io.BufferReader(test_DosHeader_read_MZ2345.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.cs !== 5910) {
            throw doh.cs;
        }
    }
    test_DosHeader_read_MZ2345.read_cs_5910 = read_cs_5910;
    function read_lfarc_6424() {
        var bi = new pe.io.BufferReader(test_DosHeader_read_MZ2345.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.lfarlc !== 6424) {
            throw doh.lfarlc;
        }
    }
    test_DosHeader_read_MZ2345.read_lfarc_6424 = read_lfarc_6424;
    function read_ovno_6938() {
        var bi = new pe.io.BufferReader(test_DosHeader_read_MZ2345.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.ovno !== 6938) {
            throw doh.ovno;
        }
    }
    test_DosHeader_read_MZ2345.read_ovno_6938 = read_ovno_6938;
    function read_res1_232221201F1E1D1C() {
        var bi = new pe.io.BufferReader(test_DosHeader_read_MZ2345.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.res1.toString() !== "232221201F1E1D1Ch") {
            throw doh.res1;
        }
    }
    test_DosHeader_read_MZ2345.read_res1_232221201F1E1D1C = read_res1_232221201F1E1D1C;
    function read_oemid_9508() {
        var bi = new pe.io.BufferReader(test_DosHeader_read_MZ2345.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.oemid !== 9508) {
            throw doh.oemid;
        }
    }
    test_DosHeader_read_MZ2345.read_oemid_9508 = read_oemid_9508;
    function read_oeminfo_10022() {
        var bi = new pe.io.BufferReader(test_DosHeader_read_MZ2345.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.oeminfo !== 10022) {
            throw doh.oeminfo;
        }
    }
    test_DosHeader_read_MZ2345.read_oeminfo_10022 = read_oeminfo_10022;
    function read_reserved_724183336_791555372_858927408_926299444_993671480() {
        var bi = new pe.io.BufferReader(test_DosHeader_read_MZ2345.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        var reservedStr = doh.reserved.join(",");
        if(reservedStr !== "724183336,791555372,858927408,926299444,993671480") {
            throw reservedStr;
        }
    }
    test_DosHeader_read_MZ2345.read_reserved_724183336_791555372_858927408_926299444_993671480 = read_reserved_724183336_791555372_858927408_926299444_993671480;
    function read_dosHeader_lfanew_1061043516() {
        var bi = new pe.io.BufferReader(test_DosHeader_read_MZ2345.bytes);
        var doh = new pe.headers.DosHeader();
        doh.read(bi);
        if(doh.lfanew !== 1061043516) {
            throw doh.lfanew;
        }
    }
    test_DosHeader_read_MZ2345.read_dosHeader_lfanew_1061043516 = read_dosHeader_lfanew_1061043516;
})(test_DosHeader_read_MZ2345 || (test_DosHeader_read_MZ2345 = {}));
var test_PEHeader_read_sampleExe;
(function (test_PEHeader_read_sampleExe) {
    function read_succeeds() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 128;
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
    }
    test_PEHeader_read_sampleExe.read_succeeds = read_succeeds;
    function read_pe_PE() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 128;
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.pe !== pe.headers.PESignature.PE) {
            throw peh.pe;
        }
    }
    test_PEHeader_read_sampleExe.read_pe_PE = read_pe_PE;
    function read_machine_I386() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 128;
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.machine !== pe.headers.Machine.I386) {
            throw peh.machine;
        }
    }
    test_PEHeader_read_sampleExe.read_machine_I386 = read_machine_I386;
    function read_numberOfSections_3() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 128;
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.numberOfSections !== 3) {
            throw peh.numberOfSections;
        }
    }
    test_PEHeader_read_sampleExe.read_numberOfSections_3 = read_numberOfSections_3;
    function read_timestamp_2012Nov5_093251() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 128;
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        var expectedDate = new Date(2012, 10, 5, 9, 32, 51);
        if(peh.timestamp.getTime() !== expectedDate.getTime()) {
            throw peh.timestamp + " expected " + expectedDate;
        }
    }
    test_PEHeader_read_sampleExe.read_timestamp_2012Nov5_093251 = read_timestamp_2012Nov5_093251;
    function read_pointerToSymbolTable_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 128;
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.pointerToSymbolTable !== 0) {
            throw peh.pointerToSymbolTable;
        }
    }
    test_PEHeader_read_sampleExe.read_pointerToSymbolTable_0 = read_pointerToSymbolTable_0;
    function read_numberOfSymbols_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 128;
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.numberOfSymbols !== 0) {
            throw peh.numberOfSymbols;
        }
    }
    test_PEHeader_read_sampleExe.read_numberOfSymbols_0 = read_numberOfSymbols_0;
    function read_sizeOfOptionalHeader_224() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 128;
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.sizeOfOptionalHeader !== 224) {
            throw peh.sizeOfOptionalHeader;
        }
    }
    test_PEHeader_read_sampleExe.read_sizeOfOptionalHeader_224 = read_sizeOfOptionalHeader_224;
    function read_characteristics_Bit32MachineExecutableImage() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 128;
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        var expected = pe.headers.ImageCharacteristics.Bit32Machine | pe.headers.ImageCharacteristics.ExecutableImage;
        if(peh.characteristics !== expected) {
            throw peh.characteristics + " expected " + expected;
        }
    }
    test_PEHeader_read_sampleExe.read_characteristics_Bit32MachineExecutableImage = read_characteristics_Bit32MachineExecutableImage;
})(test_PEHeader_read_sampleExe || (test_PEHeader_read_sampleExe = {}));
var test_PEHeader_read_sample64Exe;
(function (test_PEHeader_read_sample64Exe) {
    function read_succeeds() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 128;
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
    }
    test_PEHeader_read_sample64Exe.read_succeeds = read_succeeds;
    function read_pe_PE() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 128;
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.pe !== pe.headers.PESignature.PE) {
            throw peh.pe;
        }
    }
    test_PEHeader_read_sample64Exe.read_pe_PE = read_pe_PE;
    function read_machine_AMD64() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 128;
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.machine !== pe.headers.Machine.AMD64) {
            throw peh.machine;
        }
    }
    test_PEHeader_read_sample64Exe.read_machine_AMD64 = read_machine_AMD64;
    function read_numberOfSections_2() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 128;
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.numberOfSections !== 2) {
            throw peh.numberOfSections;
        }
    }
    test_PEHeader_read_sample64Exe.read_numberOfSections_2 = read_numberOfSections_2;
    function read_timestamp_2012Dec6_220520() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 128;
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        var expectedDate = new Date(2012, 11, 6, 22, 5, 20);
        if(peh.timestamp.getTime() !== expectedDate.getTime()) {
            throw peh.timestamp + " expected " + expectedDate;
        }
    }
    test_PEHeader_read_sample64Exe.read_timestamp_2012Dec6_220520 = read_timestamp_2012Dec6_220520;
    function read_pointerToSymbolTable_0() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 128;
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.pointerToSymbolTable !== 0) {
            throw peh.pointerToSymbolTable;
        }
    }
    test_PEHeader_read_sample64Exe.read_pointerToSymbolTable_0 = read_pointerToSymbolTable_0;
    function read_numberOfSymbols_0() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 128;
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.numberOfSymbols !== 0) {
            throw peh.numberOfSymbols;
        }
    }
    test_PEHeader_read_sample64Exe.read_numberOfSymbols_0 = read_numberOfSymbols_0;
    function read_sizeOfOptionalHeader_240() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 128;
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.sizeOfOptionalHeader !== 240) {
            throw peh.sizeOfOptionalHeader;
        }
    }
    test_PEHeader_read_sample64Exe.read_sizeOfOptionalHeader_240 = read_sizeOfOptionalHeader_240;
    function read_characteristics_LargeAddressAwareExecutableImage() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 128;
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        var expected = pe.headers.ImageCharacteristics.LargeAddressAware | pe.headers.ImageCharacteristics.ExecutableImage;
        if(peh.characteristics !== expected) {
            throw peh.characteristics + " expected " + expected;
        }
    }
    test_PEHeader_read_sample64Exe.read_characteristics_LargeAddressAwareExecutableImage = read_characteristics_LargeAddressAwareExecutableImage;
})(test_PEHeader_read_sample64Exe || (test_PEHeader_read_sample64Exe = {}));
var test_PEHeader_read_PE004567;
(function (test_PEHeader_read_PE004567) {
    var sampleBuf = (function () {
        var array = [
            ("P").charCodeAt(0), 
            ("E").charCodeAt(0), 
            0, 
            0
        ];
        for(var i = 0; i < 1000; i++) {
            if(i < 4) {
                continue;
            }
            array[i] = i;
        }
        return array;
    })();
    var global = (function () {
        return this;
    })();
    if("ArrayBuffer" in global) {
        var arrb = new ArrayBuffer(sampleBuf.length);
        var vi = new DataView(arrb);
        for(var i = 0; i < sampleBuf.length; i++) {
            vi.setUint8(i, sampleBuf[i]);
        }
        sampleBuf = arrb;
    }
    test_PEHeader_read_PE004567.bytes = sampleBuf;
    function read_succeeds() {
        var bi = new pe.io.BufferReader(test_PEHeader_read_PE004567.bytes);
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
    }
    test_PEHeader_read_PE004567.read_succeeds = read_succeeds;
    function read_pe_PE() {
        var bi = new pe.io.BufferReader(test_PEHeader_read_PE004567.bytes);
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.pe !== pe.headers.PESignature.PE) {
            throw peh.pe;
        }
    }
    test_PEHeader_read_PE004567.read_pe_PE = read_pe_PE;
    function read_machine_1284() {
        var bi = new pe.io.BufferReader(test_PEHeader_read_PE004567.bytes);
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.machine !== 1284) {
            throw peh.machine;
        }
    }
    test_PEHeader_read_PE004567.read_machine_1284 = read_machine_1284;
    function read_numberOfSections_1798() {
        var bi = new pe.io.BufferReader(test_PEHeader_read_PE004567.bytes);
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.numberOfSections !== 1798) {
            throw peh.numberOfSections;
        }
    }
    test_PEHeader_read_PE004567.read_numberOfSections_1798 = read_numberOfSections_1798;
    function read_timestamp_1975Nov14_142408() {
        var bi = new pe.io.BufferReader(test_PEHeader_read_PE004567.bytes);
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        var expectedDate = new Date(1975, 10, 14, 14, 24, 8);
        if(peh.timestamp.getTime() !== expectedDate.getTime()) {
            throw peh.timestamp + " expected " + expectedDate;
        }
    }
    test_PEHeader_read_PE004567.read_timestamp_1975Nov14_142408 = read_timestamp_1975Nov14_142408;
    function read_pointerToSymbolTable_252579084() {
        var bi = new pe.io.BufferReader(test_PEHeader_read_PE004567.bytes);
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.pointerToSymbolTable !== 252579084) {
            throw peh.pointerToSymbolTable;
        }
    }
    test_PEHeader_read_PE004567.read_pointerToSymbolTable_252579084 = read_pointerToSymbolTable_252579084;
    function read_numberOfSymbols_319951120() {
        var bi = new pe.io.BufferReader(test_PEHeader_read_PE004567.bytes);
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.numberOfSymbols !== 319951120) {
            throw peh.numberOfSymbols;
        }
    }
    test_PEHeader_read_PE004567.read_numberOfSymbols_319951120 = read_numberOfSymbols_319951120;
    function read_sizeOfOptionalHeader_5396() {
        var bi = new pe.io.BufferReader(test_PEHeader_read_PE004567.bytes);
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.sizeOfOptionalHeader !== 5396) {
            throw peh.sizeOfOptionalHeader;
        }
    }
    test_PEHeader_read_PE004567.read_sizeOfOptionalHeader_5396 = read_sizeOfOptionalHeader_5396;
    function read_characteristics_5910() {
        var bi = new pe.io.BufferReader(test_PEHeader_read_PE004567.bytes);
        var peh = new pe.headers.PEHeader();
        peh.read(bi);
        if(peh.characteristics !== 5910) {
            throw peh.characteristics;
        }
    }
    test_PEHeader_read_PE004567.read_characteristics_5910 = read_characteristics_5910;
})(test_PEHeader_read_PE004567 || (test_PEHeader_read_PE004567 = {}));
var test_OptionalHeader_read_sampleExe;
(function (test_OptionalHeader_read_sampleExe) {
    function read_succeeds() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
    }
    test_OptionalHeader_read_sampleExe.read_succeeds = read_succeeds;
    function read_peMagic_NT32() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.peMagic !== pe.headers.PEMagic.NT32) {
            throw oph.peMagic;
        }
    }
    test_OptionalHeader_read_sampleExe.read_peMagic_NT32 = read_peMagic_NT32;
    function read_linkerVersion_80() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.linkerVersion !== "8.0") {
            throw oph.linkerVersion;
        }
    }
    test_OptionalHeader_read_sampleExe.read_linkerVersion_80 = read_linkerVersion_80;
    function read_sizeOfCode_1024() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfCode !== 1024) {
            throw oph.sizeOfCode;
        }
    }
    test_OptionalHeader_read_sampleExe.read_sizeOfCode_1024 = read_sizeOfCode_1024;
    function read_sizeOfInitializedData_1536() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfInitializedData !== 1536) {
            throw oph.sizeOfInitializedData;
        }
    }
    test_OptionalHeader_read_sampleExe.read_sizeOfInitializedData_1536 = read_sizeOfInitializedData_1536;
    function read_sizeOfUninitializedData_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfUninitializedData !== 0) {
            throw oph.sizeOfUninitializedData;
        }
    }
    test_OptionalHeader_read_sampleExe.read_sizeOfUninitializedData_0 = read_sizeOfUninitializedData_0;
    function read_addressOfEntryPoint_9022() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.addressOfEntryPoint !== 9022) {
            throw oph.addressOfEntryPoint;
        }
    }
    test_OptionalHeader_read_sampleExe.read_addressOfEntryPoint_9022 = read_addressOfEntryPoint_9022;
    function read_baseOfCode_0x2000() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.baseOfCode !== 8192) {
            throw oph.baseOfCode;
        }
    }
    test_OptionalHeader_read_sampleExe.read_baseOfCode_0x2000 = read_baseOfCode_0x2000;
    function read_baseOfData_0x4000() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.baseOfData !== 16384) {
            throw oph.baseOfData;
        }
    }
    test_OptionalHeader_read_sampleExe.read_baseOfData_0x4000 = read_baseOfData_0x4000;
    function read_imageBase_0x4000() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.baseOfData !== 16384) {
            throw oph.baseOfData;
        }
    }
    test_OptionalHeader_read_sampleExe.read_imageBase_0x4000 = read_imageBase_0x4000;
    function read_sectionAlignment_0x2000() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sectionAlignment !== 8192) {
            throw oph.sectionAlignment;
        }
    }
    test_OptionalHeader_read_sampleExe.read_sectionAlignment_0x2000 = read_sectionAlignment_0x2000;
    function read_fileAlignment_0x200() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.fileAlignment !== 512) {
            throw oph.fileAlignment;
        }
    }
    test_OptionalHeader_read_sampleExe.read_fileAlignment_0x200 = read_fileAlignment_0x200;
    function read_operatingSystemVersion_40() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.operatingSystemVersion !== "4.0") {
            throw oph.operatingSystemVersion;
        }
    }
    test_OptionalHeader_read_sampleExe.read_operatingSystemVersion_40 = read_operatingSystemVersion_40;
    function read_imageVersion_00() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.imageVersion !== "0.0") {
            throw oph.imageVersion;
        }
    }
    test_OptionalHeader_read_sampleExe.read_imageVersion_00 = read_imageVersion_00;
    function read_subsystemVersion_40() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.subsystemVersion !== "4.0") {
            throw oph.subsystemVersion;
        }
    }
    test_OptionalHeader_read_sampleExe.read_subsystemVersion_40 = read_subsystemVersion_40;
    function read_win32VersionValue_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.win32VersionValue !== 0) {
            throw oph.win32VersionValue;
        }
    }
    test_OptionalHeader_read_sampleExe.read_win32VersionValue_0 = read_win32VersionValue_0;
    function read_sizeOfImage_32768() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfImage !== 32768) {
            throw oph.sizeOfImage;
        }
    }
    test_OptionalHeader_read_sampleExe.read_sizeOfImage_32768 = read_sizeOfImage_32768;
    function read_sizeOfHeaders_512() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfHeaders !== 512) {
            throw oph.sizeOfHeaders;
        }
    }
    test_OptionalHeader_read_sampleExe.read_sizeOfHeaders_512 = read_sizeOfHeaders_512;
    function read_checkSum_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.checkSum !== 0) {
            throw oph.checkSum;
        }
    }
    test_OptionalHeader_read_sampleExe.read_checkSum_0 = read_checkSum_0;
    function read_subsystem_WindowsCUI() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.subsystem !== pe.headers.Subsystem.WindowsCUI) {
            throw oph.subsystem;
        }
    }
    test_OptionalHeader_read_sampleExe.read_subsystem_WindowsCUI = read_subsystem_WindowsCUI;
    function read_dllCharacteristics_0x8540() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.dllCharacteristics !== 34112) {
            throw oph.dllCharacteristics;
        }
    }
    test_OptionalHeader_read_sampleExe.read_dllCharacteristics_0x8540 = read_dllCharacteristics_0x8540;
    function read_sizeOfStackReserve_0x100000() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfStackReserve !== 1048576) {
            throw oph.sizeOfStackReserve;
        }
    }
    test_OptionalHeader_read_sampleExe.read_sizeOfStackReserve_0x100000 = read_sizeOfStackReserve_0x100000;
    function read_sizeOfStackCommit_0x1000() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfStackCommit !== 4096) {
            throw oph.sizeOfStackCommit;
        }
    }
    test_OptionalHeader_read_sampleExe.read_sizeOfStackCommit_0x1000 = read_sizeOfStackCommit_0x1000;
    function read_sizeOfHeapReserve_0x100000() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfHeapReserve !== 1048576) {
            throw oph.sizeOfHeapReserve;
        }
    }
    test_OptionalHeader_read_sampleExe.read_sizeOfHeapReserve_0x100000 = read_sizeOfHeapReserve_0x100000;
    function read_sizeOfHeapCommit_0x1000() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfHeapCommit !== 4096) {
            throw oph.sizeOfHeapCommit;
        }
    }
    test_OptionalHeader_read_sampleExe.read_sizeOfHeapCommit_0x1000 = read_sizeOfHeapCommit_0x1000;
    function read_loaderFlags_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.loaderFlags !== 0) {
            throw oph.loaderFlags;
        }
    }
    test_OptionalHeader_read_sampleExe.read_loaderFlags_0 = read_loaderFlags_0;
    function read_numberOfRvaAndSizes_16() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.numberOfRvaAndSizes !== 16) {
            throw oph.numberOfRvaAndSizes;
        }
    }
    test_OptionalHeader_read_sampleExe.read_numberOfRvaAndSizes_16 = read_numberOfRvaAndSizes_16;
    function read_dataDirectories_length_16() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.dataDirectories.length !== 16) {
            throw oph.dataDirectories.length;
        }
    }
    test_OptionalHeader_read_sampleExe.read_dataDirectories_length_16 = read_dataDirectories_length_16;
})(test_OptionalHeader_read_sampleExe || (test_OptionalHeader_read_sampleExe = {}));
var test_OptionalHeader_read_sample64Exe;
(function (test_OptionalHeader_read_sample64Exe) {
    function read_succeeds() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
    }
    test_OptionalHeader_read_sample64Exe.read_succeeds = read_succeeds;
    function read_peMagic_NT64() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.peMagic !== pe.headers.PEMagic.NT64) {
            throw oph.peMagic;
        }
    }
    test_OptionalHeader_read_sample64Exe.read_peMagic_NT64 = read_peMagic_NT64;
    function read_linkerVersion_110() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.linkerVersion !== "11.0") {
            throw oph.linkerVersion;
        }
    }
    test_OptionalHeader_read_sample64Exe.read_linkerVersion_110 = read_linkerVersion_110;
    function read_sizeOfCode_1024() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfCode !== 1024) {
            throw oph.sizeOfCode;
        }
    }
    test_OptionalHeader_read_sample64Exe.read_sizeOfCode_1024 = read_sizeOfCode_1024;
    function read_sizeOfInitializedData_1536() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfInitializedData !== 1536) {
            throw oph.sizeOfInitializedData;
        }
    }
    test_OptionalHeader_read_sample64Exe.read_sizeOfInitializedData_1536 = read_sizeOfInitializedData_1536;
    function read_sizeOfUninitializedData_0() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfUninitializedData !== 0) {
            throw oph.sizeOfUninitializedData;
        }
    }
    test_OptionalHeader_read_sample64Exe.read_sizeOfUninitializedData_0 = read_sizeOfUninitializedData_0;
    function read_addressOfEntryPoint_0() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.addressOfEntryPoint !== 0) {
            throw oph.addressOfEntryPoint;
        }
    }
    test_OptionalHeader_read_sample64Exe.read_addressOfEntryPoint_0 = read_addressOfEntryPoint_0;
    function read_baseOfCode_0x2000() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.baseOfCode !== 8192) {
            throw oph.baseOfCode;
        }
    }
    test_OptionalHeader_read_sample64Exe.read_baseOfCode_0x2000 = read_baseOfCode_0x2000;
    function read_baseOfData_0x4000() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.baseOfData !== 16384) {
            throw oph.baseOfData;
        }
    }
    test_OptionalHeader_read_sample64Exe.read_baseOfData_0x4000 = read_baseOfData_0x4000;
    function read_imageBase_0x4000() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.baseOfData !== 16384) {
            throw oph.baseOfData;
        }
    }
    test_OptionalHeader_read_sample64Exe.read_imageBase_0x4000 = read_imageBase_0x4000;
    function read_sectionAlignment_0x2000() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sectionAlignment !== 8192) {
            throw oph.sectionAlignment;
        }
    }
    test_OptionalHeader_read_sample64Exe.read_sectionAlignment_0x2000 = read_sectionAlignment_0x2000;
    function read_fileAlignment_0x200() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.fileAlignment !== 512) {
            throw oph.fileAlignment;
        }
    }
    test_OptionalHeader_read_sample64Exe.read_fileAlignment_0x200 = read_fileAlignment_0x200;
    function read_operatingSystemVersion_40() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.operatingSystemVersion !== "4.0") {
            throw oph.operatingSystemVersion;
        }
    }
    test_OptionalHeader_read_sample64Exe.read_operatingSystemVersion_40 = read_operatingSystemVersion_40;
    function read_imageVersion_00() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.imageVersion !== "0.0") {
            throw oph.imageVersion;
        }
    }
    test_OptionalHeader_read_sample64Exe.read_imageVersion_00 = read_imageVersion_00;
    function read_subsystemVersion_40() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.subsystemVersion !== "4.0") {
            throw oph.subsystemVersion;
        }
    }
    test_OptionalHeader_read_sample64Exe.read_subsystemVersion_40 = read_subsystemVersion_40;
    function read_win32VersionValue_0() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.win32VersionValue !== 0) {
            throw oph.win32VersionValue;
        }
    }
    test_OptionalHeader_read_sample64Exe.read_win32VersionValue_0 = read_win32VersionValue_0;
    function read_sizeOfImage_24576() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfImage !== 24576) {
            throw oph.sizeOfImage;
        }
    }
    test_OptionalHeader_read_sample64Exe.read_sizeOfImage_24576 = read_sizeOfImage_24576;
    function read_sizeOfHeaders_512() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfHeaders !== 512) {
            throw oph.sizeOfHeaders;
        }
    }
    test_OptionalHeader_read_sample64Exe.read_sizeOfHeaders_512 = read_sizeOfHeaders_512;
    function read_checkSum_0() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.checkSum !== 0) {
            throw oph.checkSum;
        }
    }
    test_OptionalHeader_read_sample64Exe.read_checkSum_0 = read_checkSum_0;
    function read_subsystem_WindowsCUI() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.subsystem !== pe.headers.Subsystem.WindowsCUI) {
            throw oph.subsystem;
        }
    }
    test_OptionalHeader_read_sample64Exe.read_subsystem_WindowsCUI = read_subsystem_WindowsCUI;
    function read_dllCharacteristics_0x8540() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.dllCharacteristics !== 34112) {
            throw oph.dllCharacteristics;
        }
    }
    test_OptionalHeader_read_sample64Exe.read_dllCharacteristics_0x8540 = read_dllCharacteristics_0x8540;
    function read_sizeOfStackReserve_toString_400000h() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfStackReserve + "" !== "400000h") {
            throw oph.sizeOfStackReserve;
        }
    }
    test_OptionalHeader_read_sample64Exe.read_sizeOfStackReserve_toString_400000h = read_sizeOfStackReserve_toString_400000h;
    function read_sizeOfStackCommit_toString_4000h() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfStackCommit + "" !== "4000h") {
            throw oph.sizeOfStackCommit;
        }
    }
    test_OptionalHeader_read_sample64Exe.read_sizeOfStackCommit_toString_4000h = read_sizeOfStackCommit_toString_4000h;
    function read_sizeOfHeapReserve_toString_100000h() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfHeapReserve + "" !== "100000h") {
            throw oph.sizeOfHeapReserve;
        }
    }
    test_OptionalHeader_read_sample64Exe.read_sizeOfHeapReserve_toString_100000h = read_sizeOfHeapReserve_toString_100000h;
    function read_sizeOfHeapCommit_toString_2000h() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfHeapCommit + "" !== "2000h") {
            throw oph.sizeOfHeapCommit;
        }
    }
    test_OptionalHeader_read_sample64Exe.read_sizeOfHeapCommit_toString_2000h = read_sizeOfHeapCommit_toString_2000h;
    function read_loaderFlags_0() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.loaderFlags !== 0) {
            throw oph.loaderFlags;
        }
    }
    test_OptionalHeader_read_sample64Exe.read_loaderFlags_0 = read_loaderFlags_0;
    function read_numberOfRvaAndSizes_16() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.numberOfRvaAndSizes !== 16) {
            throw oph.numberOfRvaAndSizes;
        }
    }
    test_OptionalHeader_read_sample64Exe.read_numberOfRvaAndSizes_16 = read_numberOfRvaAndSizes_16;
    function read_dataDirectories_length_16() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        bi.offset = 152;
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.dataDirectories.length !== 16) {
            throw oph.dataDirectories.length;
        }
    }
    test_OptionalHeader_read_sample64Exe.read_dataDirectories_length_16 = read_dataDirectories_length_16;
})(test_OptionalHeader_read_sample64Exe || (test_OptionalHeader_read_sample64Exe = {}));
var test_OptionalHeader_read_NT322345;
(function (test_OptionalHeader_read_NT322345) {
    var sampleBuf = (function () {
        var array = [
            pe.headers.PEMagic.NT32 & 255, 
            (pe.headers.PEMagic.NT32 >> 8) & 255
        ];
        for(var i = 0; i < 300; i++) {
            if(typeof (array[i]) === "number") {
                continue;
            }
            array[i] = i;
        }
        array[92] = 1;
        array[93] = 0;
        array[94] = 0;
        array[95] = 0;
        return array;
    })();
    var global = (function () {
        return this;
    })();
    if("ArrayBuffer" in global) {
        var arrb = new ArrayBuffer(sampleBuf.length);
        var vi = new DataView(arrb);
        for(var i = 0; i < sampleBuf.length; i++) {
            vi.setUint8(i, sampleBuf[i]);
        }
        sampleBuf = arrb;
    }
    test_OptionalHeader_read_NT322345.bytes = sampleBuf;
    function read_succeeds() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
    }
    test_OptionalHeader_read_NT322345.read_succeeds = read_succeeds;
    function read_peMagic_NT32() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.peMagic !== pe.headers.PEMagic.NT32) {
            throw oph.peMagic;
        }
    }
    test_OptionalHeader_read_NT322345.read_peMagic_NT32 = read_peMagic_NT32;
    function read_linkerVersion_23() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.linkerVersion !== "2.3") {
            throw oph.linkerVersion;
        }
    }
    test_OptionalHeader_read_NT322345.read_linkerVersion_23 = read_linkerVersion_23;
    function read_sizeOfCode_117835012() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfCode !== 117835012) {
            throw oph.sizeOfCode;
        }
    }
    test_OptionalHeader_read_NT322345.read_sizeOfCode_117835012 = read_sizeOfCode_117835012;
    function read_sizeOfInitializedData_185207048() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfInitializedData !== 185207048) {
            throw oph.sizeOfInitializedData;
        }
    }
    test_OptionalHeader_read_NT322345.read_sizeOfInitializedData_185207048 = read_sizeOfInitializedData_185207048;
    function read_sizeOfUninitializedData_252579084() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfUninitializedData !== 252579084) {
            throw oph.sizeOfUninitializedData;
        }
    }
    test_OptionalHeader_read_NT322345.read_sizeOfUninitializedData_252579084 = read_sizeOfUninitializedData_252579084;
    function read_addressOfEntryPoint_319951120() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.addressOfEntryPoint !== 319951120) {
            throw oph.addressOfEntryPoint;
        }
    }
    test_OptionalHeader_read_NT322345.read_addressOfEntryPoint_319951120 = read_addressOfEntryPoint_319951120;
    function read_baseOfCode_387323156() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.baseOfCode !== 387323156) {
            throw oph.baseOfCode;
        }
    }
    test_OptionalHeader_read_NT322345.read_baseOfCode_387323156 = read_baseOfCode_387323156;
    function read_baseOfData_454695192() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.baseOfData !== 454695192) {
            throw oph.baseOfData;
        }
    }
    test_OptionalHeader_read_NT322345.read_baseOfData_454695192 = read_baseOfData_454695192;
    function read_imageBase_454695192() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.baseOfData !== 454695192) {
            throw oph.baseOfData;
        }
    }
    test_OptionalHeader_read_NT322345.read_imageBase_454695192 = read_imageBase_454695192;
    function read_sectionAlignment_589439264() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sectionAlignment !== 589439264) {
            throw oph.sectionAlignment;
        }
    }
    test_OptionalHeader_read_NT322345.read_sectionAlignment_589439264 = read_sectionAlignment_589439264;
    function read_fileAlignment_656811300() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.fileAlignment !== 656811300) {
            throw oph.fileAlignment;
        }
    }
    test_OptionalHeader_read_NT322345.read_fileAlignment_656811300 = read_fileAlignment_656811300;
    function read_operatingSystemVersion_10536_11050() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.operatingSystemVersion !== "10536.11050") {
            throw oph.operatingSystemVersion;
        }
    }
    test_OptionalHeader_read_NT322345.read_operatingSystemVersion_10536_11050 = read_operatingSystemVersion_10536_11050;
    function read_imageVersion_11564_12078() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.imageVersion !== "11564.12078") {
            throw oph.imageVersion;
        }
    }
    test_OptionalHeader_read_NT322345.read_imageVersion_11564_12078 = read_imageVersion_11564_12078;
    function read_subsystemVersion_12592_13106() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.subsystemVersion !== "12592.13106") {
            throw oph.subsystemVersion;
        }
    }
    test_OptionalHeader_read_NT322345.read_subsystemVersion_12592_13106 = read_subsystemVersion_12592_13106;
    function read_win32VersionValue_926299444() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.win32VersionValue !== 926299444) {
            throw oph.win32VersionValue;
        }
    }
    test_OptionalHeader_read_NT322345.read_win32VersionValue_926299444 = read_win32VersionValue_926299444;
    function read_sizeOfImage_993671480() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfImage !== 993671480) {
            throw oph.sizeOfImage;
        }
    }
    test_OptionalHeader_read_NT322345.read_sizeOfImage_993671480 = read_sizeOfImage_993671480;
    function read_sizeOfHeaders_1061043516() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfHeaders !== 1061043516) {
            throw oph.sizeOfHeaders;
        }
    }
    test_OptionalHeader_read_NT322345.read_sizeOfHeaders_1061043516 = read_sizeOfHeaders_1061043516;
    function read_checkSum_1128415552() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.checkSum !== 1128415552) {
            throw oph.checkSum;
        }
    }
    test_OptionalHeader_read_NT322345.read_checkSum_1128415552 = read_checkSum_1128415552;
    function read_subsystem_17732() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.subsystem !== 17732) {
            throw oph.subsystem;
        }
    }
    test_OptionalHeader_read_NT322345.read_subsystem_17732 = read_subsystem_17732;
    function read_dllCharacteristics_18246() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.dllCharacteristics !== 18246) {
            throw oph.dllCharacteristics;
        }
    }
    test_OptionalHeader_read_NT322345.read_dllCharacteristics_18246 = read_dllCharacteristics_18246;
    function read_sizeOfStackReserve_1263159624() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfStackReserve !== 1263159624) {
            throw oph.sizeOfStackReserve;
        }
    }
    test_OptionalHeader_read_NT322345.read_sizeOfStackReserve_1263159624 = read_sizeOfStackReserve_1263159624;
    function read_sizeOfStackCommit_1330531660() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfStackCommit !== 1330531660) {
            throw oph.sizeOfStackCommit;
        }
    }
    test_OptionalHeader_read_NT322345.read_sizeOfStackCommit_1330531660 = read_sizeOfStackCommit_1330531660;
    function read_sizeOfHeapReserve_1397903696() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfHeapReserve !== 1397903696) {
            throw oph.sizeOfHeapReserve;
        }
    }
    test_OptionalHeader_read_NT322345.read_sizeOfHeapReserve_1397903696 = read_sizeOfHeapReserve_1397903696;
    function read_sizeOfHeapCommit_1465275732() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.sizeOfHeapCommit !== 1465275732) {
            throw oph.sizeOfHeapCommit;
        }
    }
    test_OptionalHeader_read_NT322345.read_sizeOfHeapCommit_1465275732 = read_sizeOfHeapCommit_1465275732;
    function read_loaderFlags_1532647768() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.loaderFlags !== 1532647768) {
            throw oph.loaderFlags;
        }
    }
    test_OptionalHeader_read_NT322345.read_loaderFlags_1532647768 = read_loaderFlags_1532647768;
    function read_numberOfRvaAndSizes_1() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.numberOfRvaAndSizes !== 1) {
            throw oph.numberOfRvaAndSizes;
        }
    }
    test_OptionalHeader_read_NT322345.read_numberOfRvaAndSizes_1 = read_numberOfRvaAndSizes_1;
    function read_dataDirectories_length_1() {
        var bi = new pe.io.BufferReader(test_OptionalHeader_read_NT322345.bytes);
        var oph = new pe.headers.OptionalHeader();
        oph.read(bi);
        if(oph.dataDirectories.length !== 1) {
            throw oph.dataDirectories.length;
        }
    }
    test_OptionalHeader_read_NT322345.read_dataDirectories_length_1 = read_dataDirectories_length_1;
})(test_OptionalHeader_read_NT322345 || (test_OptionalHeader_read_NT322345 = {}));
var test_DllImport_read_sampleExe;
(function (test_DllImport_read_sampleExe) {
    function read_succeeds() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        var importRange = pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.ImportSymbols];
        bi.setVirtualOffset(importRange.address);
        pe.unmanaged.DllImport.read(bi);
    }
    test_DllImport_read_sampleExe.read_succeeds = read_succeeds;
    function read_length_1() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        var importRange = pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.ImportSymbols];
        bi.setVirtualOffset(importRange.address);
        var imports = pe.unmanaged.DllImport.read(bi);
        if(imports.length !== 1) {
            throw imports.length;
        }
    }
    test_DllImport_read_sampleExe.read_length_1 = read_length_1;
    function read_0_dllName_mscoreeDll() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        var importRange = pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.ImportSymbols];
        bi.setVirtualOffset(importRange.address);
        var imports = pe.unmanaged.DllImport.read(bi);
        if(imports[0].dllName !== "mscoree.dll") {
            throw imports[0].dllName;
        }
    }
    test_DllImport_read_sampleExe.read_0_dllName_mscoreeDll = read_0_dllName_mscoreeDll;
    function read_0_name__CorExeMain() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        var importRange = pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.ImportSymbols];
        bi.setVirtualOffset(importRange.address);
        var imports = pe.unmanaged.DllImport.read(bi);
        if(imports[0].name !== "_CorExeMain") {
            throw imports[0].name;
        }
    }
    test_DllImport_read_sampleExe.read_0_name__CorExeMain = read_0_name__CorExeMain;
    function read_0_ordinal_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        var importRange = pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.ImportSymbols];
        bi.setVirtualOffset(importRange.address);
        var imports = pe.unmanaged.DllImport.read(bi);
        if(imports[0].ordinal !== 0) {
            throw imports[0].ordinal;
        }
    }
    test_DllImport_read_sampleExe.read_0_ordinal_0 = read_0_ordinal_0;
})(test_DllImport_read_sampleExe || (test_DllImport_read_sampleExe = {}));
var test_DllImport_read_012345;
(function (test_DllImport_read_012345) {
    var sampleBuf = (function () {
        var buf = [];
        for(var i = 0; i < 400; i++) {
            buf[i] = 0;
        }
        buf[0] = 50;
        buf[1] = buf[2] = buf[3] = 0;
        buf[50] = 150;
        buf[51] = buf[52] = buf[53] = 0;
        buf[150] = 14;
        buf[151] = 0;
        buf[152] = ("Q").charCodeAt(0);
        buf[153] = 0;
        buf[12] = 100;
        buf[13] = buf[14] = buf[15] = 0;
        buf[100] = ("Y").charCodeAt(0);
        buf[101] = 0;
        buf[54] = 250;
        buf[55] = buf[56] = 0;
        buf[57] = 128;
        return buf;
    })();
    var global = (function () {
        return this;
    })();
    var bytes;
    if("ArrayBuffer" in global) {
        var arrb = new ArrayBuffer(sampleBuf.length);
        var vi = new DataView(arrb);
        for(var i = 0; i < sampleBuf.length; i++) {
            vi.setUint8(i, sampleBuf[i]);
        }
        bytes = arrb;
    } else {
        bytes = sampleBuf;
    }
    function read_succeeds() {
        var bi = new pe.io.BufferReader(bytes);
        bi.sections.push(new pe.io.AddressRangeMap(0, sampleBuf.length, 0));
        var imports = pe.unmanaged.DllImport.read(bi);
    }
    test_DllImport_read_012345.read_succeeds = read_succeeds;
    function read_length_2() {
        var bi = new pe.io.BufferReader(bytes);
        bi.sections.push(new pe.io.AddressRangeMap(0, sampleBuf.length, 0));
        var imports = pe.unmanaged.DllImport.read(bi);
        if(imports.length !== 2) {
            throw imports.length;
        }
    }
    test_DllImport_read_012345.read_length_2 = read_length_2;
    function read_0_dllName_Y() {
        var bi = new pe.io.BufferReader(bytes);
        bi.sections.push(new pe.io.AddressRangeMap(0, sampleBuf.length, 0));
        var imports = pe.unmanaged.DllImport.read(bi);
        if(imports[0].dllName !== "Y") {
            throw imports[0].dllName;
        }
    }
    test_DllImport_read_012345.read_0_dllName_Y = read_0_dllName_Y;
    function read_0_name_Q() {
        var bi = new pe.io.BufferReader(bytes);
        bi.sections.push(new pe.io.AddressRangeMap(0, sampleBuf.length, 0));
        var imports = pe.unmanaged.DllImport.read(bi);
        if(imports[0].name !== "Q") {
            throw imports[0].name;
        }
    }
    test_DllImport_read_012345.read_0_name_Q = read_0_name_Q;
    function read_0_ordinal_14() {
        var bi = new pe.io.BufferReader(bytes);
        bi.sections.push(new pe.io.AddressRangeMap(0, sampleBuf.length, 0));
        var imports = pe.unmanaged.DllImport.read(bi);
        if(imports[0].ordinal !== 14) {
            throw imports[0].ordinal;
        }
    }
    test_DllImport_read_012345.read_0_ordinal_14 = read_0_ordinal_14;
    function read_1_dllName_Y() {
        var bi = new pe.io.BufferReader(bytes);
        bi.sections.push(new pe.io.AddressRangeMap(0, sampleBuf.length, 0));
        var imports = pe.unmanaged.DllImport.read(bi);
        if(imports[1].dllName !== "Y") {
            throw imports[1].dllName;
        }
    }
    test_DllImport_read_012345.read_1_dllName_Y = read_1_dllName_Y;
    function read_1_name_null() {
        var bi = new pe.io.BufferReader(bytes);
        bi.sections.push(new pe.io.AddressRangeMap(0, sampleBuf.length, 0));
        var imports = pe.unmanaged.DllImport.read(bi);
        if(imports[1].name !== null) {
            throw imports[1].name;
        }
    }
    test_DllImport_read_012345.read_1_name_null = read_1_name_null;
    function read_1_ordinal_250() {
        var bi = new pe.io.BufferReader(bytes);
        bi.sections.push(new pe.io.AddressRangeMap(0, sampleBuf.length, 0));
        var imports = pe.unmanaged.DllImport.read(bi);
        if(imports[1].ordinal !== 250) {
            throw imports[1].ordinal;
        }
    }
    test_DllImport_read_012345.read_1_ordinal_250 = read_1_ordinal_250;
})(test_DllImport_read_012345 || (test_DllImport_read_012345 = {}));
var test_ResourceDirectory;
(function (test_ResourceDirectory) {
    function constructor_succeeds() {
        var dr = new pe.unmanaged.ResourceDirectory();
    }
    test_ResourceDirectory.constructor_succeeds = constructor_succeeds;
    function characterstics_default_0() {
        var dr = new pe.unmanaged.ResourceDirectory();
        if(dr.characteristics !== 0) {
            throw dr.characteristics;
        }
    }
    test_ResourceDirectory.characterstics_default_0 = characterstics_default_0;
    function timestamp_default_Epoch() {
        var dr = new pe.unmanaged.ResourceDirectory();
        if(dr.timestamp.getTime() !== new Date(0).getTime()) {
            throw dr.timestamp + " expected " + new Date(0);
        }
    }
    test_ResourceDirectory.timestamp_default_Epoch = timestamp_default_Epoch;
    function version_default_emptyString() {
        var dr = new pe.unmanaged.ResourceDirectory();
        if(dr.version !== "") {
            throw dr.version;
        }
    }
    test_ResourceDirectory.version_default_emptyString = version_default_emptyString;
    function subdirectories_default_length_0() {
        var dr = new pe.unmanaged.ResourceDirectory();
        if(dr.subdirectories.length !== 0) {
            throw dr.subdirectories.length;
        }
    }
    test_ResourceDirectory.subdirectories_default_length_0 = subdirectories_default_length_0;
    function dataEntries_default_length_0() {
        var dr = new pe.unmanaged.ResourceDirectory();
        if(dr.dataEntries.length !== 0) {
            throw dr.dataEntries.length;
        }
    }
    test_ResourceDirectory.dataEntries_default_length_0 = dataEntries_default_length_0;
})(test_ResourceDirectory || (test_ResourceDirectory = {}));
var test_ResourceDirectory_read_sampleExe;
(function (test_ResourceDirectory_read_sampleExe) {
    function read_succeeds() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);
        var redi = new pe.unmanaged.ResourceDirectory();
        redi.read(bi);
    }
    test_ResourceDirectory_read_sampleExe.read_succeeds = read_succeeds;
    function read_characteristics_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);
        var redi = new pe.unmanaged.ResourceDirectory();
        redi.read(bi);
        if(redi.characteristics !== 0) {
            throw redi.characteristics;
        }
    }
    test_ResourceDirectory_read_sampleExe.read_characteristics_0 = read_characteristics_0;
    function read_version_00() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);
        var redi = new pe.unmanaged.ResourceDirectory();
        redi.read(bi);
        if(redi.version !== "0.0") {
            throw redi.version;
        }
    }
    test_ResourceDirectory_read_sampleExe.read_version_00 = read_version_00;
    function read_subdirectories_length_1() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);
        var redi = new pe.unmanaged.ResourceDirectory();
        redi.read(bi);
        if(redi.subdirectories.length !== 1) {
            throw redi.subdirectories.length;
        }
    }
    test_ResourceDirectory_read_sampleExe.read_subdirectories_length_1 = read_subdirectories_length_1;
    function read_dataEntries_length_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);
        var redi = new pe.unmanaged.ResourceDirectory();
        redi.read(bi);
        if(redi.dataEntries.length !== 0) {
            throw redi.dataEntries.length;
        }
    }
    test_ResourceDirectory_read_sampleExe.read_dataEntries_length_0 = read_dataEntries_length_0;
    function read_subdirectories_0_name_null() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);
        var redi = new pe.unmanaged.ResourceDirectory();
        redi.read(bi);
        if(redi.subdirectories[0].name !== null) {
            throw redi.subdirectories[0].name;
        }
    }
    test_ResourceDirectory_read_sampleExe.read_subdirectories_0_name_null = read_subdirectories_0_name_null;
    function read_subdirectories_0_integerId_16() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);
        var redi = new pe.unmanaged.ResourceDirectory();
        redi.read(bi);
        if(redi.subdirectories[0].integerId !== 16) {
            throw redi.subdirectories[0].integerId;
        }
    }
    test_ResourceDirectory_read_sampleExe.read_subdirectories_0_integerId_16 = read_subdirectories_0_integerId_16;
    function read_subdirectories_0_directory_notNull() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);
        var redi = new pe.unmanaged.ResourceDirectory();
        redi.read(bi);
        if(redi.subdirectories[0].directory === null) {
            throw redi.subdirectories[0].directory;
        }
    }
    test_ResourceDirectory_read_sampleExe.read_subdirectories_0_directory_notNull = read_subdirectories_0_directory_notNull;
    function read_subdirectories_0_directory_characteristics_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);
        var redi = new pe.unmanaged.ResourceDirectory();
        redi.read(bi);
        if(redi.subdirectories[0].directory.characteristics !== 0) {
            throw redi.subdirectories[0].directory.characteristics;
        }
    }
    test_ResourceDirectory_read_sampleExe.read_subdirectories_0_directory_characteristics_0 = read_subdirectories_0_directory_characteristics_0;
    function read_subdirectories_0_directory_version_00() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);
        var redi = new pe.unmanaged.ResourceDirectory();
        redi.read(bi);
        if(redi.subdirectories[0].directory.version !== "0.0") {
            throw redi.subdirectories[0].directory.version;
        }
    }
    test_ResourceDirectory_read_sampleExe.read_subdirectories_0_directory_version_00 = read_subdirectories_0_directory_version_00;
    function read_subdirectories_0_directory_subdirectories_length_1() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);
        var redi = new pe.unmanaged.ResourceDirectory();
        redi.read(bi);
        if(redi.subdirectories[0].directory.subdirectories.length !== 1) {
            throw redi.subdirectories[0].directory.subdirectories;
        }
    }
    test_ResourceDirectory_read_sampleExe.read_subdirectories_0_directory_subdirectories_length_1 = read_subdirectories_0_directory_subdirectories_length_1;
    function read_subdirectories_0_directory_dataEntries_length_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);
        var redi = new pe.unmanaged.ResourceDirectory();
        redi.read(bi);
        if(redi.subdirectories[0].directory.dataEntries.length !== 0) {
            throw redi.subdirectories[0].directory.dataEntries;
        }
    }
    test_ResourceDirectory_read_sampleExe.read_subdirectories_0_directory_dataEntries_length_0 = read_subdirectories_0_directory_dataEntries_length_0;
    function read_subdirectories_0_directory_subdirectories_0_name_null() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);
        var redi = new pe.unmanaged.ResourceDirectory();
        redi.read(bi);
        if(redi.subdirectories[0].directory.subdirectories[0].name !== null) {
            throw redi.subdirectories[0].directory.subdirectories[0].name;
        }
    }
    test_ResourceDirectory_read_sampleExe.read_subdirectories_0_directory_subdirectories_0_name_null = read_subdirectories_0_directory_subdirectories_0_name_null;
    function read_subdirectories_0_directory_subdirectories_0_integerId_1() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);
        var redi = new pe.unmanaged.ResourceDirectory();
        redi.read(bi);
        if(redi.subdirectories[0].directory.subdirectories[0].integerId !== 1) {
            throw redi.subdirectories[0].directory.subdirectories[0].integerId;
        }
    }
    test_ResourceDirectory_read_sampleExe.read_subdirectories_0_directory_subdirectories_0_integerId_1 = read_subdirectories_0_directory_subdirectories_0_integerId_1;
    function read_subdirectories_0_directory_subdirectories_0_directory_notNull() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);
        var redi = new pe.unmanaged.ResourceDirectory();
        redi.read(bi);
        if(redi.subdirectories[0].directory.subdirectories[0].directory === null) {
            throw redi.subdirectories[0].directory.subdirectories[0].directory;
        }
    }
    test_ResourceDirectory_read_sampleExe.read_subdirectories_0_directory_subdirectories_0_directory_notNull = read_subdirectories_0_directory_subdirectories_0_directory_notNull;
    function read_subdirectories_0_directory_subdirectories_0_directory_characteristics_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);
        var redi = new pe.unmanaged.ResourceDirectory();
        redi.read(bi);
        if(redi.subdirectories[0].directory.subdirectories[0].directory.characteristics !== 0) {
            throw redi.subdirectories[0].directory.subdirectories[0].directory.characteristics;
        }
    }
    test_ResourceDirectory_read_sampleExe.read_subdirectories_0_directory_subdirectories_0_directory_characteristics_0 = read_subdirectories_0_directory_subdirectories_0_directory_characteristics_0;
    function read_subdirectories_0_directory_subdirectories_0_directory_version_00() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);
        var redi = new pe.unmanaged.ResourceDirectory();
        redi.read(bi);
        if(redi.subdirectories[0].directory.subdirectories[0].directory.version !== "0.0") {
            throw redi.subdirectories[0].directory.subdirectories[0].directory.version;
        }
    }
    test_ResourceDirectory_read_sampleExe.read_subdirectories_0_directory_subdirectories_0_directory_version_00 = read_subdirectories_0_directory_subdirectories_0_directory_version_00;
    function read_subdirectories_0_directory_subdirectories_0_directory_subdirectories_length_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);
        var redi = new pe.unmanaged.ResourceDirectory();
        redi.read(bi);
        if(redi.subdirectories[0].directory.subdirectories[0].directory.subdirectories.length !== 0) {
            throw redi.subdirectories[0].directory.subdirectories[0].directory.subdirectories.length;
        }
    }
    test_ResourceDirectory_read_sampleExe.read_subdirectories_0_directory_subdirectories_0_directory_subdirectories_length_0 = read_subdirectories_0_directory_subdirectories_0_directory_subdirectories_length_0;
    function read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_length_1() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);
        var redi = new pe.unmanaged.ResourceDirectory();
        redi.read(bi);
        if(redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries.length !== 1) {
            throw redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries.length;
        }
    }
    test_ResourceDirectory_read_sampleExe.read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_length_1 = read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_length_1;
    function read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_0_name_null() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);
        var redi = new pe.unmanaged.ResourceDirectory();
        redi.read(bi);
        if(redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries[0].name !== null) {
            throw redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries[0].name;
        }
    }
    test_ResourceDirectory_read_sampleExe.read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_0_name_null = read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_0_name_null;
    function read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_0_integerId_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);
        var redi = new pe.unmanaged.ResourceDirectory();
        redi.read(bi);
        if(redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries[0].integerId !== 0) {
            throw redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries[0].integerId;
        }
    }
    test_ResourceDirectory_read_sampleExe.read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_0_integerId_0 = read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_0_integerId_0;
    function read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_0_dataRva_16472() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);
        var redi = new pe.unmanaged.ResourceDirectory();
        redi.read(bi);
        if(redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries[0].dataRva !== 16472) {
            throw redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries[0].dataRva;
        }
    }
    test_ResourceDirectory_read_sampleExe.read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_0_dataRva_16472 = read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_0_dataRva_16472;
    function read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_0_size_580() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);
        var redi = new pe.unmanaged.ResourceDirectory();
        redi.read(bi);
        if(redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries[0].size !== 580) {
            throw redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries[0].size;
        }
    }
    test_ResourceDirectory_read_sampleExe.read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_0_size_580 = read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_0_size_580;
    function read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_0_codepage_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);
        var redi = new pe.unmanaged.ResourceDirectory();
        redi.read(bi);
        if(redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries[0].codepage !== 0) {
            throw redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries[0].codepage;
        }
    }
    test_ResourceDirectory_read_sampleExe.read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_0_codepage_0 = read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_0_codepage_0;
    function read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_0_reserved_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Resources].address);
        var redi = new pe.unmanaged.ResourceDirectory();
        redi.read(bi);
        if(redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries[0].reserved !== 0) {
            throw redi.subdirectories[0].directory.subdirectories[0].directory.dataEntries[0].reserved;
        }
    }
    test_ResourceDirectory_read_sampleExe.read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_0_reserved_0 = read_subdirectories_0_directory_subdirectories_0_directory_dataEntries_0_reserved_0;
})(test_ResourceDirectory_read_sampleExe || (test_ResourceDirectory_read_sampleExe = {}));
var test_ClrDirectory_old;
(function (test_ClrDirectory_old) {
    function constructor_succeeds() {
        var cdi = new pe.managed.ClrDirectory();
    }
    test_ClrDirectory_old.constructor_succeeds = constructor_succeeds;
    function cb_default_0() {
        var cdi = new pe.managed.ClrDirectory();
        if(cdi.cb !== 0) {
            throw cdi.cb;
        }
    }
    test_ClrDirectory_old.cb_default_0 = cb_default_0;
    function runtimeVersion_default_emptyString() {
        var cdi = new pe.managed.ClrDirectory();
        if(cdi.runtimeVersion !== "") {
            throw cdi.runtimeVersion;
        }
    }
    test_ClrDirectory_old.runtimeVersion_default_emptyString = runtimeVersion_default_emptyString;
    function imageFlags_default_0() {
        var cdi = new pe.managed.ClrDirectory();
        if(cdi.imageFlags !== 0) {
            throw cdi.imageFlags;
        }
    }
    test_ClrDirectory_old.imageFlags_default_0 = imageFlags_default_0;
    function metadataDir_default_null() {
        var cdi = new pe.managed.ClrDirectory();
        if(cdi.metadataDir !== null) {
            throw cdi.metadataDir;
        }
    }
    test_ClrDirectory_old.metadataDir_default_null = metadataDir_default_null;
    function entryPointToken_default_0() {
        var cdi = new pe.managed.ClrDirectory();
        if(cdi.entryPointToken !== 0) {
            throw cdi.entryPointToken;
        }
    }
    test_ClrDirectory_old.entryPointToken_default_0 = entryPointToken_default_0;
    function resourcesDir_default_null() {
        var cdi = new pe.managed.ClrDirectory();
        if(cdi.resourcesDir !== null) {
            throw cdi.resourcesDir;
        }
    }
    test_ClrDirectory_old.resourcesDir_default_null = resourcesDir_default_null;
    function strongNameSignatureDir_default_null() {
        var cdi = new pe.managed.ClrDirectory();
        if(cdi.strongNameSignatureDir !== null) {
            throw cdi.strongNameSignatureDir;
        }
    }
    test_ClrDirectory_old.strongNameSignatureDir_default_null = strongNameSignatureDir_default_null;
    function codeManagerTableDir_default_null() {
        var cdi = new pe.managed.ClrDirectory();
        if(cdi.codeManagerTableDir !== null) {
            throw cdi.codeManagerTableDir;
        }
    }
    test_ClrDirectory_old.codeManagerTableDir_default_null = codeManagerTableDir_default_null;
    function vtableFixupsDir_default_null() {
        var cdi = new pe.managed.ClrDirectory();
        if(cdi.vtableFixupsDir !== null) {
            throw cdi.vtableFixupsDir;
        }
    }
    test_ClrDirectory_old.vtableFixupsDir_default_null = vtableFixupsDir_default_null;
    function exportAddressTableJumpsDir_default_null() {
        var cdi = new pe.managed.ClrDirectory();
        if(cdi.exportAddressTableJumpsDir !== null) {
            throw cdi.exportAddressTableJumpsDir;
        }
    }
    test_ClrDirectory_old.exportAddressTableJumpsDir_default_null = exportAddressTableJumpsDir_default_null;
    function managedNativeHeaderDir_default_null() {
        var cdi = new pe.managed.ClrDirectory();
        if(cdi.managedNativeHeaderDir !== null) {
            throw cdi.managedNativeHeaderDir;
        }
    }
    test_ClrDirectory_old.managedNativeHeaderDir_default_null = managedNativeHeaderDir_default_null;
})(test_ClrDirectory_old || (test_ClrDirectory_old = {}));
var test_ClrDirectory_read_sampleExe;
(function (test_ClrDirectory_read_sampleExe) {
    function read_succeeds() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
    }
    test_ClrDirectory_read_sampleExe.read_succeeds = read_succeeds;
    function cb_72() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        if(cdi.cb !== 72) {
            throw cdi.cb;
        }
    }
    test_ClrDirectory_read_sampleExe.cb_72 = cb_72;
    function runtimeVersion_25() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        if(cdi.runtimeVersion !== "2.5") {
            throw cdi.runtimeVersion;
        }
    }
    test_ClrDirectory_read_sampleExe.runtimeVersion_25 = runtimeVersion_25;
    function imageFlags_ILOnly() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        if(cdi.imageFlags !== pe.managed.ClrImageFlags.ILOnly) {
            throw cdi.imageFlags;
        }
    }
    test_ClrDirectory_read_sampleExe.imageFlags_ILOnly = imageFlags_ILOnly;
    function metadataDir_toString_2068_27Ch() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        if(cdi.metadataDir + "" !== "2068:27Ch") {
            throw cdi.metadataDir;
        }
    }
    test_ClrDirectory_read_sampleExe.metadataDir_toString_2068_27Ch = metadataDir_toString_2068_27Ch;
    function entryPointToken_100663297() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        if(cdi.entryPointToken !== 100663297) {
            throw cdi.entryPointToken;
        }
    }
    test_ClrDirectory_read_sampleExe.entryPointToken_100663297 = entryPointToken_100663297;
    function resourcesDir_toString_00h() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        if(cdi.resourcesDir + "" !== "0:0h") {
            throw cdi.resourcesDir;
        }
    }
    test_ClrDirectory_read_sampleExe.resourcesDir_toString_00h = resourcesDir_toString_00h;
    function strongNameSignatureDir_toString_00h() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        if(cdi.strongNameSignatureDir + "" !== "0:0h") {
            throw cdi.strongNameSignatureDir;
        }
    }
    test_ClrDirectory_read_sampleExe.strongNameSignatureDir_toString_00h = strongNameSignatureDir_toString_00h;
    function codeManagerTableDir_toString_00h() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        if(cdi.codeManagerTableDir + "" !== "0:0h") {
            throw cdi.codeManagerTableDir;
        }
    }
    test_ClrDirectory_read_sampleExe.codeManagerTableDir_toString_00h = codeManagerTableDir_toString_00h;
    function vtableFixupsDir_toString_00h() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        if(cdi.vtableFixupsDir + "" !== "0:0h") {
            throw cdi.vtableFixupsDir;
        }
    }
    test_ClrDirectory_read_sampleExe.vtableFixupsDir_toString_00h = vtableFixupsDir_toString_00h;
    function exportAddressTableJumpsDir_toString_00h() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        if(cdi.exportAddressTableJumpsDir + "" !== "0:0h") {
            throw cdi.exportAddressTableJumpsDir;
        }
    }
    test_ClrDirectory_read_sampleExe.exportAddressTableJumpsDir_toString_00h = exportAddressTableJumpsDir_toString_00h;
    function managedNativeHeaderDir_toString_00h() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        if(cdi.managedNativeHeaderDir + "" !== "0:0h") {
            throw cdi.managedNativeHeaderDir;
        }
    }
    test_ClrDirectory_read_sampleExe.managedNativeHeaderDir_toString_00h = managedNativeHeaderDir_toString_00h;
})(test_ClrDirectory_read_sampleExe || (test_ClrDirectory_read_sampleExe = {}));
var test_ClrDirectory_read_sample64Exe;
(function (test_ClrDirectory_read_sample64Exe) {
    function read_succeeds() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
    }
    test_ClrDirectory_read_sample64Exe.read_succeeds = read_succeeds;
    function cb_72() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        if(cdi.cb !== 72) {
            throw cdi.cb;
        }
    }
    test_ClrDirectory_read_sample64Exe.cb_72 = cb_72;
    function runtimeVersion_25() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        if(cdi.runtimeVersion !== "2.5") {
            throw cdi.runtimeVersion;
        }
    }
    test_ClrDirectory_read_sample64Exe.runtimeVersion_25 = runtimeVersion_25;
    function imageFlags_ILOnly() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        if(cdi.imageFlags !== pe.managed.ClrImageFlags.ILOnly) {
            throw cdi.imageFlags;
        }
    }
    test_ClrDirectory_read_sample64Exe.imageFlags_ILOnly = imageFlags_ILOnly;
    function metadataDir_toString_2068_280h() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        if(cdi.metadataDir + "" !== "2068:280h") {
            throw cdi.metadataDir;
        }
    }
    test_ClrDirectory_read_sample64Exe.metadataDir_toString_2068_280h = metadataDir_toString_2068_280h;
    function entryPointToken_100663297() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        if(cdi.entryPointToken !== 100663297) {
            throw cdi.entryPointToken;
        }
    }
    test_ClrDirectory_read_sample64Exe.entryPointToken_100663297 = entryPointToken_100663297;
    function resourcesDir_toString_00h() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        if(cdi.resourcesDir + "" !== "0:0h") {
            throw cdi.resourcesDir;
        }
    }
    test_ClrDirectory_read_sample64Exe.resourcesDir_toString_00h = resourcesDir_toString_00h;
    function strongNameSignatureDir_toString_00h() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        if(cdi.strongNameSignatureDir + "" !== "0:0h") {
            throw cdi.strongNameSignatureDir;
        }
    }
    test_ClrDirectory_read_sample64Exe.strongNameSignatureDir_toString_00h = strongNameSignatureDir_toString_00h;
    function codeManagerTableDir_toString_00h() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        if(cdi.codeManagerTableDir + "" !== "0:0h") {
            throw cdi.codeManagerTableDir;
        }
    }
    test_ClrDirectory_read_sample64Exe.codeManagerTableDir_toString_00h = codeManagerTableDir_toString_00h;
    function vtableFixupsDir_toString_00h() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        if(cdi.vtableFixupsDir + "" !== "0:0h") {
            throw cdi.vtableFixupsDir;
        }
    }
    test_ClrDirectory_read_sample64Exe.vtableFixupsDir_toString_00h = vtableFixupsDir_toString_00h;
    function exportAddressTableJumpsDir_toString_00h() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        if(cdi.exportAddressTableJumpsDir + "" !== "0:0h") {
            throw cdi.exportAddressTableJumpsDir;
        }
    }
    test_ClrDirectory_read_sample64Exe.exportAddressTableJumpsDir_toString_00h = exportAddressTableJumpsDir_toString_00h;
    function managedNativeHeaderDir_toString_00h() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        if(cdi.managedNativeHeaderDir + "" !== "0:0h") {
            throw cdi.managedNativeHeaderDir;
        }
    }
    test_ClrDirectory_read_sample64Exe.managedNativeHeaderDir_toString_00h = managedNativeHeaderDir_toString_00h;
})(test_ClrDirectory_read_sample64Exe || (test_ClrDirectory_read_sample64Exe = {}));
var test_ClrMetadata;
(function (test_ClrMetadata) {
    function constructor_succeeds() {
        var cdi = new pe.managed.ClrMetadata();
    }
    test_ClrMetadata.constructor_succeeds = constructor_succeeds;
    function mdSignature_default_Signature() {
        var cme = new pe.managed.ClrMetadata();
        if(cme.mdSignature !== pe.managed.ClrMetadataSignature.Signature) {
            throw cme.mdSignature;
        }
    }
    test_ClrMetadata.mdSignature_default_Signature = mdSignature_default_Signature;
    function metadataVersion_default_emptyString() {
        var cme = new pe.managed.ClrMetadata();
        if(cme.metadataVersion !== "") {
            throw cme.metadataVersion;
        }
    }
    test_ClrMetadata.metadataVersion_default_emptyString = metadataVersion_default_emptyString;
    function runtimeVersion_default_emptyString() {
        var cme = new pe.managed.ClrMetadata();
        if(cme.runtimeVersion !== "") {
            throw cme.runtimeVersion;
        }
    }
    test_ClrMetadata.runtimeVersion_default_emptyString = runtimeVersion_default_emptyString;
    function mdReserved_default_0() {
        var cme = new pe.managed.ClrMetadata();
        if(cme.mdReserved !== 0) {
            throw cme.mdReserved;
        }
    }
    test_ClrMetadata.mdReserved_default_0 = mdReserved_default_0;
    function mdFlags_default_0() {
        var cme = new pe.managed.ClrMetadata();
        if(cme.mdFlags !== 0) {
            throw cme.mdFlags;
        }
    }
    test_ClrMetadata.mdFlags_default_0 = mdFlags_default_0;
    function streamCount_default_0() {
        var cme = new pe.managed.ClrMetadata();
        if(cme.streamCount !== 0) {
            throw cme.streamCount;
        }
    }
    test_ClrMetadata.streamCount_default_0 = streamCount_default_0;
})(test_ClrMetadata || (test_ClrMetadata = {}));
var test_ClrMetadata_read_sampleExe;
(function (test_ClrMetadata_read_sampleExe) {
    function read_succeeds() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
    }
    test_ClrMetadata_read_sampleExe.read_succeeds = read_succeeds;
    function mdSignature_Signature() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        if(cme.mdSignature !== pe.managed.ClrMetadataSignature.Signature) {
            throw cme.mdSignature;
        }
    }
    test_ClrMetadata_read_sampleExe.mdSignature_Signature = mdSignature_Signature;
    function metadataVersion_11() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        if(cme.metadataVersion !== "1.1") {
            throw cme.metadataVersion;
        }
    }
    test_ClrMetadata_read_sampleExe.metadataVersion_11 = metadataVersion_11;
    function mdReserved_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        if(cme.mdReserved !== 0) {
            throw cme.mdReserved;
        }
    }
    test_ClrMetadata_read_sampleExe.mdReserved_0 = mdReserved_0;
    function runtimeVersion_v2_0_50727() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        if(cme.runtimeVersion !== "v2.0.50727") {
            throw cme.runtimeVersion;
        }
    }
    test_ClrMetadata_read_sampleExe.runtimeVersion_v2_0_50727 = runtimeVersion_v2_0_50727;
    function mdFlags_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        if(cme.mdFlags !== 0) {
            throw cme.mdFlags;
        }
    }
    test_ClrMetadata_read_sampleExe.mdFlags_0 = mdFlags_0;
    function streamCount_5() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        if(cme.streamCount !== 5) {
            throw cme.streamCount;
        }
    }
    test_ClrMetadata_read_sampleExe.streamCount_5 = streamCount_5;
})(test_ClrMetadata_read_sampleExe || (test_ClrMetadata_read_sampleExe = {}));
var test_ClrMetadata_read_sample64Exe;
(function (test_ClrMetadata_read_sample64Exe) {
    function read_succeeds() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
    }
    test_ClrMetadata_read_sample64Exe.read_succeeds = read_succeeds;
    function mdSignature_Signature() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        if(cme.mdSignature !== pe.managed.ClrMetadataSignature.Signature) {
            throw cme.mdSignature;
        }
    }
    test_ClrMetadata_read_sample64Exe.mdSignature_Signature = mdSignature_Signature;
    function metadataVersion_11() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        if(cme.metadataVersion !== "1.1") {
            throw cme.metadataVersion;
        }
    }
    test_ClrMetadata_read_sample64Exe.metadataVersion_11 = metadataVersion_11;
    function mdReserved_0() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        if(cme.mdReserved !== 0) {
            throw cme.mdReserved;
        }
    }
    test_ClrMetadata_read_sample64Exe.mdReserved_0 = mdReserved_0;
    function runtimeVersion_v4_0_30319() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        if(cme.runtimeVersion !== "v4.0.30319") {
            throw cme.runtimeVersion;
        }
    }
    test_ClrMetadata_read_sample64Exe.runtimeVersion_v4_0_30319 = runtimeVersion_v4_0_30319;
    function mdFlags_0() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        if(cme.mdFlags !== 0) {
            throw cme.mdFlags;
        }
    }
    test_ClrMetadata_read_sample64Exe.mdFlags_0 = mdFlags_0;
    function streamCount_5() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        if(cme.streamCount !== 5) {
            throw cme.streamCount;
        }
    }
    test_ClrMetadata_read_sample64Exe.streamCount_5 = streamCount_5;
})(test_ClrMetadata_read_sample64Exe || (test_ClrMetadata_read_sample64Exe = {}));
var test_MetadataStreams_read_sampleExe;
(function (test_MetadataStreams_read_sampleExe) {
    function read_succeeds() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
    }
    test_MetadataStreams_read_sampleExe.read_succeeds = read_succeeds;
    function read_guids_length_1() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
        if(mes.guids.length !== 1) {
            throw mes.guids.length;
        }
    }
    test_MetadataStreams_read_sampleExe.read_guids_length_1 = read_guids_length_1;
    function read_guids_0_0d9cc7924913ca5a188f769e27c2bc72() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
        if(mes.guids[0] !== "{0d9cc7924913ca5a188f769e27c2bc72}") {
            throw mes.guids[0];
        }
    }
    test_MetadataStreams_read_sampleExe.read_guids_0_0d9cc7924913ca5a188f769e27c2bc72 = read_guids_0_0d9cc7924913ca5a188f769e27c2bc72;
    function read_strings_toString_21B8_B8h() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
        if(mes.strings + "" !== "21B8:B8h") {
            throw mes.strings;
        }
    }
    test_MetadataStreams_read_sampleExe.read_strings_toString_21B8_B8h = read_strings_toString_21B8_B8h;
    function read_blobs_toString_22A0_44h() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
        if(mes.blobs + "" !== "22A0:44h") {
            throw mes.blobs;
        }
    }
    test_MetadataStreams_read_sampleExe.read_blobs_toString_22A0_44h = read_blobs_toString_22A0_44h;
    function read_tables_toString_20D4_E4h() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
        if(mes.tables + "" !== "20D4:E4h") {
            throw mes.tables;
        }
    }
    test_MetadataStreams_read_sampleExe.read_tables_toString_20D4_E4h = read_tables_toString_20D4_E4h;
})(test_MetadataStreams_read_sampleExe || (test_MetadataStreams_read_sampleExe = {}));
var test_MetadataStreams_read_sample64Exe;
(function (test_MetadataStreams_read_sample64Exe) {
    function read_succeeds() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
    }
    test_MetadataStreams_read_sample64Exe.read_succeeds = read_succeeds;
    function read_guids_length_1() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
        if(mes.guids.length !== 1) {
            throw mes.guids.length;
        }
    }
    test_MetadataStreams_read_sample64Exe.read_guids_length_1 = read_guids_length_1;
    function read_guids_0_6147adca4753401f7faf138abeb52b54() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
        if(mes.guids[0] !== "{6147adca4753401f7faf138abeb52b54}") {
            throw mes.guids[0];
        }
    }
    test_MetadataStreams_read_sample64Exe.read_guids_0_6147adca4753401f7faf138abeb52b54 = read_guids_0_6147adca4753401f7faf138abeb52b54;
    function read_strings_toString_21B8_BCh() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
        if(mes.strings + "" !== "21B8:BCh") {
            throw mes.strings;
        }
    }
    test_MetadataStreams_read_sample64Exe.read_strings_toString_21B8_BCh = read_strings_toString_21B8_BCh;
    function read_blobs_toString_22A4_44h() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
        if(mes.blobs + "" !== "22A4:44h") {
            throw mes.blobs;
        }
    }
    test_MetadataStreams_read_sample64Exe.read_blobs_toString_22A4_44h = read_blobs_toString_22A4_44h;
    function read_tables_toString_20D4_E4h() {
        var bi = new pe.io.BufferReader(sample64Exe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
        if(mes.tables + "" !== "20D4:E4h") {
            throw mes.tables;
        }
    }
    test_MetadataStreams_read_sample64Exe.read_tables_toString_20D4_E4h = read_tables_toString_20D4_E4h;
})(test_MetadataStreams_read_sample64Exe || (test_MetadataStreams_read_sample64Exe = {}));
var test_TableStream_read_sampleExe;
(function (test_TableStream_read_sampleExe) {
    function read_succeeds() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
        bi.setVirtualOffset(mes.tables.address);
        var tas = new pe.managed.TableStream();
        tas.read(bi, mes);
    }
    test_TableStream_read_sampleExe.read_succeeds = read_succeeds;
    function modules_length_1() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
        bi.setVirtualOffset(mes.tables.address);
        var tas = new pe.managed.TableStream();
        tas.read(bi, mes);
        if(tas.tables[pe.managed.TableKind.ModuleDefinition].length !== 1) {
            throw tas.tables[pe.managed.TableKind.ModuleDefinition].length;
        }
    }
    test_TableStream_read_sampleExe.modules_length_1 = modules_length_1;
    function modules_0_name_sampleExe() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
        bi.setVirtualOffset(mes.tables.address);
        var tas = new pe.managed.TableStream();
        tas.read(bi, mes);
        var _module = tas.tables[pe.managed.TableKind.ModuleDefinition][0];
        if(_module.name !== "sample.exe") {
            throw _module.name;
        }
    }
    test_TableStream_read_sampleExe.modules_0_name_sampleExe = modules_0_name_sampleExe;
    function modules_0_generation_0() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
        bi.setVirtualOffset(mes.tables.address);
        var tas = new pe.managed.TableStream();
        tas.read(bi, mes);
        var _module = tas.tables[pe.managed.TableKind.ModuleDefinition][0];
        if(_module.generation !== 0) {
            throw _module.generation;
        }
    }
    test_TableStream_read_sampleExe.modules_0_generation_0 = modules_0_generation_0;
    function modules_0_mvid_0d9cc7924913ca5a188f769e27c2bc72() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
        bi.setVirtualOffset(mes.tables.address);
        var tas = new pe.managed.TableStream();
        tas.read(bi, mes);
        var _module = tas.tables[pe.managed.TableKind.ModuleDefinition][0];
        if(_module.mvid !== "{0d9cc7924913ca5a188f769e27c2bc72}") {
            throw _module.mvid;
        }
    }
    test_TableStream_read_sampleExe.modules_0_mvid_0d9cc7924913ca5a188f769e27c2bc72 = modules_0_mvid_0d9cc7924913ca5a188f769e27c2bc72;
    function modules_0_encId_null() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
        bi.setVirtualOffset(mes.tables.address);
        var tas = new pe.managed.TableStream();
        tas.read(bi, mes);
        var _module = tas.tables[pe.managed.TableKind.ModuleDefinition][0];
        if(_module.encId !== null) {
            throw _module.encId;
        }
    }
    test_TableStream_read_sampleExe.modules_0_encId_null = modules_0_encId_null;
    function modules_0_encBaseId_null() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
        bi.setVirtualOffset(mes.tables.address);
        var tas = new pe.managed.TableStream();
        tas.read(bi, mes);
        var _module = tas.tables[pe.managed.TableKind.ModuleDefinition][0];
        if(_module.encBaseId !== null) {
            throw _module.encBaseId;
        }
    }
    test_TableStream_read_sampleExe.modules_0_encBaseId_null = modules_0_encBaseId_null;
    function typeRefs_length_4() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
        bi.setVirtualOffset(mes.tables.address);
        var tas = new pe.managed.TableStream();
        tas.read(bi, mes);
        var typeRefs = tas.tables[pe.managed.TableKind.ExternalType];
        if(typeRefs.length !== 4) {
            throw typeRefs.length;
        }
    }
    test_TableStream_read_sampleExe.typeRefs_length_4 = typeRefs_length_4;
})(test_TableStream_read_sampleExe || (test_TableStream_read_sampleExe = {}));
var test_TableStream_read_monoCorlibDll;
(function (test_TableStream_read_monoCorlibDll) {
    function read_succeeds() {
        var bi = new pe.io.BufferReader(monoCorlib);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
        bi.setVirtualOffset(mes.tables.address);
        var tas = new pe.managed.TableStream();
        tas.read(bi, mes);
    }
    test_TableStream_read_monoCorlibDll.read_succeeds = read_succeeds;
    function modules_length_1() {
        var bi = new pe.io.BufferReader(monoCorlib);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
        bi.setVirtualOffset(mes.tables.address);
        var tas = new pe.managed.TableStream();
        tas.read(bi, mes);
        if(tas.tables[pe.managed.TableKind.ModuleDefinition].length !== 1) {
            throw tas.tables[pe.managed.TableKind.ModuleDefinition].length;
        }
    }
    test_TableStream_read_monoCorlibDll.modules_length_1 = modules_length_1;
    function modules_0_name_mscorlibDll() {
        var bi = new pe.io.BufferReader(monoCorlib);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
        bi.setVirtualOffset(mes.tables.address);
        var tas = new pe.managed.TableStream();
        tas.read(bi, mes);
        var _module = tas.tables[pe.managed.TableKind.ModuleDefinition][0];
        if(_module.name !== "mscorlib.dll") {
            throw _module.name;
        }
    }
    test_TableStream_read_monoCorlibDll.modules_0_name_mscorlibDll = modules_0_name_mscorlibDll;
    function modules_0_generation_0() {
        var bi = new pe.io.BufferReader(monoCorlib);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
        bi.setVirtualOffset(mes.tables.address);
        var tas = new pe.managed.TableStream();
        tas.read(bi, mes);
        var _module = tas.tables[pe.managed.TableKind.ModuleDefinition][0];
        if(_module.generation !== 0) {
            throw _module.generation;
        }
    }
    test_TableStream_read_monoCorlibDll.modules_0_generation_0 = modules_0_generation_0;
    function modules_0_mvid_5f771c4d459bd228469487b532184ce5() {
        var bi = new pe.io.BufferReader(monoCorlib);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
        bi.setVirtualOffset(mes.tables.address);
        var tas = new pe.managed.TableStream();
        tas.read(bi, mes);
        var _module = tas.tables[pe.managed.TableKind.ModuleDefinition][0];
        if(_module.mvid !== "{5f771c4d459bd228469487b532184ce5}") {
            throw _module.mvid;
        }
    }
    test_TableStream_read_monoCorlibDll.modules_0_mvid_5f771c4d459bd228469487b532184ce5 = modules_0_mvid_5f771c4d459bd228469487b532184ce5;
    function modules_0_encId_null() {
        var bi = new pe.io.BufferReader(monoCorlib);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
        bi.setVirtualOffset(mes.tables.address);
        var tas = new pe.managed.TableStream();
        tas.read(bi, mes);
        var _module = tas.tables[pe.managed.TableKind.ModuleDefinition][0];
        if(_module.encId !== null) {
            throw _module.encId;
        }
    }
    test_TableStream_read_monoCorlibDll.modules_0_encId_null = modules_0_encId_null;
    function modules_0_encBaseId_null() {
        var bi = new pe.io.BufferReader(monoCorlib);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
        bi.setVirtualOffset(mes.tables.address);
        var tas = new pe.managed.TableStream();
        tas.read(bi, mes);
        var _module = tas.tables[pe.managed.TableKind.ModuleDefinition][0];
        if(_module.encBaseId !== null) {
            throw _module.encBaseId;
        }
    }
    test_TableStream_read_monoCorlibDll.modules_0_encBaseId_null = modules_0_encBaseId_null;
    function typeRefs_undefined() {
        var bi = new pe.io.BufferReader(monoCorlib);
        var pef = new pe.headers.PEFileHeaders();
        pef.read(bi);
        bi.sections = pef.sectionHeaders;
        bi.setVirtualOffset(pef.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);
        var cdi = new pe.managed.ClrDirectory();
        cdi.read(bi);
        bi.setVirtualOffset(cdi.metadataDir.address);
        var cme = new pe.managed.ClrMetadata();
        cme.read(bi);
        var mes = new pe.managed.MetadataStreams();
        mes.read(cdi.metadataDir.address, cme.streamCount, bi);
        bi.setVirtualOffset(mes.tables.address);
        var tas = new pe.managed.TableStream();
        tas.read(bi, mes);
        var typeRefs = tas.tables[pe.managed.TableKind.ExternalType];
        if(typeof (typeRefs) !== "undefined") {
            throw typeof (typeRefs) + " " + typeRefs;
        }
    }
    test_TableStream_read_monoCorlibDll.typeRefs_undefined = typeRefs_undefined;
})(test_TableStream_read_monoCorlibDll || (test_TableStream_read_monoCorlibDll = {}));
var test_AssemblyReader_sampleExe_old;
(function (test_AssemblyReader_sampleExe_old) {
    function read_succeeds() {
        var bi = new pe.io.BufferReader(sampleExe.bytes);
        var asm = new pe.managed.AssemblyDefinition();
        asm.read(bi);
    }
    test_AssemblyReader_sampleExe_old.read_succeeds = read_succeeds;
})(test_AssemblyReader_sampleExe_old || (test_AssemblyReader_sampleExe_old = {}));
var test_AssemblyReader_monoCorlibDll;
(function (test_AssemblyReader_monoCorlibDll) {
    function read_succeeds() {
        var bi = new pe.io.BufferReader(monoCorlib);
        var asm = new pe.managed.AssemblyDefinition();
        asm.read(bi);
    }
    test_AssemblyReader_monoCorlibDll.read_succeeds = read_succeeds;
})(test_AssemblyReader_monoCorlibDll || (test_AssemblyReader_monoCorlibDll = {}));
var test_BufferReader;
(function (test_BufferReader) {
    var global = (function () {
        return this;
    })();
    var ArrayBuffer = "ArrayBuffer" in global ? global.ArrayBuffer : Array;
    function constructor_WithArrayBuffer0_succeeds() {
        var bi = new pe.io.BufferReader(new ArrayBuffer(0));
    }
    test_BufferReader.constructor_WithArrayBuffer0_succeeds = constructor_WithArrayBuffer0_succeeds;
    function constructor_WithArrayBuffer10_succeeds() {
        var bi = new pe.io.BufferReader(new ArrayBuffer(10));
    }
    test_BufferReader.constructor_WithArrayBuffer10_succeeds = constructor_WithArrayBuffer10_succeeds;
    function with123_readByte_1() {
        var buf = new ArrayBuffer(3);
        var vi = new DataView(buf);
        vi.setUint8(0, 1);
        vi.setUint8(1, 2);
        vi.setUint8(2, 3);
        var bi = new pe.io.BufferReader(buf);
        var b = bi.readByte();
        if(b !== 1) {
            throw b;
        }
    }
    test_BufferReader.with123_readByte_1 = with123_readByte_1;
    function with123_readShort_0x0201() {
        var buf = new ArrayBuffer(3);
        var vi = new DataView(buf);
        vi.setUint8(0, 1);
        vi.setUint8(1, 2);
        vi.setUint8(2, 3);
        var bi = new pe.io.BufferReader(buf);
        var b = bi.readShort();
        if(b !== 513) {
            throw "0x" + b.toString(16);
        }
    }
    test_BufferReader.with123_readShort_0x0201 = with123_readShort_0x0201;
    function with1234_readInt_0x04030201() {
        var buf = new ArrayBuffer(4);
        var vi = new DataView(buf);
        vi.setUint8(0, 1);
        vi.setUint8(1, 2);
        vi.setUint8(2, 3);
        vi.setUint8(3, 4);
        var bi = new pe.io.BufferReader(buf);
        var b = bi.readInt();
        if(b !== 67305985) {
            throw "0x" + b.toString(16);
        }
    }
    test_BufferReader.with1234_readInt_0x04030201 = with1234_readInt_0x04030201;
    function withFEDC_readInt_0x0C0D0E0F() {
        var buf = new ArrayBuffer(4);
        var vi = new DataView(buf);
        vi.setUint8(0, 15);
        vi.setUint8(1, 14);
        vi.setUint8(2, 13);
        vi.setUint8(3, 12);
        var bi = new pe.io.BufferReader(buf);
        var b = bi.readInt();
        if(b !== 202182159) {
            throw "0x" + b.toString(16);
        }
    }
    test_BufferReader.withFEDC_readInt_0x0C0D0E0F = withFEDC_readInt_0x0C0D0E0F;
    function with01_readInt_throws() {
        var buf = new ArrayBuffer(2);
        var vi = new DataView(buf);
        vi.setUint8(0, 15);
        vi.setUint8(1, 14);
        var bi = new pe.io.BufferReader(buf);
        bi.readByte();
        try  {
            var b = bi.readInt();
        } catch (expectedError) {
            return;
        }
        throw "Error expected.";
    }
    test_BufferReader.with01_readInt_throws = with01_readInt_throws;
    function withFEDCBA21_readLong_1020A0BC0D0E0Fh() {
        var buf = new ArrayBuffer(8);
        var vi = new DataView(buf);
        vi.setUint8(0, 15);
        vi.setUint8(1, 14);
        vi.setUint8(2, 13);
        vi.setUint8(3, 12);
        vi.setUint8(4, 11);
        vi.setUint8(5, 10);
        vi.setUint8(6, 2);
        vi.setUint8(7, 1);
        var bi = new pe.io.BufferReader(buf);
        var b = bi.readLong();
        if(b.toString() !== "1020A0BC0D0E0Fh") {
            throw b.toString();
        }
    }
    test_BufferReader.withFEDCBA21_readLong_1020A0BC0D0E0Fh = withFEDCBA21_readLong_1020A0BC0D0E0Fh;
    function with0FEDCBA21_readByte_readLong_1020A0BC0D0E0Fh() {
        var buf = new ArrayBuffer(9);
        var vi = new DataView(buf);
        vi.setUint8(0, 0);
        vi.setUint8(1, 15);
        vi.setUint8(2, 14);
        vi.setUint8(3, 13);
        vi.setUint8(4, 12);
        vi.setUint8(5, 11);
        vi.setUint8(6, 10);
        vi.setUint8(7, 2);
        vi.setUint8(8, 1);
        var bi = new pe.io.BufferReader(buf);
        bi.readByte();
        var b = bi.readLong();
        if(b.toString() !== "1020A0BC0D0E0Fh") {
            throw b.toString();
        }
    }
    test_BufferReader.with0FEDCBA21_readByte_readLong_1020A0BC0D0E0Fh = with0FEDCBA21_readByte_readLong_1020A0BC0D0E0Fh;
    function with01_readByte_readLong_throws() {
        var buf = new ArrayBuffer(2);
        var vi = new DataView(buf);
        vi.setUint8(0, 0);
        vi.setUint8(1, 15);
        var bi = new pe.io.BufferReader(buf);
        bi.readByte();
        try  {
            var b = bi.readLong();
        } catch (expectedError) {
            return;
        }
        throw "Error expected.";
    }
    test_BufferReader.with01_readByte_readLong_throws = with01_readByte_readLong_throws;
    function with0_readZeroFilledAscii_1() {
        var buf = new ArrayBuffer(1);
        var vi = new DataView(buf);
        vi.setUint8(0, 0);
        var bi = new pe.io.BufferReader(buf);
        var b = bi.readZeroFilledAscii(1);
        if(b !== "") {
            throw b;
        }
    }
    test_BufferReader.with0_readZeroFilledAscii_1 = with0_readZeroFilledAscii_1;
    function with0_readZeroFilledAscii_0() {
        var buf = new ArrayBuffer(1);
        var vi = new DataView(buf);
        vi.setUint8(0, 0);
        var bi = new pe.io.BufferReader(buf);
        var b = bi.readZeroFilledAscii(0);
        if(b !== "") {
            throw b;
        }
    }
    test_BufferReader.with0_readZeroFilledAscii_0 = with0_readZeroFilledAscii_0;
    function withA0_readZeroFilledAscii_2() {
        var buf = new ArrayBuffer(2);
        var vi = new DataView(buf);
        vi.setUint8(0, ("A").charCodeAt(0));
        vi.setUint8(1, 0);
        var bi = new pe.io.BufferReader(buf);
        var b = bi.readZeroFilledAscii(2);
        if(b !== "A") {
            throw b;
        }
    }
    test_BufferReader.withA0_readZeroFilledAscii_2 = withA0_readZeroFilledAscii_2;
    function withA0_readZeroFilledAscii_1() {
        var buf = new ArrayBuffer(2);
        var vi = new DataView(buf);
        vi.setUint8(0, ("A").charCodeAt(0));
        vi.setUint8(1, 0);
        var bi = new pe.io.BufferReader(buf);
        var b = bi.readZeroFilledAscii(1);
        if(b !== "A") {
            throw b;
        }
    }
    test_BufferReader.withA0_readZeroFilledAscii_1 = withA0_readZeroFilledAscii_1;
    function withAB0_readByte_readZeroFilledAscii_1() {
        var buf = new ArrayBuffer(3);
        var vi = new DataView(buf);
        vi.setUint8(0, ("A").charCodeAt(0));
        vi.setUint8(1, ("B").charCodeAt(0));
        vi.setUint8(2, 0);
        var bi = new pe.io.BufferReader(buf);
        bi.readByte();
        var b = bi.readZeroFilledAscii(1);
        if(b !== "B") {
            throw b;
        }
    }
    test_BufferReader.withAB0_readByte_readZeroFilledAscii_1 = withAB0_readByte_readZeroFilledAscii_1;
    function withAB0_readByte_readZeroFilledAscii_2() {
        var buf = new ArrayBuffer(3);
        var vi = new DataView(buf);
        vi.setUint8(0, ("A").charCodeAt(0));
        vi.setUint8(1, ("B").charCodeAt(0));
        vi.setUint8(2, 0);
        var bi = new pe.io.BufferReader(buf);
        bi.readByte();
        var b = bi.readZeroFilledAscii(2);
        if(b !== "B") {
            throw b;
        }
    }
    test_BufferReader.withAB0_readByte_readZeroFilledAscii_2 = withAB0_readByte_readZeroFilledAscii_2;
    function withAB0_readByte_readZeroFilledAscii_3_throws() {
        var buf = new ArrayBuffer(3);
        var vi = new DataView(buf);
        vi.setUint8(0, ("A").charCodeAt(0));
        vi.setUint8(1, ("B").charCodeAt(0));
        vi.setUint8(2, 0);
        var bi = new pe.io.BufferReader(buf);
        bi.readByte();
        try  {
            var b = bi.readZeroFilledAscii(3);
        } catch (expectedError) {
            return;
        }
        throw "Error expected.";
    }
    test_BufferReader.withAB0_readByte_readZeroFilledAscii_3_throws = withAB0_readByte_readZeroFilledAscii_3_throws;
    function with0_readAsciiZ_1() {
        var buf = new ArrayBuffer(1);
        var vi = new DataView(buf);
        vi.setUint8(0, 0);
        var bi = new pe.io.BufferReader(buf);
        var b = bi.readAsciiZ(1);
        if(b !== "") {
            throw b;
        }
    }
    test_BufferReader.with0_readAsciiZ_1 = with0_readAsciiZ_1;
    function with0_readAsciiZ_0() {
        var buf = new ArrayBuffer(1);
        var vi = new DataView(buf);
        vi.setUint8(0, 0);
        var bi = new pe.io.BufferReader(buf);
        var b = bi.readAsciiZ(0);
        if(b !== "") {
            throw b;
        }
    }
    test_BufferReader.with0_readAsciiZ_0 = with0_readAsciiZ_0;
    function withA0_readAsciiZ_2() {
        var buf = new ArrayBuffer(2);
        var vi = new DataView(buf);
        vi.setUint8(0, ("A").charCodeAt(0));
        vi.setUint8(1, 0);
        var bi = new pe.io.BufferReader(buf);
        var b = bi.readAsciiZ(2);
        if(b !== "A") {
            throw b;
        }
    }
    test_BufferReader.withA0_readAsciiZ_2 = withA0_readAsciiZ_2;
    function withASpace_readAsciiZ_1() {
        var buf = new ArrayBuffer(2);
        var vi = new DataView(buf);
        vi.setUint8(0, ("A").charCodeAt(0));
        vi.setUint8(1, 32);
        var bi = new pe.io.BufferReader(buf);
        var b = bi.readAsciiZ(1);
        if(b !== "A") {
            throw b;
        }
    }
    test_BufferReader.withASpace_readAsciiZ_1 = withASpace_readAsciiZ_1;
    function withA0_readAsciiZ_1() {
        var buf = new ArrayBuffer(2);
        var vi = new DataView(buf);
        vi.setUint8(0, ("A").charCodeAt(0));
        vi.setUint8(1, 0);
        var bi = new pe.io.BufferReader(buf);
        var b = bi.readAsciiZ(1);
        if(b !== "A") {
            throw b;
        }
    }
    test_BufferReader.withA0_readAsciiZ_1 = withA0_readAsciiZ_1;
    function withAB0_readByte_readAsciiZ_1() {
        var buf = new ArrayBuffer(3);
        var vi = new DataView(buf);
        vi.setUint8(0, ("A").charCodeAt(0));
        vi.setUint8(1, ("B").charCodeAt(0));
        vi.setUint8(2, 0);
        var bi = new pe.io.BufferReader(buf);
        bi.readByte();
        var b = bi.readAsciiZ(1);
        if(b !== "B") {
            throw b;
        }
    }
    test_BufferReader.withAB0_readByte_readAsciiZ_1 = withAB0_readByte_readAsciiZ_1;
    function withAB0_readByte_readAsciiZ_2() {
        var buf = new ArrayBuffer(3);
        var vi = new DataView(buf);
        vi.setUint8(0, ("A").charCodeAt(0));
        vi.setUint8(1, ("B").charCodeAt(0));
        vi.setUint8(2, 0);
        var bi = new pe.io.BufferReader(buf);
        bi.readByte();
        var b = bi.readAsciiZ(2);
        if(b !== "B") {
            throw b;
        }
    }
    test_BufferReader.withAB0_readByte_readAsciiZ_2 = withAB0_readByte_readAsciiZ_2;
    function withAB0_readByte_readAsciiZ_3() {
        var buf = new ArrayBuffer(3);
        var vi = new DataView(buf);
        vi.setUint8(0, ("A").charCodeAt(0));
        vi.setUint8(1, ("B").charCodeAt(0));
        vi.setUint8(2, 0);
        var bi = new pe.io.BufferReader(buf);
        bi.readByte();
        var b = bi.readAsciiZ(3);
        if(b !== "B") {
            throw b;
        }
    }
    test_BufferReader.withAB0_readByte_readAsciiZ_3 = withAB0_readByte_readAsciiZ_3;
    function withABC_readByte_readAsciiZ_3_throws() {
        var buf = new ArrayBuffer(3);
        var vi = new DataView(buf);
        vi.setUint8(0, ("A").charCodeAt(0));
        vi.setUint8(1, ("B").charCodeAt(0));
        vi.setUint8(2, ("C").charCodeAt(0));
        var bi = new pe.io.BufferReader(buf);
        bi.readByte();
        try  {
            var b = bi.readAsciiZ(3);
        } catch (expectedError) {
            return;
        }
        throw "Error expected.";
    }
    test_BufferReader.withABC_readByte_readAsciiZ_3_throws = withABC_readByte_readAsciiZ_3_throws;
    function with0_readUtf8Z_1() {
        var buf = new ArrayBuffer(1);
        var vi = new DataView(buf);
        vi.setUint8(0, 0);
        var bi = new pe.io.BufferReader(buf);
        var b = bi.readUtf8Z(1);
        if(b !== "") {
            throw b;
        }
    }
    test_BufferReader.with0_readUtf8Z_1 = with0_readUtf8Z_1;
    function with0_readUtf8Z_0() {
        var buf = new ArrayBuffer(1);
        var vi = new DataView(buf);
        vi.setUint8(0, 0);
        var bi = new pe.io.BufferReader(buf);
        var b = bi.readUtf8Z(0);
        if(b !== "") {
            throw b;
        }
    }
    test_BufferReader.with0_readUtf8Z_0 = with0_readUtf8Z_0;
    function withA0_readUtf8Z_2() {
        var buf = new ArrayBuffer(2);
        var vi = new DataView(buf);
        vi.setUint8(0, ("A").charCodeAt(0));
        vi.setUint8(1, 0);
        var bi = new pe.io.BufferReader(buf);
        var b = bi.readUtf8Z(2);
        if(b !== "A") {
            throw b;
        }
    }
    test_BufferReader.withA0_readUtf8Z_2 = withA0_readUtf8Z_2;
    function withASpace_readUtf8Z_1() {
        var buf = new ArrayBuffer(2);
        var vi = new DataView(buf);
        vi.setUint8(0, ("A").charCodeAt(0));
        vi.setUint8(1, 32);
        var bi = new pe.io.BufferReader(buf);
        var b = bi.readUtf8Z(1);
        if(b !== "A") {
            throw b;
        }
    }
    test_BufferReader.withASpace_readUtf8Z_1 = withASpace_readUtf8Z_1;
    function withA0_readUtf8Z_1() {
        var buf = new ArrayBuffer(2);
        var vi = new DataView(buf);
        vi.setUint8(0, ("A").charCodeAt(0));
        vi.setUint8(1, 0);
        var bi = new pe.io.BufferReader(buf);
        var b = bi.readUtf8Z(1);
        if(b !== "A") {
            throw b;
        }
    }
    test_BufferReader.withA0_readUtf8Z_1 = withA0_readUtf8Z_1;
    function withAB0_readByte_readUtf8Z_1() {
        var buf = new ArrayBuffer(3);
        var vi = new DataView(buf);
        vi.setUint8(0, ("A").charCodeAt(0));
        vi.setUint8(1, ("B").charCodeAt(0));
        vi.setUint8(2, 0);
        var bi = new pe.io.BufferReader(buf);
        bi.readByte();
        var b = bi.readUtf8Z(1);
        if(b !== "B") {
            throw b;
        }
    }
    test_BufferReader.withAB0_readByte_readUtf8Z_1 = withAB0_readByte_readUtf8Z_1;
    function withAB0_readByte_readUtf8Z_2() {
        var buf = new ArrayBuffer(3);
        var vi = new DataView(buf);
        vi.setUint8(0, ("A").charCodeAt(0));
        vi.setUint8(1, ("B").charCodeAt(0));
        vi.setUint8(2, 0);
        var bi = new pe.io.BufferReader(buf);
        bi.readByte();
        var b = bi.readUtf8Z(2);
        if(b !== "B") {
            throw b;
        }
    }
    test_BufferReader.withAB0_readByte_readUtf8Z_2 = withAB0_readByte_readUtf8Z_2;
    function withAB0_readByte_readUtf8Z_3() {
        var buf = new ArrayBuffer(3);
        var vi = new DataView(buf);
        vi.setUint8(0, ("A").charCodeAt(0));
        vi.setUint8(1, ("B").charCodeAt(0));
        vi.setUint8(2, 0);
        var bi = new pe.io.BufferReader(buf);
        bi.readByte();
        var b = bi.readUtf8Z(3);
        if(b !== "B") {
            throw b;
        }
    }
    test_BufferReader.withAB0_readByte_readUtf8Z_3 = withAB0_readByte_readUtf8Z_3;
    function withABC_readByte_readUtf8Z_3_throws() {
        var buf = new ArrayBuffer(3);
        var vi = new DataView(buf);
        vi.setUint8(0, ("A").charCodeAt(0));
        vi.setUint8(1, ("B").charCodeAt(0));
        vi.setUint8(2, ("C").charCodeAt(0));
        var bi = new pe.io.BufferReader(buf);
        bi.readByte();
        try  {
            var b = bi.readUtf8Z(3);
        } catch (expectedError) {
            return;
        }
        throw "Error expected.";
    }
    test_BufferReader.withABC_readByte_readUtf8Z_3_throws = withABC_readByte_readUtf8Z_3_throws;
    function withChineseMi_readUtf8Z() {
        var buf = new ArrayBuffer(3);
        var vi = new DataView(buf);
        vi.setUint8(0, 230);
        vi.setUint8(1, 156);
        vi.setUint8(2, 170);
        var bi = new pe.io.BufferReader(buf);
        var b = bi.readUtf8Z(3);
        if(b.charCodeAt(0) !== 26410) {
            throw b + " (" + b.charCodeAt(0) + ") expected " + String.fromCharCode(26410) + " (26410)";
        }
    }
    test_BufferReader.withChineseMi_readUtf8Z = withChineseMi_readUtf8Z;
    function withChineseMiSpaceSpace_readUtf8Z() {
        var buf = new ArrayBuffer(5);
        var vi = new DataView(buf);
        vi.setUint8(0, 230);
        vi.setUint8(1, 156);
        vi.setUint8(2, 170);
        vi.setUint8(3, 32);
        vi.setUint8(4, 32);
        var bi = new pe.io.BufferReader(buf);
        var b = bi.readUtf8Z(3);
        if(b.charCodeAt(0) !== 26410) {
            throw b + " (" + b.charCodeAt(0) + ") expected " + String.fromCharCode(26410) + " (26410)";
        }
    }
    test_BufferReader.withChineseMiSpaceSpace_readUtf8Z = withChineseMiSpaceSpace_readUtf8Z;
    function withRussianSch_readUtf8Z() {
        var buf = new ArrayBuffer(2);
        var vi = new DataView(buf);
        vi.setUint8(0, 208);
        vi.setUint8(1, 169);
        var bi = new pe.io.BufferReader(buf);
        var b = bi.readUtf8Z(2);
        if(b.charCodeAt(0) !== 1065) {
            throw b + " (" + b.charCodeAt(0) + ") expected " + String.fromCharCode(1065) + " (1065)";
        }
    }
    test_BufferReader.withRussianSch_readUtf8Z = withRussianSch_readUtf8Z;
    function withRussianSchSpaceSpace_readUtf8Z() {
        var buf = new ArrayBuffer(4);
        var vi = new DataView(buf);
        vi.setUint8(0, 208);
        vi.setUint8(1, 169);
        vi.setUint8(2, 32);
        vi.setUint8(3, 32);
        var bi = new pe.io.BufferReader(buf);
        var b = bi.readUtf8Z(2);
        if(b.charCodeAt(0) !== 1065) {
            throw b + " (" + b.charCodeAt(0) + ") expected " + String.fromCharCode(1065) + " (1065)";
        }
    }
    test_BufferReader.withRussianSchSpaceSpace_readUtf8Z = withRussianSchSpaceSpace_readUtf8Z;
})(test_BufferReader || (test_BufferReader = {}));
var TestRunner;
(function (TestRunner) {
    function collectTests(moduleName, moduleObj) {
        if(!moduleObj) {
            moduleObj = moduleName;
            moduleName = "";
        }
        var testList = [];
        function collectTestsCore(namePrefix, moduleObj, test_prefixOnly) {
            for(var testName in moduleObj) {
                if(moduleObj.hasOwnProperty && !moduleObj.hasOwnProperty(testName)) {
                    continue;
                }
                if(test_prefixOnly) {
                    if(testName.substring(0, "test_".length) !== "test_") {
                        continue;
                    }
                }
                var test = moduleObj[testName];
                if(typeof (test) === "function") {
                    var testName = test.name;
                    if(!testName) {
                        testName = test.toString();
                        testName = testName.substring(0, testName.indexOf("("));
                        testName = testName.replace(/function /g, "");
                    }
                    testList.push(new TestCase(namePrefix + testName, test));
                    continue;
                }
                if(typeof (test) === "object") {
                    collectTestsCore(namePrefix + testName + ".", test, false);
                }
            }
        }
        collectTestsCore(moduleName ? moduleName + "." : "", moduleObj, true);
        return testList;
    }
    function runTest(test, onfinish) {
        var logPrint = function (s) {
            test.logText += (test.logText.length > 0 ? "\n" : "") + s;
        };
        var startTime = new Date().getTime();
        var updateTime = function () {
            var endTime = new Date().getTime();
            test.executionTimeMsec = endTime - startTime;
        };
        try  {
            var ts = {
                ok: function (message) {
                    if(test.success === false) {
                        return;
                    }
                    if(message) {
                        logPrint(message);
                    }
                    test.success = true;
                    updateTime();
                    onfinish();
                },
                fail: function (message) {
                    if(message) {
                        logPrint(message);
                    }
                    test.success = false;
                    updateTime();
                    onfinish();
                },
                log: function (message) {
                    if(message) {
                        logPrint(message);
                    }
                }
            };
            test.testMethod(ts);
        } catch (syncError) {
            logPrint(syncError === null ? "null" : typeof (syncError) === "object" ? (syncError.stack ? syncError.stack : syncError.message ? syncError.message : syncError + "") : syncError === null ? "null" : (syncError + ""));
            test.success = false;
            updateTime();
            onfinish();
            return;
        }
        var openBracketPos = test.testMethod.toString().indexOf("(");
        if(openBracketPos > 0 && test.testMethod.toString().substring(openBracketPos + 1, openBracketPos + 2) === ")") {
            if(test.success === false) {
                return;
            }
            test.success = true;
            updateTime();
            onfinish();
        }
    }
    var TestCase = (function () {
        function TestCase(name, testMethod) {
            this.name = name;
            this.testMethod = testMethod;
            this.success = null;
            this.logText = "";
            this.executionTimeMsec = null;
        }
        TestCase.prototype.toString = function () {
            return this.name + " " + this.executionTimeMsec + "ms" + (this.success ? " OK" : " FAIL") + (this.logText ? " " : "") + (this.logText && this.logText.indexOf("\n") >= 0 ? "\n	" + this.logText.replace(/\n/g, "\n	") : this.logText);
        };
        return TestCase;
    })();
    TestRunner.TestCase = TestCase;    
    function runTests(moduleName, moduleObj, onfinished) {
        if(typeof (moduleName) !== "string") {
            onfinished = moduleObj;
            moduleObj = moduleName;
            moduleName = "";
        }
        var tests = collectTests(moduleName, moduleObj);
        var global = (function () {
            return this;
        })();
        var sysLog;
        if("WScript" in global) {
            sysLog = function (msg) {
                return WScript.Echo(msg);
            };
        } else {
            if("htmlConsole" in global) {
                sysLog = function (msg) {
                    return htmlConsole.log(msg);
                };
            } else {
                sysLog = function (msg) {
                    return console.log(msg);
                };
            }
        }
        sysLog("Running " + tests.length + " tests.managed..");
        function defaultOnFinished(tests) {
            var failedTests = [];
            var totalRunningTime = 0;
            for(var i = 0; i < tests.length; i++) {
                if(tests[i].success === false) {
                    failedTests.push(tests[i]);
                }
                totalRunningTime += tests[i].executionTimeMsec;
            }
            if(failedTests.length > 0) {
                sysLog(failedTests.length + " tests failed out of " + tests.length + " in " + (totalRunningTime / 1000) + " sec:");
                for(var i = 0; i < failedTests.length; i++) {
                    sysLog("  " + failedTests[i].name);
                }
            } else {
                sysLog("All " + tests.length + " tests succeeded in " + (totalRunningTime / 1000) + " sec.");
            }
        }
        var iTest = 0;
        var nextQueued = false;
        function continueNext() {
            nextQueued = true;
        }
        ; ;
        function next() {
            if(iTest >= tests.length) {
                if(onfinished) {
                    onfinished(tests);
                } else {
                    defaultOnFinished(tests);
                }
                return;
            }
            runTest(tests[iTest], function () {
                sysLog(iTest + ". " + tests[iTest]);
                if(!tests[iTest].success) {
                    sysLog("###------###-----###-----###---");
                    sysLog("");
                }
                iTest++;
                continueNext();
            });
        }
        function processMany() {
            var lastAsyncQueue = new Date().getTime();
            var firstTest = false;
            while(nextQueued) {
                if(firstTest) {
                    firstTest = false;
                } else {
                    if("setTimeout" in global) {
                        var now = new Date().getTime();
                        if(now - lastAsyncQueue > 10000) {
                            setTimeout(processMany, 1);
                            return;
                        }
                    }
                }
                nextQueued = false;
                next();
            }
        }
        nextQueued = true;
        processMany();
    }
    TestRunner.runTests = runTests;
})(TestRunner || (TestRunner = {}));
TestRunner.runTests((function () {
    return this;
})());
//@ sourceMappingURL=tests.js.map
