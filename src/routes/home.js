const router = require("express").Router();
const jwt = require("jsonwebtoken");
const Category = require("../models/category");
const Product = require("../models/product");
const Brand = require("../models/brand");
const Banner = require("../models/banner");
const Slider = require("../models/slider");

const upload = require("./image-uploader");

router.post("/banner", upload.single("image"), async (req, res) => {
  const position = req.query.position; //
  console.log("position ", position);
  try {
    const existingBanner = await Banner.findOne({
      position: position,
    }).exec();
    console.log("existingBanner ", existingBanner);
    if (existingBanner) {
      if (req.file)
        existingBanner.image =
          `https://localhost:${process.env.PORT}/uploads/` + req.file.filename;
      Object.keys(req.body).forEach((update) => {
        existingBanner[update] = req.body[update];
      });
      await existingBanner.save();
      const updatedBannerArray = await Banner.find().populate("referenceId");
      const updatedSliderArray = await Slider.find().populate("referenceId");
      res.json({
        success: true,
        message: "banner updated",
        updatedBannerArray,
        updatedSliderArray,
      });
    } else {
      const banner = new Banner(req.body);
      banner.position = position;
      if (req.file)
        banner.image =
          `https://ecommerce-shekhar.herokuapp.com/home/` + req.file.filename;
      const bannerRes = await banner.save();
      const bannerArray = await Banner.find().populate("referenceId");
      const sliderArray = await Slider.find().populate("referenceId");
      res.json({
        success: true,
        message: "banner posted",
        bannerArray,
        sliderArray,
      });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

router.post("/slider", upload.single("image"), async (req, res) => {
  const position = req.query.position;
  try {
    const existingSlider = await Slider.findOne({
      position: position,
    }).exec();
    if (existingSlider) {
      // update
      if (req.file)
        existingSlider.image =
          `https://ecommerce-shekhar.herokuapp.com/uploads/` +
          req.file.filename;
      Object.keys(req.body).forEach((update) => {
        existingSlider[update] = req.body[update];
      });
      await existingSlider.save();
      const updatedBannerArray = await Banner.find().populate("referenceId");
      const updatedSliderArray = await Slider.find().populate("referenceId");
      res.json({
        success: true,
        message: "slider updated",
        updatedBannerArray,
        updatedSliderArray,
      });
    } else {
      // new
      const slider = new Slider(req.body);
      slider.position = position;
      if (req.file)
        slider.image =
          `https://ecommerce-shekhar.herokuapp.com/uploads/` +
          req.file.filename;
      await slider.save();
      const bannerArray = await Banner.find().populate("referenceId");
      const sliderArray = await Slider.find().populate("referenceId");
      res.json({
        success: true,
        message: "banner posted",
        bannerArray,
        sliderArray,
      });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

router.get("/", async (req, res) => {
  const banners = await Banner.find().populate("referenceId");
  const sliders = await Slider.find().populate("referenceId");
  res.json({
    success: true,
    message: "Home",
    banners,
    sliders,
  });
});

module.exports = router;
