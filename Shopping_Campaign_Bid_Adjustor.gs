function main() {
  const targetRoasThreshold = 4;
  const changePercentage = -5.5;
  const changePercentage2 = +5.5;


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

  const shoppingCampaignSelector = AdsApp.shoppingCampaigns().withResourceNames(reportResults.map(item => item.resourceName));
  const shoppingCampaignIterator = shoppingCampaignSelector.get();
  while (shoppingCampaignIterator.hasNext()) {
    const shoppingCampaign = shoppingCampaignIterator.next();
    campaignResults.push({
      resourceName: shoppingCampaign.getResourceName(),
      shoppingCampaign: shoppingCampaign,
    });
  }

  let mergedResults = [];

  for (let i = 0; i < reportResults.length; i++) {
    mergedResults.push({
      ...reportResults[i],
      ...(campaignResults.find(campaignResult => campaignResult.resourceName === reportResults[i].resourceName))
    });
  }
  mergedResults = mergedResults.filter(mergedResult => mergedResult.hasOwnProperty('shoppingCampaign'));

  mergedResults.forEach(mergedResult => {
    const cost = parseFloat(mergedResult.shoppingCampaign.getStatsFor('LAST_7_DAYS').getCost());
    const roas = mergedResult.revenue > 0 ? parseFloat(mergedResult.revenue / cost) : 0;
    Logger.log(mergedResult.campaignName + ' ROAS is ' + roas + '.');
    if (roas > targetRoasThreshold) {
      const targetRoas = mergedResult.shoppingCampaign.bidding().getTargetRoas();
      const newTargetRoas = targetRoas + changePercentage / 100 * targetRoas;
      //mergedResult.shoppingCampaign.bidding().setTargetRoas(newTargetRoas);
      mergedResult.shoppingCampaign.bidding().getStrategy('TARGET_ROAS', {
        targetRoas: newTargetRoas,
      });
      Logger.log('Target ROAS for ' + mergedResult.campaignName + ' set to ' + newTargetRoas + ' (from ' + targetRoas + ').');
  mergedResults.forEach(mergedResult => {
    const cost = parseFloat(mergedResult.shoppingCampaign.getStatsFor('LAST_7_DAYS').getCost());
    const roas = mergedResult.revenue > 0 ? parseFloat(mergedResult.revenue / cost) : 0;
    Logger.log(mergedResult.campaignName + ' ROAS is ' + roas + '.');
    if (roas < targetRoasThreshold) {
      const targetRoas = mergedResult.shoppingCampaign.bidding().getTargetRoas();
      const newTargetRoas = targetRoas + changePercentage2 / 100 * targetRoas;
      //mergedResult.shoppingCampaign.bidding().setTargetRoas(newTargetRoas);
      mergedResult.shoppingCampaign.bidding().getStrategy('TARGET_ROAS').setTargetRoas(newTargetRoas);
      Logger.log('Target ROAS for ' + mergedResult.campaignName + ' set to ' + newTargetRoas + ' (from ' + targetRoas + ').');
    }
  });
}
});
}
