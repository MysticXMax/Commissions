(() => {
  "use strict";

  const avatars = {
    avatar1: {
      title: "Erolic",
      base: "Regulus",
      img: "../avatars/11.png",
    },
    avatar2: {
      title: "Erolis",
      base: "Regulus 3.0",
      img: "../avatars/22.png",
    },
    avatar3: {
      title: "Mistic",
      base: "Regulus",
      img: "../avatars/33.png",
    },
    avatar4: {
      title: "Null",
      base: "Nardoragon",
      img: "../avatars/44.png",
    },
    avatar5: {
      title: "Loufy",
      base: "Regulus",
      img: "../avatars/55.png",
    },
    avatar6: {
      title: "Ara",
      base: "Regulus",
      img: "../avatars/66.png",
    },
    avatar7: {
      title: "Cristal",
      base: "Regulus 3.0",
      img: "../avatars/77.png",
    },
    avatar8: {
      title: "Stas",
      base: "Mayu",
      img: "../avatars/88.jpg",
    },
    avatar9: {
      title: "Kenith",
      base: "Novabeast",
      img: "../avatars/99.png",
    },
    avatar10: {
      title: "Blaze",
      base: "Custom",
      img: "../avatars/111.png",
    },
  };

  const modal = document.getElementById("avatar-details");
  const title = document.getElementById("avatar-title");
  const base = document.getElementById("avatar-base");
  const img = document.getElementById("avatar-img");

  if (!modal || !title || !base || !img) return;

  const openModal = (avatarId) => {
    const avatar = avatars[avatarId];
    if (!avatar) return;

    title.textContent = avatar.title;
    base.textContent = avatar.base;
    img.src = avatar.img;
    img.alt = `${avatar.title} full avatar preview`;
    modal.hidden = false;
    document.body.classList.add("no-scroll");
  };

  const closeModal = () => {
    modal.hidden = true;
    document.body.classList.remove("no-scroll");
  };

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
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });
})();
