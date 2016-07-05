module pe {

  /**
   * 64-bit integer
   */
  export class Long {
    constructor (
      public lo: number,
      public hi: number) {
    }

    toString() {
      var result: string;
      result = this.lo.toString(16);
      if (this.hi != 0) {
        result = ("0000").substring(result.length) + result;
        result = this.hi.toString(16) + result;
      }
      result = result.toUpperCase() + "h";
      return result;
    }
  }

}