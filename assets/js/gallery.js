(() => {
  "use strict";

  const avatars = {
    avatar1: { title: "Erolic", base: "Regulus", imgs: ["../avatars/11.png"] },
    avatar2: {
      title: "Erolis",
      base: "Regulus 3.0",
      imgs: ["../avatars/22.png"],
    },
    avatar3: { title: "Mistic", base: "Regulus", imgs: ["../avatars/33.png"] },
    avatar4: { title: "Null", base: "Nardoragon", imgs: ["../avatars/44.png"] },
    avatar5: { title: "Loufy", base: "Regulus", imgs: ["../avatars/55.png"] },
    avatar6: { title: "Ara", base: "Regulus", imgs: ["../avatars/66.png"] },
    avatar7: {
      title: "Cristal",
      base: "Regulus 3.0",
      imgs: ["../avatars/77.png"],
    },
    avatar8: { title: "Stas", base: "Mayu", imgs: ["../avatars/88.jpg"] },
    avatar9: {
      title: "Kenith",
      base: "Novabeast",
      imgs: ["../avatars/99.png"],
    },
    avatar10: { title: "Blaze", base: "Custom", imgs: ["../avatars/111.png"] },
    avatar11: {
      title: "Void",
      base: "Custom",
      imgs: ["../avatars/121.png", "../avatars/121.1.png"],
    },
  };

  const modal = document.getElementById("avatar-details");
  const title = document.getElementById("avatar-title");
  const base = document.getElementById("avatar-base");
  const img = document.getElementById("avatar-img");
  const prevBtn = document.getElementById("slider-prev");
  const nextBtn = document.getElementById("slider-next");

  if (!modal || !title || !base || !img) return;

  let currentImages = [];
  let currentIndex = 0;

  const updateImage = () => {
    img.style.opacity = "0";
    setTimeout(() => {
      img.src = currentImages[currentIndex];
      img.alt = `${title.textContent} full avatar preview ${currentIndex + 1}`;
      img.style.opacity = "1";
    }, 150);

    if (currentImages.length > 1) {
      prevBtn.style.display = "flex";
      nextBtn.style.display = "flex";
    } else {
      prevBtn.style.display = "none";
      nextBtn.style.display = "none";
    }
  };

  const openModal = (avatarId) => {
    const avatar = avatars[avatarId];
    if (!avatar) return;

    currentImages = Array.isArray(avatar.imgs) ? avatar.imgs : [avatar.img];
    currentIndex = 0;

    title.textContent = avatar.title;
    base.textContent = avatar.base;

    updateImage();
    modal.hidden = false;
    document.body.classList.add("no-scroll");
  };

  const closeModal = () => {
    modal.hidden = true;
    document.body.classList.remove("no-scroll");
  };

  prevBtn.addEventListener("click", () => {
    currentIndex =
      (currentIndex - 1 + currentImages.length) % currentImages.length;
    updateImage();
  });

  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % currentImages.length;
    updateImage();
  });

  document.addEventListener("click", (event) => {
    const card = event.target.closest("[data-avatar]");
    if (card) {
      openModal(card.dataset.avatar);
      return;
    }

    if (event.target.closest("[data-close-avatar]") || event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (modal.hidden) return;
    if (event.key === "Escape") closeModal();
    if (event.key === "ArrowLeft" && currentImages.length > 1) prevBtn.click();
    if (event.key === "ArrowRight" && currentImages.length > 1) nextBtn.click();
  });
})();
