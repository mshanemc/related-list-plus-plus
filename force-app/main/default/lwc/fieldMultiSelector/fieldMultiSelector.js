import { LightningElement, api, track, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { logger, logError } from 'c/lwcLogger';

export default class FieldMultiSelector extends LightningElement {
    @api objectApiName;
    @api log;

    // internals exposed to template
    @track availableFields;
    @track requiredOptions;
    @track editOptions;
    @track _selectedFields = [];

    // internal only to the js
    _relatedObjectMetadata;
    source = 'fieldMultiSelector';

    @api set initialSelectedFields(value) {
        if (value && value.length > 0 && this._selectedFields.length === 0) {
            logger(
                this.log,
                this.source,
                'setting the initial selected fields',
            );
            this._selectedFields = Array.from(value);
        } else {
            logger(
                this.log,
                this.source,
                'not setting the initial selected fields (already had)',
            );
        }
    }

    get initialSelectedFields() {
        return this._selectedFields || [];
    }

    // when a related object is selected, check out the fields
    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    wiredChildMasterData({ error, data }) {
        logger(
            this.log,
            this.source,
            `running child object data wire for ${this.objectApiName}`,
        );
        if (data) {
            this._relatedObjectMetadata = data;
            logger(this.log, this.source, 'related object info', data);
            this.availableFields = [];
            this.requiredOptions = [];

            // let's go through what we think are selected fields, and if they don't exist on the object, remove them from selected fields
            const allowedFields = [];
            this._selectedFields.forEach(fieldName => {
                if (data.fields[fieldName]) {
                    allowedFields.push(fieldName);
                } else {
                    logger(this.log, `removing field ${fieldName}`);
                }
            });
            this._selectedFields = Array.from(allowedFields);
            logger(
                this.log,
                this.source,
                'selected fields are',
                this._selectedFields,
            );
            // eslint-disable-next-line guard-for-in
            for (const field in data.fields) {
                this.availableFields.push({
                    label: data.fields[field].label,
                    value: field,
                });
                if (data.fields[field].nameField) {
                    this.requiredOptions.push(field);
                }
            }
            logger(
                this.log,
                this.source,
                'available fields are',
                this.availableFields,
            );
            logger(
                this.log,
                this.source,
                'required fields are',
                this.requiredOptions,
            );
        } else if (error) {
            logError(this.log, this.source, error);
        }
    }

    fieldsSelection(event) {
        logger(this.log, this.source, 'selected fields changed');
        if (event.detail.value.length > 0) {
            this.dispatchEvent(
                new CustomEvent('fieldchange', {
                    detail: {
                        fields: event.detail.value,
                    },
                }),
            );
        }
    }
}
