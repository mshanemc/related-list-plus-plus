import { Element, track, api } from 'engine';

export default class rlp_values_passdown extends Element {

  constructor() {
    super();
    this.template.addEventListener('notification', this.handleNotification.bind(this));
    this.data = {
      title: 'Default Title',
      maxRows: 5,
      iconName: '',
      relatedObject: 'Contacts',
      relatedObjectType: 'Contact',
      selectedFields: ['Name', 'Birthdate', 'Email', 'CreatedDate', 'Department', 'MobilePhone'],
      childRelationshipField: 'AccountId',
      whereClause: ''
    }
    this.data
  }

  @track data = {};
  @api recordId;

  handleNotification(event) {
    window.console.log('heard an event in passdown!');
    // implement handler logic here
    window.console.log(JSON.parse(JSON.stringify(event.detail)));
    this.data = event.detail;
    // why do I have to do this one manually?
    this.data.fields = event.detail.selectedFields;

    window.console.log(JSON.parse(JSON.stringify(this.data)));

  }
}