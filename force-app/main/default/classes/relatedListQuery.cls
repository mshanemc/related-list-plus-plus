public with sharing class relatedListQuery {

    @AuraEnabled(cacheable=true)
    public static string getRecordIds(string objectType, string relationshipField, string recordId, integer maxRows, string whereClause){

        string query = 'select id from ' + objectType + ' where ' +relationshipField+ ' = \'' + recordId + '\'';
        if (whereClause != null && whereClause.length() > 0) {
            query = query + ' and (' + whereClause.trim() + ')';
        }
        query = query + ' limit ' + maxRows;

        system.debug(query);
        return JSON.serialize(Database.query(query));
    }

    // relatedListQuery.countRecords('Case', 'AccountId', '0015600000B8IDsAAN', null);
    @AuraEnabled(cacheable=true)
    public static Integer countRecords(String objectType, String relationshipField, String recordId, String whereClause){

        String Query = 'select count() from ' + objectType + ' where ' +relationshipField+ ' = \'' + recordId + '\'';
        if (whereClause != null && whereClause.length() > 0) {
            Query = Query + ' and (' + whereClause.trim() + ')';
        }

        system.debug(query);
        return Database.countQuery(query);
        // return 0;
    }

    @AuraEnabled(cacheable=true)
    public static string getCMDT(String DevName ){
        //RLPP_Config__mdt
        List<RLPP_Config__mdt> output =  [select JSON_Config__c from RLPP_Config__mdt where DeveloperName =: DevName];
        if (output.size() == 1){
            return output[0].JSON_Config__c;
        }
        return null;
    }

    // updates or created cmdt to store the config
    @AuraEnabled
    public static void upsertCMDT(String DevName, String JSONConfig ){
        //RLPP_Config__mdt
        List<String> fullNames = new List<String>{'RLPP_Config__mdt' + DevName };
        Metadata.CustomMetadata recordToUpdate =  new Metadata.CustomMetadata();

        Metadata.CustomMetadataValue customField = new Metadata.CustomMetadataValue();
        customField.field = 'JSON_Config__c';
        customField.value = JSONConfig;
        recordToUpdate.values.add(customField);

        Metadata.DeployContainer mdContainer = new Metadata.DeployContainer();
        mdContainer.addMetadata(recordToUpdate);

        Id jobId = Metadata.Operations.enqueueDeployment(mdContainer, null);

    }


}

