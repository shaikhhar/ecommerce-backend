const router = require("express").Router();
const Product = require("../models/product");
const checkJWT = require("../middlewares/check-jwt");

const upload = require("./image-uploader");

router
  .route("/products")
  .get(checkJWT, (req, res, next) => {
    Product.find({ owner: req.decoded.user._id })
      .populate("owner brand category")
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
    console.log("product ", req.body);
    product.owner = req.decoded.user._id;
    product.category = req.body.categoryId;
    product.brand = req.body.brandId;
    product.title = req.body.title;
    product.price = req.body.price;
    product.description = req.body.description || "";
    if (req.file)
      // if localhost http://localhost:${process.env.PORT}

      product.image =
        `https://ecommerce-shekhar.herokuapp.com/uploads/` + req.file.filename;
    product.save().then((prod) => {
      res.json({
        success: true,
        message: "Succesfully added the product",
        product: prod,
      });
    });
  });

module.exports = router;
