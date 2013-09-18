/// <reference path="test_AppDomain_sampleExe.ts" />
/// <reference path="test_AppDomain_sample64Exe.ts" />
/// <reference path="test_AppDomain_monoCorlibDll.ts" />

/// <reference path="testDataDirectory.ts" />
/// <reference path="testLong.ts" />
/// <reference path="testDosHeader.ts" />
/// <reference path="testOptionalHeader.ts" />
/// <reference path="testPEFileHeaders.ts" />
/// <reference path="testPEHeader.ts" />
/// <reference path="testSectionHeader.ts" />

/// <reference path="testPEFileHeaders_read_sampleExe.ts" />
/// <reference path="testPEFileHeaders_read_sample64Exe.ts" />
/// <reference path="testDosHeader_read_sampleExe.ts" />
/// <reference path="testDosHeader_read_sample64Exe.ts" />
/// <reference path="testDosHeader_read_MZ2345.ts" />
/// <reference path="testPEHeader_read_sampleExe.ts" />
/// <reference path="testPEHeader_read_sample64Exe.ts" />
/// <reference path="testPEHeader_read_PE004567.ts" />
/// <reference path="testOptionalHeader_read_sampleExe.ts" />
/// <reference path="testOptionalHeader_read_sample64Exe.ts" />
/// <reference path="testOptionalHeader_read_NT322345.ts" />

/// <reference path="testDllImport_read_sampleExe.ts" />
/// <reference path="testDllImport_read_012345.ts" />

/// <reference path="testResourceDirectory.ts" />
/// <reference path="testResourceDirectory_read_sampleExe.ts" />

/// <reference path="testClrDirectory_old.ts" />
/// <reference path="testClrDirectory_read_sampleExe.ts" />
/// <reference path="testClrDirectory_read_sample64Exe.ts" />

/// <reference path="testClrMetadata.ts" />
/// <reference path="testClrMetadata_read_sampleExe.ts" />
/// <reference path="testClrMetadata_read_sample64Exe.ts" />

/// <reference path="testMetadataStreams_read_sampleExe.ts" />
/// <reference path="testMetadataStreams_read_sample64Exe.ts" />

/// <reference path="testTableStream_read_sampleExe.ts" />
/// <reference path="testTableStream_read_monoCorlibDll.ts" />

/// <reference path="test_AssemblyReader_sampleExe_old.ts" />
/// <reference path="test_AssemblyReader_monoCorlibDll.ts" />

/// <reference path="test_BufferReader.ts" />

/// <reference path="TestRunner.ts" />

TestRunner.runTests((function () { return this; })());
