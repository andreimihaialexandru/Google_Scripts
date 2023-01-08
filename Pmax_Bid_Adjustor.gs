function main() {
  const targetRoasThreshold = 6.5;
  const changePercentage = 5.5;
  const changePercentage2 = -5.5;
 
 
  let reportResults = [];
  let campaignResults = [];
  let search = AdsApp.search("SELECT " +
    "metrics.conversions_value, campaign.name " +
    "FROM shopping_performance_view " +
    "WHERE segments.date DURING LAST_7_DAYS");
 
  while (search.hasNext()) {
    let row = search.next();
    const revenue = parseFloat(row.metrics.conversionsValue);
    reportResults.push({
      resourceName: row.campaign.resourceName,
      campaignName: row.campaign.name,
      revenue: revenue,
    });
  }
 
  const performanceMaxCampaignSelector = AdsApp.performanceMaxCampaigns().withResourceNames(reportResults.map(item => item.resourceName));
  const performanceMaxCampaignIterator = performanceMaxCampaignSelector.get();
  while (performanceMaxCampaignIterator.hasNext()) {
    const performanceMaxCampaign = performanceMaxCampaignIterator.next();
    campaignResults.push({
      resourceName: performanceMaxCampaign.getResourceName(),
      performanceMaxCampaign: performanceMaxCampaign,
    });
  }
 
  let mergedResults = [];
 
  for (let i = 0; i < reportResults.length; i++) {
    mergedResults.push({
      ...reportResults[i],
      ...(campaignResults.find(campaignResult => campaignResult.resourceName === reportResults[i].resourceName))
    });
  }
  mergedResults = mergedResults.filter(mergedResult => mergedResult.hasOwnProperty('performanceMaxCampaign'));
 
  mergedResults.forEach(mergedResult => {
    const cost = parseFloat(mergedResult.performanceMaxCampaign.getStatsFor('LAST_7_DAYS').getCost());
    const roas = mergedResult.revenue > 0 ? parseFloat(mergedResult.revenue / cost) : 0;
    Logger.log(mergedResult.campaignName + ' ROAS is ' + roas + '.');
    if (roas < targetRoasThreshold) {
      const targetRoas = mergedResult.performanceMaxCampaign.bidding().getTargetRoas();
      const newTargetRoas = targetRoas + changePercentage / 100 * targetRoas;
      mergedResult.performanceMaxCampaign.bidding().setTargetRoas(newTargetRoas);
      Logger.log('Target ROAS for ' + mergedResult.campaignName + ' set to ' + newTargetRoas + ' (from ' + targetRoas + ').');
    }
       if (roas > targetRoasThreshold) {
      const targetRoas = mergedResult.performanceMaxCampaign.bidding().getTargetRoas();
      const newTargetRoas = targetRoas + changePercentage2 / 100 * targetRoas;
      mergedResult.performanceMaxCampaign.bidding().setTargetRoas(newTargetRoas);
      Logger.log('Target ROAS for ' + mergedResult.campaignName + ' set to ' + newTargetRoas + ' (from ' + targetRoas + ').');
    }
  });
};
