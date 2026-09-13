require("dotenv").config();
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const cors = require("cors");
const FormData = require("form-data");
const path = require("path");

const app = express();
const maxFiles = 5;
const maxFileSize = 8 * 1024 * 1024;
const allowedOrigins = new Set([
  "https://mysticxmax.github.io",
  "http://localhost:10000",
]);
const packs = {
  "Basic Pack": [],
  "Starter Pack": [],
  "Premium Pack": [],
  "Ultimate Pack": ["Audiolink", "Emission", "Particles", "Custom gestures"],
  "Celestial Pack": [
    "Audiolink",
    "Emission",
    "Particles",
    "Custom gestures",
    "Promo showcase",
  ],
};
const highPacks = new Set(["Ultimate Pack", "Celestial Pack"]);
const paymentMethods = new Set([
  "PayPal",
  "MobilePay",
  "Steam Gift Card",
  "Card",
  "Other / discuss on Discord",
]);
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const requests = new Map();
const webhookUrl = process.env.DISCORD_WEBHOOK;

app.set("trust proxy", 1);
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://commissions-1e9a.onrender.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  );
  next();
});
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(express.static(path.join(__dirname, "..")));
app.use(
  cors({
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.has(origin));
    },
    methods: ["POST"],
    allowedHeaders: ["Content-Type"],
  }),
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: maxFiles, fileSize: maxFileSize, fields: 30, fieldSize: 25000 },
  fileFilter(req, file, callback) {
    callback(allowedImageTypes.has(file.mimetype) ? null : new Error("Invalid file type"), true);
  },
});

const clean = (value, fallback = "Not provided", maxLength = 1024) =>
  String(value || fallback)
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);

const hasLink = (value) => /https?:\/\/|www\./i.test(value || "");

const blocked = (req) => {
  const now = Date.now();
  const key = req.ip || "unknown";
  const recent = (requests.get(key) || []).filter((time) => now - time < 10 * 60 * 1000);
  recent.push(now);
  requests.set(key, recent);
  return recent.length > 5;
};

const sendError = (res, status, message) => res.status(status).json({ error: message });

app.post("/submit", (req, res, next) => {
  if (blocked(req)) return sendError(res, 429, "Please wait before sending another order.");
  upload.array("file", maxFiles)(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      return sendError(res, 400, "Please add up to 5 images, each smaller than 8 MB.");
    }
    if (error) return sendError(res, 400, "Please use PNG, JPG, GIF, or WebP images.");
    next();
  });
}, async (req, res) => {
  try {
    const { name, description, style, clothing, pack, payment, extras: extrasRaw } = req.body;
    const discordId = req.body["discord-id"];
    const customBase = req.body["custom-base"];
    const seasonalOffer = req.body["seasonal-offer"];
    const highPackConfirm = req.body["high-pack-confirm"];
    const tosAccepted = req.body["accept-tos"];
    const website = req.body.website;
    const textValues = [name, description, discordId, customBase];

    if (website || textValues.some(hasLink)) {
      return sendError(res, 400, "Please remove links from the order details.");
    }
    if (!packs[pack]) return sendError(res, 400, "Please choose a valid commission pack.");
    if (!paymentMethods.has(payment)) return sendError(res, 400, "Please choose a valid payment method.");
    if (tosAccepted !== "on") return sendError(res, 400, "Please accept the Terms of Service.");
    if (highPacks.has(pack) && highPackConfirm !== "yes") {
      return sendError(res, 400, "Please confirm that you want this high commission pack.");
    }
    if (!clean(name, "", 80) || !clean(discordId, "", 64)) {
      return sendError(res, 400, "Please add your character name and Discord username.");
    }
    if (String(description || "").trim().length < 30 || String(description || "").length > 5000) {
      return sendError(res, 400, "Your avatar description must be between 30 and 5000 characters.");
    }

    const extras = Array.isArray(extrasRaw) ? extrasRaw : extrasRaw ? [extrasRaw] : [];
    if (extras.some((extra) => !packs[pack].includes(extra))) {
      return sendError(res, 400, "That extra is not available with this pack.");
    }

    const baseUsed = style === "Other" ? clean(customBase, "None", 200) : clean(style, "Not provided", 80);
    const fields = [
      { name: "Character", value: clean(name, "Not provided", 80) },
      { name: "Description", value: clean(description, "No description", 5000) },
      { name: "Base", value: baseUsed, inline: true },
      { name: "Pack", value: clean(pack, "Not provided", 80), inline: true },
      { name: "Clothing", value: clean(clothing, "None", 80), inline: true },
      { name: "Extras", value: extras.length ? extras.map((extra) => clean(extra, "", 80)).join(", ") : "None", inline: true },
      { name: "Payment", value: clean(payment, "Not specified", 80), inline: true },
      { name: "Sale", value: clean(seasonalOffer, "None", 200), inline: true },
      { name: "Discord", value: clean(discordId, "Not provided", 64) },
    ];
    const formData = new FormData();
    (req.files || []).forEach((file, index) => {
      formData.append(`file${index}`, file.buffer, {
        filename: path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, "_"),
        contentType: file.mimetype,
      });
    });
    formData.append(
      "payload_json",
      JSON.stringify({
        allowed_mentions: { parse: [] },
        embeds: [{ title: "New Commission Request", color: 0x65e0bd, fields }],
      }),
    );
    if (!webhookUrl) return sendError(res, 500, "Orders are not available right now.");
    await axios.post(webhookUrl, formData, { headers: formData.getHeaders(), timeout: 15000 });
    return res.status(200).json({ success: true });
  } catch (error) {
    return sendError(res, 500, "Your order could not be sent. Please try again later.");
  }
});

app.listen(process.env.PORT || 10000);
