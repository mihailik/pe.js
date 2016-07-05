var pe;
(function() {
  if (!pe) pe = {};
  if (!pe.app) pe.app = {};
  if (!pe.app.boot) pe.app.boot = {};

  var uisite = document.getElementById('uisite');
  if (!uisite) {
    alert('Application has not been copied correctly. Please update.');
    throw new Error('Application has not been copied correctly. Please update.');
  }

  set(uisite, {
    text: '',
    position: 'absolute',
    left: '0px', top: '0px', right: '0px', bottom: '0px',
    background: 'white',
    color: 'black',
  });
  
  var bootBox = createElement('div', {
    padding: '2em'
  }, uisite);
  
  var topPad = createElement('div', {
    height: '20%',
  }, bootBox);
  
  var title = createElement('div', {
    fontSize: '400%',
    text: 'PE.js'
  }, bootBox);
  
  var status = createElement('div', {
    fontSize: '70%',
    text: 'Loading...'
  }, bootBox);
  
  var progressBox = createElement('div', {
    border: 'solid 1px #EEEEEE'
  }, bootBox);
  
  var progress = createElement('div', {
    width: '22%',
    height: '2px',
    background: 'tomato'
  }, progressBox);

  

  
  function createElement(tag, style, parent) {
    var elem = document.createElement(tag);
    set(elem, style);
    if (parent)
      parent.appendChild(elem);
    return elem;
  }
  
  function set(elem, style) {
    if (style===null || typeof style==='undefined')
      return;

    else if (typeof style === 'string') {
      if ('innerHTML' in elem) elem.innerHTML = style;
      else if ('textContent' in elem) elem.textContent = style;
      else if ('innerText' in elem) elem.innerText = style;
    }
    else {
      for (var k in style) if (style.hasOwnProperty(k)) {
        elem.style[k] = style[k];
        if (k==='text')
          set(elem, style[k]);
      }
    }
  }
  
  
  
  function reportDownloadProgress() {
    var totalSize = null;
    var dataHost = whichLast(document.body, function(cur) {
      totalSize = cur.getAttribute('data-total-size');
      if (totalSize)
        try { totalSize = Number(totalSize); } catch (e) { totalSize = null; }
      
      if (totalSize)
        return true;
    });
    
    if (!totalSize)
      return;

    var currentSize = null;
    whichLast(dataHost, function(cur) {
      currentSize = cur.getAttribute('data-complete-size');
      if (currentSize)
        try { currentSize = Number(currentSize); } catch (e) { currentSize = null; }
    });

    if (!currentSize)
      return;

    reportProgress(currentSize, totalSize*3 /* consider parsing twice as slow as reading */);
    
    function whichLast(cur, which) {
      while (true) {
        if (!cur || !cur.children || !cur.children.length)
          return cur;

        for (var i = cur.children.length-1; i>=0; i--) {
          var check = cur.children[i];
          if (check.tagName!=='script' && check.tagName!=='SCRIPT') {
            cur = check;
            break;
          }
        }

        if (which(cur))
          return cur;
      }
    }

  }

  function reportProgress(x, max) {
    if (max)
      x = Math.floor(1000*x/max)/10;
    else
      x = Math.floor(1000*x)/10;
    
    set(progress, {
      width: x + '%',
      background: 'gold'
    });
    set(status, {
      text: x+'%'
    });
  }

  function bootingComplete() {
    setTimeout(function () {

      set(status, 'Complete.');
      reportProgress(0.999);

    }, 1);
  }

  pe.app.boot.uisite = uisite;
  pe.app.boot.set = set;
  pe.app.boot.status = status;
  pe.app.boot.progress = progress;
  pe.app.boot.bootingComplete = bootingComplete;
  pe.app.boot.reportDownloadProgress = reportDownloadProgress;
})();