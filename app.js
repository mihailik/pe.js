var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/// <reference types="node" />
(function () {
    var html = "\n  <!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <meta http-equiv=\"X-UA-Compatible\" content=\"ie=edge\">\n    <title>PE.js</title>\n</head>\n<body>\n    <h2>PE.js</h2>\n    <p>\n        Loading...\n    </p>\n\n    <script></" + '' + "script>\n</body>\n</html>\n";
})();
var node;
(function (node) {
    function boot() {
        bootAsync().then(function () {
            console.log('COMPLETED>');
        }, function (error) {
            process.exit(error.message.charCodeAt(0));
        });
    }
    node.boot = boot;
    function bootAsync() {
        return __awaiter(this, void 0, void 0, function () {
            var serverPromise, srv;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        serverPromise = node.server(__dirname);
                        return [4 /*yield*/, serverPromise];
                    case 1:
                        srv = _a.sent();
                        console.log('Running server on port ' + srv.port);
                        node.runBrowser('http://localhost:' + srv.port + '/');
                        return [4 /*yield*/, serverPromise];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
})(node || (node = {}));
var node;
(function (node) {
    function runBrowser(url) {
        return __awaiter(this, void 0, void 0, function () {
            var fs, path, child_process, chromePath, chromeProcess_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fs = require('fs');
                        path = require('path');
                        child_process = require('child_process');
                        chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
                        return [4 /*yield*/, existAsync(chromePath)];
                    case 1:
                        if (!_a.sent()) return [3 /*break*/, 3];
                        chromeProcess_1 = child_process.spawn('"' + chromePath + '" --app=' + url, {
                            shell: false
                        });
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                chromeProcess_1.on('error', function (error) {
                                    reject(error);
                                });
                            })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
    node.runBrowser = runBrowser;
    function existAsync(fullPath) {
        return new Promise(function (resolve) {
            var fs = require('fs');
            fs.exists(fullPath, function (result) {
                resolve(result);
            });
        });
    }
})(node || (node = {}));
var node;
(function (node) {
    function server(baseDir) {
        return __awaiter(this, void 0, void 0, function () {
            function tryPort(port) {
                return new Promise(function (resolve) {
                    var http = require('http');
                    var srv = http.createServer(function (request, response) {
                        node.server_handleRequest({ baseDir: baseDir, server: srv, port: port, request: request, response: response });
                    });
                    srv.on('error', function () {
                        resolve(null);
                    });
                    srv.on('listening', function () {
                        resolve({ server: srv, port: port });
                    });
                    srv.listen(port);
                });
            }
            var basePort, i, lowPromise, highPromise, srv, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        basePort = 0;
                        i = 0;
                        _b.label = 1;
                    case 1:
                        if (!(i < __filename.length)) return [3 /*break*/, 6];
                        basePort += __filename.charCodeAt(i);
                        basePort = basePort % 4000;
                        lowPromise = tryPort(6340 + basePort);
                        highPromise = tryPort(12891 + basePort);
                        return [4 /*yield*/, lowPromise];
                    case 2:
                        _a = (_b.sent());
                        if (_a) return [3 /*break*/, 4];
                        return [4 /*yield*/, highPromise];
                    case 3:
                        _a = (_b.sent());
                        _b.label = 4;
                    case 4:
                        srv = _a;
                        if (srv)
                            return [2 /*return*/, srv];
                        _b.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }
    node.server = server;
})(node || (node = {}));
var node;
(function (node) {
    function server_handleRequest(options) {
        return __awaiter(this, void 0, void 0, function () {
            var baseDir, server, port, request, response, fs, path, URL, requestURL, requestPath, resolvedPath, fileContent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        baseDir = options.baseDir, server = options.server, port = options.port, request = options.request, response = options.response;
                        fs = require('fs');
                        path = require('path');
                        URL = require('url');
                        requestURL = URL.parse(request.url, true /* parseQueryString */);
                        requestPath = requestURL.path.replace(/^[\.\/\\]+/, '').replace(/\[\.\/\\]*\//g, '/');
                        if (!(requestPath === '' || requestPath === '/')) return [3 /*break*/, 2];
                        return [4 /*yield*/, node.server_handleRoot(options)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2:
                        resolvedPath = path.resolve(baseDir, requestPath);
                        return [4 /*yield*/, readFileIfExistsAsync(resolvedPath)];
                    case 3:
                        fileContent = _a.sent();
                        if (fileContent)
                            return [2 /*return*/, response.end(fileContent)];
                        response.statusCode = 404;
                        response.end();
                        return [2 /*return*/];
                }
            });
        });
    }
    node.server_handleRequest = server_handleRequest;
    function readFileIfExistsAsync(fullPath) {
        var fs = require('fs');
        return new Promise(function (resolve) {
            fs.readFile(fullPath, function (error, buffer) {
                if (buffer)
                    resolve(buffer);
                else
                    resolve(null);
            });
        });
    }
})(node || (node = {}));
var node;
(function (node) {
    var thisScriptPromise;
    function server_handleRoot(options) {
        return __awaiter(this, void 0, void 0, function () {
            function readThisScript() {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var fs = require('fs');
                                fs.readFile(__filename, function (error, data) {
                                    if (error)
                                        reject(error);
                                    else
                                        resolve(data);
                                });
                            })];
                    });
                });
            }
            var thisScriptData, wholeHTML;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof thisScriptPromise !== 'string')
                            thisScriptPromise = readThisScript();
                        return [4 /*yield*/, thisScriptPromise];
                    case 1:
                        thisScriptData = _a.sent();
                        wholeHTML = '<' + 'script' + '>' + thisScriptData + '</' + 'script' + '>';
                        options.response.end(wholeHTML);
                        return [2 /*return*/];
                }
            });
        });
    }
    node.server_handleRoot = server_handleRoot;
})(node || (node = {}));
if (typeof process !== 'undefined' && process && typeof process.exit === 'function') {
    node.boot();
}
else if (typeof window !== 'undefined' && typeof window.alert === 'function') {
    alert('Hey, from there!');
}
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (b.hasOwnProperty(p))
                    d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var pe;
(function (pe) {
    /**
     * 64-bit integer
     */
    var Long = /** @class */ (function () {
        function Long(lo, hi) {
            this.lo = lo;
            this.hi = hi;
        }
        Long.prototype.toString = function () {
            var result;
            result = this.lo.toString(16);
            if (this.hi != 0) {
                result = ('0000').substring(result.length) + result;
                result = this.hi.toString(16) + result;
            }
            result = result.toUpperCase() + 'h';
            return result;
        };
        return Long;
    }());
    pe.Long = Long;
})(pe || (pe = {}));
var pe;
(function (pe) {
    /**
     * Convert enum value to string, considering the bit flags.
     */
    function formatEnum(value, type) {
        if (!value) {
            if (value === null)
                return 'null';
            else if (typeof value == 'undefined')
                return 'undefined';
        }
        var textValue = type[value];
        if (textValue)
            return textValue;
        // find bit flags matching the provided value,
        // collect what bits are covered that way
        var enumValues = [];
        var accountedEnumValueMask = 0;
        for (var kvKey in type) {
            var kvValue = type[kvKey];
            if (typeof kvValue !== 'number')
                continue;
            if (kvValue && (value & kvValue) === kvValue) {
                enumValues.push(kvKey);
                accountedEnumValueMask = accountedEnumValueMask | kvValue;
            }
        }
        // uncovered bits are taken as a hex literal
        var spill = value & ~accountedEnumValueMask;
        if (spill)
            enumValues.push('0x' + spill.toString(16).toUpperCase());
        textValue = enumValues.join(' | ');
        return textValue;
    }
    pe.formatEnum = formatEnum;
    function bytesToHex(bytes) {
        if (!bytes)
            return null;
        var result = '';
        for (var i = 0; i < bytes.length; i++) {
            var hex = bytes[i].toString(16).toUpperCase();
            if (hex.length == 1)
                hex = '0' + hex;
            result += hex;
        }
        return result;
    }
    pe.bytesToHex = bytesToHex;
})(pe || (pe = {}));
var pe;
(function (pe) {
    var headers;
    (function (headers) {
        var DataDirectoryKind;
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
        })(DataDirectoryKind = headers.DataDirectoryKind || (headers.DataDirectoryKind = {}));
    })(headers = pe.headers || (pe.headers = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var headers;
    (function (headers) {
        var DllCharacteristics;
        (function (DllCharacteristics) {
            /**
             * Reserved.
             */
            DllCharacteristics[DllCharacteristics["ProcessInit"] = 1] = "ProcessInit";
            /**
             * Reserved.
             */
            DllCharacteristics[DllCharacteristics["ProcessTerm"] = 2] = "ProcessTerm";
            /**
             * Reserved.
             */
            DllCharacteristics[DllCharacteristics["ThreadInit"] = 4] = "ThreadInit";
            /**
             * Reserved.
             */
            DllCharacteristics[DllCharacteristics["ThreadTerm"] = 8] = "ThreadTerm";
            /**
             * The DLL can be relocated at load time.
             */
            DllCharacteristics[DllCharacteristics["DynamicBase"] = 64] = "DynamicBase";
            /**
             * Code integrity checks are forced.
             * If you set this flag and a section contains only uninitialized data,
             * set the PointerToRawData member of IMAGE_SECTION_HEADER
             * for that section to zero;
             * otherwise, the image will fail to load because the digital signature cannot be verified.
             */
            DllCharacteristics[DllCharacteristics["ForceIntegrity"] = 128] = "ForceIntegrity";
            /**
             * The image is compatible with data execution prevention (DEP).
             */
            DllCharacteristics[DllCharacteristics["NxCompatible"] = 256] = "NxCompatible";
            /**
             * The image is isolation aware, but should not be isolated.
             */
            DllCharacteristics[DllCharacteristics["NoIsolation"] = 512] = "NoIsolation";
            /**
             * The image does not use structured exception handling (SEH). No SE handler may reside in this image.
             */
            DllCharacteristics[DllCharacteristics["NoSEH"] = 1024] = "NoSEH";
            /**
             * Do not bind this image.
             */
            DllCharacteristics[DllCharacteristics["NoBind"] = 2048] = "NoBind";
            /**
             * The image must run inside an AppContainer.
             */
            DllCharacteristics[DllCharacteristics["AppContainer"] = 4096] = "AppContainer";
            /**
             * WDM (Windows Driver Model) driver.
             */
            DllCharacteristics[DllCharacteristics["WdmDriver"] = 8192] = "WdmDriver";
            /**
             * Reserved (no specific name).
             */
            DllCharacteristics[DllCharacteristics["Reserved"] = 16384] = "Reserved";
            /**
             * The image is terminal server aware.
             */
            DllCharacteristics[DllCharacteristics["TerminalServerAware"] = 32768] = "TerminalServerAware";
        })(DllCharacteristics = headers.DllCharacteristics || (headers.DllCharacteristics = {}));
    })(headers = pe.headers || (pe.headers = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var headers;
    (function (headers) {
        var ImageCharacteristics;
        (function (ImageCharacteristics) {
            /**
             * Relocation information was stripped from the file.
             * The file must be loaded at its preferred base address.
             * If the base address is not available, the loader reports an error.
             */
            ImageCharacteristics[ImageCharacteristics["RelocsStripped"] = 1] = "RelocsStripped";
            /**
             * The file is executable (there are no unresolved external references).
             */
            ImageCharacteristics[ImageCharacteristics["ExecutableImage"] = 2] = "ExecutableImage";
            /**
             * COFF line numbers were stripped from the file.
             */
            ImageCharacteristics[ImageCharacteristics["LineNumsStripped"] = 4] = "LineNumsStripped";
            /**
             * COFF symbol table entries were stripped from file.
             */
            ImageCharacteristics[ImageCharacteristics["LocalSymsStripped"] = 8] = "LocalSymsStripped";
            /**
             * Aggressively trim the working set.
             * This value is obsolete as of Windows 2000.
             */
            ImageCharacteristics[ImageCharacteristics["AggressiveWsTrim"] = 16] = "AggressiveWsTrim";
            /**
             * The application can handle addresses larger than 2 GB.
             */
            ImageCharacteristics[ImageCharacteristics["LargeAddressAware"] = 32] = "LargeAddressAware";
            /**
             * The bytes of the word are reversed. This flag is obsolete.
             */
            ImageCharacteristics[ImageCharacteristics["BytesReversedLo"] = 128] = "BytesReversedLo";
            /**
             * The computer supports 32-bit words.
             */
            ImageCharacteristics[ImageCharacteristics["Bit32Machine"] = 256] = "Bit32Machine";
            /**
             * Debugging information was removed and stored separately in another file.
             */
            ImageCharacteristics[ImageCharacteristics["DebugStripped"] = 512] = "DebugStripped";
            /**
             * If the image is on removable media, copy it to and run it from the swap file.
             */
            ImageCharacteristics[ImageCharacteristics["RemovableRunFromSwap"] = 1024] = "RemovableRunFromSwap";
            /**
             * If the image is on the network, copy it to and run it from the swap file.
             */
            ImageCharacteristics[ImageCharacteristics["NetRunFromSwap"] = 2048] = "NetRunFromSwap";
            /**
             * The image is a system file.
             */
            ImageCharacteristics[ImageCharacteristics["System"] = 4096] = "System";
            /**
             * The image is a DLL file.
             * While it is an executable file, it cannot be run directly.
             */
            ImageCharacteristics[ImageCharacteristics["Dll"] = 8192] = "Dll";
            /**
             * The file should be run only on a uniprocessor computer.
             */
            ImageCharacteristics[ImageCharacteristics["UpSystemOnly"] = 16384] = "UpSystemOnly";
            /**
             * The bytes of the word are reversed. This flag is obsolete.
             */
            ImageCharacteristics[ImageCharacteristics["BytesReversedHi"] = 32768] = "BytesReversedHi";
        })(ImageCharacteristics = headers.ImageCharacteristics || (headers.ImageCharacteristics = {}));
    })(headers = pe.headers || (pe.headers = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var headers;
    (function (headers) {
        var MZSignature;
        (function (MZSignature) {
            MZSignature[MZSignature["MZ"] = "M".charCodeAt(0) +
                ("Z".charCodeAt(0) << 8)] = "MZ";
        })(MZSignature = headers.MZSignature || (headers.MZSignature = {}));
    })(headers = pe.headers || (pe.headers = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var headers;
    (function (headers) {
        var Machine;
        (function (Machine) {
            /**
             * The target CPU is unknown or not specified.
             */
            Machine[Machine["Unknown"] = 0] = "Unknown";
            /**
             * Intel 386.
             */
            Machine[Machine["I386"] = 332] = "I386";
            /**
             * MIPS little-endian
             */
            Machine[Machine["R3000"] = 354] = "R3000";
            /**
             * MIPS little-endian
             */
            Machine[Machine["R4000"] = 358] = "R4000";
            /**
             * MIPS little-endian
             */
            Machine[Machine["R10000"] = 360] = "R10000";
            /**
             * MIPS little-endian WCE v2
             */
            Machine[Machine["WCEMIPSV2"] = 361] = "WCEMIPSV2";
            /**
             * Alpha_AXP
             */
            Machine[Machine["Alpha"] = 388] = "Alpha";
            /**
             * SH3 little-endian
             */
            Machine[Machine["SH3"] = 418] = "SH3";
            /**
             * SH3 little-endian. DSP.
             */
            Machine[Machine["SH3DSP"] = 419] = "SH3DSP";
            /**
             * SH3E little-endian.
             */
            Machine[Machine["SH3E"] = 420] = "SH3E";
            /**
             * SH4 little-endian.
             */
            Machine[Machine["SH4"] = 422] = "SH4";
            /**
             * SH5.
             */
            Machine[Machine["SH5"] = 424] = "SH5";
            /**
             * ARM Little-Endian
             */
            Machine[Machine["ARM"] = 448] = "ARM";
            /**
             * Thumb.
             */
            Machine[Machine["Thumb"] = 450] = "Thumb";
            /**
             * AM33
             */
            Machine[Machine["AM33"] = 467] = "AM33";
            /**
             * IBM PowerPC Little-Endian
             */
            Machine[Machine["PowerPC"] = 496] = "PowerPC";
            /**
             * PowerPCFP
             */
            Machine[Machine["PowerPCFP"] = 497] = "PowerPCFP";
            /**
             * Intel 64
             */
            Machine[Machine["IA64"] = 512] = "IA64";
            /**
             * MIPS
             */
            Machine[Machine["MIPS16"] = 614] = "MIPS16";
            /**
             * ALPHA64
             */
            Machine[Machine["Alpha64"] = 644] = "Alpha64";
            /**
             * MIPS
             */
            Machine[Machine["MIPSFPU"] = 870] = "MIPSFPU";
            /**
             * MIPS
             */
            Machine[Machine["MIPSFPU16"] = 1126] = "MIPSFPU16";
            /**
             * AXP64
             */
            Machine[Machine["AXP64"] = 644] = "AXP64";
            /**
             * Infineon
             */
            Machine[Machine["Tricore"] = 1312] = "Tricore";
            /**
             * CEF
             */
            Machine[Machine["CEF"] = 3311] = "CEF";
            /**
             * EFI Byte Code
             */
            Machine[Machine["EBC"] = 3772] = "EBC";
            /**
             * AMD64 (K8)
             */
            Machine[Machine["AMD64"] = 34404] = "AMD64";
            /**
             * M32R little-endian
             */
            Machine[Machine["M32R"] = 36929] = "M32R";
            /**
             * CEE
             */
            Machine[Machine["CEE"] = 49390] = "CEE";
        })(Machine = headers.Machine || (headers.Machine = {}));
    })(headers = pe.headers || (pe.headers = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var headers;
    (function (headers) {
        var PEMagic;
        (function (PEMagic) {
            PEMagic[PEMagic["NT32"] = 267] = "NT32";
            PEMagic[PEMagic["NT64"] = 523] = "NT64";
            PEMagic[PEMagic["ROM"] = 263] = "ROM";
        })(PEMagic = headers.PEMagic || (headers.PEMagic = {}));
    })(headers = pe.headers || (pe.headers = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var headers;
    (function (headers) {
        var PESignature;
        (function (PESignature) {
            PESignature[PESignature["PE"] = "P".charCodeAt(0) +
                ("E".charCodeAt(0) << 8)] = "PE";
        })(PESignature = headers.PESignature || (headers.PESignature = {}));
    })(headers = pe.headers || (pe.headers = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var headers;
    (function (headers) {
        var SectionCharacteristics;
        (function (SectionCharacteristics) {
            SectionCharacteristics[SectionCharacteristics["Reserved_0h"] = 0] = "Reserved_0h";
            SectionCharacteristics[SectionCharacteristics["Reserved_1h"] = 1] = "Reserved_1h";
            SectionCharacteristics[SectionCharacteristics["Reserved_2h"] = 2] = "Reserved_2h";
            SectionCharacteristics[SectionCharacteristics["Reserved_4h"] = 4] = "Reserved_4h";
            /**
             * The section should not be padded to the next boundary.
             * This flag is obsolete and is replaced by Align1Bytes.
             */
            SectionCharacteristics[SectionCharacteristics["NoPadding"] = 8] = "NoPadding";
            SectionCharacteristics[SectionCharacteristics["Reserved_10h"] = 16] = "Reserved_10h";
            /**
             * The section contains executable code.
             */
            SectionCharacteristics[SectionCharacteristics["ContainsCode"] = 32] = "ContainsCode";
            /**
             * The section contains initialized data.
             */
            SectionCharacteristics[SectionCharacteristics["ContainsInitializedData"] = 64] = "ContainsInitializedData";
            /**
             * The section contains uninitialized data.
             */
            SectionCharacteristics[SectionCharacteristics["ContainsUninitializedData"] = 128] = "ContainsUninitializedData";
            /**
             * Reserved.
             */
            SectionCharacteristics[SectionCharacteristics["LinkerOther"] = 256] = "LinkerOther";
            /**
             * The section contains comments or other information.
             * This is valid only for object files.
             */
            SectionCharacteristics[SectionCharacteristics["LinkerInfo"] = 512] = "LinkerInfo";
            SectionCharacteristics[SectionCharacteristics["Reserved_400h"] = 1024] = "Reserved_400h";
            /**
             * The section will not become part of the image.
             * This is valid only for object files.
             */
            SectionCharacteristics[SectionCharacteristics["LinkerRemove"] = 2048] = "LinkerRemove";
            /**
             * The section contains COMDAT data.
             * This is valid only for object files.
             */
            SectionCharacteristics[SectionCharacteristics["LinkerCOMDAT"] = 4096] = "LinkerCOMDAT";
            SectionCharacteristics[SectionCharacteristics["Reserved_2000h"] = 8192] = "Reserved_2000h";
            /**
             * Reset speculative exceptions handling bits in the TLB entries for this section.
             */
            SectionCharacteristics[SectionCharacteristics["NoDeferredSpeculativeExecution"] = 16384] = "NoDeferredSpeculativeExecution";
            /**
             * The section contains data referenced through the global pointer.
             */
            SectionCharacteristics[SectionCharacteristics["GlobalPointerRelative"] = 32768] = "GlobalPointerRelative";
            SectionCharacteristics[SectionCharacteristics["Reserved_10000h"] = 65536] = "Reserved_10000h";
            /**
             * Reserved.
             */
            SectionCharacteristics[SectionCharacteristics["MemoryPurgeable"] = 131072] = "MemoryPurgeable";
            /**
             * Reserved.
             */
            SectionCharacteristics[SectionCharacteristics["MemoryLocked"] = 262144] = "MemoryLocked";
            /**
             * Reserved.
             */
            SectionCharacteristics[SectionCharacteristics["MemoryPreload"] = 524288] = "MemoryPreload";
            /**
             * Align data on a 1-byte boundary.
             * This is valid only for object files.
             */
            SectionCharacteristics[SectionCharacteristics["Align1Bytes"] = 1048576] = "Align1Bytes";
            /**
             * Align data on a 2-byte boundary.
             * This is valid only for object files.
             */
            SectionCharacteristics[SectionCharacteristics["Align2Bytes"] = 2097152] = "Align2Bytes";
            /**
             * Align data on a 4-byte boundary.
             * This is valid only for object files.
             */
            SectionCharacteristics[SectionCharacteristics["Align4Bytes"] = 3145728] = "Align4Bytes";
            /**
             * Align data on a 8-byte boundary.
             * This is valid only for object files.
             */
            SectionCharacteristics[SectionCharacteristics["Align8Bytes"] = 4194304] = "Align8Bytes";
            /**
             * Align data on a 16-byte boundary.
             * This is valid only for object files.
             */
            SectionCharacteristics[SectionCharacteristics["Align16Bytes"] = 5242880] = "Align16Bytes";
            /**
             * Align data on a 32-byte boundary.
             * This is valid only for object files.
             */
            SectionCharacteristics[SectionCharacteristics["Align32Bytes"] = 6291456] = "Align32Bytes";
            /**
             * Align data on a 64-byte boundary.
             * This is valid only for object files.
             */
            SectionCharacteristics[SectionCharacteristics["Align64Bytes"] = 7340032] = "Align64Bytes";
            /**
             * Align data on a 128-byte boundary.
             * This is valid only for object files.
             */
            SectionCharacteristics[SectionCharacteristics["Align128Bytes"] = 8388608] = "Align128Bytes";
            /**
             * Align data on a 256-byte boundary.
             * This is valid only for object files.
             */
            SectionCharacteristics[SectionCharacteristics["Align256Bytes"] = 9437184] = "Align256Bytes";
            /**
             * Align data on a 512-byte boundary.
             * This is valid only for object files.
             */
            SectionCharacteristics[SectionCharacteristics["Align512Bytes"] = 10485760] = "Align512Bytes";
            /**
             * Align data on a 1024-byte boundary.
             * This is valid only for object files.
             */
            SectionCharacteristics[SectionCharacteristics["Align1024Bytes"] = 11534336] = "Align1024Bytes";
            /**
             * Align data on a 2048-byte boundary.
             * This is valid only for object files.
             */
            SectionCharacteristics[SectionCharacteristics["Align2048Bytes"] = 12582912] = "Align2048Bytes";
            /**
             * Align data on a 4096-byte boundary.
             * This is valid only for object files.
             */
            SectionCharacteristics[SectionCharacteristics["Align4096Bytes"] = 13631488] = "Align4096Bytes";
            /**
             * Align data on a 8192-byte boundary.
             * This is valid only for object files.
             */
            SectionCharacteristics[SectionCharacteristics["Align8192Bytes"] = 14680064] = "Align8192Bytes";
            /**
             * The section contains extended relocations.
             * The count of relocations for the section exceeds the 16 bits that is reserved for it in the section header.
             * If the NumberOfRelocations field in the section header is 0xffff,
             * the actual relocation count is stored in the VirtualAddress field of the first relocation.
             * It is an error if LinkerRelocationOverflow is set and there are fewer than 0xffff relocations in the section.
             */
            SectionCharacteristics[SectionCharacteristics["LinkerRelocationOverflow"] = 16777216] = "LinkerRelocationOverflow";
            /**
             * The section can be discarded as needed.
             */
            SectionCharacteristics[SectionCharacteristics["MemoryDiscardable"] = 33554432] = "MemoryDiscardable";
            /**
             * The section cannot be cached.
             */
            SectionCharacteristics[SectionCharacteristics["MemoryNotCached"] = 67108864] = "MemoryNotCached";
            /**
             * The section cannot be paged.
             */
            SectionCharacteristics[SectionCharacteristics["MemoryNotPaged"] = 134217728] = "MemoryNotPaged";
            /**
             * The section can be shared in memory.
             */
            SectionCharacteristics[SectionCharacteristics["MemoryShared"] = 268435456] = "MemoryShared";
            /**
             * The section can be executed as code.
             */
            SectionCharacteristics[SectionCharacteristics["MemoryExecute"] = 536870912] = "MemoryExecute";
            /**
             * The section can be read.
             */
            SectionCharacteristics[SectionCharacteristics["MemoryRead"] = 1073741824] = "MemoryRead";
            /**
             * The section can be written to.
             */
            SectionCharacteristics[SectionCharacteristics["MemoryWrite"] = 2147483648] = "MemoryWrite";
        })(SectionCharacteristics = headers.SectionCharacteristics || (headers.SectionCharacteristics = {}));
    })(headers = pe.headers || (pe.headers = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var headers;
    (function (headers) {
        var Subsystem;
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
        })(Subsystem = headers.Subsystem || (headers.Subsystem = {}));
    })(headers = pe.headers || (pe.headers = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            var AssemblyFlags;
            (function (AssemblyFlags) {
                /**
                 * The assembly reference holds the full (unhashed) public key.
                 */
                AssemblyFlags[AssemblyFlags["PublicKey"] = 1] = "PublicKey";
                /**
                 * The implementation of this assembly used at runtime is not expected to match the version seen at compile time.
                 * (See the text following this table.)
                 */
                AssemblyFlags[AssemblyFlags["Retargetable"] = 256] = "Retargetable";
                /**
                 * Reserved
                 * (a conforming implementation of the CLI can ignore this setting on read;
                 * some implementations might use this bit to indicate
                 * that a CIL-to-native-code compiler should not generate optimized code).
                 */
                AssemblyFlags[AssemblyFlags["DisableJITcompileOptimizer"] = 16384] = "DisableJITcompileOptimizer";
                /**
                 * Reserved
                 * (a conforming implementation of the CLI can ignore this setting on read;
                 * some implementations might use this bit to indicate
                 * that a CIL-to-native-code compiler should generate CIL-to-native code map).
                 */
                AssemblyFlags[AssemblyFlags["EnableJITcompileTracking"] = 32768] = "EnableJITcompileTracking";
            })(AssemblyFlags = metadata.AssemblyFlags || (metadata.AssemblyFlags = {}));
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            var AssemblyHashAlgorithm;
            (function (AssemblyHashAlgorithm) {
                AssemblyHashAlgorithm[AssemblyHashAlgorithm["None"] = 0] = "None";
                AssemblyHashAlgorithm[AssemblyHashAlgorithm["MD5"] = 32771] = "MD5";
                AssemblyHashAlgorithm[AssemblyHashAlgorithm["SHA1"] = 32772] = "SHA1";
                AssemblyHashAlgorithm[AssemblyHashAlgorithm["SHA256"] = 32780] = "SHA256";
                AssemblyHashAlgorithm[AssemblyHashAlgorithm["SHA384"] = 32781] = "SHA384";
                AssemblyHashAlgorithm[AssemblyHashAlgorithm["SHA512"] = 32782] = "SHA512";
            })(AssemblyHashAlgorithm = metadata.AssemblyHashAlgorithm || (metadata.AssemblyHashAlgorithm = {}));
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            /**
             * [ECMA-335 para23.2.3]
             */
            var CallingConventions;
            (function (CallingConventions) {
                /**
                 * Used to encode the keyword 'default' in the calling convention, see ECMA para15.3.
                 */
                CallingConventions[CallingConventions["Default"] = 0] = "Default";
                CallingConventions[CallingConventions["C"] = 1] = "C";
                CallingConventions[CallingConventions["StdCall"] = 2] = "StdCall";
                CallingConventions[CallingConventions["FastCall"] = 4] = "FastCall";
                /**
                 * Used to encode the keyword 'vararg' in the calling convention, see ECMA para15.3.
                 */
                CallingConventions[CallingConventions["VarArg"] = 5] = "VarArg";
                /**
                 * Used to indicate that the method has one or more generic parameters.
                 */
                CallingConventions[CallingConventions["Generic"] = 16] = "Generic";
                /**
                 * Used to encode the keyword 'instance' in the calling convention, see ECMA para15.3.
                 */
                CallingConventions[CallingConventions["HasThis"] = 32] = "HasThis";
                /**
                 * Used to encode the keyword 'explicit' in the calling convention, see ECMA para15.3.
                 */
                CallingConventions[CallingConventions["ExplicitThis"] = 64] = "ExplicitThis";
                /**
                 * (ECMA para23.1.16), used to encode '.managed..' in the parameter list, see ECMA para15.3.
                 */
                CallingConventions[CallingConventions["Sentinel"] = 65] = "Sentinel";
            })(CallingConventions = metadata.CallingConventions || (metadata.CallingConventions = {}));
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            var ClrImageFlags;
            (function (ClrImageFlags) {
                ClrImageFlags[ClrImageFlags["ILOnly"] = 1] = "ILOnly";
                ClrImageFlags[ClrImageFlags["_32BitRequired"] = 2] = "_32BitRequired";
                ClrImageFlags[ClrImageFlags["ILLibrary"] = 4] = "ILLibrary";
                ClrImageFlags[ClrImageFlags["StrongNameSigned"] = 8] = "StrongNameSigned";
                ClrImageFlags[ClrImageFlags["NativeEntryPoint"] = 16] = "NativeEntryPoint";
                ClrImageFlags[ClrImageFlags["TrackDebugData"] = 65536] = "TrackDebugData";
                ClrImageFlags[ClrImageFlags["IsIbcoptimized"] = 131072] = "IsIbcoptimized";
            })(ClrImageFlags = metadata.ClrImageFlags || (metadata.ClrImageFlags = {}));
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            var ClrMetadataSignature;
            (function (ClrMetadataSignature) {
                ClrMetadataSignature[ClrMetadataSignature["Signature"] = 1112167234] = "Signature";
            })(ClrMetadataSignature = metadata.ClrMetadataSignature || (metadata.ClrMetadataSignature = {}));
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            /**
             * [ECMA-335 para23.1.16]
             */
            var ElementType;
            (function (ElementType) {
                /**
                 * Marks end of a list.
                 */
                ElementType[ElementType["End"] = 0] = "End";
                ElementType[ElementType["Void"] = 1] = "Void";
                ElementType[ElementType["Boolean"] = 2] = "Boolean";
                ElementType[ElementType["Char"] = 3] = "Char";
                ElementType[ElementType["I1"] = 4] = "I1";
                ElementType[ElementType["U1"] = 5] = "U1";
                ElementType[ElementType["I2"] = 6] = "I2";
                ElementType[ElementType["U2"] = 7] = "U2";
                ElementType[ElementType["I4"] = 8] = "I4";
                ElementType[ElementType["U4"] = 9] = "U4";
                ElementType[ElementType["I8"] = 10] = "I8";
                ElementType[ElementType["U8"] = 11] = "U8";
                ElementType[ElementType["R4"] = 12] = "R4";
                ElementType[ElementType["R8"] = 13] = "R8";
                ElementType[ElementType["String"] = 14] = "String";
                /**
                 * Followed by type.
                 */
                ElementType[ElementType["Ptr"] = 15] = "Ptr";
                /**
                 * Followed by type.
                 */
                ElementType[ElementType["ByRef"] = 16] = "ByRef";
                /**
                 * Followed by TypeDef or TypeRef token.
                 */
                ElementType[ElementType["ValueType"] = 17] = "ValueType";
                /**
                 * Followed by TypeDef or TypeRef token.
                 */
                ElementType[ElementType["Class"] = 18] = "Class";
                /**
                 * Generic parameter in a generic type definition, represented as number (compressed unsigned integer).
                 */
                ElementType[ElementType["Var"] = 19] = "Var";
                /**
                 * type rank boundsCount bound1 loCount lo1
                 */
                ElementType[ElementType["Array"] = 20] = "Array";
                /**
                 * Generic type instantiation.  Followed by type typearg-count type-1 .managed.. type-n.
                 */
                ElementType[ElementType["GenericInst"] = 21] = "GenericInst";
                ElementType[ElementType["TypedByRef"] = 22] = "TypedByRef";
                /**
                 * System.IntPtr
                 */
                ElementType[ElementType["I"] = 24] = "I";
                /**
                 * System.UIntPtr
                 */
                ElementType[ElementType["U"] = 25] = "U";
                /**
                 * Followed by full method signature.
                 */
                ElementType[ElementType["FnPtr"] = 27] = "FnPtr";
                /**
                 * System.Object
                 */
                ElementType[ElementType["Object"] = 28] = "Object";
                /**
                 * Single-dim array with 0 lower bound
                 */
                ElementType[ElementType["SZArray"] = 29] = "SZArray";
                /**
                 * Generic parameter in a generic method definition, represented as number (compressed unsigned integer).
                 */
                ElementType[ElementType["MVar"] = 30] = "MVar";
                /**
                 * Required modifier: followed by TypeDef or TypeRef token.
                 */
                ElementType[ElementType["CMod_ReqD"] = 31] = "CMod_ReqD";
                /**
                 * Optional modifier: followed by TypeDef or TypeRef token.
                 */
                ElementType[ElementType["CMod_Opt"] = 32] = "CMod_Opt";
                /**
                 * Implemented within the CLI.
                 */
                ElementType[ElementType["Internal"] = 33] = "Internal";
                /**
                 * Or'd with following element types.
                 */
                ElementType[ElementType["Modifier"] = 64] = "Modifier";
                /**
                 * Sentinel for vararg method signature.
                 */
                ElementType[ElementType["Sentinel"] = 65] = "Sentinel";
                /**
                 * Denotes a local variable that points at a pinned object,
                 */
                ElementType[ElementType["Pinned"] = 69] = "Pinned";
                ElementType[ElementType["R4_Hfa"] = 70] = "R4_Hfa";
                ElementType[ElementType["R8_Hfa"] = 71] = "R8_Hfa";
                /**
                 * Indicates an argument of type System.Type.
                 */
                ElementType[ElementType["ArgumentType_"] = 80] = "ArgumentType_";
                /**
                 * Used in custom attributes to specify a boxed object (ECMA-335 para23.3).
                 */
                ElementType[ElementType["CustomAttribute_BoxedObject_"] = 81] = "CustomAttribute_BoxedObject_";
                /**
                 * Reserved_ = 0x12 | Modifier,
                 */
                /**
                 * Used in custom attributes to indicate a FIELD (ECMA-335 para22.10, 23.3).
                 */
                ElementType[ElementType["CustomAttribute_Field_"] = 83] = "CustomAttribute_Field_";
                /**
                 * Used in custom attributes to indicate a PROPERTY (ECMA-335 para22.10, 23.3).
                 */
                ElementType[ElementType["CustomAttribute_Property_"] = 84] = "CustomAttribute_Property_";
                /**
                 * Used in custom attributes to specify an enum (ECMA-335 para23.3).
                 */
                ElementType[ElementType["CustomAttribute_Enum_"] = 85] = "CustomAttribute_Enum_";
            })(ElementType = metadata.ElementType || (metadata.ElementType = {}));
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            /**
             * [ECMA-335 para23.1.4]
             */
            var EventAttributes;
            (function (EventAttributes) {
                /**
                 * Event is special.
                 */
                EventAttributes[EventAttributes["SpecialName"] = 512] = "SpecialName";
                /**
                 * CLI provides 'special' behavior, depending upon the name of the event.
                 */
                EventAttributes[EventAttributes["RTSpecialName"] = 1024] = "RTSpecialName";
            })(EventAttributes = metadata.EventAttributes || (metadata.EventAttributes = {}));
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            /**
             * [ECMA-335 para23.1.5]
             */
            var FieldAttributes;
            (function (FieldAttributes) {
                /**
                 * These 3 bits contain one of the following values:
                 * CompilerControlled, Private,
                 * FamANDAssem, Assembly,
                 * Family, FamORAssem,
                 * Public.
                 */
                FieldAttributes[FieldAttributes["FieldAccessMask"] = 7] = "FieldAccessMask";
                /***
                 * Member not referenceable.
                 */
                FieldAttributes[FieldAttributes["CompilerControlled"] = 0] = "CompilerControlled";
                /**
                 * Accessible only by the parent type.
                 */
                FieldAttributes[FieldAttributes["Private"] = 1] = "Private";
                /**
                 * Accessible by sub-types only in this Assembly.
                 */
                FieldAttributes[FieldAttributes["FamANDAssem"] = 2] = "FamANDAssem";
                /**
                 * Accessibly by anyone in the Assembly.
                 */
                FieldAttributes[FieldAttributes["Assembly"] = 3] = "Assembly";
                /**
                 * Accessible only by type and sub-types.
                 */
                FieldAttributes[FieldAttributes["Family"] = 4] = "Family";
                /**
                 * Accessibly by sub-types anywhere, plus anyone in assembly.
                 */
                FieldAttributes[FieldAttributes["FamORAssem"] = 5] = "FamORAssem";
                /**
                 * Accessibly by anyone who has visibility to this scope field contract attributes.
                 */
                FieldAttributes[FieldAttributes["Public"] = 6] = "Public";
                /**
                 * Defined on type, else per instance.
                 */
                FieldAttributes[FieldAttributes["Static"] = 16] = "Static";
                /**
                 * Field can only be initialized, not written to after init.
                 */
                FieldAttributes[FieldAttributes["InitOnly"] = 32] = "InitOnly";
                /**
                 * Value is compile time constant.
                 */
                FieldAttributes[FieldAttributes["Literal"] = 64] = "Literal";
                /**
                 * Reserved (to indicate this field should not be serialized when type is remoted).
                 */
                FieldAttributes[FieldAttributes["NotSerialized"] = 128] = "NotSerialized";
                /**
                 * Field is special.
                 */
                FieldAttributes[FieldAttributes["SpecialName"] = 512] = "SpecialName";
                /**
                 * Interop Attributes
                 */
                /**
                 * Implementation is forwarded through PInvoke.
                 */
                FieldAttributes[FieldAttributes["PInvokeImpl"] = 8192] = "PInvokeImpl";
                /**
                 * Additional flags
                 */
                /**
                 * CLI provides 'special' behavior, depending upon the name of the field.
                 */
                FieldAttributes[FieldAttributes["RTSpecialName"] = 1024] = "RTSpecialName";
                /**
                 * Field has marshalling information.
                 */
                FieldAttributes[FieldAttributes["HasFieldMarshal"] = 4096] = "HasFieldMarshal";
                /**
                 * Field has default.
                 */
                FieldAttributes[FieldAttributes["HasDefault"] = 32768] = "HasDefault";
                /**
                 * Field has RVA.
                 */
                FieldAttributes[FieldAttributes["HasFieldRVA"] = 256] = "HasFieldRVA";
            })(FieldAttributes = metadata.FieldAttributes || (metadata.FieldAttributes = {}));
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            /**
             * [ECMA-335 para23.1.6]
             */
            var FileAttributes;
            (function (FileAttributes) {
                /**
                 * This is not a resource file.
                 */
                FileAttributes[FileAttributes["ContainsMetaData"] = 0] = "ContainsMetaData";
                /**
                 * This is a resource file or other non-metadata-containing file.
                 */
                FileAttributes[FileAttributes["ContainsNoMetaData"] = 1] = "ContainsNoMetaData";
            })(FileAttributes = metadata.FileAttributes || (metadata.FileAttributes = {}));
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            // [ECMA-335 para23.1.9]
            var ManifestResourceAttributes;
            (function (ManifestResourceAttributes) {
                // These 3 bits contain one of the following values:
                ManifestResourceAttributes[ManifestResourceAttributes["VisibilityMask"] = 7] = "VisibilityMask";
                // The Resource is exported from the Assembly.
                ManifestResourceAttributes[ManifestResourceAttributes["Public"] = 1] = "Public";
                // The Resource is private to the Assembly.
                ManifestResourceAttributes[ManifestResourceAttributes["Private"] = 2] = "Private";
            })(ManifestResourceAttributes = metadata.ManifestResourceAttributes || (metadata.ManifestResourceAttributes = {}));
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            /** [ECMA-335 para23.1.10] */
            var MethodAttributes;
            (function (MethodAttributes) {
                // These 3 bits contain one of the following values:
                // CompilerControlled, 
                // Private, 
                // FamANDAssem, 
                // Assem, 
                // Family, 
                // FamORAssem, 
                // Public
                MethodAttributes[MethodAttributes["MemberAccessMask"] = 7] = "MemberAccessMask";
                // Member not referenceable.
                MethodAttributes[MethodAttributes["CompilerControlled"] = 0] = "CompilerControlled";
                // Accessible only by the parent type.
                MethodAttributes[MethodAttributes["Private"] = 1] = "Private";
                // Accessible by sub-types only in this Assembly.
                MethodAttributes[MethodAttributes["FamANDAssem"] = 2] = "FamANDAssem";
                // Accessibly by anyone in the Assembly.
                MethodAttributes[MethodAttributes["Assem"] = 3] = "Assem";
                // Accessible only by type and sub-types.
                MethodAttributes[MethodAttributes["Family"] = 4] = "Family";
                // Accessibly by sub-types anywhere, plus anyone in assembly.
                MethodAttributes[MethodAttributes["FamORAssem"] = 5] = "FamORAssem";
                // Accessibly by anyone who has visibility to this scope.
                MethodAttributes[MethodAttributes["Public"] = 6] = "Public";
                // Defined on type, else per instance.
                MethodAttributes[MethodAttributes["Static"] = 16] = "Static";
                // Method cannot be overridden.
                MethodAttributes[MethodAttributes["Final"] = 32] = "Final";
                // Method is virtual.
                MethodAttributes[MethodAttributes["Virtual"] = 64] = "Virtual";
                // Method hides by name+sig, else just by name.
                MethodAttributes[MethodAttributes["HideBySig"] = 128] = "HideBySig";
                // Use this mask to retrieve vtable attributes. This bit contains one of the following values:
                // ReuseSlot, NewSlot.
                MethodAttributes[MethodAttributes["VtableLayoutMask"] = 256] = "VtableLayoutMask";
                // Method reuses existing slot in vtable.
                MethodAttributes[MethodAttributes["ReuseSlot"] = 0] = "ReuseSlot";
                // Method always gets a new slot in the vtable.
                MethodAttributes[MethodAttributes["NewSlot"] = 256] = "NewSlot";
                // Method can only be overriden if also accessible.
                MethodAttributes[MethodAttributes["Strict"] = 512] = "Strict";
                // Method does not provide an implementation.
                MethodAttributes[MethodAttributes["Abstract"] = 1024] = "Abstract";
                // Method is special.
                MethodAttributes[MethodAttributes["SpecialName"] = 2048] = "SpecialName";
                // Interop attributes
                // Implementation is forwarded through PInvoke.
                MethodAttributes[MethodAttributes["PInvokeImpl"] = 8192] = "PInvokeImpl";
                // Reserved: shall be zero for conforming implementations.
                MethodAttributes[MethodAttributes["UnmanagedExport"] = 8] = "UnmanagedExport";
                // Additional flags
                // CLI provides 'special' behavior, depending upon the name of the method.
                MethodAttributes[MethodAttributes["RTSpecialName"] = 4096] = "RTSpecialName";
                // Method has security associated with it.
                MethodAttributes[MethodAttributes["HasSecurity"] = 16384] = "HasSecurity";
                // Method calls another method containing security code.
                MethodAttributes[MethodAttributes["RequireSecObject"] = 32768] = "RequireSecObject";
            })(MethodAttributes = metadata.MethodAttributes || (metadata.MethodAttributes = {}));
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            var MethodImplAttributes;
            (function (MethodImplAttributes) {
                // These 2 bits contain one of the following values:
                // IL, Native, OPTIL, Runtime.
                MethodImplAttributes[MethodImplAttributes["CodeTypeMask"] = 3] = "CodeTypeMask";
                // Method impl is CIL.
                MethodImplAttributes[MethodImplAttributes["IL"] = 0] = "IL";
                // Method impl is native.
                MethodImplAttributes[MethodImplAttributes["Native"] = 1] = "Native";
                // Reserved: shall be zero in conforming implementations.
                MethodImplAttributes[MethodImplAttributes["OPTIL"] = 2] = "OPTIL";
                // Method impl is provided by the runtime.
                MethodImplAttributes[MethodImplAttributes["Runtime"] = 3] = "Runtime";
                // Flags specifying whether the code is managed or unmanaged.
                // This bit contains one of the following values:
                // Unmanaged, Managed.
                MethodImplAttributes[MethodImplAttributes["ManagedMask"] = 4] = "ManagedMask";
                // Method impl is unmanaged, otherwise managed.
                MethodImplAttributes[MethodImplAttributes["Unmanaged"] = 4] = "Unmanaged";
                // Method impl is managed.
                MethodImplAttributes[MethodImplAttributes["Managed"] = 0] = "Managed";
                // Implementation info and interop
                // Indicates method is defined; used primarily in merge scenarios.
                MethodImplAttributes[MethodImplAttributes["ForwardRef"] = 16] = "ForwardRef";
                // Reserved: conforming implementations can ignore.
                MethodImplAttributes[MethodImplAttributes["PreserveSig"] = 128] = "PreserveSig";
                // Reserved: shall be zero in conforming implementations.
                MethodImplAttributes[MethodImplAttributes["InternalCall"] = 4096] = "InternalCall";
                // Method is single threaded through the body.
                MethodImplAttributes[MethodImplAttributes["Synchronized"] = 32] = "Synchronized";
                // Method cannot be inlined.
                MethodImplAttributes[MethodImplAttributes["NoInlining"] = 8] = "NoInlining";
                // Range check value.
                MethodImplAttributes[MethodImplAttributes["MaxMethodImplVal"] = 65535] = "MaxMethodImplVal";
                // Method will not be optimized when generating native code.
                MethodImplAttributes[MethodImplAttributes["NoOptimization"] = 64] = "NoOptimization";
            })(MethodImplAttributes = metadata.MethodImplAttributes || (metadata.MethodImplAttributes = {}));
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            // [ECMA-335 para23.1.12]
            var MethodSemanticsAttributes;
            (function (MethodSemanticsAttributes) {
                // Setter for property.
                MethodSemanticsAttributes[MethodSemanticsAttributes["Setter"] = 1] = "Setter";
                // Getter for property.
                MethodSemanticsAttributes[MethodSemanticsAttributes["Getter"] = 2] = "Getter";
                // Other method for property or event.
                MethodSemanticsAttributes[MethodSemanticsAttributes["Other"] = 4] = "Other";
                // AddOn method for event.
                // This refers to the required add_ method for events.  (ECMA-335 para22.13)
                MethodSemanticsAttributes[MethodSemanticsAttributes["AddOn"] = 8] = "AddOn";
                // RemoveOn method for event.
                // This refers to the required remove_ method for events. (ECMA-335 para22.13)
                MethodSemanticsAttributes[MethodSemanticsAttributes["RemoveOn"] = 16] = "RemoveOn";
                // Fire method for event.
                // This refers to the optional raise_ method for events. (ECMA-335 para22.13)
                MethodSemanticsAttributes[MethodSemanticsAttributes["Fire"] = 32] = "Fire";
            })(MethodSemanticsAttributes = metadata.MethodSemanticsAttributes || (metadata.MethodSemanticsAttributes = {}));
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            // [ECMA-335 para23.1.8]
            var PInvokeAttributes;
            (function (PInvokeAttributes) {
                // PInvoke is to use the member name as specified.
                PInvokeAttributes[PInvokeAttributes["NoMangle"] = 1] = "NoMangle";
                // Character set
                // These 2 bits contain one of the following values:
                // CharSetNotSpec,
                // CharSetAnsi,
                // CharSetUnicode,
                // CharSetAuto.
                PInvokeAttributes[PInvokeAttributes["CharSetMask"] = 6] = "CharSetMask";
                PInvokeAttributes[PInvokeAttributes["CharSetNotSpec"] = 0] = "CharSetNotSpec";
                PInvokeAttributes[PInvokeAttributes["CharSetAnsi"] = 2] = "CharSetAnsi";
                PInvokeAttributes[PInvokeAttributes["CharSetUnicode"] = 4] = "CharSetUnicode";
                PInvokeAttributes[PInvokeAttributes["CharSetAuto"] = 6] = "CharSetAuto";
                // Information about target function. Not relevant for fields.
                PInvokeAttributes[PInvokeAttributes["SupportsLastError"] = 64] = "SupportsLastError";
                // Calling convention
                // These 3 bits contain one of the following values:
                // CallConvPlatformapi,
                // CallConvCdecl,
                // CallConvStdcall,
                // CallConvThiscall,
                // CallConvFastcall.
                PInvokeAttributes[PInvokeAttributes["CallConvMask"] = 1792] = "CallConvMask";
                PInvokeAttributes[PInvokeAttributes["CallConvPlatformapi"] = 256] = "CallConvPlatformapi";
                PInvokeAttributes[PInvokeAttributes["CallConvCdecl"] = 512] = "CallConvCdecl";
                PInvokeAttributes[PInvokeAttributes["CallConvStdcall"] = 768] = "CallConvStdcall";
                PInvokeAttributes[PInvokeAttributes["CallConvThiscall"] = 1024] = "CallConvThiscall";
                PInvokeAttributes[PInvokeAttributes["CallConvFastcall"] = 1280] = "CallConvFastcall";
            })(PInvokeAttributes = metadata.PInvokeAttributes || (metadata.PInvokeAttributes = {}));
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            // [ECMA-335 para23.1.13]
            var ParamAttributes;
            (function (ParamAttributes) {
                // Param is [In].
                ParamAttributes[ParamAttributes["In"] = 1] = "In";
                // Param is [out].
                ParamAttributes[ParamAttributes["Out"] = 2] = "Out";
                // Param is optional.
                ParamAttributes[ParamAttributes["Optional"] = 16] = "Optional";
                // Param has default value.
                ParamAttributes[ParamAttributes["HasDefault"] = 4096] = "HasDefault";
                // Param has FieldMarshal.
                ParamAttributes[ParamAttributes["HasFieldMarshal"] = 8192] = "HasFieldMarshal";
                // Reserved: shall be zero in a conforming implementation.
                ParamAttributes[ParamAttributes["Unused"] = 53216] = "Unused";
            })(ParamAttributes = metadata.ParamAttributes || (metadata.ParamAttributes = {}));
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            // [ECMA-335 para23.1.14]
            var PropertyAttributes;
            (function (PropertyAttributes) {
                // Property is special.
                PropertyAttributes[PropertyAttributes["SpecialName"] = 512] = "SpecialName";
                // Runtime(metadata internal APIs) should check name encoding.
                PropertyAttributes[PropertyAttributes["RTSpecialName"] = 1024] = "RTSpecialName";
                // Property has default.
                PropertyAttributes[PropertyAttributes["HasDefault"] = 4096] = "HasDefault";
                // Reserved: shall be zero in a conforming implementation.
                PropertyAttributes[PropertyAttributes["Unused"] = 59903] = "Unused";
            })(PropertyAttributes = metadata.PropertyAttributes || (metadata.PropertyAttributes = {}));
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            var TypeAttributes;
            (function (TypeAttributes) {
                // Visibility attributes
                // Use this mask to retrieve visibility information.
                // These 3 bits contain one of the following values:
                // NotPublic, Public,
                // NestedPublic, NestedPrivate,
                // NestedFamily, NestedAssembly,
                // NestedFamANDAssem, NestedFamORAssem.
                TypeAttributes[TypeAttributes["VisibilityMask"] = 7] = "VisibilityMask";
                // Class has no public scope.
                TypeAttributes[TypeAttributes["NotPublic"] = 0] = "NotPublic";
                // Class has public scope.
                TypeAttributes[TypeAttributes["Public"] = 1] = "Public";
                // Class is nested with public visibility.
                TypeAttributes[TypeAttributes["NestedPublic"] = 2] = "NestedPublic";
                // Class is nested with private visibility.
                TypeAttributes[TypeAttributes["NestedPrivate"] = 3] = "NestedPrivate";
                // Class is nested with family visibility.
                TypeAttributes[TypeAttributes["NestedFamily"] = 4] = "NestedFamily";
                // Class is nested with assembly visibility.
                TypeAttributes[TypeAttributes["NestedAssembly"] = 5] = "NestedAssembly";
                // Class is nested with family and assembly visibility.
                TypeAttributes[TypeAttributes["NestedFamANDAssem"] = 6] = "NestedFamANDAssem";
                // Class is nested with family or assembly visibility.
                TypeAttributes[TypeAttributes["NestedFamORAssem"] = 7] = "NestedFamORAssem";
                // Class layout attributes
                // Use this mask to retrieve class layout information.
                // These 2 bits contain one of the following values:
                // AutoLayout, SequentialLayout, ExplicitLayout.
                TypeAttributes[TypeAttributes["LayoutMask"] = 24] = "LayoutMask";
                // Class fields are auto-laid out.
                TypeAttributes[TypeAttributes["AutoLayout"] = 0] = "AutoLayout";
                // Class fields are laid out sequentially.
                TypeAttributes[TypeAttributes["SequentialLayout"] = 8] = "SequentialLayout";
                // Layout is supplied explicitly.
                TypeAttributes[TypeAttributes["ExplicitLayout"] = 16] = "ExplicitLayout";
                // Class semantics attributes
                // Use this mask to retrive class semantics information.
                // This bit contains one of the following values:
                // Class, Interface.
                TypeAttributes[TypeAttributes["ClassSemanticsMask"] = 32] = "ClassSemanticsMask";
                // Type is a class.
                TypeAttributes[TypeAttributes["Class"] = 0] = "Class";
                // Type is an interface.
                TypeAttributes[TypeAttributes["Interface"] = 32] = "Interface";
                // Special semantics in addition to class semantics
                // Class is abstract.
                TypeAttributes[TypeAttributes["Abstract"] = 128] = "Abstract";
                // Class cannot be extended.
                TypeAttributes[TypeAttributes["Sealed"] = 256] = "Sealed";
                // Class name is special.
                TypeAttributes[TypeAttributes["SpecialName"] = 1024] = "SpecialName";
                // Implementation Attributes
                // Class/Interface is imported.
                TypeAttributes[TypeAttributes["Import"] = 4096] = "Import";
                // Reserved (Class is serializable)
                TypeAttributes[TypeAttributes["Serializable"] = 8192] = "Serializable";
                // String formatting Attributes
                // Use this mask to retrieve string information for native interop.
                // These 2 bits contain one of the following values:
                // AnsiClass, UnicodeClass, AutoClass, CustomFormatClass.
                TypeAttributes[TypeAttributes["StringFormatMask"] = 196608] = "StringFormatMask";
                // LPSTR is interpreted as ANSI.
                TypeAttributes[TypeAttributes["AnsiClass"] = 0] = "AnsiClass";
                // LPSTR is interpreted as Unicode.
                TypeAttributes[TypeAttributes["UnicodeClass"] = 65536] = "UnicodeClass";
                // LPSTR is interpreted automatically.
                TypeAttributes[TypeAttributes["AutoClass"] = 131072] = "AutoClass";
                // A non-standard encoding specified by CustomStringFormatMask.
                TypeAttributes[TypeAttributes["CustomFormatClass"] = 196608] = "CustomFormatClass";
                // Use this mask to retrieve non-standard encoding information for native interop.
                // The meaning of the values of these 2 bits isunspecified.
                TypeAttributes[TypeAttributes["CustomStringFormatMask"] = 12582912] = "CustomStringFormatMask";
                // Class Initialization Attributes
                // Initialize the class before first static field access.
                TypeAttributes[TypeAttributes["BeforeFieldInit"] = 1048576] = "BeforeFieldInit";
                // Additional Flags
                // CLI provides 'special' behavior, depending upon the name of the Type
                TypeAttributes[TypeAttributes["RTSpecialName"] = 2048] = "RTSpecialName";
                // Type has security associate with it.
                TypeAttributes[TypeAttributes["HasSecurity"] = 262144] = "HasSecurity";
                // This ExportedTypeEntry is a type forwarder.
                TypeAttributes[TypeAttributes["IsTypeForwarder"] = 2097152] = "IsTypeForwarder";
            })(TypeAttributes = metadata.TypeAttributes || (metadata.TypeAttributes = {}));
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var headers;
    (function (headers) {
        var DosHeader = /** @class */ (function () {
            function DosHeader() {
                this.mz = headers.MZSignature.MZ;
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
                this.res1 = new pe.Long(0, 0);
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
                var result = "[" +
                    (this.mz === headers.MZSignature.MZ ? "MZ" :
                        typeof this.mz === "number" ? this.mz.toString(16).toUpperCase() + "h" :
                            typeof this.mz) + "]" +
                    ".lfanew=" +
                    (typeof this.lfanew === "number" ? this.lfanew.toString(16).toUpperCase() + "h" :
                        typeof this.lfanew);
                return result;
            };
            DosHeader.prototype.read = function (reader) {
                this.mz = reader.readShort();
                if (this.mz != headers.MZSignature.MZ)
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
            DosHeader.intSize = 16;
            return DosHeader;
        }());
        headers.DosHeader = DosHeader;
    })(headers = pe.headers || (pe.headers = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var headers;
    (function (headers) {
        var OptionalHeader = /** @class */ (function () {
            function OptionalHeader() {
                /** Differentiates 32-bit images from 64-bit. */
                this.peMagic = headers.PEMagic.NT32;
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
                this.subsystem = headers.Subsystem.WindowsCUI;
                /**
                 * The DLL characteristics of the image.
                 */
                this.dllCharacteristics = headers.DllCharacteristics.NxCompatible;
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
                var peMagicText = pe.formatEnum(this.peMagic, headers.PEMagic);
                if (peMagicText)
                    result.push(peMagicText);
                var subsystemText = pe.formatEnum(this.subsystem, headers.Subsystem);
                if (subsystemText)
                    result.push(subsystemText);
                var dllCharacteristicsText = pe.formatEnum(this.dllCharacteristics, headers.DllCharacteristics);
                if (dllCharacteristicsText)
                    result.push(dllCharacteristicsText);
                var nonzeroDataDirectoriesText = [];
                if (this.dataDirectories) {
                    for (var i = 0; i < this.dataDirectories.length; i++) {
                        if (!this.dataDirectories[i] || this.dataDirectories[i].size <= 0)
                            continue;
                        var kind = pe.formatEnum(i, headers.DataDirectoryKind);
                        nonzeroDataDirectoriesText.push(kind);
                    }
                }
                result.push("dataDirectories[" +
                    nonzeroDataDirectoriesText.join(",") + "]");
                var resultText = result.join(" ");
                return resultText;
            };
            OptionalHeader.prototype.read = function (reader) {
                this.peMagic = reader.readShort();
                if (this.peMagic != headers.PEMagic.NT32
                    && this.peMagic != headers.PEMagic.NT64)
                    throw Error("Unsupported PE magic value " + this.peMagic.toString(16).toUpperCase() + "h.");
                this.linkerVersion = reader.readByte() + "." + reader.readByte();
                this.sizeOfCode = reader.readInt();
                this.sizeOfInitializedData = reader.readInt();
                this.sizeOfUninitializedData = reader.readInt();
                this.addressOfEntryPoint = reader.readInt();
                this.baseOfCode = reader.readInt();
                if (this.peMagic == headers.PEMagic.NT32) {
                    this.baseOfData = reader.readInt();
                    this.imageBase = reader.readInt();
                }
                else {
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
                if (this.peMagic == headers.PEMagic.NT32) {
                    this.sizeOfStackReserve = reader.readInt();
                    this.sizeOfStackCommit = reader.readInt();
                    this.sizeOfHeapReserve = reader.readInt();
                    this.sizeOfHeapCommit = reader.readInt();
                }
                else {
                    this.sizeOfStackReserve = reader.readLong();
                    this.sizeOfStackCommit = reader.readLong();
                    this.sizeOfHeapReserve = reader.readLong();
                    this.sizeOfHeapCommit = reader.readLong();
                }
                this.loaderFlags = reader.readInt();
                this.numberOfRvaAndSizes = reader.readInt();
                if (this.dataDirectories == null
                    || this.dataDirectories.length != this.numberOfRvaAndSizes)
                    this.dataDirectories = (Array(this.numberOfRvaAndSizes));
                for (var i = 0; i < this.numberOfRvaAndSizes; i++) {
                    if (this.dataDirectories[i]) {
                        this.dataDirectories[i].address = reader.readInt();
                        this.dataDirectories[i].size = reader.readInt();
                    }
                    else {
                        this.dataDirectories[i] = new headers.AddressRange(reader.readInt(), reader.readInt());
                    }
                }
            };
            OptionalHeader.intSize32 = 6;
            OptionalHeader.intSize64 = 10;
            return OptionalHeader;
        }());
        headers.OptionalHeader = OptionalHeader;
    })(headers = pe.headers || (pe.headers = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var headers;
    (function (headers) {
        var PEFileHeaders = /** @class */ (function () {
            function PEFileHeaders() {
                this.dosHeader = new headers.DosHeader();
                this.dosStub = [];
                this.peHeader = new headers.PEHeader();
                this.optionalHeader = new headers.OptionalHeader();
                this.sectionHeaders = [];
            }
            PEFileHeaders.prototype.toString = function () {
                var result = "dosHeader: " + (this.dosHeader ? this.dosHeader + "" : "null") + " " +
                    "dosStub: " + (this.dosStub ? "[" + this.dosStub.length + "]" : "null") + " " +
                    "peHeader: " + (this.peHeader ? "[" + this.peHeader.machine + "]" : "null") + " " +
                    "optionalHeader: " + (this.optionalHeader ? "[" + pe.formatEnum(this.optionalHeader.subsystem, headers.Subsystem) + "," + this.optionalHeader.imageVersion + "]" : "null") + " " +
                    "sectionHeaders: " + (this.sectionHeaders ? "[" + this.sectionHeaders.length + "]" : "null");
                return result;
            };
            PEFileHeaders.prototype.read = function (reader, async) {
                this._continueRead(reader, async, 0);
            };
            PEFileHeaders.prototype._continueRead = function (reader, async, stage) {
                var _this = this;
                var dosHeaderSize = 64;
                var stageCount = 6;
                switch (stage) {
                    case 0:
                        if (!this.dosHeader)
                            this.dosHeader = new headers.DosHeader();
                        this.dosHeader.read(reader);
                        stage++;
                        if (async && async.progress) {
                            var continueLater = async.progress(stage, stageCount);
                            if (continueLater) {
                                continueLater(function () { return _this._continueRead(reader, async, stage); });
                                return;
                            }
                        }
                    case 1:
                        var dosHeaderLength = this.dosHeader.lfanew - dosHeaderSize;
                        if (dosHeaderLength > 0)
                            this.dosStub = reader.readBytes(dosHeaderLength);
                        else
                            this.dosStub = null;
                        stage++;
                        if (async && async.progress) {
                            var continueLater = async.progress(stage, stageCount);
                            if (continueLater) {
                                continueLater(function () { return _this._continueRead(reader, async, stage); });
                                return;
                            }
                        }
                    case 2:
                        if (!this.peHeader)
                            this.peHeader = new headers.PEHeader();
                        this.peHeader.read(reader);
                        stage++;
                        if (async && async.progress) {
                            var continueLater = async.progress(stage, stageCount);
                            if (continueLater) {
                                continueLater(function () { return _this._continueRead(reader, async, stage); });
                                return;
                            }
                        }
                    case 3:
                        if (!this.optionalHeader)
                            this.optionalHeader = new headers.OptionalHeader();
                        this.optionalHeader.read(reader);
                        stage++;
                        if (async && async.progress) {
                            var continueLater = async.progress(stage, stageCount);
                            if (continueLater) {
                                continueLater(function () { return _this._continueRead(reader, async, stage); });
                                return;
                            }
                        }
                    case 4:
                        if (this.peHeader.numberOfSections > 0) {
                            if (!this.sectionHeaders || this.sectionHeaders.length != this.peHeader.numberOfSections)
                                this.sectionHeaders = Array(this.peHeader.numberOfSections);
                            for (var i = 0; i < this.sectionHeaders.length; i++) {
                                if (!this.sectionHeaders[i])
                                    this.sectionHeaders[i] = new headers.SectionHeader();
                                this.sectionHeaders[i].read(reader);
                            }
                        }
                        if (async) {
                            async(null, this);
                        }
                }
            };
            return PEFileHeaders;
        }());
        headers.PEFileHeaders = PEFileHeaders;
    })(headers = pe.headers || (pe.headers = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var headers;
    (function (headers) {
        var PEHeader = /** @class */ (function () {
            function PEHeader() {
                this.pe = headers.PESignature.PE;
                /**
                 * The architecture type of the computer.
                 * An image file can only be run on the specified computer or a system that emulates the specified computer.
                 */
                this.machine = headers.Machine.I386;
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
                this.characteristics = headers.ImageCharacteristics.Dll | headers.ImageCharacteristics.Bit32Machine;
            }
            PEHeader.prototype.toString = function () {
                var result = pe.formatEnum(this.machine, headers.Machine) + " " +
                    pe.formatEnum(this.characteristics, headers.ImageCharacteristics) + " " +
                    "Sections[" + this.numberOfSections + "]";
                return result;
            };
            PEHeader.prototype.read = function (reader) {
                this.pe = reader.readInt();
                if (this.pe != headers.PESignature.PE)
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
            PEHeader.intSize = 6;
            return PEHeader;
        }());
        headers.PEHeader = PEHeader;
    })(headers = pe.headers || (pe.headers = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var headers;
    (function (headers) {
        // TODO: move it in its own file (why TF it doesn't compile now??)
        var AddressRange = /** @class */ (function () {
            function AddressRange(address, size) {
                this.address = address;
                this.size = size;
                if (!this.address)
                    this.address = 0;
                if (!this.size)
                    this.size = 0;
            }
            AddressRange.prototype.mapRelative = function (offset) {
                var result = offset - this.address;
                if (result >= 0 && result < this.size)
                    return result;
                else
                    return -1;
            };
            AddressRange.prototype.toString = function () { return this.address.toString(16).toUpperCase() + ":" + this.size.toString(16).toUpperCase() + "h"; };
            return AddressRange;
        }());
        headers.AddressRange = AddressRange;
        var AddressRangeMap = /** @class */ (function (_super) {
            __extends(AddressRangeMap, _super);
            function AddressRangeMap(address, size, virtualAddress) {
                var _this = _super.call(this, address, size) || this;
                _this.virtualAddress = virtualAddress;
                if (!_this.virtualAddress)
                    _this.virtualAddress = 0;
                return _this;
            }
            AddressRangeMap.prototype.toString = function () { return this.address.toString(16).toUpperCase() + ":" + this.size.toString(16).toUpperCase() + "@" + this.virtualAddress + "h"; };
            return AddressRangeMap;
        }(AddressRange));
        headers.AddressRangeMap = AddressRangeMap;
        var SectionHeader = /** @class */ (function (_super) {
            __extends(SectionHeader, _super);
            function SectionHeader() {
                var _this = _super.call(this) || this;
                /**
                 * An 8-byte, null-padded UTF-8 string.
                 * There is no terminating null character if the string is exactly eight characters long.
                 * For longer names, this member contains a forward slash (/)
                 * followed by an ASCII representation of a decimal number that is an offset into the string table.
                 * Executable images do not use a string table
                 * and do not support section names longer than eight characters.
                 */
                _this.name = "";
                /**
                 * A file pointer to the beginning of the relocation entries for the section.
                 * If there are no relocations, this value is zero.
                 */
                _this.pointerToRelocations = 0;
                /**
                 * A file pointer to the beginning of the line-number entries for the section.
                 * If there are no COFF line numbers, this value is zero.
                 */
                _this.pointerToLinenumbers = 0;
                /**
                 * Ushort.
                 * The number of relocation entries for the section.
                 * This value is zero for executable images.
                 */
                _this.numberOfRelocations = 0;
                /**
                 * Ushort.
                 * The number of line-number entries for the section.
                 */
                _this.numberOfLinenumbers = 0;
                /**
                 * The characteristics of the image.
                 */
                _this.characteristics = headers.SectionCharacteristics.ContainsCode;
                return _this;
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
            SectionHeader.intSize = 16;
            return SectionHeader;
        }(AddressRangeMap));
        headers.SectionHeader = SectionHeader;
    })(headers = pe.headers || (pe.headers = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var io;
    (function (io) {
        var checkBufferReaderOverrideOnFirstCreation = false;
        var BufferReader = /** @class */ (function () {
            function BufferReader(view) {
                this.offset = 0;
                this.sections = [];
                this._currentSectionIndex = 0;
                this._currentView = null;
                if (checkBufferReaderOverrideOnFirstCreation) {
                    // whatever we discover, stick to it, don't repeat it again
                    checkBufferReaderOverrideOnFirstCreation = false;
                    var global = (function () { return this; })();
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
                    this._currentView = view;
                }
                else if ("byteLength" in view) {
                    this._currentView = new DataView(view);
                }
                else {
                    var arrb = new ArrayBuffer(view.length);
                    this._currentView = new DataView(arrb);
                    for (var i = 0; i < view.length; i++) {
                        this._currentView.setUint8(i, view[i]);
                    }
                }
            }
            BufferReader.prototype.readByte = function () {
                var v = this._getView(1);
                var result = v.getUint8(this.offset);
                this.offset++;
                return result;
            };
            BufferReader.prototype.peekByte = function () {
                var v = this._getView(1);
                var result = v.getUint8(this.offset);
                return result;
            };
            BufferReader.prototype.readShort = function () {
                var v = this._getView(2);
                var result = v.getUint16(this.offset, true);
                this.offset += 2;
                return result;
            };
            BufferReader.prototype.readInt = function () {
                var v = this._getView(4);
                var result = v.getUint32(this.offset, true);
                this.offset += 4;
                return result;
            };
            BufferReader.prototype.readLong = function () {
                var v = this._getView(8);
                var lo = v.getUint32(this.offset, true);
                var hi = v.getUint32(this.offset + 4, true);
                this.offset += 8;
                return new pe.Long(lo, hi);
            };
            BufferReader.prototype.readBytes = function (length) {
                var v = this._getView(length);
                var result = new Uint8Array(v.buffer, v.byteOffset + this.offset, length);
                this.offset += length;
                return result;
            };
            BufferReader.prototype.readZeroFilledAscii = function (length) {
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
            };
            BufferReader.prototype.readAsciiZ = function (maxLength) {
                if (maxLength === void 0) {
                    maxLength = 1024;
                }
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
            };
            BufferReader.prototype.readUtf8Z = function (maxLength) {
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
            };
            BufferReader.prototype.getVirtualOffset = function () {
                var result = this._tryMapToVirtual(this.offset);
                if (result < 0)
                    throw new Error("Cannot map current position into virtual address space.");
                return result;
            };
            BufferReader.prototype.setVirtualOffset = function (rva) {
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
                    if (relative >= 0 && relative < s.size) {
                        this._currentSectionIndex = i;
                        this.offset = relative + s.address;
                        return;
                    }
                }
                throw new Error("Address 0x" + rva.toString(16).toUpperCase() + " is outside of virtual address space.");
            };
            BufferReader.prototype._getView = function (numBytes) {
                return this._currentView;
            };
            BufferReader.prototype._tryMapToVirtual = function (offset) {
                if (this._currentSectionIndex >= 0
                    && this._currentSectionIndex < this.sections.length) {
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
        }());
        io.BufferReader = BufferReader;
        var ArrayReader = /** @class */ (function (_super) {
            __extends(ArrayReader, _super);
            function ArrayReader(_array) {
                var _this = _super.call(this, null) || this;
                _this._array = _array;
                _this.offset = 0;
                _this.sections = [];
                return _this;
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
                var result = this._array[this.offset] +
                    (this._array[this.offset + 1] << 8);
                this.offset += 2;
                return result;
            };
            ArrayReader.prototype.readInt = function () {
                var result = this._array[this.offset] +
                    (this._array[this.offset + 1] << 8) +
                    (this._array[this.offset + 2] << 16) +
                    (this._array[this.offset + 3] * 0x1000000);
                this.offset += 4;
                return result;
            };
            ArrayReader.prototype.readLong = function () {
                var lo = this.readInt();
                var hi = this.readInt();
                return new pe.Long(lo, hi);
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
                if (maxLength === void 0) {
                    maxLength = 1024;
                }
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
            };
            ArrayReader.prototype.getVirtualOffset = function () {
                var result = this._tryMapToVirtual2(this.offset);
                if (result < 0)
                    throw new Error("Cannot map current position into virtual address space.");
                return result;
            };
            ArrayReader.prototype.setVirtualOffset = function (rva) {
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
                    if (relative >= 0 && relative < s.size) {
                        this._currentSectionIndex = i;
                        this.offset = relative + s.address;
                        return;
                    }
                }
                throw new Error("Address is outside of virtual address space.");
            };
            ArrayReader.prototype._tryMapToVirtual2 = function (offset) {
                if (this._currentSectionIndex >= 0
                    && this._currentSectionIndex < this.sections.length) {
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
        }(BufferReader));
        io.ArrayReader = ArrayReader;
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
        function getFileBufferReader(file, onsuccess, onfailure) {
            var reader = new FileReader();
            reader.onerror = onfailure;
            reader.onloadend = function () {
                if (reader.readyState != 2) {
                    onfailure(reader.error);
                    return;
                }
                var result;
                try {
                    var resultArrayBuffer;
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
                try {
                    var response = request.response;
                    if (response) {
                        var resultDataView = new DataView(response);
                        result = new BufferReader(resultDataView);
                    }
                    else {
                        var responseBody = new VBArray(request.responseBody).toArray();
                        var result = new BufferReader(responseBody);
                    }
                }
                catch (error) {
                    onfailure(error);
                    return;
                }
                onsuccess(result);
            }
            ;
            request.onerror = onfailure;
            request.onloadend = function () { return requestLoadComplete; };
            request.onreadystatechange = function () {
                if (request.readyState == 4) {
                    requestLoadComplete();
                }
            };
            request.send();
        }
        io.getUrlBufferReader = getUrlBufferReader;
    })(io = pe.io || (pe.io = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var AppDomain = /** @class */ (function () {
            function AppDomain() {
                this.assemblies = [];
                this.mscorlib = new managed.Assembly();
                this.unresolvedAssemblies = [];
                this.mscorlib.name = "mscorlib";
                var objectType = new managed.Type(null, this.mscorlib, "System", "Object");
                var valueType = new managed.Type(objectType, this.mscorlib, "System", "ValueType");
                var enumType = new managed.Type(valueType, this.mscorlib, "System", "Enum");
                this.mscorlib.types.push(new managed.Type(valueType, this.mscorlib, "System", "Void"), new managed.Type(valueType, this.mscorlib, "System", "Boolean"), new managed.Type(valueType, this.mscorlib, "System", "Char"), new managed.Type(valueType, this.mscorlib, "System", "SByte"), new managed.Type(valueType, this.mscorlib, "System", "Byte"), new managed.Type(valueType, this.mscorlib, "System", "Int16"), new managed.Type(valueType, this.mscorlib, "System", "UInt16"), new managed.Type(valueType, this.mscorlib, "System", "Int32"), new managed.Type(valueType, this.mscorlib, "System", "UInt32"), new managed.Type(valueType, this.mscorlib, "System", "Int64"), new managed.Type(valueType, this.mscorlib, "System", "UInt64"), new managed.Type(valueType, this.mscorlib, "System", "Single"), new managed.Type(valueType, this.mscorlib, "System", "Double"), new managed.Type(valueType, this.mscorlib, "System", "String"), new managed.Type(objectType, this.mscorlib, "System", "TypedReference"), new managed.Type(valueType, this.mscorlib, "System", "IntPtr"), new managed.Type(valueType, this.mscorlib, "System", "UIntPtr"), objectType, valueType, enumType, new managed.Type(objectType, this.mscorlib, "System", "Type"));
                this.assemblies.push(this.mscorlib);
            }
            AppDomain.prototype.read = function (reader, async) {
                var context = new AssemblyReading(this, reader, async);
                var result = context.read();
                if (result) {
                    /*
                    this.assemblies.push(result);
                    for (var i = 0; i < context..length; i++) {
                      this.unresolvedAssemblies.push(context.unresolvedAssemblies[i]);
                    }*/
                }
                return result;
            };
            AppDomain.prototype.resolveAssembly = function (name, version, publicKeyToken, culture) {
                var asm;
                for (var i = 0; i < this.assemblies.length; i++) {
                    var asm = this.assemblies[i];
                    if ((asm.name && name && asm.name.toLowerCase() === name.toLowerCase())
                        || (!asm.name && !name)) {
                        // TODO: deal with public key signature
                        if (asm.isSpeculative) {
                            if (version)
                                asm.version = version;
                            if (publicKeyToken)
                                asm.publicKeyToken = publicKeyToken;
                            if (culture)
                                asm.culture = culture;
                        }
                        return asm;
                    }
                }
                // Short-cirquit mscorlib, because we create a speculative one at init time
                if (name && name.toLowerCase() === "mscorlib"
                    && this.assemblies[0].isSpeculative)
                    return this.assemblies[0];
                asm = new managed.Assembly();
                asm.name = name;
                asm.version = version;
                asm.publicKeyToken = publicKeyToken;
                asm.culture = culture;
                return asm;
            };
            return AppDomain;
        }());
        managed.AppDomain = AppDomain;
        var AssemblyReading = /** @class */ (function () {
            function AssemblyReading(appDomain, _reader, _async) {
                this.appDomain = appDomain;
                this._reader = _reader;
                this._async = _async;
                this.fileHeaders = null;
                this.clrDirectory = null;
                this.clrMetadata = null;
                this.metadataStreams = null;
                this.tableStream = null;
                this._stage = 0;
            }
            AssemblyReading.prototype.read = function () {
                var stageCount = 0;
                switch (this._stage) {
                    case 0:
                        this._reader.offset = 0;
                        this.readFileHeaders();
                        if (this._progressContinueLater())
                            return;
                    case 1:
                        this.readClrDirectory();
                        if (this._progressContinueLater())
                            return;
                    case 2:
                        this.readClrMetadata();
                        if (this._progressContinueLater())
                            return;
                    case 3:
                        this.readMetadataStreams();
                        if (this._progressContinueLater())
                            return;
                    case 4:
                        this.readTableStream();
                        if (this._progressContinueLater())
                            return;
                    case 5:
                        this.populateStrings(this.tableStream.stringIndices);
                        if (this._progressContinueLater())
                            return;
                    case 6:
                        var mscorlib = this._getMscorlibIfThisShouldBeOne();
                        if (mscorlib)
                            this.tableStream.tables[managed.metadata.TableKind.Assembly][0].def = mscorlib;
                        if (this._progressContinueLater())
                            return;
                    case 7:
                        this.completeTables();
                        if (this._progressContinueLater())
                            return;
                    case 8:
                        var result = this._createAssemblyFromTables();
                        result.fileHeaders = this.fileHeaders;
                        if (this._async)
                            this._async(null, result);
                        else
                            return result;
                }
            };
            AssemblyReading.prototype._progressContinueLater = function () {
                var _this = this;
                this._stage++;
                if (this._async && this._async.progress) {
                    var continueLater = this._async.progress(this._stage, 9);
                    if (continueLater) {
                        continueLater(function () { return _this.read(); });
                        return true;
                    }
                }
                return false;
            };
            AssemblyReading.prototype._createAssemblyFromTables = function () {
                var assemblyTable = this.tableStream.tables[managed.metadata.TableKind.Assembly];
                var assemblyRow = assemblyTable[0];
                var assembly = assemblyRow.def;
                var typeDefTable = this.tableStream.tables[managed.metadata.TableKind.TypeDef];
                if (typeDefTable)
                    assembly.types = typeDefTable.map(function (t) { return t.def; });
                assembly.runtimeVersion = this.clrDirectory.runtimeVersion;
                assembly.imageFlags = this.clrDirectory.imageFlags;
                assembly.specificRuntimeVersion = this.clrMetadata.runtimeVersion;
                assembly.metadataVersion = this.clrMetadata.metadataVersion;
                assembly.tableStreamVersion = this.tableStream.version;
                var moduleTable = this.tableStream.tables[managed.metadata.TableKind.Module];
                if (moduleTable && moduleTable.length) {
                    var moduleRow = moduleTable[0];
                    //moduleRow.
                }
                return assembly;
            };
            AssemblyReading.prototype._getMscorlibIfThisShouldBeOne = function () {
                var stringIndices = this.tableStream.stringIndices;
                var assemblyTable = this.tableStream.tables[0x20]; // Assembly
                if (!assemblyTable || !assemblyTable.length)
                    return null;
                var assemblyRow = assemblyTable[0];
                var simpleAssemblyName = stringIndices[assemblyRow.name];
                if (!simpleAssemblyName
                    || simpleAssemblyName.toLowerCase() !== "mscorlib")
                    return null;
                if (!this.appDomain.assemblies[0].isSpeculative)
                    return null; // mscorlib is already populated, no more guessing
                var typeDefTable = this.tableStream.tables[0x02]; // 0x02
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
                var saveOffset = this._reader.offset;
                this._reader.setVirtualOffset(this.metadataStreams.blobs.address);
                this._reader.setVirtualOffset(this.metadataStreams.blobs.address + blobIndex);
                var length = this._readBlobSize();
                var result = "";
                for (var i = 0; i < length; i++) {
                    var hex = this._reader.readByte().toString(16);
                    if (hex.length == 1)
                        result += "0";
                    result += hex;
                }
                this._reader.offset = saveOffset;
                return result.toUpperCase();
            };
            AssemblyReading.prototype._readBlobBytes = function (blobIndex) {
                var saveOffset = this._reader.offset;
                this._reader.setVirtualOffset(this.metadataStreams.blobs.address);
                this._reader.setVirtualOffset(this.metadataStreams.blobs.address + blobIndex);
                var length = this._readBlobSize();
                var result = [];
                for (var i = 0; i < length; i++) {
                    var b = this._reader.readByte();
                    result.push(b);
                }
                this._reader.offset = saveOffset;
                return result;
            };
            AssemblyReading.prototype._readBlobSize = function () {
                var length;
                var b0 = this._reader.readByte();
                if (b0 < 0x80) {
                    length = b0;
                }
                else {
                    var b1 = this._reader.readByte();
                    if ((b0 & 0xC0) == 0x80) {
                        length = ((b0 & 0x3F) << 8) + b1;
                    }
                    else {
                        var b2 = this._reader.readByte();
                        var b3 = this._reader.readByte();
                        length = ((b0 & 0x3F) << 24) + (b1 << 16) + (b2 << 8) + b3;
                    }
                }
                return length;
            };
            AssemblyReading.prototype.readFileHeaders = function () {
                this.fileHeaders = new pe.headers.PEFileHeaders();
                this.fileHeaders.read(this._reader);
                this._reader.sections = this.fileHeaders.sectionHeaders;
            };
            AssemblyReading.prototype.readClrDirectory = function () {
                var clrDataDirectory = this.fileHeaders.optionalHeader.dataDirectories[pe.headers.DataDirectoryKind.Clr];
                this._reader.setVirtualOffset(clrDataDirectory.address);
                this.clrDirectory = new managed.metadata.ClrDirectory();
                this.clrDirectory.read(this._reader);
            };
            AssemblyReading.prototype.readClrMetadata = function () {
                this._reader.setVirtualOffset(this.clrDirectory.metadataDir.address);
                this.clrMetadata = new managed.metadata.ClrMetadata();
                this.clrMetadata.read(this._reader);
            };
            AssemblyReading.prototype.readMetadataStreams = function () {
                this.metadataStreams = new managed.metadata.MetadataStreams();
                this.metadataStreams.read(this.clrDirectory.metadataDir.address, this.clrMetadata.streamCount, this._reader);
            };
            AssemblyReading.prototype.readTableStream = function () {
                this.tableStream = new managed.metadata.TableStream();
                this.tableStream.read(this._reader, this.metadataStreams.strings.size, this.metadataStreams.guids.length, this.metadataStreams.blobs.size);
            };
            AssemblyReading.prototype.populateStrings = function (stringIndices) {
                var saveOffset = this._reader.offset;
                stringIndices[0] = null;
                for (var i in stringIndices) {
                    if (i > 0) {
                        var iNum = Number(i);
                        this._reader.setVirtualOffset(this.metadataStreams.strings.address + iNum);
                        stringIndices[iNum] = this._reader.readUtf8Z(1024 * 1024 * 1024);
                    }
                }
            };
            AssemblyReading.prototype.completeTables = function () {
                var _this = this;
                var completionReader = new managed.metadata.TableCompletionReader(this.appDomain, this.tableStream, this.metadataStreams, this.tableStream.codedIndexReaders, function (blobIndex) { return _this._readBlobBytes(blobIndex); });
                for (var iTab = 0; iTab < this.tableStream.tables.length; iTab++) {
                    var table = this.tableStream.tables[iTab];
                    if (!table || !table.length || !table[0].precomplete)
                        continue;
                    for (var i = 0; i < table.length; i++) {
                        var row = table[i];
                        var nextRow = i + 1 < table.length ? table[i + 1] : null;
                        row.precomplete(completionReader, nextRow);
                    }
                }
                for (var iTab = 0; iTab < this.tableStream.tables.length; iTab++) {
                    var table = this.tableStream.tables[iTab];
                    if (!table || !table.length || !table[0].complete)
                        continue;
                    for (var i = 0; i < table.length; i++) {
                        var row = table[i];
                        var nextRow = i + 1 < table.length ? table[i + 1] : null;
                        row.complete(completionReader, nextRow);
                    }
                }
            };
            return AssemblyReading;
        }());
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var Assembly = /** @class */ (function () {
            function Assembly() {
                this.isSpeculative = true;
                this.fileHeaders = new pe.headers.PEFileHeaders();
                this.name = "";
                this.version = null;
                this.publicKey = null;
                this.publicKeyToken = null;
                this.culture = null;
                this.attributes = 0;
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
                return this.name + ", Version=" + this.version + ", Culture=" + (this.culture ? this.culture : "neutral") + ", PublicKeyToken=" + (this.publicKeyToken && this.publicKeyToken.length ? this.publicKeyToken : "null");
            };
            return Assembly;
        }());
        managed.Assembly = Assembly;
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var EventInfo = /** @class */ (function () {
            function EventInfo() {
                this.owner = null;
                this.name = null;
                this.eventType = null;
            }
            EventInfo.prototype.toString = function () {
                return (this.eventType ? this.name : this.name + ':' + this.eventType) + ' { add; remove }';
            };
            return EventInfo;
        }());
        managed.EventInfo = EventInfo;
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var FieldInfo = /** @class */ (function () {
            function FieldInfo() {
                this.attributes = 0;
                this.name = "";
                this.fieldType = null;
                this.fieldOffset = null;
                this.customAttributes = null;
            }
            FieldInfo.prototype.toString = function () {
                return this.fieldType ? this.name : this.name + ':' + this.fieldType;
            };
            return FieldInfo;
        }());
        managed.FieldInfo = FieldInfo;
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var MethodInfo = /** @class */ (function () {
            function MethodInfo() {
                this.owner = null;
                this.name = '';
                this.attributes = 0;
                this.parameters = [];
                this.customAttributes = null;
            }
            MethodInfo.prototype.toString = function () {
                return this.name + '(' + this.parameters.join(', ') + ')';
            };
            return MethodInfo;
        }());
        managed.MethodInfo = MethodInfo;
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var ParameterInfo = /** @class */ (function () {
            function ParameterInfo() {
                this.owner = null;
                this.name = null;
                this.attributes = 0;
                this.customAttributes = null;
                this.parameterType = null;
            }
            ParameterInfo.prototype.toString = function () {
                return this.name;
            };
            return ParameterInfo;
        }());
        managed.ParameterInfo = ParameterInfo;
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var PropertyInfo = /** @class */ (function () {
            function PropertyInfo() {
                this.owner = null;
                this.name = null;
                this.propertyType = null;
                this.attributes = 0;
                this.customAttributes = null;
            }
            return PropertyInfo;
        }());
        managed.PropertyInfo = PropertyInfo;
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var Type = /** @class */ (function () {
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
                this.genericPrototype = null;
                this.genericArguments = [];
                this.interfaces = [];
                this.netedTypes = [];
                this.nestingParent = null;
                this.layout = null;
                this.customAttributes = null;
            }
            Type.prototype.getBaseType = function () { return this.baseType; };
            Type.prototype.getAssembly = function () { return this.assembly; };
            Type.prototype.getFullName = function () {
                if (this.namespace && this.namespace.length)
                    return this.namespace + "." + this.name;
                else
                    return this.name;
            };
            Type.prototype.toString = function () {
                if (this.genericArguments.length) {
                    var fullName = this.getFullName();
                    var qpos = fullName.indexOf('`');
                    if (qpos >= 0)
                        fullName = fullName.substring(0, qpos);
                    fullName += '<' + this.genericArguments.join(',') + '>';
                    return fullName;
                }
                else {
                    return this.getFullName();
                }
            };
            return Type;
        }());
        managed.Type = Type;
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            var ClrDirectory = /** @class */ (function () {
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
                        throw new Error("Unexpectedly short CLR header structure " + this.cb + " reported by Cb field " +
                            "(expected at least " + ClrDirectory._clrHeaderSize + ").");
                    this.runtimeVersion = clrDirReader.readShort() + "." + clrDirReader.readShort();
                    this.metadataDir = new pe.headers.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                    this.imageFlags = clrDirReader.readInt();
                    // need to convert to meaningful value before sticking into ModuleDefinition
                    this.entryPointToken = clrDirReader.readInt();
                    this.resourcesDir = new pe.headers.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                    this.strongNameSignatureDir = new pe.headers.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                    this.codeManagerTableDir = new pe.headers.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                    this.vtableFixupsDir = new pe.headers.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                    this.exportAddressTableJumpsDir = new pe.headers.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                    this.managedNativeHeaderDir = new pe.headers.AddressRange(clrDirReader.readInt(), clrDirReader.readInt());
                };
                ClrDirectory._clrHeaderSize = 72;
                return ClrDirectory;
            }());
            metadata.ClrDirectory = ClrDirectory;
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            var ClrMetadata = /** @class */ (function () {
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
            }());
            metadata.ClrMetadata = ClrMetadata;
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            var CodedIndexReader = /** @class */ (function () {
                function CodedIndexReader(tables, tableKinds) {
                    this.tables = tables;
                    this.tableKinds = tableKinds;
                    this.tableKindBitCount = metadata.calcRequredBitCount(tableKinds.length - 1);
                    var maxTableLength = 0;
                    for (var i = 0; i < tableKinds.length; i++) {
                        var t = tables[tableKinds[i]];
                        var tableLength = t ? t.length : 0;
                        if (tableLength > maxTableLength)
                            maxTableLength = tableLength;
                    }
                    this.rowIndexBitCount = metadata.calcRequredBitCount(maxTableLength);
                    this.isShortForm = this.tableKindBitCount + this.rowIndexBitCount <= 16;
                }
                CodedIndexReader.prototype.readCodedIndex = function (reader) {
                    return this.isShortForm ? reader.readShort() : reader.readInt();
                };
                CodedIndexReader.prototype.lookup = function (codedIndex) {
                    var rowIndex = codedIndex >> this.tableKindBitCount;
                    if (rowIndex === 0)
                        return null;
                    var tableKindIndex = codedIndex - (rowIndex << this.tableKindBitCount);
                    var tableKind = this.tableKinds[tableKindIndex];
                    var table = this.tables[tableKind];
                    if (!table)
                        return null; // TODO: why?
                    var row = table[rowIndex - 1];
                    if (!row)
                        return null; // TODO: why??
                    var result = row.def;
                    return result;
                };
                return CodedIndexReader;
            }());
            metadata.CodedIndexReader = CodedIndexReader;
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            var CodedIndexReaders = /** @class */ (function () {
                function CodedIndexReaders(_tables) {
                    this._tables = _tables;
                    this.resolutionScope = new metadata.CodedIndexReader(this._tables, [
                        metadata.TableKind.Module,
                        metadata.TableKind.ModuleRef,
                        metadata.TableKind.AssemblyRef,
                        metadata.TableKind.TypeRef
                    ]);
                    this.typeDefOrRef = new metadata.CodedIndexReader(this._tables, [
                        metadata.TableKind.TypeDef,
                        metadata.TableKind.TypeRef,
                        metadata.TableKind.TypeSpec
                    ]);
                    this.hasConstant = new metadata.CodedIndexReader(this._tables, [
                        metadata.TableKind.Field,
                        metadata.TableKind.Param,
                        metadata.TableKind.Property
                    ]);
                    this.hasCustomAttribute = new metadata.CodedIndexReader(this._tables, [
                        metadata.TableKind.MethodDef,
                        metadata.TableKind.Field,
                        metadata.TableKind.TypeRef,
                        metadata.TableKind.TypeDef,
                        metadata.TableKind.Param,
                        metadata.TableKind.InterfaceImpl,
                        metadata.TableKind.MemberRef,
                        metadata.TableKind.Module,
                        0xFF,
                        metadata.TableKind.Property,
                        metadata.TableKind.Event,
                        metadata.TableKind.StandAloneSig,
                        metadata.TableKind.ModuleRef,
                        metadata.TableKind.TypeSpec,
                        metadata.TableKind.Assembly,
                        metadata.TableKind.AssemblyRef,
                        metadata.TableKind.File,
                        metadata.TableKind.ExportedType,
                        metadata.TableKind.ManifestResource,
                        metadata.TableKind.GenericParam,
                        metadata.TableKind.GenericParamConstraint,
                        metadata.TableKind.MethodSpec
                    ]);
                    this.customAttributeType = new metadata.CodedIndexReader(this._tables, [
                        0xFF,
                        0xFF,
                        metadata.TableKind.MethodDef,
                        metadata.TableKind.MemberRef,
                        0xFF
                    ]);
                    this.hasDeclSecurity = new metadata.CodedIndexReader(this._tables, [
                        metadata.TableKind.TypeDef,
                        metadata.TableKind.MethodDef,
                        metadata.TableKind.Assembly
                    ]);
                    this.implementation = new metadata.CodedIndexReader(this._tables, [
                        metadata.TableKind.File,
                        metadata.TableKind.AssemblyRef,
                        metadata.TableKind.ExportedType
                    ]);
                    this.hasFieldMarshal = new metadata.CodedIndexReader(this._tables, [
                        metadata.TableKind.Field,
                        metadata.TableKind.Param
                    ]);
                    this.typeOrMethodDef = new metadata.CodedIndexReader(this._tables, [
                        metadata.TableKind.TypeDef,
                        metadata.TableKind.MethodDef
                    ]);
                    this.memberForwarded = new metadata.CodedIndexReader(this._tables, [
                        metadata.TableKind.Field,
                        metadata.TableKind.MethodDef
                    ]);
                    this.memberRefParent = new metadata.CodedIndexReader(this._tables, [
                        metadata.TableKind.TypeDef,
                        metadata.TableKind.TypeRef,
                        metadata.TableKind.ModuleRef,
                        metadata.TableKind.MethodDef,
                        metadata.TableKind.TypeSpec
                    ]);
                    this.methodDefOrRef = new metadata.CodedIndexReader(this._tables, [
                        metadata.TableKind.MethodDef,
                        metadata.TableKind.MemberRef
                    ]);
                    this.hasSemantics = new metadata.CodedIndexReader(this._tables, [
                        metadata.TableKind.Event,
                        metadata.TableKind.Property
                    ]);
                }
                return CodedIndexReaders;
            }());
            metadata.CodedIndexReaders = CodedIndexReaders;
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            var MetadataStreams = /** @class */ (function () {
                function MetadataStreams() {
                    this.guids = [];
                    this.strings = null;
                    this.blobs = null;
                    this.tables = null;
                }
                MetadataStreams.prototype.read = function (metadataBaseAddress, streamCount, reader) {
                    var guidRange;
                    for (var i = 0; i < streamCount; i++) {
                        var range = new pe.headers.AddressRange(reader.readInt(), reader.readInt());
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
                        guid +=
                            "00000000".substring(0, 8 - hex.length) + hex;
                    }
                    guid += "}";
                    return guid;
                };
                return MetadataStreams;
            }());
            metadata.MetadataStreams = MetadataStreams;
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            /** ECMA-335 II.23.2 */
            var SignatureReader = /** @class */ (function () {
                function SignatureReader(_tables) {
                    this._tables = _tables;
                }
                /** ECMA-335 II.23.2.1 */
                SignatureReader.prototype.readMethodDefSig = function (reader, def) {
                    var callingConvention = reader.readByte();
                    var genParamCount = 0;
                    if (callingConvention & SignatureReader.CallingConvention.Generic)
                        genParamCount = this._readCompressed(reader);
                    var paramCount = this._readCompressed(reader);
                    var returnType = this.readRefType(reader);
                    var params = [];
                    for (var i = 0; i < paramCount; i++) {
                        var p = this.readParam(reader);
                        params.push(p);
                    }
                };
                /** ECMA-335 II.23.2.2 */
                SignatureReader.prototype.readMethodRefSig = function (reader) {
                    var callingConvention = reader.readByte();
                    var genParamCount = 0;
                    if (callingConvention & SignatureReader.CallingConvention.Generic)
                        genParamCount = this._readCompressed(reader);
                    var paramCount = this._readCompressed(reader);
                    var returnType = this.readRefType(reader);
                    var params = [];
                    var varargs = [];
                    for (var i = 0; i < paramCount; i++) {
                        var isvarargs = varargs.length > 0;
                        if (!isvarargs) {
                            var expectSentinel = reader.peekByte();
                            if (expectSentinel === SignatureReader.CallingConvention.Sentinel) {
                                reader.readByte();
                                isvarargs = true;
                            }
                        }
                        var p = this.readParam(reader);
                        if (isvarargs)
                            varargs.push(p);
                        else
                            params.push(p);
                    }
                };
                /** ECMA-335 II.23.2.3 */
                SignatureReader.prototype.readStandAloneMethodSig = function (reader, def) {
                    var callingConvention = reader.readByte();
                    var paramCount = this._readCompressed(reader);
                    var returnType = this.readRefType(reader);
                    var params = [];
                    var varargs = [];
                    for (var i = 0; i < paramCount; i++) {
                        var isvarargs = varargs.length > 0;
                        if (!isvarargs) {
                            var expectSentinel = reader.peekByte();
                            if (expectSentinel === SignatureReader.CallingConvention.Sentinel) {
                                reader.readByte();
                                isvarargs = true;
                            }
                        }
                        var p = this.readParam(reader);
                        if (isvarargs)
                            varargs.push(p);
                        else
                            params.push(p);
                    }
                };
                /** ECMA-335 II.23.2.4 */
                SignatureReader.prototype.readFieldSig = function (reader, def) {
                    var callingConvention = reader.readByte();
                    if (callingConvention !== SignatureReader.CallingConvention.Field)
                        throw new Error('Expected CallingConvention.Field, encountered ' + pe.formatEnum(callingConvention, SignatureReader.CallingConvention) + '.');
                    var customMod = this.readCustomMod(reader);
                    var type = this.readType(reader);
                    def.fieldType = type;
                };
                /** ECMA-335 II.23.2.5 */
                SignatureReader.prototype.readPropertySig = function (reader, def) {
                    var callingConvention = reader.readByte();
                    if (callingConvention !== SignatureReader.CallingConvention.Property)
                        throw new Error('Expected CallingConvention.Property, encountered ' + pe.formatEnum(callingConvention, SignatureReader.CallingConvention) + '.');
                    var paramCount = this._readCompressed(reader);
                    while (true) {
                        var customMod = this.readCustomMod(reader);
                        if (customMod) { /*def.customMod... */ }
                        else
                            break;
                    }
                    var type = this.readType(reader);
                    var params = [];
                    for (var i = 0; i < paramCount; i++) {
                        var p = this.readParam(reader);
                        params.push(p);
                    }
                    def.propertyType = type;
                    // TODO: def. parameters...
                };
                /** ECMA-335 II.23.2.5 */
                SignatureReader.prototype.readLocalVarSig = function (reader) {
                    var callingConvention = reader.readByte();
                    if (callingConvention !== SignatureReader.CallingConvention.Local)
                        throw new Error('Expected CallingConvention.Local, encountered ' + pe.formatEnum(callingConvention, SignatureReader.CallingConvention) + '.');
                    var count = this._readCompressed(reader);
                    var locals = [];
                    for (var i = 0; i < count; i++) {
                        var peekNext = reader.peekByte();
                        if (peekNext === metadata.ElementType.TypedByRef) {
                            reader.readByte();
                            var typedByRef = null; // fetch well-known type for TypedReference
                            locals.push();
                        }
                        var customMods = [];
                        var constraints = [];
                        while (true) {
                            var customMod = this.readCustomMod(reader);
                            if (customMod) {
                                customMods.push(customMod);
                                var eitherFound = true;
                            }
                            var constraint = this.readConstraint(reader);
                            if (constraint) {
                                constraints.push(constraint);
                                eitherFound = true;
                            }
                            if (eitherFound)
                                break;
                        }
                        var isByRef = false;
                        peekNext = reader.peekByte();
                        if (peekNext === metadata.ElementType.ByRef) {
                            isByRef = true;
                            reader.readByte();
                        }
                        var type = this.readType(reader);
                    }
                };
                SignatureReader.prototype.readRefType = function (reader) {
                    return null;
                };
                SignatureReader.prototype.readConstraint = function (reader) {
                };
                SignatureReader.prototype.readParam = function (reader) {
                };
                SignatureReader.prototype.readCustomMod = function (reader) {
                };
                SignatureReader.prototype.readType = function (reader) {
                    return null;
                };
                SignatureReader.prototype._readCompressed = function (reader) {
                    var b0 = reader.readByte();
                    if (!(b0 & 0x80))
                        return b0;
                    var b1 = reader.readByte();
                    if (!(b0 & 0x40))
                        return ((b0 & 0x7F) << 8) | b1;
                    var b2 = reader.readByte();
                    var b3 = reader.readByte();
                    return ((b0 & 0x3F) << 24) |
                        (b1 << 16) |
                        (b2 << 8) |
                        b3;
                };
                SignatureReader.prototype._readCompressedSigned = function (reader) {
                    // TODO: implement it correctly (ECMA-335 p.257)
                    return this._readCompressed(reader);
                };
                return SignatureReader;
            }());
            metadata.SignatureReader = SignatureReader;
            (function (SignatureReader) {
                /** ECMA-335 II.23.2.3 */
                var CallingConvention;
                (function (CallingConvention) {
                    CallingConvention[CallingConvention["Default"] = 0] = "Default";
                    /** This is a vararg signature too! */
                    CallingConvention[CallingConvention["C"] = 1] = "C";
                    CallingConvention[CallingConvention["StdCall"] = 2] = "StdCall";
                    CallingConvention[CallingConvention["ThisCall"] = 3] = "ThisCall";
                    CallingConvention[CallingConvention["FastCall"] = 4] = "FastCall";
                    CallingConvention[CallingConvention["VarArg"] = 5] = "VarArg";
                    CallingConvention[CallingConvention["Field"] = 6] = "Field";
                    CallingConvention[CallingConvention["Property"] = 8] = "Property";
                    CallingConvention[CallingConvention["Local"] = 7] = "Local";
                    CallingConvention[CallingConvention["Generic"] = 16] = "Generic";
                    CallingConvention[CallingConvention["HasThis"] = 32] = "HasThis";
                    CallingConvention[CallingConvention["ExplicitThis"] = 64] = "ExplicitThis";
                    /** ECMA-335 II.23.1.16 and II.15.3 */
                    CallingConvention[CallingConvention["Sentinel"] = 65] = "Sentinel";
                })(CallingConvention = SignatureReader.CallingConvention || (SignatureReader.CallingConvention = {}));
            })(SignatureReader = metadata.SignatureReader || (metadata.SignatureReader = {}));
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            var TableCompletionReader = /** @class */ (function () {
                function TableCompletionReader(_appDomain, _tableStream, _metadataStreams, _codedIndexReaders, readPublicKey) {
                    this._appDomain = _appDomain;
                    this._tableStream = _tableStream;
                    this._metadataStreams = _metadataStreams;
                    this._codedIndexReaders = _codedIndexReaders;
                    this.readPublicKey = readPublicKey;
                }
                TableCompletionReader.prototype.readString = function (index) {
                    return this._tableStream.stringIndices[index];
                };
                TableCompletionReader.prototype.readGuid = function (index) {
                    return this._metadataStreams.guids[index];
                };
                TableCompletionReader.prototype.copyFieldRange = function (fields, start, end, owner) {
                    this._copyDefRange(fields, metadata.TableKind.Field, start, end, owner);
                };
                TableCompletionReader.prototype.copyMethodRange = function (methods, start, end, owner) {
                    this._copyDefRange(methods, metadata.TableKind.MethodDef, start, end, owner);
                };
                TableCompletionReader.prototype.copyParamRange = function (parameters, start, end, owner) {
                    this._copyDefRange(parameters, metadata.TableKind.Param, start, end, owner);
                };
                TableCompletionReader.prototype._copyDefRange = function (defs, tableKind, start, end, owner) {
                    var table = this._tableStream.tables[tableKind];
                    if (!end && typeof end === "undefined")
                        end = table.length + 1;
                    var setOwner = typeof owner !== 'undefined';
                    for (var i = start - 1; i < end - 1; i++) {
                        var row = table[i];
                        if (setOwner)
                            row.def.owner = owner;
                        defs.push(row.def);
                    }
                };
                TableCompletionReader.prototype.lookupTable = function (tableKind, tableIndex) {
                    if (tableIndex == 0)
                        return null;
                    var table = this._tableStream.tables[tableKind];
                    if (!table)
                        return null;
                    else
                        return table[tableIndex - 1];
                };
                TableCompletionReader.prototype.lookupResolutionScope = function (codedIndex) { return this._codedIndexReaders.resolutionScope.lookup(codedIndex); };
                TableCompletionReader.prototype.lookupTypeDefOrRef = function (codedIndex) { return this._codedIndexReaders.typeDefOrRef.lookup(codedIndex); };
                TableCompletionReader.prototype.lookupHasConstant = function (codedIndex) { return this._codedIndexReaders.hasConstant.lookup(codedIndex); };
                TableCompletionReader.prototype.lookupHasCustomAttribute = function (codedIndex) { return this._codedIndexReaders.hasCustomAttribute.lookup(codedIndex); };
                TableCompletionReader.prototype.lookupCustomAttributeType = function (codedIndex) { return this._codedIndexReaders.customAttributeType.lookup(codedIndex); };
                TableCompletionReader.prototype.lookupHasDeclSecurity = function (codedIndex) { return this._codedIndexReaders.hasDeclSecurity.lookup(codedIndex); };
                TableCompletionReader.prototype.lookupImplementation = function (codedIndex) { return this._codedIndexReaders.implementation.lookup(codedIndex); };
                TableCompletionReader.prototype.lookupHasFieldMarshal = function (codedIndex) { return this._codedIndexReaders.hasFieldMarshal.lookup(codedIndex); };
                TableCompletionReader.prototype.lookupTypeOrMethodDef = function (codedIndex) { return this._codedIndexReaders.typeOrMethodDef.lookup(codedIndex); };
                TableCompletionReader.prototype.lookupMemberForwarded = function (codedIndex) { return this._codedIndexReaders.memberForwarded.lookup(codedIndex); };
                TableCompletionReader.prototype.lookupMemberRefParent = function (codedIndex) { return this._codedIndexReaders.memberRefParent.lookup(codedIndex); };
                TableCompletionReader.prototype.lookupMethodDefOrRef = function (codedIndex) { return this._codedIndexReaders.methodDefOrRef.lookup(codedIndex); };
                TableCompletionReader.prototype.lookupHasSemantics = function (codedIndex) { return this._codedIndexReaders.hasSemantics.lookup(codedIndex); };
                TableCompletionReader.prototype.resolveAssemblyRef = function (name, version, publicKeyOrToken, culture) {
                    return this._appDomain.resolveAssembly(name, version, publicKeyOrToken, culture);
                };
                TableCompletionReader.prototype.resolveTypeRef = function (scope, namespace, name) {
                    if (!(scope instanceof managed.Assembly)) { // no multimodule assembly handling yet
                        var type = new managed.Type();
                        type.namespace = namespace;
                        type.name = name;
                        return type;
                    }
                    var asm = scope;
                    for (var i = 0; asm.types.length; i++) {
                        var t = asm.types[i];
                        if (t.name === name && t.namespace === namespace)
                            return t;
                    }
                    var type = new managed.Type();
                    type.namespace = namespace;
                    type.name = name;
                    if (asm.isSpeculative) { // if actual assembly has no such type, don't inject
                        asm.types.push(type);
                    }
                    return type;
                };
                TableCompletionReader.prototype.readFieldSignature = function (field, blobIndex) {
                };
                return TableCompletionReader;
            }());
            metadata.TableCompletionReader = TableCompletionReader;
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            var TableKind;
            (function (TableKind) {
                // The rows in the Module table result from .module directives in the Assembly.
                TableKind[TableKind["Module"] = 0] = "Module";
                // Contains ResolutionScope, TypeName and TypeNamespace columns.
                TableKind[TableKind["TypeRef"] = 1] = "TypeRef";
                // The first row of the TypeDef table represents the pseudo class that acts as parent for functions and variables 
                // defined at module scope.
                // If a type is generic, its parameters are defined in the GenericParam table (para22.20). Entries in the 
                // GenericParam table reference entries in the TypeDef table; there is no reference from the TypeDef table to the 
                // GenericParam table.
                TableKind[TableKind["TypeDef"] = 2] = "TypeDef";
                // Each row in the Field table results from a top-level .field directive, or a .field directive inside a 
                // Type. 
                TableKind[TableKind["Field"] = 4] = "Field";
                // Conceptually, every row in the MethodDef table is owned by one, and only one, row in the TypeDef table.
                // The rows in the MethodDef table result from .method directives (para15). The RVA column is computed when 
                // the image for the PE file is emitted and points to the COR_ILMETHOD structure for the body of the method.
                TableKind[TableKind["MethodDef"] = 6] = "MethodDef";
                // Conceptually, every row in the Param table is owned by one, and only one, row in the MethodDef table.
                // The rows in the Param table result from the parameters in a method declaration (para15.4), or from a .param
                // attribute attached to a method.
                TableKind[TableKind["Param"] = 8] = "Param";
                // Combines two sorts of references, to Methods and to Fields of a class, known as 'MethodRef' and 'FieldRef', respectively.
                // An entry is made into the MemberRef table whenever a reference is made in the CIL code to a method or field 
                // which is defined in another module or assembly.  (Also, an entry is made for a call to a method with a VARARG
                // signature, even when it is defined in the same module as the call site.) 
                TableKind[TableKind["MemberRef"] = 10] = "MemberRef";
                // Used to store compile-time, constant values for fields, parameters, and properties.
                TableKind[TableKind["Constant"] = 11] = "Constant";
                // Stores data that can be used to instantiate a Custom Attribute (more precisely, an 
                // object of the specified Custom Attribute class) at runtime.
                // A row in the CustomAttribute table for a parent is created by the .custom attribute, which gives the value of 
                // the Type column and optionally that of the Value column.
                TableKind[TableKind["CustomAttribute"] = 12] = "CustomAttribute";
                // The FieldMarshal table  'links' an existing row in the Field or Param table, to information 
                // in the Blob heap that defines how that field or parameter (which, as usual, covers the method return, as 
                // parameter number 0) shall be marshalled when calling to or from unmanaged code via PInvoke dispatch.
                // A row in the FieldMarshal table is created if the .field directive for the parent field has specified a marshal attribute.
                TableKind[TableKind["FieldMarshal"] = 13] = "FieldMarshal";
                // The rows of the DeclSecurity table are filled by attaching a .permission or .permissionset directive 
                // that specifies the Action and PermissionSet on a parent assembly or parent type or method.
                TableKind[TableKind["DeclSecurity"] = 14] = "DeclSecurity";
                // Used to define how the fields of a class or value type shall be laid out by the CLI.
                // (Normally, the CLI is free to reorder and/or insert gaps between the fields defined for a class or value type.)
                TableKind[TableKind["ClassLayout"] = 15] = "ClassLayout";
                // Records the interfaces a type implements explicitly.  Conceptually, each row in the 
                // InterfaceImpl table indicates that Class implements Interface.
                TableKind[TableKind["InterfaceImpl"] = 9] = "InterfaceImpl";
                // A row in the FieldLayout table is created if the .field directive for the parent field has specified a field offset.
                TableKind[TableKind["FieldLayout"] = 16] = "FieldLayout";
                // Signatures are stored in the metadata Blob heap.  In most cases, they are indexed by a column in some table -
                // Field.Signature, Method.Signature, MemberRef.Signature, etc.  However, there are two cases that require a 
                // metadata token for a signature that is not indexed by any metadata table.  The StandAloneSig table fulfils this 
                // need.  It has just one column, which points to a Signature in the Blob heap.
                TableKind[TableKind["StandAloneSig"] = 17] = "StandAloneSig";
                // The EventMap and Event tables result from putting the .event directive on a class.
                TableKind[TableKind["EventMap"] = 18] = "EventMap";
                // The EventMap and Event tables result from putting the .event directive on a class.
                TableKind[TableKind["Event"] = 20] = "Event";
                // The PropertyMap and Property tables result from putting the .property directive on a class.
                TableKind[TableKind["PropertyMap"] = 21] = "PropertyMap";
                // Does a little more than group together existing rows from other tables.
                TableKind[TableKind["Property"] = 23] = "Property";
                // The rows of the MethodSemantics table are filled by .property and .event directives.
                TableKind[TableKind["MethodSemantics"] = 24] = "MethodSemantics";
                // s let a compiler override the default inheritance rules provided by the CLI. Their original use 
                // was to allow a class C, that inherited method M from both interfaces I and J, to provide implementations for 
                // both methods (rather than have only one slot for M in its vtable). However, MethodImpls can be used for other 
                // reasons too, limited only by the compiler writer's ingenuity within the constraints defined in the Validation rules.
                // ILAsm uses the .override directive to specify the rows of the MethodImpl table.
                TableKind[TableKind["MethodImpl"] = 25] = "MethodImpl";
                // The rows in the ModuleRef table result from .module extern directives in the Assembly.
                TableKind[TableKind["ModuleRef"] = 26] = "ModuleRef";
                //  Contains just one column, which indexes the specification of a Type, stored in the Blob heap.  
                //  This provides a metadata token for that Type (rather than simply an index into the Blob heap). This is required, 
                //  typically, for array operations, such as creating, or calling methods on the array class.
                //  Note that TypeSpec tokens can be used with any of the CIL instructions that take a TypeDef or TypeRef token; 
                //  specifically, castclass, cpobj, initobj, isinst, ldelema, ldobj, mkrefany, newarr, refanyval, sizeof, stobj, 
                //  box, and unbox.
                TableKind[TableKind["TypeSpec"] = 27] = "TypeSpec";
                // Holds information about unmanaged methods that can be reached from managed code, 
                // using PInvoke dispatch. 
                // A row is entered in the ImplMap table for each parent Method (para15.5) that is defined with a .pinvokeimpl
                // interoperation attribute specifying the MappingFlags, ImportName, and ImportScope.
                TableKind[TableKind["ImplMap"] = 28] = "ImplMap";
                // Conceptually, each row in the FieldRVA table is an extension to exactly one row in the Field table, and records 
                // the RVA (Relative Virtual Address) within the image file at which this field's initial value is stored.
                // A row in the FieldRVA table is created for each static parent field that has specified the optional data
                // label.  The RVA column is the relative virtual address of the data in the PE file.
                TableKind[TableKind["FieldRVA"] = 29] = "FieldRVA";
                // ECMA-335 para22.2.
                TableKind[TableKind["Assembly"] = 32] = "Assembly";
                // ECMA-335 para22.4 Shall be ignored by the CLI.
                TableKind[TableKind["AssemblyProcessor"] = 33] = "AssemblyProcessor";
                // ECMA-335 para22.3 Shall be ignored by the CLI.
                TableKind[TableKind["AssemblyOS"] = 34] = "AssemblyOS";
                // The table is defined by the .assembly extern directive (para6.3).  Its columns are filled using directives 
                // similar to those of the Assembly table except for the PublicKeyOrToken column, which is defined using the 
                // .publickeytoken directive.
                TableKind[TableKind["AssemblyRef"] = 35] = "AssemblyRef";
                // ECMA-335 para22.7 Shall be ignored by the CLI.
                TableKind[TableKind["AssemblyRefProcessor"] = 36] = "AssemblyRefProcessor";
                // ECMA-335 para22.6 Shall be ignored by the CLI.
                TableKind[TableKind["AssemblyRefOS"] = 37] = "AssemblyRefOS";
                // The rows of the File table result from .file directives in an Assembly.
                TableKind[TableKind["File"] = 38] = "File";
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
                TableKind[TableKind["ExportedType"] = 39] = "ExportedType";
                //  The rows in the table result from .mresource directives on the Assembly.
                TableKind[TableKind["ManifestResource"] = 40] = "ManifestResource";
                // NestedClass is defined as lexically 'inside' the text of its enclosing Type.
                TableKind[TableKind["NestedClass"] = 41] = "NestedClass";
                // Stores the generic parameters used in generic type definitions and generic method 
                // definitions.  These generic parameters can be constrained (i.e., generic arguments shall extend some class 
                // and/or implement certain interfaces) or unconstrained.  (Such constraints are stored in the 
                // GenericParamConstraint table.)
                // Conceptually, each row in the GenericParam table is owned by one, and only one, row in either the TypeDef or 
                // MethodDef tables.
                TableKind[TableKind["GenericParam"] = 42] = "GenericParam";
                // Records the signature of an instantiated generic method.
                // Each unique instantiation of a generic method (i.e., a combination of Method and Instantiation) shall be 
                // represented by a single row in the table.
                TableKind[TableKind["MethodSpec"] = 43] = "MethodSpec";
                // Records the constraints for each generic parameter.  Each generic parameter
                // can be constrained to derive from zero or one class.  Each generic parameter can be constrained to implement 
                // zero or more interfaces.
                // Conceptually, each row in the GenericParamConstraint table is 'owned' by a row in the GenericParam table.
                TableKind[TableKind["GenericParamConstraint"] = 44] = "GenericParamConstraint";
            })(TableKind = metadata.TableKind || (metadata.TableKind = {}));
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            var TableReader = /** @class */ (function () {
                function TableReader(_reader, _tables, stringCount, guidCount, blobCount, _codedIndexReaders) {
                    this._reader = _reader;
                    this._tables = _tables;
                    this._codedIndexReaders = _codedIndexReaders;
                    this.stringIndices = [];
                    this.readStringIndex = this._getDirectReader(stringCount);
                    this.readGuid = this._getDirectReader(guidCount);
                    this.readBlobIndex = this._getDirectReader(blobCount);
                    this.readGenericParamTableIndex = this._getTableIndexReader(metadata.TableKind.GenericParam);
                    this.readParamTableIndex = this._getTableIndexReader(metadata.TableKind.Param);
                    this.readFieldTableIndex = this._getTableIndexReader(metadata.TableKind.Field);
                    this.readMethodDefTableIndex = this._getTableIndexReader(metadata.TableKind.MethodDef);
                    this.readTypeDefTableIndex = this._getTableIndexReader(metadata.TableKind.TypeDef);
                    this.readEventTableIndex = this._getTableIndexReader(metadata.TableKind.Event);
                    this.readPropertyTableIndex = this._getTableIndexReader(metadata.TableKind.Property);
                    this.readModuleRefTableIndex = this._getTableIndexReader(metadata.TableKind.ModuleRef);
                    this.readAssemblyTableIndex = this._getTableIndexReader(metadata.TableKind.Assembly);
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
                    var tableKindBitCount = metadata.calcRequredBitCount(tables.length - 1);
                    var tableIndexBitCount = metadata.calcRequredBitCount(maxTableLength);
                    var totalBitCount = tableKindBitCount + tableIndexBitCount;
                    return totalBitCount <= 16 ?
                        this.readShort :
                        this.readInt;
                };
                TableReader.prototype.readByte = function () { return this._reader.readByte(); };
                TableReader.prototype.readShort = function () { return this._reader.readShort(); };
                TableReader.prototype.readInt = function () { return this._reader.readInt(); };
                TableReader.prototype.readResolutionScope = function () { return this._codedIndexReaders.resolutionScope.readCodedIndex(this._reader); };
                TableReader.prototype.readTypeDefOrRef = function () { return this._codedIndexReaders.typeDefOrRef.readCodedIndex(this._reader); };
                TableReader.prototype.readHasConstant = function () { return this._codedIndexReaders.hasConstant.readCodedIndex(this._reader); };
                TableReader.prototype.readHasCustomAttribute = function () { return this._codedIndexReaders.hasCustomAttribute.readCodedIndex(this._reader); };
                TableReader.prototype.readCustomAttributeType = function () { return this._codedIndexReaders.customAttributeType.readCodedIndex(this._reader); };
                TableReader.prototype.readHasDeclSecurity = function () { return this._codedIndexReaders.hasDeclSecurity.readCodedIndex(this._reader); };
                TableReader.prototype.readImplementation = function () { return this._codedIndexReaders.implementation.readCodedIndex(this._reader); };
                TableReader.prototype.readHasFieldMarshal = function () { return this._codedIndexReaders.hasFieldMarshal.readCodedIndex(this._reader); };
                TableReader.prototype.readTypeOrMethodDef = function () { return this._codedIndexReaders.typeOrMethodDef.readCodedIndex(this._reader); };
                TableReader.prototype.readMemberForwarded = function () { return this._codedIndexReaders.memberForwarded.readCodedIndex(this._reader); };
                TableReader.prototype.readMemberRefParent = function () { return this._codedIndexReaders.memberRefParent.readCodedIndex(this._reader); };
                TableReader.prototype.readMethodDefOrRef = function () { return this._codedIndexReaders.methodDefOrRef.readCodedIndex(this._reader); };
                TableReader.prototype.readHasSemantics = function () { return this._codedIndexReaders.hasSemantics.readCodedIndex(this._reader); };
                return TableReader;
            }());
            metadata.TableReader = TableReader;
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            var TableStream = /** @class */ (function () {
                function TableStream() {
                    this.reserved0 = 0;
                    this.version = "";
                    // byte
                    this.heapSizes = 0;
                    this.reserved1 = 0;
                    this.tables = [];
                    this.stringIndices = [];
                    this.codedIndexReaders = null;
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
                    this._populateTableRows(tableCounts);
                    this.codedIndexReaders = new metadata.CodedIndexReaders(this.tables);
                    var tableReader = new metadata.TableReader(reader, this.tables, stringCount, guidCount, blobCount, this.codedIndexReaders);
                    this._readTableRows(tableCounts, tableReader);
                    this.stringIndices = tableReader.stringIndices;
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
                TableStream.prototype._populateTableObjects = function (table, Ctor, count) {
                    for (var i = 0; i < count; i++) {
                        table.push(new Ctor());
                    }
                };
                TableStream.prototype._populateTableRows = function (tableCounts) {
                    for (var i = 0; i < tableCounts.length; i++) {
                        var table = [];
                        this.tables[i] = table;
                        var tableName = metadata.TableKind[i];
                        var TableType = managed.tables[tableName];
                        if (typeof (TableType) === "undefined") {
                            if (tableCounts[i])
                                throw new Error("Table 0x" + i.toString(16).toUpperCase() + " has " + tableCounts[i] + " rows but no definition.");
                            continue;
                        }
                        this._populateTableObjects(table, TableType, tableCounts[i]);
                    }
                };
                TableStream.prototype._readTableRows = function (tableCounts, reader) {
                    for (var i = 0; i < tableCounts.length; i++) {
                        var table = this.tables[i];
                        var tableName = metadata.TableKind[i];
                        var TableType = managed.tables[tableName];
                        for (var iRow = 0; iRow < tableCounts[i]; iRow++) {
                            table[iRow].read(reader);
                        }
                    }
                };
                return TableStream;
            }());
            metadata.TableStream = TableStream;
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var metadata;
        (function (metadata) {
            function calcRequredBitCount(maxValue) {
                var bitMask = maxValue;
                var result = 0;
                while (bitMask != 0) {
                    result++;
                    bitMask >>= 1;
                }
                return result;
            }
            metadata.calcRequredBitCount = calcRequredBitCount;
        })(metadata = managed.metadata || (managed.metadata = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.2 */
            var Assembly = /** @class */ (function () {
                function Assembly() {
                    this.def = null;
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
                Assembly.prototype.precomplete = function (reader) {
                    var name = reader.readString(this.name);
                    var culture = reader.readString(this.culture);
                    var version = this.majorVersion + '.' + this.minorVersion + '.' + this.buildNumber + '.' + this.revisionNumber;
                    var pk = reader.readPublicKey(this.publicKey);
                    var pktoken = pk && pk.length ? this._hashPublicKey(pk) : null;
                    this.def = reader.resolveAssemblyRef(name, version, pktoken, culture);
                    this.def.isSpeculative = false;
                    this.def.name = name;
                    this.def.version = version;
                    this.def.publicKey = pk;
                    this.def.publicKeyToken = pktoken;
                };
                Assembly.prototype._hashPublicKey = function (pk) {
                    var algo;
                    switch (this.hashAlgId) {
                        case pe.managed.metadata.AssemblyHashAlgorithm.MD5:
                            if (typeof console !== 'undefined' && console && typeof console.error === 'function')
                                console.error('Assembly hashing using MD5 is not currently supported');
                            break;
                        case pe.managed.metadata.AssemblyHashAlgorithm.SHA1:
                            algo = 'SHA-1';
                            break;
                        case pe.managed.metadata.AssemblyHashAlgorithm.SHA384:
                            algo = 'SHA-384';
                            break;
                        case pe.managed.metadata.AssemblyHashAlgorithm.SHA512:
                            algo = 'SHA-512';
                            break;
                        case pe.managed.metadata.AssemblyHashAlgorithm.None:
                            break;
                        default:
                            throw new Error('Assembly hashing using unknown ' + this.hashAlgId + ' algorithm is not supported.');
                    }
                    if (algo) {
                        var bytes = '';
                        for (var i = 0; i < pk.length; i++) {
                            bytes += String.fromCharCode(pk[i]);
                        }
                        var shaObj = new jsSHA(algo, 'BYTES');
                        shaObj.update(bytes);
                        var hash = shaObj.getHash('BYTES');
                        var result = "";
                        // reverse and take no more than 8 bytes for the token
                        for (var i = 0; i < hash.length && i < 8; i++) {
                            var hex = hash.charCodeAt(hash.length - i - 1).toString(16);
                            if (hex.length == 1)
                                result += "0";
                            result += hex;
                        }
                        return result;
                    }
                    else {
                        hash = pk;
                        var result = "";
                        for (var i = 0; i < hash.length; i++) {
                            var hex = hash[i].toString(16);
                            if (hex.length == 1)
                                result += "0";
                            result += hex;
                        }
                        return result;
                    }
                };
                return Assembly;
            }());
            tables.Assembly = Assembly;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.3 */
            var AssemblyOS = /** @class */ (function () {
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
            }());
            tables.AssemblyOS = AssemblyOS;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.4 */
            var AssemblyProcessor = /** @class */ (function () {
                function AssemblyProcessor() {
                    this.TableKind = 0x21;
                    this.processor = 0;
                }
                AssemblyProcessor.prototype.reader = function (reader) {
                    this.processor = reader.readInt();
                };
                return AssemblyProcessor;
            }());
            tables.AssemblyProcessor = AssemblyProcessor;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.5 */
            var AssemblyRef = /** @class */ (function () {
                function AssemblyRef() {
                    this.def = null;
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
                AssemblyRef.prototype.precomplete = function (reader) {
                    var name = reader.readString(this.name);
                    var culture = reader.readString(this.culture);
                    var version = this.majorVersion + '.' + this.minorVersion + '.' + this.buildNumber + '.' + this.revisionNumber;
                    var pk = null; // reader.readPublicKey(this.publicKey);
                    this.def = reader.resolveAssemblyRef(name, version, pk, culture);
                };
                return AssemblyRef;
            }());
            tables.AssemblyRef = AssemblyRef;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.2.6 */
            var AssemblyRefOs = /** @class */ (function () {
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
            }());
            tables.AssemblyRefOs = AssemblyRefOs;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.7 */
            var AssemblyRefProcessor = /** @class */ (function () {
                function AssemblyRefProcessor() {
                    this.TableKind = 0x24;
                }
                AssemblyRefProcessor.prototype.read = function (reader) {
                    this.processor = reader.readInt();
                };
                return AssemblyRefProcessor;
            }());
            tables.AssemblyRefProcessor = AssemblyRefProcessor;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.8 */
            var ClassLayout = /** @class */ (function () {
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
                ClassLayout.prototype.complete = function (reader) {
                    var typeDef = reader.lookupTable(managed.metadata.TableKind.TypeDef, this.parent);
                    if (typeDef)
                        typeDef.def.layout = { packingSize: this.packingSize, classSize: this.classSize };
                };
                return ClassLayout;
            }());
            tables.ClassLayout = ClassLayout;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.9 */
            var Constant = /** @class */ (function () {
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
                Constant.prototype.complete = function (reader) {
                    var parentDef = reader.lookupHasConstant(this.parent);
                    // TODO: apply constant to parentDef
                };
                return Constant;
            }());
            tables.Constant = Constant;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.10 */
            var CustomAttribute = /** @class */ (function () {
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
                CustomAttribute.prototype.complete = function (reader) {
                    var attrParent = reader.lookupHasCustomAttribute(this.parent);
                    var attrCtor = reader.lookupCustomAttributeType(this.type);
                    if (attrParent && attrCtor) {
                        if (!attrParent.customAttributes)
                            attrParent.customAttributes = [];
                        // TODO: create full attribute descriptor rather than just constructor
                        attrParent.customAttributes.push(attrCtor);
                    }
                };
                CustomAttribute.fire = true;
                return CustomAttribute;
            }());
            tables.CustomAttribute = CustomAttribute;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.11 */
            var DeclSecurity = /** @class */ (function () {
                function DeclSecurity() {
                    this.action = 0;
                    this.parent = 0;
                    this.permissionSet = 0;
                }
                DeclSecurity.prototype.read = function (reader) {
                    this.action = reader.readShort();
                    this.parent = reader.readHasDeclSecurity();
                    this.permissionSet = reader.readBlobIndex();
                };
                DeclSecurity.prototype.complete = function (reader) {
                    var declSecurityParent = reader.lookupHasCustomAttribute(this.parent);
                    if (declSecurityParent) {
                        var declSecurityParentDef = declSecurityParent.def;
                    }
                };
                return DeclSecurity;
            }());
            tables.DeclSecurity = DeclSecurity;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.13 */
            var Event = /** @class */ (function () {
                function Event() {
                    this.def = new managed.EventInfo();
                    this.eventFlags = 0;
                    this.name = 0;
                    this.eventType = 0;
                }
                Event.prototype.read = function (reader) {
                    this.eventFlags = reader.readShort();
                    this.name = reader.readString();
                    this.eventType = reader.readTypeDefOrRef();
                };
                Event.prototype.complete = function (reader) {
                    var type = reader.lookupTypeDefOrRef(this.eventType);
                    this.def.eventType = type;
                };
                return Event;
            }());
            tables.Event = Event;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.12 */
            var EventMap = /** @class */ (function () {
                function EventMap() {
                    this.parent = 0;
                    this.eventList = 0;
                }
                EventMap.prototype.read = function (reader) {
                    this.parent = reader.readTypeDefTableIndex();
                    this.eventList = reader.readEventTableIndex();
                };
                EventMap.prototype.complete = function (reader) {
                    var type = reader.lookupTable(managed.metadata.TableKind.TypeDef, this.parent);
                    var event = reader.lookupTable(managed.metadata.TableKind.Event, this.eventList);
                    if (type && event)
                        type.def.events.push(event.def);
                };
                return EventMap;
            }());
            tables.EventMap = EventMap;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.14 */
            var ExportedType = /** @class */ (function () {
                function ExportedType() {
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
                ExportedType.prototype.complete = function (reader) {
                    var impl = reader.lookupImplementation(this.implementation);
                    // TODO: do something?
                };
                return ExportedType;
            }());
            tables.ExportedType = ExportedType;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.15 */
            var Field = /** @class */ (function () {
                function Field() {
                    this.def = new managed.FieldInfo();
                    this.name = 0;
                    this.signature = 0;
                }
                Field.prototype.read = function (reader) {
                    this.def.attributes = reader.readShort();
                    this.name = reader.readString();
                    this.signature = reader.readBlobIndex();
                };
                Field.prototype.complete = function (reader) {
                    this.def.name = reader.readString(this.name);
                    reader.readFieldSignature(this.def, this.signature);
                };
                return Field;
            }());
            tables.Field = Field;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.8 */
            var FieldLayout = /** @class */ (function () {
                function FieldLayout() {
                    this.TableKind = 0x10;
                    this.offset = 0;
                    this.field = 0;
                }
                FieldLayout.prototype.read = function (reader) {
                    this.offset = reader.readInt();
                    this.field = reader.readFieldTableIndex();
                };
                FieldLayout.prototype.complete = function (reader) {
                    var field = reader.lookupTable(managed.metadata.TableKind.Field, this.field);
                    if (field)
                        field.fieldOffset = this.offset;
                };
                return FieldLayout;
            }());
            tables.FieldLayout = FieldLayout;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.17 */
            var FieldMarshal = /** @class */ (function () {
                function FieldMarshal() {
                    this.TableKind = 0x0D;
                    this.parent = 0;
                    this.nativeType = 0;
                }
                FieldMarshal.prototype.read = function (reader) {
                    this.parent = reader.readHasFieldMarshal();
                    this.nativeType = reader.readBlobIndex();
                };
                FieldMarshal.prototype.complete = function (reader) {
                    var parent = reader.lookupHasFieldMarshal(this.parent);
                    // TODO: do some matching?
                };
                return FieldMarshal;
            }());
            tables.FieldMarshal = FieldMarshal;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.18 */
            var FieldRVA = /** @class */ (function () {
                function FieldRVA() {
                    this.TableKind = 0x1D;
                    this.rva = 0;
                    this.field = 0;
                }
                FieldRVA.prototype.read = function (reader) {
                    this.rva = reader.readInt();
                    this.field = reader.readFieldTableIndex();
                };
                FieldRVA.prototype.complete = function (reader) {
                    var field = reader.lookupTable(managed.metadata.TableKind.Field, this.field);
                    // TODO: rva to what?
                };
                return FieldRVA;
            }());
            tables.FieldRVA = FieldRVA;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.19 */
            var File = /** @class */ (function () {
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
            }());
            tables.File = File;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.20 */
            var GenericParam = /** @class */ (function () {
                function GenericParam() {
                    this.TableKind = 0x2A;
                    this.def = new managed.Type();
                    this.number_ = 0;
                    this.owner = 0;
                    this.name = 0;
                }
                GenericParam.prototype.read = function (reader) {
                    this.number_ = reader.readShort();
                    this.def.attributes = reader.readShort();
                    this.owner = reader.readTypeOrMethodDef();
                    this.name = reader.readString();
                };
                GenericParam.prototype.complete = function (reader) {
                    this.def.genericPrototype = reader.lookupTypeDefOrRef(this.owner);
                    this.def.name = reader.readString(this.name);
                    if (this.def.genericPrototype && this.def.genericPrototype.genericArguments) {
                        this.def.genericPrototype.genericArguments[this.number_] = this.def;
                    }
                };
                return GenericParam;
            }());
            tables.GenericParam = GenericParam;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.21 */
            var GenericParamConstraint = /** @class */ (function () {
                function GenericParamConstraint() {
                    this.owner = 0;
                    this.constraint = 0;
                }
                GenericParamConstraint.prototype.read = function (reader) {
                    this.owner = reader.readGenericParamTableIndex();
                    this.constraint = reader.readTypeDefOrRef();
                };
                GenericParamConstraint.prototype.complete = function (reader) {
                    var genericParam = reader.lookupTable(managed.metadata.TableKind.GenericParam, this.owner);
                    var constrType = reader.lookupTypeDefOrRef(this.constraint);
                    // TODO: store constraint there
                };
                return GenericParamConstraint;
            }());
            tables.GenericParamConstraint = GenericParamConstraint;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.22 */
            var ImplMap = /** @class */ (function () {
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
                ImplMap.prototype.complete = function (reader) {
                    var forwarded = reader.lookupMemberForwarded(this.memberForwarded);
                    var moduleRef = reader.lookupTable(managed.metadata.TableKind.ModuleRef, this.importScope);
                    // TODO: resolve dllimport
                };
                return ImplMap;
            }());
            tables.ImplMap = ImplMap;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.33 */
            var InterfaceImpl = /** @class */ (function () {
                function InterfaceImpl() {
                    this.class_ = 0;
                    this.interface_ = 0;
                }
                InterfaceImpl.prototype.read = function (reader) {
                    this.class_ = reader.readTypeDefTableIndex();
                    this.interface_ = reader.readTypeDefOrRef();
                };
                InterfaceImpl.prototype.complete = function (reader) {
                    var class_ = reader.lookupTable(managed.metadata.TableKind.TypeDef, this.class_);
                    var interface_ = reader.lookupTypeDefOrRef(this.interface_);
                    if (class_ && interface_ && class_.def) {
                        var type = class_.def;
                        type.interfaces.push(interface_);
                    }
                };
                return InterfaceImpl;
            }());
            tables.InterfaceImpl = InterfaceImpl;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.24 */
            var ManifestResource = /** @class */ (function () {
                function ManifestResource() {
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
                ManifestResource.prototype.complete = function (reader) {
                    var implementation = reader.lookupImplementation(this.implementation);
                    // TODO: store resources somehwere??
                };
                return ManifestResource;
            }());
            tables.ManifestResource = ManifestResource;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.25 */
            var MemberRef = /** @class */ (function () {
                function MemberRef() {
                    this.TableKind = 0x0A;
                    this.def = null;
                    this.class_ = 0;
                    this.name = 0;
                    this.signature = 0;
                }
                MemberRef.prototype.read = function (reader) {
                    this.class_ = reader.readMemberRefParent();
                    this.name = reader.readString();
                    this.signature = reader.readBlobIndex();
                };
                MemberRef.prototype.complete = function (reader) {
                    var name = reader.readString(this.name);
                    var class_ = reader.lookupImplementation(this.class_);
                    // TODO: assign the signatutre or what??
                };
                return MemberRef;
            }());
            tables.MemberRef = MemberRef;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.26 */
            var MethodDef = /** @class */ (function () {
                function MethodDef() {
                    this.def = new managed.MethodInfo();
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
                MethodDef.prototype.complete = function (reader, nextMethodDef) {
                    this.def.attributes = this.attributes;
                    this.def.name = reader.readString(this.name);
                    var nextParamList;
                    if (nextMethodDef)
                        nextParamList = nextMethodDef.paramList;
                    reader.copyParamRange(this.def.parameters, this.paramList, nextParamList, this.def);
                };
                return MethodDef;
            }());
            tables.MethodDef = MethodDef;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.27 */
            var MethodImpl = /** @class */ (function () {
                function MethodImpl() {
                    this.TableKind = 0x19;
                    this.class_ = 0;
                    this.methodBody = 0;
                    this.methodDeclaration = 0;
                }
                MethodImpl.prototype.read = function (reader) {
                    this.class_ = reader.readTypeDefTableIndex();
                    this.methodBody = reader.readMethodDefOrRef();
                    this.methodDeclaration = reader.readMethodDefOrRef();
                };
                MethodImpl.prototype.complete = function (reader) {
                    var class_ = reader.lookupTable(managed.metadata.TableKind.TypeDef, this.class_);
                    var methodBody = reader.lookupMethodDefOrRef(this.methodBody);
                    var methodDeclaration = reader.lookupMethodDefOrRef(this.methodDeclaration);
                    if (class_ && class_.def) {
                        var type = class_.def;
                        // TODO: store that 'impl' stuff somewhere in the class?
                    }
                };
                return MethodImpl;
            }());
            tables.MethodImpl = MethodImpl;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.28 */
            var MethodSemantics = /** @class */ (function () {
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
                MethodSemantics.prototype.complete = function (reader) {
                    var method = reader.lookupTable(managed.metadata.TableKind.MethodDef, this.method);
                    var associatio = reader.lookupHasSemantics(this.association);
                    if (method && method.def) {
                        // TODO: store that 'impl' stuff somewhere in the class?
                    }
                };
                return MethodSemantics;
            }());
            tables.MethodSemantics = MethodSemantics;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.29 */
            var MethodSpec = /** @class */ (function () {
                function MethodSpec() {
                    this.method = 0;
                    this.instantiation = 0;
                }
                MethodSpec.prototype.read = function (reader) {
                    this.method = reader.readMethodDefOrRef();
                    this.instantiation = reader.readBlobIndex();
                };
                MethodSpec.prototype.complete = function (reader) {
                    var method = reader.lookupMethodDefOrRef(this.method);
                    // TODO: store that 'impl' stuff somewhere in the class?
                };
                return MethodSpec;
            }());
            tables.MethodSpec = MethodSpec;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.30 */
            var Module = /** @class */ (function () {
                function Module() {
                    this.def = { generation: 0, moduleName: '', mvid: '', encId: '', encBaseId: '' };
                    this.name = 0;
                    this.mvid = 0;
                    this.encId = 0;
                    this.encBaseId = 0;
                }
                Module.prototype.read = function (reader) {
                    this.def.generation = reader.readShort();
                    this.name = reader.readString();
                    this.mvid = reader.readGuid();
                    this.encId = reader.readGuid();
                    this.encBaseId = reader.readGuid();
                };
                Module.prototype.complete = function (reader) {
                    this.def.moduleName = reader.readString(this.name);
                    this.def.mvid = reader.readGuid(this.mvid);
                    this.def.encId = reader.readGuid(this.encId);
                    this.def.encBaseId = reader.readGuid(this.encBaseId);
                };
                return Module;
            }());
            tables.Module = Module;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.31 */
            var ModuleRef = /** @class */ (function () {
                function ModuleRef() {
                    this.name = 0;
                }
                ModuleRef.prototype.read = function (reader) {
                    this.name = reader.readString();
                };
                ModuleRef.prototype.complete = function (reader) {
                    var name = reader.readString(this.name);
                };
                return ModuleRef;
            }());
            tables.ModuleRef = ModuleRef;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.32 */
            var NestedClass = /** @class */ (function () {
                function NestedClass() {
                    this.nestedClass = 0;
                    this.enclosingClass = 0;
                }
                NestedClass.prototype.read = function (reader) {
                    this.nestedClass = reader.readTypeDefTableIndex();
                    this.enclosingClass = reader.readTypeDefTableIndex();
                };
                NestedClass.prototype.complete = function (reader) {
                    var nestedClass = reader.lookupTable(managed.metadata.TableKind.TypeDef, this.nestedClass);
                    var enclosingClass = reader.lookupTable(managed.metadata.TableKind.TypeDef, this.enclosingClass);
                    if (nestedClass.def && enclosingClass.def) {
                        nestedClass.def.nestingParent = enclosingClass.def;
                        enclosingClass.def.netedTypes.push(nestedClass.def);
                    }
                };
                return NestedClass;
            }());
            tables.NestedClass = NestedClass;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.33 */
            var Param = /** @class */ (function () {
                function Param() {
                    this.def = new managed.ParameterInfo();
                    this.sequence = 0;
                    this.name = 0;
                }
                Param.prototype.read = function (reader) {
                    this.def.attributes = reader.readShort();
                    this.sequence = reader.readShort();
                    this.name = reader.readString();
                };
                Param.prototype.complete = function (reader) {
                    this.def.name = reader.readString(this.name);
                };
                return Param;
            }());
            tables.Param = Param;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.34 */
            var Property = /** @class */ (function () {
                function Property() {
                    this.def = new managed.PropertyInfo();
                    this.name = 0;
                    this.type = 0;
                }
                Property.prototype.read = function (reader) {
                    this.def.attributes = reader.readShort();
                    this.name = reader.readString();
                    this.type = reader.readBlobIndex();
                };
                Property.prototype.complete = function (reader) {
                    this.def.name = reader.readString(this.name);
                    //this.def.propertyType = reader.
                };
                return Property;
            }());
            tables.Property = Property;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.35 */
            var PropertyMap = /** @class */ (function () {
                function PropertyMap() {
                    this.parent = 0;
                    this.propertyList = 0;
                }
                PropertyMap.prototype.read = function (reader) {
                    this.parent = reader.readTypeDefTableIndex();
                    this.propertyList = reader.readPropertyTableIndex();
                };
                PropertyMap.prototype.complete = function (reader) {
                    var parent = reader.lookupTable(managed.metadata.TableKind.TypeDef, this.parent);
                    var property = reader.lookupTable(managed.metadata.TableKind.Property, this.propertyList);
                    // TODO: now what?
                };
                return PropertyMap;
            }());
            tables.PropertyMap = PropertyMap;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.36 */
            var StandAloneSig = /** @class */ (function () {
                function StandAloneSig() {
                    this.signature = 0;
                }
                StandAloneSig.prototype.read = function (reader) {
                    this.signature = reader.readBlobIndex();
                };
                return StandAloneSig;
            }());
            tables.StandAloneSig = StandAloneSig;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.37 */
            var TypeDef = /** @class */ (function () {
                function TypeDef() {
                    this.def = new managed.Type();
                    this.name = 0;
                    this.namespace = 0;
                    this.extends_ = 0;
                    this.fieldList = 0;
                    this.methodList = 0;
                    this.def.isSpeculative = false;
                }
                TypeDef.prototype.read = function (reader) {
                    this.def.attributes = reader.readInt();
                    this.name = reader.readString();
                    this.namespace = reader.readString();
                    this.extends_ = reader.readTypeDefOrRef();
                    this.fieldList = reader.readFieldTableIndex();
                    this.methodList = reader.readMethodDefTableIndex();
                };
                TypeDef.prototype.complete = function (reader, nextTypeDef) {
                    this.def.name = reader.readString(this.name);
                    this.def.namespace = reader.readString(this.namespace);
                    this.def.baseType = reader.lookupTypeDefOrRef(this.extends_);
                    var nextFieldList;
                    if (nextTypeDef)
                        nextFieldList = nextTypeDef.fieldList;
                    reader.copyFieldRange(this.def.fields, this.fieldList, nextFieldList, this.def);
                    var nextMethodList;
                    if (nextTypeDef)
                        nextMethodList = nextTypeDef.methodList;
                    reader.copyMethodRange(this.def.methods, this.methodList, nextMethodList, this.def);
                };
                return TypeDef;
            }());
            tables.TypeDef = TypeDef;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.38 */
            var TypeRef = /** @class */ (function () {
                function TypeRef() {
                    this.def = null;
                    this.resolutionScope = 0;
                    this.name = 0;
                    this.namespace = 0;
                }
                TypeRef.prototype.read = function (reader) {
                    this.resolutionScope = reader.readResolutionScope();
                    this.name = reader.readString();
                    this.namespace = reader.readString();
                };
                TypeRef.prototype.precomplete = function (reader) {
                    var scope = reader.lookupResolutionScope(this.resolutionScope);
                    var name = reader.readString(this.name);
                    var namespace = reader.readString(this.namespace);
                    this.def = reader.resolveTypeRef(scope, namespace, name);
                };
                return TypeRef;
            }());
            tables.TypeRef = TypeRef;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var managed;
    (function (managed) {
        var tables;
        (function (tables) {
            /** ECMA-335 II.22.39 */
            var TypeSpec = /** @class */ (function () {
                function TypeSpec() {
                    this.def = new managed.Type();
                    this.signature = 0;
                }
                TypeSpec.prototype.read = function (reader) {
                    this.signature = reader.readBlobIndex();
                    // TODO: populate correctly
                    var fakeType = new managed.Type();
                    fakeType.name = 'fake*' + this.signature + '*';
                    this.def.genericPrototype = fakeType;
                };
                TypeSpec.prototype.complete = function (reader) {
                };
                return TypeSpec;
            }());
            tables.TypeSpec = TypeSpec;
        })(tables = managed.tables || (managed.tables = {}));
    })(managed = pe.managed || (pe.managed = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var unmanaged;
    (function (unmanaged) {
        var DllExport = /** @class */ (function () {
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
                }
                else {
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
                if (numberOfNamePointers != 0
                    && namePointerRva != 0
                    && ordinalTableRva != 0) {
                    saveOffset = reader.offset;
                    for (var i = 0; i < numberOfNamePointers; i++) {
                        reader.setVirtualOffset(ordinalTableRva + 2 * i);
                        var ordinal = reader.readShort();
                        reader.setVirtualOffset(namePointerRva + 4 * i);
                        var functionNameRva = reader.readInt();
                        var functionName;
                        if (functionNameRva == 0) {
                            functionName = null;
                        }
                        else {
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
                    }
                    else {
                        var saveOffset = reader.offset;
                        reader.setVirtualOffset(forwarderRva);
                        this.forwarder = reader.readAsciiZ();
                        reader.offset = saveOffset;
                    }
                }
                else {
                    this.exportRva = reader.readInt();
                    this.forwarder = null;
                }
                this.name = null;
            };
            return DllExport;
        }());
        unmanaged.DllExport = DllExport;
    })(unmanaged = pe.unmanaged || (pe.unmanaged = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var unmanaged;
    (function (unmanaged) {
        var DllImport = /** @class */ (function () {
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
                    }
                    else {
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
                }
                else {
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
        }());
        unmanaged.DllImport = DllImport;
    })(unmanaged = pe.unmanaged || (pe.unmanaged = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var unmanaged;
    (function (unmanaged) {
        var ResourceDataEntry = /** @class */ (function () {
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
        }());
        unmanaged.ResourceDataEntry = ResourceDataEntry;
    })(unmanaged = pe.unmanaged || (pe.unmanaged = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var unmanaged;
    (function (unmanaged) {
        var ResourceDirectory = /** @class */ (function () {
            function ResourceDirectory() {
                /** Resource flags. This field is reserved for future use. It is currently set to zero. */
                this.characteristics = 0;
                /** The time that the resource data was created by the resource compiler. */
                this.timestamp = new Date(0);
                /** The version number, set by the user. */
                this.version = "";
                this.subdirectories = [];
                this.dataEntries = [];
            }
            ResourceDirectory.prototype.toString = function () {
                return "subdirectories[" + (this.subdirectories ? this.subdirectories.length : "null") + "] " +
                    "dataEntries[" + (this.dataEntries ? this.dataEntries.length : "null") + "]";
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
                    }
                    else {
                        id = 0;
                        reader.setVirtualOffset(baseVirtualOffset + idOrNameRva - highBit);
                        name = this.readName(reader);
                    }
                    if (contentRva < highBit) { // high bit is not set
                        reader.setVirtualOffset(baseVirtualOffset + contentRva);
                        var dataEntry = this.dataEntries[dataEntryCount];
                        if (!dataEntry)
                            this.dataEntries[dataEntryCount] = dataEntry = new unmanaged.ResourceDataEntry();
                        dataEntry.name = name;
                        dataEntry.integerId = id;
                        dataEntry.dataRva = reader.readInt();
                        dataEntry.size = reader.readInt();
                        dataEntry.codepage = reader.readInt();
                        dataEntry.reserved = reader.readInt();
                        dataEntryCount++;
                    }
                    else {
                        contentRva = contentRva - highBit; // clear hight bit
                        reader.setVirtualOffset(baseVirtualOffset + contentRva);
                        var directoryEntry = this.subdirectories[directoryEntryCount];
                        if (!directoryEntry)
                            this.subdirectories[directoryEntryCount] = directoryEntry = new unmanaged.ResourceDirectoryEntry();
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
        }());
        unmanaged.ResourceDirectory = ResourceDirectory;
    })(unmanaged = pe.unmanaged || (pe.unmanaged = {}));
})(pe || (pe = {}));
var pe;
(function (pe) {
    var unmanaged;
    (function (unmanaged) {
        var ResourceDirectoryEntry = /** @class */ (function () {
            function ResourceDirectoryEntry() {
                this.name = "";
                this.integerId = 0;
                this.directory = new unmanaged.ResourceDirectory();
            }
            ResourceDirectoryEntry.prototype.toString = function () {
                return (this.name ? this.name + " " : "") + this.integerId +
                    (this.directory ?
                        "[" +
                            (this.directory.dataEntries ? this.directory.dataEntries.length : 0) +
                            (this.directory.subdirectories ? this.directory.subdirectories.length : 0) +
                            "]" :
                        "[null]");
            };
            return ResourceDirectoryEntry;
        }());
        unmanaged.ResourceDirectoryEntry = ResourceDirectoryEntry;
    })(unmanaged = pe.unmanaged || (pe.unmanaged = {}));
})(pe || (pe = {}));
//# sourceMappingURL=pe.js.map
//# sourceMappingURL=app.js.map