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
}
