module pe.managed.tables {

  /** ECMA-335 II.22.25 */
  export class MemberRef {
    TableKind = 0x0A;

    def: MethodInfo = null;

    class_: number = 0;
    name: number = 0;
    signature: number = 0;

    read(reader: metadata.TableReader) {
      this.class_ = reader.readMemberRefParent();
      this.name = reader.readString();
      this.signature = reader.readBlobIndex();
    }
  
    complete(reader: metadata.TableCompletionReader) {
      var name = reader.readString(this.name);
      var class_ = reader.lookupImplementation(this.class_);
      // TODO: assign the signatutre or what??
    }
  
  }

}