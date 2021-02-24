const router = require("express").Router();
const jwt = require("jsonwebtoken");
const Category = require("../models/category");
const Product = require("../models/product");
const Review = require("../models/review");

const checkJWT = require("../middlewares/check-jwt");

router
  .route("/categories")
  .get((req, res, next) => {
    Category.find({})
      .exec()
      .then((Allcategories) => {
        res.status(200).json({ success: true, categories: Allcategories });
      })
      .catch((err) => {
        res.json({ success: false, message: err.message });
      });
  })
  .post((req, res, next) => {
    let category = new Category({
      name: req.body.name,
    });
    category
      .save()
      .then((result) => {
        res.status(201).json({ success: true, message: "Category added" });
      })
      .catch((err) => {
        res.json({ success: false, message: err });
      });
  });

router.get("/categories/:id", (req, res, next) => {
  const perPage = 10;
  const page = req.query.page;

  Product.countDocuments({ category: req.params.id })
    .then((count) => {
      var totalProducts = count;
      Product.find({ category: req.params.id })
        .skip(perPage * page)
        .limit(perPage)
        .populate("category owner review")
        .exec()
        .then((products) => {
          Category.findOne({ _id: req.params.id })
            .exec()
            .then((category) => {
              res.json({
                success: true,
                message: "category",
                products: products,
                categoryName: category.name,
                totalProducts: totalProducts,
                pages: Math.ceil(totalProducts / perPage),
              });
            });
        });
    })
    .catch((err) => {
      res.json({ success: false, message: err });
    });
});
router.get("/products", (req, res, next) => {
  const perPage = 20;
  const page = req.query.page;

  Product.countDocuments()
    .then((count) => {
      var totalProducts = count;
      Product.find({})
        .skip(perPage * page)
        .limit(perPage)
        .populate("category owner")
        .exec()
        .then((products) => {
          res.json({
            success: true,
            message: "category",
            products: products,
            totalProducts: totalProducts,
            pages: Math.ceil(totalProducts / perPage),
          });
        });
    })
    .catch((err) => {
      res.json({ success: false, message: err });
    });
});

router.get("/product/:id", (req, res, next) => {
  Product.findById({ _id: req.params.id })
    .populate("category owner")
    .populate({ path: "reviews", populate: { path: "owner" } })
    .exec()
    .then((product) => {
      res.json({
        success: true,
        product: product,
      });
    })
    .catch((error) => {
      res.json({
        success: false,
        message: "Product not found",
      });
    });
});

router.post("/review", checkJWT, (req, res, next) => {
  Product.findOne({ _id: req.body.productId })
    .exec()
    .then((product) => {
      if (product) {
        let review = new Review();
        review.owner = req.decoded.user._id;

        if (req.body.title) review.title = req.body.title;
        if (req.body.description) review.description = req.body.description;
        review.rating = req.body.rating;
        product.reviews.push(review._id);
        product.save();
        review.save();
        res.json({
          success: true,
          message: "Review added successfully",
        });
      }
    })
    .catch((err) => {
      res.json({
        success: false,
        message: err.message,
      });
    });
});

module.exports = router;
