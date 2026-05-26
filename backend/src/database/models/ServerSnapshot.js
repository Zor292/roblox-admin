const mongoose = require("mongoose");

const serverSnapshotSchema = new mongoose.Schema(
  {
    serverId: { type: String, required: true, index: true },
    jobId: String,
    placeId: String,
    universeId: String,
    playerCount: { type: Number, default: 0 },
    admins: { type: Array, default: [] },
    players: { type: Array, default: [] },
    state: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ServerSnapshot", serverSnapshotSchema);
