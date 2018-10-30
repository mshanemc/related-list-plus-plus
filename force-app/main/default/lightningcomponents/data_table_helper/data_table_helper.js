import { createRecordInputFilteredByEditedFields } from "lightning-ui-api-record";

export function tableHelper(columnNames, raw, editableFieldNames){

  // window.console.log(`starting tableHelper with columnNames = ${columnNames}`);


  const output = {
    data : [],
    columns: []
  }

  //validate input
  if (!columnNames || !raw){
    return {};
  }

  let columnsCreated = false;
  window.console.log(`editableFieldNames is ${JSON.stringify(editableFieldNames)}`);

  // iterate through the records
  for (const recId in raw.records){
    const dataToOutput = {};

    dataToOutput.Id = recId;
    dataToOutput.nav = `/${recId}`;

    const record = raw.records[recId];
    // window.console.log(`doing record ${recId}`);
    // iterate through the record's fields
    for (const columnName of columnNames){
      // window.console.log(`doing column ${columnName}`);

      // add to our data
      dataToOutput[columnName] = record.fields[columnName].displayValue || record.fields[columnName].value || null;
      // do the columns if they haven't been done yet

      const fieldMetadata = raw.objectInfos[record.apiName].fields[columnName];

      if (!columnsCreated) {
        window.console.log(`editable for ${columnName} is ${editableFieldNames.includes(fieldMetadata.apiName)}`);
        if (fieldMetadata.nameField){
          output.columns.push({
            label: fieldMetadata.label,
            fieldName: 'nav',
            type: 'url',
            editable: editableFieldNames.includes(fieldMetadata.apiName),
            typeAttributes: {
              label: { fieldName: columnName },
              target: '_blank'
            }
            // sortable: true
          });
        } else {
          output.columns.push({
            label: fieldMetadata.label,
            fieldName: columnName,
            editable: editableFieldNames.includes(fieldMetadata.apiName)
            // sortable: true
          });
        }
      } else {
        // window.console.log('skipping columns b/c already done');
      }

    }
    columnsCreated = true;
    output.data.push(dataToOutput);
  }

  // only do this once, with whatever was the final row

  window.console.log(JSON.parse(JSON.stringify(output)));
  return output;

}