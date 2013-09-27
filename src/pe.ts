/// <reference path="headers.ts" />
/// <reference path="unmanaged.ts" />
/// <reference path="managed.ts" />
/// <reference path="managed2.ts" />
/// <reference path="io.ts" />

module pe {

  /*
   * Logical 'universe' used to resolve inter-file references.
   */
  export class LoaderContext {
    loaded: PEFile[] = [];

    beginRead(path: string): LoaderContext.FileReader {
      return new LoaderContext.FileReader(path);
    }
  }

  export module LoaderContext {

    /*
     * State of reading a particular PE file.
     */
    export class FileReader {
      size: number;
      buffer: Uint32Array = null;

      private _parsePhase: number = 0;

      constructor(public path: string) {
      }

      /*
       * @see size property on input contains the number of 32-bit integers populated with data in @see buffer
       * @return number of 32-bit integers expected 
       */
      parseNext(): number {
        switch (this._parsePhase) {
          case 0:
            if (this.size < pe.headers.DosHeader.size)
              return pe.headers.DosHeader.size - this.size;
            
            break;
          case 1:
            break;
            
        }
        throw null;
      }
    }
  }

  export interface PEFile {
    path: string;

    dosHeader: pe.headers.DosHeader;
    dosStub: Uint8Array;
    peHeader: pe.headers.PEHeader;
    optionalHeader: pe.headers.OptionalHeader;
    sectionHeaders: pe.headers.SectionHeader[];

  }
}