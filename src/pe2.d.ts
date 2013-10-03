declare module pe.io {
}
declare module pe.headers {
    class DosHeader {
        static size: number;
        public mz: MZSignature;
        /**
        * Bytes on last page of file.
        */
        public cblp: number;
        /**
        * Pages in file.
        */
        public cp: number;
        /**
        * Relocations.
        */
        public crlc: number;
        /**
        * Size of header in paragraphs.
        */
        public cparhdr: number;
        /**
        * Minimum extra paragraphs needed.
        */
        public minalloc: number;
        /**
        * Maximum extra paragraphs needed.
        */
        public maxalloc: number;
        /**
        * Initial (relative) SS value.
        */
        public ss: number;
        /**
        * Initial SP value.
        */
        public sp: number;
        /**
        * Checksum.
        */
        public csum: number;
        /**
        * Initial IP value.
        */
        public ip: number;
        /**
        * Initial (relative) CS value.
        */
        public cs: number;
        /**
        * File address of relocation table.
        */
        public lfarlc: number;
        /**
        * Overlay number.
        */
        public ovno: number;
        public res0: number;
        public res1: number;
        /**
        * OEM identifier (for e_oeminfo).
        */
        public oemid: number;
        /**
        * OEM information: number; e_oemid specific.
        */
        public oeminfo: number;
        public reserved0: number;
        public reserved1: number;
        public reserved2: number;
        public reserved3: number;
        public reserved4: number;
        /**
        * uint: File address of PE header.
        */
        public lfanew: number;
        public toString(): string;
        public populateFromUInt32Array(buf: Uint32Array, pos: number): void;
    }
    enum MZSignature {
        MZ,
    }
}
declare module pe {
    class LoaderContext {
        public loaded: PEFile[];
        public beginRead(path: string): LoaderContext.FileReader;
    }
    module LoaderContext {
        class FileReader {
            public context: LoaderContext;
            public size: number;
            public buffer: Uint32Array;
            public peFile: PEFile;
            private _parsePhase;
            constructor(context: LoaderContext, path: string);
            public parseNext(): number;
        }
    }
    class PEFile {
        public path: string;
        public dosHeader: pe.headers.DosHeader;
        public dosStub: Uint8Array;
        constructor(path: string);
    }
}
