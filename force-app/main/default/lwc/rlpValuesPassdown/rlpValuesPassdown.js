import { LightningElement, track, api, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';

import getCMDT from '@salesforce/apex/relatedListQuery.getCMDT';
import upsertCMDT from '@salesforce/apex/relatedListQuery.upsertCMDT';

export default class rlp_values_passdown extends LightningElement {
    // constructor() {
    //   super();
    //   this.data = {
    //     title: 'Default Title',
    //     iconName: '',
    //     relatedObject: 'Contacts',
    //     relatedObjectType: 'Contact',
    //     selectedFields: ['Name', 'Birthdate', 'Email', 'CreatedDate', 'Department', 'MobilePhone'],
    //     childRelationshipField: 'AccountId',
    //     whereClause: ''
    //   }
    // }

    @track config = {};
    @api recordId;
    @api configId;
    @track debugInfo;
    @track showConfig = false;

    @wire(getCMDT, { DevName: '$configId' })
    wiredApexQuery({ error, data }) {
        if (error) {
            window.console.log(error);
        } else if (data) {
            this.config = data;
        }
    }

    async handleConfigChange(event) {
        try {
            // save via apex
            await upsertCMDT({
                DevName: this.configId,
                JSONConfig: event.detail,
            });

            // invalidate the wire
            await refreshApex(this.config);
        } catch (e) {
            console.error('apex save error', e);
        }
    }
}
