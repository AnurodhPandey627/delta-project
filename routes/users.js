const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const User = require("../models/user.js");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware/middleware.js");
const UserController = require("../controllers/users.js");

router.route("/signup")
.get(UserController.renderSignupForm)
.post(wrapAsync(UserController.signUpUser));

router.route("/login")
.get(UserController.renderLoginForm)
.post(saveRedirectUrl,passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),wrapAsync(UserController.loginUser));

router.get("/logout",(UserController.logOutUser));
module.exports = router;