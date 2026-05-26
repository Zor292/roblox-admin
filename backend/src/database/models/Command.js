const mongoose = require("mongoose");

const commandSchema = new mongoose.Schema(
  {
    nonce: { type: String, required: true, unique: true, index: true },
    commandName: { type: String, required: true, index: true },
    args: { type: mongoose.Schema.Types.Mixed, default: {} },
    source: { type: String, required: true, index: true },
    actor: {
      id: String,
      tag: String,
      rank: String
    },
    target: {
      username: String,
      userId: Number
    },
    scope: {
      serverId: String,
      jobId: String,
      placeId: String,
      universeId: String
    },
    status: { type: String, default: "queued", index: true },
    result: { type: mongoose.Schema.Types.Mixed, default: null },
    dispatchedAt: Date,
    completedAt: Date
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Command", commandSchema);
