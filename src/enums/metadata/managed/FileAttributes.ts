module pe.managed.metadata {

  /**
   * [ECMA-335 para23.1.6]
   */
  export enum FileAttributes {

    /**
     * This is not a resource file.
     */
    ContainsMetaData = 0x0000,

    /**
     * This is a resource file or other non-metadata-containing file.
     */
    ContainsNoMetaData = 0x0001
  }


}