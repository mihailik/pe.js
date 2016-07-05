module pe.managed.tables {

  /** ECMA-335 II.22.30 */
  export class Module {

    def = { generation: 0, moduleName: '', mvid: '', encId: '', encBaseId: '' };

    name: number = 0;
    mvid: number = 0;
    encId: number = 0;
    encBaseId: number = 0;

    read(reader: metadata.TableReader) {
      this.def.generation = reader.readShort();
      this.name = reader.readString();
      this.mvid = reader.readGuid();
      this.encId = reader.readGuid();
      this.encBaseId = reader.readGuid();
    }

    complete(reader: metadata.TableCompletionReader) {
      this.def.moduleName = reader.readString(this.name);
      this.def.mvid = reader.readGuid(this.mvid);
      this.def.encId = reader.readGuid(this.encId);
      this.def.encBaseId = reader.readGuid(this.encBaseId);
    }
  }

}