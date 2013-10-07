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
            DosHeader.size = 64;
            return DosHeader;
        })();
        headers.DosHeader = DosHeader;

        (function (MZSignature) {
            MZSignature[MZSignature["MZ"] = "M".charCodeAt(0) + ("Z".charCodeAt(0) << 8)] = "MZ";
        })(headers.MZSignature || (headers.MZSignature = {}));
        var MZSignature = headers.MZSignature;
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
                this.expectedSize = pe.headers.DosHeader.size;
            }
            FileReader.prototype.parseNext = function (buffer, offset, size) {
                while (true) {
                    switch (this._parsePhase) {
                        case 0:
                            if (size < pe.headers.DosHeader.size) {
                                return 0;
                            }
                            this.peFile.dosHeader = new pe.headers.DosHeader();
                            this.peFile.dosHeader.populateFromUInt32Array(buffer, offset);
                            offset += pe.headers.DosHeader.size;
                            return offset;

                        case 1:
                            throw new Error("DOS header read.");
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
        //peHeader: pe.headers.PEHeader = null;
        //optionalHeader: pe.headers.OptionalHeader = null;
        //sectionHeaders: pe.headers.SectionHeader[] = null;
        function PEFile(path) {
            this.path = path;
            this.dosHeader = null;
            this.dosStub = null;
        }
        return PEFile;
    })();
    pe.PEFile = PEFile;
})(pe || (pe = {}));
//# sourceMappingURL=pe2.js.map
