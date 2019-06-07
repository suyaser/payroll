const ProjectData = require("../models/castleProject");
const ReportData = require("../models/report");
const CommitData = require("../models/commit");
const kue = require("kue");
import axios from "axios";
const parseString = require("xml2js").parseString;
const queue = kue.createQueue({ disableSearch: false });
queue.watchStuckJobs(5000);
var svnUltimate = require("node-svn-ultimate");

exports.project_list = (req, res) => {
  ProjectData.find({})
    .populate("report_id")
    .populate("commit_id")
    .populate("parent")
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

exports.project_list_parent = (req, res) => {
  ProjectData.find({ parent: req.params.projectId })
    .populate("report_id")
    .populate("commit_id")
    .populate("parent")
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

exports.project_detail = (req, res) => {
  const id = req.params.ProjectId;
  ProjectData.findById(id)
    .populate("report_id")
    .populate("commit_id")
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

exports.link_castle = (req, res) => {
  ProjectData.findByIdAndUpdate(
    req.body.CastleID,
    { parent: req.body.ProjectID },
    function(error, result) {
      if (error) {
        res.status(500).json({ error: error });
      } else {
        result
          .save()
          .then(doc => {
            res.status(200).json(doc);
          })
          .catch(err => {
            res.status(500).json({ error: err });
          });
      }
    }
  );
};

exports.project_create = (req, res) => {
  const Project = new ProjectData({
    proj_name: req.body.name,
    oem: req.body.oem,
    svn_url: req.body.url,
    functionID: req.body.function,
    productID: req.body.product
  });
  Project.save()
    .then(result => {
      res.status(201).json({
        message: "Handling POST requests to /Projects",
        createdProject: result
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.project_report_add = (req, res) => {
  const report = new ReportData(req.body);
  report
    .save()
    .then(result => {
      const id = req.params.ProjectId;
      const updateOps = {};
      updateOps["report_id"] = result._id;
      ProjectData.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result2 => {
          res.status(200).json({
            message: "report added to project",
            url: "http://localhost:3000/api/castleProjects/" + id,
            createdReport: result
          });
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({
            error: err
          });
        });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.project_commit_add = (req, res) => {
  const commit = new CommitData(req.body);
  commit
    .save()
    .then(result => {
      const id = req.params.ProjectId;
      const updateOps = {};
      updateOps["commit_id"] = result._id;
      ProjectData.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result2 => {
          res.status(200).json({
            message: "commit added to project",
            url: "http://localhost:3000/api/castleProjects/" + id,
            createdCommit: result
          });
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({
            error: err
          });
        });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.project_patch = (req, res) => {
  const id = req.params.ProjectId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  console.log(updateOps);
  ProjectData.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Project updated",
        url: "http://localhost:3000/api/castleProjects/" + id
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.project_delete = (req, res) => {
  const id = req.params.ProjectId;
  ProjectData.remove({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.project_run = (req, res) => {
  const id = req.body.ProjectId;
  ProjectData.findById(id)
    .exec()
    .then(doc => {
      if (doc) {
        if (doc.exu && doc.exu.id > 0) {
          var job = queue
            .create("Run Project", {
              projectName: req.body.ProjectName,
              svnUrl: req.body.SvnUrl,
              projectId: req.body.ProjectId,
              exuID: doc.exu.id
            })
            .searchKeys(["projectName"])
            .removeOnComplete(true)
            .save(function(err) {
              if (err) {
                res.status(500).json({
                  error: err
                });
              } else {
                res.status(200).json({ job: job.id });
              }
            });
        } else {
          res.status(404).json({
            message: "No valid Exu Connection established to project"
          });
        }
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
  svnUltimate.commands.info(
    req.body.SvnUrl,
    {
      username: "s-FRP-BOB1-Jenkins-B",
      password: "pWdDI*NPWn)B)9e"
    },
    function(err, data) {
      if (err) {
        res.status(500).json({
          error: err
        });
        return;
      }
      const newRevision =
        data.entry === null ? null : data.entry.commit.$.revision;
      const oldRevision = req.body.revision;
      if (newRevision === oldRevision) {
        res.status(200).json({ update_status: "Already Updated" });
        return;
      }
      var job = queue
        .create("Project Update", {
          projectName: req.body.ProjectName,
          svnUrl: req.body.SvnUrl,
          projectId: req.body.ProjectId
        })
        .searchKeys(["projectName"])
        .removeOnComplete(true)
        .save(function(err) {
          if (err) {
            res.status(500).json({
              error: err
            });
          } else {
            res
              .status(200)
              .json({ job: job.id, update_status: "Update Started" });
          }
        });
    }
  );
};

exports.project_update_all = (req, res) => {
  ProjectData.find({ parent: null })
    .populate("commit_id")
    .sort({ _id: -1 })
    .exec()
    .then(docs => {
      docs.forEach((doc, index) => {
        svnUltimate.commands.info(
          doc.svn_url,
          {
            username: "s-FRP-BOB1-Jenkins-B",
            password: "pWdDI*NPWn)B)9e"
          },
          function(err, data) {
            if (err) {
              return;
            }
            const newRevision =
              data.entry === null ? null : data.entry.commit.$.revision;
            let oldRevision = -1;
            if (doc.commit_id) oldRevision = doc.commit_id.revision;
            if (newRevision === oldRevision) {
              return;
            }
            var job = queue
              .create("Project Update", {
                projectName: doc.proj_name,
                svnUrl: doc.svn_url,
                projectId: doc._id
              })
              .searchKeys(["projectName"])
              .removeOnComplete(true)
              .save(function(err) {
                console.log(err);
              });
          }
        );
      });
      res.status(200).json({ status: "update all started" });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.project_job_list = (req, res) => {
  const arr = JSON.parse(req.params.JobIdList);
  let JobIdList = [];
  arr.forEach((id, index) => {
    kue.Job.get(id, (err, job) => {
      JobIdList.push(job);
      if (JobIdList.length === arr.length)
        res.status(200).json({ jobs: JobIdList });
    });
  });
};

exports.project_job = (req, res) => {
  kue.Job.get(req.params.JobId, (err, job) => {
    res.status(200).json({ job: job });
  });
};

queue.process("Project Update", (job, done) => {
  const path =
    "http://cai1-sv00075:8080/blue/rest/organizations/jenkins/pipelines/UpdateProject/runs/";
  const postData = {
    parameters: [
      {
        name: "PROJECT_NAME",
        value: job.data.projectName
      },
      {
        name: "SVN_URL",
        value: job.data.svnUrl
      },
      {
        name: "JOB_ID",
        value: job.id
      }
    ]
  };
  const optionsPost = "post";
  const optionsGet = "get";

  const next = (err, result) => {
    if (err) done(err);
    else {
      const link =
        "http://cai1-sv00075:8080/blue/rest/organizations/jenkins/pipelines/UpdateProject/runs/" +
        result.id;
      if (result.state === "QUEUED" || result.state === "RUNNING") {
        send_request(link, {}, optionsGet, next);
      } else if (result.state === "FINISHED") {
        if (result.result === "FAILURE")
          done({ error: `JENKINS JOB ${result.id} FAILED` }, result);
        else {
          axios
            .get(
              `http://cai1-sv00075:8080/job/UpdateProject/${
                result.id
              }/artifact/reports/coverage_report.xml`
            )
            .then(function(response) {
              parseString(response.data, function(err, res) {
                const report_stats = get_stats(
                  job.data.projectId,
                  res,
                  job.data.svnUrl
                );
                const job_result = {
                  report_stats: report_stats,
                  job_stats: result
                };
                update_stats(job.data.projectId, report_stats);
                done(null, job_result);
              });
            })
            .catch(error => {
              done(error);
            });
        }
      } else {
        console.log("undefined state");
        done({ error: "undefined state" });
      }
    }
  };
  send_request(path, postData, optionsPost, next);
});

queue.process("Run Project", (job, done) => {
  const path =
    "http://cai1-sv00075:8080/blue/rest/organizations/jenkins/pipelines/RunProject/runs/";
  const postData = {
    parameters: [
      {
        name: "PROJECT_NAME",
        value: job.data.projectName
      },
      {
        name: "SVN_URL",
        value: job.data.svnUrl
      },
      {
        name: "JOB_ID",
        value: job.id
      },
      {
        name: "EXU_ID",
        value: job.data.exuID
      }
    ]
  };
  const optionsPost = "post";
  const optionsGet = "get";

  const next = (error, result) => {
    if (error) {
      done(error);
    } else {
      const link =
        "http://cai1-sv00075:8080/blue/rest/organizations/jenkins/pipelines/RunProject/runs/" +
        result.id;
      if (result.state === "QUEUED" || result.state === "RUNNING") {
        send_request(link, {}, optionsGet, next);
      } else if (result.state === "FINISHED") {
        if (result.result === "FAILURE")
          done({ error: `JENKINS JOB ${result.id} FAILED` }, result);
        else {
          axios
            .get(
              `http://cai1-sv00075:8080/job/RunProject/${
                result.id
              }/artifact/reports/coverage_report.xml`
            )
            .then(function(response) {
              parseString(response.data, function(err, res) {
                const report_stats = get_stats(
                  job.data.projectId,
                  res,
                  job.data.svnUrl
                );
                const job_result = {
                  report_stats: report_stats,
                  job_stats: result
                };
                done(null, job_result);
              });
            })
            .catch(error => {
              done(error);
            });
        }
      } else {
        done({ error: "undefined state" });
      }
    }
  };
  send_request(path, postData, optionsPost, next);
});

const send_request = (path, postData, options, next) => {
  axios({
    method: options,
    url: path,
    data: postData
  })
    .then(response => {
      next(null, response.data);
    })
    .catch(error => {
      if (error.response && error.response.status === 404)
        send_request(path, postData, options, next);
      else next(error, null);
    });
};

const update_stats = (projectId, report_result) => {
  axios
    .post(
      `http://localhost:3000/api/castleProjects/report/${projectId}`,
      report_result
    )
    .then(response => {
      console.log("update report succes");
    })
    .catch(error => {
      console.log("update report failed");
    });
};

const get_stats = (projectId, res, url) => {
  svnUltimate.commands.info(
    url,
    {
      username: "s-FRP-BOB1-Jenkins-B",
      password: "pWdDI*NPWn)B)9e"
    },
    function(err, data) {
      let postData = {
        revision: data.entry.commit.$.revision,
        author: data.entry.commit.author,
        date: data.entry.commit.date
      };
      axios
        .post(
          `http://localhost:3000/api/castleProjects/commit/${projectId}`,
          postData
        )
        .then(response => {
          console.log("update commit succes");
        })
        .catch(error => {
          console.log("update commit failed");
        });
    }
  );
  let postData = {
    num: +res.ProjectType.Statistics[0].TestCasesStatistics[0]
      .NumberTestCases[0],
    num_ok: +res.ProjectType.Statistics[0].TestCasesStatistics[0]
      .NumberOkTestCases[0],
    num_nok: +res.ProjectType.Statistics[0].TestCasesStatistics[0]
      .NumberNokTestCases[0],
    num_ok_perc: +res.ProjectType.Statistics[0].TestCasesStatistics[0]
      .OkPercentage[0],
    num_nok_perc: +res.ProjectType.Statistics[0].TestCasesStatistics[0]
      .NokPercentage[0],
    grp_num: +res.ProjectType.Statistics[0].TestGroupStatistics[0]
      .NumberGroups[0],
    grp_num_ok: +res.ProjectType.Statistics[0].TestGroupStatistics[0]
      .NumberOkTestGroups[0],
    grp_num_nok: +res.ProjectType.Statistics[0].TestGroupStatistics[0]
      .NumberNokTestGroups[0],
    grp_num_ok_perc: +res.ProjectType.Statistics[0].TestGroupStatistics[0]
      .OkPercentage[0],
    grp_num_nok_perc: +res.ProjectType.Statistics[0].TestGroupStatistics[0]
      .NokPercentage[0],
    feat_num: +res.ProjectType.Statistics[0].FeatureStatistics[0]
      .NumberFeatures[0],
    feat_num_ok: +res.ProjectType.Statistics[0].FeatureStatistics[0]
      .NumberOkFeatures[0],
    feat_num_nok: +res.ProjectType.Statistics[0].FeatureStatistics[0]
      .NumberNokFeatures[0],
    feat_num_ok_perc: +res.ProjectType.Statistics[0].FeatureStatistics[0]
      .OkPercentage[0],
    feat_num_nok_perc: +res.ProjectType.Statistics[0].FeatureStatistics[0]
      .NokPercentage[0],
    feat_num_np_perc: 0,
    feat_num_np: 0,
    grp_num_np_perc: 0,
    grp_num_np: 0,
    num_np_perc: 0,
    num_std: 0,
    num_emp_def: 0,
    num_np: 0
  };

  try {
    postData.feat_num_np_perc = +res.ProjectType.Statistics[0]
      .FeatureStatistics[0].NPPercentage[0];
    postData.feat_num_np = +res.ProjectType.Statistics[0].FeatureStatistics[0]
      .NumberNPFeatures[0];
    postData.grp_num_np_perc = +res.ProjectType.Statistics[0]
      .TestGroupStatistics[0].nPPercentage[0];
    postData.grp_num_np = +res.ProjectType.Statistics[0].TestGroupStatistics[0]
      .NumberNPTestGroups[0];
    postData.num_np_perc = +res.ProjectType.Statistics[0].TestCasesStatistics[0]
      .NPPercentage[0];
    postData.num_std = +res.ProjectType.Statistics[0].TestCasesStatistics[0]
      .NumberStdTests[0];
    postData.num_emp_def = +res.ProjectType.Statistics[0].TestCasesStatistics[0]
      .NumberEmptyDefects[0];
    postData.num_np = +res.ProjectType.Statistics[0].TestCasesStatistics[0]
      .NumberNPTestCases[0];
  } catch (err) {
    console.log("old xml doesnt contain forms");
  }

  console.log(postData);

  return postData;
};
