module pe.managed {

  export class ParameterInfo {

    owner: MethodInfo = null;
    name: string = null;
    attributes: metadata.ParamAttributes = 0;
    customAttributes: any[] = null;

    parameterType: Type = null;

    toString() {
      return this.name;
    }
  }

}