const Listing= require("./models/schema.js");
const Review= require("./models/review.js");
const {listingSchema}= require("./schemaVal.js");

module.exports.isLoggedIn= (req, res, next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl= req.orginalUrl;
        req.flash("error", "you must be logged in first");
        return res.redirect("/login");
    } 
    next();
}

module.exports.saveRedirectUrl= (req, res, next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl= req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner= async(req, res, next)=>{
    let {id}= req.params;
    let listing= await Listing.findById(id);
    if(!req.user._id.equals(listing.owner._id)){
        req.flash("error", "you are not owner");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.isAuthor= async(req, res, next)=>{
    let {reviewId, id}= req.params;
    let review= await Review.findById(reviewId);
    if(!req.user._id.equals(review.author._id)){
        req.flash("error", "you are not author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing= (req, res, next)=>{
    const {error}= listingSchema.validate(req.body.Listing);
    if(error){
        let msg= error.details.map(el=> el.message).join(",");
        throw new expressError(msg, 400);
    }else{
        next();
    }
}