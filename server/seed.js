import mongoose from "mongoose";
import dotenv from "dotenv";
import Service from "./models/Service.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/nexusos";

const servicesToSeed = [
  {
    name: "VzBot 330",
    type: "PRINTER",
    url: "http://192.168.1.130",
    icon: "Printer",
    status: "UNKNOWN",
  },
  {
    name: "Switchwire",
    type: "PRINTER",
    url: "http://192.168.1.128",
    icon: "Printer",
    status: "UNKNOWN",
  },
  {
    name: "BambuLab A1 Mini",
    type: "PRINTER",
    url: "http://bambulab.com", // Placeholder car pas d'IP directe simple sans API spécifique
    icon: "Printer",
    status: "UNKNOWN",
  },
  {
    name: "Home Assistant",
    type: "HOME_ASSISTANT",
    url: "http://192.168.1.193:8123",
    icon: "Home",
    status: "UNKNOWN",
  },
  {
    name: "TrueNAS",
    type: "NAS",
    url: "http://192.168.1.24:8080",
    icon: "HardDrive",
    status: "UNKNOWN",
  },
];

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to DB");
    await Service.deleteMany({}); // Reset
    await Service.insertMany(servicesToSeed);
    console.log("✅ Services Seeded");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
