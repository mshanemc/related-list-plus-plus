/* eslint-disable no-console */
import { LightningElement, track, api } from 'lwc';

export default class rl_configurator extends LightningElement {
    @api objectApiName;
    // can assume config always has a base config from the parent
    @track config = {};

    @api
    get initialConfig() {
        return this.config;
    }
    set initialConfig(incoming) {
        // only once (otherwise, we should have already had it!)
        if (incoming && !this.config.relatedObjectType) {
            console.log('Configurator: receieved the following config');
            console.log(JSON.parse(JSON.stringify(incoming)));
            this.config = Object.assign({}, incoming);

            console.log('Configurator: so now local config is');
            console.log(JSON.parse(JSON.stringify(this.config)));
        } else {
            console.log('Configurator: received config, but already had it');
        }
    }

    // @track editOptions;

    // TODO: can we passdown config.stuff
    // @track selectedFields;
    // @track selectedObject;

    //  change handler for the primitive properties
    dataChange(event) {
        console.log(`${event.target.name} is now ${event.target.value}`);
        this.config[event.target.name] = event.target.value;
        this.emitEventToPassdown();
    }

    maxRowChange(event) {
        this.config.maxRows = event.target.value;
        this.emitEventToPassdown();
    }

    objectSelection(event) {
        console.log('Configurator: heard the object changed');
        this.config.relatedObjectType = event.detail.relatedObjectApiName;
        this.config.childRelationshipField =
            event.detail.childRelationshipField;
        this.config.relatedObjectLabel = event.detail.relatedObjectLabel;
    }

    // editableChange(event) {
    //     this.config.editableFields = event.detail.value;
    //     this.emitEventToPassdown();
    // }

    fieldsSelection(event) {
        console.log('Configurator: heard field selection event');
        console.log(`field selection is ${event.detail.fields}`);
        this.config.selectedFields = event.detail.fields;
        this.emitEventToPassdown();

        // const newEditOptions = [];
        // event.detail.value.forEach(field => {
        //     // get the field from the recordData
        //     const fieldMD = this._relatedObjectMetadata.fields[field];
        //     // not the name field, not calculated
        //     if (
        //         !fieldMD.nameField &&
        //         !fieldMD.compound &&
        //         fieldMD.controllingFields.length === 0 &&
        //         !fieldMD.htmlFormatted &&
        //         !fieldMD.reference &&
        //         fieldMD.updateable
        //     ) {
        //         newEditOptions.push({
        //             label: fieldMD.label,
        //             value: fieldMD.apiName,
        //         });
        //     }
        //     // window.console.log(JSON.parse(JSON.stringify(newEditOoptions)));
        // });
        // // window.console.log(JSON.parse(JSON.stringify(newEditOptions)));
        // // window.console.log(JSON.stringify(newEditOptions));
        // this.editOptions = newEditOptions;
        // this.emitEventToPassdown();
    }

    save() {
        this.dispatchEvent(new Event('save'));
    }

    hide() {
        this.dispatchEvent(new Event('hide'));
    }

    emitEventToPassdown() {
        const detail = Object.assign({}, this.config);
        // default to not be undefined so that apex wire fires
        detail.whereClause = this.config.whereClause || '';
        this.dispatchEvent(new CustomEvent('configchange', { detail }));
    }
}
