import createError from "http-errors";
import express from "express";
import path from "path";
import favicon from "serve-favicon";
import cookieParser from "cookie-parser";
import logger from "morgan";
import mongoose from "mongoose";
import kue from "kue";

import castleProjectsRouter from "./routes/castleProjects";
import projectsRouter from "./routes/projects";
import reportsRouter from "./routes/reports";
import commitsRouter from "./routes/commits";
import indexRouter from "./routes/index";
import functionRouter from "./routes/function";

const mongoDB =
  process.env.MONGODB_URI || "mongodb://localhost:27017/CastleDashboard";

const app = express();

mongoose.connect(
  mongoDB,
  { useNewUrlParser: true },
  error => {
    if (error) console.error(error);
  }
);

app.use(favicon(path.join(__dirname, "../../public", "favicon.ico")));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "../../dist/")));

app.use("/api/castleProjects", castleProjectsRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/commits", commitsRouter);
app.use("/api/functions", functionRouter);
app.use("/kue-ui", kue.app);
app.use("*", indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.json({
    message: err.message
  });
});

module.exports = app;
