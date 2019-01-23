/* eslint-disable no-console */
/* test cases
1. no config at all
2. stored config of only an object
3. stored full config
4. full unstored config, then object change
5. full stored config, then object change
6. no config, then different objects

*/
import { LightningElement, track, api, wire } from 'lwc';
// import { refreshApex } from '@salesforce/apex';

import getCMDT from '@salesforce/apex/relatedListQuery.getCMDT';
import upsertCMDT from '@salesforce/apex/relatedListQuery.upsertCMDT';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class rlp_values_passdown extends LightningElement {
    baseConfig = {
        title: 'RelatedList++',
        iconName: 'custom:custom11',
        maxRows: 5,
        whereClause: '',
        editableFields: [],
    };

    @track config;
    @api recordId;
    @api objectApiName;
    @api configId;

    @track showConfig = false;

    @wire(getCMDT, { DevName: '$configId' })
    async wiredApexQuery({ error, data }) {
        if (error) {
            console.error(error);
        } else if (data) {
            console.log(data);
            const result = JSON.parse(data);

            this.config = Object.assign(this.baseConfig, result);
            // this.config.selectedFields = result.selectedFields;
        }
    }

    async save() {
        try {
            // save via apex
            await upsertCMDT({
                DevName: this.configId,
                JSONConfig: JSON.stringify(this.config),
            });
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Metadata Deploy Requested',
                    message: 'Refresh the page to use the updated related list',
                    variant: 'info',
                }),
            );
            // invalidate the wire?
            // await refreshApex(this.config);
        } catch (e) {
            console.error('apex save error', e);
        }
    }

    handleConfigChange(event) {
        console.log('heard config change');
        console.log(JSON.parse(JSON.stringify(event.detail)));
        const newConfig = Object.assign({}, this.config, event.detail);
        // newConfig.fields = event.detail.selectedFields;
        this.config = newConfig;
    }

    hide() {
        this.showConfig = false;
    }

    openConfig() {
        this.showConfig = true;
    }
}
