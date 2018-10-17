import { Element, api, wire, track } from 'engine';
import { getRecordUi } from 'lightning-ui-api-record-ui';
import { getRecord } from 'lightning-ui-api-record';
// import { getObjectInfo } from 'lightning-ui-api-object-info';


import getRecordIds from '@salesforce/apex/relatedListQuery.getRecordIds';
// import { refreshApex } from '@salesforce/apex';

import { tableHelper } from 'c-data_table_helper';

export default class relatedListPlusPlus extends Element {

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
  set fields(value){
    this._fields = value;
    this.fieldsFormatted = value.map(field => `${this.relatedObjectType}.${field}`);
  }
  get fields(){ return this._fields}
  @track _fields;
  @track fieldsFormatted;

  @track rawRecords;
  @track data;
  @track columns;
  @track sortedBy;
  @track sortedDirection;

  constructor(){
    super();
    this.fields = [];
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

  @wire(getRecordUi, { recordIds: '$recordIds', layoutTypes: ['Compact'], modes: ['View'], optionalFields: '$fieldsFormatted'})
  childRecordsResult({ error, data }) {
    if (error) {
      window.console.log(error);
    } else if (data) {
      window.console.log(`fieldsFormatted was set to ${this.fieldsFormatted} for this call`)
      window.console.log(JSON.parse(JSON.stringify(data)));
      window.console.log(`going to start tablehelper with fields = ${this.fields}`);
      this.rawRecords = tableHelper(this.fields, data);
      this.data = this.rawRecords.data; //pure form, see bug 12 here https://gus.lightning.force.com/lightning/r/0D5B000000lKmFRKA0/view
      // this.data = this.rawRecords.data.slice(0, this.maxRows); //remove slice when apex is fixed
      this.columns = this.rawRecords.columns;
      // this.sortedBy = this.columns[0].fieldName;
      // this.recordIds = JSON.parse(data).map(i => i.Id);
      window.console.log(this.rawRecords);
    }
  }

  sort(event){
    window.console.log(JSON.parse(JSON.stringify(event)));
    // this.sortedBy = event.detail.fieldName;
    // this.sortedDirection = event.detail.sortDirection;
    // this.data = this.sortData(this.sortedBy, this.sortedDirection);
  }


  filterChange(event){

    if (event.target.value){
      const filteredResults = this.rawRecords.data.filter(record => {
        let matched = false;
        for (const field in record) {
          if (record[field] && record[field].toString().includes(event.target.value)) {
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

}