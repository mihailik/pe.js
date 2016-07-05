module pe.managed.tables {

  /** ECMA-335 II.22.28 */
  export class MethodSemantics {
    TableKind = 0x18;

    semantics: metadata.MethodSemanticsAttributes = 0;
    method: number = 0;
    association: number = 0;

    read(reader: metadata.TableReader) {
      this.semantics = reader.readShort();
      this.method = reader.readMethodDefTableIndex();
      this.association = reader.readHasSemantics();
    }
  
    complete(reader: metadata.TableCompletionReader) {
      var method = <MethodDef>reader.lookupTable(metadata.TableKind.MethodDef, this.method);
      var associatio = reader.lookupHasSemantics(this.association);

      if (method && method.def) {
        // TODO: store that 'impl' stuff somewhere in the class?
      }
    }

  }

}