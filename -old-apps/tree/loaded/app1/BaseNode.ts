module pe.app1.loaded {

  export class BaseNode {

    isSelected = ko.observable(false);
    details: any = null;

    constructor(public parent: BaseNodeWithChildren) {
    }

    click() { }

  }


  export class BaseNodeWithChildren extends BaseNode {

    isExpanded = ko.observable(false);

    private _isPopulated = false;

    constructor(parent: BaseNodeWithChildren) {
      super(parent);
      this.isExpanded.subscribe(value => this.populateOnExpand());
    }

    populateOnExpand() {
    }

    private _isExpandedChanged() {
      if (!this._isPopulated) {
        this._isPopulated = true;
        this.populateOnExpand();
      }
    }

  }

}