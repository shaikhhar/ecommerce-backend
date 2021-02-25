const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const checkJWT = require("../middlewares/check-jwt");

router.post("/signup", (req, res, next) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then((result) => {
      if (result) {
        res.status(409).json({
          success: false,
          message: "user with the email already exist",
        });
      } else {
        bcrypt.hash(req.body.password, 8, (err, hash) => {
          if (err) {
            return res
              .status(409)
              .json({ success: false, message: "Signup failed" });
          } else {
            const user = new User({
              name: req.body.name,
              email: req.body.email,
              password: hash,
              isSeller: req.body.isSeller,
            });
            user
              .save()
              .then(() => {
                user["token"] = jwt.sign(
                  { user: user },
                  process.env.JWT_SECRET,
                  {
                    expiresIn: "2h",
                  }
                );
                res.status(201).json({
                  success: true,
                  message: user.name + " is created",
                  token: user.token,
                });
              })
              .catch((err) => {
                res
                  .status(500)
                  .json({ success: false, message: "Signup failed" });
              });
          }
        });
      }
    })
    .catch((err) => {
      res.json({ message: err });
    });
});
router.post("/login", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res
          .status(404)
          .json({ success: false, message: "Auth failed e" });
      }
      var isValid = bcrypt.compareSync(req.body.password, user[0].password);
      if (isValid) {
        const token = jwt.sign({ user: user[0] }, process.env.JWT_SECRET, {
          expiresIn: "15d",
        });
        return res
          .status(200)
          .json({ success: true, message: "Auth successful", token: token });
      } else {
        res.status(404).json({ success: false, message: "Auth failed p" });
      }
    })
    .catch((err) => {
      res.status(500).json({ success: false, message: err });
    });
});

// router.get('/profile');
// router.post('/profile');

router
  .route("/profile")
  .get(checkJWT, (req, res, next) => {
    User.findOne({ _id: req.decoded.user._id })
      .exec()
      .then((result) => {
        res
          .status(200)
          .json({ success: true, user: result, message: "successful" });
      })
      .catch((err) => {
        res.status(500).json({ success: false, message: err });
      });
  })
  .patch(checkJWT, async (req, res, next) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "password"];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidOperation) {
      res.status(400).json({ success: false, message: "invalid field" });
    }
    try {
      const user = await User.findById(req.decoded.user._id);
      if (!user) {
        res.status(404).json({ success: false, message: "invalid user" });
      }
      updates.forEach((update) => {
        console.log("update ", update);
        if (update === "password") {
          console.log("updating pw...");
          pwHashed = hashPassword(req.body.password);
          console.log("pwH", pwHashed);
          user.password = pwHashed;
          console.log("user after pw updated", user);
        } else {
          user[update] = req.body[update];
        }
        console.log(update, req.body[update]);
      });
      console.log("updatedUser ", user);

      const updatedUser = await user.save();

      res.json({
        success: true,
        message: "profile updated",
        user: updatedUser,
      });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });

// address api
router
  .route("/address")
  .get(checkJWT, (req, res, next) => {
    User.findOne({ _id: req.decoded.user._id })
      .exec()
      .then((result) => {
        res.status(200).json({
          success: true,
          address: result.address,
          message: "successful",
        });
      })
      .catch((err) => {
        res.status(500).json({ success: false, message: err });
      });
  })
  .post(checkJWT, (req, res, next) => {
    User.findOne({ _id: req.decoded.user._id })
      .exec()
      .then((user) => {
        if (req.body.addr1) user.address.addr1 = req.body.addr1;
        if (req.body.addr2) user.address.addr2 = req.body.addr2;
        if (req.body.city) user.address.city = req.body.city;
        if (req.body.state) user.address.state = req.body.state;
        if (req.body.country) user.address.country = req.body.country;
        if (req.body.postalCode) user.address.postalCode = req.body.postalCode;

        user.save();
        res.json({ success: true, message: "address updated" });
      })
      .catch((err) => {
        res.json({ success: false, message: err });
      });
  });

function hashPassword(password) {
  return bcrypt.hashSync(password, 8);
}

module.exports = router;
