module pe.app1.loaded {

  export class AssemblyDetails {

    name: string = '';
    version: string = null;
    publicKey: string = null;

    runtimeVersion: string = '';
    specificRuntimeVersion: string = '';
    moduleName: string = '';
    mvid: string = '';


    constructor(assembly: managed.Assembly) {
      this.name = assembly.name;
      this.version = assembly.version;
      this.publicKey = assembly.publicKey;
      this.runtimeVersion = assembly.runtimeVersion;
      this.specificRuntimeVersion = assembly.specificRuntimeVersion;
      this.moduleName = assembly.moduleName;
      this.mvid = assembly.mvid;
    }

    //
  }

}