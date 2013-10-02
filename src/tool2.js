

var loadedFiles = {};

function init() {
    try  {
        var logElement;
        function log(txt) {
            if (!logElement) {
                logElement = document.createElement('div');
                document.body.appendChild(logElement);
            }
            var current = logElement.textContent || logElement.innerText;
            var newText = current + txt;
            logElement.textContent = newText;
            logElement.innerText = newText;
        }

        var pageLoad = Date.now() - window['startPageLoading'];
        log('page ' + pageLoad / 1000 + '... ');

        setTimeout(function () {
            try  {
                loadMscorlib(function (buffer, mscorlibLoad, error) {
                    if (error) {
                        alert(error + ' ' + error.message);
                        return;
                    }

                    log('mscorlib ' + mscorlibLoad / 1000 + '...');
                });
            } catch (error) {
                alert(error + ' ' + error.message);
            }
        }, 100);
    } catch (error) {
        alert(error);
    }
}

function loadMscorlib(oncomplete) {
    var mscorlibDllScript = document.getElementById('mscorlib.dll');
    if (mscorlibDllScript === null) {
        oncomplete(null, 0, new Error('mscorlib.dll is not embedded.'));
        return;
    }

    var base64 = mscorlibDllScript.innerHTML;
    var textBuf;
    if (window.atob) {
        textBuf = atob(base64);
    } else {
        var polyfill = 'function() {' + 'var exports = {};' + '(function(){var t="undefined"!=typeof exports?exports:window,' + 'r="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",' + 'o=function(){try{document.createElement("$")}catch(t){return t}}();' + 't.btoa||(t.btoa=function(t){for(var e,n,a=0,c=r,f="";t.charAt(0|a)||' + '(c="=",a%1);f+=c.charAt(63&e>>8-8*(a%1))){if(n=t.charCodeAt(a+=.75),n>255)' + 'throw o;e=e<<8|n}return f}),t.atob||(t.atob=function(t){if(t=t.replace(/=+$/,""),' + '1==t.length%4)throw o;for(var e,n,a=0,c=0,f="";n=t.charAt(c++);~n&&' + '(e=a%4?64*e+n:n,a++%4)?f+=String.fromCharCode(255&e>>(6&-2*a)):0)n=r.indexOf(n);' + 'return f})})();' + 'return exports; }';
        var atob_ = eval(polyfill).atob;
        textBuf = atob_(base64);
    }
    if ('Uint8Array' in window && 'ArrayBuffer' in window) {
        var sampleBuf_ = new ArrayBuffer(textBuf.length);
        var dv = new DataView(sampleBuf_);
        setTimeout(function () {
            for (var i = 0; i < textBuf.length; i++) {
                dv.setUint8(i, textBuf.charCodeAt(i));
            }
            oncomplete(sampleBuf_, 0, null);
        }, 100);
    } else {
        setTimeout(function () {
            var buf = [];
            for (var i = 0; i < textBuf.length; i++) {
                buf[i] = textBuf.charCodeAt(i);
            }
            oncomplete(buf, 0, null);
        }, 100);
    }
}

window.onload = init;
//# sourceMappingURL=tool2.js.map
