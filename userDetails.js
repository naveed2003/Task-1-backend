const mongoose = require("mongoose");

const UserDetailsSchema = new mongoose.Schema(
  {
    fname: String,
    lname: String,
    Email: { type: String, unique: true },
    password: String,
    userType: String,
  },
  {
    collection: "userinfo",
  }
);

mongoose.model("userinfo", UserDetailsSchema);
