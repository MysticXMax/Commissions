(() => {
  "use strict";

  const offers = [
    {
      id: "new-year",
      name: "New Year Reset",
      start: [1, 1],
      end: [1, 6],
      discount: 10,
      code: "NEWYEAR10",
      copy: "Fresh-year avatar edits, file cleanup, and new look planning.",
    },
    {
      id: "spring-sale",
      name: "Spring Refresh",
      start: [3, 20],
      end: [4, 5],
      discount: 10,
      code: "SPRING10",
      copy: "Bright texture edits and fresh spring style changes.",
    },
    {
      id: "summer-sale",
      name: "Summer Glow",
      start: [6, 10],
      end: [6, 24],
      discount: 12,
      code: "SUMMER12",
      copy: "Emission, Audiolink direction, and soft glow work.",
    },
    {
      id: "black-friday",
      name: "Black Friday Slots",
      start: [11, 15],
      end: [11, 29],
      discount: 20,
      code: "BLACK20",
      copy: "Gift-ready commissions booked before the December rush.",
    },
    {
      id: "holiday-prep",
      name: "Holiday Prep Week",
      start: [11, 30],
      end: [12, 6],
      discount: 15,
      code: "HOLIDAY15",
      copy: "Premium and higher setup requests during Holiday Prep Week.",
      minimumPrice: 20,
    },
    {
      id: "christmas-warmup",
      name: "Christmas Warm-Up",
      start: [12, 7],
      end: [12, 19],
      discount: 18,
      code: "WARM18",
      copy: "Final pre-Christmas planning slots before the holiday queue closes.",
    },
    {
      id: "christmas",
      name: "Christmas Thank You",
      start: [12, 20],
      end: [12, 26],
      discount: 25,
      code: "XMAS25",
      copy: "New-year planning deposits while holiday slots last.",
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
        end: new Date(year, 6, 1, 23, 59, 59),
      },
    ];
  };

  const saleTitle = document.querySelector("[data-sale-title]");
  const saleCopy = document.querySelector("[data-sale-copy]");
  const saleCode = document.querySelector("[data-sale-code]");
  const saleCountdown = document.querySelector("[data-sale-countdown]");
  const overlayClosed = document.getElementById("overlay-closed");
  const closedContent = document.querySelector("[data-closed-content]");

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
    if (end < start) end.setFullYear(end.getFullYear() + 1);
    return { offer, start, end };
  };

  const allRanges = (now) => {
    const year = now.getFullYear();
    return [year - 1, year, year + 1].flatMap((rangeYear) =>
      offers.map((offer) => rangeFor(offer, rangeYear)),
    );
  };

  const getOfferState = (now = new Date()) => {
    const ranges = allRanges(now);
    const current = ranges
      .filter((range) => now >= range.start && now <= range.end)
      .sort((a, b) => b.offer.discount - a.offer.discount)[0];
    const next = ranges
      .filter((range) => range.start > now)
      .sort((a, b) => a.start - b.start)[0];
    return { current: current || null, next: next || null };
  };

  const getClosureState = (now = new Date()) => {
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

  const updateOfferCards = (current, next) => {
    document.querySelectorAll("[data-offer-card]").forEach((card) => {
      card.classList.toggle(
        "is-active",
        current?.offer.id === card.dataset.offerCard,
      );
      card.classList.toggle(
        "is-next",
        !current && next?.offer.id === card.dataset.offerCard,
      );
    });
  };

  const updateSaleBanner = (state) => {
    const { current, next } = state;

    if (current) {
      const { offer, end } = current;
      setText(saleTitle, `${offer.name} is live`);
      setText(saleCopy, `${offer.discount}% off ${offer.copy}`);
      setText(saleCode, `Use ${offer.code}`);
      setText(saleCountdown, `Ends in ${formatDuration(end - new Date())}`);
      updateOfferCards(current, next);
      return;
    }

    if (next) {
      const { offer, start } = next;
      setText(saleTitle, `Next offer: ${offer.name}`);
      setText(saleCopy, `${offer.discount}% off ${offer.copy}`);
      setText(saleCode, `Code ${offer.code}`);
      setText(saleCountdown, `Starts ${formatDate(start)}`);
      updateOfferCards(null, next);
      return;
    }

    setText(saleTitle, "Seasonal offers are being planned");
    setText(saleCopy, "New holiday discounts will appear here when scheduled.");
    setText(saleCode, "No active code");
    setText(saleCountdown, "Open now");
    updateOfferCards(null, null);
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
    reopens.textContent = `Reopens in ${formatDuration(state.current.end - new Date())}`;
    closedContent.replaceChildren(title, reason, reopens);
    overlayClosed.classList.remove("hidden");
    document.body.classList.add("no-scroll");
  };

  const render = () => {
    const now = new Date();
    const offerState = getOfferState(now);
    const closureState = getClosureState(now);
    updateSaleBanner(offerState);
    updateClosureOverlay(closureState);
    document.dispatchEvent(
      new CustomEvent("mystic-offer-change", {
        detail: {
          current: offerState.current?.offer || null,
          next: offerState.next?.offer || null,
        },
      }),
    );
  };

  window.MysticOffers = {
    offers,
    getCurrentOffer: () => getOfferState().current?.offer || null,
    getNextOffer: () => getOfferState().next?.offer || null,
  };

  render();
  setInterval(render, 1000);
})();
