var fs = require('fs');
var path = require('path');

var build = require('eq80/build.js');

var buildStats = build.buildStats();

var outputPath = path.resolve(__dirname, 'lib/pelib.html');

console.log('Compiling PE.js library sources...');
var builtOutput = build.compileTS('--project', path.join(__dirname, 'src/tsconfig.json'), '--pretty', '--declaration');
var builtLib = builtOutput['pe.js'];
var builtDecl = builtOutput['pe.d.ts'];
console.log('  '+builtLib.length+' chars, '+(builtDecl?builtDecl.length:'no')+' declaration');


console.log('Dumping declaration');
fs.writeFileSync(path.resolve('lib/pe.d.ts'), builtDecl+'');

console.log('Compiling tests...');
var builtTests = build.compileTS('--project', 'tests/tsconfig.json', '--pretty')['pe-tests.js'];
console.log('  '+builtTests.length+' chars');

var buildStats = buildStats();

console.log('Fetching jsSHA used for assembly name hashing...');
var jsSHA_content = fs.readFileSync(path.resolve(__dirname, 'external/jsSHA/sha.js'));
console.log('  '+jsSHA_content.length+' chars.');

console.log('Combining...');

var monoCorlib = 'var monoCorlib = [';
for (var i = 0; i < 16; i++) {
  var istr = i+'';
  if (istr.length===1) istr = '0'+istr;
  var b64 = fs.readFileSync('-mscorlib/'+istr+'.base64');
  monoCorlib += (i?',\n':'\n')+'  "'+b64+'"';
}
monoCorlib+='];';

var wrapped = build.wrapScript({
    lib: build.functionBody(pe_lib_content,{
      stats: buildStats,
      lib: builtLib
    }),
    lib_tests:
  		'pe();\n\n\n\n'+
  		jsSHA_content+
  		'\n\n\n\n'+
  		monoCorlib+
  		'\n\n\n\n'+
  		builtTests,
  	lib_exports:
  		'pe();\n'+'module.exports = pe;\n\n\n\n'+
  		jsSHA_content
  });

console.log('Build into '+outputPath+' ('+wrapped.length+' chars), taken '+((buildStats.taken)/1000)+' sec.');
fs.writeFileSync(outputPath, wrapped);



function pe_lib_content() {
function pe(document, uniqueKey, optionalDrives) {

	pe.build = "#stats#";

(function(pe_scope) { var pe = pe_scope;
"#lib#"
})(pe);


}
}