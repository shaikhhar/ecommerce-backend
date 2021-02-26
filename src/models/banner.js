const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BannerSchema = new Schema({
  position: { type: Number, Unique: true },
  image: String,
  referenceId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: "onRefType",
  }, //product or brand or category
  onRefType: {
    type: String,
    enum: ["Product", "Category", "Brand"],
  },
});

module.exports = mongoose.model("Banner", BannerSchema);
