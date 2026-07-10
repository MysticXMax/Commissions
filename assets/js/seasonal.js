(() => {
  "use strict";

  function getNow() {
    return new Date();
  }

  const currentYear = getNow().getFullYear();

  const offers = [
    {
      id: "new-year",
      name: `New Year ${currentYear}`,
      start: [1, 1],
      end: [1, 6],
      discount: 25,
      copy: "Fresh-year avatar edits, file cleanup, and new look planning.",
      dates: "Jan 1 - Jan 6",
      description:
        "Kick off the year with a massive 25% off sitewide and upgrade your look for less!",
    },
    {
      id: "spring-sale",
      name: `Spring ${currentYear}`,
      start: [3, 20],
      end: [4, 5],
      discount: 15,
      copy: "Bright texture edits and fresh spring style changes.",
      dates: "Mar 20 - Apr 5",
      description:
        "Limited time offer! Score an exclusive 15% discount on our entire customization lineup.",
    },
    {
      id: "summer-sale",
      name: `Summer ${currentYear}`,
      start: [6, 10],
      end: [7, 10],
      discount: 30,
      copy: "Emission, Audiolink direction, and soft glow work.",
      dates: "Jun 10 - Jul 9",
      description:
        "Our biggest sale of the season! Unlock an incredible 30% off your next order today.",
    },
    {
      id: "black-friday",
      name: `Black Friday ${currentYear}`,
      start: [11, 15],
      end: [11, 29],
      discount: 20,
      copy: "Gift-ready commissions booked before the December rush.",
      dates: "Nov 15 - Nov 29",
      description:
        "The ultimate doorbuster deal! Save a guaranteed 20% on all upcoming project slots.",
    },
    {
      id: "holiday-prep",
      name: `Holiday Prep ${currentYear}`,
      start: [11, 30],
      end: [12, 6],
      discount: 15,
      copy: "Premium and higher setup requests during Holiday Prep Week.",
      minimumPrice: 20,
      dates: "Nov 30 - Dec 6",
      description:
        "Special event pricing! Enjoy 15% off our premium upgrade options for a limited time.",
    },
    {
      id: "christmas",
      name: `Christmas Thank You ${currentYear}`,
      start: [12, 20],
      end: [12, 26],
      discount: 25,
      copy: "New-year planning deposits while holiday slots last.",
      dates: "Dec 20 - Dec 26",
      description:
        "Our holiday gift to you! Take 25% off and lock in your priority scheduling bonus.",
    },
  ];

  const getClosureDates = (year) => {
    return [
      {
        name: "Winter Break",
        start: new Date(year, 11, 20, 0, 0, 0),
        end: new Date(year + 1, 0, 5, 23, 59, 59),
      },
      {
        name: "Spring Break",
        start: new Date(year, 2, 15, 0, 0, 0),
        end: new Date(year, 2, 22, 23, 59, 59),
      },
      {
        name: "Summer Break",
        start: new Date(year, 5, 1, 0, 0, 0),
        end: new Date(year, 5, 9, 23, 59, 59),
      },
    ];
  };

  const saleTitle = document.querySelector("[data-sale-title]");
  const saleCopy = document.querySelector("[data-sale-copy]");
  const saleCountdown = document.querySelector("[data-sale-countdown]");
  const overlayClosed = document.getElementById("overlay-closed");
  const closedContent = document.querySelector("[data-closed-content]");
  const offerGrid = document.getElementById("offerGrid");

  const renderOfferCards = () => {
    if (!offerGrid) return;
    offerGrid.innerHTML = "";
    offers.forEach((offer) => {
      const article = document.createElement("article");
      article.className = "offer-card";
      article.dataset.offerCard = offer.id;
      article.innerHTML = `
        <span>${offer.dates}</span>
        <h3>${offer.name}</h3>
        <p>${offer.description}</p>
      `;
      offerGrid.appendChild(article);
    });
  };

  const makeDate = (year, pair, endOfDay = false) => {
    const [month, day] = pair;
    return new Date(
      year,
      month - 1,
      day,
      endOfDay ? 23 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 59 : 0,
    );
  };

  const rangeFor = (offer, year) => {
    const start = makeDate(year, offer.start);
    const end = makeDate(year, offer.end, true);
    return { offer, start, end };
  };

  const allRanges = (now) => {
    const year = now.getFullYear();
    const ranges = [];
    offers.forEach((offer) => {
      const range = rangeFor(offer, year);
      if (range.end >= range.start) {
        ranges.push(range);
      }
    });
    return ranges;
  };

  const getOfferState = (now = getNow()) => {
    const ranges = allRanges(now);
    const current = ranges
      .filter((range) => now >= range.start && now <= range.end)
      .sort((a, b) => b.offer.discount - a.offer.discount)[0];
    const next = ranges
      .filter((range) => range.start > now)
      .sort((a, b) => a.start - b.start)[0];
    const ended = ranges
      .filter((range) => range.end < now)
      .sort((a, b) => b.end - a.end);
    return { current: current || null, next: next || null, ended: ended || [] };
  };

  const getClosureState = (now = getNow()) => {
    const year = now.getFullYear();
    const closures = getClosureDates(year);
    const current = closures.find(
      (period) => now >= period.start && now <= period.end,
    );
    const next = closures
      .filter((period) => period.start > now)
      .sort((a, b) => a.start - b.start)[0];
    return { current: current || null, next: next || null };
  };

  const formatDuration = (milliseconds) => {
    const safe = Math.max(0, milliseconds);
    const days = Math.floor(safe / 86400000);
    const hours = Math.floor((safe % 86400000) / 3600000);
    const minutes = Math.floor((safe % 3600000) / 60000);
    const seconds = Math.floor((safe % 60000) / 1000);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const formatDate = (date) =>
    date.toLocaleDateString("en-FI", {
      month: "short",
      day: "numeric",
    });

  const setText = (node, value) => {
    if (node) node.textContent = value;
  };

  const updateOfferCards = (current, next, ended) => {
    document.querySelectorAll("[data-offer-card]").forEach((card) => {
      const cardId = card.dataset.offerCard;
      const isEnded = ended.some((e) => e.offer.id === cardId);
      const isActive = current?.offer.id === cardId;
      const isNext = !current && next?.offer.id === cardId;

      card.classList.toggle("is-active", isActive);
      card.classList.toggle("is-next", isNext);
      card.classList.toggle("is-ended", isEnded && !isActive);
    });
  };

  function applySaleToPrices(discount) {
    document.querySelectorAll("[data-package-card]").forEach((card) => {
      const basePriceEl = card.querySelector(".base-price");
      const salePriceEl = card.querySelector(".sale-price");
      const price = parseInt(card.dataset.price);

      if (!basePriceEl || !salePriceEl || isNaN(price)) return;

      if (discount > 0) {
        const discounted = price * ((100 - discount) / 100);
        const formatted = Number.isInteger(discounted)
          ? discounted
          : discounted.toFixed(2);
        card.classList.add("has-sale");
        salePriceEl.textContent = `EUR ${formatted}`;
      }
    });
  }

  const updateSaleBanner = (state) => {
    const { current, next, ended } = state;
    const now = getNow();

    if (current) {
      const { offer, end } = current;
      setText(saleTitle, `${offer.name}: ${offer.discount}% off`);
      setText(saleCopy, offer.copy);
      setText(saleCountdown, `Ends in ${formatDuration(end - now)}`);
      updateOfferCards(current, next, ended);
      return;
    }

    if (ended.length > 0 && !current) {
      const latestEnded = ended[0];
      const { offer } = latestEnded;
      setText(saleTitle, `${offer.name} has ended`);
      setText(saleCopy, `This offer has expired. Check back for new deals.`);
      setText(saleCountdown, `Ended`);
      updateOfferCards(null, next, ended);
      return;
    }

    if (next) {
      const { offer, start } = next;
      setText(saleTitle, `Next offer: ${offer.name}`);
      setText(saleCopy, `${offer.discount}% off ${offer.copy}`);
      setText(saleCountdown, `Starts ${formatDate(start)}`);
      updateOfferCards(null, next, ended);
      return;
    }

    setText(saleTitle, "Seasonal offers are being planned");
    setText(saleCopy, "New holiday discounts will appear here when scheduled.");
    setText(saleCountdown, "Open now");
    updateOfferCards(null, null, ended);
  };

  const updateClosureOverlay = (state) => {
    if (!overlayClosed || !closedContent) return;

    if (!state.current) {
      overlayClosed.classList.add("hidden");
      document.body.classList.remove("no-scroll");
      return;
    }

    const title = document.createElement("h2");
    const reason = document.createElement("p");
    const reopens = document.createElement("p");
    title.textContent = "Commissions closed";
    reason.textContent = `Reason: ${state.current.name}`;
    reopens.textContent = `Reopens in ${formatDuration(state.current.end - getNow())}`;
    closedContent.replaceChildren(title, reason, reopens);
    overlayClosed.classList.remove("hidden");
    document.body.classList.add("no-scroll");
  };

  const render = () => {
    const now = getNow();
    const offerState = getOfferState(now);
    const closureState = getClosureState(now);

    updateSaleBanner(offerState);
    updateClosureOverlay(closureState);

    if (offerState.current) {
      applySaleToPrices(offerState.current.offer.discount);
    } else {
      applySaleToPrices(0);
    }

    document.dispatchEvent(
      new CustomEvent("mystic-offer-change", {
        detail: {
          current: offerState.current?.offer || null,
          next: offerState.next?.offer || null,
          ended: offerState.ended.map((e) => e.offer) || [],
        },
      }),
    );
  };

  window.MysticOffers = {
    offers,
    getCurrentOffer: () => getOfferState().current?.offer || null,
    getNextOffer: () => getOfferState().next?.offer || null,
    getEndedOffers: () => getOfferState().ended.map((e) => e.offer) || [],
  };

  renderOfferCards();
  render();
  setInterval(render, 1000);
})();
