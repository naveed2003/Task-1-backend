const mongoose = require("mongoose");

const ImageDetailsSchema = new mongoose.Schema(
  {
    image: String,
  },
  {
    collection: "imagedetails",
  }
);

mongoose.model("imagedetails", ImageDetailsSchema);
