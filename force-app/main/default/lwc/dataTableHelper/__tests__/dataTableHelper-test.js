import { tableHelper } from '../dataTableHelper';
import * as rawData from '../__tests__/data/sampleAccount.json';

describe('feeds the table helper various things', () => {
    it('fails on missing input', () => {
        const output = tableHelper(undefined, undefined, undefined);
        expect(output).toEqual({});
    });

    describe('has no editable columns', () => {
        const columnNames = ['Name', 'AnnualRevenue', 'AccountNumber'];
        const output = tableHelper(columnNames, rawData);
        it('returns properly structred output', () => {
            expect(output).toBeTruthy();
            expect(output.data.length).toEqual(1);
            expect(output.columns.length).toEqual(3);
        });

        it('makes name fields navigable', () => {
            expect(
                output.columns.find(column => column.label === 'Account Name')
                    .type,
            ).toEqual('url');
        });
        it('makes not editable fields', () => {
            expect(output.columns.find(column => column.editable)).toBeFalsy();
        });
    });

    describe('has editable columns', () => {
        const columnNames = ['Name', 'AnnualRevenue', 'AccountNumber'];
        const output = tableHelper(columnNames, rawData, [
            'AnnualRevenue',
            'AccountNumber',
        ]);
        expect(output).toBeTruthy();
        expect(output.data.length).toEqual(1);
        expect(output.columns.length).toEqual(3);
        it('makes name fields navigable', () => {
            const nameColumn = output.columns.find(
                column => column.label === 'Account Name',
            );
            expect(nameColumn).toBeTruthy();
            expect(nameColumn.type).toEqual('url');
            expect(nameColumn.editable).toEqual(false);
        });

        it('makes not editable fields', () => {
            const revColumn = output.columns.find(
                column => column.fieldName === 'AnnualRevenue',
            );
            const numberColumn = output.columns.find(
                column => column.fieldName === 'AccountNumber',
            );
            expect(revColumn.editable).toEqual(true);
            expect(numberColumn.editable).toEqual(true);
        });
    });
});
