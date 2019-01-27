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
import { logger, logError } from 'c/lwcLogger';

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

    @api log;
    @track showConfig = false;

    source = 'rlp_values_passdown';

    @wire(getCMDT, { DevName: '$configId' })
    async wiredApexQuery({ error, data }) {
        if (error) {
            logError(this.log, this.source, 'apex query of cmdt', error);
        } else if (data) {
            const result = JSON.parse(data);
            logger(this.log, this.source, 'apex query of cmdt', result);
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
            logError(this.log, this.source, 'apex save error', e);
        }
    }

    handleConfigChange(event) {
        logger(this.log, this.source, 'heard config change', event.detail);
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
