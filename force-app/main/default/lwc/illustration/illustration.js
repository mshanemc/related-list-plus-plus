import { LightningElement, api } from 'lwc';

export default class Illustration extends LightningElement {
    @api message;
    @api size;
    @api picture;
}
