module pe.managed.tables {

  /** ECMA-335 II.22.21 */
  export class GenericParamConstraint {

    owner: number = 0;
    constraint: number = 0;

    read(reader: metadata.TableReader) {
      this.owner = reader.readGenericParamTableIndex();
      this.constraint = reader.readTypeDefOrRef();
    }

    complete(reader: metadata.TableCompletionReader) {
      var genericParam = reader.lookupTable(metadata.TableKind.GenericParam, this.owner);
      var constrType = reader.lookupTypeDefOrRef(this.constraint);
      // TODO: store constraint there
    }
  }

}