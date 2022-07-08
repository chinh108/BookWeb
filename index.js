const path = require("path");
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const Router = require("./routes");
const { getCommic, getChapterData } = require("./utils/MainService");

const username = "<mongodb username>";
const password = "<password>";
const cluster = "<cluster name>";
const dbname = "myFirstDatabase";
//const array = [];

const app = express();

// Static foler
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(cors({ credentials: true, origin: true }));
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", "./views");

mongoose.connect(
  "mongodb+srv://PhamTruongChinh:abcd1234@bookwed-cluster.hy54g.mongodb.net/?retryWrites=true&w=majoritys",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

app.listen(3000, () => console.log("listening on port", 3000));

app.get("/login", (req, res) => {
  return res.render("login");
});

app.get("/aa", async (req, res) => {
  const data = await getChapterData(
    "https://docln.net/truyen/139-that-nghiep-tai-sinh/c6823-web-novel-chapter-57-ngay-em-gai-hau-nu-ra-doi"
  );
  res.send(data);
});

app.get("/home", (req, res) => {
  return res.render("BookWeb");
});

app.get("/test", async (req, res) => {
  console.log("aaaa");
  const data = await getCommic(
    "https://docln.net/truyen/139-that-nghiep-tai-sinh"
  );
  res.send(data);
});

app.get("/", (req, res) => {
  const book = getCommic();
});
