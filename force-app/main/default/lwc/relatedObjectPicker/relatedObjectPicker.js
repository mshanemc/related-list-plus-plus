/* eslint-disable no-console */
import { LightningElement, api, track, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { logger } from 'c/lwcLogger';

export default class RelatedObjectPicker extends LightningElement {
    @api objectApiName;
    @api log;
    source = 'RelatedObjectPicker';

    //let's only set this once from external
    @api set initialSelectedObject(value) {
        if (!this._selectedObject) {
            this._selectedObject = value;
            logger(
                this.log,
                this.source,
                `receiving selected object as ${value}`,
            );
        } else {
            logger(
                this.log,
                this.source,
                `receiving selected object as ${value} but not storing because I already had one`,
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
