module pe.unmanaged {

  export class ResourceDataEntry {
    name: string = "";
    integerId: number = 0;
    dataRva: number = 0;
    size: number = 0;
    codepage: number = 0;
    reserved: number = 0;

    toString() {
      return (this.name ? this.name + " " : "") + this.integerId;
    }
  }

}