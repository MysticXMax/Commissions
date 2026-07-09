(() => {
  "use strict";

  const button = document.querySelector("[data-back-to-top]");

  if (!button) return;

  const updateButton = () => {
    button.classList.toggle("is-visible", window.scrollY > 360);
  };

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", updateButton, { passive: true });
  updateButton();
})();
