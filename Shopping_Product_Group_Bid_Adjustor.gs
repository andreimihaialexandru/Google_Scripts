function main() {
  // This example snippet modifies the bids of some product groups based on
  // criteria. Please modify the snippet to suit your use case.
  const productGroups = AdsApp.productGroups()
      .withCondition('Clicks > 5')
      .withCondition('costConv > 0.01')
      .forDateRange('LAST_MONTH')
      .get();

  for (const productGroup of productGroups) {
    productGroup.setMaxCpc(productGroup.getMaxCpc() + 0.01);
  }
}
