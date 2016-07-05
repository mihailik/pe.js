module pe.managed.tables {

  /** ECMA-335 II.22.27 */
  export class MethodImpl {
    TableKind = 0x19;

    class_: number = 0;
    methodBody: number = 0;
    methodDeclaration: number = 0;

    read(reader: metadata.TableReader) {
      this.class_ = reader.readTypeDefTableIndex();
      this.methodBody = reader.readMethodDefOrRef();
      this.methodDeclaration = reader.readMethodDefOrRef();
    }
  
    complete(reader: metadata.TableCompletionReader) {
      var class_ = reader.lookupTable(metadata.TableKind.TypeDef, this.class_);
      var methodBody = reader.lookupMethodDefOrRef(this.methodBody);
      var methodDeclaration = reader.lookupMethodDefOrRef(this.methodDeclaration);

      if (class_ && class_.def) {
        var type = <Type>class_.def;
        // TODO: store that 'impl' stuff somewhere in the class?
      }
    }
  
  }

}