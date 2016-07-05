module pe.managed.tables {

  /** ECMA-335 II.22.12 */
  export class EventMap {

    parent: number = 0;
    eventList: number = 0;

    read(reader: metadata.TableReader) {
      this.parent = reader.readTypeDefTableIndex();
      this.eventList = reader.readEventTableIndex();
    }

    complete(reader: metadata.TableCompletionReader) {
      var type = <TypeDef>reader.lookupTable(metadata.TableKind.TypeDef, this.parent);
      var event = <Event>reader.lookupTable(metadata.TableKind.Event, this.eventList);

      if (type && event)
        type.def.events.push(event.def);
    }
  }

}