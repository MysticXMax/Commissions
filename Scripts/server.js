require("dotenv").config();
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const cors = require("cors");
const FormData = require("form-data");
const path = require("path");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..")));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
  }),
);

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;

const trimValue = (value, fallback = "N/A", max = 1024) =>
  String(value || fallback).substring(0, max);

const stripEmojis = (text) => {
  if (!text) return text;
  return text.replace(
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FEFF}\u{1F1E6}-\u{1F1FF}]/gu,
    "",
  );
};

app.post("/submit", upload.array("file"), async (req, res) => {
  try {
    const {
      name,
      description,
      style,
      clothing,
      pack,
      mood,
      payment,
      timeline,
      "discord-id": discordId,
      "custom-base": customBase,
      "seasonal-offer": seasonalOffer,
      extras: extrasRaw,
    } = req.body;

    const extras = Array.isArray(extrasRaw)
      ? extrasRaw.join(", ")
      : extrasRaw || "None";
    const baseUsed = style === "Other" ? customBase || "None" : style;

    const formData = new FormData();

    const fields = [
      { name: "Character", value: stripEmojis(trimValue(name)) },
      {
        name: "Description",
        value: stripEmojis(trimValue(description, "No description")),
      },
      { name: "Base", value: stripEmojis(trimValue(baseUsed)), inline: true },
      {
        name: "Pack",
        value: stripEmojis(trimValue(pack, "Basic")),
        inline: true,
      },
      {
        name: "Clothing",
        value: stripEmojis(trimValue(clothing || "None")),
        inline: true,
      },
      {
        name: "Mood",
        value: stripEmojis(trimValue(mood || "Not specified")),
        inline: true,
      },
      { name: "Extras", value: stripEmojis(trimValue(extras)), inline: true },
      {
        name: "Timeline",
        value: stripEmojis(trimValue(timeline || "Not specified")),
        inline: true,
      },
      {
        name: "Payment",
        value: stripEmojis(trimValue(payment || "Not specified")),
        inline: true,
      },
      {
        name: "Seasonal Offer",
        value: stripEmojis(trimValue(seasonalOffer || "None")),
        inline: true,
      },
      { name: "Discord", value: stripEmojis(trimValue(discordId, "Unknown")) },
    ];

    const embeds = [
      {
        title: "New Commission Request",
        color: 0x65e0bd,
        fields: fields,
      },
    ];

    if (req.files && req.files.length > 0) {
      req.files.forEach((file, i) => {
        formData.append(`file${i}`, file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
      });
    }

    formData.append("payload_json", JSON.stringify({ embeds }));

    await axios.post(WEBHOOK_URL, formData, {
      headers: formData.getHeaders(),
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).json({ error: "Failed to submit" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server live on port ${PORT}`);
});
