import { createElement } from 'lwc';
import { registerLdsTestWireAdapter } from '@salesforce/wire-service-jest-util';
import fieldEditabilitySelector from 'c/fieldEditabilitySelector';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';

import * as mockRecordInfo from './data/acctObjectInfo.json';

describe('loads the component and verifies related field exist', () => {
    // it('shows no available fields', async () => {
    //     const element = createElement('c-field-editability-selector', {
    //         is: fieldEditabilitySelector,
    //     });
    //     element.objectApiName = 'Account';
    //     await document.body.appendChild(element);

    //     // const dualLB = element.shadowRoot.querySelector('lightning-dual-listbox');
    //     // expect(dualLB).toBeUndefined();

    //     // const errorText = element.shadowRoot.querySelector('div');
    //     // expect(errorText.textContent).toBe('No fields available');
    // });

    it('shows a combobo with editable fields', async () => {
        const getObjectInfoAdapter = registerLdsTestWireAdapter(getObjectInfo);
        const element = createElement('c-field-editability-selector', {
            is: fieldEditabilitySelector,
        });

        // element.log = true;
        element.objectApiName = 'Account';
        element.possibleFields = ['AccountNumber', 'Industry'];
        await document.body.appendChild(element);
        await getObjectInfoAdapter.emit(mockRecordInfo);

        const dualLB = element.shadowRoot.querySelector('lightning-dual-listbox');

        expect(dualLB).toBeTruthy();
        expect(dualLB.options.length).toBe(element.possibleFields.length);
        expect(dualLB.value).toEqual([]);
    });

    it('shows a combobo with 1 preselected field', async () => {
        const getObjectInfoAdapter = registerLdsTestWireAdapter(getObjectInfo);
        const element = createElement('c-field-editability-selector', {
            is: fieldEditabilitySelector,
        });

        // element.log = true;
        element.objectApiName = 'Account';
        element.possibleFields = ['AccountNumber', 'Industry'];
        element.initialEditableFields = ['Industry'];

        await document.body.appendChild(element);
        await getObjectInfoAdapter.emit(mockRecordInfo);

        const dualLB = element.shadowRoot.querySelector('lightning-dual-listbox');

        expect(dualLB).toBeTruthy();
        expect(dualLB.options.length).toBe(2);
        expect(dualLB.value).toEqual(['Industry']);
    });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });
});
