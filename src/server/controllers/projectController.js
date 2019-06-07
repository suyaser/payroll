const kue = require("kue");
import axios from "axios";
const queue = kue.createQueue({ disableSearch: false });
const ProjectData = require("../models/project");
const P2ProjectData = require("../models/p2project");
const JobStatsData = require("../models/jobStats");
const CastleProjectData = require("../models/castleProject");

const main_url = "http://bob1-sv00028:8080/view/Bobigny/view/Customers";
const main_P2_url =
  "http://bob1-sv00028:8080/view/P2_Projects/view/STD_Transverse";
const api_url = "/api/json";

exports.project_list = (req, res) => {
  ProjectData.find()
    .sort({ _id: -1 })
    .exec()
    .then(docs => {
      res.status(200).json({
        draw: 1,
        recordsTotal: docs.length,
        recordsFiltered: docs.length,
        data: docs
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.stats_list = (req, res) => {
  JobStatsData.findOne({ id: 1 })
    .exec()
    .then(doc => {
      res.status(200).json({
        data: doc
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.project_p2_list = (req, res) => {
  P2ProjectData.find()
    .sort({ _id: -1 })
    .exec()
    .then(docs => {
      res.status(200).json({
        draw: 1,
        recordsTotal: docs.length,
        recordsFiltered: docs.length,
        data: docs
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.stats_p2_list = (req, res) => {
  JobStatsData.findOne({ id: 2 })
    .exec()
    .then(doc => {
      res.status(200).json({
        data: doc
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.project_detail = (req, res) => {
  const id = req.params.ProjectId;
  ProjectData.findOne({ id: id })
    .populate("stats_id")
    .exec()
    .then(doc => {
      if (doc) {
        res.status(200).json(doc);
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.project_update = (req, res) => {
  var job = queue.create("Projects Update").save(function(err) {
    if (err) {
      res.status(500).json({
        error: err
      });
    } else {
      res.status(200).json({ job: job.id });
    }
  });
};

queue.process("Projects Update", (job, done) => {
  update_project_data(done).catch(err => {
    done(err);
  });
});

const update_project_data = async done => {
  let castleDocs = await CastleProjectData.find({})
    .populate("report_id")
    .populate("commit_id")
    .populate("parent")
    .sort({ _id: -1 })
    .exec()
    .catch(err => {
      console.log(err);
    });
  let result = await fetch_data(main_url + api_url).catch(err => {
    console.log(err);
  });
  let id_array = [];
  let stats = {
    id: 1,
    compile_job: { blue: 0, red: 0, yellow: 0, other: 0 },
    mem_job: { blue: 0, red: 0, yellow: 0, other: 0 },
    prqa_job: { blue: 0, red: 0, yellow: 0, other: 0 },
    qac_job: { blue: 0, red: 0, yellow: 0, other: 0 },
    klocwork_job: { blue: 0, red: 0, yellow: 0, other: 0 },
    binaries_job: { blue: 0, red: 0, yellow: 0, other: 0 },
    castle_job: { blue: 0, red: 0, yellow: 0, other: 0 }
  };
  if (result.data.views == null) return;
  for (const oemData of result.data.views) {
    let oemName = oemData.name;
    let oemResult = await fetch_data(oemData.url + api_url).catch(err => {
      console.log(err);
    });
    if (oemResult.data.views == null) continue;
    for (const projectData of oemResult.data.views) {
      let project = {};
      project.oem = oemName;
      project.project_id = projectData.name.substr(
        0,
        projectData.name.indexOf("_")
      );
      project.name = projectData.name.substr(projectData.name.indexOf("_") + 1);
      let projectResult = await fetch_data(projectData.url + api_url).catch(
        err => {
          console.log(err);
        }
      );
      if (projectResult.data.views == null) continue;
      for (const branchData of projectResult.data.views) {
        let branch = { url: branchData.url };
        let branchResult = await fetch_data(branchData.url + api_url).catch(
          err => {
            console.log(err);
          }
        );
        if (branchResult.data.jobs == null) return;
        for (const jobData of branchResult.data.jobs) {
          let statType = {};
          if (jobData.name.toLowerCase().includes("tag")) {
            project.tag = branch;
          } else if (jobData.name.toLowerCase().includes("trunk")) {
            project.trunk = branch;
          } else {
            continue;
          }
          if (
            jobData.name.toLowerCase().includes("compil") ||
            jobData.name.toLowerCase().includes("compil")
          ) {
            statType = stats.compile_job;
            branch.compileResult = jobData;
          } else if (
            jobData.name.toLowerCase().includes("prqa-trunk") ||
            jobData.name.toLowerCase().includes("prqa-tag")
          ) {
            statType = stats.prqa_job;
            branch.prqaResult = jobData;
          } else if (
            jobData.name.toLowerCase().includes("qac-trunk") ||
            jobData.name.toLowerCase().includes("qac-tag")
          ) {
            statType = stats.qac_job;
            branch.qacResult = jobData;
          } else if (
            jobData.name.toLowerCase().includes("memsize-trunk") ||
            jobData.name.toLowerCase().includes("memsize-tag")
          ) {
            statType = stats.mem_job;
            branch.memoryResult = jobData;
          } else if (jobData.name.toLowerCase().includes("klocwork")) {
            statType = stats.klocwork_job;
            branch.klockResult = jobData;
          } else if (
            jobData.name.toLowerCase().includes("compare-binaries-tag")
          ) {
            statType = stats.binaries_job;
            branch.binariesResult = jobData;
          } else {
            continue;
          }
          if (jobData.color === "yellow") {
            jobData.color = "info";
            jobData.msg = "Unstable";
            statType.yellow++;
          } else if (jobData.color === "blue") {
            jobData.color = "success";
            jobData.msg = "Success";
            statType.blue++;
          } else if (jobData.color === "red") {
            jobData.color = "danger";
            jobData.msg = "Fail";
            statType.red++;
          } else if (jobData.color === "notbuilt") {
            jobData.color = "warning";
            jobData.msg = "Not Active";
            statType.yellow++;
          } else if (jobData.color === "disabled") {
            jobData.color = "muted";
            jobData.msg = "Disabled";
            statType.yellow++;
          } else {
            statType.yellow++;
          }
        }
      }
      project.id = project.project_id + "_" + project.name;
      id_array.push(project.id);

      let filteredDocs = castleDocs.filter(
        doc => doc.parent && doc.report_id && doc.parent.id === project.id
      );
      project.trunk.castleResult = {
        num_ok: 0,
        num_nok: 0,
        num_np: 0,
        num_ok_perc: 0,
        num_nok_perc: 0,
        num_np_perc: 0
      };
      project.tag.castleResult = {
        num_ok: 0,
        num_nok: 0,
        num_np: 0,
        num_ok_perc: 0,
        num_nok_perc: 0,
        num_np_perc: 0
      };

      for (let i = 0; i < filteredDocs.length; i++) {
        project.trunk.castleResult.num_ok += filteredDocs[i].report_id.num_ok;
        project.trunk.castleResult.num_nok += filteredDocs[i].report_id.num_nok;
        project.trunk.castleResult.num_np += filteredDocs[i].report_id.num_np;
        project.trunk.castleResult.num_ok_perc +=
          filteredDocs[i].report_id.num_ok_perc;
        project.trunk.castleResult.num_nok_perc +=
          filteredDocs[i].report_id.num_nok_perc;
        project.trunk.castleResult.num_np_perc +=
          filteredDocs[i].report_id.num_np_perc;
      }
      if (filteredDocs.length !== 0) {
        stats.castle_job.blue++;
        project.trunk.castleResult.num_ok_perc /= filteredDocs.length;
        project.trunk.castleResult.num_nok_perc /= filteredDocs.length;
        project.trunk.castleResult.num_np_perc /= filteredDocs.length;
      }

      var query = { id: project.id },
        options = { upsert: true, new: true, setDefaultsOnInsert: true };

      ProjectData.findOneAndUpdate(query, project, options, function(
        error,
        result
      ) {
        if (error) {
          console.log(error);
          return;
        }
        result.save().catch(err => {
          console.log(err);
        });
      });
    }
  }
  ProjectData.deleteMany({ id: { $nin: id_array } }, function(err) {
    console.log(err);
  });

  var query = { id: 1 },
    options = { upsert: true, new: true, setDefaultsOnInsert: true };

  JobStatsData.findOneAndUpdate(query, stats, options, function(error, result) {
    if (error) return;
    result.save().catch(err => {
      console.log(err);
    });
  });
  console.log("project update finished succesfully");
  done(null, "finished");
};

exports.project_p2_update = (req, res) => {
  var job = queue.create("Projects P2 Update").save(function(err) {
    if (err) {
      res.status(500).json({
        error: err
      });
    } else {
      res.status(200).json({ job: job.id });
    }
  });
};

queue.process("Projects P2 Update", (job, done) => {
  update_p2_project_data(done).catch(err => {
    done(err);
  });
});

const update_p2_project_data = async done => {
  let result = await fetch_data(main_P2_url + api_url).catch(err => {
    console.log(err);
  });

  let stats = {
    id: 2,
    compile_job: { blue: 0, red: 0, yellow: 0, other: 0 },
    klock_job: { blue: 0, red: 0, yellow: 0, other: 0 },
    vcast_job: { blue: 0, red: 0, yellow: 0, other: 0 }
  };
  if (result.data.views == null) return;
  for (const projectData of result.data.views) {
    let project = {};
    project.name = projectData.name;
    let projectResult = await fetch_data(projectData.url + api_url).catch(
      err => {
        console.log(err);
      }
    );
    if (projectResult.data.views == null) continue;
    for (const branchData of projectResult.data.views) {
      let branch = { url: branchData.url };
      let branchResult = await fetch_data(branchData.url + api_url).catch(
        err => {
          console.log(err);
        }
      );
      if (branchResult.data.jobs == null) return;
      for (const jobData of branchResult.data.jobs) {
        let statType = {};
        if (jobData.name.toLowerCase().includes("trunk")) {
          project.trunk = branch;
        } else {
          continue;
        }
        if (jobData.name.toLowerCase().includes("compil")) {
          statType = stats.compile_job;
          branch.compileResult = jobData;
        } else if (jobData.name.toLowerCase().includes("klocwork")) {
          statType = stats.klock_job;
          branch.klockResult = jobData;
        } else if (jobData.name.toLowerCase().includes("vcast")) {
          statType = stats.vcast_job;
          branch.vcastResult = jobData;
        } else {
          continue;
        }
        if (jobData.color === "yellow") {
          jobData.color = "info";
          jobData.msg = "Unstable";
          statType.yellow++;
        } else if (jobData.color === "blue") {
          jobData.color = "success";
          jobData.msg = "Success";
          statType.blue++;
        } else if (jobData.color === "red") {
          jobData.color = "danger";
          jobData.msg = "Fail";
          statType.red++;
        } else if (jobData.color === "notbuilt") {
          jobData.color = "warning";
          jobData.msg = "Not Active";
          statType.yellow++;
        } else if (jobData.color === "disabled") {
          jobData.color = "muted";
          jobData.msg = "Disabled";
          statType.yellow++;
        } else {
          statType.yellow++;
        }
      }
    }

    var query = { name: project.name },
      options = { upsert: true, new: true, setDefaultsOnInsert: true };

    P2ProjectData.findOneAndUpdate(query, project, options, function(
      error,
      result
    ) {
      if (error) {
        console.log(error);
        return;
      }
      result.save().catch(err => {
        console.log(err);
      });
    });
  }

  var query = { id: 2 },
    options = { upsert: true, new: true, setDefaultsOnInsert: true };

  JobStatsData.findOneAndUpdate(query, stats, options, function(error, result) {
    if (error) return;
    result.save().catch(err => {
      console.log(err);
    });
  });
  console.log("project p2 update finished succesfully");
  done(null, "finished");
};

const fetch_data = async url => {
  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then(response => {
        resolve({ data: response.data });
      })
      .catch(error => {
        console.log(error);
        reject({ error: error });
      });
  });
};
