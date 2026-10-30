const SPREADSHEET_NAME = "2026公司旅遊";
const SHEET_NAME = "報名資料";
const HEADERS = ["姓名", "Email", "電話", "LINE", "報名時間"];

function doPost(event) {
  try {
    const data = event && event.parameter ? event.parameter : {};
    const name = String(data.name || "").trim();
    const email = String(data.email || "").trim();
    const phone = String(data.phone || "").trim();
    const line = String(data.line || "").trim();

    if (!name || !phone || !line) {
      return htmlResponse({
        requestId: String(data.requestId || ""),
        success: false,
        error: "姓名、手機與 LINE 為必填欄位。",
      });
    }

    const spreadsheet = getOrCreateSpreadsheet_();
    const sheet = getOrCreateSheet_(spreadsheet);
    const phoneColumn = HEADERS.indexOf("電話") + 1;
    sheet.getRange(1, phoneColumn, sheet.getMaxRows(), 1).setNumberFormat("@");
    sheet.appendRow([name, email, phone, line, new Date()]);

    return htmlResponse({ requestId: String(data.requestId || ""), success: true });
  } catch (error) {
    console.error("Unable to save registration:", error);
    return htmlResponse({
      requestId: String(event && event.parameter ? event.parameter.requestId || "" : ""),
      success: false,
      error: "無法儲存報名資料，請稍後再試。",
    });
  }
}

function getOrCreateSpreadsheet_() {
  const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  while (files.hasNext()) {
    const file = files.next();
    if (file.getMimeType() === MimeType.GOOGLE_SHEETS) {
      return SpreadsheetApp.openById(file.getId());
    }
  }
  return SpreadsheetApp.create(SPREADSHEET_NAME);
}

function getOrCreateSheet_(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.getSheets()[0];
    sheet.setName(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
  return sheet;
}

function htmlResponse(payload) {
  const serialized = JSON.stringify(payload).replace(/</g, "\\u003c");
  const html = `<script>window.top.postMessage(${serialized}, "*");</script>`;
  return HtmlService.createHtmlOutput(html);
}
