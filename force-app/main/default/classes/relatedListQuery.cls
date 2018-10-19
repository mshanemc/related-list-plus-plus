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
    public static integer countRecords(string objectType, string relationshipField, string recordId, string whereClause){

        string query = 'select count() from ' + objectType + ' where ' +relationshipField+ ' = \'' + recordId + '\'';
        if (whereClause != null && whereClause.length() > 0) {
            query = query + ' and (' + whereClause.trim() + ')';
        }

        system.debug(query);
        return Database.countQuery(query);
        // return 0;
    }


}

