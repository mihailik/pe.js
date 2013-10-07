var pe;
(function (pe) {
    (function (tool) {
        /**
        * loading embedded mscorlib.dll into a [typed] array of 32-bit integers
        */
        function loadMscorlib(callback, restIntervalMs, log) {
            var pieceCount = 16;
            var i = 0;
            var base64 = null;
            var binText = null;
            var buf = null;

            setTimeout(nextGetBase64, restIntervalMs);

            function nextGetBase64() {
                try  {
                    log('nextGetBase64:' + i + '...');
                    base64 = getBase64(i);
                    setTimeout(nextGetBinText, restIntervalMs);
                } catch (error) {
                    callback(null, error);
                }
            }

            function nextGetBinText() {
                try  {
                    log('nextGetBinText:' + i + '...');
                    binText = getBinText(base64);
                    if (buf === null)
                        buf = createBuffer(binText.length * pieceCount);

                    setTimeout(nextCopyBinTextToBuffer, restIntervalMs);
                } catch (error) {
                    callback(null, error);
                }
            }

            function nextCopyBinTextToBuffer() {
                try  {
                    log('nextCopyBinTextToBuffer:' + i + '...');
                    var pieceLength = buf.length / pieceCount;
                    copyBinTextToBuffer(binText, buf, i * pieceLength, pieceLength);
                    i++;

                    if (i < pieceCount) {
                        setTimeout(nextGetBase64, restIntervalMs);
                    } else {
                        log('mscorlib.dll[' + buf.length + '/' + pieceCount + '] completed');
                        callback(buf, null);
                    }
                } catch (error) {
                    callback(null, error);
                }
            }
        }
        tool.loadMscorlib = loadMscorlib;

        function getBase64(i) {
            var mscorlibDllScript = document.getElementById('mscorlib' + i + '.dll');
            if (mscorlibDllScript === null) {
                return null;
            }

            return mscorlibDllScript.innerHTML || mscorlibDllScript.textContent;
        }

        function getBinText(base64) {
            if (!_atob)
                createAtob();
            return _atob(base64);
        }

        function createBuffer(int32Length) {
            if ('Uint32Array' in window)
                return new Uint32Array(int32Length);
            else
                return [];
        }

        function copyBinTextToBuffer(binText, buf, bufOffset, bufCount) {
            for (var i = bufOffset; i < bufCount; i++) {
                buf[i] = binText.charCodeAt(i / 4) | binText.charCodeAt(i / 4 + 1) << 8 | binText.charCodeAt(i / 4 + 2) << 16 | binText.charCodeAt(i / 4 + 3) << 24;
            }
        }

        var _atob;
        function createAtob() {
            if (window.atob && false) {
                _atob = window.atob;
            } else {
                var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=', INVALID_CHARACTER_ERR = ((function () {
                    try  {
                        document.createElement('$');
                    } catch (error) {
                        return error;
                    }
                })());
                _atob = function (input) {
                    input = input.replace(/=+$/, '');
                    if (input.length % 4 == 1)
                        throw INVALID_CHARACTER_ERR;
                    for (// initialize result and counters
                    var bc = 0, bs, buffer, idx = 0, output = ''; buffer = input.charAt(idx++); ~buffer && (bs = bc % 4 ? (bs * 64) + buffer : buffer, (bc++ % 4)) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
                        // try to find character in table (0-63, not found => -1)
                        buffer = chars.indexOf(buffer);
                    }
                    return output;
                };
            }
        }
    })(pe.tool || (pe.tool = {}));
    var tool = pe.tool;
})(pe || (pe = {}));
/// <reference path='../pe2.d.ts' />
/// <reference path='mscorlib.ts' />


var loadedFiles = {};

function getTime() {
    if (Date.now)
        return Date.now();
    else
        return new Date().getTime();
}

function init() {
    try  {
        var mscStart = getTime();
        var pageLoadTime = (mscStart - startPageLoading) / 1000;
        log('page ' + pageLoadTime + 's.');

        pe.tool.loadMscorlib(function (buffer, error) {
            var mscTime = (getTime() - mscStart) / 1000;
            if (error) {
                log(error + ' ' + error.message + ' ' + mscTime + 's.');
            } else {
                log('mscorlib[' + buffer.length + '] ' + buffer[0].toString(16).toUpperCase() + 'h ' + mscTime + 's.');
            }
        }, 25, log);
    } catch (error) {
        alert(error + ' ' + error.message);
    }

    function log(txt) {
        var logElement = document.createElement('div');
        if ('textContent' in logElement)
            logElement.textContent = txt;
        else if ('innerText' in logElement)
            logElement.innerText = txt;
        document.body.appendChild(logElement);
    }
}

window.onload = init;
//# sourceMappingURL=tool2.js.map
