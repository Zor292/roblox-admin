const mongoose = require("mongoose");

async function connectDatabase(uri) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
}

module.exports = {
  connectDatabase
};
