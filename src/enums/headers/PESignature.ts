module pe.headers {

  export enum PESignature {
    PE =
      "P".charCodeAt(0) +
      ("E".charCodeAt(0) << 8)
  }

}