const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    brand: { type: Schema.Types.ObjectId, ref: "Brand" },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    image: String,
    title: String,
    description: String,
    price: Number,
    created: { type: Date, default: Date.now() },
  },
  {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);

ProductSchema.virtual("averageRating").get(function () {
  var rating = 0;
  if (this.reviews.length == 0) {
    rating = 0;
  } else {
    this.reviews.map((review) => {
      rating += review.rating;
    });
    rating = rating / this.reviews.length;
  }
  return rating;
});

module.exports = mongoose.model("Product", ProductSchema);
