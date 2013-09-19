/// <reference path='pe.d.ts' />

declare var sampleBuf: Uint8Array;

var loadedFiles = {};

function init() {
  var dragSite = document.getElementById('dragSite');
  dragSite.ondragover = dragSite_dragenter;
  dragSite.ondragenter = dragSite_dragenter;
  dragSite.ondragleave = dragSite_dragleave;
  dragSite.ondrop = dragSite_drop;

  if (window.opener && window.location.hash) {
	var loadFileArgument = (<any>window.opener).loadedFiles[window.location.hash];
	delete (<any>window.opener).loadedFiles[window.location.hash];
	window.location.hash = "";

	onFileLoaded(loadFileArgument.file, loadFileArgument.assembly);
  }
  else {
	var bufferReader = new pe.io.BufferReader(sampleBuf);
    var appDomain = new pe.managed2.AppDomain();
    var asm = appDomain.read(bufferReader);
	onFileLoaded({name: "sample.exe"}, asm);
	isInitialFileLoaded = true; 
  }

  var loadInput = <HTMLInputElement>document.getElementById('loadInput');
  loadInput.onchange = function(evt) {
	  if (!evt || !evt.target || !(<any>evt.target).files) {
		  alert("File API is not supported by the browser.");
		  return;
	  }

	  handleDrop((<any>evt.target).files);
  };
}

function dragSite_dragenter(e) {
  var dragSite = document.getElementById('dragSite');
  dragSite.className += " dragover";
  e.cancelBubble = true;
  return false;
}

function dragSite_dragleave(e) {
  var dragSite = document.getElementById('dragSite');
  dragSite.className = dragSite.className.replace(/ dragover/g, "");
  e.cancelBubble = true;
  return false;
}

function dragSite_drop(e) {
  var dragSite = document.getElementById('dragSite');
  dragSite.className = dragSite.className.replace(/ dragover/g, "");
  e.cancelBubble = true;

  try {
  if (e.dataTransfer && e.dataTransfer.files) {
	handleDrop(e.dataTransfer.files);
  }
  }
  catch (error) {
	setTimeout(function() {
		alert(error);
	}, 10);
  }

  return false;
}

function handleDrop(files) {
  for (var i = 0; i < files.length; i++) {
	loadFile(files[i]);
  }
}

function loadFile(f) {
  pe.io.getFileBufferReader(
	f,
	function(reader) {
	  var appDomain = new pe.managed2.AppDomain();
      var asm = appDomain.read(reader);
	  onFileLoaded(f, asm);
	},
	function(errorGettingReader) {
	  alert(errorGettingReader);
	});
}

var isInitialFileLoaded = null;

function onFileLoaded(f, asm) {
  if (isInitialFileLoaded===null || isInitialFileLoaded===true) {
	renderPEFileHeaders(f, asm);
	isInitialFileLoaded = false;
	return;
  }

  var linksToOpen = document.getElementById('linksToOpen');

  var newLinkToOpen = document.createElement("a");
  newLinkToOpen.href = "#";
  newLinkToOpen.innerText = f.name + " " + asm;
  newLinkToOpen.textContent = f.name + " " + asm;
  linksToOpen.appendChild(newLinkToOpen);
  var emptySpace = document.createElement("span");
  emptySpace.innerText = " ";
  emptySpace.textContent = " ";
  linksToOpen.appendChild(emptySpace);

  newLinkToOpen.onclick = function() {
	linksToOpen.removeChild(newLinkToOpen);
	linksToOpen.removeChild(emptySpace);

	var createUrl = window.location + "";
	if (window.location.hash && window.location.hash.length>0)
	  createUrl = createUrl.substring(0, createUrl.length - window.location.hash.length);

	if (createUrl.substring(createUrl.length-1)==="#")
	  createUrl = createUrl.substring(0, createUrl.length-1);

	createUrl += "#" + f.name;

	loadedFiles["#" + f.name] = { file: f, assembly: asm };

	var newWindow = window.open(createUrl);
  };
}

function renderPEFileHeaders(f, asm) {
    var titleElement = document.getElementById('titleElement');
	var dump = asm + "\n";

		for (var iType = 0; iType < asm.types.length; iType++) {
			dump += "		" + asm.types[iType] + "\n";

			for (var iField = 0; iField < asm.types[iType].fields.length; iField++) {
				dump += "			" + asm.types[iType].fields[iField] + "\n";
			}
			for (var iMethod = 0; iMethod < asm.types[iType].methods.length; iMethod++) {
				dump += "			" + asm.types[iType].methods[iMethod] + "\n";
			}
		}

    var managedDiv = document.getElementById('managedDiv');
	managedDiv.innerText = dump;
	managedDiv.textContent = dump;
}

function formatEnum(x, y) {
  var result = pe.io.formatEnum(x, y);
  return result.split("|").join(" | ");
}

function formatHex(value) {
	if (typeof value == "null"
		|| value === null)
		return "null";
	else if(typeof value == "undefined")
		return "undefined";
	else if (value==0)
		return "0";
	else if (typeof value == "number")
		return value.toString(16).toUpperCase() + "h";
	else
		return value + "";
}

function formatAddress(value) {
	if (typeof value == "null"
		|| value === null)
		return "null";
	else if(typeof value == "undefined")
		return "undefined";
	
	var result = value.toString(16).toUpperCase();
	if (result.length<=4)
		result = "0000".substring(result.length) + result + "h";
	else
		result = "00000000".substring(result.length) + result + "h";

	return result;
}

function formatBytes(bytes) {
	var concatResult = [];
	for (var i = 0; i < bytes.length; i++) {
		if (i > 0) {
			if (i % 16 == 0)
				concatResult.push("\r\n");
			else if (i % 8 == 0)
				concatResult.push(" | ");
			else if (i % 4 == 0)
				concatResult.push(" ");
		}
		
		if (bytes[i]<16)
			concatResult.push("0" + bytes[i].toString(16).toUpperCase());
		else
			concatResult.push(bytes[i].toString(16).toUpperCase());
	}

	return " " + concatResult.join(" ");
}


window.onload = init;
