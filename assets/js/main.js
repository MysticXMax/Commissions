(() => {
  "use strict";

  const endpoint = "https://commissions-1e9a.onrender.com/submit";
  const maxFiles = 5;
  const maxFileSize = 8 * 1024 * 1024;
  const packageInfo = {
    "Basic Pack": {
      price: 10,
      display: "€10",
      timeline: "1-3 days",
      clothing: false,
      high: false,
      extras: [],
    },
    "Starter Pack": {
      price: 15,
      display: "€15",
      timeline: "2-5 days",
      clothing: false,
      high: false,
      extras: [],
    },
    "Premium Pack": {
      price: 25,
      display: "€25",
      timeline: "3-7 days",
      clothing: true,
      high: false,
      extras: [],
    },
    "Ultimate Pack": {
      price: 30,
      display: "€30",
      timeline: "1-2 weeks",
      clothing: true,
      high: true,
      extras: ["Audiolink", "Emission", "Particles", "Custom gestures"],
    },
    "Celestial Pack": {
      price: 50,
      display: "€50",
      timeline: "2+ weeks",
      clothing: true,
      high: true,
      extras: [
        "Audiolink",
        "Emission",
        "Particles",
        "Custom gestures",
        "Promo showcase",
      ],
    },
  };

  let selectedFiles = [];
  let chosenPack = "";
  let activeOffer = window.MysticOffers?.getCurrentOffer() || null;

  const form = document.getElementById("order-form");
  const orderPanel = document.querySelector("[data-order-panel]");
  const orderSummary = document.getElementById("order-summary");
  const selectedPackInput = document.getElementById("selected-pack");
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
  const highPackConfirm = document.querySelector("[data-high-pack-confirm]");
  const highPackCheck = document.getElementById("high-pack-confirm");
  const descriptionField = document.getElementById("description");
  const descriptionCount = document.getElementById("description-count");

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
    return `€${formatAmount(info.price * ((100 - offer.discount) / 100))}`;
  };

  const updateSalePrices = () => {
    document.querySelectorAll("[data-package-card]").forEach((card) => {
      const packName = card.querySelector("[data-pack]")?.dataset.pack;
      const salePrice = card.querySelector(".sale-price");
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
    return `${activeOffer.name}: not available for ${chosenPack}`;
  };

  const renderSummary = () => {
    if (!orderSummary || !chosenPack) return;
    const info = packageInfo[chosenPack];
    const price = isOfferEligible(chosenPack)
      ? `${discountedPrice(chosenPack)} with the current sale`
      : info.display;
    orderSummary.replaceChildren();
    [
      ["Pack", chosenPack],
      ["Price", price],
      ["Estimated time", info.timeline],
      ["Sale", offerLabel()],
    ].forEach(([label, value]) => {
      const item = document.createElement("div");
      const heading = document.createElement("span");
      const content = document.createElement("strong");
      item.className = "summary-item";
      heading.textContent = label;
      content.textContent = value;
      item.append(heading, content);
      orderSummary.append(item);
    });
  };

  const updateExtras = (allowedExtras) => {
    const hasExtras = allowedExtras.length > 0;
    extrasFieldset.hidden = !hasExtras;
    extrasFieldset.querySelectorAll("[data-extra]").forEach((label) => {
      const input = label.querySelector("input");
      const allowed = allowedExtras.includes(input.value);
      label.hidden = !allowed;
      input.disabled = !allowed;
      if (!allowed) input.checked = false;
    });
  };

  const updateConditionalFields = () => {
    const info = packageInfo[chosenPack];
    const usesCustomBase = styleField?.value === "Other";
    const needsClothing = Boolean(info?.clothing);

    if (customBaseWrapper && customBaseField) {
      customBaseWrapper.hidden = !usesCustomBase;
      customBaseField.required = usesCustomBase;
      if (!usesCustomBase) customBaseField.value = "";
    }

    if (clothingWrapper && clothingField) {
      clothingWrapper.hidden = !needsClothing;
      if (!needsClothing) clothingField.value = "None";
    }

    updateExtras(info?.extras || []);

    if (highPackConfirm && highPackCheck) {
      highPackConfirm.hidden = !info?.high;
      highPackCheck.required = Boolean(info?.high);
      if (!info?.high) highPackCheck.checked = false;
    }
  };

  const updateDescriptionCount = () => {
    if (!descriptionField || !descriptionCount) return;
    descriptionCount.textContent = `${descriptionField.value.length} / ${descriptionField.maxLength}`;
  };

  const openOrder = (packName) => {
    if (!packageInfo[packName] || !orderPanel) return;
    chosenPack = packName;
    selectedPackInput.value = packName;
    orderPanel.hidden = false;
    updateConditionalFields();
    renderSummary();
    orderPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const containsLink = (value) => /https?:\/\/|www\./i.test(value || "");

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
      cancelBtn.hidden = !cancelText;
      cancelBtn.textContent = cancelText;
      const close = (answer) => {
        modal.classList.add("hidden");
        confirmBtn.onclick = null;
        cancelBtn.onclick = null;
        resolve(answer);
      };
      confirmBtn.onclick = () => close(true);
      cancelBtn.onclick = () => close(false);
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
      const image = document.createElement("img");
      const button = document.createElement("button");
      wrapper.className = "preview-item";
      wrapper.dataset.fileId = item.id;
      image.src = item.url;
      image.alt = item.file.name;
      button.className = "preview-remove";
      button.type = "button";
      button.textContent = "×";
      button.setAttribute("aria-label", `Remove ${item.file.name}`);
      wrapper.append(image, button);
      imagePreview.append(wrapper);
    });
    const hasFiles = selectedFiles.length > 0;
    previewWrapper.hidden = !hasFiles;
    previewConfirm.required = hasFiles;
    if (!hasFiles) previewConfirm.checked = false;
    fileNameDisplay.textContent = hasFiles
      ? `${selectedFiles.length} image${selectedFiles.length === 1 ? "" : "s"} selected`
      : "No images selected";
  };

  const clearFiles = () => {
    selectedFiles.forEach((item) => URL.revokeObjectURL(item.url));
    selectedFiles = [];
    if (fileInput) fileInput.value = "";
    updatePreviewState();
  };

  const addFiles = async () => {
    if (!fileInput?.files) return;
    const incoming = Array.from(fileInput.files).filter(
      (file) => file.type.startsWith("image/") && file.size <= maxFileSize,
    );
    const space = maxFiles - selectedFiles.length;
    if (incoming.length === 0) {
      fileInput.value = "";
      await showModal({
        message: "Please choose image files smaller than 8 MB.",
        confirmText: "Okay",
      });
      return;
    }
    if (space <= 0) {
      fileInput.value = "";
      await showModal({
        message: "You can add up to 5 reference images.",
        confirmText: "Okay",
      });
      return;
    }
    selectedFiles.push(
      ...incoming.slice(0, space).map((file) => ({
        id: makeFileId(),
        file,
        url: URL.createObjectURL(file),
      })),
    );
    fileInput.value = "";
    updatePreviewState();
    if (incoming.length > space) {
      await showModal({
        message: "Only 5 reference images can be added.",
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
    updateDescriptionCount();
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
        message:
          "Please fill in the required fields before sending your order.",
        confirmText: "Okay",
      });
      return;
    }
    if (descriptionField.value.length > 5000) {
      await showModal({
        message: "Your avatar description is too long.",
        confirmText: "Okay",
      });
      return;
    }
    const formData = new FormData(form);
    const textFields = ["name", "description", "discord-id", "custom-base"];
    if (textFields.some((field) => containsLink(formData.get(field)))) {
      await showModal({
        message: "Please remove links from the order details.",
        confirmText: "Okay",
      });
      return;
    }
    if (selectedFiles.length > 0 && !previewConfirm.checked) {
      await showModal({
        message: "Please confirm your reference images before sending.",
        confirmText: "Okay",
      });
      return;
    }
    selectedFiles.forEach((item) => formData.append("file", item.file));
    try {
      setSubmitting(true);
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Submission failed");
      resetOrder();
      document.getElementById("submission-success")?.classList.remove("hidden");
    } catch {
      await showModal({
        message:
          "Your order did not send. Please try again or message me on Discord.",
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
    if (removeButton)
      removeFile(removeButton.closest(".preview-item")?.dataset.fileId);
  });

  document.addEventListener("mystic-offer-change", (event) => {
    activeOffer = event.detail.current;
    updateSalePrices();
    renderSummary();
  });

  styleField?.addEventListener("change", updateConditionalFields);
  fileInput?.addEventListener("change", addFiles);
  descriptionField?.addEventListener("input", updateDescriptionCount);
  form.addEventListener("submit", submitOrder);
  updateSalePrices();
  updateConditionalFields();
  updateDescriptionCount();
})();
