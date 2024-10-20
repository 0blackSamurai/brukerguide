// const express = require("express");
// const app = express();
// require("dotenv").config();
// const mongoose = require("mongoose");
// const bcrypt= require("bcrypt")

// const Schema = mongoose.Schema;

// app.set("view engine", "ejs");
// app.use(express.static("public"));
// app.use(express.urlencoded({ extended: true }));

// mongoose
// .connect("mongodb://127.0.0.1:27017/test")
// .then(() => console.log("connected"))
// .catch((error) => console.log("error", error));

// const saltRounds =10;
 
// app.set("view engine", "ejs");
// app.use(express.static("public"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// const userSchema = new Schema({
//   email: String,
//   password: String,
// });

// const User = mongoose.model("User", userSchema);

// app.get("/", (req, res) => {
//   res.render("index");
// });
// app.get("/guide", (req, res) => {
//   res.render("guide");
// });
// app.get("/create", (req, res) => {
//   res.render("createUser");
// });
// app.get("/login", (req, res) => {
//   res.render("login");
// });
// app.get("/dashboard", (req, res) => {
//     res.render("dashborad");
//   });
// app.post("/login", async (req, res) => {
//   const { brukernavn, password } = req.body;
//   console.log(req.body);
// });
// app.post("/create", async(req, res) => {

//     console.log(req.body)

//     const {brukernavn, password, confirmpassword} = req.body;
//     if(password ==confirmpassword){
//         bcrypt.hash(password,saltRounds, async function(error, hash){
//             const newUser = new User({ email: brukernavn, password: hash });
            
//             const result = await newUser.save();
//             console.log(result);
            
//             if(result._id) {
//                 res.redirect("/dashboard")
//             }
//         }) 
        
        
//     } else {
//         res.status(500),json({message:"password stemmer ikke overens"})
//     }
// })
// app.get("/search", (req, res) => {
//   const query = req.query.query;
//   console.log("Search query:", query);
//   res.render("guide");
//   // res.send(`You searched for: ${query}`);
// });

// app.listen(process.env.PORT);const express = require("express");
const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const { stringify } = require("querystring");
const cookieParser = require("cookie-parser");

app.use(cookieParser(process.env.COOKIE_SECRET || "your-secret-key"));

const Schema = mongoose.Schema;

const diskstorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./uploads")
    },
    filename: function(req, file, cb) {
        const ext = path.extname(file.originalname)
        console.log("EXT", ext)
        const filename = file.originalname
        cb(null, filename)
    }
});

const uploads = multer({
    storage: diskstorage, 
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/test")
  .then(() => console.log("connected"))
  .catch((error) => console.log("error", error));

const saltRounds = 10;

const brukerSchema = new Schema({
    tittel: String,
    tag: String,
    overskrift: Array,
    beskrivelse: String,
    bilde: Array,
});

const brukerguide = mongoose.model("brukerguide", brukerSchema);

const userSchema = new Schema({
    email: String,
    password: String,
});

const User = mongoose.model("User", userSchema);

const guideSchema = new mongoose.Schema({
    tittel: String,
    tag: String,
    overskrift: [String],
    beskrivelse: [String],
    bilde: [String],
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },  
});

const Guide = mongoose.model("Guide", guideSchema);

function isAuthenticated(req, res, next) {
    if (req.cookies.user) {
        return next();
    }
    res.redirect("/login");
}

app.get("/", async (req, res) => {
    const guides = await Guide.find();
    let isloggedin = !!req.cookies.user;
    res.render("index", { guides, isloggedin });
});

app.get("/searchResults", async (req, res) => {
    const guides = await Guide.find();
    const searchTerm = req.query.query;
    let isloggedin = !!req.cookies.user;
    res.render("searchResults", { guides, isloggedin });
});

app.get("/guide/:id", async (req, res) => { 
    const { id } = req.params;
    const guide = await Guide.findById(id).populate('creator', 'email');
    let isloggedin = !!req.cookies.user;
    let user = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    res.render("guide", { guide, isloggedin, user });
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/uploads");
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = Date.now() + ext;
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

app.get("/create", (req, res) => {
    let isloggedin = !!req.cookies.user;
    res.render("createUser", {isloggedin});
});

app.get("/login", (req, res) => {
    let isloggedin = !!req.cookies.user;
    res.render("login", {isloggedin});
});

app.get("/dashborad", isAuthenticated, async (req, res) => {
    const userData = JSON.parse(req.cookies.user);
    const userId = userData._id;
    const guides = await Guide.find({ creator: userId });
    res.render("dashborad", { guides, user: userData });
});

app.get("/ny_guide", (req, res) => {
    res.render("ny_guide"); 
});

app.post("/guide/:id/edit", upload.array("bilde"), async (req, res) => {
    const { id } = req.params;
    const { tittel, tag, overskrift, beskrivelse, oldBilde } = req.body;

    try {
        const guide = await Guide.findById(id);
        if (!guide) {
            return res.status(404).send("Guide not found");
        }

        let bilde = oldBilde;

        if (req.files && req.files.length > 0) {
            req.files.forEach((file, index) => {
                if (file && file.filename) {
                    bilde[index] = file.filename;
                }
            });
        }

        await Guide.findByIdAndUpdate(id, { 
            tittel, 
            tag, 
            overskrift, 
            beskrivelse, 
            bilde,
        });

        res.redirect(`/guide/${id}`);
    } catch (error) {
        console.error("Error updating guide:", error);
        res.status(500).send("Error updating guide.");
    }
});

app.post("/ny_guide", upload.array("bilde"), async (req, res) => {
    const { tittel, tag, overskrift, beskrivelse } = req.body;

    if (!req.cookies.user) {
        return res.status(403).send("You must be logged in to create a guide.");
    }

    const userData = JSON.parse(req.cookies.user);
    const overskrifter = Array.isArray(overskrift) ? overskrift : [overskrift];
    const beskrivelser = Array.isArray(beskrivelse) ? beskrivelse : [beskrivelse];
    const bilde = req.files.map(file => file.filename);

    const newGuide = new Guide({
        tittel,
        tag,
        overskrift: overskrifter,
        beskrivelse: beskrivelser,
        bilde,
        creator: userData._id  
    });

    try {
        await newGuide.save();
        res.redirect(`/guide/${newGuide._id}`);
    } catch (error) {
        console.error("Error saving guide:", error);
        res.status(500).json({ message: "Error saving guide", error });
    }
});

app.post("/guide/:id/delete", async (req, res) => {
    const { id } = req.params;

    try {
        await Guide.findByIdAndDelete(id);
        res.redirect("/");
    } catch (error) {
        console.error("Error deleting guide:", error);
        res.status(500).send("Error deleting guide.");
    }
});

app.get("/logout", (req, res) => {
    res.clearCookie('user');
    res.redirect("/login");
});

app.post("/create", async (req, res) => {
    const { brukernavn, password, confirmpassword } = req.body;
    
    if (password === confirmpassword) {
        bcrypt.hash(password, saltRounds, async function (error, hash) {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: "Error hashing password" });
            }
            
            const newUser = new User({ email: brukernavn, password: hash });

            try {
                const result = await newUser.save();
                console.log(result);
                
                if (result._id) {
                    res.cookie('user', JSON.stringify({ _id: result._id, email: result.email }), {
                        maxAge: 24 * 60 * 60 * 1000, // 1 day
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production'
                    });
                    res.redirect("/dashborad");
                }
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: "Error creating user" });
            }
        });
    } else {
        res.status(400).json({ message: "Passwords do not match" });
    }
});

app.post("/login", async (req, res) => {
    const { brukernavn, password } = req.body;

    User.findOne({ email: brukernavn }).then((user) => {
        if (!user) {
            return res.status(400).redirect("/login");
        }

        bcrypt.compare(password, user.password).then((isMatch) => {
            if (isMatch) {
                res.cookie('user', JSON.stringify({ _id: user._id, email: user.email }), {
                    maxAge: 24 * 60 * 60 * 1000, // 1 day
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production'
                });
                
                return res.status(200).redirect("/dashborad");
            } else {
                return res.status(400).redirect("/login");
            }
        }).catch((error) => {
            console.log("Error comparing passwords:", error);
            return res.status(500).redirect("/login");
        });
    }).catch((error) => {
        console.log("Error finding user:", error);
        return res.status(500).redirect("/login");
    });
});

app.get("/search", async (req, res) => {
    const searchTerm = req.query.query;
    console.log("Search query:", searchTerm);
    let isloggedin = !!req.cookies.user;

    try {
        const matchingGuides = await Guide.find({ 
              $or: [
                { tittel: { $regex: new RegExp(searchTerm, "i") } },
                { beskrivelse: { $regex: new RegExp(searchTerm, "i") } }
            ]
        });

        if (matchingGuides.length > 0) {
            const guides = matchingGuides;
            res.render("index", { guides, isloggedin });
        } else {
            res.status(404).send("No matching guides found.");
        }
    } catch (error) {
        console.error("Error during search:", error);
        res.status(500).send("An error occurred during the search.");
    }
});

app.listen(process.env.PORT || 4000, () => {
    console.log("Server started on port 4000");
});