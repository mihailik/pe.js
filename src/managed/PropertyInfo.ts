module pe.managed {

  export class PropertyInfo {
    owner: Type = null;
    name: string = null;
    propertyType: Type = null;
    attributes: metadata.PropertyAttributes = 0;

    customAttributes: any[] = null;
  }

}