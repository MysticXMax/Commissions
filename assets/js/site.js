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
  const numbers = [11, 22, 33, 44, 55, 66, 77, 88, 99, 111];
  const extensions = ["png", "jpg", "jpeg"];
  const img = document.getElementById("randomAvatar");
  let previousNum = null;
  let isChanging = false;

  img.style.transition = "opacity 0.8s ease-in-out";
  img.style.willChange = "opacity";

  async function getRandomAvatar() {
    const availableNumbers = numbers.filter((n) => n !== previousNum);
    const shuffledNumbers = availableNumbers.sort(() => Math.random() - 0.5);

    for (const num of shuffledNumbers) {
      const shuffledExts = extensions.sort(() => Math.random() - 0.5);

      for (const ext of shuffledExts) {
        const url = `avatars/${num}.${ext}`;
        const exists = await checkFileExists(url);

        if (exists) {
          return { url, num };
        }
      }
    }

    const shuffledNumbersFull = numbers.sort(() => Math.random() - 0.5);
    for (const num of shuffledNumbersFull) {
      const shuffledExts = extensions.sort(() => Math.random() - 0.5);

      for (const ext of shuffledExts) {
        const url = `avatars/${num}.${ext}`;
        const exists = await checkFileExists(url);

        if (exists) {
          return { url, num };
        }
      }
    }

    return null;
  }

  async function changeAvatar() {
    if (isChanging) return;
    isChanging = true;

    img.style.opacity = "0";

    await new Promise((resolve) => setTimeout(resolve, 800));

    const result = await getRandomAvatar();

    if (result) {
      img.src = result.url;
      img.alt = `Avatar ${result.num}`;
      previousNum = result.num;

      await new Promise((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = resolve;
        }
      });

      requestAnimationFrame(() => {
        img.style.opacity = "1";
      });

      await new Promise((resolve) => setTimeout(resolve, 800));
    } else {
      console.error("No avatar images found!");
      img.style.opacity = "1";
    }

    isChanging = false;
  }

  const initialResult = await getRandomAvatar();
  if (initialResult) {
    img.src = initialResult.url;
    img.alt = `Avatar ${initialResult.num}`;
    previousNum = initialResult.num;
    img.style.opacity = "1";
  }

  setInterval(changeAvatar, 15000);
});

async function checkFileExists(url) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch (error) {
    return false;
  }
}
