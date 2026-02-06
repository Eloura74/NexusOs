import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["PRINTER", "NAS", "HOME_ASSISTANT", "SERVER", "OTHER"],
      default: "OTHER",
    },
    url: { type: String, required: true },
    icon: String, // Nom de l'icône Lucide ou URL
    status: {
      type: String,
      enum: ["ONLINE", "OFFLINE", "MAINTENANCE", "UNKNOWN"],
      default: "UNKNOWN",
    },
    lastCheck: { type: Date, default: Date.now },
    responseTime: Number, // ms
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Service", ServiceSchema);
