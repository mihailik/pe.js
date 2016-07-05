module pe.managed {

  export class MethodInfo {

    owner: Type = null;
    
    name: string = '';
    attributes: metadata.MethodAttributes = 0;
    parameters: ParameterInfo[] = [];

    customAttributes: any[] = null;

    toString() {
      return this.name + '(' + this.parameters.join(', ') + ')';
    }
  }

}