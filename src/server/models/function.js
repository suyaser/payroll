const mongoose = require("mongoose");

const functionSchema = mongoose.Schema(
  {
    id: String
  },
  {
    collection: "function",
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

functionSchema.virtual("url_api").get(function() {
  return "http://localhost:3000/api/function/" + this._id;
});

module.exports = mongoose.model("function", functionSchema);
