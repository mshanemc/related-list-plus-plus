export function tableHelper(columnNames, raw){

  // window.console.log(`starting tableHelper with columnNames = ${columnNames}`);

  const output = {
    data : [],
    columns: []
  }

  let columnsCreated = false;

  // iterate through the records
  for (const recId in raw.records){
    const dataToOutput = {};

    dataToOutput.id = recId;
    const record = raw.records[recId];
    // window.console.log(`doing record ${recId}`);

    // iterate through the record's fields
    for (const columnName of columnNames){
      // window.console.log(`doing column ${columnName}`);

      // add to our data
      dataToOutput[columnName] = record.fields[columnName].displayValue || record.fields[columnName].value || null;

      // do the columns if they haven't been done yet
      if (!columnsCreated) {
        const fieldMetadata = raw.objectInfos[record.apiName].fields[columnName];
        output.columns.push({
          label: fieldMetadata.label,
          fieldName: columnName
          // sortable: true
        });
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