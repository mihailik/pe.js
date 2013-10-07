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
          this.expectedSize = pe.headers.DosHeader.size;
      }

      parseNext(buffer: Uint32Array, offset: number, size: number): number {
        while (true) {
          switch (this._parsePhase) {
            case 0:
              if (size < pe.headers.DosHeader.size) {
                return 0;
              }
              this.peFile.dosHeader = new pe.headers.DosHeader();
              this.peFile.dosHeader.populateFromUInt32Array(buffer, offset);
              offset += pe.headers.DosHeader.size;
              return offset;
  
            case 1:
              throw new Error("DOS header read.");
              
          }
          throw new Error("Fallen through.");
        }
      }
    }
  }

  export class PEFile {
    dosHeader: pe.headers.DosHeader = null;
    dosStub: Uint8Array = null;
    // TODO: implement remaining headers
    //peHeader: pe.headers.PEHeader = null;
    //optionalHeader: pe.headers.OptionalHeader = null;
    //sectionHeaders: pe.headers.SectionHeader[] = null;

    constructor(public path: string) {
    }
  }
}