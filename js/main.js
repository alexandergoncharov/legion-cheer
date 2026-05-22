const header = document.getElementById("header");
const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");
const mobileClose = document.getElementById("mobileClose");
const signupForm = document.getElementById("signupForm");
const formSuccess = document.getElementById("formSuccess");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 50);
});

burger?.addEventListener("click", () => mobileMenu.classList.add("open"));
mobileClose?.addEventListener("click", () => mobileMenu.classList.remove("open"));

document.querySelectorAll(".mobile-menu a").forEach((link) => {
  link.addEventListener("click", () => mobileMenu.classList.remove("open"));
});

signupForm?.addEventListener("submit", (e) => {
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

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
});

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

document.querySelectorAll(".section, .award-card, .benefit-card, .coach-card, .price-card, .news-item, .review-card").forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(24px)";
  el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  observer.observe(el);
});
