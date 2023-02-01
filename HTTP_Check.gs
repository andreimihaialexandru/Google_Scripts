function main() {
  var email = 'mihai.andrei@webdigital.ro';  
  var itterArray = buildSelector();
  var urlsChecked = {};
  var results = '';
  var url3 = [];
  var url4 = [];
  var url5 = [];

  for (var i in itterArray) {
    while (itterArray[i].hasNext()) {
      var entity = itterArray[i].next();
      var urls = [];

      var runningCampaign = entity.getCampaign().getEndDate();

      if (runningCampaign != null) {
        var dateYear = runningCampaign.year;
        var dateMonth = runningCampaign.month;
        var dateDay = runningCampaign.day;
        var date = new Date(dateYear, dateMonth - 1, dateDay);
        var currentDate = new Date();

        if (date < currentDate) {
          continue;
        }
      }


      if (entity.urls().getFinalUrl()) {
        urls.push(entity.urls().getFinalUrl());
      }
      if (entity.urls().getMobileFinalUrl()) {
        urls.push(entity.urls().getMobileFinalUrl());
      }

      var urlsStatus = [];
      for (var i in urls) {
        var thisUrl = urls[i];
        if (urlsChecked[thisUrl]) {
          continue;
        } else {
          urlsChecked[thisUrl] = 1;
          var response = UrlFetchApp.fetch(urls[i], {'muteHttpExceptions': true, 'followRedirects': false});
          urlsStatus.push(urls[i] + " " + response.getResponseCode());

          if (response.getResponseCode() != 200) {
            
            var responseStringCode = new String(response.getResponseCode());

            if (responseStringCode[0] == '5') {
              url5.push(response.getResponseCode() + " ----- " + urls[i]);
            } else if (responseStringCode[0] == '4') {
              url4.push(response.getResponseCode() + " ----- " + urls[i]);
            } else if (responseStringCode[0] == '3') {
              url3.push(response.getResponseCode() + " ----- " + urls[i]);
            }

            Logger.log(urls[i] + " ----- " + response.getResponseCode() +  "/////////" + entity.getCampaign().getName() + "/////////" + entity.getCampaign().isEnabled());

          }
        }
      }
    }

    var message500 = "Status code 5xx: ";
    for (var i in url5) {
      message500 = message500 + " " + url5[i] + '\n';
    }

    var message400 = "Status code 4xx: ";
    for (var i in url4) {
      message400 = message400 + " " + url4[i] + '\n';
    }

    var message300 = "Status code 3xx: ";
    for (var i in url3) {
      message300 = message300 + " " + url3[i] + '\n';
    }
  };
  if (url5.length > 0 || url4.length > 0 || url3.length > 0) {
    MailApp.sendEmail(email,
        'HTTP Status Codes: GQS',
        message500 + '\n' + message400 + '\n' + message300);
  }

}

function buildSelector () {

  var selectorArray = [];
  var urlsAd = AdsApp
  .ads()
  .withCondition("ad_group.status = ENABLED")
  .withCondition("campaign.status = ENABLED")
  .withCondition("ad_group.status = ENABLED")
  .get();

  var urlsKw = AdsApp
  .keywords()
  .withCondition("ad_group_criterion.status = ENABLED")
  .withCondition("campaign.status = ENABLED")
  .withCondition("ad_group.status = ENABLED")
  .get();


  selectorArray.push(urlsAd);
  selectorArray.push(urlsKw);

  return selectorArray;
}



/*iau URL's de la toate ad groups si toate keywords
le imping intr-un array si iterez prin el ca sa
le verific pe cele care nu au status 200
ca sa le loghez*/
