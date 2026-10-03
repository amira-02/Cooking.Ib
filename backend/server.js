const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./config/firebase"); // initialise Firebase Admin

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API Cooking.Ib en ligne 🍰" });
});

app.use("/api/categories", require("./routes/categories"));
app.use("/api/products", require("./routes/products"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/otp", require("./routes/otp"));
app.use("/api/password", require("./routes/password"));
app.use("/api/homepage", require("./routes/homepage"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/track", require("./routes/track"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur backend lancé sur http://localhost:${PORT}`);
});