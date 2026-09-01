const header = document.getElementById("header");
const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");
const mobileClose = document.getElementById("mobileClose");
const signupForm = document.getElementById("signupForm");
const formSuccess = document.getElementById("formSuccess");
const formError = document.getElementById("formError");
const signupSubmit = document.getElementById("signupSubmit");

const FORM_EMAIL = "cheer.legion@gmail.com";

const BRANCH_LABELS = {
  "teplyj-stan": "Тёплый Стан",
  nagatinskij: "Нагатинская",
  dobrolyubova: "Добролюбова",
  "odintsovo-9": "Одинцово — школа №9",
  "odintsovo-logos": "Одинцово — школа «Логос»",
  "yaroslavl-tsport": "Ярославль — Т-Спорт",
};
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");
const legalModal = document.getElementById("legalModal");
const legalModalContent = document.getElementById("legalModalContent");

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 50);
});

burger?.addEventListener("click", () => mobileMenu.classList.add("open"));
mobileClose?.addEventListener("click", () => mobileMenu.classList.remove("open"));

document.querySelectorAll(".mobile-menu a").forEach((link) => {
  link.addEventListener("click", () => mobileMenu.classList.remove("open"));
});

const ageInput = document.getElementById("age");
const phoneInput = document.getElementById("phone");
const consentInput = document.getElementById("consent");

function clearFieldValidity(...fields) {
  fields.forEach((field) => field?.setCustomValidity(""));
}

function bindValidityReset(...fields) {
  fields.forEach((field) => {
    field?.addEventListener("input", () => field.setCustomValidity(""));
    field?.addEventListener("change", () => field.setCustomValidity(""));
  });
}

function validateSignupForm() {
  const nameInput = signupForm?.name;
  const branchInput = signupForm?.branch;

  clearFieldValidity(nameInput, phoneInput, branchInput, ageInput, consentInput);

  let firstInvalid = null;

  if (!nameInput?.value.trim()) {
    nameInput.setCustomValidity("Укажите, как к вам обращаться.");
    firstInvalid ??= nameInput;
  }

  const phoneDigits = extractPhoneDigits(phoneInput?.value || "");
  if (!phoneDigits.length) {
    phoneInput?.setCustomValidity("Укажите номер телефона.");
    firstInvalid ??= phoneInput;
  } else if (!isPhoneComplete(phoneInput.value)) {
    phoneInput.setCustomValidity("Введите номер телефона полностью.");
    firstInvalid ??= phoneInput;
  }

  if (!branchInput?.value) {
    branchInput.setCustomValidity("Выберите филиал.");
    firstInvalid ??= branchInput;
  }

  if (!ageInput?.value) {
    ageInput?.setCustomValidity("Укажите возраст спортсмена.");
    firstInvalid ??= ageInput;
  }

  if (!consentInput?.checked) {
    consentInput.setCustomValidity("Подтвердите согласие на обработку персональных данных.");
    firstInvalid ??= consentInput;
  }

  if (firstInvalid) {
    firstInvalid.reportValidity();
    return false;
  }

  return true;
}

bindValidityReset(signupForm?.name, phoneInput, signupForm?.branch, ageInput, consentInput);

function extractPhoneDigits(value) {
  let digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("8")) digits = `7${digits.slice(1)}`;
  if (digits.startsWith("7")) digits = digits.slice(1);
  return digits.slice(0, 10);
}

function formatPhone(digits) {
  if (!digits) return "";

  const part1 = digits.slice(0, 3);
  const part2 = digits.slice(3, 6);
  const part3 = digits.slice(6, 8);
  const part4 = digits.slice(8, 10);

  let formatted = `+7 (${part1}`;
  if (digits.length < 3) return formatted;

  formatted += ")";
  if (!part2) return formatted;

  formatted += ` ${part2}`;
  if (!part3) return formatted;

  formatted += `-${part3}`;
  if (!part4) return formatted;

  return `${formatted}-${part4}`;
}

function applyPhoneMask() {
  if (!phoneInput) return;
  const digits = extractPhoneDigits(phoneInput.value);
  phoneInput.value = formatPhone(digits);
}

function isPhoneComplete(value) {
  return extractPhoneDigits(value).length === 10;
}

phoneInput?.addEventListener("focus", () => {
  if (!extractPhoneDigits(phoneInput.value)) {
    phoneInput.value = "+7 (";
  }
});

phoneInput?.addEventListener("input", applyPhoneMask);

phoneInput?.addEventListener("paste", (e) => {
  e.preventDefault();
  const text = (e.clipboardData || window.clipboardData).getData("text");
  phoneInput.value = text;
  applyPhoneMask();
});

phoneInput?.addEventListener("blur", () => {
  if (!extractPhoneDigits(phoneInput.value)) {
    phoneInput.value = "";
  }
});

function sanitizeAgeInput() {
  if (!ageInput) return;
  const digits = ageInput.value.replace(/\D/g, "").slice(0, ageInput.maxLength || 2);
  if (ageInput.value !== digits) ageInput.value = digits;
}

ageInput?.addEventListener("beforeinput", (e) => {
  if (e.inputType.startsWith("delete") || e.inputType === "historyUndo" || e.inputType === "historyRedo") return;
  if (e.inputType === "insertFromPaste" || e.inputType === "insertFromDrop") return;
  if (e.data && /\D/.test(e.data)) e.preventDefault();
});

ageInput?.addEventListener("input", sanitizeAgeInput);

ageInput?.addEventListener("paste", (e) => {
  e.preventDefault();
  const text = (e.clipboardData || window.clipboardData).getData("text");
  ageInput.value = text.replace(/\D/g, "").slice(0, ageInput.maxLength || 2);
});

ageInput?.addEventListener("drop", (e) => {
  e.preventDefault();
});

ageInput?.addEventListener("blur", sanitizeAgeInput);

signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  sanitizeAgeInput();

  if (!validateSignupForm()) return;

  const honey = signupForm.querySelector('[name="_honey"]');
  if (honey?.value) return;

  const name = signupForm.name?.value.trim();
  const phone = signupForm.phone?.value.trim();
  const branch = signupForm.branch?.value;
  const age = ageInput.value;

  if (!name || !phone || !branch) return;

  formError.hidden = true;
  signupSubmit.disabled = true;
  const defaultLabel = signupSubmit.textContent;
  signupSubmit.textContent = "Отправка…";

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(FORM_EMAIL)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name,
        phone,
        branch: BRANCH_LABELS[branch] || branch,
        age,
        _subject: "Новая заявка — СК «Легион»",
        _template: "table",
        _captcha: "false",
      }),
    });

    if (!response.ok) throw new Error("submit failed");

    signupForm.style.display = "none";
    formSuccess.classList.add("show");
  } catch {
    formError.hidden = false;
    signupSubmit.disabled = false;
    signupSubmit.textContent = defaultLabel;
  }
});

document.querySelectorAll(".gallery-item").forEach((item) => {
  item.addEventListener("click", () => {
    const img = item.querySelector("img");
    if (img) {
      lightboxImg.src = img.src;
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
    }
  });
});

lightboxClose?.addEventListener("click", closeLightbox);
lightbox?.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

function closeLightbox() {
  lightbox.classList.remove("open");
  document.body.style.overflow = "";
}

function openLegalModal(sectionId) {
  if (!legalModal) return;
  legalModal.hidden = false;
  document.body.style.overflow = "hidden";
  if (sectionId) {
    const section = legalModalContent?.querySelector(`#${sectionId}`);
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    legalModalContent?.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function closeLegalModal() {
  if (!legalModal) return;
  legalModal.hidden = true;
  if (!lightbox?.classList.contains("open")) {
    document.body.style.overflow = "";
  }
}

document.querySelectorAll("[data-legal-open]").forEach((trigger) => {
  trigger.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openLegalModal(trigger.dataset.legalSection || "");
  });
});

document.querySelectorAll("[data-legal-close]").forEach((el) => {
  el.addEventListener("click", closeLegalModal);
});

if (location.hash === "#legal") {
  openLegalModal();
  history.replaceState(null, "", location.pathname + location.search);
} else if (location.hash === "#privacy") {
  openLegalModal("privacy");
  history.replaceState(null, "", location.pathname + location.search);
}

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!legalModal?.hidden) closeLegalModal();
  else closeLightbox();
});

function initHorizontalScroll(slider, prev, next, itemSelector) {
  if (!slider) return;

  const getStep = () => {
    const item = slider.querySelector(itemSelector);
    if (!item) return 300;
    const gap = parseFloat(getComputedStyle(slider).gap) || 16;
    return item.offsetWidth + gap;
  };

  const updateNav = () => {
    if (!prev || !next) return;
    const maxScroll = slider.scrollWidth - slider.clientWidth;
    prev.disabled = slider.scrollLeft <= 4;
    next.disabled = slider.scrollLeft >= maxScroll - 4;
  };

  prev?.addEventListener("click", () => {
    slider.scrollBy({ left: -getStep(), behavior: "smooth" });
  });

  next?.addEventListener("click", () => {
    slider.scrollBy({ left: getStep(), behavior: "smooth" });
  });

  slider.addEventListener("scroll", updateNav, { passive: true });
  window.addEventListener("resize", updateNav);
  updateNav();
}

const reviewsSlider = document.getElementById("reviewsSlider");
const reviewsPrev = document.getElementById("reviewsPrev");
const reviewsNext = document.getElementById("reviewsNext");
const gallerySlider = document.getElementById("gallerySlider");
const galleryPrev = document.getElementById("galleryPrev");
const galleryNext = document.getElementById("galleryNext");

initHorizontalScroll(reviewsSlider, reviewsPrev, reviewsNext, ".review-card");
initHorizontalScroll(gallerySlider, galleryPrev, galleryNext, ".gallery-item");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
);

document.querySelectorAll(".section:not(#contacts):not(.reviews-section):not(.gallery-section), .award-card, .benefit-card, .coach-card, .price-card, .age-card, .branch-card, .news-item").forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(24px)";
  el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  observer.observe(el);
});

document.querySelectorAll(".reviews-section .container, .gallery-section .container").forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(24px)";
  el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  observer.observe(el);
});
