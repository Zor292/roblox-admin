const mongoose = require("mongoose");

const warningSchema = new mongoose.Schema(
  {
    robloxIdentity: {
      userId: Number,
      username: String,
      usernameLower: { type: String, index: true },
      displayName: String
    },
    reason: { type: String, default: "" },
    createdBy: {
      id: String,
      tag: String,
      rank: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Warning", warningSchema);
