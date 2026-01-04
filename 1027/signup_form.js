const form = document.getElementById("signupForm");
const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");
const tagsContainer = document.getElementById("interestTags");
const alertContainer = document.getElementById("alertMessage");
const strengthBar = document.getElementById("strength-bar");
const strengthText = document.getElementById("strength-text");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const fieldIds = ["name", "email", "phone", "password", "confirmPassword", "terms"];
const touched = new Set();
const STORAGE_KEY = "week07_signup_cache";

function setError(inputEl, messageText) {
  const errorEl = document.getElementById(inputEl.id + "-error");
  inputEl.setCustomValidity(messageText);
  if (errorEl) errorEl.textContent = messageText;
  if (messageText) {
    inputEl.classList.add("is-invalid");
    inputEl.classList.remove("is-valid");
  } else {
    inputEl.classList.remove("is-invalid");
    inputEl.classList.add("is-valid");
  }
}

function passwordStrengthScore(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  let label = "弱";
  let width = 25;
  let cls = "bg-danger";
  if (score >= 3) {
    label = "中";
    width = 60;
    cls = "bg-warning";
  }
  if (score >= 5) {
    label = "強";
    width = 100;
    cls = "bg-success";
  }
  strengthBar.style.width = width + "%";
  strengthBar.className = "progress-bar " + cls;
  strengthText.textContent = "強度：" + label;
  return score;
}

function validateField(inputEl) {
  const val = inputEl.type === "checkbox" ? inputEl.checked : inputEl.value.trim();
  setError(inputEl, "");
  if (inputEl.required && (val === "" || val === false)) {
    setError(inputEl, "此欄位為必填");
    return false;
  }
  if (inputEl.id === "email" && inputEl.validity.typeMismatch) {
    setError(inputEl, "請輸入有效的 Email 格式");
    return false;
  }
  if (inputEl.id === "phone" && !/^09\d{8}$/.test(inputEl.value.trim())) {
    setError(inputEl, "手機需為 09 開頭之 10 碼數字");
    return false;
  }
  if (inputEl.id === "password") {
    const score = passwordStrengthScore(inputEl.value);
    if (inputEl.value.length < 8) {
      setError(inputEl, "密碼至少 8 碼");
      return false;
    }
    if (score < 3) {
      setError(inputEl, "請包含大小寫字母與數字");
      return false;
    }
  }
  if (inputEl.id === "confirmPassword") {
    if (inputEl.value !== passwordInput.value) {
      setError(inputEl, "兩次密碼不一致");
      return false;
    }
  }
  if (inputEl.id === "terms" && inputEl.checked !== true) {
    setError(inputEl, "需同意服務條款");
    return false;
  }
  return true;
}

function validateInterests() {
  const selected = tagsContainer.querySelectorAll(".text-bg-primary").length;
  const err = document.getElementById("interest-error");
  err.textContent = "";
  if (selected === 0) {
    err.textContent = "請至少選擇一個興趣";
    return false;
  }
  return true;
}

function validateAll() {
  let firstInvalid = null;
  fieldIds.forEach(function (id) {
    const el = document.getElementById(id);
    const ok = validateField(el);
    if (!ok && !firstInvalid) firstInvalid = el;
  });
  const interestOk = validateInterests();
  if (!interestOk && !firstInvalid) firstInvalid = tagsContainer;
  return firstInvalid;
}

function showAlert(messageText, type) {
  alertContainer.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible fade show" role="alert">' + messageText + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
  alertContainer.style.display = "block";
}

fieldIds.forEach(function (id) {
  const el = document.getElementById(id);
  el.addEventListener("blur", function () {
    touched.add(id);
    validateField(el);
    if (id === "password") validateField(confirmPasswordInput);
  });
  el.addEventListener("input", function () {
    if (touched.has(id) || id === "password") {
      validateField(el);
      if (id === "password") validateField(confirmPasswordInput);
    }
    saveCache();
  });
  if (id === "terms") {
    el.addEventListener("change", function () {
      validateField(el);
      saveCache();
    });
  }
});

tagsContainer.addEventListener("click", function (evt) {
  const tagEl = evt.target.closest(".tag");
  if (!tagEl) return;
  tagEl.classList.toggle("text-bg-secondary");
  tagEl.classList.toggle("text-bg-primary");
  validateInterests();
  saveCache();
});

form.addEventListener("submit", async function (evt) {
  evt.preventDefault();
  fieldIds.forEach(function (id) { touched.add(id); });
  const firstInvalid = validateAll();
  if (firstInvalid) {
    if (firstInvalid.focus) firstInvalid.focus();
    showAlert("表單驗證未通過，請修正後再送出", "danger");
    return;
  }
  submitBtn.disabled = true;
  submitBtn.textContent = "註冊中...";
  alertContainer.style.display = "none";
  await new Promise(function (r) { setTimeout(r, 1000); });
  showAlert("註冊成功", "success");
  resetState();
  localStorage.removeItem(STORAGE_KEY);
});

function resetState() {
  form.reset();
  Array.from(form.querySelectorAll(".is-invalid,.is-valid")).forEach(function (el) { el.classList.remove("is-invalid", "is-valid"); });
  Array.from(form.querySelectorAll(".text-danger")).forEach(function (el) { el.textContent = ""; });
  passwordStrengthScore("");
  tagsContainer.querySelectorAll(".tag").forEach(function (t) { t.classList.remove("text-bg-primary"); t.classList.add("text-bg-secondary"); });
  touched.clear();
  submitBtn.disabled = false;
  submitBtn.textContent = "註冊";
  alertContainer.style.display = "none";
}

resetBtn.addEventListener("click", function () {
  resetState();
  localStorage.removeItem(STORAGE_KEY);
});

function saveCache() {
  const data = {};
  fieldIds.forEach(function (id) {
    const el = document.getElementById(id);
    data[id] = el.type === "checkbox" ? el.checked : el.value;
  });
  data.interests = Array.from(tagsContainer.querySelectorAll(".text-bg-primary")).map(function (t) { return t.dataset.interest; });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadCache() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  const data = JSON.parse(raw);
  fieldIds.forEach(function (id) {
    const el = document.getElementById(id);
    if (el.type === "checkbox") el.checked = !!data[id]; else el.value = data[id] || "";
  });
  if (data.interests && Array.isArray(data.interests)) {
    tagsContainer.querySelectorAll(".tag").forEach(function (t) {
      const k = t.dataset.interest;
      if (data.interests.includes(k)) {
        t.classList.remove("text-bg-secondary");
        t.classList.add("text-bg-primary");
      }
    });
  }
  passwordStrengthScore(passwordInput.value || "");
}

window.addEventListener("load", loadCache);
