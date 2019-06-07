const mongoose = require("mongoose");

const jobSchema = mongoose.Schema({
  blue: { type: Number, required: true },
  red: { type: Number, required: true },
  yellow: { type: Number, required: true },
  other: { type: Number, required: true }
});

const jobStatSchema = mongoose.Schema(
  {
    id: String,
    compile_job: jobSchema,
    mem_job: jobSchema,
    prqa_job: jobSchema,
    qac_job: jobSchema,
    klocwork_job: jobSchema,
    binaries_job: jobSchema,
    klock_job: jobSchema,
    vcast_job: jobSchema,
    castle_job: jobSchema
  },
  {
    collection: "jobStats",
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

jobStatSchema.virtual("url_api").get(function() {
  return "http://localhost:3000/api/jobStats/" + this._id;
});

module.exports = mongoose.model("jobStat", jobStatSchema);
