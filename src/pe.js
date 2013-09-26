var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var pe;
(function (pe) {
    (function (io) {
        /**
        * 64-bit integer
        */
        var Long = (function () {
            function Long(lo, hi) {
                this.lo = lo;
                this.hi = hi;
            }
            Long.prototype.toString = function () {
                var result;
                result = this.lo.toString(16);
                if (this.hi != 0) {
                    result = ("0000").substring(result.length) + result;
                    result = this.hi.toString(16) + result;
                }
                result = result.toUpperCase() + "h";
                return result;
            };
            return Long;
        })();
        io.Long = Long;

        /**
        * Address and size of a chunk of memory.
        */
        var AddressRange = (function () {
            function AddressRange(address, size) {
                this.address = address;
                this.size = size;
                if (!this.address)
                    this.address = 0;
                if (!this.size)
                    this.size = 0;
            }
            /**
            * Given an offset within range, calculates the absolute offset.
            * In case of overflow returns -1.
            */
            AddressRange.prototype.mapRelative = function (offsetWithinRange) {
                var result = offsetWithinRange - this.address;
                if (result >= 0 && result < this.size)
                    return result;
                else
                    return -1;
            };

            AddressRange.prototype.toString = function () {
                return this.address.toString(16).toUpperCase() + ":" + this.size.toString(16).toUpperCase() + "h";
            };
            return AddressRange;
        })();
        io.AddressRange = AddressRange;

        /**
        * Address range that's mapped at a virtual address.
        */
        var MappedAddressRange = (function (_super) {
            __extends(MappedAddressRange, _super);
            function MappedAddressRange(address, size, virtualAddress) {
                _super.call(this, address, size);
                this.virtualAddress = virtualAddress;

                if (!this.virtualAddress)
                    this.virtualAddress = 0;
            }
            MappedAddressRange.prototype.toString = function () {
                return this.address.toString(16).toUpperCase() + ":" + this.size.toString(16).toUpperCase() + "@" + this.virtualAddress + "h";
            };
            return MappedAddressRange;
        })(AddressRange);
        io.MappedAddressRange = MappedAddressRange;

        var checkBufferReaderOverrideOnFirstCreation = true;
        var hexUtf;

        var BufferReader = (function () {
            function BufferReader(view) {
                this.offset = 0;
                this.sections = [];
                this._currentSectionIndex = 0;
                if (checkBufferReaderOverrideOnFirstCreation) {
                    // whatever we discover, stick to it, don't repeat it again
                    checkBufferReaderOverrideOnFirstCreation = false;

                    var global = (function () {
                        return this;
                    })();
                    if (!("DataView" in global)) {
                        // the environment doesn't support DataView,
                        // fall back on ArrayBuffer
                        io.BufferReader = ArrayReader;
                        return new ArrayReader(view);
                    }
                }

                if (!view)
                    return;

                if ("getUint8" in view) {
                    this._view = view;
                } else if ("byteLength" in view) {
                    this._view = new DataView(view);
                } else {
                    var arrb = new ArrayBuffer(view.length);
                    this._view = new DataView(arrb);
                    for (var i = 0; i < view.length; i++) {
                        this._view.setUint8(i, view[i]);
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

                for (var i = 0; i < length; i++) {
                    var charCode = this._view.getUint8(this.offset + i);

                    if (charCode == 0)
                        continue;

                    chars.push(String.fromCharCode(charCode));
                }

                this.offset += length;

                return chars.join("");
            };

            BufferReader.prototype.readAsciiZ = function (maxLength) {
                if (typeof maxLength === "undefined") { maxLength = 1024; }
                var chars = [];

                var byteLength = 0;
                while (true) {
                    var nextChar = this._view.getUint8(this.offset + chars.length);
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
            };

            BufferReader.prototype.readUtf8Z = function (maxLength) {
                var buffer = [];
                var isConversionRequired = false;

                for (var i = 0; !maxLength || i < maxLength; i++) {
                    var b = this._view.getUint8(this.offset + i);

                    if (b == 0) {
                        i++;
                        break;
                    }

                    if (!hexUtf) {
                        hexUtf = [];
                        for (var iutf = 0; iutf < 127; iutf++) {
                            hexUtf.push(String.fromCharCode(iutf));
                        }
                        for (var iutf = 127; iutf < 256; iutf++) {
                            hexUtf.push("%" + iutf.toString(16));
                        }
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
            };

            BufferReader.prototype.getVirtualOffset = function () {
                var result = this.tryMapToVirtual(this.offset);
                if (result < 0)
                    throw new Error("Cannot map current position into virtual address space.");
                return result;
            };

            BufferReader.prototype.setVirtualOffset = function (rva) {
                if (this._currentSectionIndex >= 0 && this._currentSectionIndex < this.sections.length) {
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
                    if (relative >= 0 && relative < s.size) {
                        this._currentSectionIndex = i;
                        this.offset = relative + s.address;
                        return;
                    }
                }

                throw new Error("Address 0x" + rva.toString(16).toUpperCase() + " is outside of virtual address space.");
            };

            BufferReader.prototype.tryMapToVirtual = function (offset) {
                if (this._currentSectionIndex >= 0 && this._currentSectionIndex < this.sections.length) {
                    var s = this.sections[this._currentSectionIndex];
                    var relative = offset - s.address;
                    if (relative >= 0 && relative < s.size)
                        return relative + s.virtualAddress;
                }

                for (var i = 0; i < this.sections.length; i++) {
                    var s = this.sections[i];
                    var relative = offset - s.address;
                    if (relative >= 0 && relative < s.size) {
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
                var result = this._array[this.offset] + (this._array[this.offset + 1] << 8) + (this._array[this.offset + 2] << 16) + (this._array[this.offset + 3] * 0x1000000);
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

                for (var i = 0; i < length; i++) {
                    var charCode = this._array[this.offset + i];

                    if (charCode == 0)
                        continue;

                    chars.push(String.fromCharCode(charCode));
                }

                this.offset += length;

                return chars.join("");
            };

            ArrayReader.prototype.readAsciiZ = function (maxLength) {
                if (typeof maxLength === "undefined") { maxLength = 1024; }
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
            };

            ArrayReader.prototype.readUtf8Z = function (maxLength) {
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
                    } else {
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
            };

            ArrayReader.prototype.getVirtualOffset = function () {
                var result = this._tryMapToVirtual(this.offset);
                if (result < 0)
                    throw new Error("Cannot map current position into virtual address space.");
                return result;
            };

            ArrayReader.prototype.setVirtualOffset = function (rva) {
                if (this._currentSectionIndex >= 0 && this._currentSectionIndex < this.sections.length) {
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
                    if (relative >= 0 && relative < s.size) {
                        this._currentSectionIndex = i;
                        this.offset = relative + s.address;
                        return;
                    }
                }

                throw new Error("Address is outside of virtual address space.");
            };

            ArrayReader.prototype._tryMapToVirtual = function (offset) {
                if (this._currentSectionIndex >= 0 && this._currentSectionIndex < this.sections.length) {
                    var s = this.sections[this._currentSectionIndex];
                    var relative = offset - s.address;
                    if (relative >= 0 && relative < s.size)
                        return relative + s.virtualAddress;
                }

                for (var i = 0; i < this.sections.length; i++) {
                    var s = this.sections[i];
                    var relative = offset - s.address;
                    if (relative >= 0 && relative < s.size) {
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
                if (reader.readyState != 2) {
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
                if (requestLoadCompleteCalled)
                    return;

                requestLoadCompleteCalled = true;

                var result;

                try  {
                    var response = request.response;
                    if (response) {
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
            ;

            request.onerror = onfailure;
            request.onloadend = function () {
                return requestLoadComplete;
            };
            request.onreadystatechange = function () {
                if (request.readyState == 4) {
                    requestLoadComplete();
                }
            };

            request.send();
        }
        io.getUrlBufferReader = getUrlBufferReader;

        function bytesToHex(bytes) {
            if (!bytes)
                return null;

            var result = "";
            for (var i = 0; i < bytes.length; i++) {
                var hex = bytes[i].toString(16).toUpperCase();
                if (hex.length == 1)
                    hex = "0" + hex;
                result += hex;
            }
            return result;
        }
        io.bytesToHex = bytesToHex;

        function formatEnum(value, type) {
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
                    for (var e in type) {
                        var num = type[e];
                        if (typeof num == "number")
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
                        try  {
                            kvValue = Number(kvValueStr);
                        } catch (errorConverting) {
                            continue;
                        }

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
    /// <reference path="io.ts" />
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

                if (!this.dosHeader)
                    this.dosHeader = new DosHeader();
                this.dosHeader.read(reader);

                var dosHeaderLength = this.dosHeader.lfanew - dosHeaderSize;
                if (dosHeaderLength > 0)
                    this.dosStub = reader.readBytes(dosHeaderLength);
                else
                    this.dosStub = null;

                if (!this.peHeader)
                    this.peHeader = new PEHeader();
                this.peHeader.read(reader);

                if (!this.optionalHeader)
                    this.optionalHeader = new OptionalHeader();
                this.optionalHeader.read(reader);

                if (this.peHeader.numberOfSections > 0) {
                    if (!this.sectionHeaders || this.sectionHeaders.length != this.peHeader.numberOfSections)
                        this.sectionHeaders = Array(this.peHeader.numberOfSections);

                    for (var i = 0; i < this.sectionHeaders.length; i++) {
                        if (!this.sectionHeaders[i])
                            this.sectionHeaders[i] = new SectionHeader();
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
                /**
                * Bytes on last page of file.
                */
                this.cblp = 144;
                /**
                * Pages in file.
                */
                this.cp = 3;
                /**
                * Relocations.
                */
                this.crlc = 0;
                /**
                * Size of header in paragraphs.
                */
                this.cparhdr = 4;
                /**
                * Minimum extra paragraphs needed.
                */
                this.minalloc = 0;
                /**
                * Maximum extra paragraphs needed.
                */
                this.maxalloc = 65535;
                /**
                * Initial (relative) SS value.
                */
                this.ss = 0;
                /**
                * Initial SP value.
                */
                this.sp = 184;
                /**
                * Checksum.
                */
                this.csum = 0;
                /**
                * Initial IP value.
                */
                this.ip = 0;
                /**
                * Initial (relative) CS value.
                */
                this.cs = 0;
                /**
                * File address of relocation table.
                */
                this.lfarlc = 64;
                /**
                * Overlay number.
                */
                this.ovno = 0;
                this.res1 = new pe.io.Long(0, 0);
                /**
                * OEM identifier (for e_oeminfo).
                */
                this.oemid = 0;
                /**
                * OEM information: number; e_oemid specific.
                */
                this.oeminfo = 0;
                this.reserved = [0, 0, 0, 0, 0];
                /**
                * uint: File address of PE header.
                */
                this.lfanew = 0;
            }
            DosHeader.prototype.toString = function () {
                var result = "[" + (this.mz === MZSignature.MZ ? "MZ" : typeof this.mz === "number" ? this.mz.toString(16).toUpperCase() + "h" : typeof this.mz) + "]" + ".lfanew=" + (typeof this.lfanew === "number" ? this.lfanew.toString(16).toUpperCase() + "h" : typeof this.lfanew);

                return result;
            };

            DosHeader.prototype.read = function (reader) {
                this.mz = reader.readShort();
                if (this.mz != MZSignature.MZ)
                    throw new Error("MZ signature is invalid: " + (this.mz).toString(16).toUpperCase() + "h.");

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

                if (!this.reserved)
                    this.reserved = [];

                for (var i = 0; i < 5; i++) {
                    this.reserved[i] = reader.readInt();
                }

                this.reserved.length = 5;

                this.lfanew = reader.readInt();
            };
            return DosHeader;
        })();
        headers.DosHeader = DosHeader;

        (function (MZSignature) {
            MZSignature[MZSignature["MZ"] = "M".charCodeAt(0) + ("Z".charCodeAt(0) << 8)] = "MZ";
        })(headers.MZSignature || (headers.MZSignature = {}));
        var MZSignature = headers.MZSignature;

        var PEHeader = (function () {
            function PEHeader() {
                this.pe = PESignature.PE;
                /**
                * The architecture type of the computer.
                * An image file can only be run on the specified computer or a system that emulates the specified computer.
                */
                this.machine = Machine.I386;
                /**
                * UShort. Indicates the size of the section table, which immediately follows the headers.
                * Note that the Windows loader limits the number of sections to 96.
                */
                this.numberOfSections = 0;
                /**
                * The low 32 bits of the time stamp of the image.
                * This represents the date and time the image was created by the linker.
                * The value is represented in the number of seconds elapsed since
                * midnight (00:00:00), January 1, 1970, Universal Coordinated Time,
                * according to the system clock.
                */
                this.timestamp = new Date(0);
                /**
                * UInt. The offset of the symbol table, in bytes, or zero if no COFF symbol table exists.
                */
                this.pointerToSymbolTable = 0;
                /**
                * UInt. The number of symbols in the symbol table.
                */
                this.numberOfSymbols = 0;
                /**
                * UShort. The size of the optional header, in bytes. This value should be 0 for object files.
                */
                this.sizeOfOptionalHeader = 0;
                /**
                * The characteristics of the image.
                */
                this.characteristics = ImageCharacteristics.Dll | ImageCharacteristics.Bit32Machine;
            }
            PEHeader.prototype.toString = function () {
                var result = pe.io.formatEnum(this.machine, Machine) + " " + pe.io.formatEnum(this.characteristics, ImageCharacteristics) + " " + "Sections[" + this.numberOfSections + "]";
                return result;
            };

            PEHeader.prototype.read = function (reader) {
                this.pe = reader.readInt();
                if (this.pe != PESignature.PE)
                    throw new Error("PE signature is invalid: " + (this.pe).toString(16).toUpperCase() + "h.");

                this.machine = reader.readShort();
                this.numberOfSections = reader.readShort();

                if (!this.timestamp)
                    this.timestamp = new Date(0);
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
            PESignature[PESignature["PE"] = "P".charCodeAt(0) + ("E".charCodeAt(0) << 8)] = "PE";
        })(headers.PESignature || (headers.PESignature = {}));
        var PESignature = headers.PESignature;

        (function (Machine) {
            /**
            * The target CPU is unknown or not specified.
            */
            Machine[Machine["Unknown"] = 0x0000] = "Unknown";

            /**
            * Intel 386.
            */
            Machine[Machine["I386"] = 0x014C] = "I386";

            /**
            * MIPS little-endian
            */
            Machine[Machine["R3000"] = 0x0162] = "R3000";

            /**
            * MIPS little-endian
            */
            Machine[Machine["R4000"] = 0x0166] = "R4000";

            /**
            * MIPS little-endian
            */
            Machine[Machine["R10000"] = 0x0168] = "R10000";

            /**
            * MIPS little-endian WCE v2
            */
            Machine[Machine["WCEMIPSV2"] = 0x0169] = "WCEMIPSV2";

            /**
            * Alpha_AXP
            */
            Machine[Machine["Alpha"] = 0x0184] = "Alpha";

            /**
            * SH3 little-endian
            */
            Machine[Machine["SH3"] = 0x01a2] = "SH3";

            /**
            * SH3 little-endian. DSP.
            */
            Machine[Machine["SH3DSP"] = 0x01a3] = "SH3DSP";

            /**
            * SH3E little-endian.
            */
            Machine[Machine["SH3E"] = 0x01a4] = "SH3E";

            /**
            * SH4 little-endian.
            */
            Machine[Machine["SH4"] = 0x01a6] = "SH4";

            /**
            * SH5.
            */
            Machine[Machine["SH5"] = 0x01a8] = "SH5";

            /**
            * ARM Little-Endian
            */
            Machine[Machine["ARM"] = 0x01c0] = "ARM";

            /**
            * Thumb.
            */
            Machine[Machine["Thumb"] = 0x01c2] = "Thumb";

            /**
            * AM33
            */
            Machine[Machine["AM33"] = 0x01d3] = "AM33";

            /**
            * IBM PowerPC Little-Endian
            */
            Machine[Machine["PowerPC"] = 0x01F0] = "PowerPC";

            /**
            * PowerPCFP
            */
            Machine[Machine["PowerPCFP"] = 0x01f1] = "PowerPCFP";

            /**
            * Intel 64
            */
            Machine[Machine["IA64"] = 0x0200] = "IA64";

            /**
            * MIPS
            */
            Machine[Machine["MIPS16"] = 0x0266] = "MIPS16";

            /**
            * ALPHA64
            */
            Machine[Machine["Alpha64"] = 0x0284] = "Alpha64";

            /**
            * MIPS
            */
            Machine[Machine["MIPSFPU"] = 0x0366] = "MIPSFPU";

            /**
            * MIPS
            */
            Machine[Machine["MIPSFPU16"] = 0x0466] = "MIPSFPU16";

            /**
            * AXP64
            */
            Machine[Machine["AXP64"] = Machine.Alpha64] = "AXP64";

            /**
            * Infineon
            */
            Machine[Machine["Tricore"] = 0x0520] = "Tricore";

            /**
            * CEF
            */
            Machine[Machine["CEF"] = 0x0CEF] = "CEF";

            /**
            * EFI Byte Code
            */
            Machine[Machine["EBC"] = 0x0EBC] = "EBC";

            /**
            * AMD64 (K8)
            */
            Machine[Machine["AMD64"] = 0x8664] = "AMD64";

            /**
            * M32R little-endian
            */
            Machine[Machine["M32R"] = 0x9041] = "M32R";

            /**
            * CEE
            */
            Machine[Machine["CEE"] = 0xC0EE] = "CEE";
        })(headers.Machine || (headers.Machine = {}));
        var Machine = headers.Machine;

        (function (ImageCharacteristics) {
            /**
            * Relocation information was stripped from the file.
            * The file must be loaded at its preferred base address.
            * If the base address is not available, the loader reports an error.
            */
            ImageCharacteristics[ImageCharacteristics["RelocsStripped"] = 0x0001] = "RelocsStripped";

            /**
            * The file is executable (there are no unresolved external references).
            */
            ImageCharacteristics[ImageCharacteristics["ExecutableImage"] = 0x0002] = "ExecutableImage";

            /**
            * COFF line numbers were stripped from the file.
            */
            ImageCharacteristics[ImageCharacteristics["LineNumsStripped"] = 0x0004] = "LineNumsStripped";

            /**
            * COFF symbol table entries were stripped from file.
            */
            ImageCharacteristics[ImageCharacteristics["LocalSymsStripped"] = 0x0008] = "LocalSymsStripped";

            /**
            * Aggressively trim the working set.
            * This value is obsolete as of Windows 2000.
            */
            ImageCharacteristics[ImageCharacteristics["AggressiveWsTrim"] = 0x0010] = "AggressiveWsTrim";

            /**
            * The application can handle addresses larger than 2 GB.
            */
            ImageCharacteristics[ImageCharacteristics["LargeAddressAware"] = 0x0020] = "LargeAddressAware";

            /**
            * The bytes of the word are reversed. This flag is obsolete.
            */
            ImageCharacteristics[ImageCharacteristics["BytesReversedLo"] = 0x0080] = "BytesReversedLo";

            /**
            * The computer supports 32-bit words.
            */
            ImageCharacteristics[ImageCharacteristics["Bit32Machine"] = 0x0100] = "Bit32Machine";

            /**
            * Debugging information was removed and stored separately in another file.
            */
            ImageCharacteristics[ImageCharacteristics["DebugStripped"] = 0x0200] = "DebugStripped";

            /**
            * If the image is on removable media, copy it to and run it from the swap file.
            */
            ImageCharacteristics[ImageCharacteristics["RemovableRunFromSwap"] = 0x0400] = "RemovableRunFromSwap";

            /**
            * If the image is on the network, copy it to and run it from the swap file.
            */
            ImageCharacteristics[ImageCharacteristics["NetRunFromSwap"] = 0x0800] = "NetRunFromSwap";

            /**
            * The image is a system file.
            */
            ImageCharacteristics[ImageCharacteristics["System"] = 0x1000] = "System";

            /**
            * The image is a DLL file.
            * While it is an executable file, it cannot be run directly.
            */
            ImageCharacteristics[ImageCharacteristics["Dll"] = 0x2000] = "Dll";

            /**
            * The file should be run only on a uniprocessor computer.
            */
            ImageCharacteristics[ImageCharacteristics["UpSystemOnly"] = 0x4000] = "UpSystemOnly";

            /**
            * The bytes of the word are reversed. This flag is obsolete.
            */
            ImageCharacteristics[ImageCharacteristics["BytesReversedHi"] = 0x8000] = "BytesReversedHi";
        })(headers.ImageCharacteristics || (headers.ImageCharacteristics = {}));
        var ImageCharacteristics = headers.ImageCharacteristics;

        var OptionalHeader = (function () {
            function OptionalHeader() {
                this.peMagic = PEMagic.NT32;
                this.linkerVersion = "";
                /**
                * The size of the code section, in bytes, or the sum of all such sections if there are multiple code sections.
                */
                this.sizeOfCode = 0;
                /**
                * The size of the initialized data section, in bytes, or the sum of all such sections if there are multiple initialized data sections.
                */
                this.sizeOfInitializedData = 0;
                /**
                * The size of the uninitialized data section, in bytes, or the sum of all such sections if there are multiple uninitialized data sections.
                */
                this.sizeOfUninitializedData = 0;
                /**
                * A pointer to the entry point function, relative to the image base address.
                * For executable files, this is the starting address.
                * For device drivers, this is the address of the initialization function.
                * The entry point function is optional for DLLs.
                * When no entry point is present, this member is zero.
                */
                this.addressOfEntryPoint = 0;
                /**
                * A pointer to the beginning of the code section, relative to the image base.
                */
                this.baseOfCode = 0x2000;
                /**
                * A pointer to the beginning of the data section, relative to the image base.
                */
                this.baseOfData = 0x4000;
                /**
                * Uint or 64-bit long.
                * The preferred address of the first byte of the image when it is loaded in memory.
                * This value is a multiple of 64K bytes.
                * The default value for DLLs is 0x10000000.
                * The default value for applications is 0x00400000,
                * except on Windows CE where it is 0x00010000.
                */
                this.imageBase = 0x4000;
                /**
                * The alignment of sections loaded in memory, in bytes.
                * This value must be greater than or equal to the FileAlignment member.
                * The default value is the page size for the system.
                */
                this.sectionAlignment = 0x2000;
                /**
                * The alignment of the raw data of sections in the image file, in bytes.
                * The value should be a power of 2 between 512 and 64K (inclusive).
                * The default is 512.
                * If the <see cref="SectionAlignment"/> member is less than the system page size,
                * this member must be the same as <see cref="SectionAlignment"/>.
                */
                this.fileAlignment = 0x200;
                /**
                * The version of the required operating system.
                */
                this.operatingSystemVersion = "";
                /**
                * The version of the image.
                */
                this.imageVersion = "";
                /**
                * The version of the subsystem.
                */
                this.subsystemVersion = "";
                /**
                * This member is reserved and must be 0.
                */
                this.win32VersionValue = 0;
                /**
                * The size of the image, in bytes, including all headers. Must be a multiple of <see cref="SectionAlignment"/>.
                */
                this.sizeOfImage = 0;
                /**
                * The combined size of the MS-DOS stub, the PE header, and the section headers,
                * rounded to a multiple of the value specified in the FileAlignment member.
                */
                this.sizeOfHeaders = 0;
                /**
                * The image file checksum.
                * The following files are validated at load time:
                * all drivers,
                * any DLL loaded at boot time,
                * and any DLL loaded into a critical system process.
                */
                this.checkSum = 0;
                /**
                * The subsystem required to run this image.
                */
                this.subsystem = Subsystem.WindowsCUI;
                /**
                * The DLL characteristics of the image.
                */
                this.dllCharacteristics = DllCharacteristics.NxCompatible;
                /**
                * Uint or 64 bit long.
                * The number of bytes to reserve for the stack.
                * Only the memory specified by the <see cref="SizeOfStackCommit"/> member is committed at load time;
                * the rest is made available one page at a time until this reserve size is reached.
                */
                this.sizeOfStackReserve = 0x100000;
                /**
                * Uint or 64 bit long.
                * The number of bytes to commit for the stack.
                */
                this.sizeOfStackCommit = 0x1000;
                /**
                * Uint or 64 bit long.
                * The number of bytes to reserve for the local heap.
                * Only the memory specified by the <see cref="SizeOfHeapCommit"/> member is committed at load time;
                * the rest is made available one page at a time until this reserve size is reached.
                */
                this.sizeOfHeapReserve = 0x100000;
                /**
                * Uint or 64 bit long.
                * The number of bytes to commit for the local heap.
                */
                this.sizeOfHeapCommit = 0x1000;
                /**
                * This member is obsolete.
                */
                this.loaderFlags = 0;
                /**
                * The number of directory entries in the remainder of the optional header.
                * Each entry describes a location and size.
                */
                this.numberOfRvaAndSizes = 16;
                this.dataDirectories = [];
            }
            OptionalHeader.prototype.toString = function () {
                var result = [];

                var peMagicText = pe.io.formatEnum(this.peMagic, PEMagic);
                if (peMagicText)
                    result.push(peMagicText);

                var subsystemText = pe.io.formatEnum(this.subsystem, Subsystem);
                if (subsystemText)
                    result.push(subsystemText);

                var dllCharacteristicsText = pe.io.formatEnum(this.dllCharacteristics, DllCharacteristics);
                if (dllCharacteristicsText)
                    result.push(dllCharacteristicsText);

                var nonzeroDataDirectoriesText = [];
                if (this.dataDirectories) {
                    for (var i = 0; i < this.dataDirectories.length; i++) {
                        if (!this.dataDirectories[i] || this.dataDirectories[i].size <= 0)
                            continue;

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

                if (this.peMagic != PEMagic.NT32 && this.peMagic != PEMagic.NT64)
                    throw Error("Unsupported PE magic value " + this.peMagic.toString(16).toUpperCase() + "h.");

                this.linkerVersion = reader.readByte() + "." + reader.readByte();

                this.sizeOfCode = reader.readInt();
                this.sizeOfInitializedData = reader.readInt();
                this.sizeOfUninitializedData = reader.readInt();
                this.addressOfEntryPoint = reader.readInt();
                this.baseOfCode = reader.readInt();

                if (this.peMagic == PEMagic.NT32) {
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

                if (this.peMagic == PEMagic.NT32) {
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

                if (this.dataDirectories == null || this.dataDirectories.length != this.numberOfRvaAndSizes)
                    this.dataDirectories = (Array(this.numberOfRvaAndSizes));

                for (var i = 0; i < this.numberOfRvaAndSizes; i++) {
                    if (this.dataDirectories[i]) {
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
            PEMagic[PEMagic["NT32"] = 0x010B] = "NT32";
            PEMagic[PEMagic["NT64"] = 0x020B] = "NT64";
            PEMagic[PEMagic["ROM"] = 0x107] = "ROM";
        })(headers.PEMagic || (headers.PEMagic = {}));
        var PEMagic = headers.PEMagic;

        (function (Subsystem) {
            /**
            * Unknown subsystem.
            */
            Subsystem[Subsystem["Unknown"] = 0] = "Unknown";

            /**
            * No subsystem required (device drivers and native system processes).
            */
            Subsystem[Subsystem["Native"] = 1] = "Native";

            /**
            * Windows graphical user interface (GUI) subsystem.
            */
            Subsystem[Subsystem["WindowsGUI"] = 2] = "WindowsGUI";

            /**
            * Windows character-mode user interface (CUI) subsystem.
            */
            Subsystem[Subsystem["WindowsCUI"] = 3] = "WindowsCUI";

            /**
            * OS/2 console subsystem.
            */
            Subsystem[Subsystem["OS2CUI"] = 5] = "OS2CUI";

            /**
            * POSIX console subsystem.
            */
            Subsystem[Subsystem["POSIXCUI"] = 7] = "POSIXCUI";

            /**
            * Image is a native Win9x driver.
            */
            Subsystem[Subsystem["NativeWindows"] = 8] = "NativeWindows";

            /**
            * Windows CE system.
            */
            Subsystem[Subsystem["WindowsCEGUI"] = 9] = "WindowsCEGUI";

            /**
            * Extensible Firmware Interface (EFI) application.
            */
            Subsystem[Subsystem["EFIApplication"] = 10] = "EFIApplication";

            /**
            * EFI driver with boot services.
            */
            Subsystem[Subsystem["EFIBootServiceDriver"] = 11] = "EFIBootServiceDriver";

            /**
            * EFI driver with run-time services.
            */
            Subsystem[Subsystem["EFIRuntimeDriver"] = 12] = "EFIRuntimeDriver";

            /**
            * EFI ROM image.
            */
            Subsystem[Subsystem["EFIROM"] = 13] = "EFIROM";

            /**
            * Xbox system.
            */
            Subsystem[Subsystem["XBOX"] = 14] = "XBOX";

            /**
            * Boot application.
            */
            Subsystem[Subsystem["BootApplication"] = 16] = "BootApplication";
        })(headers.Subsystem || (headers.Subsystem = {}));
        var Subsystem = headers.Subsystem;

        (function (DllCharacteristics) {
            /**
            * Reserved.
            */
            DllCharacteristics[DllCharacteristics["ProcessInit"] = 0x0001] = "ProcessInit";

            /**
            * Reserved.
            */
            DllCharacteristics[DllCharacteristics["ProcessTerm"] = 0x0002] = "ProcessTerm";

            /**
            * Reserved.
            */
            DllCharacteristics[DllCharacteristics["ThreadInit"] = 0x0004] = "ThreadInit";

            /**
            * Reserved.
            */
            DllCharacteristics[DllCharacteristics["ThreadTerm"] = 0x0008] = "ThreadTerm";

            /**
            * The DLL can be relocated at load time.
            */
            DllCharacteristics[DllCharacteristics["DynamicBase"] = 0x0040] = "DynamicBase";

            /**
            * Code integrity checks are forced.
            * If you set this flag and a section contains only uninitialized data,
            * set the PointerToRawData member of IMAGE_SECTION_HEADER
            * for that section to zero;
            * otherwise, the image will fail to load because the digital signature cannot be verified.
            */
            DllCharacteristics[DllCharacteristics["ForceIntegrity"] = 0x0080] = "ForceIntegrity";

            /**
            * The image is compatible with data execution prevention (DEP).
            */
            DllCharacteristics[DllCharacteristics["NxCompatible"] = 0x0100] = "NxCompatible";

            /**
            * The image is isolation aware, but should not be isolated.
            */
            DllCharacteristics[DllCharacteristics["NoIsolation"] = 0x0200] = "NoIsolation";

            /**
            * The image does not use structured exception handling (SEH). No SE handler may reside in this image.
            */
            DllCharacteristics[DllCharacteristics["NoSEH"] = 0x0400] = "NoSEH";

            /**
            * Do not bind this image.
            */
            DllCharacteristics[DllCharacteristics["NoBind"] = 0x0800] = "NoBind";

            /**
            * The image must run inside an AppContainer.
            */
            DllCharacteristics[DllCharacteristics["AppContainer"] = 0x1000] = "AppContainer";

            /**
            * WDM (Windows Driver Model) driver.
            */
            DllCharacteristics[DllCharacteristics["WdmDriver"] = 0x2000] = "WdmDriver";

            /**
            * Reserved (no specific name).
            */
            DllCharacteristics[DllCharacteristics["Reserved"] = 0x4000] = "Reserved";

            /**
            * The image is terminal server aware.
            */
            DllCharacteristics[DllCharacteristics["TerminalServerAware"] = 0x8000] = "TerminalServerAware";
        })(headers.DllCharacteristics || (headers.DllCharacteristics = {}));
        var DllCharacteristics = headers.DllCharacteristics;

        (function (DataDirectoryKind) {
            DataDirectoryKind[DataDirectoryKind["ExportSymbols"] = 0] = "ExportSymbols";
            DataDirectoryKind[DataDirectoryKind["ImportSymbols"] = 1] = "ImportSymbols";
            DataDirectoryKind[DataDirectoryKind["Resources"] = 2] = "Resources";
            DataDirectoryKind[DataDirectoryKind["Exception"] = 3] = "Exception";
            DataDirectoryKind[DataDirectoryKind["Security"] = 4] = "Security";
            DataDirectoryKind[DataDirectoryKind["BaseRelocation"] = 5] = "BaseRelocation";
            DataDirectoryKind[DataDirectoryKind["Debug"] = 6] = "Debug";
            DataDirectoryKind[DataDirectoryKind["CopyrightString"] = 7] = "CopyrightString";
            DataDirectoryKind[DataDirectoryKind["Unknown"] = 8] = "Unknown";
            DataDirectoryKind[DataDirectoryKind["ThreadLocalStorage"] = 9] = "ThreadLocalStorage";
            DataDirectoryKind[DataDirectoryKind["LoadConfiguration"] = 10] = "LoadConfiguration";
            DataDirectoryKind[DataDirectoryKind["BoundImport"] = 11] = "BoundImport";
            DataDirectoryKind[DataDirectoryKind["ImportAddressTable"] = 12] = "ImportAddressTable";
            DataDirectoryKind[DataDirectoryKind["DelayImport"] = 13] = "DelayImport";

            /**
            * Common Language Runtime, look for ClrDirectory at that offset.
            */
            DataDirectoryKind[DataDirectoryKind["Clr"] = 14] = "Clr";
        })(headers.DataDirectoryKind || (headers.DataDirectoryKind = {}));
        var DataDirectoryKind = headers.DataDirectoryKind;

        var SectionHeader = (function (_super) {
            __extends(SectionHeader, _super);
            function SectionHeader() {
                _super.call(this);
                /**
                * An 8-byte, null-padded UTF-8 string.
                * There is no terminating null character if the string is exactly eight characters long.
                * For longer names, this member contains a forward slash (/)
                * followed by an ASCII representation of a decimal number that is an offset into the string table.
                * Executable images do not use a string table
                * and do not support section names longer than eight characters.
                */
                this.name = "";
                /**
                * A file pointer to the beginning of the relocation entries for the section.
                * If there are no relocations, this value is zero.
                */
                this.pointerToRelocations = 0;
                /**
                * A file pointer to the beginning of the line-number entries for the section.
                * If there are no COFF line numbers, this value is zero.
                */
                this.pointerToLinenumbers = 0;
                /**
                * Ushort.
                * The number of relocation entries for the section.
                * This value is zero for executable images.
                */
                this.numberOfRelocations = 0;
                /**
                * Ushort.
                * The number of line-number entries for the section.
                */
                this.numberOfLinenumbers = 0;
                /**
                * The characteristics of the image.
                */
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
        })(pe.io.MappedAddressRange);
        headers.SectionHeader = SectionHeader;

        (function (SectionCharacteristics) {
            SectionCharacteristics[SectionCharacteristics["Reserved_0h"] = 0x00000000] = "Reserved_0h";
            SectionCharacteristics[SectionCharacteristics["Reserved_1h"] = 0x00000001] = "Reserved_1h";
            SectionCharacteristics[SectionCharacteristics["Reserved_2h"] = 0x00000002] = "Reserved_2h";
            SectionCharacteristics[SectionCharacteristics["Reserved_4h"] = 0x00000004] = "Reserved_4h";

            /**
            * The section should not be padded to the next boundary.
            * This flag is obsolete and is replaced by Align1Bytes.
            */
            SectionCharacteristics[SectionCharacteristics["NoPadding"] = 0x00000008] = "NoPadding";

            SectionCharacteristics[SectionCharacteristics["Reserved_10h"] = 0x00000010] = "Reserved_10h";

            /**
            * The section contains executable code.
            */
            SectionCharacteristics[SectionCharacteristics["ContainsCode"] = 0x00000020] = "ContainsCode";

            /**
            * The section contains initialized data.
            */
            SectionCharacteristics[SectionCharacteristics["ContainsInitializedData"] = 0x00000040] = "ContainsInitializedData";

            /**
            * The section contains uninitialized data.
            */
            SectionCharacteristics[SectionCharacteristics["ContainsUninitializedData"] = 0x00000080] = "ContainsUninitializedData";

            /**
            * Reserved.
            */
            SectionCharacteristics[SectionCharacteristics["LinkerOther"] = 0x00000100] = "LinkerOther";

            /**
            * The section contains comments or other information.
            * This is valid only for object files.
            */
            SectionCharacteristics[SectionCharacteristics["LinkerInfo"] = 0x00000200] = "LinkerInfo";

            SectionCharacteristics[SectionCharacteristics["Reserved_400h"] = 0x00000400] = "Reserved_400h";

            /**
            * The section will not become part of the image.
            * This is valid only for object files.
            */
            SectionCharacteristics[SectionCharacteristics["LinkerRemove"] = 0x00000800] = "LinkerRemove";

            /**
            * The section contains COMDAT data.
            * This is valid only for object files.
            */
            SectionCharacteristics[SectionCharacteristics["LinkerCOMDAT"] = 0x00001000] = "LinkerCOMDAT";

            SectionCharacteristics[SectionCharacteristics["Reserved_2000h"] = 0x00002000] = "Reserved_2000h";

            /**
            * Reset speculative exceptions handling bits in the TLB entries for this section.
            */
            SectionCharacteristics[SectionCharacteristics["NoDeferredSpeculativeExecution"] = 0x00004000] = "NoDeferredSpeculativeExecution";

            /**
            * The section contains data referenced through the global pointer.
            */
            SectionCharacteristics[SectionCharacteristics["GlobalPointerRelative"] = 0x00008000] = "GlobalPointerRelative";

            SectionCharacteristics[SectionCharacteristics["Reserved_10000h"] = 0x00010000] = "Reserved_10000h";

            /**
            * Reserved.
            */
            SectionCharacteristics[SectionCharacteristics["MemoryPurgeable"] = 0x00020000] = "MemoryPurgeable";

            /**
            * Reserved.
            */
            SectionCharacteristics[SectionCharacteristics["MemoryLocked"] = 0x00040000] = "MemoryLocked";

            /**
            * Reserved.
            */
            SectionCharacteristics[SectionCharacteristics["MemoryPreload"] = 0x00080000] = "MemoryPreload";

            /**
            * Align data on a 1-byte boundary.
            * This is valid only for object files.
            */
            SectionCharacteristics[SectionCharacteristics["Align1Bytes"] = 0x00100000] = "Align1Bytes";

            /**
            * Align data on a 2-byte boundary.
            * This is valid only for object files.
            */
            SectionCharacteristics[SectionCharacteristics["Align2Bytes"] = 0x00200000] = "Align2Bytes";

            /**
            * Align data on a 4-byte boundary.
            * This is valid only for object files.
            */
            SectionCharacteristics[SectionCharacteristics["Align4Bytes"] = 0x00300000] = "Align4Bytes";

            /**
            * Align data on a 8-byte boundary.
            * This is valid only for object files.
            */
            SectionCharacteristics[SectionCharacteristics["Align8Bytes"] = 0x00400000] = "Align8Bytes";

            /**
            * Align data on a 16-byte boundary.
            * This is valid only for object files.
            */
            SectionCharacteristics[SectionCharacteristics["Align16Bytes"] = 0x00500000] = "Align16Bytes";

            /**
            * Align data on a 32-byte boundary.
            * This is valid only for object files.
            */
            SectionCharacteristics[SectionCharacteristics["Align32Bytes"] = 0x00600000] = "Align32Bytes";

            /**
            * Align data on a 64-byte boundary.
            * This is valid only for object files.
            */
            SectionCharacteristics[SectionCharacteristics["Align64Bytes"] = 0x00700000] = "Align64Bytes";

            /**
            * Align data on a 128-byte boundary.
            * This is valid only for object files.
            */
            SectionCharacteristics[SectionCharacteristics["Align128Bytes"] = 0x00800000] = "Align128Bytes";

            /**
            * Align data on a 256-byte boundary.
            * This is valid only for object files.
            */
            SectionCharacteristics[SectionCharacteristics["Align256Bytes"] = 0x00900000] = "Align256Bytes";

            /**
            * Align data on a 512-byte boundary.
            * This is valid only for object files.
            */
            SectionCharacteristics[SectionCharacteristics["Align512Bytes"] = 0x00A00000] = "Align512Bytes";

            /**
            * Align data on a 1024-byte boundary.
            * This is valid only for object files.
            */
            SectionCharacteristics[SectionCharacteristics["Align1024Bytes"] = 0x00B00000] = "Align1024Bytes";

            /**
            * Align data on a 2048-byte boundary.
            * This is valid only for object files.
            */
            SectionCharacteristics[SectionCharacteristics["Align2048Bytes"] = 0x00C00000] = "Align2048Bytes";

            /**
            * Align data on a 4096-byte boundary.
            * This is valid only for object files.
            */
            SectionCharacteristics[SectionCharacteristics["Align4096Bytes"] = 0x00D00000] = "Align4096Bytes";

            /**
            * Align data on a 8192-byte boundary.
            * This is valid only for object files.
            */
            SectionCharacteristics[SectionCharacteristics["Align8192Bytes"] = 0x00E00000] = "Align8192Bytes";

            /**
            * The section contains extended relocations.
            * The count of relocations for the section exceeds the 16 bits that is reserved for it in the section header.
            * If the NumberOfRelocations field in the section header is 0xffff,
            * the actual relocation count is stored in the VirtualAddress field of the first relocation.
            * It is an error if LinkerRelocationOverflow is set and there are fewer than 0xffff relocations in the section.
            */
            SectionCharacteristics[SectionCharacteristics["LinkerRelocationOverflow"] = 0x01000000] = "LinkerRelocationOverflow";

            /**
            * The section can be discarded as needed.
            */
            SectionCharacteristics[SectionCharacteristics["MemoryDiscardable"] = 0x02000000] = "MemoryDiscardable";

            /**
            * The section cannot be cached.
            */
            SectionCharacteristics[SectionCharacteristics["MemoryNotCached"] = 0x04000000] = "MemoryNotCached";

            /**
            * The section cannot be paged.
            */
            SectionCharacteristics[SectionCharacteristics["MemoryNotPaged"] = 0x08000000] = "MemoryNotPaged";

            /**
            * The section can be shared in memory.
            */
            SectionCharacteristics[SectionCharacteristics["MemoryShared"] = 0x10000000] = "MemoryShared";

            /**
            * The section can be executed as code.
            */
            SectionCharacteristics[SectionCharacteristics["MemoryExecute"] = 0x20000000] = "MemoryExecute";

            /**
            * The section can be read.
            */
            SectionCharacteristics[SectionCharacteristics["MemoryRead"] = 0x40000000] = "MemoryRead";

            /**
            * The section can be written to.
            */
            SectionCharacteristics[SectionCharacteristics["MemoryWrite"] = 0x80000000] = "MemoryWrite";
        })(headers.SectionCharacteristics || (headers.SectionCharacteristics = {}));
        var SectionCharacteristics = headers.SectionCharacteristics;
    })(pe.headers || (pe.headers = {}));
    var headers = pe.headers;
})(pe || (pe = {}));
var pe;
(function (pe) {
    /// <reference path="headers.ts" />
    /// <reference path="io.ts" />
    (function (unmanaged) {
        var DllExport = (function () {
            function DllExport() {
            }
            DllExport.readExports = function (reader, range) {
                var result = [];

                result.flags = reader.readInt();
                if (!result.timestamp)
                    result.timestamp = new Date(0);

                result.timestamp.setTime(reader.readInt() * 1000);

                var majorVersion = reader.readShort();
                var minorVersion = reader.readShort();
                result.version = majorVersion + "." + minorVersion;

                // need to read string from that RVA later
                var nameRva = reader.readInt();

                result.ordinalBase = reader.readInt();

                // The number of entries in the export address table.
                var addressTableEntries = reader.readInt();

                // The number of entries in the name pointer table. This is also the number of entries in the ordinal table.
                var numberOfNamePointers = reader.readInt();

                // The address of the export address table, relative to the image base.
                var exportAddressTableRva = reader.readInt();

                // The address of the export name pointer table, relative to the image base.
                // The table size is given by the Number of Name Pointers field.
                var namePointerRva = reader.readInt();

                // The address of the ordinal table, relative to the image base.
                var ordinalTableRva = reader.readInt();

                if (nameRva == 0) {
                    result.dllName = null;
                } else {
                    var saveOffset = reader.offset;
                    reader.setVirtualOffset(nameRva);
                    result.dllName = reader.readAsciiZ();
                    reader.offset = saveOffset;
                }

                result.length = addressTableEntries;

                for (var i = 0; i < addressTableEntries; i++) {
                    var exportEntry = new DllExport();
                    exportEntry.readExportEntry(reader, range);
                    exportEntry.ordinal = i + result.ordinalBase;
                    result[i] = exportEntry;
                }

                if (numberOfNamePointers != 0 && namePointerRva != 0 && ordinalTableRva != 0) {
                    saveOffset = reader.offset;
                    for (var i = 0; i < numberOfNamePointers; i++) {
                        reader.setVirtualOffset(ordinalTableRva + 2 * i);
                        var ordinal = reader.readShort();

                        reader.setVirtualOffset(namePointerRva + 4 * i);
                        var functionNameRva = reader.readInt();

                        var functionName;
                        if (functionNameRva == 0) {
                            functionName = null;
                        } else {
                            reader.setVirtualOffset(functionNameRva);
                            functionName = reader.readAsciiZ();
                        }

                        result[ordinal].name = functionName;
                    }
                    reader.offset = saveOffset;
                }

                return result;
            };

            DllExport.prototype.readExportEntry = function (reader, range) {
                var exportOrForwarderRva = reader.readInt();

                if (range.mapRelative(exportOrForwarderRva) >= 0) {
                    this.exportRva = 0;

                    var forwarderRva = reader.readInt();
                    if (forwarderRva == 0) {
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
            DllImport.read = function (reader, result) {
                if (!result)
                    result = [];

                var readLength = 0;
                while (true) {
                    var originalFirstThunk = reader.readInt();
                    var timeDateStamp = new Date(0);
                    timeDateStamp.setTime(reader.readInt());

                    var forwarderChain = reader.readInt();
                    var nameRva = reader.readInt();
                    var firstThunk = reader.readInt();

                    var thunkAddressPosition = originalFirstThunk == 0 ? firstThunk : originalFirstThunk;
                    if (thunkAddressPosition == 0)
                        break;

                    var saveOffset = reader.offset;

                    var libraryName;
                    if (nameRva === 0) {
                        libraryName = null;
                    } else {
                        reader.setVirtualOffset(nameRva);
                        libraryName = reader.readAsciiZ();
                    }

                    reader.setVirtualOffset(thunkAddressPosition);

                    while (true) {
                        var newEntry = result[readLength];
                        if (!newEntry) {
                            newEntry = new DllImport();
                            result[readLength] = newEntry;
                        }

                        if (!newEntry.readEntry(reader))
                            break;

                        newEntry.dllName = libraryName;
                        newEntry.timeDateStamp = timeDateStamp;
                        readLength++;
                    }

                    reader.offset = saveOffset;
                }

                result.length = readLength;

                return result;
            };

            DllImport.prototype.readEntry = function (reader) {
                var importPosition = reader.readInt();
                if (importPosition == 0)
                    return false;

                if (importPosition & (1 << 31)) {
                    this.ordinal = importPosition & 0x7FFFFFFF;
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
                /*
                * Resource flags. This field is reserved for future use. It is currently set to zero.
                */
                this.characteristics = 0;
                /*
                * The time that the resource data was created by the resource compiler
                */
                this.timestamp = new Date(0);
                /*
                * The version number, set by the user.
                */
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

                if (!this.timestamp)
                    this.timestamp = new Date(0);
                this.timestamp.setTime(reader.readInt() * 1000);

                this.version = reader.readShort() + "." + reader.readShort();
                var nameEntryCount = reader.readShort();
                var idEntryCount = reader.readShort();

                var dataEntryCount = 0;
                var directoryEntryCount = 0;

                for (var i = 0; i < nameEntryCount + idEntryCount; i++) {
                    var idOrNameRva = reader.readInt();
                    var contentRva = reader.readInt();

                    var saveOffset = reader.offset;

                    var name;
                    var id;

                    var highBit = 0x80000000;

                    if (idOrNameRva < highBit) {
                        id = idOrNameRva;
                        name = null;
                    } else {
                        id = 0;
                        reader.setVirtualOffset(baseVirtualOffset + idOrNameRva - highBit);
                        name = this.readName(reader);
                    }

                    if (contentRva < highBit) {
                        reader.setVirtualOffset(baseVirtualOffset + contentRva);

                        var dataEntry = this.dataEntries[dataEntryCount];
                        if (!dataEntry)
                            this.dataEntries[dataEntryCount] = dataEntry = new ResourceDataEntry();

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
                        if (!directoryEntry)
                            this.subdirectories[directoryEntryCount] = directoryEntry = new ResourceDirectoryEntry();

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
                for (var i = 0; i < length; i++) {
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
    /// <reference path="io.ts" />
    /// <reference path="headers.ts" />
    (function (managed) {
        (function (ClrImageFlags) {
            ClrImageFlags[ClrImageFlags["ILOnly"] = 0x00000001] = "ILOnly";
            ClrImageFlags[ClrImageFlags["_32BitRequired"] = 0x00000002] = "_32BitRequired";
            ClrImageFlags[ClrImageFlags["ILLibrary"] = 0x00000004] = "ILLibrary";
            ClrImageFlags[ClrImageFlags["StrongNameSigned"] = 0x00000008] = "StrongNameSigned";
            ClrImageFlags[ClrImageFlags["NativeEntryPoint"] = 0x00000010] = "NativeEntryPoint";
            ClrImageFlags[ClrImageFlags["TrackDebugData"] = 0x00010000] = "TrackDebugData";
            ClrImageFlags[ClrImageFlags["IsIbcoptimized"] = 0x00020000] = "IsIbcoptimized";
        })(managed.ClrImageFlags || (managed.ClrImageFlags = {}));
        var ClrImageFlags = managed.ClrImageFlags;

        (function (ClrMetadataSignature) {
            ClrMetadataSignature[ClrMetadataSignature["Signature"] = 0x424a5342] = "Signature";
        })(managed.ClrMetadataSignature || (managed.ClrMetadataSignature = {}));
        var ClrMetadataSignature = managed.ClrMetadataSignature;

        (function (AssemblyHashAlgorithm) {
            AssemblyHashAlgorithm[AssemblyHashAlgorithm["None"] = 0x0000] = "None";
            AssemblyHashAlgorithm[AssemblyHashAlgorithm["Reserved"] = 0x8003] = "Reserved";
            AssemblyHashAlgorithm[AssemblyHashAlgorithm["Sha1"] = 0x8004] = "Sha1";
        })(managed.AssemblyHashAlgorithm || (managed.AssemblyHashAlgorithm = {}));
        var AssemblyHashAlgorithm = managed.AssemblyHashAlgorithm;

        (function (AssemblyFlags) {
            // The assembly reference holds the full (unhashed) public key.
            AssemblyFlags[AssemblyFlags["PublicKey"] = 0x0001] = "PublicKey";

            // The implementation of this assembly used at runtime is not expected to match the version seen at compile time.
            // (See the text following this table.)
            AssemblyFlags[AssemblyFlags["Retargetable"] = 0x0100] = "Retargetable";

            // Reserved
            // (a conforming implementation of the CLI can ignore this setting on read;
            // some implementations might use this bit to indicate
            // that a CIL-to-native-code compiler should not generate optimized code).
            AssemblyFlags[AssemblyFlags["DisableJITcompileOptimizer"] = 0x4000] = "DisableJITcompileOptimizer";

            // Reserved
            // (a conforming implementation of the CLI can ignore this setting on read;
            // some implementations might use this bit to indicate
            // that a CIL-to-native-code compiler should generate CIL-to-native code map).
            AssemblyFlags[AssemblyFlags["EnableJITcompileTracking"] = 0x8000] = "EnableJITcompileTracking";
        })(managed.AssemblyFlags || (managed.AssemblyFlags = {}));
        var AssemblyFlags = managed.AssemblyFlags;

        // [ECMA-335 para23.1.16]
        (function (ElementType) {
            // Marks end of a list.
            ElementType[ElementType["End"] = 0x00] = "End";

            ElementType[ElementType["Void"] = 0x01] = "Void";

            ElementType[ElementType["Boolean"] = 0x02] = "Boolean";

            ElementType[ElementType["Char"] = 0x03] = "Char";

            ElementType[ElementType["I1"] = 0x04] = "I1";
            ElementType[ElementType["U1"] = 0x05] = "U1";
            ElementType[ElementType["I2"] = 0x06] = "I2";
            ElementType[ElementType["U2"] = 0x07] = "U2";
            ElementType[ElementType["I4"] = 0x08] = "I4";
            ElementType[ElementType["U4"] = 0x09] = "U4";
            ElementType[ElementType["I8"] = 0x0a] = "I8";
            ElementType[ElementType["U8"] = 0x0b] = "U8";
            ElementType[ElementType["R4"] = 0x0c] = "R4";
            ElementType[ElementType["R8"] = 0x0d] = "R8";
            ElementType[ElementType["String"] = 0x0e] = "String";

            // Followed by type.
            ElementType[ElementType["Ptr"] = 0x0f] = "Ptr";

            // Followed by type.
            ElementType[ElementType["ByRef"] = 0x10] = "ByRef";

            // Followed by TypeDef or TypeRef token.
            ElementType[ElementType["ValueType"] = 0x11] = "ValueType";

            // Followed by TypeDef or TypeRef token.
            ElementType[ElementType["Class"] = 0x12] = "Class";

            // Generic parameter in a generic type definition, represented as number (compressed unsigned integer).
            ElementType[ElementType["Var"] = 0x13] = "Var";

            // type rank boundsCount bound1 � loCount lo1 �
            ElementType[ElementType["Array"] = 0x14] = "Array";

            // Generic type instantiation.  Followed by type typearg-count type-1 .managed.. type-n.
            ElementType[ElementType["GenericInst"] = 0x15] = "GenericInst";

            ElementType[ElementType["TypedByRef"] = 0x16] = "TypedByRef";

            // System.IntPtr
            ElementType[ElementType["I"] = 0x18] = "I";

            // System.UIntPtr
            ElementType[ElementType["U"] = 0x19] = "U";

            // Followed by full method signature.
            ElementType[ElementType["FnPtr"] = 0x1b] = "FnPtr";

            // System.Object
            ElementType[ElementType["Object"] = 0x1c] = "Object";

            // Single-dim array with 0 lower bound
            ElementType[ElementType["SZArray"] = 0x1d] = "SZArray";

            // Generic parameter in a generic method definition, represented as number (compressed unsigned integer).
            ElementType[ElementType["MVar"] = 0x1e] = "MVar";

            // Required modifier: followed by TypeDef or TypeRef token.
            ElementType[ElementType["CMod_ReqD"] = 0x1f] = "CMod_ReqD";

            // Optional modifier: followed by TypeDef or TypeRef token.
            ElementType[ElementType["CMod_Opt"] = 0x20] = "CMod_Opt";

            // Implemented within the CLI.
            ElementType[ElementType["Internal"] = 0x21] = "Internal";

            // Or'd with following element types.
            ElementType[ElementType["Modifier"] = 0x40] = "Modifier";

            // Sentinel for vararg method signature.
            ElementType[ElementType["Sentinel"] = 0x01 | ElementType.Modifier] = "Sentinel";

            // Denotes a local variable that points at a pinned object,
            ElementType[ElementType["Pinned"] = 0x05 | ElementType.Modifier] = "Pinned";

            ElementType[ElementType["R4_Hfa"] = 0x06 | ElementType.Modifier] = "R4_Hfa";
            ElementType[ElementType["R8_Hfa"] = 0x07 | ElementType.Modifier] = "R8_Hfa";

            // Indicates an argument of type System.Type.
            ElementType[ElementType["ArgumentType_"] = 0x10 | ElementType.Modifier] = "ArgumentType_";

            // Used in custom attributes to specify a boxed object (ECMA-335 para23.3).
            ElementType[ElementType["CustomAttribute_BoxedObject_"] = 0x11 | ElementType.Modifier] = "CustomAttribute_BoxedObject_";

            // Reserved_ = 0x12 | Modifier,
            // Used in custom attributes to indicate a FIELD (ECMA-335 para22.10, 23.3).
            ElementType[ElementType["CustomAttribute_Field_"] = 0x13 | ElementType.Modifier] = "CustomAttribute_Field_";

            // Used in custom attributes to indicate a PROPERTY (ECMA-335 para22.10, 23.3).
            ElementType[ElementType["CustomAttribute_Property_"] = 0x14 | ElementType.Modifier] = "CustomAttribute_Property_";

            // Used in custom attributes to specify an enum (ECMA-335 para23.3).
            ElementType[ElementType["CustomAttribute_Enum_"] = 0x55] = "CustomAttribute_Enum_";
        })(managed.ElementType || (managed.ElementType = {}));
        var ElementType = managed.ElementType;

        // Look in ECMA-335 para22.11.
        (function (SecurityAction) {
            // Without further checks, satisfy Demand for the specified permission.
            // Valid scope: Method, Type;
            SecurityAction[SecurityAction["Assert"] = 3] = "Assert";

            // Check that all callers in the call chain have been granted specified permission,
            // throw SecurityException (see ECMA-335 paraPartition IV) on failure.
            // Valid scope: Method, Type.
            SecurityAction[SecurityAction["Demand"] = 2] = "Demand";

            // Without further checks refuse Demand for the specified permission.
            // Valid scope: Method, Type.
            SecurityAction[SecurityAction["Deny"] = 4] = "Deny";

            // The specified permission shall be granted in order to inherit from class or override virtual method.
            // Valid scope: Method, Type
            SecurityAction[SecurityAction["InheritanceDemand"] = 7] = "InheritanceDemand";

            // Check that the immediate caller has been granted the specified permission;
            // throw SecurityException (see ECMA-335 paraPartition IV) on failure.
            // Valid scope: Method, Type.
            SecurityAction[SecurityAction["LinkDemand"] = 6] = "LinkDemand";

            //  Check that the current assembly has been granted the specified permission;
            //  throw SecurityException (see Partition IV) otherwise.
            //  Valid scope: Method, Type.
            SecurityAction[SecurityAction["NonCasDemand"] = 0] = "NonCasDemand";

            // Check that the immediate caller has been granted the specified permission;
            // throw SecurityException (see Partition IV) otherwise.
            // Valid scope: Method, Type.
            SecurityAction[SecurityAction["NonCasLinkDemand"] = 0] = "NonCasLinkDemand";

            // Reserved for implementation-specific use.
            // Valid scope: Assembly.
            SecurityAction[SecurityAction["PrejitGrant"] = 0] = "PrejitGrant";

            // Without further checks, refuse Demand for all permissions other than those specified.
            // Valid scope: Method, Type
            SecurityAction[SecurityAction["PermitOnly"] = 5] = "PermitOnly";

            // Specify the minimum permissions required to runmanaged.
            // Valid scope: Assembly.
            SecurityAction[SecurityAction["RequestMinimum"] = 8] = "RequestMinimum";

            // Specify the optional permissions to grant.
            // Valid scope: Assembly.
            SecurityAction[SecurityAction["RequestOptional"] = 9] = "RequestOptional";

            // Specify the permissions not to be granted.
            // Valid scope: Assembly.
            SecurityAction[SecurityAction["RequestRefuse"] = 10] = "RequestRefuse";
        })(managed.SecurityAction || (managed.SecurityAction = {}));
        var SecurityAction = managed.SecurityAction;

        // [ECMA-335 para23.1.4]
        (function (EventAttributes) {
            // Event is special.
            EventAttributes[EventAttributes["SpecialName"] = 0x0200] = "SpecialName";

            // CLI provides 'special' behavior, depending upon the name of the event.
            EventAttributes[EventAttributes["RTSpecialName"] = 0x0400] = "RTSpecialName";
        })(managed.EventAttributes || (managed.EventAttributes = {}));
        var EventAttributes = managed.EventAttributes;

        (function (TypeAttributes) {
            // Visibility attributes
            // Use this mask to retrieve visibility information.
            // These 3 bits contain one of the following values:
            // NotPublic, Public,
            // NestedPublic, NestedPrivate,
            // NestedFamily, NestedAssembly,
            // NestedFamANDAssem, NestedFamORAssem.
            TypeAttributes[TypeAttributes["VisibilityMask"] = 0x00000007] = "VisibilityMask";

            // Class has no public scope.
            TypeAttributes[TypeAttributes["NotPublic"] = 0x00000000] = "NotPublic";

            // Class has public scope.
            TypeAttributes[TypeAttributes["Public"] = 0x00000001] = "Public";

            // Class is nested with public visibility.
            TypeAttributes[TypeAttributes["NestedPublic"] = 0x00000002] = "NestedPublic";

            // Class is nested with private visibility.
            TypeAttributes[TypeAttributes["NestedPrivate"] = 0x00000003] = "NestedPrivate";

            // Class is nested with family visibility.
            TypeAttributes[TypeAttributes["NestedFamily"] = 0x00000004] = "NestedFamily";

            // Class is nested with assembly visibility.
            TypeAttributes[TypeAttributes["NestedAssembly"] = 0x00000005] = "NestedAssembly";

            // Class is nested with family and assembly visibility.
            TypeAttributes[TypeAttributes["NestedFamANDAssem"] = 0x00000006] = "NestedFamANDAssem";

            // Class is nested with family or assembly visibility.
            TypeAttributes[TypeAttributes["NestedFamORAssem"] = 0x00000007] = "NestedFamORAssem";

            // Class layout attributes
            // Use this mask to retrieve class layout information.
            // These 2 bits contain one of the following values:
            // AutoLayout, SequentialLayout, ExplicitLayout.
            TypeAttributes[TypeAttributes["LayoutMask"] = 0x00000018] = "LayoutMask";

            // Class fields are auto-laid out.
            TypeAttributes[TypeAttributes["AutoLayout"] = 0x00000000] = "AutoLayout";

            // Class fields are laid out sequentially.
            TypeAttributes[TypeAttributes["SequentialLayout"] = 0x00000008] = "SequentialLayout";

            // Layout is supplied explicitly.
            TypeAttributes[TypeAttributes["ExplicitLayout"] = 0x00000010] = "ExplicitLayout";

            // Class semantics attributes
            // Use this mask to retrive class semantics information.
            // This bit contains one of the following values:
            // Class, Interface.
            TypeAttributes[TypeAttributes["ClassSemanticsMask"] = 0x00000020] = "ClassSemanticsMask";

            // Type is a class.
            TypeAttributes[TypeAttributes["Class"] = 0x00000000] = "Class";

            // Type is an interface.
            TypeAttributes[TypeAttributes["Interface"] = 0x00000020] = "Interface";

            // Special semantics in addition to class semantics
            // Class is abstract.
            TypeAttributes[TypeAttributes["Abstract"] = 0x00000080] = "Abstract";

            // Class cannot be extended.
            TypeAttributes[TypeAttributes["Sealed"] = 0x00000100] = "Sealed";

            // Class name is special.
            TypeAttributes[TypeAttributes["SpecialName"] = 0x00000400] = "SpecialName";

            // Implementation Attributes
            // Class/Interface is imported.
            TypeAttributes[TypeAttributes["Import"] = 0x00001000] = "Import";

            // Reserved (Class is serializable)
            TypeAttributes[TypeAttributes["Serializable"] = 0x00002000] = "Serializable";

            // String formatting Attributes
            // Use this mask to retrieve string information for native interop.
            // These 2 bits contain one of the following values:
            // AnsiClass, UnicodeClass, AutoClass, CustomFormatClass.
            TypeAttributes[TypeAttributes["StringFormatMask"] = 0x00030000] = "StringFormatMask";

            // LPSTR is interpreted as ANSI.
            TypeAttributes[TypeAttributes["AnsiClass"] = 0x00000000] = "AnsiClass";

            // LPSTR is interpreted as Unicode.
            TypeAttributes[TypeAttributes["UnicodeClass"] = 0x00010000] = "UnicodeClass";

            // LPSTR is interpreted automatically.
            TypeAttributes[TypeAttributes["AutoClass"] = 0x00020000] = "AutoClass";

            // A non-standard encoding specified by CustomStringFormatMask.
            TypeAttributes[TypeAttributes["CustomFormatClass"] = 0x00030000] = "CustomFormatClass";

            // Use this mask to retrieve non-standard encoding information for native interop.
            // The meaning of the values of these 2 bits isunspecified.
            TypeAttributes[TypeAttributes["CustomStringFormatMask"] = 0x00C00000] = "CustomStringFormatMask";

            // Class Initialization Attributes
            // Initialize the class before first static field access.
            TypeAttributes[TypeAttributes["BeforeFieldInit"] = 0x00100000] = "BeforeFieldInit";

            // Additional Flags
            // CLI provides 'special' behavior, depending upon the name of the Type
            TypeAttributes[TypeAttributes["RTSpecialName"] = 0x00000800] = "RTSpecialName";

            // Type has security associate with it.
            TypeAttributes[TypeAttributes["HasSecurity"] = 0x00040000] = "HasSecurity";

            // This ExportedTypeEntry is a type forwarder.
            TypeAttributes[TypeAttributes["IsTypeForwarder"] = 0x00200000] = "IsTypeForwarder";
        })(managed.TypeAttributes || (managed.TypeAttributes = {}));
        var TypeAttributes = managed.TypeAttributes;

        // [ECMA-335 para23.1.5]
        (function (FieldAttributes) {
            // These 3 bits contain one of the following values:
            // CompilerControlled, Private,
            // FamANDAssem, Assembly,
            // Family, FamORAssem,
            // Public.
            FieldAttributes[FieldAttributes["FieldAccessMask"] = 0x0007] = "FieldAccessMask";

            // Member not referenceable.
            FieldAttributes[FieldAttributes["CompilerControlled"] = 0x0000] = "CompilerControlled";

            // Accessible only by the parent type.
            FieldAttributes[FieldAttributes["Private"] = 0x0001] = "Private";

            // Accessible by sub-types only in this Assembly.
            FieldAttributes[FieldAttributes["FamANDAssem"] = 0x0002] = "FamANDAssem";

            // Accessibly by anyone in the Assembly.
            FieldAttributes[FieldAttributes["Assembly"] = 0x0003] = "Assembly";

            // Accessible only by type and sub-types.
            FieldAttributes[FieldAttributes["Family"] = 0x0004] = "Family";

            // Accessibly by sub-types anywhere, plus anyone in assembly.
            FieldAttributes[FieldAttributes["FamORAssem"] = 0x0005] = "FamORAssem";

            // Accessibly by anyone who has visibility to this scope field contract attributes.
            FieldAttributes[FieldAttributes["Public"] = 0x0006] = "Public";

            // Defined on type, else per instance.
            FieldAttributes[FieldAttributes["Static"] = 0x0010] = "Static";

            // Field can only be initialized, not written to after init.
            FieldAttributes[FieldAttributes["InitOnly"] = 0x0020] = "InitOnly";

            // Value is compile time constant.
            FieldAttributes[FieldAttributes["Literal"] = 0x0040] = "Literal";

            // Reserved (to indicate this field should not be serialized when type is remoted).
            FieldAttributes[FieldAttributes["NotSerialized"] = 0x0080] = "NotSerialized";

            // Field is special.
            FieldAttributes[FieldAttributes["SpecialName"] = 0x0200] = "SpecialName";

            // Interop Attributes
            // Implementation is forwarded through PInvoke.
            FieldAttributes[FieldAttributes["PInvokeImpl"] = 0x2000] = "PInvokeImpl";

            // Additional flags
            // CLI provides 'special' behavior, depending upon the name of the field.
            FieldAttributes[FieldAttributes["RTSpecialName"] = 0x0400] = "RTSpecialName";

            // Field has marshalling information.
            FieldAttributes[FieldAttributes["HasFieldMarshal"] = 0x1000] = "HasFieldMarshal";

            // Field has default.
            FieldAttributes[FieldAttributes["HasDefault"] = 0x8000] = "HasDefault";

            // Field has RVA.
            FieldAttributes[FieldAttributes["HasFieldRVA"] = 0x0100] = "HasFieldRVA";
        })(managed.FieldAttributes || (managed.FieldAttributes = {}));
        var FieldAttributes = managed.FieldAttributes;

        // [ECMA-335 para23.1.6]
        (function (FileAttributes) {
            // This is not a resource file.
            FileAttributes[FileAttributes["ContainsMetaData"] = 0x0000] = "ContainsMetaData";

            // This is a resource file or other non-metadata-containing file.
            FileAttributes[FileAttributes["ContainsNoMetaData"] = 0x0001] = "ContainsNoMetaData";
        })(managed.FileAttributes || (managed.FileAttributes = {}));
        var FileAttributes = managed.FileAttributes;

        // [ECMA-335 para23.1.7]
        (function (GenericParamAttributes) {
            // These 2 bits contain one of the following values:
            // VarianceMask,
            // None,
            // Covariant,
            // Contravariant.
            GenericParamAttributes[GenericParamAttributes["VarianceMask"] = 0x0003] = "VarianceMask";

            // The generic parameter is non-variant and has no special constraints.
            GenericParamAttributes[GenericParamAttributes["None"] = 0x0000] = "None";

            // The generic parameter is covariant.
            GenericParamAttributes[GenericParamAttributes["Covariant"] = 0x0001] = "Covariant";

            // The generic parameter is contravariant.
            GenericParamAttributes[GenericParamAttributes["Contravariant"] = 0x0002] = "Contravariant";

            // These 3 bits contain one of the following values:
            // ReferenceTypeConstraint,
            // NotNullableValueTypeConstraint,
            // DefaultConstructorConstraint.
            GenericParamAttributes[GenericParamAttributes["SpecialConstraintMask"] = 0x001C] = "SpecialConstraintMask";

            // The generic parameter has the class special constraint.
            GenericParamAttributes[GenericParamAttributes["ReferenceTypeConstraint"] = 0x0004] = "ReferenceTypeConstraint";

            // The generic parameter has the valuetype special constraint.
            GenericParamAttributes[GenericParamAttributes["NotNullableValueTypeConstraint"] = 0x0008] = "NotNullableValueTypeConstraint";

            // The generic parameter has the .ctor special constraint.
            GenericParamAttributes[GenericParamAttributes["DefaultConstructorConstraint"] = 0x0010] = "DefaultConstructorConstraint";
        })(managed.GenericParamAttributes || (managed.GenericParamAttributes = {}));
        var GenericParamAttributes = managed.GenericParamAttributes;

        // [ECMA-335 para23.1.8]
        (function (PInvokeAttributes) {
            // PInvoke is to use the member name as specified.
            PInvokeAttributes[PInvokeAttributes["NoMangle"] = 0x0001] = "NoMangle";

            // Character set
            // These 2 bits contain one of the following values:
            // CharSetNotSpec,
            // CharSetAnsi,
            // CharSetUnicode,
            // CharSetAuto.
            PInvokeAttributes[PInvokeAttributes["CharSetMask"] = 0x0006] = "CharSetMask";

            PInvokeAttributes[PInvokeAttributes["CharSetNotSpec"] = 0x0000] = "CharSetNotSpec";
            PInvokeAttributes[PInvokeAttributes["CharSetAnsi"] = 0x0002] = "CharSetAnsi";
            PInvokeAttributes[PInvokeAttributes["CharSetUnicode"] = 0x0004] = "CharSetUnicode";
            PInvokeAttributes[PInvokeAttributes["CharSetAuto"] = 0x0006] = "CharSetAuto";

            // Information about target function. Not relevant for fields.
            PInvokeAttributes[PInvokeAttributes["SupportsLastError"] = 0x0040] = "SupportsLastError";

            // Calling convention
            // These 3 bits contain one of the following values:
            // CallConvPlatformapi,
            // CallConvCdecl,
            // CallConvStdcall,
            // CallConvThiscall,
            // CallConvFastcall.
            PInvokeAttributes[PInvokeAttributes["CallConvMask"] = 0x0700] = "CallConvMask";
            PInvokeAttributes[PInvokeAttributes["CallConvPlatformapi"] = 0x0100] = "CallConvPlatformapi";
            PInvokeAttributes[PInvokeAttributes["CallConvCdecl"] = 0x0200] = "CallConvCdecl";
            PInvokeAttributes[PInvokeAttributes["CallConvStdcall"] = 0x0300] = "CallConvStdcall";
            PInvokeAttributes[PInvokeAttributes["CallConvThiscall"] = 0x0400] = "CallConvThiscall";
            PInvokeAttributes[PInvokeAttributes["CallConvFastcall"] = 0x0500] = "CallConvFastcall";
        })(managed.PInvokeAttributes || (managed.PInvokeAttributes = {}));
        var PInvokeAttributes = managed.PInvokeAttributes;

        // [ECMA-335 para23.1.9]
        (function (ManifestResourceAttributes) {
            // These 3 bits contain one of the following values:
            ManifestResourceAttributes[ManifestResourceAttributes["VisibilityMask"] = 0x0007] = "VisibilityMask";

            // The Resource is exported from the Assembly.
            ManifestResourceAttributes[ManifestResourceAttributes["Public"] = 0x0001] = "Public";

            // The Resource is private to the Assembly.
            ManifestResourceAttributes[ManifestResourceAttributes["Private"] = 0x0002] = "Private";
        })(managed.ManifestResourceAttributes || (managed.ManifestResourceAttributes = {}));
        var ManifestResourceAttributes = managed.ManifestResourceAttributes;

        (function (MethodImplAttributes) {
            // These 2 bits contain one of the following values:
            // IL, Native, OPTIL, Runtime.
            MethodImplAttributes[MethodImplAttributes["CodeTypeMask"] = 0x0003] = "CodeTypeMask";

            // Method impl is CIL.
            MethodImplAttributes[MethodImplAttributes["IL"] = 0x0000] = "IL";

            // Method impl is native.
            MethodImplAttributes[MethodImplAttributes["Native"] = 0x0001] = "Native";

            // Reserved: shall be zero in conforming implementations.
            MethodImplAttributes[MethodImplAttributes["OPTIL"] = 0x0002] = "OPTIL";

            // Method impl is provided by the runtime.
            MethodImplAttributes[MethodImplAttributes["Runtime"] = 0x0003] = "Runtime";

            // Flags specifying whether the code is managed or unmanaged.
            // This bit contains one of the following values:
            // Unmanaged, Managed.
            MethodImplAttributes[MethodImplAttributes["ManagedMask"] = 0x0004] = "ManagedMask";

            // Method impl is unmanaged, otherwise managed.
            MethodImplAttributes[MethodImplAttributes["Unmanaged"] = 0x0004] = "Unmanaged";

            // Method impl is managed.
            MethodImplAttributes[MethodImplAttributes["Managed"] = 0x0000] = "Managed";

            // Implementation info and interop
            // Indicates method is defined; used primarily in merge scenarios.
            MethodImplAttributes[MethodImplAttributes["ForwardRef"] = 0x0010] = "ForwardRef";

            // Reserved: conforming implementations can ignore.
            MethodImplAttributes[MethodImplAttributes["PreserveSig"] = 0x0080] = "PreserveSig";

            // Reserved: shall be zero in conforming implementations.
            MethodImplAttributes[MethodImplAttributes["InternalCall"] = 0x1000] = "InternalCall";

            // Method is single threaded through the body.
            MethodImplAttributes[MethodImplAttributes["Synchronized"] = 0x0020] = "Synchronized";

            // Method cannot be inlined.
            MethodImplAttributes[MethodImplAttributes["NoInlining"] = 0x0008] = "NoInlining";

            // Range check value.
            MethodImplAttributes[MethodImplAttributes["MaxMethodImplVal"] = 0xffff] = "MaxMethodImplVal";

            // Method will not be optimized when generating native code.
            MethodImplAttributes[MethodImplAttributes["NoOptimization"] = 0x0040] = "NoOptimization";
        })(managed.MethodImplAttributes || (managed.MethodImplAttributes = {}));
        var MethodImplAttributes = managed.MethodImplAttributes;

        // [ECMA-335 para23.1.10]
        (function (MethodAttributes) {
            // These 3 bits contain one of the following values:
            // CompilerControlled,
            // Private,
            // FamANDAssem,
            // Assem,
            // Family,
            // FamORAssem,
            // Public
            MethodAttributes[MethodAttributes["MemberAccessMask"] = 0x0007] = "MemberAccessMask";

            // Member not referenceable.
            MethodAttributes[MethodAttributes["CompilerControlled"] = 0x0000] = "CompilerControlled";

            // Accessible only by the parent type.
            MethodAttributes[MethodAttributes["Private"] = 0x0001] = "Private";

            // Accessible by sub-types only in this Assembly.
            MethodAttributes[MethodAttributes["FamANDAssem"] = 0x0002] = "FamANDAssem";

            // Accessibly by anyone in the Assembly.
            MethodAttributes[MethodAttributes["Assem"] = 0x0003] = "Assem";

            // Accessible only by type and sub-types.
            MethodAttributes[MethodAttributes["Family"] = 0x0004] = "Family";

            // Accessibly by sub-types anywhere, plus anyone in assembly.
            MethodAttributes[MethodAttributes["FamORAssem"] = 0x0005] = "FamORAssem";

            // Accessibly by anyone who has visibility to this scope.
            MethodAttributes[MethodAttributes["Public"] = 0x0006] = "Public";

            // Defined on type, else per instance.
            MethodAttributes[MethodAttributes["Static"] = 0x0010] = "Static";

            // Method cannot be overridden.
            MethodAttributes[MethodAttributes["Final"] = 0x0020] = "Final";

            // Method is virtual.
            MethodAttributes[MethodAttributes["Virtual"] = 0x0040] = "Virtual";

            // Method hides by name+sig, else just by name.
            MethodAttributes[MethodAttributes["HideBySig"] = 0x0080] = "HideBySig";

            // Use this mask to retrieve vtable attributes. This bit contains one of the following values:
            // ReuseSlot, NewSlot.
            MethodAttributes[MethodAttributes["VtableLayoutMask"] = 0x0100] = "VtableLayoutMask";

            // Method reuses existing slot in vtable.
            MethodAttributes[MethodAttributes["ReuseSlot"] = 0x0000] = "ReuseSlot";

            // Method always gets a new slot in the vtable.
            MethodAttributes[MethodAttributes["NewSlot"] = 0x0100] = "NewSlot";

            // Method can only be overriden if also accessible.
            MethodAttributes[MethodAttributes["Strict"] = 0x0200] = "Strict";

            // Method does not provide an implementation.
            MethodAttributes[MethodAttributes["Abstract"] = 0x0400] = "Abstract";

            // Method is special.
            MethodAttributes[MethodAttributes["SpecialName"] = 0x0800] = "SpecialName";

            // Interop attributes
            // Implementation is forwarded through PInvoke.
            MethodAttributes[MethodAttributes["PInvokeImpl"] = 0x2000] = "PInvokeImpl";

            // Reserved: shall be zero for conforming implementations.
            MethodAttributes[MethodAttributes["UnmanagedExport"] = 0x0008] = "UnmanagedExport";

            // Additional flags
            // CLI provides 'special' behavior, depending upon the name of the method.
            MethodAttributes[MethodAttributes["RTSpecialName"] = 0x1000] = "RTSpecialName";

            // Method has security associated with it.
            MethodAttributes[MethodAttributes["HasSecurity"] = 0x4000] = "HasSecurity";

            // Method calls another method containing security code.
            MethodAttributes[MethodAttributes["RequireSecObject"] = 0x8000] = "RequireSecObject";
        })(managed.MethodAttributes || (managed.MethodAttributes = {}));
        var MethodAttributes = managed.MethodAttributes;

        // [ECMA-335 para23.1.12]
        (function (MethodSemanticsAttributes) {
            // Setter for property.
            MethodSemanticsAttributes[MethodSemanticsAttributes["Setter"] = 0x0001] = "Setter";

            // Getter for property.
            MethodSemanticsAttributes[MethodSemanticsAttributes["Getter"] = 0x0002] = "Getter";

            // Other method for property or event.
            MethodSemanticsAttributes[MethodSemanticsAttributes["Other"] = 0x0004] = "Other";

            // AddOn method for event.
            // This refers to the required add_ method for events.  (ECMA-335 para22.13)
            MethodSemanticsAttributes[MethodSemanticsAttributes["AddOn"] = 0x0008] = "AddOn";

            // RemoveOn method for event.
            // This refers to the required remove_ method for events. (ECMA-335 para22.13)
            MethodSemanticsAttributes[MethodSemanticsAttributes["RemoveOn"] = 0x0010] = "RemoveOn";

            // Fire method for event.
            // This refers to the optional raise_ method for events. (ECMA-335 para22.13)
            MethodSemanticsAttributes[MethodSemanticsAttributes["Fire"] = 0x0020] = "Fire";
        })(managed.MethodSemanticsAttributes || (managed.MethodSemanticsAttributes = {}));
        var MethodSemanticsAttributes = managed.MethodSemanticsAttributes;

        // [ECMA-335 para23.1.13]
        (function (ParamAttributes) {
            // Param is [In].
            ParamAttributes[ParamAttributes["In"] = 0x0001] = "In";

            // Param is [out].
            ParamAttributes[ParamAttributes["Out"] = 0x0002] = "Out";

            // Param is optional.
            ParamAttributes[ParamAttributes["Optional"] = 0x0010] = "Optional";

            // Param has default value.
            ParamAttributes[ParamAttributes["HasDefault"] = 0x1000] = "HasDefault";

            // Param has FieldMarshal.
            ParamAttributes[ParamAttributes["HasFieldMarshal"] = 0x2000] = "HasFieldMarshal";

            // Reserved: shall be zero in a conforming implementation.
            ParamAttributes[ParamAttributes["Unused"] = 0xcfe0] = "Unused";
        })(managed.ParamAttributes || (managed.ParamAttributes = {}));
        var ParamAttributes = managed.ParamAttributes;

        // [ECMA-335 para23.1.14]
        (function (PropertyAttributes) {
            // Property is special.
            PropertyAttributes[PropertyAttributes["SpecialName"] = 0x0200] = "SpecialName";

            // Runtime(metadata internal APIs) should check name encoding.
            PropertyAttributes[PropertyAttributes["RTSpecialName"] = 0x0400] = "RTSpecialName";

            // Property has default.
            PropertyAttributes[PropertyAttributes["HasDefault"] = 0x1000] = "HasDefault";

            // Reserved: shall be zero in a conforming implementation.
            PropertyAttributes[PropertyAttributes["Unused"] = 0xe9ff] = "Unused";
        })(managed.PropertyAttributes || (managed.PropertyAttributes = {}));
        var PropertyAttributes = managed.PropertyAttributes;

        // [ECMA-335 para23.2.3]
        (function (CallingConventions) {
            // Used to encode the keyword 'default' in the calling convention, see ECMA para15.3.
            CallingConventions[CallingConventions["Default"] = 0x0] = "Default";

            CallingConventions[CallingConventions["C"] = 0x1] = "C";

            CallingConventions[CallingConventions["StdCall"] = 0x2] = "StdCall";

            CallingConventions[CallingConventions["FastCall"] = 0x4] = "FastCall";

            // Used to encode the keyword 'vararg' in the calling convention, see ECMA para15.3.
            CallingConventions[CallingConventions["VarArg"] = 0x5] = "VarArg";

            // Used to indicate that the method has one or more generic parameters.
            CallingConventions[CallingConventions["Generic"] = 0x10] = "Generic";

            // Used to encode the keyword 'instance' in the calling convention, see ECMA para15.3.
            CallingConventions[CallingConventions["HasThis"] = 0x20] = "HasThis";

            // Used to encode the keyword 'explicit' in the calling convention, see ECMA para15.3.
            CallingConventions[CallingConventions["ExplicitThis"] = 0x40] = "ExplicitThis";

            // (ECMA para23.1.16), used to encode '.managed..' in the parameter list, see ECMA para15.3.
            CallingConventions[CallingConventions["Sentinel"] = 0x41] = "Sentinel";
        })(managed.CallingConventions || (managed.CallingConventions = {}));
        var CallingConventions = managed.CallingConventions;

        (function (TableKind) {
            // The rows in the Module table result from .module directives in the Assembly.
            TableKind[TableKind["ModuleDefinition"] = 0x00] = "ModuleDefinition";

            // Contains ResolutionScope, TypeName and TypeNamespace columns.
            TableKind[TableKind["ExternalType"] = 0x01] = "ExternalType";

            // The first row of the TypeDef table represents the pseudo class that acts as parent for functions and variables
            // defined at module scope.
            // If a type is generic, its parameters are defined in the GenericParam table (para22.20). Entries in the
            // GenericParam table reference entries in the TypeDef table; there is no reference from the TypeDef table to the
            // GenericParam table.
            TableKind[TableKind["TypeDefinition"] = 0x02] = "TypeDefinition";

            // Each row in the Field table results from a top-level .field directive, or a .field directive inside a
            // Type.
            TableKind[TableKind["FieldDefinition"] = 0x04] = "FieldDefinition";

            // Conceptually, every row in the MethodDef table is owned by one, and only one, row in the TypeDef table.
            // The rows in the MethodDef table result from .method directives (para15). The RVA column is computed when
            // the image for the PE file is emitted and points to the COR_ILMETHOD structure for the body of the method.
            TableKind[TableKind["MethodDefinition"] = 0x06] = "MethodDefinition";

            // Conceptually, every row in the Param table is owned by one, and only one, row in the MethodDef table.
            // The rows in the Param table result from the parameters in a method declaration (para15.4), or from a .param
            // attribute attached to a method.
            TableKind[TableKind["ParameterDefinition"] = 0x08] = "ParameterDefinition";

            // Combines two sorts of references, to Methods and to Fields of a class, known as 'MethodRef' and 'FieldRef', respectively.
            // An entry is made into the MemberRef table whenever a reference is made in the CIL code to a method or field
            // which is defined in another module or assembly.  (Also, an entry is made for a call to a method with a VARARG
            // signature, even when it is defined in the same module as the call site.)
            TableKind[TableKind["MemberRef"] = 0x0A] = "MemberRef";

            // Used to store compile-time, constant values for fields, parameters, and properties.
            TableKind[TableKind["Constant"] = 0x0B] = "Constant";

            // Stores data that can be used to instantiate a Custom Attribute (more precisely, an
            // object of the specified Custom Attribute class) at runtime.
            // A row in the CustomAttribute table for a parent is created by the .custom attribute, which gives the value of
            // the Type column and optionally that of the Value column.
            TableKind[TableKind["CustomAttribute"] = 0x0C] = "CustomAttribute";

            // The FieldMarshal table  'links' an existing row in the Field or Param table, to information
            // in the Blob heap that defines how that field or parameter (which, as usual, covers the method return, as
            // parameter number 0) shall be marshalled when calling to or from unmanaged code via PInvoke dispatch.
            // A row in the FieldMarshal table is created if the .field directive for the parent field has specified a marshal attribute.
            TableKind[TableKind["FieldMarshal"] = 0x0D] = "FieldMarshal";

            // The rows of the DeclSecurity table are filled by attaching a .permission or .permissionset directive
            // that specifies the Action and PermissionSet on a parent assembly or parent type or method.
            TableKind[TableKind["DeclSecurity"] = 0x0E] = "DeclSecurity";

            // Used to define how the fields of a class or value type shall be laid out by the CLI.
            // (Normally, the CLI is free to reorder and/or insert gaps between the fields defined for a class or value type.)
            TableKind[TableKind["ClassLayout"] = 0x0F] = "ClassLayout";

            // Records the interfaces a type implements explicitly.  Conceptually, each row in the
            // InterfaceImpl table indicates that Class implements Interface.
            TableKind[TableKind["InterfaceImpl"] = 0x09] = "InterfaceImpl";

            // A row in the FieldLayout table is created if the .field directive for the parent field has specified a field offset.
            TableKind[TableKind["FieldLayout"] = 0x10] = "FieldLayout";

            // Signatures are stored in the metadata Blob heap.  In most cases, they are indexed by a column in some table -
            // Field.Signature, Method.Signature, MemberRef.Signature, etc.  However, there are two cases that require a
            // metadata token for a signature that is not indexed by any metadata table.  The StandAloneSig table fulfils this
            // need.  It has just one column, which points to a Signature in the Blob heap.
            TableKind[TableKind["StandAloneSig"] = 0x11] = "StandAloneSig";

            // The EventMap and Event tables result from putting the .event directive on a class.
            TableKind[TableKind["EventMap"] = 0x12] = "EventMap";

            // The EventMap and Event tables result from putting the .event directive on a class.
            TableKind[TableKind["Event"] = 0x14] = "Event";

            // The PropertyMap and Property tables result from putting the .property directive on a class.
            TableKind[TableKind["PropertyMap"] = 0x15] = "PropertyMap";

            // Does a little more than group together existing rows from other tables.
            TableKind[TableKind["PropertyDefinition"] = 0x17] = "PropertyDefinition";

            // The rows of the MethodSemantics table are filled by .property and .event directives.
            TableKind[TableKind["MethodSemantics"] = 0x18] = "MethodSemantics";

            // s let a compiler override the default inheritance rules provided by the CLI. Their original use
            // was to allow a class C, that inherited method M from both interfaces I and J, to provide implementations for
            // both methods (rather than have only one slot for M in its vtable). However, MethodImpls can be used for other
            // reasons too, limited only by the compiler writer�s ingenuity within the constraints defined in the Validation rules.
            // ILAsm uses the .override directive to specify the rows of the MethodImpl table.
            TableKind[TableKind["MethodImpl"] = 0x19] = "MethodImpl";

            // The rows in the ModuleRef table result from .module extern directives in the Assembly.
            TableKind[TableKind["ModuleRef"] = 0x1A] = "ModuleRef";

            //  Contains just one column, which indexes the specification of a Type, stored in the Blob heap.
            //  This provides a metadata token for that Type (rather than simply an index into the Blob heap). This is required,
            //  typically, for array operations, such as creating, or calling methods on the array class.
            //  Note that TypeSpec tokens can be used with any of the CIL instructions that take a TypeDef or TypeRef token;
            //  specifically, castclass, cpobj, initobj, isinst, ldelema, ldobj, mkrefany, newarr, refanyval, sizeof, stobj,
            //  box, and unbox.
            TableKind[TableKind["TypeSpec"] = 0x1B] = "TypeSpec";

            // Holds information about unmanaged methods that can be reached from managed code,
            // using PInvoke dispatch.
            // A row is entered in the ImplMap table for each parent Method (para15.5) that is defined with a .pinvokeimpl
            // interoperation attribute specifying the MappingFlags, ImportName, and ImportScope.
            TableKind[TableKind["ImplMap"] = 0x1C] = "ImplMap";

            // Conceptually, each row in the FieldRVA table is an extension to exactly one row in the Field table, and records
            // the RVA (Relative Virtual Address) within the image file at which this field�s initial value is stored.
            // A row in the FieldRVA table is created for each static parent field that has specified the optional data
            // label.  The RVA column is the relative virtual address of the data in the PE file.
            TableKind[TableKind["FieldRVA"] = 0x1D] = "FieldRVA";

            // ECMA-335 para22.2.
            TableKind[TableKind["AssemblyDefinition"] = 0x20] = "AssemblyDefinition";

            // ECMA-335 para22.4 Shall be ignored by the CLI.
            TableKind[TableKind["AssemblyProcessor"] = 0x21] = "AssemblyProcessor";

            // ECMA-335 para22.3 Shall be ignored by the CLI.
            TableKind[TableKind["AssemblyOS"] = 0x22] = "AssemblyOS";

            // The table is defined by the .assembly extern directive (para6.3).  Its columns are filled using directives
            // similar to those of the Assembly table except for the PublicKeyOrToken column, which is defined using the
            // .publickeytoken directive.
            TableKind[TableKind["AssemblyRef"] = 0x23] = "AssemblyRef";

            // ECMA-335 para22.7 Shall be ignored by the CLI.
            TableKind[TableKind["AssemblyRefProcessor"] = 0x24] = "AssemblyRefProcessor";

            // ECMA-335 para22.6 Shall be ignored by the CLI.
            TableKind[TableKind["AssemblyRefOS"] = 0x25] = "AssemblyRefOS";

            // The rows of the File table result from .file directives in an Assembly.
            TableKind[TableKind["File"] = 0x26] = "File";

            // Holds a row for each type:
            // a. Defined within other modules of this Assembly; that is exported out of this Assembly.  In essence, it
            // stores TypeDef row numbers of all types that are marked public in other modules that this Assembly
            // comprises.
            // The actual target row in a TypeDef table is given by the combination of TypeDefId (in effect, row
            // number) and Implementation (in effect, the module that holds the target TypeDef table).  Note that this
            // is the only occurrence in metadata of foreign tokens; that is, token values that have a meaning in
            // another module.  (A regular token value is an index into a table in the current module); OR
            // b. Originally defined in this Assembly but now moved to another Assembly. Flags must have
            // IsTypeForwarder set and Implementation is an AssemblyRef indicating the Assembly the type may
            // now be found in.
            TableKind[TableKind["ExportedType"] = 0x27] = "ExportedType";

            //  The rows in the table result from .mresource directives on the Assembly.
            TableKind[TableKind["ManifestResource"] = 0x28] = "ManifestResource";

            // NestedClass is defined as lexically 'inside' the text of its enclosing Type.
            TableKind[TableKind["NestedClass"] = 0x29] = "NestedClass";

            // Stores the generic parameters used in generic type definitions and generic method
            // definitions.  These generic parameters can be constrained (i.e., generic arguments shall extend some class
            // and/or implement certain interfaces) or unconstrained.  (Such constraints are stored in the
            // GenericParamConstraint table.)
            // Conceptually, each row in the GenericParam table is owned by one, and only one, row in either the TypeDef or
            // MethodDef tables.
            TableKind[TableKind["GenericParam"] = 0x2A] = "GenericParam";

            // Records the signature of an instantiated generic method.
            // Each unique instantiation of a generic method (i.e., a combination of Method and Instantiation) shall be
            // represented by a single row in the table.
            TableKind[TableKind["MethodSpec"] = 0x2B] = "MethodSpec";

            // Records the constraints for each generic parameter.  Each generic parameter
            // can be constrained to derive from zero or one class.  Each generic parameter can be constrained to implement
            // zero or more interfaces.
            // Conceptually, each row in the GenericParamConstraint table is ?owned� by a row in the GenericParam table.
            TableKind[TableKind["GenericParamConstraint"] = 0x2C] = "GenericParamConstraint";
        })(managed.TableKind || (managed.TableKind = {}));
        var TableKind = managed.TableKind;

        var AssemblyDefinition = (function () {
            function AssemblyDefinition() {
                this.headers = null;
                // HashAlgId shall be one of the specified values. [ERROR]
                this.hashAlgId = AssemblyHashAlgorithm.None;
                // MajorVersion, MinorVersion, BuildNumber, and RevisionNumber can each have any value.
                this.version = "";
                // Flags shall have only those values set that are specified. [ERROR]
                this.flags = 0;
                // publicKey can be null or non-null.
                // (note that the Flags.PublicKey bit specifies whether the 'blob' is a full public key, or the short hashed token).
                this.publicKey = "";
                // Name shall index a non-empty string in the String heap. [ERROR]
                // . The string indexed by Name can be of unlimited length.
                this.name = "";
                // Culture  can be null or non-null.
                // If Culture is non-null, it shall index a single string from the list specified (ECMA-335 para23.1.3). [ERROR]
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
                // Ushort
                this.generation = 0;
                this.name = "";
                // The mvid column shall index a unique GUID in the GUID heap (ECMA-335 para24.2.5)
                // that identifies this instance of the module.
                // The mvid can be ignored on read by conforming implementations of the CLI.
                // The mvid should be newly generated for every module,
                // using the algorithm specified in ISO/IEC 11578:1996
                // (Annex A) or another compatible algorithm.
                // [Rationale: While the VES itself makes no use of the Mvid,
                // other tools (such as debuggers, which are outside the scope of this standard)
                // rely on the fact that the <see cref="Mvid"/> almost always differs from one module to another.
                // end rationale]
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
            function TypeReference() {
            }
            TypeReference.prototype.getName = function () {
                throw new Error("Not implemented.");
            };
            TypeReference.prototype.getNamespace = function () {
                throw new Error("Not implemented.");
            };

            TypeReference.prototype.toString = function () {
                var ns = this.getNamespace();
                var nm = this.getName();
                if (ns && ns.length)
                    return ns + "." + nm;
                else
                    return nm;
            };
            return TypeReference;
        })();
        managed.TypeReference = TypeReference;

        // TODO: resolve to the actual type on creation
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

        // TODO: resolve to the actual type on creation
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
                // A 4-byte bitmask of type TypeAttributes, ECMA-335 para23.1.15.
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
                return this.name + (this.type ? ": " + this.type : "") + (this.value ? " = " + this.value : "");
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
            function FieldSignature() {
            }
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
                // The MethodDefEntry.RVA column is computed when the image for the PE file is emitted
                // and points to the COR_ILMETHOD structure
                // for the body of the method (ECMA-335 para25.4)
                this.internalRva = 0;
                this.internalParamList = 0;
            }
            MethodDefinition.prototype.toString = function () {
                var result = this.name;
                result += "(";
                if (this.parameters) {
                    for (var i = 0; i < this.parameters.length; i++) {
                        if (i > 0)
                            result += ", ";
                        result += this.parameters[i];
                        if (this.signature && this.signature.parameters && i < this.signature.parameters.length)
                            result += ": " + this.signature.parameters[i].type;
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
            function LocalVariable() {
            }
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
            KnownType.prototype.getName = function () {
                return this.name;
            };
            KnownType.prototype.getNamespace = function () {
                return "System";
            };

            KnownType.internalGetByElementName = function (elementType) {
                var result = KnownType.byElementType[elementType];
                return result;
            };

            KnownType.prototype.toString = function () {
                return this.getNamespace() + "." + this.getName();
            };
            KnownType.byElementType = [];

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
                if (this.extraParameters && this.extraParameters.length) {
                    if (result.length > 1)
                        result += ", " + this.extraParameters.join(", ");
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

                this.readHasCustomAttribute = this.createCodedIndexReader(TableKind.MethodDefinition, TableKind.FieldDefinition, TableKind.ExternalType, TableKind.TypeDefinition, TableKind.ParameterDefinition, TableKind.InterfaceImpl, TableKind.MemberRef, TableKind.ModuleDefinition, 0xFFFF, TableKind.PropertyDefinition, TableKind.Event, TableKind.StandAloneSig, TableKind.ModuleRef, TableKind.TypeSpec, TableKind.AssemblyDefinition, TableKind.AssemblyRef, TableKind.File, TableKind.ExportedType, TableKind.ManifestResource, TableKind.GenericParam, TableKind.GenericParamConstraint, TableKind.MethodSpec);

                this.readCustomAttributeType = this.createCodedIndexReader(0xFFFF, 0xFFFF, TableKind.MethodDefinition, TableKind.MemberRef, 0xFFFF);

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
                if (pos == 0) {
                    result = null;
                } else {
                    result = this.stringHeapCache[pos];

                    if (!result) {
                        if (pos > this.streams.strings.size)
                            throw new Error("String heap position overflow.");

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

                if (index == 0)
                    return null;
                else
                    return this.streams.guids[(index - 1) / 16];
            };

            TableStreamReader.prototype.readBlobHex = function () {
                var blobIndex = this.readBlobIndex();
                var saveOffset = this.baseReader.offset;

                this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
                var length = this.readBlobSize();

                var result = "";
                for (var i = 0; i < length; i++) {
                    var hex = this.baseReader.readByte().toString(16);
                    if (hex.length == 1)
                        result += "0";
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
                if (b0 < 0x80) {
                    length = b0;
                } else {
                    var b1 = this.baseReader.readByte();

                    if ((b0 & 0xC0) == 0x80) {
                        length = ((b0 & 0x3F) << 8) + b1;
                    } else {
                        var b2 = this.baseReader.readByte();
                        var b3 = this.baseReader.readByte();
                        length = ((b0 & 0x3F) << 24) + (b1 << 16) + (b2 << 8) + b3;
                    }
                }

                return length;
            };

            TableStreamReader.prototype.readTableRowIndex = function (tableIndex) {
                var tableRows = this.tables[tableIndex];

                return this.readPos(tableRows ? tableRows.length : 0);
            };

            TableStreamReader.prototype.createCodedIndexReader = function () {
                var tableTypes = [];
                for (var _i = 0; _i < (arguments.length - 0); _i++) {
                    tableTypes[_i] = arguments[_i + 0];
                }
                var _this = this;
                var tableDebug = [];
                var maxTableLength = 0;
                for (var i = 0; i < tableTypes.length; i++) {
                    var table = this.tables[tableTypes[i]];
                    if (!table) {
                        tableDebug.push(null);
                        continue;
                    }

                    tableDebug.push(table.length);
                    maxTableLength = Math.max(maxTableLength, table.length);
                }

                function calcRequredBitCount(maxValue) {
                    var bitMask = maxValue;
                    var result = 0;

                    while (bitMask != 0) {
                        result++;
                        bitMask >>= 1;
                    }

                    return result;
                }

                var tableKindBitCount = calcRequredBitCount(tableTypes.length - 1);
                var tableIndexBitCount = calcRequredBitCount(maxTableLength);

                //var debug = { maxTableLength: maxTableLength, calcRequredBitCount: calcRequredBitCount, tableLengths: tableDebug };
                return function () {
                    var result = tableKindBitCount + tableIndexBitCount <= 16 ? _this.baseReader.readShort() : _this.baseReader.readInt();

                    //debug.toString();
                    var resultIndex = result >> tableKindBitCount;
                    var resultTableIndex = result - (resultIndex << tableKindBitCount);

                    var table = tableTypes[resultTableIndex];

                    if (resultIndex == 0)
                        return null;

                    resultIndex--;

                    var row = _this.tables[table][resultIndex];

                    return row;
                };
            };

            TableStreamReader.prototype.readPos = function (spaceSize) {
                if (spaceSize < 65535)
                    return this.baseReader.readShort();
                else
                    return this.baseReader.readInt();
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
                if (leadByte !== 0x0A)
                    throw new Error("Incorrect lead byte " + leadByte + " in MethodSpec signature.");

                var genArgCount = this.readCompressedInt();
                instantiation.length = genArgCount;

                for (var i = 0; i < genArgCount; i++) {
                    var type = this.readSigTypeReference();
                    instantiation.push(type);
                }

                this.baseReader.offset = saveOffset;
            };

            // ECMA-335 para23.2.1, 23.2.2, 23.2.3
            TableStreamReader.prototype.readSigMethodDefOrRefOrStandalone = function (sig) {
                var b = this.baseReader.readByte();

                sig.callingConvention = b;

                var genParameterCount = b & CallingConventions.Generic ? this.readCompressedInt() : 0;

                var paramCount = this.readCompressedInt();

                var returnTypeCustomModifiers = this.readSigCustomModifierList();
                var returnType = this.readSigTypeReference();

                sig.parameters = [];

                sig.extraParameters = (sig.callingConvention & CallingConventions.VarArg) || (sig.callingConvention & CallingConventions.C) ? [] : null;

                for (var i = 0; i < paramCount; i++) {
                    var p = this.readSigParam();

                    if (sig.extraParameters && sig.extraParameters.length > 0) {
                        sig.extraParameters.push(p);
                    } else {
                        if (sig.extraParameters && this.baseReader.peekByte() === CallingConventions.Sentinel) {
                            this.baseReader.offset++;
                            sig.extraParameters.push(p);
                        } else {
                            sig.parameters.push(p);
                        }
                    }
                }
            };

            // ECMA-335 para23.2.4
            TableStreamReader.prototype.readFieldSignature = function (definition) {
                var blobIndex = this.readBlobIndex();
                var saveOffset = this.baseReader.offset;

                this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
                var length = this.readBlobSize();

                var leadByte = this.baseReader.readByte();
                if (leadByte !== 0x06)
                    throw new Error("Field signature lead byte 0x" + leadByte.toString(16).toUpperCase() + " is invalid.");

                definition.customModifiers = this.readSigCustomModifierList();

                definition.type = this.readSigTypeReference();

                this.baseReader.offset = saveOffset;
            };

            // ECMA-335 para23.2.5
            TableStreamReader.prototype.readPropertySignature = function (definition) {
                var blobIndex = this.readBlobIndex();
                var saveOffset = this.baseReader.offset;

                this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
                var length = this.readBlobSize();

                var leadByte = this.baseReader.readByte();
                if (!(leadByte & 0x08))
                    throw new Error("Property signature lead byte 0x" + leadByte.toString(16).toUpperCase() + " is invalid.");

                definition.isStatic = !(leadByte & CallingConventions.HasThis);

                var paramCount = this.readCompressedInt();

                definition.customModifiers = this.readSigCustomModifierList();

                definition.type = this.readSigTypeReference();

                if (!definition.parameters)
                    definition.parameters = [];
                definition.parameters.length = paramCount;

                for (var i = 0; i < paramCount; i++) {
                    definition.parameters[i] = this.readSigParam();
                }

                this.baseReader.offset = saveOffset;
            };

            // ECMA-335 para23.2.6, 23.2.9
            TableStreamReader.prototype.readSigLocalVar = function () {
                var leadByte = this.baseReader.readByte();
                if (leadByte !== 0x07)
                    throw new Error("LocalVarSig signature lead byte 0x" + leadByte.toString(16).toUpperCase() + " is invalid.");

                var count = this.readCompressedInt();
                var result = Array(count);

                for (var i = 0; i < count; i++) {
                    var v = new LocalVariable();

                    var varLeadByte = this.baseReader.peekByte();
                    if (varLeadByte === ElementType.TypedByRef) {
                        this.baseReader.offset++;
                        v.type = KnownType.TypedReference;
                    } else {
                        while (true) {
                            var cmod = this.readSigCustomModifierOrNull();
                            if (cmod) {
                                if (!v.customModifiers)
                                    v.customModifiers = [];
                                v.customModifiers.push(cmod);
                                continue;
                            }

                            if (this.baseReader.peekByte() === ElementType.Pinned) {
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

            // ECMA-335 para23.2.7
            TableStreamReader.prototype.readSigCustomModifierOrNull = function () {
                var s = this.baseReader.peekByte();

                switch (s) {
                    case ElementType.CMod_Opt:
                        this.baseReader.offset++;
                        return new CustomModifier(false, this.readSigTypeDefOrRefOrSpecEncoded());

                    case ElementType.CMod_ReqD:
                        this.baseReader.offset++;
                        return new CustomModifier(true, this.readSigTypeDefOrRefOrSpecEncoded());

                    default:
                        return null;
                }
            };

            // ECMA-335 para23.2.8
            TableStreamReader.prototype.readSigTypeDefOrRefOrSpecEncoded = function () {
                var uncompressed = this.readCompressedInt();
                var index = Math.floor(uncompressed / 4);
                var tableKind = uncompressed - index * 4;

                var table;
                switch (tableKind) {
                    case 0:
                        table = this.tables[TableKind.TypeDefinition];
                        break;

                    case 1:
                        table = this.tables[TableKind.ExternalType];
                        break;

                    case 2:
                        table = this.tables[TableKind.TypeSpec];
                        break;

                    default:
                        throw new Error("Unknown table kind " + tableKind + " in encoded index.");
                }

                var typeReference = table[index - 1];

                return typeReference.definition ? typeReference.definition : typeReference;
            };

            TableStreamReader.prototype.readSigCustomModifierList = function () {
                var result = null;
                while (true) {
                    var mod = this.readSigCustomModifierOrNull();

                    if (!mod)
                        return result;

                    if (!result)
                        result = [];

                    result.push(mod);
                }
            };

            // ECMA-335 para23.2.10
            TableStreamReader.prototype.readSigParam = function () {
                var customModifiers = this.readSigCustomModifierList();
                var type = this.readSigTypeReference();
                return new ParameterSignature(customModifiers, type);
            };

            // ECMA-335 para23.2.11, para23.2.12
            TableStreamReader.prototype.readSigTypeReference = function () {
                var etype = this.baseReader.readByte();

                var directResult = KnownType.internalGetByElementName(etype);
                if (directResult)
                    return directResult;

                switch (etype) {
                    case ElementType.Ptr:
                        return new PointerType(this.readSigTypeReference());

                    case ElementType.ByRef:
                        return new ByRefType(this.readSigTypeReference());

                    case ElementType.ValueType:
                        var value_type = this.readSigTypeDefOrRefOrSpecEncoded();

                        //value_type.isValueType = true;
                        return value_type;

                    case ElementType.Class:
                        var value_type = this.readSigTypeDefOrRefOrSpecEncoded();

                        //value_type.isValueType = false;
                        return value_type;

                    case ElementType.Var:
                        var varIndex = this.readCompressedInt();
                        return new Var(varIndex);

                    case ElementType.Array:
                        var arrayElementType = this.readSigTypeReference();
                        return this.readSigArrayShape(arrayElementType);

                    case ElementType.GenericInst: {
                        var genInst = new GenericInstantiation();

                        var genLead = this.baseReader.readByte();
                        var isValueType;
                        switch (genLead) {
                            case ElementType.Class:
                                genInst.isValueType = false;
                                break;
                            case ElementType.ValueType:
                                genInst.isValueType = true;
                                break;
                            default:
                                throw new Error("Unexpected lead byte 0x" + genLead.toString(16).toUpperCase() + " in GenericInst type signature.");
                        }

                        genInst.genericType = this.readSigTypeDefOrRefOrSpecEncoded();
                        var genArgCount = this.readCompressedInt();
                        genInst.arguments = Array(genArgCount);
                        for (var iGen = 0; iGen < genArgCount; iGen++) {
                            genInst.arguments.push(this.readSigTypeReference());
                        }

                        return genInst;
                    }

                    case ElementType.FnPtr:
                        var fnPointer = new FunctionPointerType();
                        fnPointer.methodSignature = new MethodSignature();
                        this.readSigMethodDefOrRefOrStandalone(fnPointer.methodSignature);
                        return fnPointer;

                    case ElementType.SZArray:
                        return new SZArrayType(this.readSigTypeReference());

                    case ElementType.MVar:
                        var mvarIndex = this.readCompressedInt();
                        return new MVar(mvarIndex);

                    case ElementType.Sentinel:
                        return new SentinelType(this.readSigTypeReference());

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
                    default:
                        throw new Error("Unknown element type " + pe.io.formatEnum(etype, ElementType) + ".");
                }
            };

            // ECMA-335 para23.2.13
            TableStreamReader.prototype.readSigArrayShape = function (arrayElementType) {
                var rank = this.readCompressedInt();
                var dimensions = Array(rank);
                for (var i = 0; i < rank; i++) {
                    dimensions[i] = new ArrayDimensionRange();
                }

                var numSizes = this.readCompressedInt();
                for (var i = 0; i < numSizes; i++) {
                    dimensions[i].length = this.readCompressedInt();
                }

                var numLoBounds = this.readCompressedInt();
                for (var i = 0; i < numLoBounds; i++) {
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
                if (leadByte & 0x05) {
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

            // ECMA-335 paraII.23.2
            TableStreamReader.prototype.readCompressedInt = function () {
                var result;
                var b0 = this.baseReader.readByte();
                if (b0 < 0x80) {
                    result = b0;
                } else {
                    var b1 = this.baseReader.readByte();

                    if ((b0 & 0xC0) == 0x80) {
                        result = ((b0 & 0x3F) << 8) + b1;
                    } else {
                        var b2 = this.baseReader.readByte();
                        var b3 = this.baseReader.readByte();
                        result = ((b0 & 0x3F) << 24) + (b1 << 16) + (b2 << 8) + b3;
                    }
                }

                return result;
            };

            // ECMA-335 paraII.22.9
            TableStreamReader.prototype.readConstantValue = function (etype) {
                var blobIndex = this.readBlobIndex();
                var saveOffset = this.baseReader.offset;

                this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
                var length = this.readBlobSize();

                var result = this.readSigValue(etype, length);

                this.baseReader.offset = saveOffset;

                return result;
            };

            // ECMA-335 paraII.22.9 (in part of reading the actual value)
            TableStreamReader.prototype.readSigValue = function (etype, length) {
                switch (etype) {
                    case ElementType.Boolean:
                        return this.baseReader.readByte() !== 0;
                    case ElementType.Char:
                        return String.fromCharCode(this.baseReader.readShort());
                    case ElementType.I1:
                        var result = this.baseReader.readByte();
                        if (result > 0x7f)
                            result -= 0xff;
                        return result;
                    case ElementType.U1:
                        return this.baseReader.readByte();
                    case ElementType.I2:
                        var result = this.baseReader.readShort();
                        if (result > 0x7fff)
                            result -= 0xffff;
                        return result;
                    case ElementType.U2:
                        return this.baseReader.readShort();
                    case ElementType.I4:
                        var result = this.baseReader.readInt();
                        if (result > 0x7fffffff)
                            result -= 0xffffffff;
                        return result;
                    case ElementType.U4:
                        return this.baseReader.readInt();
                    case ElementType.I8:
                    case ElementType.U8:
                        return this.baseReader.readLong();
                    case ElementType.R4:
                        return this.baseReader.readInt();
                    case ElementType.R8:
                        return this.baseReader.readLong();
                    case ElementType.String:
                        var stringValue = "";
                        for (var iChar = 0; iChar < length / 2; iChar++) {
                            stringValue += String.fromCharCode(this.baseReader.readShort());
                        }
                        return stringValue;
                    case ElementType.Class:
                        var classRef = this.baseReader.readInt();
                        if (classRef === 0)
                            return null;
                        else
                            return classRef;
                    default:
                        return "Unknown element type " + etype + ".";
                }
            };

            // ECMA-335 paraII.2.3
            TableStreamReader.prototype.readCustomAttribute = function (ctorSignature) {
                var blobIndex = this.readBlobIndex();
                var saveOffset = this.baseReader.offset;

                this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
                var length = this.readBlobSize();

                var customAttribute = new CustomAttributeData();

                var prolog = this.baseReader.readShort();
                if (prolog !== 0x0001)
                    throw new Error("Incorrect prolog value 0x" + prolog.toString(16).toUpperCase() + " for CustomAttribute.");

                customAttribute.fixedArguments = [];
                for (var i = 0; i < ctorSignature.parameters.length; i++) {
                    var pType = ctorSignature.parameters[i].type;
                    customAttribute.fixedArguments.push(this.readSigFixedArg(pType));
                }

                var numNamed = this.baseReader.readShort();
                for (var i = 0; i < numNamed; i++) {
                    var namedLeadByte = this.baseReader.readByte();
                    var isField;
                    switch (namedLeadByte) {
                        case 0x53:
                            isField = true;
                        case 0x54:
                            isField = false;
                        default:
                            throw new Error("Incorrect leading byte " + namedLeadByte + " for named CustomAttribute argument.");
                    }

                    var fieldOrPropType = this.readSigFieldOrPropType();
                    var fieldOrPropName = this.readSigSerString();
                    var value = this.readSigFixedArg(fieldOrPropType);
                    customAttribute.namedArguments.push({ name: fieldOrPropName, type: fieldOrPropType, value: value });
                }

                this.baseReader.offset = saveOffset;

                return customAttribute;
            };

            TableStreamReader.prototype.readSigFixedArg = function (type) {
                var isArray = type.elementType && !type.dimensions;

                if (isArray) {
                    var szElements = [];
                    var numElem = this.baseReader.readInt();
                    for (var i = 0; i < numElem; i++) {
                        szElements.push(this.readSigElem(type.elementType));
                    }
                    return szElements;
                } else {
                    return this.readSigElem(type);
                }
            };

            TableStreamReader.prototype.readSigFieldOrPropType = function () {
                var etype = this.baseReader.readByte();

                var result = KnownType.internalGetByElementName(etype);
                if (result)
                    return result;

                switch (etype) {
                    case ElementType.SZArray:
                        var elementType = this.readSigFieldOrPropType();
                        return new SZArrayType(elementType);

                    case ElementType.CustomAttribute_Enum_:
                        var enumName = this.readSigSerString();
                        return new ExternalType(null, null, enumName);
                }
            };

            TableStreamReader.prototype.readSigSerString = function () {
                if (this.baseReader.peekByte() === 0xff)
                    return null;

                var packedLen = this.readCompressedInt();
                var result = this.baseReader.readUtf8Z(packedLen);
                return result;
            };

            TableStreamReader.prototype.readSigElem = function (type) {
                //switch (type) {
                //	case KnownType.Boolean:
                //		return new ConstantValue(this.baseReader.readByte() !== 0;
                //	case KnownType.Char:
                //		return String.fromCharCode(this.baseReader.readShort());
                //	case KnownType.Single:
                //		return { raw: this.baseReader.readInt() };
                //	case KnownType.Double:
                //		return { raw: this.baseReader.readLong() };
                //	case KnownType.Byte:
                //		return this.baseReader.readByte();
                //	case KnownType.Int16:
                //}
            };
            return TableStreamReader;
        })();
        managed.TableStreamReader = TableStreamReader;

        var TableStream = (function () {
            function TableStream() {
                this.reserved0 = 0;
                this.version = "";
                // byte
                this.heapSizes = 0;
                this.reserved1 = 0;
                this.tables = null;
                this.externalTypes = [];
                this.module = null;
                this.assembly = null;
            }
            TableStream.prototype.read = function (tableReader, streams) {
                this.reserved0 = tableReader.readInt();

                // Note those are bytes, not shorts!
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
                for (var tableIndex = 0; tableIndex < 32; tableIndex++) {
                    if (bits & 1) {
                        var rowCount = reader.readInt();
                        result[tableIndex] = rowCount;
                    }
                    bits = bits >> 1;
                }

                bits = valid.hi;
                for (var i = 0; i < 32; i++) {
                    var tableIndex = i + 32;
                    if (bits & 1) {
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

                for (var tk in TableKind) {
                    if (!TableKind.hasOwnProperty(tk))
                        continue;

                    var tkValue = TableKind[tk];
                    if (typeof (tkValue) !== "number")
                        continue;

                    tableTypes[tkValue] = managed[tk];
                }

                for (var tableIndex = 0; tableIndex < tableCounts.length; tableIndex++) {
                    var rowCount = tableCounts[tableIndex];
                    if (!rowCount)
                        continue;

                    this.initTable(tableIndex, rowCount, tableTypes[tableIndex]);
                }
            };

            TableStream.prototype.initTable = function (tableIndex, rowCount, TableType) {
                var tableRows = this.tables[tableIndex] = Array(rowCount);

                if (tableIndex === TableKind.ModuleDefinition && tableRows.length > 0) {
                    tableRows[0] = this.module;
                }

                if (tableIndex === TableKind.AssemblyDefinition && tableRows.length > 0) {
                    tableRows[0] = this.assembly;
                }

                for (var i = 0; i < rowCount; i++) {
                    if (!tableRows[i])
                        tableRows[i] = new TableType();

                    if (i === 0 && tableRows[i].isSingleton)
                        break;
                }
            };

            TableStream.prototype.readTables = function (reader, streams) {
                var tableStreamReader = new TableStreamReader(reader, streams, this.tables);

                for (var tableIndex = 0; tableIndex < 64; tableIndex++) {
                    var tableRows = this.tables[tableIndex];

                    if (!tableRows)
                        continue;

                    var singletonRow = null;

                    for (var i = 0; i < tableRows.length; i++) {
                        if (singletonRow) {
                            singletonRow.internalReadRow(tableStreamReader);
                            continue;
                        }

                        tableRows[i].internalReadRow(tableStreamReader);

                        if (i === 0) {
                            if (tableRows[i].isSingleton)
                                singletonRow = tableRows[i];
                        }
                    }
                }
            };
            return TableStream;
        })();
        managed.TableStream = TableStream;

        var AssemblyReader = (function () {
            function AssemblyReader() {
            }
            AssemblyReader.prototype.read = function (reader, assembly) {
                if (!assembly.headers) {
                    assembly.headers = new pe.headers.PEFileHeaders();
                    assembly.headers.read(reader);
                }

                reader.sections = assembly.headers.sectionHeaders;

                // read main managed headers
                reader.setVirtualOffset(assembly.headers.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr].address);

                var cdi = new ClrDirectory();
                cdi.read(reader);

                var saveOffset = reader.offset;
                reader.setVirtualOffset(cdi.metadataDir.address);

                var cme = new ClrMetadata();
                cme.read(reader);

                var mes = new MetadataStreams();
                mes.read(cdi.metadataDir.address, cme.streamCount, reader);

                if (!assembly.modules)
                    assembly.modules = [];

                if (!assembly.modules[0])
                    assembly.modules[0] = new ModuleDefinition();

                var mainModule = assembly.modules[0];
                mainModule.runtimeVersion = cdi.runtimeVersion;
                mainModule.imageFlags = cdi.imageFlags;

                mainModule.specificRuntimeVersion = cme.runtimeVersion;

                // reading tables
                reader.setVirtualOffset(mes.tables.address);
                var tas = new TableStream();
                tas.module = mainModule;
                tas.assembly = assembly;
                tas.read(reader, mes);

                this.populateTypes(mainModule, tas.tables);

                if (tas.tables[TableKind.ExternalType]) {
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

                if (!mainModule.types)
                    mainModule.types = [];
            };

            AssemblyReader.prototype.populateMembers = function (parentTable, getChildIndex, getChildren, childTable, getChildEntity) {
                if (!parentTable)
                    return;

                var childIndex = 0;
                for (var iParent = 0; iParent < parentTable.length; iParent++) {
                    var childCount = !childTable ? 0 : iParent + 1 < parentTable.length ? getChildIndex(parentTable[iParent + 1]) - 1 - childIndex : childTable.length - childIndex;

                    var parent = parentTable[iParent];

                    var children = getChildren(parent);

                    children.length = childCount;

                    for (var iChild = 0; iChild < childCount; iChild++) {
                        var entity = getChildEntity(childTable[childIndex + iChild]);
                        children[iChild] = entity;
                    }

                    childIndex += childCount;
                }
            };
            return AssemblyReader;
        })();
        managed.AssemblyReader = AssemblyReader;

        // This record should not be emitted into any PE file.
        // However, if present in a PE file, it shall be treated as if all its fields were zero.
        // It shall be ignored by the CLI.
        // [ECMA-335 para22.3]
        var AssemblyOS = (function () {
            function AssemblyOS() {
            }
            AssemblyOS.prototype.internalReadRow = function (reader) {
                this.osplatformID = reader.readInt();
                this.osVersion = reader.readInt() + "." + reader.readInt();
            };
            return AssemblyOS;
        })();
        managed.AssemblyOS = AssemblyOS;

        // This record should not be emitted into any PE file.
        // However, if present in a PE file, it should be treated as if its field were zero.
        // It should be ignored by the CLI.
        // [ECMA-335 para22.4]
        var AssemblyProcessor = (function () {
            function AssemblyProcessor() {
            }
            AssemblyProcessor.prototype.internalReadRow = function (reader) {
                this.processor = reader.readInt();
            };
            return AssemblyProcessor;
        })();
        managed.AssemblyProcessor = AssemblyProcessor;

        // The AssemblyRef table shall contain no duplicates
        // (where duplicate rows are deemd to be those having the same
        // MajorVersion, MinorVersion, BuildNumber, RevisionNumber, PublicKeyOrToken, Name, and Culture). [WARNING]
        // [ECMA-335 para22.5]
        var AssemblyRef = (function () {
            function AssemblyRef() {
            }
            AssemblyRef.prototype.internalReadRow = function (reader) {
                if (!this.definition)
                    this.definition = new AssemblyDefinition();

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

        // These records should not be emitted into any PE file.
        // However, if present in a PE file, they should be treated as-if their fields were zero.
        // They should be ignored by the CLI.
        // [ECMA-335 para22.6]
        var AssemblyRefOS = (function () {
            function AssemblyRefOS() {
            }
            AssemblyRefOS.prototype.internalReadRow = function (reader) {
                if (!this.definition)
                    this.definition = new AssemblyDefinition();

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

        // These records should not be emitted into any PE file.
        // However, if present in a PE file, they should be treated as-if their fields were zero.
        // They should be ignored by the CLI.
        // [ECMA-335 para22.7]
        var AssemblyRefProcessor = (function () {
            function AssemblyRefProcessor() {
            }
            AssemblyRefProcessor.prototype.internalReadRow = function (reader) {
                this.processor = reader.readInt();
            };
            return AssemblyRefProcessor;
        })();
        managed.AssemblyRefProcessor = AssemblyRefProcessor;

        // The ClassLayout table is used to define how the fields of a class or value type shall be laid out by the CLI.
        // (Normally, the CLI is free to reorder and/or insert gaps between the fields defined for a class or value type.)
        // A ClassLayout table can contain zero or more rows.
        // [ECMA-335 para22.8]
        // The rows of the ClassLayout table are defined
        // by placing .pack and .size directives on the body of the type declaration
        // in which this type is declared (ECMA-335 para10.2).
        // When either of these directives is omitted, its corresponding value is zero.  (See ECMA-335 para10.7.)
        var ClassLayout = (function () {
            function ClassLayout() {
            }
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
            ClrDirectory.prototype.read = function (clrDirReader) {
                // CLR header
                this.cb = clrDirReader.readInt();

                if (this.cb < ClrDirectory.clrHeaderSize)
                    throw new Error("Unexpectedly short CLR header structure " + this.cb + " reported by Cb field " + "(expected at least " + ClrDirectory.clrHeaderSize + ").");

                this.runtimeVersion = clrDirReader.readShort() + "." + clrDirReader.readShort();

                this.metadataDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());

                this.imageFlags = clrDirReader.readInt();

                // need to convert to meaningful value before sticking into ModuleDefinition
                this.entryPointToken = clrDirReader.readInt();

                this.resourcesDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());

                this.strongNameSignatureDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());

                this.codeManagerTableDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());

                this.vtableFixupsDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());

                this.exportAddressTableJumpsDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());

                this.managedNativeHeaderDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
            };
            ClrDirectory.clrHeaderSize = 72;
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
                if (this.mdSignature != ClrMetadataSignature.Signature)
                    throw new Error("Invalid CLR metadata signature field " + this.mdSignature.toString(16) + "h (expected " + ClrMetadataSignature.Signature.toString(16).toUpperCase() + "h).");

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

        // The Constant table is used to store compile-time, constant values for fields, parameters, and properties.
        // [ECMA-335 para22.9]
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

        // The TableKind.CustomAttribute table stores data that can be used to instantiate a Custom Attribute
        // (more precisely, an object of the specified Custom Attribute class) at runtime.
        // The column called Type is slightly misleading --
        // it actually indexes a constructor method --
        // the owner of that constructor method is the Type of the Custom Attribute.
        // A row in the CustomAttribute table for a parent is created by the .custom attribute,
        // which gives the value of the Type column and optionally that of the Value column (ECMA-335 para21).
        // [ECMA-335 para22.10]
        // All binary values are stored in little-endian format
        // (except for PackedLen items, which are used only as a count for the number of bytes to follow in a UTF8 string).
        var CustomAttribute = (function () {
            function CustomAttribute() {
            }
            CustomAttribute.prototype.internalReadRow = function (reader) {
                this.parent = reader.readHasCustomAttribute();

                this.type = reader.readCustomAttributeType();

                var attrBlob = reader.readBlob();
                this.value = new CustomAttributeData();
            };
            return CustomAttribute;
        })();
        managed.CustomAttribute = CustomAttribute;

        // All security custom attributes for a given security action on a method, type, or assembly shall be gathered together,
        // and one System.Security.PermissionSet instance shall be created, stored in the Blob heap, and referenced from the TableKind.DeclSecurity table.
        // [ECMA-335 para22.11]
        // The general flow from a compiler�s point of view is as follows.
        // The user specifies a custom attribute through some language-specific syntax that encodes a call to the attribute�s constructor.
        // If the attribute�s type is derived (directly or indirectly) from System.Security.Permissions.SecurityAttribute
        // then it is a security custom attribute and requires special treatment, as follows
        // (other custom attributes are handled by simply recording the constructor in the metadata as described in ECMA-335 para22.10).
        // The attribute object is constructed, and provides a method (CreatePermission)
        // to convert it into a security permission object (an object derived from System.Security.Permission).
        // All the permission objects attached to a given metadata item with the same security action are combined together into a System.Security.PermissionSet.
        // This permission set is converted into a form that is ready to be stored in XML using its ToXML method
        // to create a System.Security.SecurityElement.
        // Finally, the XML that is required for the metadata is created using the ToString method on the security element.
        var DeclSecurity = (function () {
            function DeclSecurity() {
            }
            DeclSecurity.prototype.internalReadRow = function (reader) {
                this.action = reader.readShort();
                this.parent = reader.readHasDeclSecurity();
                this.permissionSet = reader.readBlob();
            };
            return DeclSecurity;
        })();
        managed.DeclSecurity = DeclSecurity;

        // For each row, there shall be one add_ and one remove_ row in the TableKind.MethodSemantics table. [ERROR]
        // For each row, there can be zero or one raise_ row, as well as zero or more other rows in the TableKind.MethodSemantics table. [ERROR]
        // [ECMA-335 para22.13]
        // Events are treated within metadata much like Properties;
        // that is, as a way to associate a collection of methods defined on a given class.
        // There are two required methods (add_ and remove_) plus an optional one (raise_);
        // additonal methods with other names are also permitted (ECMA-335 para18).
        // All of the methods gathered together as an TableKind.Event shall be defined on the class (ECMA-335 paraI.8.11.4)
        // the association between a row in the TableKind.TypeDef table and the collection of methods
        // that make up a given Event is held in three separate tables (exactly analogous to the approach used for Properties).
        // Event tables do a little more than group together existing rows from other tables.
        // The TableKind.Event table has columns for EventFlags, Name, and EventType.
        // In addition, the TableKind.MethodSemantics table has a column to record whether the method it indexes is an add_, a remove_, a raise_, or other function.
        var Event = (function () {
            function Event() {
            }
            Event.prototype.internalReadRow = function (reader) {
                this.eventFlags = reader.readShort();
                this.name = reader.readString();
                this.eventType = reader.readTypeDefOrRef();
            };
            return Event;
        })();
        managed.Event = Event;

        // There shall be no duplicate rows, based upon Parent
        // (a given class has only one 'pointer' to the start of its event list). [ERROR]
        // There shall be no duplicate rows, based upon EventList
        // (different classes cannot share rows in the TableKind.Event table). [ERROR]
        // [ECMA-335 para22.12]
        // Note that TableKind.EventMap info does not directly influence runtime behavior;
        // what counts is the information stored for each method that the event comprises.
        // The TableKind.EventMap and TableKind.Event tables result from putting the .event directive on a class (ECMA-335 para18).
        var EventMap = (function () {
            function EventMap() {
            }
            EventMap.prototype.internalReadRow = function (reader) {
                this.parent = reader.readTableRowIndex(TableKind.TypeDefinition);
                this.eventList = reader.readTableRowIndex(TableKind.Event);
            };
            return EventMap;
        })();
        managed.EventMap = EventMap;

        // The TableKind.ExportedType table holds a row for each type:
        // a. Defined within other modules of this Assembly; that is exported out of this Assembly.
        // In essence, it stores TableKind.TypeDef row numbers of all types
        // that are marked public in other modules that this Assembly comprises.
        // The actual target row in a TableKind.TypeDef table is given by the combination of TypeDefId
        // (in effect, row number) and Implementation (in effect, the module that holds the target TableKind.TypeDef table).
        // Note that this is the only occurrence in metadata of foreign tokens;
        // that is, token values that have a meaning in another module.
        // (A regular token value is an index into a table in the current module);
        // OR
        // b. Originally defined in this Assembly but now moved to another Assembly.
        // Flags must have TypeAttributes.IsTypeForwarder set
        // and Implementation is an TableKind.AssemblyRef
        // indicating the Assembly the type may now be found in.
        // The full name of the type need not be stored directly.
        // Instead, it can be split into two parts at any included '.'
        // (although typically this is done at the last '.' in the full name).
        // The part preceding the '.' is stored as the TypeNamespace
        // and that following the '.' is stored as the TypeName.
        // If there is no '.' in the full name,
        // then the TypeNamespace shall be the index of the empty string.
        // [ECMA-335 para22.14]
        // The rows in the TableKind. table are the result of the .class extern directive (ECMA-335 para6.7).
        var ExportedType = (function () {
            function ExportedType() {
            }
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

        // Note that each Field in any Type is defined by its Signature.
        // When a Type instance (i.e., an object) is laid out by the CLI, each Field is one of four kinds:
        // * Scalar: for any member of built-in type, such as int32.
        // The size of the field is given by the size of that intrinsic, which varies between 1 and 8 bytes.
        // * ObjectRef: for ElementType.Class, ElementType.String, ElementType.Object,
        // ElementType.Array, ElementType.SZArray.
        // * Pointer: for ElementType.Ptr, ElementType.FNPtr.
        // * ValueType: for ElementType.VaueType.
        // The instance of that ValueType is actually laid out in this object,
        // so the size of the field is the size of that ValueType.
        // Note that metadata specifying explicit structure layout can be valid for use on one platform but not on another,
        // since some of the rules specified here are dependent on platform-specific alignment rules.
        // [ECMA-335 para22.16]
        // A row in the TableKind.FieldLayout table is created if the .field directive for the parent field has specified a field offset (ECMA-335 para16).
        var FieldLayout = (function () {
            function FieldLayout() {
            }
            FieldLayout.prototype.internalReadRow = function (reader) {
                this.offset = reader.readInt();
                this.field = reader.readTableRowIndex(TableKind.FieldDefinition);
            };
            return FieldLayout;
        })();
        managed.FieldLayout = FieldLayout;

        // The TabeKind.FieldMarshal table has two columns.
        // It 'links' an existing row in the TableKind.Field or TabeKind.Param table,
        // to information in the Blob heap that defines how that field or parameter
        // (which, as usual, covers the method return, as parameter number 0)
        // shall be marshalled when calling to or from unmanaged code via PInvoke dispatch.
        // [ECMA-335 para22.17]
        // Note that TableKind.FieldMarshal information is used only by code paths that arbitrate operation with unmanaged code.
        // In order to execute such paths, the caller, on most platforms, would be installed with elevated security permission.
        // Once it invokes unmanaged code, it lies outside the regime that the CLI can check--it is simply trusted not to violate the type system.
        // A row in the FieldMarshal table is created if the .field directive for the parent field has specified a marshal attribute (para16.1).
        var FieldMarshal = (function () {
            function FieldMarshal() {
            }
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

        // Conceptually, each row in the TableKind.FieldRVA table is an extension to exactly one row in the TableKind.Field table,
        // and records the RVA (Relative Virtual Address) within the image file at which this field�s initial value is stored.
        // A row in the TableKind.FieldRVA table is created for each static parent field that has specified the optional data label (ECMA-335 para16).
        // The RVA column is the relative virtual address of the data in the PE file (ECMA-335 para16.3).
        // [ECMA-335 para22.18]
        var FieldRVA = (function () {
            function FieldRVA() {
            }
            FieldRVA.prototype.internalReadRow = function (reader) {
                this.rva = reader.readInt();
                this.field = reader.readTableRowIndex(TableKind.FieldDefinition);
            };
            return FieldRVA;
        })();
        managed.FieldRVA = FieldRVA;

        // [ECMA-335 para22.19]
        var File = (function () {
            function File() {
            }
            File.prototype.internalReadRow = function (reader) {
                this.flags = reader.readInt();
                this.name = reader.readString();
                this.hashValue = reader.readBlobHex();
            };
            return File;
        })();
        managed.File = File;

        // The TableKind.GenericParam table stores the generic parameters used in generic type definitions and generic method definitions.
        // These generic parameters can be constrained
        // (i.e., generic arguments shall extend some class and/or implement certain interfaces)
        // or unconstrained.
        // (Such constraints are stored in the TableKind.GenericParamConstraint table.)
        // Conceptually, each row in the TableKind.GenericParam table is owned by one, and only one, row
        // in either the TableKind.TypeDef or TableKind.MethodDefinition tables.
        // [ECMA-335 para22.20]
        var GenericParam = (function () {
            function GenericParam() {
            }
            GenericParam.prototype.internalReadRow = function (reader) {
                this.number = reader.readShort();
                this.flags = reader.readShort();
                this.owner = reader.readTypeOrMethodDef();
                this.name = reader.readString();
            };
            return GenericParam;
        })();
        managed.GenericParam = GenericParam;

        // The TableKind.GenericParamConstraint table records the constraints for each generic parameter.
        // Each generic parameter can be constrained to derive from zero or one class.
        // Each generic parameter can be constrained to implement zero or more interfaces.
        // Conceptually, each row in the TableKind.GenericParamConstraint table is 'owned' by a row in the TableKind.GenericParam table.
        // All rows in the TableKind.GenericParamConstraint table for a given Owner shall refer to distinct constraints.
        // Note that if Constraint is a TableKind.TypeRef to System.ValueType,
        // then it means the constraint type shall be System.ValueType, or one of its sub types.
        // However, since System.ValueType itself is a reference type,
        // this particular mechanism does not guarantee that the type is a non-reference type.
        // [ECMA-335 para22.21]
        var GenericParamConstraint = (function () {
            function GenericParamConstraint() {
            }
            GenericParamConstraint.prototype.internalReadRow = function (reader) {
                this.owner = reader.readTableRowIndex(TableKind.GenericParam);
                this.constraint = reader.readTypeDefOrRef();
            };
            return GenericParamConstraint;
        })();
        managed.GenericParamConstraint = GenericParamConstraint;

        // The TabeKind.ImplMap table holds information about unmanaged methods
        // that can be reached from managed code, using PInvoke dispatch.
        // Each row of the TableKind.ImplMap table associates a row in the TableKind.MethodDefinition table
        // (MemberForwarded)
        // with the name of a routine (ImportName) in some unmanaged DLL (ImportScope).
        // [ECMA-335 para22.22]
        var ImplMap = (function () {
            function ImplMap() {
            }
            ImplMap.prototype.internalReadRow = function (reader) {
                this.mappingFlags = reader.readShort();
                this.memberForwarded = reader.readMemberForwarded();
                this.importName = reader.readString();
                this.importScope = reader.readTableRowIndex(TableKind.ModuleRef);
            };
            return ImplMap;
        })();
        managed.ImplMap = ImplMap;

        // The TableKind.InterfaceImpl table records the interfaces a type implements explicitly.
        // Conceptually, each row in the TableKind.InterfaceImpl table indicates that Class implements Interface.
        // There should be no duplicates in the TableKind.InterfaceImpl table, based upon non-null Class and Interface values  [WARNING]
        // There can be many rows with the same value for Class (since a class can implement many interfaces).
        // There can be many rows with the same value for Interface (since many classes can implement the same interface).
        // [ECMA-335 para22.23]
        var InterfaceImpl = (function () {
            function InterfaceImpl() {
            }
            InterfaceImpl.prototype.internalReadRow = function (reader) {
                this.classIndex = reader.readTableRowIndex(TableKind.TypeDefinition);
                this.interface = reader.readTypeDefOrRef();
            };
            return InterfaceImpl;
        })();
        managed.InterfaceImpl = InterfaceImpl;

        // [ECMA-335 para22.24]
        // The rows in the table result from .mresource directives on the Assembly (ECMA-335 para6.2.2).
        var ManifestResource = (function () {
            function ManifestResource() {
            }
            ManifestResource.prototype.internalReadRow = function (reader) {
                this.offset = reader.readInt();
                this.flags = reader.readInt();
                this.name = reader.readString();
                this.implementation = reader.readImplementation();
            };
            return ManifestResource;
        })();
        managed.ManifestResource = ManifestResource;

        // The TableKind.MemberRef table combines two sorts of references, to Methods and to Fields of a class,
        // known as 'MethodRef' and 'FieldRef', respectively.
        // [ECMA-335 para22.25]
        var MemberRef = (function () {
            function MemberRef() {
            }
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

                for (var i = 0; i < streamCount; i++) {
                    var range = new pe.io.AddressRange(reader.readInt(), reader.readInt());

                    range.address += metadataBaseAddress;

                    var name = this.readAlignedNameString(reader);

                    switch (name) {
                        case "#GUID":
                            guidRange = range;
                            continue;

                        case "#Strings":
                            this.strings = range;
                            continue;

                        case "#Blob":
                            this.blobs = range;
                            continue;

                        case "#~":
                        case "#-":
                            this.tables = range;
                            continue;
                    }

                    this[name] = range;
                }

                if (guidRange) {
                    var saveOffset = reader.offset;
                    reader.setVirtualOffset(guidRange.address);

                    this.guids = Array(guidRange.size / 16);
                    for (var i = 0; i < this.guids.length; i++) {
                        var guid = this.readGuidForStream(reader);
                        this.guids[i] = guid;
                    }

                    reader.offset = saveOffset;
                }
            };

            MetadataStreams.prototype.readAlignedNameString = function (reader) {
                var result = "";
                while (true) {
                    var b = reader.readByte();
                    if (b == 0)
                        break;

                    result += String.fromCharCode(b);
                }

                var skipCount = -1 + ((result.length + 4) & ~3) - result.length;
                for (var i = 0; i < skipCount; i++) {
                    reader.readByte();
                }

                return result;
            };

            MetadataStreams.prototype.readGuidForStream = function (reader) {
                var guid = "{";
                for (var i = 0; i < 4; i++) {
                    var hex = reader.readInt().toString(16);
                    guid += "00000000".substring(0, 8 - hex.length) + hex;
                }
                guid += "}";
                return guid;
            };
            return MetadataStreams;
        })();
        managed.MetadataStreams = MetadataStreams;

        // TableKind.MethodImpl tables let a compiler override the default inheritance rules provided by the CLI
        // [ECMA-335 para22.27]
        var MethodImpl = (function () {
            function MethodImpl() {
            }
            MethodImpl.prototype.internalReadRow = function (reader) {
                this.classIndex = reader.readTableRowIndex(TableKind.TypeDefinition);
                this.methodBody = reader.readMethodDefOrRef();
                this.methodDeclaration = reader.readMethodDefOrRef();
            };
            return MethodImpl;
        })();
        managed.MethodImpl = MethodImpl;

        // [ECMA-335 para22.28]
        // The rows of the TableKind.MethodSemantics table are filled
        // by .property (ECMA-335 para17) and .event directives (ECMA-335 para18). (See ECMA-335 para22.13 for more information.)
        // If this row is for an Event, and its Semantics is
        // MethodSemanticsAttributes.Addon
        // or MethodSemanticsAttributes.RemoveOn,
        // then the row in the TableKind.MethodDefinition table indexed by Method
        // shall take a Delegate as a parameter, and return void. [ERROR]
        // If this row is for an Event, and its Semantics is
        // MethodSemanticsAttributes.Fire,
        // then the row indexed in the TableKind.MethodDefinition table by Method
        // can return any type.
        var MethodSemantics = (function () {
            function MethodSemantics() {
            }
            MethodSemantics.prototype.internalReadRow = function (reader) {
                this.semantics = reader.readShort();
                this.method = reader.readTableRowIndex(TableKind.MethodDefinition);
                this.association = reader.readHasSemantics();
            };
            return MethodSemantics;
        })();
        managed.MethodSemantics = MethodSemantics;

        // One or more rows can refer to the same row in the TableKind.MethodDefinition or TableKind.MemberRef table.
        // (There can be multiple instantiations of the same generic method.)
        // [ECMA-335 para22.29]
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

        // The rows in the TableKind.ModuleRef table result from .module extern directives in the Assembly (ECMA-335 para6.5).
        // [ECMA-335 para22.31]
        var ModuleRef = (function () {
            function ModuleRef() {
            }
            ModuleRef.prototype.internalReadRow = function (reader) {
                this.name = reader.readString();
            };
            return ModuleRef;
        })();
        managed.ModuleRef = ModuleRef;

        // [ECMA-335 para22.32]
        var NestedClass = (function () {
            function NestedClass() {
            }
            NestedClass.prototype.internalReadRow = function (reader) {
                this.nestedClass = reader.readTableRowIndex(TableKind.TypeDefinition);
                this.enclosingClass = reader.readTableRowIndex(TableKind.TypeDefinition);
            };
            return NestedClass;
        })();
        managed.NestedClass = NestedClass;

        // The TableKind.PropertyMap and TableKind.Property tables result from putting the .property directive on a class (ECMA-335 para17).
        // [ECMA-335 para22.35]
        var PropertyMap = (function () {
            function PropertyMap() {
            }
            PropertyMap.prototype.internalReadRow = function (reader) {
                this.parent = reader.readTableRowIndex(TableKind.TypeDefinition);
                this.propertyList = reader.readTableRowIndex(TableKind.PropertyDefinition);
            };
            return PropertyMap;
        })();
        managed.PropertyMap = PropertyMap;

        // Signatures are stored in the metadata Blob heap.
        // In most cases, they are indexed by a column in some table --
        // FieldEntry.Signature, Method.Signature, MemberRef.Signature, etc.
        // However, there are two cases that require a metadata token for a signature
        // that is not indexed by any metadata table.
        // The TableKind.StandAloneSig table fulfils this need.
        // It has just one column, which points to a Signature in the Blob heap.
        // The signature shall describe either:
        // * a method � code generators create a row in the TableKind.StandAloneSig table for each occurrence of a calli CIL instruction.
        // That row indexes the call-site signature for the function pointer operand of the calli instruction.
        // * local variables � code generators create one row in the TableKind.StandAloneSig table for each method,
        // to describe all of its local variables.
        // The .locals directive (ECMA-335 para15.4.1) in ILAsm generates a row in the TableKind.StandAloneSig table.
        // [ECMA-335 para22.36]
        var StandAloneSig = (function () {
            function StandAloneSig() {
            }
            StandAloneSig.prototype.internalReadRow = function (reader) {
                this.signatureBlob = reader.readBlob();
            };
            return StandAloneSig;
        })();
        managed.StandAloneSig = StandAloneSig;

        // The TableKind.TypeSpec table has just one column,
        // which indexes the specification of a Type, stored in the Blob heap.
        // This provides a metadata token for that Type (rather than simply an index into the Blob heap).
        // This is required, typically, for array operations, such as creating, or calling methods on the array class.
        // [ECMA-335 para22.39]
        // Note that TypeSpec tokens can be used with any of the CIL instructions
        // that take a TypeDef or TypeRef token;
        // specifically, castclass, cpobj, initobj, isinst, ldelema, ldobj, mkrefany, newarr, refanyval, sizeof, stobj, box, and unbox.
        var TypeSpec = (function () {
            function TypeSpec() {
            }
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
    /// <reference path="io.ts" />
    /// <reference path="headers.ts" />
    (function (managed2) {
        /**
        * Global environment context for loading assemblies.
        * Avoids singletons.
        */
        var AppDomain = (function () {
            function AppDomain() {
                this.assemblies = [];
                /**
                * There always have to be mscorlib.
                * It has to exist for many things to work correctly. If one gets loaded later, it will assume the already created identity.
                */
                this.mscorlib = new Assembly();
                // creating a dummy mscorlib, including dummy predefined types
                this.mscorlib.name = "mscorlib";

                var objectType = new Type(null, this.mscorlib, "System", "Object");
                var valueType = new Type(objectType, this.mscorlib, "System", "ValueType");
                var enumType = new Type(valueType, this.mscorlib, "System", "Enum");

                this.mscorlib.types.push(new Type(valueType, this.mscorlib, "System", "Void"), new Type(valueType, this.mscorlib, "System", "Boolean"), new Type(valueType, this.mscorlib, "System", "Char"), new Type(valueType, this.mscorlib, "System", "SByte"), new Type(valueType, this.mscorlib, "System", "Byte"), new Type(valueType, this.mscorlib, "System", "Int16"), new Type(valueType, this.mscorlib, "System", "UInt16"), new Type(valueType, this.mscorlib, "System", "Int32"), new Type(valueType, this.mscorlib, "System", "UInt32"), new Type(valueType, this.mscorlib, "System", "Int64"), new Type(valueType, this.mscorlib, "System", "UInt64"), new Type(valueType, this.mscorlib, "System", "Single"), new Type(valueType, this.mscorlib, "System", "Double"), new Type(valueType, this.mscorlib, "System", "String"), new Type(objectType, this.mscorlib, "System", "TypedReference"), new Type(valueType, this.mscorlib, "System", "IntPtr"), new Type(valueType, this.mscorlib, "System", "UIntPtr"), objectType, valueType, enumType, new Type(objectType, this.mscorlib, "System", "Type"));

                this.assemblies.push(this.mscorlib);
            }
            /**
            * Read assembly in AppDomain from a binary stream.
            */
            AppDomain.prototype.read = function (reader) {
                var context = new AssemblyReading(this);
                var result = context.read(reader);
                this.assemblies.push(result);
                return result;
            };

            /**
            * Resolve assembly from already loaded ones.
            * If none exist, create a dummy one and return.
            */
            AppDomain.prototype.resolveAssembly = function (name, version, publicKey, culture) {
                var asm;
                for (var i = 0; i < this.assemblies.length; i++) {
                    var asm = this.assemblies[i];
                    if ((asm.name && name && asm.name.toLowerCase() === name.toLowerCase()) || (!asm.name && !name))
                        return asm;
                }

                if (name && name.toLowerCase() === "mscorlib" && this.assemblies[0].isSpeculative)
                    return this.assemblies[0];

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
                /**
                * Assemblies may be created speculatively to represent referenced, but not loaded assemblies.
                * The most common case is mscorlib, which almost always needs to exist, but not necessarily will be loaded first.
                * A speculatively-created assembly can get their true content populated later, if it's loaded properly.
                */
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
                this.referencedAssemblies = [];
                this.customAttributes = [];
            }
            Assembly.prototype.toString = function () {
                // emulate .NET assembly name format
                return this.name + ", Version=" + this.version + ", Culture=" + (this.culture ? this.culture : "neutral") + ", PublicKeyToken=" + (this.publicKey && this.publicKey.length ? this.publicKey : "null");
            };
            return Assembly;
        })();
        managed2.Assembly = Assembly;

        

        /**
        * Represents actual types, as well as referenced types from external libraries that aren't loaded
        * (in which case isSpeculative property is set to true).
        */
        var Type = (function () {
            function Type(baseType, assembly, namespace, name) {
                this.baseType = baseType;
                this.assembly = assembly;
                this.namespace = namespace;
                this.name = name;
                /** If an assembly is loaded, and a type from another assembly is required,
                * but that external assembly is not loaded yet,
                * that assembly and required types in it is created speculatively.
                * IF at any point later that assembly is loaded, it will populate an existing speculative assembly
                * and speculative types, rather than creating new distinct instances.
                */
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
                if (this.namespace && this.namespace.length)
                    return this.namespace + "." + this.name;
                else
                    return this.name;
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

            // this one is actually implemented a bit simpler than in the CLR
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
            FieldInfo.prototype.toString = function () {
                return this.name + (this.fieldType ? ": " + this.fieldType : "");
            };
            return FieldInfo;
        })();
        managed2.FieldInfo = FieldInfo;

        var PropertyInfo = (function () {
            function PropertyInfo() {
                this.name = '';
                this.propertyType = null;
                this.getAccessor = null;
                this.setAccessor = null;
            }
            return PropertyInfo;
        })();
        managed2.PropertyInfo = PropertyInfo;

        var MethodInfo = (function () {
            function MethodInfo() {
                this.name = '';
            }
            return MethodInfo;
        })();
        managed2.MethodInfo = MethodInfo;

        var ParameterInfo = (function () {
            function ParameterInfo() {
                this.name = '';
                this.parameterType = null;
            }
            return ParameterInfo;
        })();
        managed2.ParameterInfo = ParameterInfo;

        var EventInfo = (function () {
            function EventInfo() {
                this.addHandler = null;
                this.removeHandler = null;
            }
            return EventInfo;
        })();
        managed2.EventInfo = EventInfo;

        /**
        * State needed to process assembly loading.
        */
        var AssemblyReading = (function () {
            function AssemblyReading(appDomain) {
                this.appDomain = appDomain;
                this.reader = null;
                this.fileHeaders = null;
                this.managedHeaders = null;
            }
            AssemblyReading.prototype.read = function (reader) {
                this.reader = reader;

                this.readFileHeaders();

                this.readManagedHeaders();

                var result = this._createAssemblyFromTables();
                result.fileHeaders = this.fileHeaders;
                return result;
            };

            AssemblyReading.prototype._createAssemblyFromTables = function () {
                var stringIndices = this.managedHeaders.tableStream.stringIndices;

                var assemblyTable = this.managedHeaders.tableStream.tables[0x20];
                if (!assemblyTable || !assemblyTable.length)
                    return;

                var assemblyRow = assemblyTable[0];

                var moduleTable = this.managedHeaders.tableStream.tables[0x00];
                var typeDefTable = this.managedHeaders.tableStream.tables[0x02];
                var fieldTable = this.managedHeaders.tableStream.tables[0x04];
                var methodDefTable = this.managedHeaders.tableStream.tables[0x06];

                var assembly = this._getMscorlibIfThisShouldBeOne();

                var replaceMscorlibTypes = assembly ? assembly.types.slice(0, assembly.types.length) : null;

                if (!assembly)
                    assembly = new Assembly();

                assembly.name = stringIndices[assemblyRow.name];
                assembly.version = assemblyRow.majorVersion + "." + assemblyRow.minorVersion + "." + assemblyRow.revisionNumber + "." + assemblyRow.buildNumber;
                assembly.attributes = assemblyRow.flags;
                assembly.publicKey = this._readBlobHex(assemblyRow.publicKey);
                assembly.culture = stringIndices[assemblyRow.culture];

                moduleTable[0].def = assembly;

                var tcReader = new TableCompletionReader(this.managedHeaders.tableStream, this.managedHeaders.metadataStreams);

                for (var i = 0; i < this.managedHeaders.tableStream.tables.length; i++) {
                    var tab = this.managedHeaders.tableStream.tables[i];
                    if (tab) {
                        if (tab && tab.length && tab[0].complete) {
                            for (var j = 0; j < tab.length; j++) {
                                tab[j].complete(tcReader);
                            }
                        }
                    }
                }

                var assemblyRefTable = this.managedHeaders.tableStream.tables[0x23];
                if (assemblyRefTable) {
                    for (var i = 0; i < assemblyRefTable.length; i++) {
                        var assemblyRefRow = assemblyRefTable[i];

                        var assemblyRefName = stringIndices[assemblyRow.name];
                        var assemblyRefVersion = assemblyRow.majorVersion + "." + assemblyRow.minorVersion + "." + assemblyRow.revisionNumber + "." + assemblyRow.buildNumber;
                        var assemblyRefAttributes = assemblyRow.flags;
                        var assemblyRefPublicKey = this._readBlobHex(assemblyRow.publicKey);
                        var assemblyRefCulture = stringIndices[assemblyRow.culture];

                        var referencedAssembly = this.appDomain.resolveAssembly(assemblyRefName, assemblyRefVersion, assemblyRefPublicKey, assemblyRefCulture);

                        if (referencedAssembly.isSpeculative)
                            referencedAssembly.attributes = assemblyRefAttributes;

                        assembly.referencedAssemblies.push(referencedAssembly);
                    }
                }

                for (var i = 0; i < typeDefTable.length; i++) {
                    var typeDefRow = typeDefTable[i];

                    var typeName = stringIndices[typeDefRow.name];
                    var typeNamespace = stringIndices[typeDefRow.namespace];

                    var type = null;

                    if (replaceMscorlibTypes && typeNamespace === "System") {
                        for (var ityp = 0; ityp < replaceMscorlibTypes.length; ityp++) {
                            var typ = replaceMscorlibTypes[ityp];
                            if (typ.name === typeName) {
                                type = typ;
                                break;
                            }
                        }
                    }

                    if (!type) {
                        type = new Type(null, assembly, typeNamespace, typeName);

                        assembly.types.push(type);
                    }

                    var nextTypeDefRow = i + 1 < typeDefTable.length ? typeDefTable[i + 1] : null;

                    var firstField = typeDefRow.fieldList - 1;
                    var lastField = nextTypeDefRow ? nextTypeDefRow.fieldList - 1 : this.managedHeaders.tableStream.allFields.length;
                    for (var iField = firstField; iField < lastField; iField++) {
                        type.fields.push(this.managedHeaders.tableStream.allFields[iField]);
                    }

                    type.isSpeculative = false;
                }

                assembly.isSpeculative = false;

                return assembly;
            };

            AssemblyReading.prototype._getMscorlibIfThisShouldBeOne = function () {
                var stringIndices = this.managedHeaders.tableStream.stringIndices;

                var assemblyTable = this.managedHeaders.tableStream.tables[0x20];
                if (!assemblyTable || !assemblyTable.length)
                    return null;

                var assemblyRow = assemblyTable[0];
                var simpleAssemblyName = stringIndices[assemblyRow.name];
                if (!simpleAssemblyName || simpleAssemblyName.toLowerCase() !== "mscorlib")
                    return null;

                if (!this.appDomain.assemblies[0].isSpeculative)
                    return null;

                var typeDefTable = this.managedHeaders.tableStream.tables[0x02];
                if (!typeDefTable)
                    return null;

                var containsSystemObject = false;
                var containsSystemString = false;

                for (var i = 0; i < typeDefTable.length; i++) {
                    var typeDefRow = typeDefTable[i];

                    var name = stringIndices[typeDefRow.name];
                    var namespace = stringIndices[typeDefRow.namespace];

                    if (namespace !== "System")
                        continue;

                    if (name === "Object")
                        containsSystemObject = true;
                    else if (name === "String")
                        containsSystemString = true;
                }

                if (containsSystemObject && containsSystemString)
                    return this.appDomain.assemblies[0];
                else
                    return null;
            };

            AssemblyReading.prototype._readBlobHex = function (blobIndex) {
                var saveOffset = this.reader.offset;

                this.reader.setVirtualOffset(this.managedHeaders.metadataStreams.blobs.address + blobIndex);
                var length = this._readBlobSize();

                var result = "";
                for (var i = 0; i < length; i++) {
                    var hex = this.reader.readByte().toString(16);
                    if (hex.length == 1)
                        result += "0";
                    result += hex;
                }

                this.reader.offset = saveOffset;

                return result.toUpperCase();
            };

            AssemblyReading.prototype._readBlobSize = function () {
                var length;
                var b0 = this.reader.readByte();
                if (b0 < 0x80) {
                    length = b0;
                } else {
                    var b1 = this.reader.readByte();

                    if ((b0 & 0xC0) == 0x80) {
                        length = ((b0 & 0x3F) << 8) + b1;
                    } else {
                        var b2 = this.reader.readByte();
                        var b3 = this.reader.readByte();
                        length = ((b0 & 0x3F) << 24) + (b1 << 16) + (b2 << 8) + b3;
                    }
                }

                return length;
            };

            AssemblyReading.prototype.readFileHeaders = function () {
                this.fileHeaders = new pe.headers.PEFileHeaders();
                this.fileHeaders.read(this.reader);

                this.reader.sections = this.fileHeaders.sectionHeaders;
            };

            AssemblyReading.prototype.readManagedHeaders = function () {
                this.managedHeaders = new ManagedHeaders();

                this.readClrDirectory();
                this.readClrMetadata();
                this.readMetadataStreams();

                this.readTableStream();

                this.populateStrings(this.managedHeaders.tableStream.stringIndices, this.reader);
            };

            AssemblyReading.prototype.readClrDirectory = function () {
                var clrDataDirectory = this.fileHeaders.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr];

                this.reader.setVirtualOffset(clrDataDirectory.address);

                this.managedHeaders.clrDirectory.read(this.reader);
            };

            AssemblyReading.prototype.readClrMetadata = function () {
                this.reader.setVirtualOffset(this.managedHeaders.clrDirectory.metadataDir.address);

                this.managedHeaders.clrMetadata.read(this.reader);
            };

            AssemblyReading.prototype.readMetadataStreams = function () {
                this.managedHeaders.metadataStreams.read(this.managedHeaders.clrDirectory.metadataDir.address, this.managedHeaders.clrMetadata.streamCount, this.reader);
            };

            AssemblyReading.prototype.readTableStream = function () {
                this.reader.setVirtualOffset(this.managedHeaders.metadataStreams.tables.address);

                this.managedHeaders.tableStream.read(this.reader, this.managedHeaders.metadataStreams.strings.size, this.managedHeaders.metadataStreams.guids.length, this.managedHeaders.metadataStreams.blobs.size);
            };

            AssemblyReading.prototype.populateStrings = function (stringIndices, reader) {
                var saveOffset = reader.offset;

                stringIndices[0] = null;
                for (var i in stringIndices) {
                    if (i > 0) {
                        var iNum = Number(i);
                        reader.setVirtualOffset(this.managedHeaders.metadataStreams.strings.address + iNum);
                        stringIndices[iNum] = reader.readUtf8Z(1024 * 1024 * 1024);
                    }
                }
            };
            return AssemblyReading;
        })();

        /**
        * All the messy raw CLR structures, with indices, GUIDs etc.
        * This is meant to be exposed from Assembly too (for digging in details when needed),
        * but not prominently.
        */
        var ManagedHeaders = (function () {
            function ManagedHeaders() {
                this.clrDirectory = new ClrDirectory();
                this.clrMetadata = new ClrMetadata();
                this.metadataStreams = new MetadataStreams();
                this.tableStream = new TableStream();
            }
            return ManagedHeaders;
        })();
        managed2.ManagedHeaders = ManagedHeaders;

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
            ClrDirectory.prototype.read = function (readerAtClrDataDirectory) {
                // shift to CLR directory
                var clrDirReader = readerAtClrDataDirectory;

                // CLR header
                this.cb = clrDirReader.readInt();

                if (this.cb < ClrDirectory._clrHeaderSize)
                    throw new Error("Unexpectedly short CLR header structure " + this.cb + " reported by Cb field " + "(expected at least " + ClrDirectory._clrHeaderSize + ").");

                this.runtimeVersion = clrDirReader.readShort() + "." + clrDirReader.readShort();

                this.metadataDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());

                this.imageFlags = clrDirReader.readInt();

                // need to convert to meaningful value before sticking into ModuleDefinition
                this.entryPointToken = clrDirReader.readInt();

                this.resourcesDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());

                this.strongNameSignatureDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());

                this.codeManagerTableDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());

                this.vtableFixupsDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());

                this.exportAddressTableJumpsDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());

                this.managedNativeHeaderDir = new pe.io.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
            };
            ClrDirectory._clrHeaderSize = 72;
            return ClrDirectory;
        })();
        managed2.ClrDirectory = ClrDirectory;

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
                if (this.mdSignature != metadata.ClrMetadataSignature.Signature)
                    throw new Error("Invalid CLR metadata signature field " + this.mdSignature.toString(16) + "h (expected " + metadata.ClrMetadataSignature.Signature.toString(16).toUpperCase() + "h).");

                this.metadataVersion = clrDirReader.readShort() + "." + clrDirReader.readShort();

                this.mdReserved = clrDirReader.readInt();

                var metadataStringVersionLength = clrDirReader.readInt();
                this.runtimeVersion = clrDirReader.readZeroFilledAscii(metadataStringVersionLength);

                this.mdFlags = clrDirReader.readShort();

                this.streamCount = clrDirReader.readShort();
            };
            return ClrMetadata;
        })();
        managed2.ClrMetadata = ClrMetadata;

        var MetadataStreams = (function () {
            function MetadataStreams() {
                this.guids = [];
                this.strings = null;
                this.blobs = null;
                this.tables = null;
            }
            MetadataStreams.prototype.read = function (metadataBaseAddress, streamCount, reader) {
                var guidRange;

                for (var i = 0; i < streamCount; i++) {
                    var range = new pe.io.AddressRange(reader.readInt(), reader.readInt());

                    range.address += metadataBaseAddress;

                    var name = this._readAlignedNameString(reader);

                    switch (name) {
                        case "#GUID":
                            guidRange = range;
                            continue;

                        case "#Strings":
                            this.strings = range;
                            continue;

                        case "#Blob":
                            this.blobs = range;
                            continue;

                        case "#~":
                        case "#-":
                            this.tables = range;
                            continue;
                    }

                    this[name] = range;
                }

                if (guidRange) {
                    var saveOffset = reader.offset;
                    reader.setVirtualOffset(guidRange.address);

                    this.guids = Array(guidRange.size / 16);
                    for (var i = 0; i < this.guids.length; i++) {
                        var guid = this._readGuidForStream(reader);
                        this.guids[i] = guid;
                    }

                    reader.offset = saveOffset;
                }
            };

            MetadataStreams.prototype._readAlignedNameString = function (reader) {
                var result = "";
                while (true) {
                    var b = reader.readByte();
                    if (b == 0)
                        break;

                    result += String.fromCharCode(b);
                }

                var skipCount = -1 + ((result.length + 4) & ~3) - result.length;
                for (var i = 0; i < skipCount; i++) {
                    reader.readByte();
                }

                return result;
            };

            MetadataStreams.prototype._readGuidForStream = function (reader) {
                var guid = "{";
                for (var i = 0; i < 4; i++) {
                    var hex = reader.readInt().toString(16);
                    guid += "00000000".substring(0, 8 - hex.length) + hex;
                }
                guid += "}";
                return guid;
            };
            return MetadataStreams;
        })();
        managed2.MetadataStreams = MetadataStreams;

        var TableStream = (function () {
            function TableStream() {
                this.reserved0 = 0;
                this.version = "";
                // byte
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

                // Note those are bytes, not shorts!
                this.version = reader.readByte() + "." + reader.readByte();

                this.heapSizes = reader.readByte();
                this.reserved1 = reader.readByte();

                var valid = reader.readLong();
                var sorted = reader.readLong();

                var tableCounts = this._readTableRowCounts(valid, reader);

                this._populateApiObjects(tableCounts);

                var tableTypes = this._populateTableTypes();
                this._populateTableRows(tableCounts, tableTypes);

                var tReader = new TableReader(reader, this.tables, stringCount, guidCount, blobCount);
                this._readTableRows(tableCounts, tableTypes, tReader);

                this.stringIndices = tReader.stringIndices;
            };

            TableStream.prototype._readTableRowCounts = function (valid, tableReader) {
                var tableCounts = [];

                var bits = valid.lo;
                for (var tableIndex = 0; tableIndex < 32; tableIndex++) {
                    if (bits & 1) {
                        var rowCount = tableReader.readInt();
                        tableCounts[tableIndex] = rowCount;
                    }
                    bits = bits >> 1;
                }

                bits = valid.hi;
                for (var i = 0; i < 32; i++) {
                    var tableIndex = i + 32;
                    if (bits & 1) {
                        var rowCount = tableReader.readInt();
                        tableCounts[tableIndex] = rowCount;
                    }
                    bits = bits >> 1;
                }

                return tableCounts;
            };

            TableStream.prototype._populateApiObjects = function (tableCounts) {
                this._populateTableObjects(this.allTypes, Type, tableCounts[0x02]);
                this._populateTableObjects(this.allFields, FieldInfo, tableCounts[0x04]);
                this._populateTableObjects(this.allMethods, MethodInfo, tableCounts[0x06]);
            };

            TableStream.prototype._populateTableObjects = function (table, Ctor, count, apiTable) {
                for (var i = 0; i < count; i++) {
                    var obj = apiTable ? new Ctor(apiTable[i]) : new Ctor();
                    table.push(obj);
                }
            };

            TableStream.prototype._populateTableTypes = function () {
                var tableTypes = [];
                for (var p in tables) {
                    var table = tables[p];
                    if (typeof (table) === "function") {
                        var dummyRow = new table();
                        tableTypes[dummyRow.TableKind] = table;
                    }
                }

                return tableTypes;
            };

            TableStream.prototype._populateTableRows = function (tableCounts, tableTypes) {
                for (var i = 0; i < tableCounts.length; i++) {
                    var table = [];
                    this.tables[i] = table;
                    var TableType = tableTypes[i];

                    if (typeof (TableType) === "undefined") {
                        if (tableCounts[i])
                            throw new Error("Table 0x" + i.toString(16).toUpperCase() + " has " + tableCounts[i] + " rows but no definition.");
                        continue;
                    }

                    var apiTable;
                    if (TableType === tables.TypeDef)
                        apiTable = this.allTypes;
                    else if (TableType === tables.Field)
                        apiTable = this.allFields;
                    else if (TableType === tables.MethodDef)
                        apiTable = this.allMethods;

                    this._populateTableObjects(table, TableType, tableCounts[i], apiTable);
                }
            };

            TableStream.prototype._readTableRows = function (tableCounts, tableTypes, reader) {
                for (var i = 0; i < tableCounts.length; i++) {
                    var table = this.tables[i];
                    var TableType = tableTypes[i];

                    for (var iRow = 0; iRow < tableCounts[i]; iRow++) {
                        table[iRow].read(reader);
                    }
                }
            };
            return TableStream;
        })();
        managed2.TableStream = TableStream;

        function calcRequredBitCount(maxValue) {
            var bitMask = maxValue;
            var result = 0;

            while (bitMask != 0) {
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

                this.readGenericParamTableIndex = this._getTableIndexReader(0x2A);
                this.readParamTableIndex = this._getTableIndexReader(0x08);
                this.readFieldTableIndex = this._getTableIndexReader(0x04);
                this.readMethodDefTableIndex = this._getTableIndexReader(0x06);
                this.readTypeDefTableIndex = this._getTableIndexReader(0x02);
                this.readEventTableIndex = this._getTableIndexReader(0x14);
                this.readPropertyTableIndex = this._getTableIndexReader(0x17);
                this.readModuleRefTableIndex = this._getTableIndexReader(0x1A);
                this.readAssemblyTableIndex = this._getTableIndexReader(0x20);
            }
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
                for (var i = 0; i < tables.length; i++) {
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
            TableReader.resolutionScopeTables = [
                0x00,
                0x1A,
                0x23,
                0x01
            ];

            TableReader.typeDefOrRefTables = [
                0x02,
                0x01,
                0x1B
            ];

            TableReader.hasConstantTables = [
                0x04,
                0x08,
                0x17
            ];

            TableReader.hasCustomAttributeTables = [
                0x06,
                0x04,
                0x01,
                0x02,
                0x08,
                0x09,
                0x0A,
                0x00,
                0xFF,
                0x17,
                0x14,
                0x11,
                0x1A,
                0x1B,
                0x20,
                0x23,
                0x26,
                0x27,
                0x28,
                0x2A,
                0x2C,
                0x2B
            ];

            TableReader.customAttributeTypeTables = [
                0xFF,
                0xFF,
                0x06,
                0x0A,
                0xFF
            ];

            TableReader.hasDeclSecurityTables = [
                0x02,
                0x06,
                0x20
            ];

            TableReader.implementationTables = [
                0x26,
                0x23,
                0x27
            ];

            TableReader.hasFieldMarshalTables = [
                0x04,
                0x08
            ];

            TableReader.typeOrMethodDefTables = [
                0x02,
                0x06
            ];

            TableReader.memberForwardedTables = [
                0x04,
                0x06
            ];

            TableReader.memberRefParentTables = [
                0x02,
                0x01,
                0x1A,
                0x06,
                0x1B
            ];

            TableReader.methodDefOrRefTables = [
                0x06,
                0x0A
            ];

            TableReader.hasSemanticsTables = [
                0x14,
                0x17
            ];
            return TableReader;
        })();

        var TableCompletionReader = (function () {
            function TableCompletionReader(_tableStream, _metadataStreams) {
                this._tableStream = _tableStream;
                this._metadataStreams = _metadataStreams;
                this.lookupResolutionScope = this._createLookup(TableReader.resolutionScopeTables);
                this.lookupTypeDefOrRef = this._createLookup(TableReader.typeDefOrRefTables);
            }
            TableCompletionReader.prototype.readString = function (index) {
                return this._tableStream.stringIndices[index];
            };

            TableCompletionReader.prototype.readGuid = function (index) {
                return this._metadataStreams.guids[index];
            };

            TableCompletionReader.prototype.copyFieldRange = function (fields, start, end) {
                var table = this._tableStream.tables[0x04];

                if (!end && typeof (end) === "undefined")
                    end = table.length;

                for (var i = start; i < end; i++) {
                    var fieldRow = table[i];
                    fields.push(fieldRow.def);
                }
            };

            TableCompletionReader.prototype.copyMethodRange = function (methods, start, end) {
                var table = this._tableStream.tables[0x06];

                if (!end && typeof (end) === "undefined")
                    end = table.length;

                for (var i = start; i < end; i++) {
                    var methodRow = table[i];
                    methods.push(methodRow.def);
                }
            };

            TableCompletionReader.prototype._createLookup = function (tables) {
                var _this = this;
                var tableKindBitCount = calcRequredBitCount(tables.length);

                return function (codedIndex) {
                    var rowIndex = codedIndex >> tableKindBitCount;
                    if (rowIndex === 0)
                        return null;

                    var tableKind = tables[codedIndex - (rowIndex << tableKindBitCount)];

                    var table = _this._tableStream.tables[tableKind];
                    var row = table[rowIndex - 1];

                    var result = row.def;

                    return result;
                };
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
                for (var i = 0; i < tableKinds.length; i++) {
                    var tableLength = tableCounts[tableKinds[i]];
                    if (tableLength > maxTableLength)
                        maxTableLength = tableLength;
                }

                this.rowIndexBitCount = calcRequredBitCount(maxTableLength);

                this.isShortForm = this.tableKindBitCount + this.rowIndexBitCount <= 16;
            }
            CodedIndexReader.prototype.createLookup = function (tables) {
                //var rowIndex = codedIndex >> this.tableKindBitCount;
                //var tableKind = codedIndex;
                return null;
            };
            return CodedIndexReader;
        })();

        var tables;
        (function (tables) {
            // ECMA-335 II.22.30
            var Module = (function () {
                function Module() {
                    this.TableKind = 0x00;
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

            // ECMA-335 II.22.38
            var TypeRef = (function () {
                function TypeRef() {
                    this.TableKind = 0x01;
                    this.def = new managed2.Type();
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

            // ECMA-335 II.22.37
            var TypeDef = (function () {
                function TypeDef(def) {
                    this.def = def;
                    this.TableKind = 0x02;
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
                    if (nextTypeDef)
                        nextFieldList = nextTypeDef.fieldList;
                    reader.copyFieldRange(this.def.fields, this.fieldList, nextFieldList);

                    var nextMethodList;
                    if (nextTypeDef)
                        nextMethodList = nextTypeDef.methodList;
                    reader.copyMethodRange(this.def.methods, this.methodList, nextMethodList);
                };
                return TypeDef;
            })();
            tables.TypeDef = TypeDef;

            // ECMA-335 II.22.15
            var Field = (function () {
                function Field(def) {
                    this.def = def;
                    this.TableKind = 0x04;
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

            //ECMA-335 II.22.26
            var MethodDef = (function () {
                function MethodDef(def) {
                    this.def = def;
                    this.TableKind = 0x06;
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

            // ECMA-335 II.22.33
            var Param = (function () {
                function Param() {
                    this.TableKind = 0x08;
                    this.def = new managed2.ParameterInfo();
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

            // ECMA-335 II.22.33
            var InterfaceImpl = (function () {
                function InterfaceImpl() {
                    this.TableKind = 0x09;
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

            // ECMA-335 II.22.25
            var MemberRef = (function () {
                function MemberRef() {
                    this.TableKind = 0x0A;
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

            // ECMA-335 II.22.9
            var Constant = (function () {
                function Constant() {
                    this.TableKind = 0x0B;
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

            // ECMA-335 II.22.10
            var CustomAttribute = (function () {
                function CustomAttribute() {
                    this.TableKind = 0x0C;
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

            // ECMA-335 II.22.17
            var FieldMarshal = (function () {
                function FieldMarshal() {
                    this.TableKind = 0x0D;
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

            // ECMA-335 II.22.11
            var DeclSecurity = (function () {
                function DeclSecurity() {
                    this.TableKind = 0x0E;
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

            // ECMA-335 II.22.8
            var ClassLayout = (function () {
                function ClassLayout() {
                    this.TableKind = 0x0F;
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

            // ECMA-335 II.22.8
            var FieldLayout = (function () {
                function FieldLayout() {
                    this.TableKind = 0x10;
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

            // ECMA-335 II.22.36
            var StandAloneSig = (function () {
                function StandAloneSig() {
                    this.TableKind = 0x11;
                    this.signature = 0;
                }
                StandAloneSig.prototype.read = function (reader) {
                    this.signature = reader.readBlobIndex();
                };
                return StandAloneSig;
            })();
            tables.StandAloneSig = StandAloneSig;

            // ECMA-335 II.22.12
            var EventMap = (function () {
                function EventMap() {
                    this.TableKind = 0x12;
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

            // ECMA-335 II.22.13
            var Event = (function () {
                function Event() {
                    this.TableKind = 0x14;
                    this.def = new managed2.EventInfo();
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

            // ECMA-335 II.22.35
            var PropertyMap = (function () {
                function PropertyMap() {
                    this.TableKind = 0x15;
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

            // ECMA-335 II.22.34
            var Property = (function () {
                function Property() {
                    this.TableKind = 0x17;
                    this.def = new managed2.PropertyInfo();
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

            // ECMA-335 II.22.28
            var MethodSemantics = (function () {
                function MethodSemantics() {
                    this.TableKind = 0x18;
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

            // ECMA-335 II.22.27
            var MethodImpl = (function () {
                function MethodImpl() {
                    this.TableKind = 0x19;
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

            // ECMA-335 II.22.31
            var ModuleRef = (function () {
                function ModuleRef() {
                    this.TableKind = 0x1A;
                    this.name = 0;
                }
                ModuleRef.prototype.read = function (reader) {
                    this.name = reader.readString();
                };
                return ModuleRef;
            })();
            tables.ModuleRef = ModuleRef;

            // ECMA-335 II.22.39
            var TypeSpec = (function () {
                function TypeSpec() {
                    this.TableKind = 0x1B;
                }
                TypeSpec.prototype.read = function (reader) {
                    this.signature = reader.readBlobIndex();
                };
                return TypeSpec;
            })();
            tables.TypeSpec = TypeSpec;

            // ECMA-335 II.22.22
            var ImplMap = (function () {
                function ImplMap() {
                    this.TableKind = 0x1C;
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

            // ECMA-335 II.22.18
            var FieldRva = (function () {
                function FieldRva() {
                    this.TableKind = 0x1D;
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

            // ECMA-335 II.22.2
            var Assembly = (function () {
                function Assembly() {
                    this.TableKind = 0x20;
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

            // ECMA-335 II.22.4
            var AssemblyProcessor = (function () {
                function AssemblyProcessor() {
                    this.TableKind = 0x21;
                    this.processor = 0;
                }
                AssemblyProcessor.prototype.reader = function (reader) {
                    this.processor = reader.readInt();
                };
                return AssemblyProcessor;
            })();
            tables.AssemblyProcessor = AssemblyProcessor;

            // ECMA-335 II.22.3
            var AssemblyOS = (function () {
                function AssemblyOS() {
                    this.TableKind = 0x22;
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

            // ECMA-335 II.22.5
            var AssemblyRef = (function () {
                function AssemblyRef() {
                    this.TableKind = 0x23;
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

            // ECMA-335 II.22.7
            var AssemblyRefProcessor = (function () {
                function AssemblyRefProcessor() {
                    this.TableKind = 0x24;
                }
                AssemblyRefProcessor.prototype.read = function (reader) {
                    this.processor = reader.readInt();
                };
                return AssemblyRefProcessor;
            })();
            tables.AssemblyRefProcessor = AssemblyRefProcessor;

            // ECMA-335 II.2.6
            var AssemblyRefOs = (function () {
                function AssemblyRefOs() {
                    this.TableKind = 0x25;
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

            // ECMA-335 II.22.19
            var File = (function () {
                function File() {
                    this.TableKind = 0x26;
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

            // ECMA-335 II.22.14
            var ExportedType = (function () {
                function ExportedType() {
                    this.TableKind = 0x27;
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

            // ECMA-335 II.22.24
            var ManifestResource = (function () {
                function ManifestResource() {
                    this.TableKind = 0x28;
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

            // ECMA-335 II.22.32
            var NestedClass = (function () {
                function NestedClass() {
                    this.TableKind = 0x29;
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

            // ECMA-335 II.22.20
            var GenericParam = (function () {
                function GenericParam() {
                    this.TableKind = 0x2A;
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

            // ECMA-335 II.22.29
            var MethodSpec = (function () {
                function MethodSpec() {
                    this.TableKind = 0x2B;
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

            // ECMA-335 II.22.21
            var GenericParamConstraint = (function () {
                function GenericParamConstraint() {
                    this.TableKind = 0x2C;
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
                ClrImageFlags[ClrImageFlags["ILOnly"] = 0x00000001] = "ILOnly";
                ClrImageFlags[ClrImageFlags["_32BitRequired"] = 0x00000002] = "_32BitRequired";
                ClrImageFlags[ClrImageFlags["ILLibrary"] = 0x00000004] = "ILLibrary";
                ClrImageFlags[ClrImageFlags["StrongNameSigned"] = 0x00000008] = "StrongNameSigned";
                ClrImageFlags[ClrImageFlags["NativeEntryPoint"] = 0x00000010] = "NativeEntryPoint";
                ClrImageFlags[ClrImageFlags["TrackDebugData"] = 0x00010000] = "TrackDebugData";
                ClrImageFlags[ClrImageFlags["IsIbcoptimized"] = 0x00020000] = "IsIbcoptimized";
            })(metadata.ClrImageFlags || (metadata.ClrImageFlags = {}));
            var ClrImageFlags = metadata.ClrImageFlags;

            (function (ClrMetadataSignature) {
                ClrMetadataSignature[ClrMetadataSignature["Signature"] = 0x424a5342] = "Signature";
            })(metadata.ClrMetadataSignature || (metadata.ClrMetadataSignature = {}));
            var ClrMetadataSignature = metadata.ClrMetadataSignature;

            (function (AssemblyHashAlgorithm) {
                AssemblyHashAlgorithm[AssemblyHashAlgorithm["None"] = 0x0000] = "None";
                AssemblyHashAlgorithm[AssemblyHashAlgorithm["Reserved"] = 0x8003] = "Reserved";
                AssemblyHashAlgorithm[AssemblyHashAlgorithm["Sha1"] = 0x8004] = "Sha1";
            })(metadata.AssemblyHashAlgorithm || (metadata.AssemblyHashAlgorithm = {}));
            var AssemblyHashAlgorithm = metadata.AssemblyHashAlgorithm;

            (function (AssemblyFlags) {
                // The assembly reference holds the full (unhashed) public key.
                AssemblyFlags[AssemblyFlags["PublicKey"] = 0x0001] = "PublicKey";

                // The implementation of this assembly used at runtime is not expected to match the version seen at compile time.
                // (See the text following this table.)
                AssemblyFlags[AssemblyFlags["Retargetable"] = 0x0100] = "Retargetable";

                // Reserved
                // (a conforming implementation of the CLI can ignore this setting on read;
                // some implementations might use this bit to indicate
                // that a CIL-to-native-code compiler should not generate optimized code).
                AssemblyFlags[AssemblyFlags["DisableJITcompileOptimizer"] = 0x4000] = "DisableJITcompileOptimizer";

                // Reserved
                // (a conforming implementation of the CLI can ignore this setting on read;
                // some implementations might use this bit to indicate
                // that a CIL-to-native-code compiler should generate CIL-to-native code map).
                AssemblyFlags[AssemblyFlags["EnableJITcompileTracking"] = 0x8000] = "EnableJITcompileTracking";
            })(metadata.AssemblyFlags || (metadata.AssemblyFlags = {}));
            var AssemblyFlags = metadata.AssemblyFlags;

            // [ECMA-335 para23.1.16]
            (function (ElementType) {
                // Marks end of a list.
                ElementType[ElementType["End"] = 0x00] = "End";

                ElementType[ElementType["Void"] = 0x01] = "Void";

                ElementType[ElementType["Boolean"] = 0x02] = "Boolean";

                ElementType[ElementType["Char"] = 0x03] = "Char";

                ElementType[ElementType["I1"] = 0x04] = "I1";
                ElementType[ElementType["U1"] = 0x05] = "U1";
                ElementType[ElementType["I2"] = 0x06] = "I2";
                ElementType[ElementType["U2"] = 0x07] = "U2";
                ElementType[ElementType["I4"] = 0x08] = "I4";
                ElementType[ElementType["U4"] = 0x09] = "U4";
                ElementType[ElementType["I8"] = 0x0a] = "I8";
                ElementType[ElementType["U8"] = 0x0b] = "U8";
                ElementType[ElementType["R4"] = 0x0c] = "R4";
                ElementType[ElementType["R8"] = 0x0d] = "R8";
                ElementType[ElementType["String"] = 0x0e] = "String";

                // Followed by type.
                ElementType[ElementType["Ptr"] = 0x0f] = "Ptr";

                // Followed by type.
                ElementType[ElementType["ByRef"] = 0x10] = "ByRef";

                // Followed by TypeDef or TypeRef token.
                ElementType[ElementType["ValueType"] = 0x11] = "ValueType";

                // Followed by TypeDef or TypeRef token.
                ElementType[ElementType["Class"] = 0x12] = "Class";

                // Generic parameter in a generic type definition, represented as number (compressed unsigned integer).
                ElementType[ElementType["Var"] = 0x13] = "Var";

                // type rank boundsCount bound1 � loCount lo1 �
                ElementType[ElementType["Array"] = 0x14] = "Array";

                // Generic type instantiation.  Followed by type typearg-count type-1 .managed.. type-n.
                ElementType[ElementType["GenericInst"] = 0x15] = "GenericInst";

                ElementType[ElementType["TypedByRef"] = 0x16] = "TypedByRef";

                // System.IntPtr
                ElementType[ElementType["I"] = 0x18] = "I";

                // System.UIntPtr
                ElementType[ElementType["U"] = 0x19] = "U";

                // Followed by full method signature.
                ElementType[ElementType["FnPtr"] = 0x1b] = "FnPtr";

                // System.Object
                ElementType[ElementType["Object"] = 0x1c] = "Object";

                // Single-dim array with 0 lower bound
                ElementType[ElementType["SZArray"] = 0x1d] = "SZArray";

                // Generic parameter in a generic method definition, represented as number (compressed unsigned integer).
                ElementType[ElementType["MVar"] = 0x1e] = "MVar";

                // Required modifier: followed by TypeDef or TypeRef token.
                ElementType[ElementType["CMod_ReqD"] = 0x1f] = "CMod_ReqD";

                // Optional modifier: followed by TypeDef or TypeRef token.
                ElementType[ElementType["CMod_Opt"] = 0x20] = "CMod_Opt";

                // Implemented within the CLI.
                ElementType[ElementType["Internal"] = 0x21] = "Internal";

                // Or'd with following element types.
                ElementType[ElementType["Modifier"] = 0x40] = "Modifier";

                // Sentinel for vararg method signature.
                ElementType[ElementType["Sentinel"] = 0x01 | ElementType.Modifier] = "Sentinel";

                // Denotes a local variable that points at a pinned object,
                ElementType[ElementType["Pinned"] = 0x05 | ElementType.Modifier] = "Pinned";

                ElementType[ElementType["R4_Hfa"] = 0x06 | ElementType.Modifier] = "R4_Hfa";
                ElementType[ElementType["R8_Hfa"] = 0x07 | ElementType.Modifier] = "R8_Hfa";

                // Indicates an argument of type System.Type.
                ElementType[ElementType["ArgumentType_"] = 0x10 | ElementType.Modifier] = "ArgumentType_";

                // Used in custom attributes to specify a boxed object (ECMA-335 para23.3).
                ElementType[ElementType["CustomAttribute_BoxedObject_"] = 0x11 | ElementType.Modifier] = "CustomAttribute_BoxedObject_";

                // Reserved_ = 0x12 | Modifier,
                // Used in custom attributes to indicate a FIELD (ECMA-335 para22.10, 23.3).
                ElementType[ElementType["CustomAttribute_Field_"] = 0x13 | ElementType.Modifier] = "CustomAttribute_Field_";

                // Used in custom attributes to indicate a PROPERTY (ECMA-335 para22.10, 23.3).
                ElementType[ElementType["CustomAttribute_Property_"] = 0x14 | ElementType.Modifier] = "CustomAttribute_Property_";

                // Used in custom attributes to specify an enum (ECMA-335 para23.3).
                ElementType[ElementType["CustomAttribute_Enum_"] = 0x55] = "CustomAttribute_Enum_";
            })(metadata.ElementType || (metadata.ElementType = {}));
            var ElementType = metadata.ElementType;

            // Look in ECMA-335 para22.11.
            (function (SecurityAction) {
                // Without further checks, satisfy Demand for the specified permission.
                // Valid scope: Method, Type;
                SecurityAction[SecurityAction["Assert"] = 3] = "Assert";

                // Check that all callers in the call chain have been granted specified permission,
                // throw SecurityException (see ECMA-335 paraPartition IV) on failure.
                // Valid scope: Method, Type.
                SecurityAction[SecurityAction["Demand"] = 2] = "Demand";

                // Without further checks refuse Demand for the specified permission.
                // Valid scope: Method, Type.
                SecurityAction[SecurityAction["Deny"] = 4] = "Deny";

                // The specified permission shall be granted in order to inherit from class or override virtual method.
                // Valid scope: Method, Type
                SecurityAction[SecurityAction["InheritanceDemand"] = 7] = "InheritanceDemand";

                // Check that the immediate caller has been granted the specified permission;
                // throw SecurityException (see ECMA-335 paraPartition IV) on failure.
                // Valid scope: Method, Type.
                SecurityAction[SecurityAction["LinkDemand"] = 6] = "LinkDemand";

                //  Check that the current assembly has been granted the specified permission;
                //  throw SecurityException (see Partition IV) otherwise.
                //  Valid scope: Method, Type.
                SecurityAction[SecurityAction["NonCasDemand"] = 0] = "NonCasDemand";

                // Check that the immediate caller has been granted the specified permission;
                // throw SecurityException (see Partition IV) otherwise.
                // Valid scope: Method, Type.
                SecurityAction[SecurityAction["NonCasLinkDemand"] = 0] = "NonCasLinkDemand";

                // Reserved for implementation-specific use.
                // Valid scope: Assembly.
                SecurityAction[SecurityAction["PrejitGrant"] = 0] = "PrejitGrant";

                // Without further checks, refuse Demand for all permissions other than those specified.
                // Valid scope: Method, Type
                SecurityAction[SecurityAction["PermitOnly"] = 5] = "PermitOnly";

                // Specify the minimum permissions required to runmanaged.
                // Valid scope: Assembly.
                SecurityAction[SecurityAction["RequestMinimum"] = 8] = "RequestMinimum";

                // Specify the optional permissions to grant.
                // Valid scope: Assembly.
                SecurityAction[SecurityAction["RequestOptional"] = 9] = "RequestOptional";

                // Specify the permissions not to be granted.
                // Valid scope: Assembly.
                SecurityAction[SecurityAction["RequestRefuse"] = 10] = "RequestRefuse";
            })(metadata.SecurityAction || (metadata.SecurityAction = {}));
            var SecurityAction = metadata.SecurityAction;

            // [ECMA-335 para23.1.4]
            (function (EventAttributes) {
                // Event is special.
                EventAttributes[EventAttributes["SpecialName"] = 0x0200] = "SpecialName";

                // CLI provides 'special' behavior, depending upon the name of the event.
                EventAttributes[EventAttributes["RTSpecialName"] = 0x0400] = "RTSpecialName";
            })(metadata.EventAttributes || (metadata.EventAttributes = {}));
            var EventAttributes = metadata.EventAttributes;

            (function (TypeAttributes) {
                // Visibility attributes
                // Use this mask to retrieve visibility information.
                // These 3 bits contain one of the following values:
                // NotPublic, Public,
                // NestedPublic, NestedPrivate,
                // NestedFamily, NestedAssembly,
                // NestedFamANDAssem, NestedFamORAssem.
                TypeAttributes[TypeAttributes["VisibilityMask"] = 0x00000007] = "VisibilityMask";

                // Class has no public scope.
                TypeAttributes[TypeAttributes["NotPublic"] = 0x00000000] = "NotPublic";

                // Class has public scope.
                TypeAttributes[TypeAttributes["Public"] = 0x00000001] = "Public";

                // Class is nested with public visibility.
                TypeAttributes[TypeAttributes["NestedPublic"] = 0x00000002] = "NestedPublic";

                // Class is nested with private visibility.
                TypeAttributes[TypeAttributes["NestedPrivate"] = 0x00000003] = "NestedPrivate";

                // Class is nested with family visibility.
                TypeAttributes[TypeAttributes["NestedFamily"] = 0x00000004] = "NestedFamily";

                // Class is nested with assembly visibility.
                TypeAttributes[TypeAttributes["NestedAssembly"] = 0x00000005] = "NestedAssembly";

                // Class is nested with family and assembly visibility.
                TypeAttributes[TypeAttributes["NestedFamANDAssem"] = 0x00000006] = "NestedFamANDAssem";

                // Class is nested with family or assembly visibility.
                TypeAttributes[TypeAttributes["NestedFamORAssem"] = 0x00000007] = "NestedFamORAssem";

                // Class layout attributes
                // Use this mask to retrieve class layout information.
                // These 2 bits contain one of the following values:
                // AutoLayout, SequentialLayout, ExplicitLayout.
                TypeAttributes[TypeAttributes["LayoutMask"] = 0x00000018] = "LayoutMask";

                // Class fields are auto-laid out.
                TypeAttributes[TypeAttributes["AutoLayout"] = 0x00000000] = "AutoLayout";

                // Class fields are laid out sequentially.
                TypeAttributes[TypeAttributes["SequentialLayout"] = 0x00000008] = "SequentialLayout";

                // Layout is supplied explicitly.
                TypeAttributes[TypeAttributes["ExplicitLayout"] = 0x00000010] = "ExplicitLayout";

                // Class semantics attributes
                // Use this mask to retrive class semantics information.
                // This bit contains one of the following values:
                // Class, Interface.
                TypeAttributes[TypeAttributes["ClassSemanticsMask"] = 0x00000020] = "ClassSemanticsMask";

                // Type is a class.
                TypeAttributes[TypeAttributes["Class"] = 0x00000000] = "Class";

                // Type is an interface.
                TypeAttributes[TypeAttributes["Interface"] = 0x00000020] = "Interface";

                // Special semantics in addition to class semantics
                // Class is abstract.
                TypeAttributes[TypeAttributes["Abstract"] = 0x00000080] = "Abstract";

                // Class cannot be extended.
                TypeAttributes[TypeAttributes["Sealed"] = 0x00000100] = "Sealed";

                // Class name is special.
                TypeAttributes[TypeAttributes["SpecialName"] = 0x00000400] = "SpecialName";

                // Implementation Attributes
                // Class/Interface is imported.
                TypeAttributes[TypeAttributes["Import"] = 0x00001000] = "Import";

                // Reserved (Class is serializable)
                TypeAttributes[TypeAttributes["Serializable"] = 0x00002000] = "Serializable";

                // String formatting Attributes
                // Use this mask to retrieve string information for native interop.
                // These 2 bits contain one of the following values:
                // AnsiClass, UnicodeClass, AutoClass, CustomFormatClass.
                TypeAttributes[TypeAttributes["StringFormatMask"] = 0x00030000] = "StringFormatMask";

                // LPSTR is interpreted as ANSI.
                TypeAttributes[TypeAttributes["AnsiClass"] = 0x00000000] = "AnsiClass";

                // LPSTR is interpreted as Unicode.
                TypeAttributes[TypeAttributes["UnicodeClass"] = 0x00010000] = "UnicodeClass";

                // LPSTR is interpreted automatically.
                TypeAttributes[TypeAttributes["AutoClass"] = 0x00020000] = "AutoClass";

                // A non-standard encoding specified by CustomStringFormatMask.
                TypeAttributes[TypeAttributes["CustomFormatClass"] = 0x00030000] = "CustomFormatClass";

                // Use this mask to retrieve non-standard encoding information for native interop.
                // The meaning of the values of these 2 bits isunspecified.
                TypeAttributes[TypeAttributes["CustomStringFormatMask"] = 0x00C00000] = "CustomStringFormatMask";

                // Class Initialization Attributes
                // Initialize the class before first static field access.
                TypeAttributes[TypeAttributes["BeforeFieldInit"] = 0x00100000] = "BeforeFieldInit";

                // Additional Flags
                // CLI provides 'special' behavior, depending upon the name of the Type
                TypeAttributes[TypeAttributes["RTSpecialName"] = 0x00000800] = "RTSpecialName";

                // Type has security associate with it.
                TypeAttributes[TypeAttributes["HasSecurity"] = 0x00040000] = "HasSecurity";

                // This ExportedTypeEntry is a type forwarder.
                TypeAttributes[TypeAttributes["IsTypeForwarder"] = 0x00200000] = "IsTypeForwarder";
            })(metadata.TypeAttributes || (metadata.TypeAttributes = {}));
            var TypeAttributes = metadata.TypeAttributes;

            // [ECMA-335 para23.1.5]
            (function (FieldAttributes) {
                // These 3 bits contain one of the following values:
                // CompilerControlled, Private,
                // FamANDAssem, Assembly,
                // Family, FamORAssem,
                // Public.
                FieldAttributes[FieldAttributes["FieldAccessMask"] = 0x0007] = "FieldAccessMask";

                // Member not referenceable.
                FieldAttributes[FieldAttributes["CompilerControlled"] = 0x0000] = "CompilerControlled";

                // Accessible only by the parent type.
                FieldAttributes[FieldAttributes["Private"] = 0x0001] = "Private";

                // Accessible by sub-types only in this Assembly.
                FieldAttributes[FieldAttributes["FamANDAssem"] = 0x0002] = "FamANDAssem";

                // Accessibly by anyone in the Assembly.
                FieldAttributes[FieldAttributes["Assembly"] = 0x0003] = "Assembly";

                // Accessible only by type and sub-types.
                FieldAttributes[FieldAttributes["Family"] = 0x0004] = "Family";

                // Accessibly by sub-types anywhere, plus anyone in assembly.
                FieldAttributes[FieldAttributes["FamORAssem"] = 0x0005] = "FamORAssem";

                // Accessibly by anyone who has visibility to this scope field contract attributes.
                FieldAttributes[FieldAttributes["Public"] = 0x0006] = "Public";

                // Defined on type, else per instance.
                FieldAttributes[FieldAttributes["Static"] = 0x0010] = "Static";

                // Field can only be initialized, not written to after init.
                FieldAttributes[FieldAttributes["InitOnly"] = 0x0020] = "InitOnly";

                // Value is compile time constant.
                FieldAttributes[FieldAttributes["Literal"] = 0x0040] = "Literal";

                // Reserved (to indicate this field should not be serialized when type is remoted).
                FieldAttributes[FieldAttributes["NotSerialized"] = 0x0080] = "NotSerialized";

                // Field is special.
                FieldAttributes[FieldAttributes["SpecialName"] = 0x0200] = "SpecialName";

                // Interop Attributes
                // Implementation is forwarded through PInvoke.
                FieldAttributes[FieldAttributes["PInvokeImpl"] = 0x2000] = "PInvokeImpl";

                // Additional flags
                // CLI provides 'special' behavior, depending upon the name of the field.
                FieldAttributes[FieldAttributes["RTSpecialName"] = 0x0400] = "RTSpecialName";

                // Field has marshalling information.
                FieldAttributes[FieldAttributes["HasFieldMarshal"] = 0x1000] = "HasFieldMarshal";

                // Field has default.
                FieldAttributes[FieldAttributes["HasDefault"] = 0x8000] = "HasDefault";

                // Field has RVA.
                FieldAttributes[FieldAttributes["HasFieldRVA"] = 0x0100] = "HasFieldRVA";
            })(metadata.FieldAttributes || (metadata.FieldAttributes = {}));
            var FieldAttributes = metadata.FieldAttributes;

            // [ECMA-335 para23.1.6]
            (function (FileAttributes) {
                // This is not a resource file.
                FileAttributes[FileAttributes["ContainsMetaData"] = 0x0000] = "ContainsMetaData";

                // This is a resource file or other non-metadata-containing file.
                FileAttributes[FileAttributes["ContainsNoMetaData"] = 0x0001] = "ContainsNoMetaData";
            })(metadata.FileAttributes || (metadata.FileAttributes = {}));
            var FileAttributes = metadata.FileAttributes;

            // [ECMA-335 para23.1.7]
            (function (GenericParamAttributes) {
                // These 2 bits contain one of the following values:
                // VarianceMask,
                // None,
                // Covariant,
                // Contravariant.
                GenericParamAttributes[GenericParamAttributes["VarianceMask"] = 0x0003] = "VarianceMask";

                // The generic parameter is non-variant and has no special constraints.
                GenericParamAttributes[GenericParamAttributes["None"] = 0x0000] = "None";

                // The generic parameter is covariant.
                GenericParamAttributes[GenericParamAttributes["Covariant"] = 0x0001] = "Covariant";

                // The generic parameter is contravariant.
                GenericParamAttributes[GenericParamAttributes["Contravariant"] = 0x0002] = "Contravariant";

                // These 3 bits contain one of the following values:
                // ReferenceTypeConstraint,
                // NotNullableValueTypeConstraint,
                // DefaultConstructorConstraint.
                GenericParamAttributes[GenericParamAttributes["SpecialConstraintMask"] = 0x001C] = "SpecialConstraintMask";

                // The generic parameter has the class special constraint.
                GenericParamAttributes[GenericParamAttributes["ReferenceTypeConstraint"] = 0x0004] = "ReferenceTypeConstraint";

                // The generic parameter has the valuetype special constraint.
                GenericParamAttributes[GenericParamAttributes["NotNullableValueTypeConstraint"] = 0x0008] = "NotNullableValueTypeConstraint";

                // The generic parameter has the .ctor special constraint.
                GenericParamAttributes[GenericParamAttributes["DefaultConstructorConstraint"] = 0x0010] = "DefaultConstructorConstraint";
            })(metadata.GenericParamAttributes || (metadata.GenericParamAttributes = {}));
            var GenericParamAttributes = metadata.GenericParamAttributes;

            // [ECMA-335 para23.1.8]
            (function (PInvokeAttributes) {
                // PInvoke is to use the member name as specified.
                PInvokeAttributes[PInvokeAttributes["NoMangle"] = 0x0001] = "NoMangle";

                // Character set
                // These 2 bits contain one of the following values:
                // CharSetNotSpec,
                // CharSetAnsi,
                // CharSetUnicode,
                // CharSetAuto.
                PInvokeAttributes[PInvokeAttributes["CharSetMask"] = 0x0006] = "CharSetMask";

                PInvokeAttributes[PInvokeAttributes["CharSetNotSpec"] = 0x0000] = "CharSetNotSpec";
                PInvokeAttributes[PInvokeAttributes["CharSetAnsi"] = 0x0002] = "CharSetAnsi";
                PInvokeAttributes[PInvokeAttributes["CharSetUnicode"] = 0x0004] = "CharSetUnicode";
                PInvokeAttributes[PInvokeAttributes["CharSetAuto"] = 0x0006] = "CharSetAuto";

                // Information about target function. Not relevant for fields.
                PInvokeAttributes[PInvokeAttributes["SupportsLastError"] = 0x0040] = "SupportsLastError";

                // Calling convention
                // These 3 bits contain one of the following values:
                // CallConvPlatformapi,
                // CallConvCdecl,
                // CallConvStdcall,
                // CallConvThiscall,
                // CallConvFastcall.
                PInvokeAttributes[PInvokeAttributes["CallConvMask"] = 0x0700] = "CallConvMask";
                PInvokeAttributes[PInvokeAttributes["CallConvPlatformapi"] = 0x0100] = "CallConvPlatformapi";
                PInvokeAttributes[PInvokeAttributes["CallConvCdecl"] = 0x0200] = "CallConvCdecl";
                PInvokeAttributes[PInvokeAttributes["CallConvStdcall"] = 0x0300] = "CallConvStdcall";
                PInvokeAttributes[PInvokeAttributes["CallConvThiscall"] = 0x0400] = "CallConvThiscall";
                PInvokeAttributes[PInvokeAttributes["CallConvFastcall"] = 0x0500] = "CallConvFastcall";
            })(metadata.PInvokeAttributes || (metadata.PInvokeAttributes = {}));
            var PInvokeAttributes = metadata.PInvokeAttributes;

            // [ECMA-335 para23.1.9]
            (function (ManifestResourceAttributes) {
                // These 3 bits contain one of the following values:
                ManifestResourceAttributes[ManifestResourceAttributes["VisibilityMask"] = 0x0007] = "VisibilityMask";

                // The Resource is exported from the Assembly.
                ManifestResourceAttributes[ManifestResourceAttributes["Public"] = 0x0001] = "Public";

                // The Resource is private to the Assembly.
                ManifestResourceAttributes[ManifestResourceAttributes["Private"] = 0x0002] = "Private";
            })(metadata.ManifestResourceAttributes || (metadata.ManifestResourceAttributes = {}));
            var ManifestResourceAttributes = metadata.ManifestResourceAttributes;

            (function (MethodImplAttributes) {
                // These 2 bits contain one of the following values:
                // IL, Native, OPTIL, Runtime.
                MethodImplAttributes[MethodImplAttributes["CodeTypeMask"] = 0x0003] = "CodeTypeMask";

                // Method impl is CIL.
                MethodImplAttributes[MethodImplAttributes["IL"] = 0x0000] = "IL";

                // Method impl is native.
                MethodImplAttributes[MethodImplAttributes["Native"] = 0x0001] = "Native";

                // Reserved: shall be zero in conforming implementations.
                MethodImplAttributes[MethodImplAttributes["OPTIL"] = 0x0002] = "OPTIL";

                // Method impl is provided by the runtime.
                MethodImplAttributes[MethodImplAttributes["Runtime"] = 0x0003] = "Runtime";

                // Flags specifying whether the code is managed or unmanaged.
                // This bit contains one of the following values:
                // Unmanaged, Managed.
                MethodImplAttributes[MethodImplAttributes["ManagedMask"] = 0x0004] = "ManagedMask";

                // Method impl is unmanaged, otherwise managed.
                MethodImplAttributes[MethodImplAttributes["Unmanaged"] = 0x0004] = "Unmanaged";

                // Method impl is managed.
                MethodImplAttributes[MethodImplAttributes["Managed"] = 0x0000] = "Managed";

                // Implementation info and interop
                // Indicates method is defined; used primarily in merge scenarios.
                MethodImplAttributes[MethodImplAttributes["ForwardRef"] = 0x0010] = "ForwardRef";

                // Reserved: conforming implementations can ignore.
                MethodImplAttributes[MethodImplAttributes["PreserveSig"] = 0x0080] = "PreserveSig";

                // Reserved: shall be zero in conforming implementations.
                MethodImplAttributes[MethodImplAttributes["InternalCall"] = 0x1000] = "InternalCall";

                // Method is single threaded through the body.
                MethodImplAttributes[MethodImplAttributes["Synchronized"] = 0x0020] = "Synchronized";

                // Method cannot be inlined.
                MethodImplAttributes[MethodImplAttributes["NoInlining"] = 0x0008] = "NoInlining";

                // Range check value.
                MethodImplAttributes[MethodImplAttributes["MaxMethodImplVal"] = 0xffff] = "MaxMethodImplVal";

                // Method will not be optimized when generating native code.
                MethodImplAttributes[MethodImplAttributes["NoOptimization"] = 0x0040] = "NoOptimization";
            })(metadata.MethodImplAttributes || (metadata.MethodImplAttributes = {}));
            var MethodImplAttributes = metadata.MethodImplAttributes;

            // [ECMA-335 para23.1.10]
            (function (MethodAttributes) {
                // These 3 bits contain one of the following values:
                // CompilerControlled,
                // Private,
                // FamANDAssem,
                // Assem,
                // Family,
                // FamORAssem,
                // Public
                MethodAttributes[MethodAttributes["MemberAccessMask"] = 0x0007] = "MemberAccessMask";

                // Member not referenceable.
                MethodAttributes[MethodAttributes["CompilerControlled"] = 0x0000] = "CompilerControlled";

                // Accessible only by the parent type.
                MethodAttributes[MethodAttributes["Private"] = 0x0001] = "Private";

                // Accessible by sub-types only in this Assembly.
                MethodAttributes[MethodAttributes["FamANDAssem"] = 0x0002] = "FamANDAssem";

                // Accessibly by anyone in the Assembly.
                MethodAttributes[MethodAttributes["Assem"] = 0x0003] = "Assem";

                // Accessible only by type and sub-types.
                MethodAttributes[MethodAttributes["Family"] = 0x0004] = "Family";

                // Accessibly by sub-types anywhere, plus anyone in assembly.
                MethodAttributes[MethodAttributes["FamORAssem"] = 0x0005] = "FamORAssem";

                // Accessibly by anyone who has visibility to this scope.
                MethodAttributes[MethodAttributes["Public"] = 0x0006] = "Public";

                // Defined on type, else per instance.
                MethodAttributes[MethodAttributes["Static"] = 0x0010] = "Static";

                // Method cannot be overridden.
                MethodAttributes[MethodAttributes["Final"] = 0x0020] = "Final";

                // Method is virtual.
                MethodAttributes[MethodAttributes["Virtual"] = 0x0040] = "Virtual";

                // Method hides by name+sig, else just by name.
                MethodAttributes[MethodAttributes["HideBySig"] = 0x0080] = "HideBySig";

                // Use this mask to retrieve vtable attributes. This bit contains one of the following values:
                // ReuseSlot, NewSlot.
                MethodAttributes[MethodAttributes["VtableLayoutMask"] = 0x0100] = "VtableLayoutMask";

                // Method reuses existing slot in vtable.
                MethodAttributes[MethodAttributes["ReuseSlot"] = 0x0000] = "ReuseSlot";

                // Method always gets a new slot in the vtable.
                MethodAttributes[MethodAttributes["NewSlot"] = 0x0100] = "NewSlot";

                // Method can only be overriden if also accessible.
                MethodAttributes[MethodAttributes["Strict"] = 0x0200] = "Strict";

                // Method does not provide an implementation.
                MethodAttributes[MethodAttributes["Abstract"] = 0x0400] = "Abstract";

                // Method is special.
                MethodAttributes[MethodAttributes["SpecialName"] = 0x0800] = "SpecialName";

                // Interop attributes
                // Implementation is forwarded through PInvoke.
                MethodAttributes[MethodAttributes["PInvokeImpl"] = 0x2000] = "PInvokeImpl";

                // Reserved: shall be zero for conforming implementations.
                MethodAttributes[MethodAttributes["UnmanagedExport"] = 0x0008] = "UnmanagedExport";

                // Additional flags
                // CLI provides 'special' behavior, depending upon the name of the method.
                MethodAttributes[MethodAttributes["RTSpecialName"] = 0x1000] = "RTSpecialName";

                // Method has security associated with it.
                MethodAttributes[MethodAttributes["HasSecurity"] = 0x4000] = "HasSecurity";

                // Method calls another method containing security code.
                MethodAttributes[MethodAttributes["RequireSecObject"] = 0x8000] = "RequireSecObject";
            })(metadata.MethodAttributes || (metadata.MethodAttributes = {}));
            var MethodAttributes = metadata.MethodAttributes;

            // [ECMA-335 para23.1.12]
            (function (MethodSemanticsAttributes) {
                // Setter for property.
                MethodSemanticsAttributes[MethodSemanticsAttributes["Setter"] = 0x0001] = "Setter";

                // Getter for property.
                MethodSemanticsAttributes[MethodSemanticsAttributes["Getter"] = 0x0002] = "Getter";

                // Other method for property or event.
                MethodSemanticsAttributes[MethodSemanticsAttributes["Other"] = 0x0004] = "Other";

                // AddOn method for event.
                // This refers to the required add_ method for events.  (ECMA-335 para22.13)
                MethodSemanticsAttributes[MethodSemanticsAttributes["AddOn"] = 0x0008] = "AddOn";

                // RemoveOn method for event.
                // This refers to the required remove_ method for events. (ECMA-335 para22.13)
                MethodSemanticsAttributes[MethodSemanticsAttributes["RemoveOn"] = 0x0010] = "RemoveOn";

                // Fire method for event.
                // This refers to the optional raise_ method for events. (ECMA-335 para22.13)
                MethodSemanticsAttributes[MethodSemanticsAttributes["Fire"] = 0x0020] = "Fire";
            })(metadata.MethodSemanticsAttributes || (metadata.MethodSemanticsAttributes = {}));
            var MethodSemanticsAttributes = metadata.MethodSemanticsAttributes;

            // [ECMA-335 para23.1.13]
            (function (ParamAttributes) {
                // Param is [In].
                ParamAttributes[ParamAttributes["In"] = 0x0001] = "In";

                // Param is [out].
                ParamAttributes[ParamAttributes["Out"] = 0x0002] = "Out";

                // Param is optional.
                ParamAttributes[ParamAttributes["Optional"] = 0x0010] = "Optional";

                // Param has default value.
                ParamAttributes[ParamAttributes["HasDefault"] = 0x1000] = "HasDefault";

                // Param has FieldMarshal.
                ParamAttributes[ParamAttributes["HasFieldMarshal"] = 0x2000] = "HasFieldMarshal";

                // Reserved: shall be zero in a conforming implementation.
                ParamAttributes[ParamAttributes["Unused"] = 0xcfe0] = "Unused";
            })(metadata.ParamAttributes || (metadata.ParamAttributes = {}));
            var ParamAttributes = metadata.ParamAttributes;

            // [ECMA-335 para23.1.14]
            (function (PropertyAttributes) {
                // Property is special.
                PropertyAttributes[PropertyAttributes["SpecialName"] = 0x0200] = "SpecialName";

                // Runtime(metadata internal APIs) should check name encoding.
                PropertyAttributes[PropertyAttributes["RTSpecialName"] = 0x0400] = "RTSpecialName";

                // Property has default.
                PropertyAttributes[PropertyAttributes["HasDefault"] = 0x1000] = "HasDefault";

                // Reserved: shall be zero in a conforming implementation.
                PropertyAttributes[PropertyAttributes["Unused"] = 0xe9ff] = "Unused";
            })(metadata.PropertyAttributes || (metadata.PropertyAttributes = {}));
            var PropertyAttributes = metadata.PropertyAttributes;

            // [ECMA-335 para23.2.3]
            (function (CallingConventions) {
                // Used to encode the keyword 'default' in the calling convention, see ECMA para15.3.
                CallingConventions[CallingConventions["Default"] = 0x0] = "Default";

                CallingConventions[CallingConventions["C"] = 0x1] = "C";

                CallingConventions[CallingConventions["StdCall"] = 0x2] = "StdCall";

                CallingConventions[CallingConventions["FastCall"] = 0x4] = "FastCall";

                // Used to encode the keyword 'vararg' in the calling convention, see ECMA para15.3.
                CallingConventions[CallingConventions["VarArg"] = 0x5] = "VarArg";

                // Used to indicate that the method has one or more generic parameters.
                CallingConventions[CallingConventions["Generic"] = 0x10] = "Generic";

                // Used to encode the keyword 'instance' in the calling convention, see ECMA para15.3.
                CallingConventions[CallingConventions["HasThis"] = 0x20] = "HasThis";

                // Used to encode the keyword 'explicit' in the calling convention, see ECMA para15.3.
                CallingConventions[CallingConventions["ExplicitThis"] = 0x40] = "ExplicitThis";

                // (ECMA para23.1.16), used to encode '.managed..' in the parameter list, see ECMA para15.3.
                CallingConventions[CallingConventions["Sentinel"] = 0x41] = "Sentinel";
            })(metadata.CallingConventions || (metadata.CallingConventions = {}));
            var CallingConventions = metadata.CallingConventions;

            (function (TableKind) {
                // The rows in the Module table result from .module directives in the Assembly.
                TableKind[TableKind["ModuleDefinition"] = 0x00] = "ModuleDefinition";

                // Contains ResolutionScope, TypeName and TypeNamespace columns.
                TableKind[TableKind["ExternalType"] = 0x01] = "ExternalType";

                // The first row of the TypeDef table represents the pseudo class that acts as parent for functions and variables
                // defined at module scope.
                // If a type is generic, its parameters are defined in the GenericParam table (para22.20). Entries in the
                // GenericParam table reference entries in the TypeDef table; there is no reference from the TypeDef table to the
                // GenericParam table.
                TableKind[TableKind["TypeDefinition"] = 0x02] = "TypeDefinition";

                // Each row in the Field table results from a top-level .field directive, or a .field directive inside a
                // Type.
                TableKind[TableKind["FieldDefinition"] = 0x04] = "FieldDefinition";

                // Conceptually, every row in the MethodDef table is owned by one, and only one, row in the TypeDef table.
                // The rows in the MethodDef table result from .method directives (para15). The RVA column is computed when
                // the image for the PE file is emitted and points to the COR_ILMETHOD structure for the body of the method.
                TableKind[TableKind["MethodDefinition"] = 0x06] = "MethodDefinition";

                // Conceptually, every row in the Param table is owned by one, and only one, row in the MethodDef table.
                // The rows in the Param table result from the parameters in a method declaration (para15.4), or from a .param
                // attribute attached to a method.
                TableKind[TableKind["ParameterDefinition"] = 0x08] = "ParameterDefinition";

                // Combines two sorts of references, to Methods and to Fields of a class, known as 'MethodRef' and 'FieldRef', respectively.
                // An entry is made into the MemberRef table whenever a reference is made in the CIL code to a method or field
                // which is defined in another module or assembly.  (Also, an entry is made for a call to a method with a VARARG
                // signature, even when it is defined in the same module as the call site.)
                TableKind[TableKind["MemberRef"] = 0x0A] = "MemberRef";

                // Used to store compile-time, constant values for fields, parameters, and properties.
                TableKind[TableKind["Constant"] = 0x0B] = "Constant";

                // Stores data that can be used to instantiate a Custom Attribute (more precisely, an
                // object of the specified Custom Attribute class) at runtime.
                // A row in the CustomAttribute table for a parent is created by the .custom attribute, which gives the value of
                // the Type column and optionally that of the Value column.
                TableKind[TableKind["CustomAttribute"] = 0x0C] = "CustomAttribute";

                // The FieldMarshal table  'links' an existing row in the Field or Param table, to information
                // in the Blob heap that defines how that field or parameter (which, as usual, covers the method return, as
                // parameter number 0) shall be marshalled when calling to or from unmanaged code via PInvoke dispatch.
                // A row in the FieldMarshal table is created if the .field directive for the parent field has specified a marshal attribute.
                TableKind[TableKind["FieldMarshal"] = 0x0D] = "FieldMarshal";

                // The rows of the DeclSecurity table are filled by attaching a .permission or .permissionset directive
                // that specifies the Action and PermissionSet on a parent assembly or parent type or method.
                TableKind[TableKind["DeclSecurity"] = 0x0E] = "DeclSecurity";

                // Used to define how the fields of a class or value type shall be laid out by the CLI.
                // (Normally, the CLI is free to reorder and/or insert gaps between the fields defined for a class or value type.)
                TableKind[TableKind["ClassLayout"] = 0x0F] = "ClassLayout";

                // Records the interfaces a type implements explicitly.  Conceptually, each row in the
                // InterfaceImpl table indicates that Class implements Interface.
                TableKind[TableKind["InterfaceImpl"] = 0x09] = "InterfaceImpl";

                // A row in the FieldLayout table is created if the .field directive for the parent field has specified a field offset.
                TableKind[TableKind["FieldLayout"] = 0x10] = "FieldLayout";

                // Signatures are stored in the metadata Blob heap.  In most cases, they are indexed by a column in some table -
                // Field.Signature, Method.Signature, MemberRef.Signature, etc.  However, there are two cases that require a
                // metadata token for a signature that is not indexed by any metadata table.  The StandAloneSig table fulfils this
                // need.  It has just one column, which points to a Signature in the Blob heap.
                TableKind[TableKind["StandAloneSig"] = 0x11] = "StandAloneSig";

                // The EventMap and Event tables result from putting the .event directive on a class.
                TableKind[TableKind["EventMap"] = 0x12] = "EventMap";

                // The EventMap and Event tables result from putting the .event directive on a class.
                TableKind[TableKind["Event"] = 0x14] = "Event";

                // The PropertyMap and Property tables result from putting the .property directive on a class.
                TableKind[TableKind["PropertyMap"] = 0x15] = "PropertyMap";

                // Does a little more than group together existing rows from other tables.
                TableKind[TableKind["PropertyDefinition"] = 0x17] = "PropertyDefinition";

                // The rows of the MethodSemantics table are filled by .property and .event directives.
                TableKind[TableKind["MethodSemantics"] = 0x18] = "MethodSemantics";

                // s let a compiler override the default inheritance rules provided by the CLI. Their original use
                // was to allow a class C, that inherited method M from both interfaces I and J, to provide implementations for
                // both methods (rather than have only one slot for M in its vtable). However, MethodImpls can be used for other
                // reasons too, limited only by the compiler writer�s ingenuity within the constraints defined in the Validation rules.
                // ILAsm uses the .override directive to specify the rows of the MethodImpl table.
                TableKind[TableKind["MethodImpl"] = 0x19] = "MethodImpl";

                // The rows in the ModuleRef table result from .module extern directives in the Assembly.
                TableKind[TableKind["ModuleRef"] = 0x1A] = "ModuleRef";

                //  Contains just one column, which indexes the specification of a Type, stored in the Blob heap.
                //  This provides a metadata token for that Type (rather than simply an index into the Blob heap). This is required,
                //  typically, for array operations, such as creating, or calling methods on the array class.
                //  Note that TypeSpec tokens can be used with any of the CIL instructions that take a TypeDef or TypeRef token;
                //  specifically, castclass, cpobj, initobj, isinst, ldelema, ldobj, mkrefany, newarr, refanyval, sizeof, stobj,
                //  box, and unbox.
                TableKind[TableKind["TypeSpec"] = 0x1B] = "TypeSpec";

                // Holds information about unmanaged methods that can be reached from managed code,
                // using PInvoke dispatch.
                // A row is entered in the ImplMap table for each parent Method (para15.5) that is defined with a .pinvokeimpl
                // interoperation attribute specifying the MappingFlags, ImportName, and ImportScope.
                TableKind[TableKind["ImplMap"] = 0x1C] = "ImplMap";

                // Conceptually, each row in the FieldRVA table is an extension to exactly one row in the Field table, and records
                // the RVA (Relative Virtual Address) within the image file at which this field�s initial value is stored.
                // A row in the FieldRVA table is created for each static parent field that has specified the optional data
                // label.  The RVA column is the relative virtual address of the data in the PE file.
                TableKind[TableKind["FieldRVA"] = 0x1D] = "FieldRVA";

                // ECMA-335 para22.2.
                TableKind[TableKind["AssemblyDefinition"] = 0x20] = "AssemblyDefinition";

                // ECMA-335 para22.4 Shall be ignored by the CLI.
                TableKind[TableKind["AssemblyProcessor"] = 0x21] = "AssemblyProcessor";

                // ECMA-335 para22.3 Shall be ignored by the CLI.
                TableKind[TableKind["AssemblyOS"] = 0x22] = "AssemblyOS";

                // The table is defined by the .assembly extern directive (para6.3).  Its columns are filled using directives
                // similar to those of the Assembly table except for the PublicKeyOrToken column, which is defined using the
                // .publickeytoken directive.
                TableKind[TableKind["AssemblyRef"] = 0x23] = "AssemblyRef";

                // ECMA-335 para22.7 Shall be ignored by the CLI.
                TableKind[TableKind["AssemblyRefProcessor"] = 0x24] = "AssemblyRefProcessor";

                // ECMA-335 para22.6 Shall be ignored by the CLI.
                TableKind[TableKind["AssemblyRefOS"] = 0x25] = "AssemblyRefOS";

                // The rows of the File table result from .file directives in an Assembly.
                TableKind[TableKind["File"] = 0x26] = "File";

                // Holds a row for each type:
                // a. Defined within other modules of this Assembly; that is exported out of this Assembly.  In essence, it
                // stores TypeDef row numbers of all types that are marked public in other modules that this Assembly
                // comprises.
                // The actual target row in a TypeDef table is given by the combination of TypeDefId (in effect, row
                // number) and Implementation (in effect, the module that holds the target TypeDef table).  Note that this
                // is the only occurrence in metadata of foreign tokens; that is, token values that have a meaning in
                // another module.  (A regular token value is an index into a table in the current module); OR
                // b. Originally defined in this Assembly but now moved to another Assembly. Flags must have
                // IsTypeForwarder set and Implementation is an AssemblyRef indicating the Assembly the type may
                // now be found in.
                TableKind[TableKind["ExportedType"] = 0x27] = "ExportedType";

                //  The rows in the table result from .mresource directives on the Assembly.
                TableKind[TableKind["ManifestResource"] = 0x28] = "ManifestResource";

                // NestedClass is defined as lexically 'inside' the text of its enclosing Type.
                TableKind[TableKind["NestedClass"] = 0x29] = "NestedClass";

                // Stores the generic parameters used in generic type definitions and generic method
                // definitions.  These generic parameters can be constrained (i.e., generic arguments shall extend some class
                // and/or implement certain interfaces) or unconstrained.  (Such constraints are stored in the
                // GenericParamConstraint table.)
                // Conceptually, each row in the GenericParam table is owned by one, and only one, row in either the TypeDef or
                // MethodDef tables.
                TableKind[TableKind["GenericParam"] = 0x2A] = "GenericParam";

                // Records the signature of an instantiated generic method.
                // Each unique instantiation of a generic method (i.e., a combination of Method and Instantiation) shall be
                // represented by a single row in the table.
                TableKind[TableKind["MethodSpec"] = 0x2B] = "MethodSpec";

                // Records the constraints for each generic parameter.  Each generic parameter
                // can be constrained to derive from zero or one class.  Each generic parameter can be constrained to implement
                // zero or more interfaces.
                // Conceptually, each row in the GenericParamConstraint table is ?owned� by a row in the GenericParam table.
                TableKind[TableKind["GenericParamConstraint"] = 0x2C] = "GenericParamConstraint";
            })(metadata.TableKind || (metadata.TableKind = {}));
            var TableKind = metadata.TableKind;
        })(managed2.metadata || (managed2.metadata = {}));
        var metadata = managed2.metadata;
    })(pe.managed2 || (pe.managed2 = {}));
    var managed2 = pe.managed2;
})(pe || (pe = {}));
//# sourceMappingURL=pe.js.map
