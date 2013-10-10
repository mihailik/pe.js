var pe;
(function (pe) {
    (function (io) {
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
    /// <reference path='io2.ts' />
    (function (headers) {
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
                this.res0 = 0;
                this.res1 = 0;
                /**
                * OEM identifier (for e_oeminfo).
                */
                this.oemid = 0;
                /**
                * OEM information: number; e_oemid specific.
                */
                this.oeminfo = 0;
                this.reserved0 = 0;
                this.reserved1 = 0;
                this.reserved2 = 0;
                this.reserved3 = 0;
                this.reserved4 = 0;
                /**
                * uint: File address of PE header.
                */
                this.lfanew = 0;
            }
            DosHeader.prototype.toString = function () {
                var result = "[" + (this.mz === MZSignature.MZ ? "MZ" : typeof this.mz === "number" ? this.mz.toString(16).toUpperCase() + "h" : typeof this.mz) + "]" + ".lfanew=" + (typeof this.lfanew === "number" ? this.lfanew.toString(16).toUpperCase() + "h" : typeof this.lfanew);

                return result;
            };

            DosHeader.prototype.populateFromUInt32Array = function (buf, pos) {
                var i = buf[pos];
                this.mz = i & 0xFFFF;
                this.cblp = (i >> 16) & 0xFFFF;
                i = buf[pos + 1];
                this.cp = i & 0xFFFF;
                this.crlc = (i >> 16) & 0xFFFF;
                i = buf[pos + 2];
                this.cparhdr = i & 0xFFFF;
                this.minalloc = (i >> 16) & 0xFFFF;
                i = buf[pos + 3];
                this.maxalloc = i & 0xFFFF;
                this.ss = (i >> 16) & 0xFFFF;
                i = buf[pos + 4];
                this.sp = i & 0xFFFF;
                this.csum = (i >> 16) & 0xFFFF;
                i = buf[pos + 5];
                this.ip = i & 0xFFFF;
                this.cs = (i >> 16) & 0xFFFF;
                i = buf[pos + 6];
                this.lfarlc = i & 0xFFFF;
                this.ovno = (i >> 16) & 0xFFFF;
                this.res0 = buf[pos + 7];
                this.res1 = buf[pos + 8];
                i = buf[pos + 9];
                this.oemid = i & 0xFFFF;
                this.oeminfo = (i >> 16) & 0xFFFF;
                this.reserved0 = buf[pos + 10];
                this.reserved1 = buf[pos + 11];
                this.reserved2 = buf[pos + 12];
                this.reserved3 = buf[pos + 13];
                this.reserved4 = buf[pos + 14];

                this.lfanew = buf[pos + 16];
            };
            DosHeader.byteSize = 64;
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

            PEHeader.prototype.populateFromUInt32Array = function (buf, pos) {
                this.pe = buf[pos];

                var i = buf[pos + 1];
                this.machine = i & 0xFFFF;
                this.numberOfSections = (i >> 16) & 0xFFFF;

                if (!this.timestamp)
                    this.timestamp = new Date(0);
                this.timestamp.setTime(buf[pos + 2] * 1000);

                this.pointerToSymbolTable = buf[pos + 3];
                this.numberOfSymbols = buf[pos + 4];

                i = buf[pos + 5];
                this.sizeOfOptionalHeader = i & 0xFFFF;
                this.characteristics = (i >> 16) & 0xFFFF;
            };
            PEHeader.byteSize = 24;
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
    })(pe.headers || (pe.headers = {}));
    var headers = pe.headers;
})(pe || (pe = {}));
/// <reference path='headers2.ts' />
var pe;
(function (pe) {
    /*
    * Logical 'universe' used to resolve inter-file references.
    */
    var LoaderContext = (function () {
        function LoaderContext() {
            this.loaded = [];
        }
        LoaderContext.prototype.beginRead = function (path) {
            return new LoaderContext.FileReader(this, path);
        };
        return LoaderContext;
    })();
    pe.LoaderContext = LoaderContext;

    (function (LoaderContext) {
        /*
        * State of reading a particular PE file.
        */
        var FileReader = (function () {
            function FileReader(context, path) {
                this.context = context;
                this._parsePhase = 0;
                this.peFile = new pe.PEFile(path);
                this.expectedSize = pe.headers.DosHeader.byteSize / 4;
            }
            FileReader.prototype.parseNext = function (buffer, offset, size) {
                while (true) {
                    switch (this._parsePhase) {
                        case 0:
                            if (size < pe.headers.DosHeader.byteSize / 4)
                                return 0;

                            this.peFile.dosHeader = new pe.headers.DosHeader();
                            this.peFile.dosHeader.populateFromUInt32Array(buffer, offset);
                            var readCount = pe.headers.DosHeader.byteSize / 4;

                            this.expectedSize = (this.peFile.dosHeader.lfanew - pe.headers.DosHeader.byteSize) / 4;

                            if (this.expectedSize <= 0) {
                                this._parsePhase = 2;
                                readCount += this.expectedSize;
                                this.expectedSize = pe.headers.PEHeader.byteSize / 4;
                            } else {
                                this._parsePhase = 1;
                            }

                            return readCount;

                        case 1:
                            var stubSize = (this.peFile.dosHeader.lfanew - pe.headers.DosHeader.byteSize) / 4;

                            if (size < stubSize)
                                return 0;

                            try  {
                                this.peFile.dosStub = new Uint32Array(stubSize);
                            } catch (error) {
                                this.peFile.dosStub = [];
                            }
                            for (var i = 0; i < stubSize; i++) {
                                this.peFile.dosStub[i] = buffer[offset + i];
                            }
                            this.expectedSize = pe.headers.PEHeader.byteSize / 4;
                            return stubSize;

                        case 2:
                            if (size < pe.headers.PEHeader.byteSize / 4)
                                return 0;

                            this.peFile.peHeader = new pe.headers.PEHeader();
                            this.peFile.peHeader.populateFromUInt32Array(buffer, offset);
                            break;
                    }
                    throw new Error("Fallen through.");
                }
            };
            return FileReader;
        })();
        LoaderContext.FileReader = FileReader;
    })(pe.LoaderContext || (pe.LoaderContext = {}));
    var LoaderContext = pe.LoaderContext;

    var PEFile = (function () {
        // TODO: implement remaining headers
        //optionalHeader: pe.headers.OptionalHeader = null;
        //sectionHeaders: pe.headers.SectionHeader[] = null;
        function PEFile(path) {
            this.path = path;
            this.dosHeader = null;
            this.dosStub = null;
            this.peHeader = null;
        }
        return PEFile;
    })();
    pe.PEFile = PEFile;
})(pe || (pe = {}));
//# sourceMappingURL=pe2.js.map
