namespace tests.DosHeader_read_MZ2345 {
	var sampleBuf: any = (function () {
		var array = [("M").charCodeAt(0), ("Z").charCodeAt(0)];
		for (var i = 0; i < 64; i++) {
			if (i == 0 || i == 1)
				continue; // skipMZ

			array[i] = i;
		}
		return array;
	})();

	var global = (function () { return this; })();

	if ("ArrayBuffer" in global) {
		var arrb = new ArrayBuffer(sampleBuf.length);
		var vi = new DataView(arrb);
		for (var i = 0; i < sampleBuf.length; i++) {
			vi.setUint8(i, sampleBuf[i]);
		}

		sampleBuf = arrb;
	}

	export var bytes: ArrayBuffer = sampleBuf;


	export function read_succeeds() {
		var bi = new pe.io.BufferReader(bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);
	}

	export function read_mz_MZ() {
		var bi = new pe.io.BufferReader(bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.mz !== pe.headers.MZSignature.MZ)
			throw doh.mz;
	}

	export function read_cblp_770() {
		var bi = new pe.io.BufferReader(bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.cblp !== 770)
			throw doh.cblp;
	}

	export function read_cp_1284() {
		var bi = new pe.io.BufferReader(bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.cp !== 1284)
			throw doh.cp;
	}

	export function read_crlc_1798() {
		var bi = new pe.io.BufferReader(bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.crlc !== 1798)
			throw doh.crlc;
	}

	export function read_cparhdr_2312() {
		var bi = new pe.io.BufferReader(bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.cparhdr !== 2312)
			throw doh.cparhdr;
	}

	export function read_minalloc_2826() {
		var bi = new pe.io.BufferReader(bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.minalloc !== 2826)
			throw doh.minalloc;
	}

	export function read_maxalloc_3340() {
		var bi = new pe.io.BufferReader(bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.maxalloc !== 3340)
			throw doh.maxalloc;
	}

	export function read_ss_3854() {
		var bi = new pe.io.BufferReader(bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.ss !== 3854)
			throw doh.ss;
	}

	export function read_sp_4368() {
		var bi = new pe.io.BufferReader(bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.sp !== 4368)
			throw doh.sp;
	}

	export function read_csum_4882() {
		var bi = new pe.io.BufferReader(bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.csum !== 4882)
			throw doh.csum;
	}

	export function read_ip_5396() {
		var bi = new pe.io.BufferReader(bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.ip !== 5396)
			throw doh.ip;
	}

	export function read_cs_5910() {
		var bi = new pe.io.BufferReader(bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.cs !== 5910)
			throw doh.cs;
	}

	export function read_lfarc_6424() {
		var bi = new pe.io.BufferReader(bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.lfarlc !== 6424)
			throw doh.lfarlc;
	}

	export function read_ovno_6938() {
		var bi = new pe.io.BufferReader(bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.ovno !== 6938)
			throw doh.ovno;
	}

	export function read_res1_232221201F1E1D1C() {
		var bi = new pe.io.BufferReader(bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.res1.toString() !== "232221201F1E1D1Ch")
			throw doh.res1;
	}

	export function read_oemid_9508() {
		var bi = new pe.io.BufferReader(bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.oemid !== 9508)
			throw doh.oemid;
	}

	export function read_oeminfo_10022() {
		var bi = new pe.io.BufferReader(bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.oeminfo !== 10022)
			throw doh.oeminfo;
	}

	export function read_reserved_724183336_791555372_858927408_926299444_993671480() {
		var bi = new pe.io.BufferReader(bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		var reservedStr = doh.reserved.join(",");

		if (reservedStr !== "724183336,791555372,858927408,926299444,993671480")
			throw reservedStr;
	}

	export function read_dosHeader_lfanew_1061043516() {
		var bi = new pe.io.BufferReader(bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.lfanew !== 1061043516)
			throw doh.lfanew;
	}
}