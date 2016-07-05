module pe.managed.metadata {

  export class ClrMetadata {

    mdSignature: metadata.ClrMetadataSignature = metadata.ClrMetadataSignature.Signature;
    metadataVersion: string = "";
    runtimeVersion: string = "";
    mdReserved: number = 0;
    mdFlags: number = 0;
    streamCount: number = 0;

    read(clrDirReader: io.BufferReader) {
      this.mdSignature = clrDirReader.readInt();
      if (this.mdSignature != metadata.ClrMetadataSignature.Signature)
        throw new Error("Invalid CLR metadata signature field " + (<number>this.mdSignature).toString(16) + "h (expected " + (<number>metadata.ClrMetadataSignature.Signature).toString(16).toUpperCase() + "h).");

      this.metadataVersion = clrDirReader.readShort() + "." + clrDirReader.readShort();

      this.mdReserved = clrDirReader.readInt();

      var metadataStringVersionLength = clrDirReader.readInt();
      this.runtimeVersion = clrDirReader.readZeroFilledAscii(metadataStringVersionLength);

      this.mdFlags = clrDirReader.readShort();

      this.streamCount = clrDirReader.readShort();
    }
  }

}