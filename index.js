var express = require('express');
    methodOverride = require('method-override');
    expressSanitizer = require('express-sanitizer');
    app = express();
    bodyParser = require('body-parser');
    mongoose = require('mongoose');
    
mongoose.connect("mongodb://localhost/phoneBookApp", {useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true, useUnifiedTopology: true});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

var contactSchema = new mongoose.Schema({
    name: String,
    dob: String,
    phone: [Number],
    email: [String]
});

var Contact = mongoose.model("Contact", contactSchema);

// Contact.create({
//     name: "XYZ",
//     dob: "15-06-1995",
//     phone: 9784562134,
//     email: "abc@email.com"
// });

app.get("/", function(req, res){
    res.redirect("/user/1");
});

// app.get("/user", function(req, res){
//     Contact.find({}, function(err, contacts){
//         if (err){
//             console.log(err);
//         } else {
//             res.render("home", {user: contacts});
//         }
//     });
// });

app.get('/user/:page', function(req, res, next) {
    var perPage = 4;
    var page = req.params.page || 1;

    Contact
        .find({})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .sort({name: 1})
        .exec(function(err, contacts) {
            Contact.countDocuments().exec(function(err, count) {
                if (err) return next(err)
                res.render('home', {
                    user: contacts,
                    current: page,
                    pages: Math.ceil(count / perPage)
                });
            });
        });
});

app.get("/user/:page/new", function(req, res){
    var page = req.params.page || 1;
    res.render("new",{current: page});
});

app.post("/user/:page", function(req, res){
    var page = req.params.page || 1;
    Contact.create(req.body.user, function(err, newContact){
        if(err){
            res.render("new",{current: page});
        } else{
            res.redirect("/user/"+page);
        }
    });
});

//EDIT Route
app.get("/user/:id/edit", function(req,res){
    Contact.findById(req.params.id, function(err, foundContact){
        if(err){
            res.redirect("/");
        } else{
            res.render("edit", {user: foundContact});
        }
    });  
});

//UPDATE Route
app.put("/user/:id", function(req, res){
    Contact.findByIdAndUpdate(req.params.id, req.body.user, function(err, updatedHotel){
        if(err){
            res.redirect("/user/edit");
        } else{
            res.redirect("/");
        }
    }) 
});

//DELETE Route
app.delete("/user/:page/:id", function(req, res){
    var page = req.params.page || 1
    
    Contact.findByIdAndRemove(req.params.id, function(err, deleteContact){
        if(err){
            res.redirect("/user/"+page);
        } else{
            res.redirect("/user/"+page);
        }
    });
});

app.get("/user/search", function(req, res, next){
    var s=req.query.search;
    console.log(s);
    Contact
        .find({ $text: { $search: s } }, { score: { $meta: "textScore" } })
        .sort( { score: { $meta: "textScore" } } )
        .exec(function(err, showResults){
            if (err) return next(err)
            res.render('search',{result: showResults});
        });
});

app.listen(3000, function(){
    console.log("Sever has Started!!");
});