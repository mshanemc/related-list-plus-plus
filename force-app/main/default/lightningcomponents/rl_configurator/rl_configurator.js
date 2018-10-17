import { Element, track, api, wire } from 'engine';
import { getRecord } from 'lightning-ui-api-record';
import { getObjectInfo } from 'lightning-ui-api-object-info';

export default class rl_configurator extends Element {

  @api recordId;
  @track _availableObjects = [];
  @track _availableFields = [];
  _childRelationshipField;

  @api title;
  @api iconName;
  @api maxRows;
  @api whereClause = '';

  @api
  get availableObjects() {
    return this._availableObjects;
  }


  @track masterObjectType;
  @track masterObjectInfo;
  @api relatedObject;
  @api relatedObjectType;

  @api
  get availableFields() {
    return this._availableFields;
  }

  @api selectedFields = [];


  @wire(getRecord, { recordId: '$recordId', fields: [] })
  wiredRecord({error, data}){
    if (data){
      this.masterObjectType = data.apiName;
    }
    window.console.log(`set master object to ${this.masterObjectType}`);
  }

  @wire(getObjectInfo, { objectApiName: '$masterObjectType' })
  wiredMasterMetadata ({ error, data }) {
    if (data) {
      this.masterObjectInfo = data;
      this._availableObjects = [];
      data.childRelationships.forEach( cr => {
        this._availableObjects.push({ label: `${cr.relationshipName} (${cr.childObjectApiName})`, value: cr.relationshipName})
      });
    }
  }

  @wire(getObjectInfo, { objectApiName: '$relatedObjectType' })
  wiredChildMasterData({ error, data }) {
    // window.console.log('running child master data');
    if (data) {
      this._availableFields = [];
      for (const field in data.fields){
        this._availableFields.push({ label: data.fields[field].label, value: field});
      }
      // TODO: alphabetize this?

    }
  }

  dataChange(event){
    this[event.target.name] = event.target.value;
    this.output = `heard a datachange: ${event.target.name} is now ${event.target.value}`;
    this.emitEventToPassdowm();
  }

  objectSelection(event) {
    this.relatedObject = event.detail.value;
    this.relatedObjectType = this.masterObjectInfo.childRelationships.find( cr => cr.relationshipName === event.detail.value).childObjectApiName;
    this.childRelationshipField = this.masterObjectInfo.childRelationships.find(cr => cr.relationshipName === event.detail.value).fieldName;
  }

  fieldsSelection(event){
    window.console.log(`field selection is ${event.detail.value}`);
    this.selectedFields = event.detail.value;
    this.emitEventToPassdowm();
  }

  emitEventToPassdowm(){
    window.console.log('firing an event from configurator!');
    const RLConfigChange = new CustomEvent('notification', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {
        title: this.title,
        maxRows: this.maxRows,
        iconName: this.iconName,
        relatedObject: this.relatedObject,
        relatedObjectType: this.relatedObjectType,
        selectedFields: this.selectedFields,
        childRelationshipField: this.childRelationshipField,
        whereClause: this.whereClause
      }
    });

    this.dispatchEvent(RLConfigChange);
  }

}