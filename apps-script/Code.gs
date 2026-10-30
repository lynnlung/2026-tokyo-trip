const SPREADSHEET_NAME = "2026公司旅遊";
const SHEET_NAME = "報名資料";
const HEADERS = ["姓名", "Email", "電話", "LINE", "報名時間"];

function doGet(event) {
  const requestId = getRequestId_(event);
  const cachedResult = requestId ? CacheService.getScriptCache().get(`registration:${requestId}`) : null;
  const result = cachedResult
    ? JSON.parse(cachedResult)
    : { success: false, error: "找不到這筆報名結果，請重新送出。" };
  const serialized = JSON.stringify(result).replace(/</g, "\\u003c");
  return ContentService
    .createTextOutput(`window.__receiveRegistrationStatus(${serialized});`)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function doPost(event) {
  const data = event && event.parameter ? event.parameter : {};
  const requestId = getRequestId_(event);
  try {
    const name = String(data.name || "").trim();
    const email = String(data.email || "").trim();
    const phone = String(data.phone || "").trim();
    const line = String(data.line || "").trim();

    if (!name || !phone || !line) {
      storeResult_(requestId, { success: false, error: "姓名、手機與 LINE 為必填欄位。" });
      return textResponse_();
    }

    const spreadsheet = getOrCreateSpreadsheet_();
    const sheet = getOrCreateSheet_(spreadsheet);
    const phoneColumn = HEADERS.indexOf("電話") + 1;
    const row = sheet.getLastRow() + 1;
    sheet.appendRow([name, email, "", line, new Date()]);
    const phoneCell = sheet.getRange(row, phoneColumn);
    phoneCell.setNumberFormat("@");
    phoneCell.setValue(`'${phone}`);

    storeResult_(requestId, { success: true });
    return textResponse_();
  } catch (error) {
    console.error("Unable to save registration:", error);
    storeResult_(requestId, { success: false, error: "無法儲存報名資料，請稍後再試。" });
    return textResponse_();
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

function getRequestId_(event) {
  const requestId = String(event && event.parameter ? event.parameter.requestId || "" : "");
  return /^[\w-]{1,80}$/.test(requestId) ? requestId : "";
}

function storeResult_(requestId, result) {
  if (!requestId) return;
  CacheService.getScriptCache().put(`registration:${requestId}`, JSON.stringify(result), 300);
}

function textResponse_() {
  return ContentService.createTextOutput("ok").setMimeType(ContentService.MimeType.TEXT);
}
