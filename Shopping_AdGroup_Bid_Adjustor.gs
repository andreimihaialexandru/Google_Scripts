function main() {
   const targetRoasThreshold = 4;
   const changePercentage = -5.5;
   const changePercentage2 = 5.5;
 
 
  let reportResults = [];
  let AdGroupResults = [];
  let search = AdsApp.search("SELECT " +
    "metrics.conversions_value, ad_group.name " +
    "FROM shopping_performance_view " +
    "WHERE segments.date DURING LAST_7_DAYS");
 
  while (search.hasNext()) {
    let row = search.next();
    const revenue = parseFloat(row.metrics.conversionsValue);
    reportResults.push({
      resourceName: row.adGroup.resourceName,
      adGroupName: row.adGroup.name,
      revenue: revenue,
    });
  }
 
  const shoppingAdGroupSelector = AdsApp.shoppingAdGroups().withResourceNames(reportResults.map(item => item.resourceName));
  const shoppingAdGroupIterator = shoppingAdGroupSelector.get();
  while (shoppingAdGroupIterator.hasNext()) {
    const shoppingAdGroup = shoppingAdGroupIterator.next();
    AdGroupResults.push({
      resourceName: shoppingAdGroup.getResourceName(),
      shoppingAdGroup: shoppingAdGroup,
    });
  }
 
  let mergedResults = [];
 
  for (let i = 0; i < reportResults.length; i++) {
    mergedResults.push({
      ...reportResults[i],
      ...(AdGroupResults.find(AdGroupResult => AdGroupResult.resourceName === reportResults[i].resourceName))
    });
  }
  mergedResults = mergedResults.filter(mergedResult => mergedResult.hasOwnProperty('shoppingAdGroup'));
 
  mergedResults.forEach(mergedResult => {
    const cost = parseFloat(mergedResult.shoppingAdGroup.getStatsFor('LAST_7_DAYS').getCost());
    const roas = mergedResult.revenue > 0 ? parseFloat(mergedResult.revenue / cost) : 0;
    Logger.log(mergedResult.AdGroupName + ' ROAS is ' + roas + '.');
    if (roas < targetRoasThreshold) {
      const targetRoas = mergedResult.shoppingAdGroup.bidding().getTargetRoas();
      const newTargetRoas = targetRoas + changePercentage / 100 * targetRoas;
      mergedResult.shoppingAdGroup.bidding().setTargetRoas(newTargetRoas);
      Logger.log('Target ROAS for ' + mergedResult.AdGroupName + ' set to ' + newTargetRoas + ' (from ' + targetRoas + ').');
    }
     if (roas > targetRoasThreshold) {
      const targetRoas = mergedResult.shoppingAdGroup.bidding().getTargetRoas();
      const newTargetRoas = targetRoas + changePercentage2 / 100 * targetRoas;
      mergedResult.shoppingAdGroup.bidding().setTargetRoas(newTargetRoas);
      Logger.log('Target ROAS for ' + mergedResult.AdGroupName + ' set to ' + newTargetRoas + ' (from ' + targetRoas + ').');
    }
  });
}
