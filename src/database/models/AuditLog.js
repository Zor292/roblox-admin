const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, index: true },
    event: { type: String, required: true },
    actor: {
      id: String,
      tag: String,
      rank: String
    },
    target: {
      username: String,
      userId: Number
    },
    message: { type: String, default: "" },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
