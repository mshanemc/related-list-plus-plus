import { createElement } from 'lwc';
import { registerLdsTestWireAdapter } from '@salesforce/wire-service-jest-util';
import rlpValuesPassdown from 'c/rlpValuesPassdown';
import getCMDT from '@salesforce/apex/relatedListQuery.getCMDT';

describe('loads the component and verifies various configurations', () => {
    // it('shows no available fields', async () => {
    //     const element = createElement('c-field-editability-selector', {
    //         is: rlpValuesPassdown,
    //     });
    //     element.objectApiName = 'Account';
    //     await document.body.appendChild(element);

    //     // const dualLB = element.shadowRoot.querySelector('lightning-dual-listbox');
    //     // expect(dualLB).toBeUndefined();

    //     // const errorText = element.shadowRoot.querySelector('div');
    //     // expect(errorText.textContent).toBe('No fields available');
    // });

    it('loads with no configId from app builder', async () => {
        const element = createElement('c-rlp-values-passdown', {
            is: rlpValuesPassdown,
        });

        element.objectApiName = 'Account';
        element.recordId = '0010S00000HJxdAQAT';

        await document.body.appendChild(element);
        const div = element.shadowRoot.querySelector('div.no-config-id');

        expect(div.textContent).toEqual(
            'Add a unique config ID via App Builder.  Then save.  Then leave App Builder, and customize on the page itself using the gear icon on the component.',
        );
        // expect(dualLB.value).toEqual([]);
        const rlpp = element.shadowRoot.querySelector('c-related-list-plus-plus');
        const configurator = element.shadowRoot.querySelector('c-related-list-plus-plus');
        expect(rlpp).toBeFalsy();
        expect(configurator).toBeFalsy();
    });

    it('loads with a configId but only base config', async () => {
        const element = createElement('c-rlp-values-passdown', {
            is: rlpValuesPassdown,
        });

        element.objectApiName = 'Account';
        element.recordId = '0010S00000HJxdAQAT';
        element.configId = 'Empty';

        await document.body.appendChild(element);

        const div = element.shadowRoot.querySelector('div.no-config-id');
        expect(div).toBeFalsy();

        // expect(dualLB.value).toEqual([]);
        const rlpp = element.shadowRoot
            .querySelector('c-related-list-plus-plus')
            .shadowRoot.querySelector('article.slds-card');
        // const rlpp = element.shadowRoot.querySelector('article.slds-card');
        const configurator = element.shadowRoot.querySelector('c-rl-configurator');
        expect(rlpp).toBeTruthy();
        expect(configurator).toBeFalsy();
    });

    it('opens the config section', async () => {
        const element = createElement('c-rlp-values-passdown', {
            is: rlpValuesPassdown,
        });

        element.objectApiName = 'Account';
        element.recordId = '0010S00000HJxdAQAT';
        element.configId = 'Empty';

        await document.body.appendChild(element);

        // expect(dualLB.value).toEqual([]);
        const rlpp = element.shadowRoot.querySelector('c-related-list-plus-plus');
        await rlpp.dispatchEvent(new CustomEvent('configure'));
        // const rlpp = element.shadowRoot.querySelector('article.slds-card');
        const configurator = element.shadowRoot.querySelector('c-rl-configurator');
        expect(configurator).toBeTruthy();
    });

    it('passes config changes from configurator to rlpp', async () => {
        const element = createElement('c-rlp-values-passdown', {
            is: rlpValuesPassdown,
        });

        // element.log = true;
        element.objectApiName = 'Account';
        element.recordId = '0010S00000HJxdAQAT';
        element.configId = 'Empty';

        await document.body.appendChild(element);

        // check the default base title
        let rlpp = element.shadowRoot.querySelector('c-related-list-plus-plus');
        expect(rlpp.shadowRoot.querySelector('h2.slds-card__header-title a span').textContent).toBe('RelatedList++');

        // open the configurator
        await rlpp.dispatchEvent(new CustomEvent('configure'));
        // change the title in the config
        const configurator = element.shadowRoot.querySelector('c-rl-configurator');
        await configurator.dispatchEvent(
            new CustomEvent('configchange', {
                detail: {
                    title: 'TestNewTitle',
                },
            }),
        );

        // const configSpy = jest.spyOn(element, 'config', 'set');
        // expect(configSpy).toHaveBeenCalled();
        // expect(element.config.title).toBe('TestNewTitle');
        expect(
            element.shadowRoot
                .querySelector('c-related-list-plus-plus')
                .shadowRoot.querySelector('h2.slds-card__header-title a span').textContent,
        ).toBe('TestNewTitle');
    });

    it('can get config from apex', async () => {
        const apexCMDT = registerLdsTestWireAdapter(getCMDT);

        const element = createElement('c-rlp-values-passdown', {
            is: rlpValuesPassdown,
        });

        // element.log = true;
        element.objectApiName = 'Account';
        element.recordId = '0010S00000HJxdAQAT';
        element.configId = 'Empty';

        await document.body.appendChild(element);
        apexCMDT.emit(
            JSON.stringify({
                title: 'TitleFromApex',
            }),
        );
        // check the default base title
        let rlpp = element.shadowRoot.querySelector('c-related-list-plus-plus');
        expect(rlpp.shadowRoot.querySelector('h2.slds-card__header-title a span').textContent).toBe('TitleFromApex');
    });

    // it('shows a combobo with 1 preselected field', async () => {
    //     const getObjectInfoAdapter = registerLdsTestWireAdapter(getObjectInfo);
    //     const element = createElement('c-field-editability-selector', {
    //         is: rlpValuesPassdown,
    //     });

    //     // element.log = true;
    //     element.objectApiName = 'Account';
    //     element.possibleFields = ['AccountNumber', 'Industry'];
    //     element.initialEditableFields = ['Industry'];

    //     await document.body.appendChild(element);
    //     await getObjectInfoAdapter.emit(mockRecordInfo);

    //     const dualLB = element.shadowRoot.querySelector('lightning-dual-listbox');

    //     expect(dualLB).toBeTruthy();
    //     expect(dualLB.options.length).toBe(2);
    //     expect(dualLB.value).toEqual(['Industry']);

    // });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });
});
