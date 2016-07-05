module pe.managed.tables {

  /** ECMA-335 II.22.13 */
  export class Event {

    def = new EventInfo();

    eventFlags: metadata.EventAttributes = 0;
    name: number = 0;
    eventType: number = 0;

    read(reader: metadata.TableReader) {
      this.eventFlags = reader.readShort();
      this.name = reader.readString();
      this.eventType = reader.readTypeDefOrRef();
    }
  
    complete(reader: metadata.TableCompletionReader) {
      var type = reader.lookupTypeDefOrRef(this.eventType);
      this.def.eventType = type;
    }

  }

}