function main() {

const COST_THRESHOLD = 10
const CONV_THRESHOLD = 0.1
const DATE_THRESHOLD = "LAST_30_DAYS"

    
    // Pull all relevant search queries
   var rows = AdsApp.search(
      "SELECT search_term_view.search_term,campaign.advertising_channel_type,campaign.name,campaign.status,campaign.id,metrics.conversions,metrics.cost_micros,metrics.average_cpc,metrics.clicks" +
      " FROM search_term_view" +
      " WHERE metrics.cost_micros > " + COST_THRESHOLD *1000000 +
      " AND metrics.conversions < " + CONV_THRESHOLD +
      " AND campaign.advertising_channel_type = SEARCH" +
      " AND campaign.status = ENABLED" +
      " AND segments.date DURING " + DATE_THRESHOLD);
 
while (rows.hasNext()) {
  var row = rows.next();
    const conversions = parseFloat(row.metrics.conversions);
    const cost = parseFloat(row.metrics.costMicros / 1000000);
    const campaignName = (row.campaign.name);

        // Get the query   
  var searchTerm = row.searchTermView;
  var query = searchTerm.searchTerm;    
        Logger.log("search_term_view.search_term: " + query + " | Cost: " + cost + " | "  + campaignName + " | Conv: "  + conversions );
        var encodedQuery = encodeURI(query);

        // Filter for the strongly negative queries
        if (cost > COST_THRESHOLD && conversions < CONV_THRESHOLD){
          
          // Get the campaign associated with the query
          var campaignIterator = AdsApp.campaigns()
          .withCondition('Name = "' + campaignName.replace(/[\"]/g, "") + '"')
          .get();
    var campaign = campaignIterator.next();
   
          campaign.createNegativeKeyword('[' + query + ']');
            Logger.log("Added " + query + " as a negative keyword in campaign: " + campaign.getName());

          }
        }
      }
