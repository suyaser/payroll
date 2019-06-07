const mongoose = require("mongoose");

const commitSchema = mongoose.Schema(
  {
    revision: { type: String, required: true },
    author: { type: String, required: true },
    date: { type: Date, required: true }
  },

  {
    collection: "commits",
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

commitSchema.virtual("url_api").get(function() {
  return "http://localhost:3000/api/commits/" + this._id;
});

module.exports = mongoose.model("Commit", commitSchema);
