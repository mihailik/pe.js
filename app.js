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
    var html = "\n  <!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <meta http-equiv=\"X-UA-Compatible\" content=\"ie=edge\">\n    <title>PE.js</title>\n</head>\n<body>\n    <h2>PE.js</h2>\n    <p>\n        Loading...\n    </p>\n\n    <script></script>\n</body>\n</html>\n";
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
            var serverPromise;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        serverPromise = node.server(__dirname);
                        return [4 /*yield*/, serverPromise];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
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
                        resolve(srv);
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
            var thisScriptData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof thisScriptPromise !== 'string')
                            thisScriptPromise = readThisScript();
                        return [4 /*yield*/, thisScriptPromise];
                    case 1:
                        thisScriptData = _a.sent();
                        options.response.end(thisScriptData);
                        return [2 /*return*/];
                }
            });
        });
    }
    node.server_handleRoot = server_handleRoot;
})(node || (node = {}));
//# sourceMappingURL=app.js.map