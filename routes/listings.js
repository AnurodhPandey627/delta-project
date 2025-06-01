const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const passport = require("passport");
const {isLoggedIn,isOwner,validateListing} = require("../middleware/middleware.js");
const ListingController = require("../controllers/listings.js");

router.route("/")
.get(wrapAsync (ListingController.index))//INDEX ROUTE
.post(isLoggedIn,upload.single('listing[image]'),validateListing,wrapAsync(ListingController.createListing));//CREATE ROUTE

//NEW ROUTE
router.get("/new", isLoggedIn,ListingController.renderNewForm);

router.route("/:id")
.get(wrapAsync(ListingController.showListing))//SHOW ROUTE
.put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing, wrapAsync(ListingController.updateListing))//UPDATE ROUTE
.delete(isLoggedIn,isOwner,wrapAsync(ListingController.destroyListing));//DESTROY ROUTE

//EDIT ROUTE
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(ListingController.renderEditForm));

module.exports = router;