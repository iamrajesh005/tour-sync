if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express= require("express");
const app= express();
const mongoose= require("mongoose");
const Listing= require("./models/schema");
const path= require("path");
const methodoverride= require("method-override");
const engine = require('ejs-mate');
const wrapAsync= require("./utills/asyncwrap.js");
const expressError= require("./utills/expresserror.js");
const {listingSchema, reviewSchema}= require("./schemaVal.js");
const Review= require("./models/review.js");
const listingsRouter= require("./router/listings.js");//import router
const reviewsRouter= require("./router/review.js");
const signupRouter= require("./router/signup.js");
const flash= require("connect-flash");



const session= require("express-session");
const MongoStore = require('connect-mongo');
const passport= require("passport");
const LocalStrategy= require("passport-local");
const User= require("./models/user.js");
const figlet = require("figlet");

figlet("Server Started", { font: "Babyface Lame" }, function (err, data) {
  if (!err) console.log(data);
});


const dbUrl= process.env.ATLASDB_URL; 

const store= MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600 //for lazy update
})

store.on("error", (err)=>{
    console.log("ERROR IN MONGODB", err);
})
//then go to package.json


const sessionOptions= {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now()+ 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly:true
    }
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());//below the sessionOptions
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.engine('ejs', engine);
app.use(methodoverride("_method"));


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public/css")));
app.use(express.static(path.join(__dirname, "public/js")));

// const MONGO_LINK='mongodb://127.0.0.1:27017/wonderlist';

 //move db from local to online storage mongo-atlas
main()
.then(()=>{
    console.log("connected to mongodb");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

app.use((req, res, next)=>{
    res.locals.success= req.flash("success");
    res.locals.error= req.flash("error");
    res.locals.isLog= req.user;
    next();
})

app.use("/listings", listingsRouter);//to use router
app.use("/listings/:id/reviews", reviewsRouter);// should placed here to use all the above
app.use("/", signupRouter);


// app.get("/register", async (req, res)=>{
//     let fakeUser= new User({
//         email: "rajesh@gmail.com",
//         username: "rajesh123"
//     });
//     let newUser= await User.register(fakeUser, "helloworld");
//     res.send(newUser);
// })


// app.get("/samList", (req, res)=>{
//     let samList= new Listing({
//         title: "sample Listing new",
//         description: "this is a sample listing new hii",
//         price: 5000,
//         location: "surya nagar, lucknow, mp",
//         country: "India"
//     })

//     samList.save();
//     console.log("sample listing saved");
//     res.send("successful");
// })

app.listen(8080, ()=>{
    console.log("server is running on port 8080");
})




app.all(/(.*)/, (req, res, next) => {
    next(new expressError("page not found", 404));
});

 app.use((err, req, res, next)=>{
    let{ statuscode=500, message}= err;
    res.status(statuscode).render("error.ejs", {err});
 })