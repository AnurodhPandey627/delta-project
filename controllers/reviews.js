const Review = require("../models/review");
const Listing = require("../models/listing");

module.exports.createReview = async (req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    //console.log("new review saved");
    req.flash("success","New Review created");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyReview = async (req,res)=>{
    let {id,reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{ $pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    //console.log(id);
    req.flash("success","Review deleted");
    res.redirect(`/listings/${id}`);
}