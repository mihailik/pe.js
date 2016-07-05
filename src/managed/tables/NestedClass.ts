module pe.managed.tables {

  /** ECMA-335 II.22.32 */
  export class NestedClass {

    nestedClass: number = 0;
    enclosingClass: number = 0;

    read(reader: metadata.TableReader) {
      this.nestedClass = reader.readTypeDefTableIndex();
      this.enclosingClass = reader.readTypeDefTableIndex();
    }
  
    complete(reader: metadata.TableCompletionReader) {
      var nestedClass = <TypeDef>reader.lookupTable(metadata.TableKind.TypeDef, this.nestedClass);
      var enclosingClass = <TypeDef>reader.lookupTable(metadata.TableKind.TypeDef, this.enclosingClass);

      if (nestedClass.def && enclosingClass.def) {
        nestedClass.def.nestingParent = enclosingClass.def;
        enclosingClass.def.netedTypes.push(nestedClass.def);
      }
    }

  }

}