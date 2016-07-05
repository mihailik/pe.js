module pe.managed {

  export class FieldInfo {
    attributes: metadata.FieldAttributes = 0;
    name: string = "";
    fieldType: Type = null;
    
    fieldOffset: number = null;

    customAttributes: any[] = null;

    toString() {
      return this.fieldType ? this.name : this.name + ':' + this.fieldType;
    }
  }

}