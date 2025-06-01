if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listingsRouter = require("./routes/listings.js");
const reviewsRouter = require("./routes/reviews.js");
const usersRouter = require("./routes/users.js");
const session = require('express-session');
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user.js");

app.engine('ejs', ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"public")));

//const MongoUrl = 'mongodb://127.0.0.1:27017/wanderlust';
const dbUrl = process.env.ATLASDB_URL;
async function main() {
  await mongoose.connect(dbUrl);
}

main().then(()=>{
    console.log("Connected to MongoDB");
})
.catch((err)=>{
    console.log(err);
});

app.listen(8080,()=>{
    console.log("App is listening to port 8080");
});

const store = MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*60*60
});

store.on("error",()=>{
    console.log("Error in Mongo Session Store: "+error);
});

const sessionOptions = {
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge:  7 * 24 * 60 * 60 * 1000,
        httpOnly:true
    },
};

// app.get("/",(req,res)=>{
//     res.send("You are at root server");
// });


app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.successMsg = req.flash('success');
    res.locals.errorMsg = req.flash('error');
    res.locals.currUser = req.user;
    next();
});

//Demo User
app.get("/demouser",async (req,res)=>{
    const fakeUser = new User({
        email:"pandeyanurodh@gmail.com",
        username:"pandeyanurodh"
    });
    let registeredUser = await User.register(fakeUser,"helloWorld");
    res.send(registeredUser);
})

//Router for listings
app.use("/listings",listingsRouter);
//Router for reviews
app.use("/listings/:id/reviews",reviewsRouter);
//Router for users
app.use("/",usersRouter);

//Page Not Found
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
});

//Middleware
app.use((err,req,res,next)=>{
    let {status=500,message="Something went wrong."} = err;
    console.log(err);
    res.status(status).render("listings/error.ejs",{message});
    //res.status(status).send(message);
});
