/// <reference path='pe2.d.ts' />


var loadedFiles = {};

function init() {
    try  {
        var mscStart = Date.now();
        var pageLoadTime = (mscStart - startPageLoading) / 1000;
        var preLog = 'page ' + pageLoadTime + 's.';
        log(preLog);

        var buf = null;
        var pieceCount = 16;
        var i = 0;
        var base64;
        var binText;

        function nextGetBase64() {
            try  {
                log(preLog + ' nextGetBase64:' + i + '...');
                base64 = getBase64(i);
                setTimeout(nextGetBinText, 50);
            } catch (error) {
                alert(error + ' ' + error.message);
            }
        }

        function nextGetBinText() {
            try  {
                log(preLog + ' nextGetBinText:' + i + '...');
                binText = getBinText(base64);
                if (buf === null)
                    buf = createBuffer(binText.length * pieceCount);

                setTimeout(nextCopyBinTextToBuffer, 50);
            } catch (error) {
                alert(error + ' ' + error.message);
            }
        }

        function nextCopyBinTextToBuffer() {
            try  {
                log(preLog + ' nextCopyBinTextToBuffer:' + i + '...');
                var pieceLength = buf.length / pieceCount;
                copyBinTextToBuffer(binText, buf, i * pieceLength, pieceLength);
                i++;

                if (i < pieceCount) {
                    setTimeout(nextGetBase64, 50);
                } else {
                    var mscTime = (Date.now() - mscStart) / 1000;
                    log(preLog + ' mscorlib.dll[' + buf.length + '/' + pieceCount + '] ' + mscTime + 's.');
                }
            } catch (error) {
                alert(error + ' ' + error.message);
            }
        }

        setTimeout(nextGetBase64, 50);
    } catch (error) {
        alert(error);
    }

    var logElement;
    function log(txt) {
        if (!logElement) {
            logElement = document.createElement('div');
            document.body.appendChild(logElement);
        }

        //var current = logElement.textContent || logElement.innerText;
        var newText = /*current +*/ txt;
        logElement.textContent = newText;
        logElement.innerText = newText;
    }
    log.toString = function () {
        return logElement.textContent || logElement.innerText;
    };
}

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
    if (window.atob) {
        _atob = window.atob;
    } else {
        var polyfill = 'function() {' + 'var exports = {};' + '(function(){var t="undefined"!=typeof exports?exports:window,' + 'r="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",' + 'o=function(){try{document.createElement("$")}catch(t){return t}}();' + 't.btoa||(t.btoa=function(t){for(var e,n,a=0,c=r,f="";t.charAt(0|a)||' + '(c="=",a%1);f+=c.charAt(63&e>>8-8*(a%1))){if(n=t.charCodeAt(a+=.75),n>255)' + 'throw o;e=e<<8|n}return f}),t.atob||(t.atob=function(t){if(t=t.replace(/=+$/,""),' + '1==t.length%4)throw o;for(var e,n,a=0,c=0,f="";n=t.charAt(c++);~n&&' + '(e=a%4?64*e+n:n,a++%4)?f+=String.fromCharCode(255&e>>(6&-2*a)):0)n=r.indexOf(n);' + 'return f})})();' + 'return exports; }';
        _atob = eval(polyfill).atob;
    }
}

window.onload = init;
//# sourceMappingURL=tool2.js.map
