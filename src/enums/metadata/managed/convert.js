var dlg = document.createElement('div');
dlg.style.position='fixed';
dlg.style.right =10;
dlg.style.bottom=20;
dlg.style.width='50%';

var txt = document.createElement('textarea');
txt.style.width ='100%';
txt.style.height = '10em';
dlg.appendChild(txt);

var process = document.createElement('button');
process.textContent = 'process';
process.onclick = function() {
  var lines = txt.value.split('\n');
  var prevLead = null;
  for (var i=0;i<lines.length;i++){
    var ln= lines[i];
    var lead = commentsLead(ln);
    if (lead===null) {
      if (prevLead!==null) {
        lines[i]=prevLead+' */\n'+lines[i];
      }
      prevLead = null;
    }
    else {
      if (prevLead===null) {
        lines[i]=lead+'/*\n'+lead+' *'+lines[i].slice(lead.length+2);
      }
      else {
        lines[i]=lead+' *'+lines[i].slice(lead.length+2);
      }
      prevLead = lead;
    }
  }
  txtout.value = lines.join('\n');
  
  function commentsLead(ln){
    var pos = ln.indexOf('//');
    if (pos<0) return null;
    var lead = ln.slice(0,pos);
    if (lead.trim().length>0) return null;
    return lead;
  }
};
dlg.appendChild(process);

var txtout = document.createElement('textarea');
txtout.style.width ='100%';
txtout.style.height ='10em';
dlg.appendChild(txtout);

var close = document.createElement('button');
close.textContent = 'close';
close.onclick = function() {
  document.body.removeChild(dlg);
};
dlg.appendChild(close);


document.body.appendChild(dlg);
txt.focus();