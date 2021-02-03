const express= require('express');
const request = require('request');
const app=express();
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");
const flash = require("connect-flash");
var morgan = require("morgan");
const bcrypt = require("bcrypt");
const User = require("./Db/User");
let data1 ;
console.log(__dirname)
app.use(flash());
app.use( '/use' ,express.static(__dirname + '/public' ) );
app.use(bodyParser.urlencoded({extended:true}))
app.use(cookieParser())
app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: 'shhhh, very secret lubba wubba dubba etc'
}));
const connectDB = require('./Db/connection');
connectDB();
app.use(function(req, res, next) {
    if (req.session.isLoggedIn) {
       res.locals.currentUser  = req.session.user;
        data1=res.locals.currentUser
       // console.log(data1)
    } else {
        data1=null;
        res.locals.currentUser = null;
    }
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});
var sessionchecker = (req,res,next)=>{
    if(req.session.user&& req.cookies.user_sid)
    {
      res.redirect('/');   
    }
    else
    next()
}
//Routes
app.set("view engine","ejs")
app.get("/", (req, res)=>{
  //  res.render("pk2.ejs");
   // res.render("pk.ejs");
   // res.send("Hello World");
    res.render("homepage.ejs",{"data" :data1})
});
app.get("/signup", (req, res)=>{
    res.render("Signup");
});
app.get("/login", (req, res)=>{
    res.render("Login");
});
//Accept all routes except ones specified before
app.get("/result",(req,res)=>{
    console.log(req.query)
    //res.send("Data Recieved")
    const url=`http://www.omdbapi.com/?apikey=cfd672ef&s=${req.query.search}`
    const url2=`https://api.themoviedb.org/3/search/person?api_key=163a3a44da00520a9f12450581adec92&query=${req.query.search}`
    request(url,function(error,response,body){
        if(!error && response.statusCode==200)
        {
            const data= JSON.parse(body)
            console.log(data);
            if(data.Response==='False')
            {
                request(url2,function(error,response,body2){
                    if(!error && response.statusCode==200)
                    {
                             const data2=JSON.parse(body2)
                             console.log(data2);
                             res.send("Yes");
                    }
                    else
                    res.send("Something Went wrong")
                })
            }
            else
            res.render("result.ejs",{moviedata :data})
        }
        else{
            res.send("Something Went wrong")
        }
    })
})
app.get("/result/:id",(req,res)=>{
    console.log(req.query)
    //res.send("Data Recieved")
    const url=`http://www.omdbapi.com/?apikey=cfd672ef&i=${req.params.id}`
    request(url,function(error,response,body){
        if(!error && response.statusCode==200)
        {
            const data= JSON.parse(body)
            console.log(data)
            res.render("res2",{film :data})
        }
        else{
            res.send("Something Went wrong")
        }
    })
})
app.post("/signup", (req, res)=>{
    console.log(req.body);
    console.log("Signup Request");
    let hash = bcrypt.hashSync(req.body.password, 14);
    req.body.password = hash;
    let registered_user = new User(req.body);
    console.log(registered_user);
    registered_user.save(function(err, doc) {
        if (err) {
            req.flash("error", "Already Taken Email");
            console.log("Already Taken Username");
            res.redirect("/signup");
        } else {

            req.flash("success", "Signup was successfully, now you can login");
            console.log("Login Success");
            res.redirect("/login");
        }
    });
});
app.post("/login", function(req, res) {
    User.findOne({ email: req.body.Email}, (err, user) => {
        console.log(req.body);
        console.log(user);
        if (err || !user || !(bcrypt.compareSync(req.body.password, user.password))) {
            req.flash("error", "Incorrect Username/Password");
            req.session.isLoggedIn = false;
            res.redirect("/");
        } else {
            //console.log("Login is successfull");
            req.flash("success", "Login Successful");
            //Setting Up the session
            req.session.isLoggedIn = true;
            req.session.user = user;
            res.redirect("/");
        }
    });
});
app.get("/logout", function(req, res) {
    if (req.session) {
        req.session.destroy(function(err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});
app.get("/aboutus", (req, res)=>{
    res.render("abc.ejs")
 
 });
app.get("*", (req, res)=>{
    res.render("pk1.ejs");
 });
app.listen(5000, function(){
    console.log("Server Has Started");
});
module.exports= app;