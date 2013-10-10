/// <reference path='headers2.ts' />

module pe {

  /*
   * Logical 'universe' used to resolve inter-file references.
   */
  export class LoaderContext {
    loaded: PEFile[] = [];

    constructor() {
    }

    beginRead(path: string): LoaderContext.FileReader {
      return new LoaderContext.FileReader(this, path);
    }
  }

  export module LoaderContext {

    /*
     * State of reading a particular PE file.
     */
    export class FileReader {
      expectedSize: number;
      peFile: PEFile;

      private _parsePhase: number = 0;

      constructor(public context: LoaderContext, path: string) {
          this.peFile = new PEFile(path);
          this.expectedSize = pe.headers.DosHeader.byteSize/4;
      }

      parseNext(buffer: Uint32Array, offset: number, size: number): number {
        while (true) {
          switch (this._parsePhase) {
            case 0:
              if (size < pe.headers.DosHeader.byteSize/4)
                return 0;

              this.peFile.dosHeader = new pe.headers.DosHeader();
              this.peFile.dosHeader.populateFromUInt32Array(buffer, offset);
              var readCount = pe.headers.DosHeader.byteSize/4;

              this.expectedSize = (this.peFile.dosHeader.lfanew - pe.headers.DosHeader.byteSize)/4;

              if (this.expectedSize<=0) {
                this._parsePhase = 2;
                readCount += this.expectedSize;
                this.expectedSize = pe.headers.PEHeader.byteSize/4;
              }
              else {
                this._parsePhase = 1;
              }

              return readCount;
  
            case 1:
              var stubSize = (this.peFile.dosHeader.lfanew - pe.headers.DosHeader.byteSize)/4;

              if (size < stubSize)
                return 0;

              try {
                this.peFile.dosStub = new Uint32Array(stubSize);
              }
              catch (error) {
                this.peFile.dosStub = <any>[];
              }
              for (var i = 0; i < stubSize; i++) {
                this.peFile.dosStub[i] = buffer[offset+i];
              }
              this.expectedSize = pe.headers.PEHeader.byteSize/4;
              return stubSize;
              
            case 2:
              if (size < pe.headers.PEHeader.byteSize/4)
                return 0;
              
              this.peFile.peHeader = new pe.headers.PEHeader();
              this.peFile.peHeader.populateFromUInt32Array(buffer, offset);
              break;
              
          }
          throw new Error("Fallen through.");
        }
      }
    }
  }

  export class PEFile {
    dosHeader: pe.headers.DosHeader = null;
    dosStub: Uint8Array = null;
    peHeader: pe.headers.PEHeader = null;
    // TODO: implement remaining headers
    //optionalHeader: pe.headers.OptionalHeader = null;
    //sectionHeaders: pe.headers.SectionHeader[] = null;

    constructor(public path: string) {
    }
  }
}