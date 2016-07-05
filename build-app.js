var buildStart = new Date();

var fs = require('fs');
var path = require('path');
var eq80 = require('./imports/eq80');

var pejs_html = buildHTML();

reportBuiltScript(pejs_html);


function reportBuiltScript(pejs_html) {

  try { var hostedEQ80 = !!require('nowindow'); }
  catch (err) { }

  if (hostedEQ80) {
  	var link = eq80.createLink('pejs-app.html', pejs_html);
    console.log('Open as ', link);
  }

  console.log('Saved '+pejs_html.length+' characters in '+path.resolve('pejs-app.html'));

}

function buildHTML() {
  var templateJS = fs.readFileSync('app/app.js')+'';

  var replacements = {
    eq80: eq80.script,
    bootHTML: eq80.jsStringLong(fs.readFileSync('app/boot.html'))
    //, componentsCSS: eq80.jsStringLong(fs.readFileSync('src/components-override.css'))
  };


  var resultJS = templateJS.replace(/\"\#([a-zA-Z0-9_]+)\#\"/g, function(match, name) { return replacements[name] || match; });
  resultJS+='\npejs_shell();';

  var files = [];
  var totalSize = 0;

  var resources = [];

  var mscorlibDir = '-mscorlib';
  if (!fs.existsSync(mscorlibDir)) throw new Error('No mscorlib directory found: '+mscorlibDir);

  var dumpDirs = [mscorlibDir];
  while (dumpDirs.length) {
    var dir = dumpDirs.pop();
    var dirFiles = fs.readdirSync(dir);
    for (var i = 0; i < dirFiles.length; i++) {
      var file = dirFiles[i];
      if (file.charAt(0)!=='/') file = path.join(dir, file);
      var stat = fs.statSync(file);
      if (stat.isDirectory()) {
        dumpDirs.push(file);
        continue;
      }

      var content = fs.readFileSync(file);
      var target = file;
      if (target.slice(0, mscorlibDir.length)===mscorlibDir) target = target.slice(mscorlibDir.length);
      if (target.charAt(0)!=='/') target = '/'+target;

      genFile(target, content);
    }
  }

  var resultHTML =
      '<head><meta charset="utf-8"><meta http-equiv="x-ua-compatible" cpmtemt="IE=edge">'+
      '<title> PE.js </title>\n'+
    	'<'+'!-- '+ (new eq80.persistence.dom.DOMTotals(buildStart, totalSize, /*node*/null)).updateNode() + ' --'+'>\n'+
			// #favicon#
			'<style data-legit=mi> *{display:none;background:white;color:white;} html,body{display:block;background:white;color:white;margin:0;padding:0;height:100%;overflow:hidden;} </style>\n'+
      '</head>\n'+
      '<body>\n'+
      '<'+'script'+' data-legit=mi>'+
      resultJS+'\n'+
      '</'+'script'+'>\n'+
      resources.join('\n')+'\n'+
			files.join('\n');


  return resultHTML;

  function genFile(path, content) {
    var html =
				'<'+'!-- '+(new eq80.persistence.dom.DOMFile(/*node*/null, path, null, 0, 0)).write(content) + '--'+'>';
    if (files.length && files[files.length-1].length >= content.length) {
    	files.push(html);
    }
    else {
      files.splice(files.length-1, 0, html);
    }
    totalSize += content.length;
  }
}