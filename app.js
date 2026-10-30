// Public Apps Script web app used for Google Sheets registration submissions.
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyx_AmfQd_ABYB4I5R5FXse38vTgUVz-Fz-P8YFAhy1ZP6osTBctGmB3bPKb6-XOJN_zQ/exec";

const form = document.querySelector("#registration-form");
const statusMessage = document.querySelector("#form-status");
const submitButton = form.querySelector('button[type="submit"]');
const requiredFields = ["name", "phone", "line"];

function setStatus(message, state) {
  statusMessage.textContent = message;
  if (state) {
    statusMessage.dataset.state = state;
  } else {
    delete statusMessage.dataset.state;
  }
}

function getRegistrationResult(requestId) {
  return new Promise((resolve, reject) => {
    const callbackName = "__receiveRegistrationStatus";
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Timed out waiting for Apps Script"));
    }, 15000);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (result) => {
      cleanup();
      resolve(result);
    };
    script.async = true;
    script.onerror = () => {
      cleanup();
      reject(new Error("Unable to read Apps Script submission status"));
    };
    script.src = `${APPS_SCRIPT_URL}?requestId=${encodeURIComponent(requestId)}`;
    document.head.append(script);
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  setStatus("", "");

  let firstInvalidField;
  for (const fieldName of requiredFields) {
    const field = form.elements.namedItem(fieldName);
    const isValid = field.value.trim().length > 0;
    field.setAttribute("aria-invalid", String(!isValid));
    if (!isValid && !firstInvalidField) firstInvalidField = field;
  }

  const email = form.elements.namedItem("email");
  email.setAttribute("aria-invalid", String(email.value.trim() !== "" && !email.validity.valid));
  if (email.value.trim() !== "" && !email.validity.valid && !firstInvalidField) firstInvalidField = email;

  if (firstInvalidField) {
    setStatus("請確認必填欄位與 Email 格式，再送出報名。", "error");
    firstInvalidField.focus();
    return;
  }

  if (!APPS_SCRIPT_URL) {
    setStatus("報名表單尚未連接 Google Sheet。完成 Apps Script 部署並設定網址後，即可送出。", "error");
    return;
  }

  submitButton.disabled = true;
  setStatus("報名資料送出中，請稍候…", "");
  const requestId = crypto.randomUUID();
  const payload = new URLSearchParams(new FormData(form));
  payload.set("email", email.value.trim());
  payload.set("requestId", requestId);

  fetch(APPS_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    body: payload,
  })
    .then(() => getRegistrationResult(requestId))
    .then((result) => {
      if (!result.success) throw new Error(result.error || "Registration was not saved");
      form.reset();
      form.querySelectorAll("[aria-invalid]").forEach((field) => field.removeAttribute("aria-invalid"));
      setStatus("報名成功！我們會透過你留下的聯絡方式與你聯繫。", "");
    })
    .catch((error) => {
      console.error("Registration submission failed:", error);
      setStatus("報名送出失敗，請稍後再試，或聯絡活動主辦人。", "error");
    })
    .finally(() => {
      submitButton.disabled = false;
    });
});

for (const field of form.querySelectorAll("input")) {
  field.addEventListener("input", () => field.removeAttribute("aria-invalid"));
}
