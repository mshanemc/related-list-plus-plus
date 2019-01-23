import { logger } from 'c/lwcLogger';

export function tableHelper(
    columnNames,
    raw,
    editableFieldNames = [],
    log = false,
) {
    //validate input
    if (!columnNames || !raw || columnNames.length === 0) {
        return {};
    }
    const source = 'dataTableHelper';
    const output = {
        data: [],
        columns: [],
    };
    logger(log, source, 'editableFieldNames', editableFieldNames);
    logger(log, source, 'columnNames', columnNames);

    const _columnNames = Array.from(columnNames);

    let columnsCreated = false;

    // iterate through the records
    for (const recId in raw.records) {
        if ({}.hasOwnProperty.call(raw.records, recId)) {
            const dataToOutput = {};

            dataToOutput.Id = recId;
            dataToOutput.nav = `/${recId}`;

            const record = raw.records[recId];
            // iterate through the record's fields
            for (const columnName of _columnNames) {
                // window.console.log(`doing column ${columnName}`);

                // add to our data
                dataToOutput[columnName] =
                    record.fields[columnName].displayValue ||
                    record.fields[columnName].value ||
                    null;
                // do the columns if they haven't been done yet

                const fieldMetadata =
                    raw.objectInfos[record.apiName].fields[columnName];

                if (!columnsCreated) {
                    if (fieldMetadata.nameField) {
                        output.columns.push({
                            label: fieldMetadata.label,
                            fieldName: 'nav',
                            type: 'url',
                            editable: editableFieldNames.includes(
                                fieldMetadata.apiName,
                            ),
                            typeAttributes: {
                                label: { fieldName: columnName },
                                target: '_blank',
                            },
                            sortable: true,
                        });
                    } else {
                        output.columns.push({
                            label: fieldMetadata.label,
                            fieldName: columnName,
                            editable: editableFieldNames.includes(
                                fieldMetadata.apiName,
                            ),
                            sortable: true,
                        });
                    }
                } else {
                    // window.console.log('skipping columns b/c already done');
                }
            }
            columnsCreated = true;
            output.data.push(dataToOutput);
        }
    }

    // only do this once, with whatever was the final row
    logger(log, source, 'dataTableHelper output', output);
    return output;
}
