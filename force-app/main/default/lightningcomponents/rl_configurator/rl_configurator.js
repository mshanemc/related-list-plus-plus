import { Element, track, api, wire } from 'engine';
import { getRecordUi } from 'lightning-ui-api-record-ui';

export default class rl_configurator extends Element {

  _recordId;
  @api set recordId(value) {
    this._recordId = [value];
  }
  @api get recordId() {
    return this._recordId[0];
  }

  @api title;
  @api iconName;
  @api maxRows;
  @track availableObjects = [];
  @api relatedObject;
  @track maxRows = 5;
  @track availableFields = [];
  @track selectedFields = [];

  @track output;


  @wire(getRecordUi, { recordIds: '$_recordId', layoutTypes: ['Full'], modes: ['View'] })
  objectChange({error, data}){
    if (error){
      window.console.log(error);
    } else if (data){
      const output = [];
      for (const objType in data.objectInfos){
        if (objType !== 'User'){
          // window.console.log(JSON.stringify(data.objectInfos[objType].childRelationships));
          data.objectInfos[objType].childRelationships.forEach( childObject => {
            // window.console.log(JSON.stringify(childObject));
            output.push({ value: childObject.relationshipName, label: `${childObject.relationshipName} (${childObject.childObjectApiName})`})
          });
        }
      }
      this.availableObjects = output;
    }
  }

  dataChange(evt){
    this[evt.target.name] = evt.target.value;
    this.output = `heard a datachange: ${evt.target.name} is now ${evt.target.value}`;
  }

  objectSelection(event) {
    this.relatedObject = event.detail.value;
  }

}