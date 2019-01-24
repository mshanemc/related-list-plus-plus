import { LightningElement, api, track, wire } from 'lwc';
import { getRecordUi, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
// import { refreshApex } from '@salesforce/apex';

import getRecordIds from '@salesforce/apex/relatedListQuery.getRecordIds';
import countRecords from '@salesforce/apex/relatedListQuery.countRecords';

import { tableHelper } from 'c/dataTableHelper';
import { logger, logError } from 'c/lwcLogger';

export default class relatedListPlusPlus extends NavigationMixin(
    LightningElement,
) {
    @api recordId;
    @api objectApiName;
    @api configOpen;
    @api log;

    @track _config;
    @track fieldsFormatted;
    @track reactErrorMessage;
    @track createForm;

    source = relatedListPlusPlus;
    get showData() {
        return !this.reactErrorMessage && this.data;
    }

    @api
    set config(value) {
        logger(this.log, this.source, 'setting config', value);

        this._config = Object.assign({}, value);
        logger(
            this.log,
            this.source,
            'making the internal config',
            this._config,
        );

        if (
            this._config.selectedFields &&
            this._config.selectedFields.length > 0
        ) {
            this.reactToNewConfig();
        }
    }

    get config() {
        return this._config;
    }

    @track recordIds;
    @track rawRecords;
    @track rawData;
    @track data;
    @track columns;
    @track sortedBy;
    @track sortedDirection;
    @track draftValues = [];
    @track rowCount;

    @track tableErrors = {
        rows: {},
        table: {},
    };

    async reactToNewConfig() {
        // TODO run parallel
        try {
            const parallelResult = await Promise.all([
                countRecords({
                    recordId: this.recordId,
                    whereClause: this._config.whereClause,
                    objectType: this._config.relatedObjectType,
                    relationshipField: this._config.childRelationshipField,
                }),
                getRecordIds({
                    recordId: this.recordId,
                    maxRows: this._config.maxRows,
                    whereClause: this._config.whereClause,
                    objectType: this._config.relatedObjectType,
                    relationshipField: this._config.childRelationshipField,
                }),
            ]);
            this.rowCount = parallelResult[0];
            this.recordIds = JSON.parse(parallelResult[1]).map(i => i.Id);

            // rebuild fieldsFormatted
            if (this._config.selectedFields && this._config.relatedObjectType) {
                this.fieldsFormatted = this._config.selectedFields.map(
                    field => `${this._config.relatedObjectType}.${field}`,
                );
                logger(
                    true,
                    this.source,
                    'rl++ fieldsFormatted',
                    this.fieldsFormatted,
                );
            }
            this.reactErrorMessage = undefined;
        } catch (err) {
            this.recordIds = undefined;
            this.rowCount = undefined;
            this.fieldsFormatted = undefined;
            this.reactErrorMessage =
                'Your query could not be completed as written';
        }
    }

    @wire(getRecordUi, {
        recordIds: '$recordIds',
        layoutTypes: ['Compact'],
        modes: ['View'],
        optionalFields: '$fieldsFormatted',
    })
    wiredRawData({ error, data }) {
        if (error) {
            logError(true, this.source, 'error in wiredRawData, error');
        } else if (data) {
            this.rawData = data;
            this.columnChange();
        }
    }

    sort(event) {
        this.sortedBy = event.detail.fieldName;
        this.sortedDirection = event.detail.sortDirection;
        // this.data = this.sortData(this.sortedBy, this.sortedDirection);
        let sorted = Array.from(
            this.data.sort((a, b) => {
                // number stuff
                if (
                    typeof a[this.sortedBy] === 'number' ||
                    typeof b[this.sortedBy] === 'number'
                ) {
                    return a[this.sortedBy] - b[this.sortedBy];
                } else if (
                    typeof a[this.sortedBy] === 'string' ||
                    typeof b[this.sortedBy] === 'string'
                ) {
                    // string stuff
                    const x = a[this.sortedBy].toLowerCase();
                    const y = b[this.sortedBy].toLowerCase();
                    if (x < y) {
                        return -1;
                    } else if (x > y) {
                        return 1;
                    }
                    return 0;
                }
                window.console.log(
                    `could not match type for ${typeof a[this.sortedBy]}`,
                );
                return 0;
            }),
        );
        // window.console.log(JSON.parse(JSON.stringify(sorted)));
        if (this.sortedDirection === 'desc') {
            sorted = sorted.reverse();
        }
        this.data = sorted;
    }

    columnChange() {
        // window.console.log(`going to start tablehelper with fields = ${this.fields}`);
        this.rawRecords = tableHelper(
            this._config.selectedFields,
            this.rawData,
            this._config.editableFields,
        );
        this.data = this.rawRecords.data; //pure form, see bug 12 here https://gus.lightning.force.com/lightning/r/0D5B000000lKmFRKA0/view
        this.columns = this.rawRecords.columns;
        // this.sortedBy = this.columns[0].fieldName;
        // this.recordIds = JSON.parse(data).map(i => i.Id);
        // window.console.log(this.rawRecords);
    }

    filterChange(event) {
        if (event.target.value) {
            const filteredResults = this.rawRecords.data.filter(record => {
                let matched = false;
                for (const field in record) {
                    if (
                        record[field] &&
                        record[field]
                            .toString()
                            .toLowerCase()
                            .includes(event.target.value.toLowerCase())
                    ) {
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

    async updateRequest(draft) {
        try {
            const result = await updateRecord({ fields: draft });
            //remove from draft values
            this.draftValues = this.draftValues.filter(
                record => record.Id !== result.id,
            );
            this.dispatchEvent(
                new ShowToastEvent({
                    message: 'Update Successful',
                    variant: 'success',
                }),
            );
        } catch (err) {
            // do something useful with the error?
            window.console.log('there was an error!');
            window.console.log(err);
            const fieldErrors = err.details.body.output.fieldErrors;
            const firstError =
                fieldErrors[Object.getOwnPropertyNames(fieldErrors)[0]][0];

            window.console.log(JSON.parse(JSON.stringify(firstError)));
            this.dispatchEvent(
                new ShowToastEvent({
                    message: firstError.message,
                    variant: 'error',
                }),
            );
            // window.console.log(JSON.parse(JSON.stringify(this.tableErrors)));
        }
    }

    async handleSave(event) {
        // this.saveDraftValues = event.detail.draftValues;
        window.console.log(
            JSON.parse(JSON.stringify(event.detail.draftValues)),
        );
        this.draftValues = event.detail.draftValues;

        const recsToUpdate = event.detail.draftValues;

        const promises = [];

        for (const draft of recsToUpdate) {
            promises.push(this.updateRequest(draft));
        }

        await Promise.all(promises);
    }

    // opens the configuration component
    configure() {
        this.dispatchEvent(new Event('configure'));
        this.configOpen = true;
    }

    viewAll() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordRelationshipPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: this.objectApiName,
                relationshipApiName: this._config.relatedObjectLabel,
                actionName: 'view',
            },
        });
    }

    addNew() {
        this.createForm = true;
    }

    handleSubmit(event) {
        event.preventDefault();
        const fields = event.detail.fields;
        fields[this._config.childRelationshipField] = this.recordId;
        this.template.querySelector('lightning-record-form').submit(fields);
    }

    async handleRecordCreated() {
        this.createForm = false;
    }
}
