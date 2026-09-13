(() => {
  "use strict";

  const avatars = {
    avatar1: {
      title: "Erolic",
      base: "Regulus",
      img: "../avatars/11.png",
      desc: "A Regulus avatar with clean markings and bright colors.",
    },
    avatar2: {
      title: "Erolis",
      base: "Regulus 3.0",
      img: "../avatars/22.png",
      desc: "A colorful Regulus 3.0 avatar.",
    },
    avatar3: {
      title: "Mistic",
      base: "Regulus",
      img: "../avatars/33.png",
      desc: "A simple Regulus avatar project.",
    },
    avatar4: {
      title: "Null",
      base: "Nardoragon",
      img: "../avatars/44.png",
      desc: "A Nardoragon avatar with a darker style.",
    },
    avatar5: {
      title: "Loufy",
      base: "Regulus",
      img: "../avatars/55.png",
      desc: "A Regulus commission with soft colors.",
    },
    avatar6: {
      title: "Ara",
      base: "Regulus",
      img: "../avatars/66.png",
      desc: "A Regulus avatar with bold colors.",
    },
    avatar7: {
      title: "Cristal",
      base: "Regulus 3.0",
      img: "../avatars/77.png",
      desc: "A bright Regulus 3.0 avatar.",
    },
    avatar8: {
      title: "Stas",
      base: "Mayu",
      img: "../avatars/88.jpg",
      desc: "A Mayu avatar with a clean, dark look.",
    },
    avatar9: {
      title: "Kenith",
      base: "Novabeast",
      img: "../avatars/99.png",
      desc: "A purple Novabeast avatar.",
    },
    avatar10: {
      title: "Blaze",
      base: "Custom",
      img: "../avatars/111.png",
      desc: "A blue and white custom avatar.",
    },
  };

  const modal = document.getElementById("avatar-details");
  const title = document.getElementById("avatar-title");
  const base = document.getElementById("avatar-base");
  const img = document.getElementById("avatar-img");
  const desc = document.getElementById("avatar-desc");

  if (!modal || !title || !base || !img || !desc) return;

  const openModal = (avatarId) => {
    const avatar = avatars[avatarId];
    if (!avatar) return;

    title.textContent = avatar.title;
    base.textContent = avatar.base;
    img.src = avatar.img;
    img.alt = `${avatar.title} full avatar preview`;
    desc.textContent = avatar.desc;
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
