module pe.io {
	export class Long {
		constructor (
			public lo: number,
			public hi: number) {
		}

		toString() {
			var result: string;
			result = this.lo.toString(16);
			if (this.hi != 0) {
				result = ("0000").substring(result.length) + result;
				result = this.hi.toString(16) + result;
			}
			result = result.toUpperCase() + "h";
			return result;
		}
	}


	export class AddressRange {
		constructor (public address?: number, public size?: number) {
			if (!this.address)
				this.address = 0;
			if (!this.size)
				this.size = 0;
		}

		mapRelative(offset: number): number {
			var result = offset - this.address;
			if (result >= 0 && result < this.size)
				return result;
			else
				return -1;
		}

		toString() { return this.address.toString(16).toUpperCase() + ":" + this.size.toString(16).toUpperCase() + "h"; }
	}

	export class AddressRangeMap extends AddressRange {
		constructor(address?: number, size?: number, public virtualAddress?: number) {
			super(address, size);

			if (!this.virtualAddress)
				this.virtualAddress = 0;
		}

		toString() { return this.address.toString(16).toUpperCase() + ":" + this.size.toString(16).toUpperCase() + "@" + this.virtualAddress + "h"; }
	}

	var checkBufferReaderOverrideOnFirstCreation = true;
	var hexUtf = (function () {
		var buf = [];
		for (var i = 0; i < 127; i++) {
			buf.push(String.fromCharCode(i));
		}
		for (var i = 127; i < 256; i++) {
			buf.push("%" + i.toString(16));
		}
		return buf;
	})();

	export class BufferReader {
		private _view: DataView;
		public offset: number = 0;

		public sections: AddressRangeMap[] = [];
		private _currentSectionIndex: number = 0;

		constructor(array: number[]);
		constructor(buffer: ArrayBuffer);
		constructor(view: DataView);
		constructor(view: any) {
			if (checkBufferReaderOverrideOnFirstCreation) {
				// whatever we discover, stick to it, don't repeat it again
				checkBufferReaderOverrideOnFirstCreation = false;

				var global = (function () { return this; })();
				if (!("DataView" in global)) {
					// the environment doesn't support DataView,
					// fall back on ArrayBuffer
					io.BufferReader = <any>ArrayReader;
					return new ArrayReader(view);
				}
			}

			if (!view)
				return;

			if ("getUint8" in view) {
				this._view = <DataView>view;
			}
			else if ("byteLength" in view) {
				this._view = new DataView(<ArrayBuffer>view);
			}
			else {
				var arrb = new ArrayBuffer(view.length);
				this._view = new DataView(arrb);
				for (var i = 0; i < view.length; i++) {
					this._view.setUint8(i, view[i]);
				}
			}
		}

		readByte(): number {
			var result = this._view.getUint8(this.offset);
			this.offset++;
			return result;
		}

		peekByte(): number {
			var result = this._view.getUint8(this.offset);
			return result;
		}

		readShort(): number {
			var result = this._view.getUint16(this.offset, true);
			this.offset += 2;
			return result;
		}

		readInt(): number {
			var result = this._view.getUint32(this.offset, true);
			this.offset += 4;
			return result;
		}

		readLong(): Long {
			var lo = this._view.getUint32(this.offset, true);
			var hi = this._view.getUint32(this.offset + 4, true);
			this.offset += 8;
			return new Long(lo, hi);
		}

		readBytes(length: number): Uint8Array {
			var result = new Uint8Array(
				this._view.buffer,
				this._view.byteOffset + this.offset,
				length);

			this.offset += length;
			return result;
		}

		readZeroFilledAscii(length: number) {
			var chars = [];

			for (var i = 0; i < length; i++) {
				var charCode = this._view.getUint8(this.offset + i);

				if (charCode == 0)
					continue;

				chars.push(String.fromCharCode(charCode));
			}

			this.offset += length;

			return chars.join("");
		}

		readAsciiZ(maxLength: number = 1024): string {
			var chars = [];

			var byteLength = 0;
			while (true) {
				var nextChar = this._view.getUint8(this.offset + chars.length);
				if (nextChar == 0) {
					byteLength = chars.length + 1;
					break;
				}

				chars.push(String.fromCharCode(nextChar));
				if (chars.length == maxLength) {
					byteLength = chars.length;
					break;
				}
			}

			this.offset += byteLength;

			return chars.join("");
		}

		readUtf8Z(maxLength: number): string {
			var buffer = [];
			var isConversionRequired = false;

			for (var i = 0; !maxLength || i < maxLength; i++) {
				var b = this._view.getUint8(this.offset + i);

				if (b == 0) {
					i++;
					break;
				}

				buffer.push(hexUtf[b]);
				if (b >= 127)
					isConversionRequired = true;
			}

			this.offset += i;

			if (isConversionRequired)
				return decodeURIComponent(buffer.join(""));
			else
				return buffer.join("");
		}

		getVirtualOffset(): number {
			var result = this.tryMapToVirtual(this.offset);
			if (result <0)
				throw new Error("Cannot map current position into virtual address space.");
			return result;
		}

		setVirtualOffset(rva: number): void {
			if (this._currentSectionIndex >= 0
				&& this._currentSectionIndex < this.sections.length) {
				var s = this.sections[this._currentSectionIndex];
				var relative = rva - s.virtualAddress;
				if (relative >= 0 && relative < s.size) {
					this.offset = relative + s.address;
					return;
				}
			}

			for (var i = 0; i < this.sections.length; i++) {
				var s = this.sections[i];
				var relative = rva - s.virtualAddress;
				if (relative >=0 && relative < s.size) {
					this._currentSectionIndex = i;
					this.offset = relative + s.address;
					return;
				}
			}

			throw new Error("Address 0x" + rva.toString(16).toUpperCase() + " is outside of virtual address space.");
		}

		private tryMapToVirtual(offset: number): number {
			if (this._currentSectionIndex >= 0
				&& this._currentSectionIndex < this.sections.length) {
				var s = this.sections[this._currentSectionIndex];
				var relative = offset - s.address;
				if (relative >=0 && relative < s.size)
					return relative + s.virtualAddress;
			}

			for (var i = 0; i < this.sections.length; i++) {
				var s = this.sections[i];
				var relative = offset - s.address;
				if (relative >=0 && relative < s.size) {
					this._currentSectionIndex = i;
					return relative + s.virtualAddress;
				}
			}

			return -1;
		}
	}

	export class ArrayReader extends BufferReader {
		public offset: number = 0;

		public sections: AddressRangeMap[] = [];

		constructor(private _array: number[]) {
			super(null);
		}

		readByte(): number {
			var result = this._array[this.offset];
			this.offset++;
			return result;
		}

		peekByte(): number {
			var result = this._array[this.offset];
			return result;
		}

		readShort(): number {
			var result =
				this._array[this.offset] +
				(this._array[this.offset + 1] << 8);
			this.offset += 2;
			return result;
		}

		readInt(): number {
			var result =
				this._array[this.offset] +
				(this._array[this.offset + 1] << 8) +
				(this._array[this.offset + 2] << 16) +
				(this._array[this.offset + 3] * 0x1000000);
			this.offset += 4;
			return result;
		}

		readLong(): Long {
			var lo = this.readInt();
			var hi = this.readInt();
			return new Long(lo, hi);
		}

		readBytes(length: number): Uint8Array {
			var result = this._array.slice(this.offset, this.offset + length);
			this.offset += length;
			return <any>result;
		}

		readZeroFilledAscii(length: number) {
			var chars = [];

			for (var i = 0; i < length; i++) {
				var charCode = this._array[this.offset + i];

				if (charCode == 0)
					continue;

				chars.push(String.fromCharCode(charCode));
			}

			this.offset += length;

			return chars.join("");
		}

		readAsciiZ(maxLength: number = 1024): string {
			var chars = [];

			var byteLength = 0;
			while (true) {
				var nextChar = this._array[this.offset + chars.length];
				if (nextChar == 0) {
					byteLength = chars.length + 1;
					break;
				}

				chars.push(String.fromCharCode(nextChar));
				if (chars.length == maxLength) {
					byteLength = chars.length;
					break;
				}
			}

			this.offset += byteLength;

			return chars.join("");
		}

		readUtf8Z(maxLength: number): string {
			var buffer = "";
			var isConversionRequired = false;

			for (var i = 0; !maxLength || i < maxLength; i++) {
				var b = this._array[this.offset + i];

				if (b == 0) {
					i++;
					break;
				}

				if (b < 127) {
					buffer += String.fromCharCode(b);
				}
				else {
					isConversionRequired = true;
					buffer += "%";
					buffer += b.toString(16);
				}
			}

			this.offset += i;

			if (isConversionRequired)
				return decodeURIComponent(buffer);
			else
				return buffer;
		}

		getVirtualOffset(): number {
			var result = this._tryMapToVirtual(this.offset);
			if (result <0)
				throw new Error("Cannot map current position into virtual address space.");
			return result;
		}

		setVirtualOffset(rva: number): void {
			if ((<any>this)._currentSectionIndex >= 0
				&& (<any>this)._currentSectionIndex < this.sections.length) {
				var s = this.sections[(<any>this)._currentSectionIndex];
				var relative = rva - s.virtualAddress;
				if (relative >= 0 && relative < s.size) {
					this.offset = relative + s.address;
					return;
				}
			}

			for (var i = 0; i < this.sections.length; i++) {
				var s = this.sections[i];
				var relative = rva - s.virtualAddress;
				if (relative >=0 && relative < s.size) {
					(<any>this)._currentSectionIndex = i;
					this.offset = relative + s.address;
					return;
				}
			}

			throw new Error("Address is outside of virtual address space.");
		}

		private _tryMapToVirtual(offset: number): number {
			if ((<any>this)._currentSectionIndex >= 0
				&& (<any>this)._currentSectionIndex < this.sections.length) {
				var s = this.sections[(<any>this)._currentSectionIndex];
				var relative = offset - s.address;
				if (relative >=0 && relative < s.size)
					return relative + s.virtualAddress;
			}

			for (var i = 0; i < this.sections.length; i++) {
				var s = this.sections[i];
				var relative = offset - s.address;
				if (relative >=0 && relative < s.size) {
					(<any>this)._currentSectionIndex = i;
					return relative + s.virtualAddress;
				}
			}

			return -1;
		}
	}

	export function getFileBufferReader(
		file: File,
		onsuccess: (BufferReader) => void,
		onfailure: (Error) => void ) {
		
		var reader = new FileReader();
		
		reader.onerror = onfailure;
		reader.onloadend = () => {
			if (reader.readyState != 2) {
				onfailure(reader.error);
				return;
			}

			var result: BufferReader;

			try {
				var resultArrayBuffer: ArrayBuffer;
				resultArrayBuffer = reader.result;

				result = new BufferReader(resultArrayBuffer);
			}
			catch (error) {
				onfailure(error);
			}

			onsuccess(result);
		};

		reader.readAsArrayBuffer(file);
	}

	declare var VBArray;

	export function getUrlBufferReader(
		url: string,
		onsuccess: (BufferReader) => void,
		onfailure: (Error) => void ) {

		var request = new XMLHttpRequest();
		request.open("GET", url, true);
		request.responseType = "arraybuffer";

		var requestLoadCompleteCalled = false;
		function requestLoadComplete() {
			if (requestLoadCompleteCalled)
				return;

			requestLoadCompleteCalled = true;

			var result: BufferReader;

			try {
				var response: ArrayBuffer = request.response;
				if (response) {
					var resultDataView = new DataView(response);
					result = new BufferReader(resultDataView);
				}
				else {
					var responseBody: number[] = new VBArray(request.responseBody).toArray();
					var result = new BufferReader(<any>responseBody);
				}
			}
			catch (error) {
				onfailure(error);
				return;
			}

			onsuccess(result);
		};

		request.onerror = onfailure;
		request.onloadend = () => requestLoadComplete;
		request.onreadystatechange = () => {
			if (request.readyState == 4) {
				requestLoadComplete();
			}
		};

		request.send();
	}

	export function bytesToHex(bytes: Uint8Array): string {
		if (!bytes)
			return null;
		
		var result = "";
		for (var i = 0; i < bytes.length; i++) {
			var hex = bytes[i].toString(16).toUpperCase();
			if (hex.length==1)
				hex = "0" + hex;
			result += hex;
		}
		return result;
	}

	export function formatEnum(value, type): string {
		if (!value) {
			if (typeof value == "null")
				return "null";
			else if (typeof value == "undefined")
				return "undefined";
		}

		var textValue = null;

		if (type._map) {
			textValue = type._map[value];

			if (!type._map_fixed) {
				// fix for typescript bug
				for (var e in type) {
					var num = type[e];
					if (typeof num=="number")
						type._map[num] = e;
				}
				type._map_fixed = true;

				textValue = type._map[value];
			}
		}
		
		if (textValue == null) {
			if (typeof value == "number") {
				var enumValues = [];
				var accountedEnumValueMask = 0;
				var zeroName = null;
				for (var kvValueStr in type._map) {
					var kvValue;
					try { kvValue = Number(kvValueStr); }
					catch (errorConverting) { continue; }

					if (kvValue == 0) {
						zeroName = kvKey;
						continue;
					}

					var kvKey = type._map[kvValueStr];
					if (typeof kvValue != "number")
						continue;

					if ((value & kvValue) == kvValue) {
						enumValues.push(kvKey);
						accountedEnumValueMask = accountedEnumValueMask | kvValue;
					}
				}

				var spill = value & accountedEnumValueMask;
				if (!spill)
					enumValues.push("#" + spill.toString(16).toUpperCase() + "h");

				if (enumValues.length == 0) {
					if (zeroName)
						textValue = zeroName;
					else
						textValue = "0";
				}
				else {
					textValue = enumValues.join('|');
				}
			}
			else {
				textValue = "enum:" + value;
			}
		}

		return textValue;
	}
}