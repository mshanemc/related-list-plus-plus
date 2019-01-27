import { LightningElement, api, wire, track } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { logger, logError } from 'c/lwcLogger';

export default class FieldEditabilitySelector extends LightningElement {
    @api objectApiName;
    @api log;

    _editableFields = [];
    _relatedObjectMetadata;
    _possibleFields;
    @track editableOptions = [];

    // array of field API names that could be editable if the user wants them to be
    @api get possibleFields() {
        return this._possibleFields;
    }
    source = 'FieldEditabilitySelector';

    set possibleFields(value) {
        logger(this.log, this.source, `possible fields set to ${value}`);
        this._possibleFields = Array.from(value);
        this.generateFieldOptions();
    }

    @api get initialEditableFields() {
        return this._editableFields;
    }

    set initialEditableFields(value) {
        if (value && value.length > 0 && this._editableFields.length === 0) {
            logger(this.log, this.source, `setting the initial editable fields to ${value}`);
            this._editableFields = Array.from(value);
            this.generateFieldOptions();
        } else {
            logger(this.log, this.source, 'not setting the initial editable fields (already had some)');
        }
    }

    // when a related object is selected, check out the fields
    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    wiredChildMasterData({ error, data }) {
        logger(this.log, this.source, `running child object data wire for ${this.objectApiName}`);
        if (data) {
            this._relatedObjectMetadata = data;
            this.generateFieldOptions();
        } else if (error) {
            logError(this.log, this.source, 'getObjectInfoWire', error);
        }
    }

    handleChange(event) {
        logger(this.log, this.source, 'selected fields changed', event.detail.value);
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
            logger(this.log, this.source, 'metadata not found');
            return;
        }

        if (!this._possibleFields || (!this._possibleFields && this._possibleFields.length === 0)) {
            logger(this.log, this.source, 'no possible fields');
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
            if (this.checkEditability(field, this._relatedObjectMetadata) && this.possibleFields.includes(field)) {
                editableOptions.push({
                    label: this._relatedObjectMetadata.fields[field].label,
                    value: field,
                });
            }
        }
        this.editableOptions = Array.from(editableOptions);
        logger(this.log, this.source, 'setting editable options to', this.editableOptions);

        // take the editableOptions options...if it was already marked editable, put in the selected list
        editableOptions.forEach(field => {
            if (this._editableFields.includes(field.value)) {
                // make it selected somehow?
            }
        });
        logger(this.log, this.source, 'setting editable options to', this._editableFields);
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
