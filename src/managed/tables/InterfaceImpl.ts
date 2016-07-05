module pe.managed.tables {

  /** ECMA-335 II.22.33 */
  export class InterfaceImpl {

    class_: number = 0;
    interface_: number = 0;

    read(reader: metadata.TableReader) {
      this.class_ = reader.readTypeDefTableIndex();
      this.interface_ = reader.readTypeDefOrRef();
    }

    complete(reader: metadata.TableCompletionReader) {
      var class_ = reader.lookupTable(metadata.TableKind.TypeDef, this.class_);
      var interface_ = reader.lookupTypeDefOrRef(this.interface_);

      if (class_ && interface_ && class_.def) {
        var type = <Type>class_.def;
        type.interfaces.push(interface_);
      }
    }
  }

}