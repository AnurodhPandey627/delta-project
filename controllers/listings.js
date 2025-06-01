const Listing = require("../models/listing");

module.exports.index = async (req,res)=>{
    const allListings = await Listing.find({});
    //console.log(allListings);
    res.render("listings/index.ejs",{allListings});
}

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path:"reviews",
        populate:{path: "author"}})
    .populate("owner");
    
    if(!listing){
        req.flash("error","Listing does not exist");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing}); 
}

module.exports.createListing = async (req,res)=>{
        //console.log(req.file);
        let url = req.file.path;
        let filename = req.file.filename;
        const listing = req.body.listing;
        //console.log(listing);
        const actualListing = {
            title:listing.title,
            description:listing.description,
            image:{
                filename:filename,
                url:url
            },
            price:listing.price,
            country:listing.country,
            location:listing.location 
        };
        //console.log(actualListing);
        const newListing = new Listing(actualListing);
        newListing.owner = req.user._id;//_id of the current user as owner
        await newListing.save();
        req.flash("success","New Listing created");
        res.redirect("/listings");
}

module.exports.renderEditForm = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    let originalImageUrl = listing.image.url;
    //console.log(originalImageUrl);
    let imageUrl = originalImageUrl.replace("/upload","/upload/h_250,w_250");
    //console.log(imageUrl);
    res.render("listings/edit.ejs",{listing,imageUrl});
}

module.exports.updateListing = async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});//... are used to spread the object and extract all key value pairs
    if(req.file){
        //console.log(req.file);
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {
            filename,
            url
        }
        await listing.save();
    }
    
    req.flash("success","Listing updated");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing deleted");
    res.redirect("/listings");
}