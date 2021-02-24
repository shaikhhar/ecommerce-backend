const router = require("express").Router();
const Product = require("../models/product");
const path = require("path");
const multer = require("multer");

const checkJWT = require("../middlewares/check-jwt");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
});

router
  .route("/products")
  .get(checkJWT, (req, res, next) => {
    Product.find({ owner: req.decoded.user._id })
      .populate("owner category")
      .exec()
      .then((products) => {
        res.json({
          success: true,
          message: "Products",
          products: products,
        });
      });
  })
  .post(checkJWT, upload.single("product_picture"), (req, res, next) => {
    let product = new Product();
    product.owner = req.decoded.user._id;
    product.category = req.body.categoryId;
    product.title = req.body.title;
    product.price = req.body.price;
    product.description = req.body.description;
    product.image = "http://localhost:3030/" + req.file.path;
    product.save().then(() => {
      res.json({ success: true, message: "Succesfully added the product" });
    });
  });

module.exports = router;
