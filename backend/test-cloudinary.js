require("dotenv").config();
const cloudinary = require("./config/cloudinary");

async function main() {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = "cooking-ib/test";

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET
  );

  // mini image 1x1 pixel, pas de téléchargement externe
  const tinyImage =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

  const form = new FormData();
  form.append("file", tinyImage);
  form.append("api_key", process.env.CLOUDINARY_API_KEY);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("signature", signature);

  const url = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;
  const res = await fetch(url, { method: "POST", body: form });

  console.log("Status:", res.status);
  console.log(await res.text());
}

main().catch((e) => console.log("Erreur script:", e.message));