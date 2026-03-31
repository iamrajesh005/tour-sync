const express= require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync= require("../utills/asyncwrap.js");
const passport= require("passport"); 

const {saveRedirectUrl}= require("../middleware.js");

const User= require("../models/user.js");

module.exports.signUpPage= (req, res)=>{
    res.render("../views/signup.ejs", {currUser: req.user});
}

module.exports.newUser= async (req, res)=>{
    try{
      let {yourname, dob, phone, email, username, password}= req.body;
    let newUser= new User({
      yourname, dob, phone, email, username
    });
    let registeredUser= await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err)=>{
        if(err){
            return next(err);
        } else{
            console
            return res.redirect("/listings");
        }
    })
    req.flash("success", "Welcome to WonderLust");
    
    }
    catch(e){
     let errMsg= e.message;
     req.flash("error", errMsg);
     return res.redirect("/signup");
    }
    
}

module.exports.renderLogin= (req, res)=>{
    res.render("../views/login.ejs", {currUser: req.user});
}

module.exports.login= async (req, res)=>{
    req.flash("success", "welcome again to wonderlust!");
    let redirectUrl= res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}


module.exports.logout= (req, res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        } else{
            req.flash("success", "you logged out successfully");
            res.redirect("/listings");
        }
    })
}