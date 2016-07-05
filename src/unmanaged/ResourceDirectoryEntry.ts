module pe.unmanaged {

  export class ResourceDirectoryEntry {
    name: string = "";
    integerId: number = 0;

    directory: ResourceDirectory = new ResourceDirectory();

    toString() {
      return (this.name ? this.name + " " : "") + this.integerId +
        (this.directory ? 
          "[" +
            (this.directory.dataEntries ? this.directory.dataEntries.length : 0) +
            (this.directory.subdirectories ? this.directory.subdirectories.length : 0) +
          "]" :
          "[null]");
    }
  }

}