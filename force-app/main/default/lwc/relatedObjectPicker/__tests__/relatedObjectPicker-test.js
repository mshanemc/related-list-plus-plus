import { createElement } from 'lwc';
import { registerLdsTestWireAdapter } from '@salesforce/wire-service-jest-util';
import relatedObjectPicker from 'c/relatedObjectPicker';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';

import * as mockRecordInfo from './data/acctObjectInfo.json';

describe('loads the component and verifies related objects came down', () => {
    it('no combobox without data', async () => {
        const element = createElement('c-related-object-picker', {
            is: relatedObjectPicker,
        });
        document.body.appendChild(element);

        const combobox = element.shadowRoot.querySelector('lightning-combobox');
        expect(combobox).toBeFalsy();

        const errorText = element.shadowRoot.querySelector('div');
        expect(errorText.textContent).toBe('objectApiName is not set: ');
    });

    it('shows a combobo with related objects', async () => {
        const getObjectInfoAdapter = registerLdsTestWireAdapter(getObjectInfo);
        const element = createElement('c-related-object-picker', {
            is: relatedObjectPicker,
        });
        document.body.appendChild(element);

        await getObjectInfoAdapter.emit(mockRecordInfo);

        const combobox = element.shadowRoot.querySelector('lightning-combobox');
        expect(combobox).toBeTruthy();
        expect(combobox.options.length).toBe(50);
    });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });
});
