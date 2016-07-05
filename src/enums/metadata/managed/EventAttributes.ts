module pe.managed.metadata {

  /**
   * [ECMA-335 para23.1.4]
   */
  export enum EventAttributes {

    /**
     * Event is special.
     */
    SpecialName = 0x0200,

    /**
     * CLI provides 'special' behavior, depending upon the name of the event.
     */
    RTSpecialName = 0x0400,
  }

}