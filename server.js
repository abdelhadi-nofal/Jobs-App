const express = require("express");
require("dotenv").config();
const cors = require("cors");
const superagent = require("superagent");
const pg = require("pg");
const methodOverride = require("method-override");
const server = express();

server.use(cors());
server.use(express.urlencoded({ extended: true }));
server.use(methodOverride("_method"));
server.use(express.static("./public"));
server.set("view engine", "ejs");
// const client = new pg.Client(process.env.DATABASE_URL);

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DEV_MODE ? false : { rejectUnauthorized: false },
});

const PORT = process.env.PORT || 3010;

function Jobs(data) {
  this.title = data.title;
  this.company = data.company;
  this.location = data.location;
  this.url = data.url;
  this.description = data.description;
}

server.get("/", homeHandler);
server.get("/searchpage", searchPage);
server.post("/search", searchHandler);
server.get("/show", myRecordHandler);
server.post("/save", addHandler);
server.get("/detail/:id", detailHandler);
server.put("/update/:id", updateHandler);
server.delete("/delete/:id", deleteHandler);

function homeHandler(req, res) {
  let URL = `https://jobs.github.com/positions.json?location=usa`;

  superagent.get(URL).then((data) => {
    let dataArr = data.body.map((value) => {
      return new Jobs(value);
    });

    res.render("index", { jobsdata: dataArr });
  });
}

function searchPage(req, res) {
  res.render("search");
}

function searchHandler(req, res) {
  let description = req.body.description;
  let URL = `https://jobs.github.com/positions.json?description=${description}&location=usa`;

  superagent.get(URL).then((data) => {
    let dataArr = data.body.map((value) => {
      return new Jobs(value);
    });

    res.render("result", { jobsdata: dataArr });
  });
}

function addHandler(req, res) {
  let SQL = `INSERT INTO jobstable (title,company,location,url,description)
    VALUES($1,$2,$3,$4,$5) ;`;
  values = [
    req.body.title,
    req.body.company,
    req.body.location,
    req.body.url,
    req.body.description,
  ];

  client.query(SQL, values).then(() => {
    res.redirect("/show");
  });
}

function myRecordHandler(req, res) {
  let SQL = `SELECT * FROM jobstable;`;
  client.query(SQL).then((data) => {
    let dataArr = data.rows;
    res.render("myjobs", { jobsdata: dataArr });
  });
}

function detailHandler(req, res) {
  let SQL = `SELECT * FROM jobstable WHERE id=$1; `;
  let id = req.params.id;

  client.query(SQL, [id]).then((data) => {
    let dataArr = data.rows[0];
    res.render("detail", { element: dataArr });
  });
}

function updateHandler(req, res) {
  let SQL = `UPDATE jobstable SET title=$1,company=$2,location=$3,url=$4,description=$5 WHERE id=$6;`;
  let id = req.params.id;
  let savevalues = [
    req.body.title,
    req.body.company,
    req.body.location,
    req.body.url,
    req.body.description,
    req.params.id,
  ];

  client.query(SQL, savevalues).then(() => {
    res.redirect(`/detail/${id}`);
  });
}

function deleteHandler(req, res) {
  let SQL = `DELETE FROM jobstable WHERE id=$1 `;
  let id = req.params.id;

  client.query(SQL, [id]).then(() => {
    res.redirect("/show");
  });
}

client.connect().then(() => {
  server.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
  });
});
