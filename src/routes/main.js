const router = require("express").Router();
const jwt = require("jsonwebtoken");
const Category = require("../models/category");
const Product = require("../models/product");
const Review = require("../models/review");
const Brand = require("../models/brand");

const checkJWT = require("../middlewares/check-jwt");

router
  .route("/categories")
  .get(async (req, res, next) => {
    try {
      const allCategories = await Category.find({});
      res.status(200).json({ success: true, categories: allCategories });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  })
  .post(async (req, res, next) => {
    try {
      let category = await new Category(req.body).save();
      res
        .status(201)
        .json({ success: true, message: "Category added", category });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

router
  .route("/brands")
  .get(async (req, res) => {
    try {
      const brands = await Brand.find({});
      res.status(200).json({ success: true, brands });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  })
  .post(async (req, res) => {
    try {
      let brand = await new Brand(req.body).save();
      res.status(201).json({ success: true, message: "Brand added", brand });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  });

router.get("/categories/:id", (req, res, next) => {
  const perPage = +req.query["per-page"] || 10;
  const page = +req.query.page;

  Product.countDocuments({ category: req.params.id })
    .then((count) => {
      var totalProducts = count;
      Product.find({ category: req.params.id })
        .skip(perPage * (page - 1))
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
  const perPage = +req.query["per-page"] || 10;
  const page = req.query.page;

  Product.countDocuments()
    .then((count) => {
      var totalProducts = count;
      Product.find({})
        .skip(perPage * (page - 1))
        .limit(perPage)
        .populate("category owner brand")
        .exec()
        .then((products) => {
          res.json({
            success: true,
            message: "Products",
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

router.get("/products/:id", (req, res, next) => {
  Product.findById({ _id: req.params.id })
    .populate("category owner brand")
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
        if (req.body.rating) review.rating = req.body.rating;
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
