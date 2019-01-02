/* eslint-disable no-console */
import { LightningElement, api, track, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';

export default class RelatedObjectPicker extends LightningElement {
    @api objectApiName;

    //let's only set this once from external
    @api set initialSelectedObject(value) {
        if (!this._selectedObject) {
            console.log(
                `relatedObjectPicker: receiving selected object as ${value}`,
            );
            this._selectedObject = value;
        } else {
            console.log(
                `relatedObjectPicker: receiving selected object as ${value} but no storing because I already had one`,
            );
        }
    }

    get initialSelectedObject() {
        return this._selectedObject;
    }

    @track availableObjects;
    @track _selectedObject;
    _masterObjectInfo;

    // takes the sobject name and populates the list of related objects for it
    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    wiredMasterMetadata({ data }) {
        if (data) {
            this._masterObjectInfo = data;
            this.availableObjects = [];
            data.childRelationships.forEach(cr => {
                this.availableObjects.push({
                    label: `${cr.relationshipName} (${cr.childObjectApiName})`,
                    value: cr.relationshipName,
                });
            });
        }
    }

    // emits 3 properties to anyone who needs to know about what was selected
    objectSelection(event) {
        this._selectedObject = event.detail.value;
        this.dispatchEvent(
            new CustomEvent('objectchange', {
                detail: {
                    relatedObjectLabel: event.detail.value,
                    relatedObjectApiName: this._masterObjectInfo.childRelationships.find(
                        cr => cr.relationshipName === event.detail.value,
                    ).childObjectApiName,
                    childRelationshipField: this._masterObjectInfo.childRelationships.find(
                        cr => cr.relationshipName === event.detail.value,
                    ).fieldName,
                },
            }),
        );
    }
}
