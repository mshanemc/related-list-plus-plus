import { LightningElement, track, api } from 'lwc';
import pubsub from 'c/  pubsub';

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

    @track data = {};
    @api recordId;
    @track debugInfo;

    connectedCallback() {
        this.handleConfigChange = this.handleConfigChange.bind(this);
        pubsub.register('configChange', this.handleConfigChange);
    }

    disconnectedCallback() {
        pubsub.unregister('configChange', this.handleConfigChange);
    }

    handleConfigChange(config) {
        // window.console.log('heard an event in passdown!');
        // implement handler logic here
        window.console.log(JSON.parse(JSON.stringify(config)));
        this.data = config;

        // why do I have to do this one manually?
        this.data.fields = config.selectedFields;
        this.data.editableFields = config.editableFields;

        this.debugInfo = JSON.stringify(this.data);
    }
}
