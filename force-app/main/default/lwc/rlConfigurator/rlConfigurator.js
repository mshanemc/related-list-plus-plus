import { LightningElement, track, api } from 'lwc';
import { logger } from 'c/lwcLogger';

export default class rl_configurator extends LightningElement {
    source = 'rl_configurator';

    @api objectApiName;
    @api log;
    // can assume config always has a base config from the parent
    @track config = {};

    @api
    get initialConfig() {
        return this.config;
    }

    set initialConfig(incoming) {
        // only once (otherwise, we should have already had it!)
        if (incoming && !this.config.relatedObjectType) {
            logger(this.log, this.source, 'receieved the following config', incoming);
            this.config = Object.assign({}, incoming);
            logger(this.log, this.source, 'so now local config is', this.config);
        } else {
            logger(this.log, this.source, 'received config, but already had it');
        }
    }

    // @track editOptions;

    // TODO: can we passdown config.stuff
    // @track selectedFields;
    // @track selectedObject;

    //  change handler for the primitive properties
    dataChange(event) {
        logger(this.log, this.source, `${event.target.name} is now ${event.target.value}`);
        this.config[event.target.name] = event.target.value;
        this.emitEventToPassdown();
    }

    maxRowChange(event) {
        this.config.maxRows = event.target.value;
        this.emitEventToPassdown();
    }

    objectSelection(event) {
        logger(this.log, this.source, 'heard the object changed', event.detail);
        this.config.relatedObjectType = event.detail.relatedObjectApiName;
        this.config.childRelationshipField = event.detail.childRelationshipField;
        this.config.relatedObjectLabel = event.detail.relatedObjectLabel;
    }

    // editableChange(event) {
    //     this.config.editableFields = event.detail.value;
    //     this.emitEventToPassdown();
    // }

    fieldsSelection(event) {
        logger(this.log, this.source, 'heard field selection event', event.detail.fields);
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
