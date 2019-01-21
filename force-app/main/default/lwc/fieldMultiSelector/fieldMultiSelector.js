/* eslint-disable no-console */
import { LightningElement, api, track, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';

export default class FieldMultiSelector extends LightningElement {
    @api objectApiName;

    // internals exposed to template
    @track availableFields;
    @track requiredOptions;
    @track editOptions;
    @track _selectedFields = [];

    // internal only to the js
    _relatedObjectMetadata;

    @api set initialSelectedFields(value) {
        if (value && value.length > 0 && this._selectedFields.length === 0) {
            console.log(
                'fieldMultiSelector: setting the initial selected fields',
            );
            this._selectedFields = Array.from(value);
        } else {
            console.log(
                'fieldMultiSelector: not setting the initial selected fields (already had)',
            );
        }
    }

    get initialSelectedFields() {
        return this._selectedFields || [];
    }

    // when a related object is selected, check out the fields
    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    wiredChildMasterData({ error, data }) {
        console.log(
            `fieldMultiSelector: running child object data wire for ${
                this.objectApiName
            }`,
        );
        if (data) {
            this._relatedObjectMetadata = data;
            console.log('fieldMultiSelector: related object info');
            console.log(JSON.parse(JSON.stringify(data)));
            this.availableFields = [];
            this.requiredOptions = [];

            // let's go through what we think are selected fields, and if they don't exist on the object, remove them from selected fields
            const allowedFields = [];
            this._selectedFields.forEach(fieldName => {
                if (data.fields[fieldName]) {
                    allowedFields.push(fieldName);
                } else {
                    console.log(`removing field ${fieldName}`);
                }
            });
            this._selectedFields = Array.from(allowedFields);

            // eslint-disable-next-line guard-for-in
            for (const field in data.fields) {
                // console.log(JSON.parse(JSON.stringify(data.fields[field])));
                this.availableFields.push({
                    label: data.fields[field].label,
                    value: field,
                });
                if (data.fields[field].nameField) {
                    // console.log(`adding ${field} to required`);
                    this.requiredOptions.push(field);
                    // console.log(`adding ${field} to selected`);
                }
            }

            // this.dispatchEvent(
            //     new CustomEvent('fieldchange', {
            //         detail: {
            //             fields: this.requiredOptions,
            //         },
            //     }),
            // );
        } else if (error) {
            console.log(JSON.parse(JSON.stringify(error)));
        }
    }

    fieldsSelection(event) {
        console.log('fieldMultiSelector: selected fields changed');
        // console.log(JSON.parse(JSON.stringify(event.detail.value)));
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