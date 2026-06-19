const header = document.getElementById("header");
const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");
const mobileClose = document.getElementById("mobileClose");
const signupForm = document.getElementById("signupForm");
const formSuccess = document.getElementById("formSuccess");
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

signupForm?.addEventListener("submit", (e) => {
  sanitizeAgeInput();
  if (!ageInput?.value) {
    e.preventDefault();
    ageInput?.focus();
    return;
  }
  e.preventDefault();
  signupForm.style.display = "none";
  formSuccess.classList.add("show");
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

const reviewsSlider = document.getElementById("reviewsSlider");
const reviewsPrev = document.getElementById("reviewsPrev");
const reviewsNext = document.getElementById("reviewsNext");

function getReviewScrollStep() {
  const card = reviewsSlider?.querySelector(".review-card");
  if (!card || !reviewsSlider) return 360;
  const gap = parseFloat(getComputedStyle(reviewsSlider).gap) || 24;
  return card.offsetWidth + gap;
}

function updateReviewsNav() {
  if (!reviewsSlider || !reviewsPrev || !reviewsNext) return;
  const maxScroll = reviewsSlider.scrollWidth - reviewsSlider.clientWidth;
  reviewsPrev.disabled = reviewsSlider.scrollLeft <= 4;
  reviewsNext.disabled = reviewsSlider.scrollLeft >= maxScroll - 4;
}

reviewsPrev?.addEventListener("click", () => {
  reviewsSlider?.scrollBy({ left: -getReviewScrollStep(), behavior: "smooth" });
});

reviewsNext?.addEventListener("click", () => {
  reviewsSlider?.scrollBy({ left: getReviewScrollStep(), behavior: "smooth" });
});

reviewsSlider?.addEventListener("scroll", updateReviewsNav, { passive: true });
window.addEventListener("resize", updateReviewsNav);
updateReviewsNav();

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

document.querySelectorAll(".section:not(#contacts):not(.reviews-section), .award-card, .benefit-card, .coach-card, .price-card, .age-card, .branch-card, .news-item").forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(24px)";
  el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  observer.observe(el);
});

document.querySelectorAll(".reviews-section .container").forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(24px)";
  el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  observer.observe(el);
});
