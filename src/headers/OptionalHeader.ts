module pe.headers {

  export class OptionalHeader {

    static intSize32 = 6;
    static intSize64 = 10;

    /** Differentiates 32-bit images from 64-bit. */
    peMagic: PEMagic = PEMagic.NT32;

    linkerVersion: string = "";

    /**
     * The size of the code section, in bytes, or the sum of all such sections if there are multiple code sections.
     */
    sizeOfCode: number = 0;

    /**
     * The size of the initialized data section, in bytes, or the sum of all such sections if there are multiple initialized data sections.
     */
    sizeOfInitializedData: number = 0;

    /**
     * The size of the uninitialized data section, in bytes, or the sum of all such sections if there are multiple uninitialized data sections.
     */
    sizeOfUninitializedData: number = 0;

    /**
     * A pointer to the entry point function, relative to the image base address.
     * For executable files, this is the starting address.
     * For device drivers, this is the address of the initialization function.
     * The entry point function is optional for DLLs.
     * When no entry point is present, this member is zero.
     */
    addressOfEntryPoint: number = 0;

    /**
     * A pointer to the beginning of the code section, relative to the image base.
     */
    baseOfCode: number = 0x2000;

    /**
     * A pointer to the beginning of the data section, relative to the image base.
     */
    baseOfData: number = 0x4000;

    /**
     * Uint or 64-bit long.
     * The preferred address of the first byte of the image when it is loaded in memory.
     * This value is a multiple of 64K bytes.
     * The default value for DLLs is 0x10000000.
     * The default value for applications is 0x00400000,
     * except on Windows CE where it is 0x00010000.
     */
    imageBase: any = 0x4000;

    /**
     * The alignment of sections loaded in memory, in bytes.
     * This value must be greater than or equal to the FileAlignment member.
     * The default value is the page size for the system.
     */
    sectionAlignment: number = 0x2000;

    /**
     * The alignment of the raw data of sections in the image file, in bytes.
     * The value should be a power of 2 between 512 and 64K (inclusive).
     * The default is 512.
     * If the <see cref="SectionAlignment"/> member is less than the system page size,
     * this member must be the same as <see cref="SectionAlignment"/>.
     */
    fileAlignment: number = 0x200;

    /**
     * The version of the required operating system.
     */
    operatingSystemVersion: string = "";

    /**
     * The version of the image.
     */
    imageVersion: string = "";

    /**
     * The version of the subsystem.
     */
    subsystemVersion: string = "";

    /**
     * This member is reserved and must be 0.
     */
    win32VersionValue: number = 0;

    /**
     * The size of the image, in bytes, including all headers. Must be a multiple of <see cref="SectionAlignment"/>.
     */
    sizeOfImage: number = 0;

    /**
     * The combined size of the MS-DOS stub, the PE header, and the section headers,
     * rounded to a multiple of the value specified in the FileAlignment member.
     */
    sizeOfHeaders: number = 0;

    /**
     * The image file checksum.
     * The following files are validated at load time:
     * all drivers,
     * any DLL loaded at boot time,
     * and any DLL loaded into a critical system process.
     */
    checkSum: number = 0;

    /**
     * The subsystem required to run this image.
     */
    subsystem: Subsystem = Subsystem.WindowsCUI;

    /**
     * The DLL characteristics of the image.
     */
    dllCharacteristics: DllCharacteristics = DllCharacteristics.NxCompatible;

    /**
     * Uint or 64 bit long.
     * The number of bytes to reserve for the stack.
     * Only the memory specified by the <see cref="SizeOfStackCommit"/> member is committed at load time;
     * the rest is made available one page at a time until this reserve size is reached.
     */
    sizeOfStackReserve: any = 0x100000;

    /**
     * Uint or 64 bit long.
     * The number of bytes to commit for the stack.
     */
    sizeOfStackCommit: any = 0x1000;

    /**
     * Uint or 64 bit long.
     * The number of bytes to reserve for the local heap.
     * Only the memory specified by the <see cref="SizeOfHeapCommit"/> member is committed at load time;
     * the rest is made available one page at a time until this reserve size is reached.
     */
    sizeOfHeapReserve: any = 0x100000;

    /**
     * Uint or 64 bit long.
     * The number of bytes to commit for the local heap.
     */
    sizeOfHeapCommit: any = 0x1000;

    /**
     * This member is obsolete.
     */
    loaderFlags: number = 0;

    /**
     * The number of directory entries in the remainder of the optional header.
     * Each entry describes a location and size.
     */
    numberOfRvaAndSizes: number = 16;

    dataDirectories: AddressRange[] = [];

    toString() {
      var result = [];

      var peMagicText = formatEnum(this.peMagic, PEMagic);
      if (peMagicText)
        result.push(peMagicText);
        
      var subsystemText = formatEnum(this.subsystem, Subsystem);
      if (subsystemText)
        result.push(subsystemText);

      var dllCharacteristicsText = formatEnum(this.dllCharacteristics, DllCharacteristics);
      if (dllCharacteristicsText)
        result.push(dllCharacteristicsText);

      var nonzeroDataDirectoriesText = [];
      if (this.dataDirectories) {
        for (var i = 0; i < this.dataDirectories.length; i++) {
          if (!this.dataDirectories[i] || this.dataDirectories[i].size <= 0)
            continue;

          var kind = formatEnum(i, DataDirectoryKind);
          nonzeroDataDirectoriesText.push(kind);
        }
      }

      result.push(
        "dataDirectories[" +
        nonzeroDataDirectoriesText.join(",") + "]");

      var resultText = result.join(" ");

      return resultText;
    }

    read(reader: io.BufferReader) {
      this.peMagic = <PEMagic>reader.readShort();

      if (this.peMagic != PEMagic.NT32
        && this.peMagic != PEMagic.NT64)
        throw Error("Unsupported PE magic value " + (<number>this.peMagic).toString(16).toUpperCase() + "h.");

      this.linkerVersion = reader.readByte() + "." + reader.readByte();

      this.sizeOfCode = reader.readInt();
      this.sizeOfInitializedData = reader.readInt();
      this.sizeOfUninitializedData = reader.readInt();
      this.addressOfEntryPoint = reader.readInt();
      this.baseOfCode = reader.readInt();

      if (this.peMagic == PEMagic.NT32) {
        this.baseOfData = reader.readInt();
        this.imageBase = reader.readInt();
      }
      else {
        this.imageBase = reader.readLong();
      }

      this.sectionAlignment = reader.readInt();
      this.fileAlignment = reader.readInt();
      this.operatingSystemVersion = reader.readShort() + "." + reader.readShort();
      this.imageVersion = reader.readShort() + "." + reader.readShort();
      this.subsystemVersion = reader.readShort() + "." + reader.readShort();
      this.win32VersionValue = reader.readInt();
      this.sizeOfImage = reader.readInt();
      this.sizeOfHeaders = reader.readInt();
      this.checkSum = reader.readInt();
      this.subsystem = <Subsystem>reader.readShort();
      this.dllCharacteristics = <DllCharacteristics>reader.readShort();

      if (this.peMagic == PEMagic.NT32) {
        this.sizeOfStackReserve = reader.readInt();
        this.sizeOfStackCommit = reader.readInt();
        this.sizeOfHeapReserve = reader.readInt();
        this.sizeOfHeapCommit = reader.readInt();
      }
      else {
        this.sizeOfStackReserve = reader.readLong();
        this.sizeOfStackCommit = reader.readLong();
        this.sizeOfHeapReserve = reader.readLong();
        this.sizeOfHeapCommit = reader.readLong();
      }

      this.loaderFlags = reader.readInt();
      this.numberOfRvaAndSizes = reader.readInt();

      if (this.dataDirectories == null
        || this.dataDirectories.length != this.numberOfRvaAndSizes)
        this.dataDirectories = <AddressRange[]>(Array(this.numberOfRvaAndSizes));

      for (var i = 0; i < this.numberOfRvaAndSizes; i++) {
        if (this.dataDirectories[i]) {
          this.dataDirectories[i].address = reader.readInt();
          this.dataDirectories[i].size = reader.readInt();
        }
        else {
          this.dataDirectories[i] = new AddressRange(reader.readInt(), reader.readInt());
        }
      }
    }

  }
}