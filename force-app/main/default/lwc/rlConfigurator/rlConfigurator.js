import { LightningElement, track, api, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';

export default class rl_configurator extends LightningElement {
    @api recordId;
    @track _availableObjects = [];
    @track _availableFields = [];
    _childRelationshipField;

    @api title = 'RelatedList++';
    @api iconName = 'custom:custom11';
    @api maxRows = 5;
    @api whereClause;

    @api
    get availableObjects() {
        return this._availableObjects;
    }

    @api objectApiName;
    @track masterObjectInfo;
    @api relatedObject;
    @api relatedObjectType;

    @api
    get availableFields() {
        return this._availableFields;
    }

    @track selectedFields = [];
    @track requiredOptions = [];
    @track editOptions = [];
    @track editableFields = [];

    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    wiredMasterMetadata({ error, data }) {
        if (data) {
            this.masterObjectInfo = data;
            this._availableObjects = [];
            data.childRelationships.forEach(cr => {
                this._availableObjects.push({
                    label: `${cr.relationshipName} (${cr.childObjectApiName})`,
                    value: cr.relationshipName,
                });
            });
        }
    }

    @wire(getObjectInfo, { objectApiName: '$relatedObjectType' })
    wiredChildMasterData({ error, data }) {
        // window.console.log('running child master data');
        if (data) {
            this.relatedObjectMetadata = data;
            window.console.log(JSON.parse(JSON.stringify(data)));
            this.selectedFields = [];
            this._availableFields = [];
            this.requiredOptions = [];
            for (const field in data.fields) {
                // window.console.log(JSON.parse(JSON.stringify(data.fields[field])));
                this._availableFields.push({
                    label: data.fields[field].label,
                    value: field,
                });
                if (data.fields[field].nameField) {
                    // window.console.log(`adding ${field} to required`);
                    this.requiredOptions.push(field);
                    // window.console.log(`adding ${field} to selected`);
                    this.selectedFields.push(field);
                }
            }
            this.emitEventToPassdown();
        }
    }

    connectedCallback() {
        this.emitEventToPassdown();
        setTimeout(() => {
            this.emitEventToPassdown();
        }, 1000);
    }

    dataChange(event) {
        this[event.target.name] = event.target.value;
        this.output = `heard a datachange: ${event.target.name} is now ${
            event.target.value
        }`;
        this.emitEventToPassdown();
    }

    objectSelection(event) {
        this.relatedObject = event.detail.value;
        this.relatedObjectType = this.masterObjectInfo.childRelationships.find(
            cr => cr.relationshipName === event.detail.value,
        ).childObjectApiName;
        this.childRelationshipField = this.masterObjectInfo.childRelationships.find(
            cr => cr.relationshipName === event.detail.value,
        ).fieldName;
        this.emitEventToPassdown();
    }

    editableChange(event) {
        window.console.log(
            `editable fields is selection is ${event.detail.value}`,
        );
        this.editableFields = event.detail.value;
        this.emitEventToPassdown();
    }

    fieldsSelection(event) {
        window.console.log(`field selection is ${event.detail.value}`);
        this.selectedFields = event.detail.value;
        const newEditOptions = [];
        event.detail.value.forEach(field => {
            // get the field from the recordData
            const fieldMD = this.relatedObjectMetadata.fields[field];
            // not the name field, not calculated
            if (
                !fieldMD.nameField &&
                !fieldMD.compound &&
                fieldMD.controllingFields.length === 0 &&
                !fieldMD.htmlFormatted &&
                !fieldMD.reference &&
                fieldMD.updateable
            ) {
                newEditOptions.push({
                    label: fieldMD.label,
                    value: fieldMD.apiName,
                });
            }
            // window.console.log(JSON.parse(JSON.stringify(newEditOoptions)));
        });
        window.console.log(JSON.parse(JSON.stringify(newEditOptions)));
        // window.console.log(JSON.stringify(newEditOptions));
        this.editOptions = newEditOptions;
        this.emitEventToPassdown();
    }

    emitEventToPassdown() {
        // window.console.log('firing an event from configurator!');
        const detail = {
            title: this.title,
            maxRows: this.maxRows,
            iconName: this.iconName,
            relatedObject: this.relatedObject,
            relatedObjectType: this.relatedObjectType,
            selectedFields: this.selectedFields,
            childRelationshipField: this.childRelationshipField,
            whereClause: this.whereClause || '',
            editableFields: this.editableFields,
        };
        // window.console.log(JSON.parse(JSON.stringify(detail)));
        // pubsub.fire('configChange', detail);
        this.dispatchEvent(new CustomEvent('configChange', { detail }));
    }
}
