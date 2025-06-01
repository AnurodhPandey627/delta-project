const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing");
const Review = require("../models/review.js");
const {listingSchema,reviewSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");

module.exports.isLoggedIn = (req,res,next)=>{
    //console.log(req.path);
    //console.log(req.originalUrl);
    //console.log(req.user);//Info about the user
    if(!req.isAuthenticated()){//passport method
        //save redirectUrl
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must be logged in!");
        return res.redirect("/login");
    }
    next();
}

//for automatic redirect after login
module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = wrapAsync(async(req,res,next)=>{
    const {id} = req.params;
    const listingToUpdate = await Listing.findById(id);
    if(!listingToUpdate.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not the owner of this listing!");
        return res.redirect(`/listings/${id}`);
    }
    next();
});

//Listing Validation
module.exports.validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        console.log("Validation error: "+error);
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}

//Review Validation
module.exports.validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        console.log("Validation Error:"+error);
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
}

module.exports.isReviewAuthor = wrapAsync(async(req,res,next)=>{
    const {id,reviewId} = req.params;
    const reviewToDelete = await Review.findById(reviewId);
    //console.log(reviewToDelete);
    if(!reviewToDelete.author._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not the author of this review!");
        return res.redirect(`/listings/${id}`);
    }
    next();
});