const mongoose = require("mongoose");

const reportSchema = mongoose.Schema(
  {
    num: { type: Number, default: 0 },
    num_ok: { type: Number, default: 0 },
    num_nok: { type: Number, default: 0 },
    num_np: { type: Number, default: 0 },
    num_ok_perc: { type: Number, default: 0 },
    num_nok_perc: { type: Number, default: 0 },
    num_np_perc: { type: Number, default: 0 },
    num_std: { type: Number, default: 0 },
    num_emp_def: { type: Number, default: 0 },
    grp_num: { type: Number, default: 0 },
    grp_num_ok: { type: Number, default: 0 },
    grp_num_nok: { type: Number, default: 0 },
    grp_num_np: { type: Number, default: 0 },
    grp_num_ok_perc: { type: Number, default: 0 },
    grp_num_nok_perc: { type: Number, default: 0 },
    grp_num_np_perc: { type: Number, default: 0 },
    feat_num: { type: Number, default: 0 },
    feat_num_ok: { type: Number, default: 0 },
    feat_num_nok: { type: Number, default: 0 },
    feat_num_np: { type: Number, default: 0 },
    feat_num_ok_perc: { type: Number, default: 0 },
    feat_num_nok_perc: { type: Number, default: 0 },
    feat_num_np_perc: { type: Number, default: 0 }
  },

  {
    collection: "reports",
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

reportSchema.virtual("url_api").get(function() {
  return "http://localhost:3000/api/reports/" + this._id;
});

module.exports = mongoose.model("Report", reportSchema);
