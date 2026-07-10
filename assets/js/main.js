(() => {
  "use strict";

  const endpoint = "https://commissions-1e9a.onrender.com/submit";
  const maxFiles = 5;
  const packageInfo = {
    "Basic Pack": {
      price: 5,
      display: "EUR 5",
      timeline: "1 day",
      clothing: false,
      high: false,
    },
    "Starter Pack": {
      price: 10,
      display: "EUR 10",
      timeline: "1-2 days",
      clothing: false,
      high: false,
    },
    "Premium Pack": {
      price: 20,
      display: "EUR 20",
      timeline: "2-5 days",
      clothing: true,
      high: false,
    },
    "Ultimate Pack": {
      price: 30,
      display: "EUR 30",
      timeline: "1-2 weeks",
      clothing: true,
      high: true,
    },
    "Celestial Pack": {
      price: 40,
      display: "EUR 40+",
      timeline: "2+ weeks",
      clothing: true,
      high: true,
    },
  };

  let selectedFiles = [];
  let chosenPack = "";
  let activeOffer = window.MysticOffers?.getCurrentOffer() || null;

  const form = document.getElementById("order-form");
  const orderPanel = document.querySelector("[data-order-panel]");
  const orderSummary = document.getElementById("order-summary");
  const selectedPackInput = document.getElementById("selected-pack");
  const seasonalOfferInput = document.getElementById("seasonal-offer");
  const styleField = document.getElementById("style");
  const customBaseField = document.getElementById("custom-base");
  const customBaseWrapper = document.querySelector("[data-custom-base]");
  const clothingWrapper = document.querySelector("[data-clothing-options]");
  const clothingField = document.getElementById("clothing");
  const fileInput = document.getElementById("file");
  const fileNameDisplay = document.getElementById("file-name");
  const previewWrapper = document.querySelector("[data-preview-wrapper]");
  const imagePreview = document.getElementById("image-preview");
  const previewConfirm = document.getElementById("preview-confirm");
  const extrasFieldset = document.querySelector(".extras-field");

  if (!form) return;

  const formatAmount = (amount) => {
    const rounded = Math.round(amount * 100) / 100;
    return Number.isInteger(rounded)
      ? String(rounded)
      : rounded.toFixed(2).replace(/0$/, "");
  };

  const isOfferEligible = (packName, offer = activeOffer) => {
    if (!offer || !packageInfo[packName]) return false;
    return (
      !offer.minimumPrice || packageInfo[packName].price >= offer.minimumPrice
    );
  };

  const discountedPrice = (packName, offer = activeOffer) => {
    const info = packageInfo[packName];
    if (!info || !isOfferEligible(packName, offer))
      return info?.display || "Quote";
    const amount = info.price * ((100 - offer.discount) / 100);
    const suffix = packName === "Celestial Pack" ? "+" : "";
    return `EUR ${formatAmount(amount)}${suffix}`;
  };

  const updateSalePrices = () => {
    document.querySelectorAll("[data-package-card]").forEach((card) => {
      const packButton = card.querySelector("[data-pack]");
      const salePrice = card.querySelector("[data-sale-price]");
      const packName = packButton?.dataset.pack;

      if (!salePrice || !packName || !isOfferEligible(packName)) {
        card.classList.remove("has-sale");
        if (salePrice) salePrice.textContent = "";
        return;
      }

      card.classList.add("has-sale");
      salePrice.textContent = discountedPrice(packName);
    });
  };

  const offerLabel = () => {
    if (!activeOffer) return "No active offer";
    if (!chosenPack || isOfferEligible(chosenPack)) {
      return activeOffer.code
        ? `${activeOffer.name}: ${activeOffer.discount}% off with ${activeOffer.code}`
        : `${activeOffer.name}: ${activeOffer.discount}% off`;
    }
    return `${activeOffer.name}: not eligible for ${chosenPack}`;
  };

  const renderSummary = () => {
    if (!orderSummary || !chosenPack) return;

    const info = packageInfo[chosenPack];
    const price = isOfferEligible(chosenPack)
      ? `${discountedPrice(chosenPack)} after sale`
      : info.display;

    orderSummary.innerHTML = `
      <div class="summary-item">
        <span>Pack</span>
        <strong>${chosenPack}</strong>
      </div>
      <div class="summary-item">
        <span>Price</span>
        <strong>${price}</strong>
      </div>
      <div class="summary-item">
        <span>Timeline</span>
        <strong>${info.timeline}</strong>
      </div>
      <div class="summary-item">
        <span>Sale</span>
        <strong>${offerLabel()}</strong>
      </div>
    `;
  };

  const updateOfferInput = () => {
    if (!seasonalOfferInput) return;
    seasonalOfferInput.value = offerLabel();
  };

  const updateConditionalFields = () => {
    const usesCustomBase = styleField?.value === "Other";
    const needsClothing = Boolean(packageInfo[chosenPack]?.clothing);
    const isBasic = chosenPack === "Basic Pack";

    if (customBaseWrapper && customBaseField) {
      customBaseWrapper.hidden = !usesCustomBase;
      customBaseField.required = usesCustomBase;
      if (!usesCustomBase) customBaseField.value = "";
    }

    if (clothingWrapper && clothingField) {
      clothingWrapper.hidden = !needsClothing;
      if (!needsClothing) clothingField.value = "None";
    }

    if (extrasFieldset) {
      extrasFieldset.hidden = isBasic;
    }
  };

  const openOrder = (packName) => {
    if (!packageInfo[packName] || !orderPanel) return;

    chosenPack = packName;
    selectedPackInput.value = packName;
    orderPanel.hidden = false;
    updateConditionalFields();
    updateOfferInput();
    renderSummary();
    orderPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const containsLink = (value) => /https?:\/\/|www\./i.test(value || "");

  const checkProfanityAPI = async (text) => {
    if (!text) return false;
    try {
      const response = await fetch(
        `https://www.purgomalum.com/service/containsprofanity?text=${encodeURIComponent(text)}`,
      );
      const result = await response.text();
      return result === "true";
    } catch (error) {
      console.error("Profanity check failed:", error);
      return false;
    }
  };

  const showModal = ({ message, confirmText = "OK", cancelText = "" }) =>
    new Promise((resolve) => {
      const modal = document.getElementById("custom-modal");
      const messageBox = document.getElementById("modal-message");
      const confirmBtn = document.getElementById("modal-confirm");
      const cancelBtn = document.getElementById("modal-cancel");

      if (!modal || !messageBox || !confirmBtn || !cancelBtn) {
        resolve(true);
        return;
      }

      messageBox.textContent = message;
      confirmBtn.textContent = confirmText;

      if (cancelText) {
        cancelBtn.textContent = cancelText;
        cancelBtn.classList.remove("hidden");
      } else {
        cancelBtn.classList.add("hidden");
      }

      const cleanup = () => {
        confirmBtn.onclick = null;
        cancelBtn.onclick = null;
        modal.classList.add("hidden");
      };

      confirmBtn.onclick = () => {
        cleanup();
        resolve(true);
      };

      cancelBtn.onclick = () => {
        cleanup();
        resolve(false);
      };

      modal.classList.remove("hidden");
    });

  const makeFileId = () =>
    window.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const updatePreviewState = () => {
    if (!previewWrapper || !imagePreview || !fileNameDisplay || !previewConfirm)
      return;

    imagePreview.replaceChildren();

    selectedFiles.forEach((item) => {
      const wrapper = document.createElement("div");
      const img = document.createElement("img");
      const button = document.createElement("button");

      wrapper.className = "preview-item";
      wrapper.dataset.fileId = item.id;
      img.src = item.url;
      img.alt = item.file.name;
      button.className = "preview-remove";
      button.type = "button";
      button.textContent = "x";
      button.setAttribute("aria-label", `Remove ${item.file.name}`);

      wrapper.append(img, button);
      imagePreview.append(wrapper);
    });

    const hasFiles = selectedFiles.length > 0;
    previewWrapper.hidden = !hasFiles;
    previewConfirm.required = hasFiles;
    if (!hasFiles) previewConfirm.checked = false;
    fileNameDisplay.textContent = hasFiles
      ? `${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"} selected`
      : "No files selected";
  };

  const clearFiles = () => {
    selectedFiles.forEach((item) => URL.revokeObjectURL(item.url));
    selectedFiles = [];
    if (fileInput) fileInput.value = "";
    updatePreviewState();
  };

  const addFiles = async () => {
    if (!fileInput?.files) return;

    const incoming = Array.from(fileInput.files).filter((file) =>
      file.type.startsWith("image/"),
    );
    const space = maxFiles - selectedFiles.length;

    if (incoming.length === 0) {
      fileInput.value = "";
      await showModal({
        message: "Please choose image files only.",
        confirmText: "Okay",
      });
      return;
    }

    if (space <= 0) {
      fileInput.value = "";
      await showModal({
        message: `You can upload up to ${maxFiles} reference images.`,
        confirmText: "Okay",
      });
      return;
    }

    const accepted = incoming.slice(0, space).map((file) => ({
      id: makeFileId(),
      file,
      url: URL.createObjectURL(file),
    }));

    selectedFiles.push(...accepted);
    fileInput.value = "";
    updatePreviewState();

    if (incoming.length > accepted.length) {
      await showModal({
        message: `Only ${maxFiles} reference images can be attached.`,
        confirmText: "Okay",
      });
    }
  };

  const removeFile = (fileId) => {
    const item = selectedFiles.find((file) => file.id === fileId);
    if (item) URL.revokeObjectURL(item.url);
    selectedFiles = selectedFiles.filter((file) => file.id !== fileId);
    updatePreviewState();
  };

  const validateText = (formData) => {
    const fields = [
      formData.get("name"),
      formData.get("description"),
      formData.get("discord-id"),
      formData.get("custom-base"),
    ];

    return fields.some((value) => containsLink(value));
  };

  const setSubmitting = (isSubmitting) => {
    const submitButton = form.querySelector(".submit");
    const overlay = document.getElementById("submission-overlay");
    if (submitButton) submitButton.disabled = isSubmitting;
    if (overlay) overlay.classList.toggle("hidden", !isSubmitting);
  };

  const resetOrder = () => {
    form.reset();
    clearFiles();
    chosenPack = "";
    selectedPackInput.value = "";
    if (orderPanel) orderPanel.hidden = true;
    updateConditionalFields();
    updateOfferInput();
  };

  const submitOrder = async (event) => {
    event.preventDefault();

    if (!chosenPack) {
      await showModal({
        message: "Please choose a commission pack first.",
        confirmText: "Okay",
      });
      return;
    }

    updateConditionalFields();

    if (!form.reportValidity()) {
      await showModal({
        message: "Please fill in the required fields before submitting.",
        confirmText: "Okay",
      });
      return;
    }

    const name = form.querySelector("#name")?.value || "";
    const description = form.querySelector("#description")?.value || "";
    const discordId = form.querySelector("#discord-id")?.value || "";
    const customBase = form.querySelector("#custom-base")?.value || "";

    const profaneName = await checkProfanityAPI(name);
    const profaneDescription = await checkProfanityAPI(description);
    const profaneDiscord = await checkProfanityAPI(discordId);
    const profaneBase = await checkProfanityAPI(customBase);

    if (profaneName || profaneDescription || profaneDiscord || profaneBase) {
      await showModal({
        message:
          "Please remove inappropriate language from your order details.",
        confirmText: "Okay",
      });
      return;
    }

    if (selectedFiles.length > 0 && !previewConfirm.checked) {
      await showModal({
        message:
          "Please confirm the selected reference images before submitting.",
        confirmText: "Okay",
      });
      return;
    }

    const formData = new FormData(form);
    if (validateText(formData)) {
      await showModal({
        message: "Please remove links from the order details.",
        confirmText: "Okay",
      });
      return;
    }

    selectedFiles.forEach((item) => {
      formData.append("file", item.file);
    });

    try {
      setSubmitting(true);
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Submission failed");

      resetOrder();
      document.getElementById("submission-success")?.classList.remove("hidden");
    } catch (error) {
      await showModal({
        message:
          "Submission failed. Please try again or message Mystic on Discord.",
        confirmText: "Okay",
      });
    } finally {
      setSubmitting(false);
    }
  };

  document.querySelectorAll("[data-pack]").forEach((button) => {
    button.addEventListener("click", () => openOrder(button.dataset.pack));
  });

  document.addEventListener("click", (event) => {
    const orderLink = event.target.closest('a[href="#order"]');
    if (orderLink) {
      event.preventDefault();
      openOrder(chosenPack || "Premium Pack");
      return;
    }

    if (event.target.closest("[data-cancel-order]")) {
      resetOrder();
      document
        .getElementById("packages")
        ?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (event.target.closest("[data-close-success]")) {
      document.getElementById("submission-success")?.classList.add("hidden");
      return;
    }

    const removeButton = event.target.closest(".preview-remove");
    if (removeButton) {
      removeFile(removeButton.closest(".preview-item")?.dataset.fileId);
    }
  });

  document.addEventListener("mystic-offer-change", (event) => {
    activeOffer = event.detail.current;
    updateSalePrices();
    updateOfferInput();
    renderSummary();
  });

  styleField?.addEventListener("change", updateConditionalFields);
  fileInput?.addEventListener("change", addFiles);
  form.addEventListener("submit", submitOrder);

  updateSalePrices();
  updateConditionalFields();
  updateOfferInput();
})();
