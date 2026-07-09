(() => {
  "use strict";

  const avatars = {
    avatar1: {
      title: "Erolic",
      base: "Regulus",
      img: "../avatars/11.png",
      desc: "A Regulus edit with a strong silhouette, clean markings, and a brighter personality pass.",
    },
    avatar2: {
      title: "Erolis",
      base: "Regulus 3.0",
      img: "../avatars/22.png",
      desc: "A signature avatar built around bold colors, balanced contrast, and a polished VRChat look.",
    },
    avatar3: {
      title: "Mistic",
      base: "Regulus",
      img: "../avatars/33.png",
      desc: "An early project with a clean character read and a simple, memorable palette.",
    },
    avatar4: {
      title: "Null",
      base: "Nardoragon",
      img: "../avatars/44.png",
      desc: "A personal Nardoragon edit with a sharper mood and a strong presence.",
    },
    avatar5: {
      title: "Loufy",
      base: "Regulus",
      img: "../avatars/55.png",
      desc: "A commission piece focused on approachable colors and a soft finished style.",
    },
    avatar6: {
      title: "Ara",
      base: "Regulus",
      img: "../avatars/66.png",
      desc: "A striking avatar with confident color choices and an energetic attitude.",
    },
    avatar7: {
      title: "Cristal",
      base: "Regulus 3.0",
      img: "../avatars/77.png",
      desc: "A vivid character direction built for sparkle, contrast, and strong first impressions.",
    },
    avatar8: {
      title: "Stas",
      base: "Mayu",
      img: "../avatars/88.jpg",
      desc: "A sleek feline-inspired avatar with a stealthy, composed style.",
    },
    avatar9: {
      title: "Kenith",
      base: "Novabeast",
      img: "../avatars/99.png",
      desc: "A purple Novabeast direction with crisp contrast and a mysterious edge.",
    },
    avatar10: {
      title: "Blaze",
      base: "Custom",
      img: "../avatars/111.png",
      desc: "A fluffy blue and white character with a friendly, bright finish.",
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
