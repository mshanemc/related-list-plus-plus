/* eslint-disable no-console */
import { LightningElement, api, track, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';

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

    @api set initialSelectedFields(value) {
        if (value && value.length > 0 && this._selectedFields.length === 0) {
            this.logger('setting the initial selected fields');
            this._selectedFields = Array.from(value);
        } else {
            this.logger(
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
        this.logger(`running child object data wire for ${this.objectApiName}`);
        if (data) {
            this._relatedObjectMetadata = data;
            this.logger('related object info', data);
            this.availableFields = [];
            this.requiredOptions = [];

            // let's go through what we think are selected fields, and if they don't exist on the object, remove them from selected fields
            const allowedFields = [];
            this._selectedFields.forEach(fieldName => {
                if (data.fields[fieldName]) {
                    allowedFields.push(fieldName);
                } else {
                    this.logger(`removing field ${fieldName}`);
                }
            });
            this._selectedFields = Array.from(allowedFields);
            this.logger('selected fields are', this._selectedFields);
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
            this.logger('available fields are', this.availableFields);
            this.logger('required fields are', this.requiredOptions);
        } else if (error) {
            console.error(JSON.parse(JSON.stringify(error)));
        }
    }

    fieldsSelection(event) {
        this.logger('selected fields changed');
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

    logger(message, data) {
        if (this.log) {
            try {
                if (data) {
                    console.log(
                        `fieldMultiSelector: ${message}`,
                        JSON.parse(JSON.stringify(data)),
                    );
                } else {
                    console.log(`fieldMultiSelector: ${message}`);
                }
            } catch (e) {
                if (data) {
                    console.log(`fieldMultiSelector: ${message}`, data);
                } else {
                    console.log(`fieldMultiSelector: ${message}`);
                }
            }
        }
    }
}
