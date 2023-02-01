function main() {

    var settings = {
        'linkedView': "168060592",
        'linkedAccountId': "605-012-1458",
        'accountId': '277889',
        'propertyID': 'UA-277889-23'
    };

    var spreadsheet = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1lle_rtCNx56lWpS3RlOMk12v5xPQjg_4FHHhWkx359E/edit');
    var sheet = spreadsheet.getSheetByName('AudienceList');
    var range = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3);
    var values = range.getValues();
    Logger.log(values.length);

    for (var i = 0; i < values.length; i++) {
        var name = values[i][0];
        var categoryUrl = values[i][1];
        var duration = values[i][2];
        Logger.log(name + " " + categoryUrl + " " + duration);

        try {
            var newAudience = Analytics.Management.RemarketingAudience.insert(
                {
                    'name': name,
                    'linkedViews': [settings.linkedView],
                    'linkedAdAccounts': [{
                        'type': 'ADWORDS_LINKS',
                        'linkedAccountId': settings.linkedAccountId
                    }],
                    'audienceType': 'SIMPLE',
                    'audienceDefinition': {
                        'includeConditions': {
                            'daysToLookBack': 7,
                            'segment': 'sessions::condition::ga:pagePath=@' + categoryUrl,
                            'membershipDurationDays': duration,
                            'isSmartList': false
                        }
                    }
                },
                settings.accountId,
                settings.propertyID);

            Logger.log(i + ' Audience ' + name + ' has been created');
        } catch (e) {
            Logger.log("Error: " + e);
        } finally {
            Utilities.sleep(100);
        }
    }
}
