var CONFIG = {
    SPREADSHEET_URL: "https://docs.google.com/spreadsheets/d/1KLhvOEr19mcp74clzpVOu0RPoVAvUSYFSoOtxkqZFnU/edit",
    SHEET_NAME: "Data",
    START_DATE: "2022-08-01",
    END_DATE: "2022-10-30",
    GMC_MERCHANT_ID: "104485907",
    GA_VIEW_ID: "ga:201424545"
};
//Client: GQS

//GA: add cart-to-detail and buy-to-detail
function main() {
    var spreadsheet = validateAndGetSpreadsheet(CONFIG.SPREADSHEET_URL);
    var sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);

    var googleAdsItems = getGoogleAdsItems();

    var googleAnalyticsItems = getGAItems();

    var gmcItems = getGMCItems();

    var finalResults = [];
    // ga:itemQuantity,ga:uniquePurchases,ga:revenuePerItem,ga:itemRevenue,ga:productAddsToCart
    finalResults.push([
        "ID", "Title", "Impressions", "Clicks", "Cost", "Avg CPC", "Conversions",
        "GA Item Quantity", "GA Unique Purchases", "GA Revenue Per Item", "GA Item Revenue", "GA Product Adds To Cart",
        "GMC Product Type", "GMC Price", "GMC Sale Price"
    ]);
    for (let i = 0; i < googleAdsItems.length; i++) {
        var row = googleAdsItems[i];
        var finalResultItem = [];
        finalResultItem[0] = row[0];
        finalResultItem[1] = row[1];
        finalResultItem[2] = row[2];
        finalResultItem[3] = row[3];
        finalResultItem[4] = row[4];
        finalResultItem[5] = row[5];
        finalResultItem[6] = row[6];
        if(googleAnalyticsItems[row[0]] !== undefined) {
            finalResultItem[7] = googleAnalyticsItems[row[0]][1];
            finalResultItem[8] = googleAnalyticsItems[row[0]][2];
            finalResultItem[9] = googleAnalyticsItems[row[0]][3];
            finalResultItem[10] = googleAnalyticsItems[row[0]][4];
            finalResultItem[11] = googleAnalyticsItems[row[0]][5];
        } else {
            finalResultItem[7] = "";
            finalResultItem[8] = "";
            finalResultItem[9] = "";
            finalResultItem[10] = "";
            finalResultItem[11] = "";
        }
        if (gmcItems[row[0]] !== undefined) {
            finalResultItem[12] = gmcItems[row[0]][3];
            finalResultItem[13] = gmcItems[row[0]][1];
            finalResultItem[14] = gmcItems[row[0]][2];
        } else {
            finalResultItem[12] = "";
            finalResultItem[13] = "";
            finalResultItem[14] = "";
        }
        finalResults.push(finalResultItem);
    }

    writeResults(finalResults, sheet);
}

function getGoogleAdsItems() {
    var report = AdsApp.search(
        "SELECT segments.product_item_id, segments.product_title, metrics.clicks, metrics.average_cpc, " +
        "metrics.conversions, metrics.impressions, metrics.cost_micros " +
        "FROM shopping_performance_view " +
        "WHERE segments.date BETWEEN '" + CONFIG.START_DATE + "' AND '" + CONFIG.END_DATE + "'");
    var count = 0;
    var result = [];
    while (report.hasNext()) {
        var row = report.next();
        count++;
        result.push([
            row.segments.productItemId.toLowerCase(), row.segments.productTitle, row.metrics.impressions,
            row.metrics.clicks, (parseFloat(row.metrics.costMicros) / 1000000).toFixed(2),
            row.metrics.averageCpc != undefined ? (parseFloat(row.metrics.averageCpc) / 1000000).toFixed(2) : "", row.metrics.conversions
        ]);
    }
    Logger.log("Google Ads product count: " + count);
    return result;
}

function getGMCItems() {
    const merchantId = CONFIG.GMC_MERCHANT_ID; // Replace this with your Merchant Center ID.
    let pageToken;
    let pageNum = 1;
    const maxResults = 250;
    var count = 0;
    var results = {};
    try {
        do {
            const products = ShoppingContent.Products.list(merchantId, {
                pageToken: pageToken,
                maxResults: maxResults
            });
            count += products.resources.length;
            // Logger.log('Page ' + pageNum);
            // Logger.log(products.resources[0]["offerId"] + " " + products.resources[0]["price"]["value"] + " " + products.resources[0]["salePrice"]["value"]);
            for (let i = 0; i < products.resources.length; i++) {
                var resultItem = [];
                resultItem[0] = products.resources[i]["offerId"];
                resultItem[1] = products.resources[i]["price"] !== undefined ? products.resources[i]["price"]["value"] : "";
                resultItem[2] = products.resources[i]["salePrice"] !== undefined ? products.resources[i]["salePrice"]["value"] : "";
                resultItem[3] = products.resources[i]["productTypes"] !== undefined ? products.resources[i]["productTypes"].join(" > ") : "";
                results[products.resources[i]["offerId"].toLowerCase()] = resultItem;
            }
            pageToken = products.nextPageToken;
            pageNum++;
        } while (pageToken);
    } catch (e) {
        // TODO (Developer) - Handle exceptions
        Logger.log('Failed with error: $s', e.error);
    }
    Logger.log("GMC product count: " + count);
    return results;
}

function getGAItems() {
    const viewId = CONFIG.GA_VIEW_ID;
    var startIndex = 1;
    var maxResults = 10000;
    const metric = 'ga:itemQuantity,ga:uniquePurchases,ga:revenuePerItem,ga:itemRevenue,ga:productAddsToCart';
    const options = {
        'dimensions': 'ga:productSku',
        "start-index": startIndex,
        "max-results": maxResults
    };
    // var report = Analytics.Data.Ga.get(viewId, CONFIG.START_DATE, CONFIG.END_DATE, metric, options);
    var hasNext = true;
    var count = 0;
    var result = {};
    while (hasNext) {
        var report = Analytics.Data.Ga.get(
            viewId, CONFIG.START_DATE, CONFIG.END_DATE, metric,
            options);
        if (report["containsSampledData"]) {
            Logger.log("IS SAMPLED: " + report["containsSampledData"]);
        }
        if (report.rows !== undefined) {
            for (var j = 0; j < report.rows.length; j++) {
                result[report.rows[j][0].toLowerCase()] = [
                    report.rows[j][0],report.rows[j][1],report.rows[j][2],report.rows[j][3],report.rows[j][4],report.rows[j][5]
                ];
            }
        }
        count += report.rows.length;
        if (report["nextLink"] === "" || report["nextLink"] === undefined) {
            hasNext = false;
        } else {
            startIndex = startIndex + maxResults;
            options['start-index'] = startIndex;
        }
    }
    Logger.log("GA items: " + count);
    // Logger.log(JSON.stringify(result));
    return result;
}

function validateAndGetSpreadsheet(spreadsheeturl) {
    if (spreadsheeturl === 'YOUR_SPREADSHEET_URL') {
        throw new Error('Please specify a valid Spreadsheet URL. You can find' +
            ' a link to a template in the associated guide for this script.');
    }
    return SpreadsheetApp.openByUrl(spreadsheeturl);
}

function writeResults(results, sheet) {
    var lastRow = sheet.getLastRow();
    var lastColumn = sheet.getLastColumn();
    if (lastRow > 0) {
        var rangeToClear = sheet.getRange(1, 1, lastRow, lastColumn);
        rangeToClear.clearContent();
    }
    Logger.log("Results to write length: " + results.length);
    var rangeToWrite = sheet.getRange(1, 1, results.length, results[0].length);
    // Logger.log(JSON.stringify(results));
    rangeToWrite.setValues(results);
}
