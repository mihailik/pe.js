module pe.managed {

  export class EventInfo {
    owner: Type = null;
    name: string = null;
    eventType: Type = null;

    toString() {
    return (this.eventType ? this.name : this.name + ':' + this.eventType) + ' { add; remove }';
    }
}

}