module pe.managed.tables {

  /** ECMA-335 II.22.35 */
  export class PropertyMap {

    parent: number = 0;
    propertyList: number = 0;

    read(reader: metadata.TableReader) {
      this.parent = reader.readTypeDefTableIndex();
      this.propertyList = reader.readPropertyTableIndex();
    }
  
    complete(reader: metadata.TableCompletionReader) {
      var parent = <TypeDef>reader.lookupTable(metadata.TableKind.TypeDef, this.parent);
      var property = <Property>reader.lookupTable(metadata.TableKind.Property, this.propertyList);
      
      // TODO: now what?
    }

  }

}