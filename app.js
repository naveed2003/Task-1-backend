const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
app.use(express.json());
const cors = require("cors");
const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(cors());
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));

require("./userDetails");
require("./imageDetails");
const JWT_SECRET =
  "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jbkj?[]]pou89ywe";

const mongoUrl =
  "mongodb+srv://abdulnaveed:abdulnaveed@cluster0.nyvoppx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
});

mongoose.connection.on("connected", () => {
  console.log("connected to mongobd");
});

app.listen(5050, () => {
  console.log("Server Started");
});

const User = mongoose.model("userinfo");
const Image = mongoose.model("imagedetails");

app.post("/register", async (req, res) => {
  const { fname, lname, Email, password, userType } = req.body;
  const encryptedPassword = await bcrypt.hash(password, 10);
  console.log(req.body);
  try {
    const userexit = await User.findOne({ Email });

    if (userexit) {
      // console.log("User already exists block");
      return res.status(400).json({ error: "User Already Exits" });
    }
    await User.create({
      fname: fname,
      lname: lname,
      Email: Email,
      password: encryptedPassword,
      userType: userType,
    });

    res.send({ status: "Ok" });
  } catch (error) {
    // console.log(error);
    // console.log("In error block");
    return res.status(400).json({ error: "Error" });
  }
});

app.post("/login-user", async (req, res) => {
  try {
    const { Email, password } = req.body;

    // console.log(req.body);

    const user = await User.findOne({ Email });
    console.log("User", user);

    if (!user) {
      // console.log("error block");
      return res.status(400).json({ error: "User Not found" });
    }

    if (await bcrypt.compare(password, user.password)) {
      // console.log("Password is matched");
      const token = jwt.sign({ Email: user.Email }, JWT_SECRET, {
        expiresIn: "30h",
      });
      return res.json({ status: "ok", data: token });
    } else {
      return res.json({ error: "Invalid Password" });
    }
  } catch (error) {
    // console.error("Error occurred:", error);
    return res.json({ error: "Internal Server Error" });
  }
});

app.post("/userData", async (req, res) => {
  const { token } = req.body;
  //console.log(token);
  try {
    const user = jwt.verify(token, JWT_SECRET, (err, res) => {
      if (err) return "token expired";
      return res;
    });
    //console.log(user);
    if (user == "token expired") {
      return res.send({ status: "error", data: "token expired" });
    }
    const useremail = user.Email;
    User.findOne({ Email: useremail })
      .then((data) => {
        res.send({ status: "ok", data: data });
      })
      .catch((error) => {
        res.send({ status: "error", data: error });
      });
  } catch (error) {}
});

app.get("/getAllUser", async (req, res) => {
  let query = {};
  const searchData = req.query.search;
  if (searchData) {
    query = {
      $or: [
        { fname: { $regex: searchData, $options: "i" } },
        { Email: { $regex: searchData, $options: "i" } },
      ],
    };
  }

  try {
    const allUser = await User.find(query);
    res.send({ status: "OK", data: allUser });
  } catch (error) {
    console.log(error);
  }
});

app.post("/updateUser", async (req, res) => {
  const { id, fname, lname } = req.body;

  try {
    await User.updateOne(
      { _id: id },
      {
        $set: {
          fname: fname,
          lname: lname,
        },
      }
    );
    return res.json({ status: "ok", data: "updated" });
  } catch (error) {
    return res.json({ status: "error", data: error });
  }
});

app.post("/edituser", async (req, res) => {
  const { id, fname, lname } = req.body;

  try {
    await User.updateOne(
      { _id: id },
      {
        $set: {
          fname: fname,
          lname: lname,
        },
      }
    );
    return res.json({ status: "ok", data: "updated" });
  } catch (error) {
    return res.json({ status: "error", data: error });
  }
});

app.post("/deleteUser", async (req, res) => {
  const { userid } = req.body;
  console.log(userid);
  try {
    await User.deleteOne({ _id: userid });
    res.send({ status: "Ok", data: "Deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "Error", error: error.message });
  }
});

app.post("/upload-image", async (req, res) => {
  console.log("request recieved for image-upload");
  const { base64 } = req.body;
  console.log("Base64 data:", base64);

  try {
    Image.create({ image: base64 });
    res.send({ status: "ok" });
  } catch (error) {
    res.send({ status: "error", data: error });
  }
});
