module pe.headers {

  export enum MZSignature {
    MZ =
      "M".charCodeAt(0) +
      ("Z".charCodeAt(0) << 8)
  }

}