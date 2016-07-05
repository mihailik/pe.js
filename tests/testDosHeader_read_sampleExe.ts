namespace tests.DosHeader_read_sampleExe {

	export function read_succeeds() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);
	}

	export function read_mz_MZ() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.mz !== pe.headers.MZSignature.MZ)
			throw doh.mz;
	}

	export function read_cblp_144() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.cblp !== 144)
			throw doh.cblp;
	}

	export function read_cp_3() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.cp !== 3)
			throw doh.cp;
	}

	export function read_crlc_0() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.crlc !== 0)
			throw doh.crlc;
	}

	export function read_cparhdr_4() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.cparhdr !== 4)
			throw doh.cparhdr;
	}

	export function read_minalloc_0() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.minalloc !== 0)
			throw doh.minalloc;
	}

	export function read_maxalloc_65535() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.maxalloc !== 65535)
			throw doh.maxalloc;
	}

	export function read_ss_0() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.ss !== 0)
			throw doh.ss;
	}

	export function read_sp_184() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.sp !== 184)
			throw doh.sp;
	}

	export function read_csum_0() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.csum !== 0)
			throw doh.csum;
	}

	export function read_ip_0() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.ip !== 0)
			throw doh.ip;
	}

	export function read_cs_0() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.cs !== 0)
			throw doh.cs;
	}

	export function read_lfarc_64() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.lfarlc !== 64)
			throw doh.lfarlc;
	}

	export function read_ovno_0() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.ovno !== 0)
			throw doh.ovno;
	}

	export function read_res1_0() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.res1.toString() !== "0h")
			throw doh.res1;
	}

	export function read_oemid_0() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.oemid !== 0)
			throw doh.oemid;
	}

	export function read_oeminfo_0() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.oeminfo !== 0)
			throw doh.oeminfo;
	}

	export function read_reserved_00000() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		var reservedStr = doh.reserved.join(",");

		if (reservedStr !== "0,0,0,0,0")
			throw reservedStr;
	}

	export function read_dosHeader_lfanew_128() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var doh = new pe.headers.DosHeader();
		doh.read(bi);

		if (doh.lfanew !== 128)
			throw doh.lfanew;
	}
}