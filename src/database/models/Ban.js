const mongoose = require("mongoose");

const banSchema = new mongoose.Schema(
  {
    robloxIdentity: {
      userId: Number,
      username: String,
      usernameLower: { type: String, index: true },
      displayName: String
    },
    reason: { type: String, default: "" },
    durationMinutes: { type: Number, default: 0 },
    expiresAt: Date,
    active: { type: Boolean, default: true, index: true },
    createdBy: {
      id: String,
      tag: String,
      rank: String
    },
    revokedBy: {
      id: String,
      tag: String,
      rank: String
    },
    revokedAt: Date
  },
  {
    timestamps: true
  }
);

banSchema.index({ "robloxIdentity.userId": 1 });
banSchema.index({ "robloxIdentity.usernameLower": 1 });

module.exports = mongoose.model("Ban", banSchema);
