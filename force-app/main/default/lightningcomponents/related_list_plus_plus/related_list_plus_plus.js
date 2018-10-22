import { Element, api, wire, track } from 'engine';
import { getRecordUi } from 'lightning-ui-api-record-ui';
import { getRecord } from 'lightning-ui-api-record';
// import { getObjectInfo } from 'lightning-ui-api-object-info';
import { generateRecordInputForUpdate, updateRecord } from 'lightning-ui-api-record';
import { showToast } from 'lightning-notifications-library';


import getRecordIds from '@salesforce/apex/relatedListQuery.getRecordIds';
import countRecords from '@salesforce/apex/relatedListQuery.countRecords';
// import { refreshApex } from '@salesforce/apex';

import { NavigationMixin } from 'lightning-navigation';
import { CurrentPageReference } from 'lightning-navigation';
import { showCustomModal } from 'lightning-overlay-library';

import { tableHelper } from 'c-data_table_helper';
import tmpl from './related_list_plus_plus.html';

export default class relatedListPlusPlus extends NavigationMixin(Element) {

  @api debug;
  @api recordId;
  @api title;
  @api iconName;

  @api maxRows;
  @api whereClause;

  @api relatedObjectType;
  @api relatedObject;
  @api relationshipField;

  @api recordIds;

  @api
  set editableFields(value){
    this._editableFields = value;
    this.columnChange();
  }
  get editableFields(){
    return this._editableFields;
  }
  @track _editableFields;

  @api
  set fields(value){
    this._fields = value;
    this.fieldsFormatted = value.map(field => `${this.relatedObjectType}.${field}`);
  }
  get fields(){ return this._fields}
  @track _fields;
  @track fieldsFormatted;

  @track masterObjectType;
  @track rowCount;
  @track rawRecords;
  @track rawData;
  @track data;
  @track columns;
  @track sortedBy;
  @track sortedDirection;
  @track draftValues = [];

  @track tableErrors = {
    rows: {},
    table: {}
  }

  constructor(){
    super();
    this.fields = [];
  }

  // W-5180125 https://gus.lightning.force.com/lightning/r/ADM_Work__c/a07B0000005PWlwIAG/view
  render(){
    return tmpl;
  }

  @wire(CurrentPageReference)
  pageRef;

  @wire(getRecord, { recordId: '$recordId', fields: [] })
  wiredRecord({ error, data }) {
    if (data) {
      this.masterObjectType = data.apiName;
    }
    window.console.log(`set master object to ${this.masterObjectType}`);
  }

  @wire(getRecordIds, { recordId: '$recordId', maxRows: '$maxRows', whereClause: '$whereClause', objectType: '$relatedObjectType', relationshipField: '$relationshipField' })
  wiredApexQuery({error, data}){
    if (error) {
      window.console.log(error);
    } else if (data) {
      window.console.log(JSON.parse(data));
      this.recordIds = JSON.parse(data).map( i => i.Id);
      window.console.log(JSON.parse(JSON.stringify(this.recordIds)));
    }
  }

  @wire(countRecords, { recordId: '$recordId', whereClause: '$whereClause', objectType: '$relatedObjectType', relationshipField: '$relationshipField' })
  rowCountQuery({ error, data }) {
    if (error) {
      window.console.log(error);
    } else if (data) {
      this.rowCount = data;
    }
  }

  @wire(getRecordUi, { recordIds: '$recordIds', layoutTypes: ['Compact'], modes: ['View'], optionalFields: '$fieldsFormatted'})
  childRecordsResult({ error, data }) {
    if (error) {
      window.console.log(error);
    } else if (data) {
      // window.console.log(`fieldsFormatted was set to ${this.fieldsFormatted} for this call`)
      // window.console.log(JSON.parse(JSON.stringify(data)));
      this.rawData =  data;
      this.columnChange();
    }
  }

  sort(event){
    window.console.log(JSON.parse(JSON.stringify(event)));
    // this.sortedBy = event.detail.fieldName;
    // this.sortedDirection = event.detail.sortDirection;
    // this.data = this.sortData(this.sortedBy, this.sortedDirection);
  }

  columnChange(){
    // window.console.log(`going to start tablehelper with fields = ${this.fields}`);
    this.rawRecords = tableHelper(this.fields, this.rawData, this.editableFields);
    this.data = this.rawRecords.data; //pure form, see bug 12 here https://gus.lightning.force.com/lightning/r/0D5B000000lKmFRKA0/view
    this.columns = this.rawRecords.columns;
    // this.sortedBy = this.columns[0].fieldName;
    // this.recordIds = JSON.parse(data).map(i => i.Id);
    window.console.log(this.rawRecords);
  }

  filterChange(event){

    if (event.target.value){
      const filteredResults = this.rawRecords.data.filter(record => {
        let matched = false;
        for (const field in record) {
          if (record[field] && record[field].toString().toLowerCase().includes(event.target.value.toLowerCase())) {
            matched = true;
          }
        }
        return matched;
      });
      // window.console.log(JSON.parse(JSON.stringify(filteredResults)));
      this.data = filteredResults;
    } else {
      // window.console.log('filter is blank...show all');
      this.data = this.rawRecords.data;
    }
  }


  async handleSave (event) {
    // this.saveDraftValues = event.detail.draftValues;
    window.console.log(JSON.parse(JSON.stringify(event.detail.draftValues)));
    this.draftValues = event.detail.draftValues;

    const recsToUpdate = event.detail.draftValues;

    for (const draft of recsToUpdate){
      try {
        const result = await updateRecord({ fields: draft });
        //remove from draft values
        this.draftValues = this.draftValues.filter( record => record.Id !== result.id);
        showToast({
          message: 'Update Successful',
          variant: 'success',
        });
      } catch (err){
        // do something useful with the error?
        window.console.log('there was an error!');
        window.console.log(err);
        const fieldErrors = err.details.body.output.fieldErrors;
        const firstError = fieldErrors[Object.getOwnPropertyNames(fieldErrors)[0]][0];

        window.console.log(JSON.parse(JSON.stringify(firstError)));
        showToast({
          message: firstError.message,
          variant: 'error',
        });
        // window.console.log(JSON.parse(JSON.stringify(this.tableErrors)));


      }
    }
  }

  viewAll(){
    this[NavigationMixin.Navigate]({
      type: 'standard__recordRelationshipPage',
      attributes: {
        recordId: this.recordId,
        objectApiName: this.masterObjectType,
        actionName: 'view',
        relationshipApiName: this.relatedObject
      }
    });
  }

  handleNew() {
    window.console.log(JSON.parse(JSON.stringify(this.template.querySelector(".modal-body"))));
    showCustomModal({
      header: `New ${this.relatedObjectType}`,
      body: this.template.querySelector(".modal-body"),
      // body: 'hey!',
      footer: `I am a footer`,
      showCloseButton: true,
      // cssClass: "my-modal,my-custom-class,my-other-class",
      closeCallback: () => {
        showToast({
          message: 'You closed the modal',
          variant: 'info',
        });
      }
    })
  }

}