const mongoose = require("mongoose");

const rankSchema = new mongoose.Schema(
  {
    robloxIdentity: {
      userId: Number,
      username: String,
      usernameLower: { type: String, index: true },
      displayName: String
    },
    rank: { type: String, required: true, index: true },
    updatedBy: {
      id: String,
      tag: String,
      rank: String
    }
  },
  {
    timestamps: true
  }
);

rankSchema.index({ "robloxIdentity.userId": 1 });
rankSchema.index({ "robloxIdentity.usernameLower": 1 });

module.exports = mongoose.model("Rank", rankSchema);
