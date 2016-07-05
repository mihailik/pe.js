module pe.managed.tables {

  /** ECMA-335 II.22.10 */
  export class CustomAttribute {
    TableKind = 0x0C;

    parent: number = 0;
    type: number = 0;
    value: number = 0;

    read(reader: metadata.TableReader) {
      this.parent = reader.readHasCustomAttribute();
      this.type = reader.readCustomAttributeType();
      this.value = reader.readBlobIndex();
    }

    static fire = true;
    complete(reader: metadata.TableCompletionReader) {
      var attrParent = reader.lookupHasCustomAttribute(this.parent);
      var attrCtor = reader.lookupCustomAttributeType(this.type);

      if (attrParent && attrCtor) {
        if (!attrParent.customAttributes)
          attrParent.customAttributes = [];
        
        // TODO: create full attribute descriptor rather than just constructor
        attrParent.customAttributes.push(attrCtor);
      }
    }

  }

}