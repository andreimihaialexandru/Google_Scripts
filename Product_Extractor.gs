

// ABOUT THE SCRIPT
// Export productdata from Shopping campaigns to a sheet.
//
////////////////////////////////////////////////////////////////////

var config = {

  LOG : true,
  DATE_RANGE : last_n_days(30),
  
  // Edit the URL of an empty Google Sheet in here, with '/edit' at the end
  SPREADSHEET_URL : "https://docs.google.com/spreadsheets/d/157OL6W-cPGLluednqM48meLUQ-bNmqx4pRqC6N9IR6c/edit",
  CALCULATE_ROI: false

}  
  
////////////////////////////////////////////////////////////////////

function main() {
  
	var spreadsheet = SpreadsheetApp.openByUrl(config.SPREADSHEET_URL);
  var from = config.DATE_RANGE[0];
  var to = config.DATE_RANGE[1];
  
  var report = AdsApp.report(
    "SELECT ProductTitle, OfferId, Cost, Impressions, Clicks,  AverageCpc, Conversions, ConversionValue " +
    "FROM SHOPPING_PERFORMANCE_REPORT " +
    "DURING " + from +","+ to);
  
  var sheet = spreadsheet.getActiveSheet()
  report.exportToSheet(sheet);
  
  if(config.CALCULATE_ROI === true){
    sheet.getRange("I1").setValue("ROI");

      for(var i = 2;i < sheet.getLastRow()+1;i++){
        var cost = sheet.getRange("H"+i).getValue();
        var revenue = sheet.getRange("G"+i).getValue();

        if(cost > 0 && revenue > 0){ var roi = cost / revenue; } else { var roi = 0; }
        sheet.getRange("I"+i).setValue(parseFloat(roi).toFixed(2));   

      } // rowIterator
  }
  
  Logger.log("WebDigital Product Extractor was here..");
  
} // function main()

////////////////////////////////////////////////////////////////////

function last_n_days(n) {
  
	var	from = new Date(), to = new Date();
	to.setUTCDate(from.getUTCDate() - n);
  
	return googleDateRange(from, to);
  
} // function last_n_days()

////////////////////////////////////////////////////////////////////

function googleDateRange(from, to) {
  
	function googleFormat(date) {
    
		var date_array = [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()];
    
		if (date_array[1] < 10) date_array[1] = '0' + date_array[1];
		if (date_array[2] < 10) date_array[2] = '0' + date_array[2];
    
		return date_array.join('');
	}
  
	var inverse = (from > to);
	from = googleFormat(from);
	to = googleFormat(to);
  
	var result = [from, to];
	
  if (inverse) {
		result = [to, from];
	}
  
	return result;
  
} // function googleDateRange()
