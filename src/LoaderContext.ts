/// <reference path='headers2.ts' />

module pe {

  /*
   * Logical 'universe' used to resolve inter-file references.
   */
  export class LoaderContext {
    loaded: PEFile[] = [];

    beginRead(path: string): LoaderContext.FileReader {
      return new LoaderContext.FileReader(this, path);
    }
  }

  export module LoaderContext {

    /*
     * State of reading a particular PE file.
     */
    export class FileReader {
      size: number;
      buffer: Uint32Array = null;
      peFile: PEFile;

      private _parsePhase: number = 0;

      constructor(public context: LoaderContext, path: string) {
          this.peFile = new PEFile(path);
      }

      /*
       * @see size property on input contains the number of 32-bit integers populated with data in @see buffer
       * @return number of 32-bit integers expected 
       */
      parseNext(): number {
        var offset = 0;
        var size = this.size;

        switch (this._parsePhase) {
          case 0:
            if (size < pe.headers.DosHeader.size) {
              // TODO: copy all back to zero offset
              
              this.size = size;
              return pe.headers.DosHeader.size - size;
            }
            this.peFile.dosHeader = new pe.headers.DosHeader();
            this.peFile.dosHeader.populateFromUInt32Array(this.buffer, offset);
            break;

          case 1:
            break;
            
        }
        throw null;
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