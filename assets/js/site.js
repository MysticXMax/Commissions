(() => {
  "use strict";

  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-site-nav]");

  if (!navToggle || !nav) return;

  const closeNav = () => {
    nav.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  const toggleNav = () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  };

  navToggle.addEventListener("click", toggleNav);

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeNav();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeNav();
  });
})();

window.addEventListener("DOMContentLoaded", async function () {
  const avatars = [
    { url: "avatars/11.png", name: "Avatar 11" },
    { url: "avatars/22.png", name: "Avatar 22" },
    { url: "avatars/33.png", name: "Avatar 33" },
    { url: "avatars/44.png", name: "Avatar 44" },
    { url: "avatars/55.png", name: "Avatar 55" },
    { url: "avatars/66.png", name: "Avatar 66" },
    { url: "avatars/77.png", name: "Avatar 77" },
    { url: "avatars/88.jpg", name: "Avatar 88" },
    { url: "avatars/99.png", name: "Avatar 99" },
    { url: "avatars/111.png", name: "Avatar 111" },
  ];

  const img = document.getElementById("randomAvatar");
  let previousIndex = null;
  let isChanging = false;

  if (!img) return;

  img.style.transition = "opacity 1s ease-in-out";
  img.style.willChange = "opacity";
  img.style.opacity = "0";

  function getRandomAvatar() {
    if (avatars.length === 0) return null;
    if (avatars.length === 1) return avatars[0];

    const availableIndices = avatars
      .map((_, index) => index)
      .filter((index) => index !== previousIndex);

    const randomIndex =
      availableIndices[Math.floor(Math.random() * availableIndices.length)];
    return avatars[randomIndex];
  }

  async function changeAvatar() {
    if (isChanging || avatars.length === 0) return;
    isChanging = true;

    img.style.opacity = "0";

    await new Promise((resolve) => setTimeout(resolve, 800));

    const result = getRandomAvatar();

    if (result) {
      img.src = result.url;
      img.alt = result.name;
      previousIndex = avatars.findIndex((a) => a.url === result.url);

      await new Promise((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = resolve;
          img.onerror = resolve;
        }
      });

      requestAnimationFrame(() => {
        img.style.opacity = "1";
      });

      await new Promise((resolve) => setTimeout(resolve, 1200));
    } else {
      img.style.opacity = "1";
    }

    isChanging = false;
  }

  const initialResult = getRandomAvatar();
  if (initialResult) {
    img.src = initialResult.url;
    img.alt = initialResult.name;
    previousIndex = avatars.findIndex((a) => a.url === initialResult.url);

    await new Promise((resolve) => {
      if (img.complete) {
        resolve();
      } else {
        img.onload = resolve;
        img.onerror = resolve;
      }
    });

    await new Promise((resolve) => setTimeout(resolve, 300));

    requestAnimationFrame(() => {
      img.style.opacity = "1";
    });
  }

  setInterval(changeAvatar, 15000);
});
