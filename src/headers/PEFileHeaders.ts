module pe.headers {

  export class PEFileHeaders {
    dosHeader: DosHeader = new DosHeader();
    dosStub: Uint8Array = <any>[];
    peHeader: PEHeader = new PEHeader();
    optionalHeader: OptionalHeader = new OptionalHeader();
    sectionHeaders: SectionHeader[] = [];

    toString() {
      var result =
        "dosHeader: " + (this.dosHeader ? this.dosHeader + "" : "null") + " " +
        "dosStub: " + (this.dosStub ? "[" + this.dosStub.length + "]" : "null") + " " +
        "peHeader: " + (this.peHeader ? "[" + this.peHeader.machine + "]" : "null") + " " +
        "optionalHeader: " + (this.optionalHeader ? "[" + formatEnum(this.optionalHeader.subsystem, Subsystem) + "," + this.optionalHeader.imageVersion + "]" : "null") + " " +
        "sectionHeaders: " + (this.sectionHeaders ? "[" + this.sectionHeaders.length + "]" : "null");
      return result;
    }

    read(reader: io.BufferReader, async?: AsyncCallback<PEFileHeaders>) {
      this._continueRead(reader, async, 0);
    }

    private _continueRead(reader: io.BufferReader, async: AsyncCallback<PEFileHeaders>, stage: number) {
      var dosHeaderSize: number = 64;
      var stageCount = 6;

      switch (stage) {
        case 0:
          if (!this.dosHeader)
            this.dosHeader = new DosHeader();
          this.dosHeader.read(reader);

          stage++;
          if (async && async.progress) {
            var continueLater = async.progress(stage, stageCount);
            if (continueLater) {
              continueLater(() => this._continueRead(reader, async, stage));
              return;
            }
          }

        case 1:
          var dosHeaderLength = this.dosHeader.lfanew - dosHeaderSize;
          if (dosHeaderLength > 0)
            this.dosStub = reader.readBytes(dosHeaderLength);
          else
            this.dosStub = null;

          stage++;
          if (async && async.progress) {
            var continueLater = async.progress(stage, stageCount);
            if (continueLater) {
              continueLater(() => this._continueRead(reader, async, stage));
              return;
            }
          }

        case 2:
          if (!this.peHeader)
            this.peHeader = new PEHeader();
          this.peHeader.read(reader);

          stage++;
          if (async && async.progress) {
            var continueLater = async.progress(stage, stageCount);
            if (continueLater) {
              continueLater(() => this._continueRead(reader, async, stage));
              return;
            }
          }

        case 3:
          if (!this.optionalHeader)
            this.optionalHeader = new OptionalHeader();
          this.optionalHeader.read(reader);

          stage++;
          if (async && async.progress) {
            var continueLater = async.progress(stage, stageCount);
            if (continueLater) {
              continueLater(() => this._continueRead(reader, async, stage));
              return;
            }
          }

        case 4:
          if (this.peHeader.numberOfSections > 0) {
            if (!this.sectionHeaders || this.sectionHeaders.length != this.peHeader.numberOfSections)
              this.sectionHeaders = Array(this.peHeader.numberOfSections);

            for (var i = 0; i < this.sectionHeaders.length; i++) {
              if (!this.sectionHeaders[i])
                this.sectionHeaders[i] = new SectionHeader();
              this.sectionHeaders[i].read(reader);
            }
          }

          if (async) {
            async(null, this);
          }
      }
    }
  }

}