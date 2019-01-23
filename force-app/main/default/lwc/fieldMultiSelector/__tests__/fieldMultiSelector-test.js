import { createElement } from 'lwc';
import { registerLdsTestWireAdapter } from '@salesforce/wire-service-jest-util';
import fieldMultiSelector from 'c/fieldMultiSelector';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';

import * as mockRecordInfo from './data/acctObjectInfo.json';

describe('loads the component and verifies related field exist', () => {
    it('no combobox without data', async () => {
        const element = createElement('c-field-multi-selector', {
            is: fieldMultiSelector,
        });
        document.body.appendChild(element);

        const dualLB = element.shadowRoot.querySelector(
            'lightning-dual-listbox',
        );
        expect(dualLB).toBeFalsy();

        const errorText = element.shadowRoot.querySelector('div');
        expect(errorText.textContent).toBe('objectApiName is not set: ');
    });

    it('shows no available fields', async () => {
        const element = createElement('c-field-multi-selector', {
            is: fieldMultiSelector,
        });
        element.objectApiName = 'Account';
        document.body.appendChild(element);

        const dualLB = element.shadowRoot.querySelector(
            'lightning-dual-listbox',
        );
        expect(dualLB).toBeFalsy();

        const errorText = element.shadowRoot.querySelector('div');
        expect(errorText.textContent).toBe('No fields available');
    });

    it('shows a combobo with related objects', async () => {
        const getObjectInfoAdapter = registerLdsTestWireAdapter(getObjectInfo);
        const element = createElement('c-field-multi-selector', {
            is: fieldMultiSelector,
        });
        // element.log = true;
        element.objectApiName = 'Account';
        await document.body.appendChild(element);
        await getObjectInfoAdapter.emit(mockRecordInfo);

        const dualLB = element.shadowRoot.querySelector(
            'lightning-dual-listbox',
        );
        expect(dualLB).toBeTruthy();
        expect(dualLB.options.length).toBe(66);
    });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });
});
