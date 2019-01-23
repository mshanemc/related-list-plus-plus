/* eslint-disable no-console */
import { LightningElement, api, wire, track } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';

export default class FieldEditabilitySelector extends LightningElement {
    @api objectApiName;
    _editableFields = [];
    _relatedObjectMetadata;
    _possibleFields;
    @track editableOptions = [];

    // array of field API names that could be editable if the user wants them to be
    @api get possibleFields() {
        return this._possibleFields;
    }

    set possibleFields(value) {
        console.log(
            `FieldEditabilitySelector: possible fields set to ${value}`,
        );
        this._possibleFields = Array.from(value);
        this.generateFieldOptions();
    }

    @api get initialEditableFields() {
        return this._editableFields;
    }

    set initialEditableFields(value) {
        if (value && value.length > 0 && this._editableFields.length === 0) {
            console.log(
                `FieldEditabilitySelector: setting the initial editable fields to ${value}`,
            );
            this._editableFields = Array.from(value);
            this.generateFieldOptions();
        } else {
            console.log(
                'FieldEditabilitySelector: not setting the initial editable fields (already had some)',
            );
        }
    }

    // when a related object is selected, check out the fields
    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    wiredChildMasterData({ error, data }) {
        console.log(
            `FieldEditabilitySelector: running child object data wire for ${
                this.objectApiName
            }`,
        );
        if (data) {
            this._relatedObjectMetadata = data;
            this.generateFieldOptions();
        } else if (error) {
            console.log(JSON.parse(JSON.stringify(error)));
        }
    }

    handleChange(event) {
        console.log('FieldEditabilitySelector: selected fields changed');
        console.log(JSON.parse(JSON.stringify(event.detail.value)));
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

    generateFieldOptions() {
        if (!this._relatedObjectMetadata) {
            console.log('FieldEditabilitySelector: metadata not found');
            return;
        }

        if (
            !this._possibleFields ||
            (!this._possibleFields && this._possibleFields.length === 0)
        ) {
            console.log('FieldEditabilitySelector: no possible fields');
            return;
        }

        const editableOptions = [];
        // iterate through the fields on the object
        // eslint-disable-next-line guard-for-in
        for (const field in this._relatedObjectMetadata.fields) {
            // console.log(
            //     JSON.parse(
            //         JSON.stringify(this._relatedObjectMetadata.fields[field]),
            //     ),
            // );
            if (
                this.checkEditability(field, this._relatedObjectMetadata) &&
                this.possibleFields.includes(field)
            ) {
                editableOptions.push({
                    label: this._relatedObjectMetadata.fields[field].label,
                    value: field,
                });
            }
        }
        this.editableOptions = Array.from(editableOptions);
        console.log(
            'setting editable options to',
            JSON.parse(JSON.stringify(this.editableOptions)),
        );
        // take the editableOptions options...if it was already marked editable, put in the selected list
        editableOptions.forEach(field => {
            if (this._editableFields.includes(field.value)) {
                // make it selected somehow?
            }
        });

        console.log(
            'setting editable fields to',
            JSON.parse(JSON.stringify(this._editableFields)),
        );
    }

    // returns boolean
    checkEditability(fieldName, md) {
        // get the field from the recordData
        const fieldMD = md.fields[fieldName];
        // not the name field, not calculated
        return (
            !fieldMD.nameField &&
            !fieldMD.compound &&
            fieldMD.controllingFields.length === 0 &&
            !fieldMD.htmlFormatted &&
            !fieldMD.reference &&
            fieldMD.updateable
        );
        // window.console.log(JSON.parse(JSON.stringify(newEditOoptions)));
    }

    // window.console.log(JSON.parse(JSON.stringify(newEditOptions)));
    // window.console.log(JSON.stringify(newEditOptions));
}
