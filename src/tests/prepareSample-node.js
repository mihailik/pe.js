var fs = require("fs");
var sampleBuf = fs.readFileSync("sample64.exe");

var lineArrays = [];
var lineArray = [];
for (var i = 0; i < sampleBuf.length; i++) {
	if (sampleBuf[i])
		lineArray[i] = sampleBuf[i];
	
	if ((i % 80)===79) {
		lineArrays.push(lineArray);
		lineArray = [];
	}
		
}

console.log("var sampleBuf =");
console.log("["+lineArrays.map(function(l) { return l.join(","); }).join(",\n")+"];");

if (sampleBuf[sampleBuf.length-1]===0)
	console.log("sampleBuf["+(sampleBuf.length-1)+"] = " + sampleBuf[sampleBuf.length-1]+"; // "+ sampleBuf.length+" bytes");