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
const multer = require("multer")
const path = require("path");
const { stringify } = require("querystring");
const session = require("express-session");



app.use(
    session({
      secret: process.env.SESSION_SECRET || "passord1", // Replace with a strong secret key
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 1000 * 60 * 60 * 24, // Session expires after 1 day
      },
    })
  );



const Schema = mongoose.Schema;

const diskstorage = multer.diskStorage({destination: function(req, file, cb) {
    cb(null, "./uploads")
},
    filename: function(req, file, cb) {
        const ext = path.extname(file.originalname)
        console.log("EXT", ext)
        // if(ext != ".png" || ext != ".JPG"){
        //     return cb(new Error("only PNG files allowed, love you martin"))

        // }
        const filename = file.originalname
        cb(null, filename)
    }
    //  filename: function(req, file, cb{
//     const ext = path.extname(file.originalname);
})
const uploads =multer({
    storage: diskstorage, 
})

const logget = false;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect("mongodb://127.0.0.1:27017/test")
  .then(() => console.log("connected"))
  .catch((error) => console.log("error", error));

const saltRounds = 10;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const brukerSchema = new Schema({
    tittel: String,
    tag: String,
    overskrift: Array,
    beskrivelse: String,
    bilde: Array,
});
const brukerguide = mongoose.model("brukerguide", brukerSchema)

// const newbrukerguide  = new brukerguide({ tittel: req.body.tittel,tag: req.body.tag,

// })

const userSchema = new Schema({
    email: String,
    password: String,
    loggedIn: { type: Boolean, default: false }, // Track login status
  });

const User = mongoose.model("User", userSchema);

app.get("/", async (req, res) => {
    const guides = await Guide.find();
   let isloggedin = false
   if(req.session.user){
    isloggedin=true;
  }

    
    res.render("index" , { guides, isloggedin });
    
});
app.get("/searchResults", async (req, res) => {
    const guides = await Guide.find();
    const searchTerm = req.query.query;
   let isloggedin = false
   if(req.session.user){
    isloggedin=true;
  }

    
    res.render("searchResults" , { guides, isloggedin });
    
});
const guideSchema = new mongoose.Schema({
    tittel: String,
    tag: String,
    overskrift: [String],
    beskrivelse: [String],
    bilde: [String], // Keep this as an array of strings
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },  
});


// app.get("/guide", (req, res) => {
//     res.render("guide");
// });
app.get("/guide/:id", async (req, res) => { 
    const { id } = req.params;
    
    // Populate the creator field with user details
    const guide = await Guide.findById(id).populate('creator', 'email');
    const guideSchema = new mongoose.Schema({
        tittel: String,
        tag: String,
        overskrift: [String],
        beskrivelse: [String],
        bilde: [String],
        creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },  // Reference to User model
    });

    let isloggedin = false;
    let user = null;

    if (req.session.user) {
        isloggedin = true;
        user = req.session.user;  // Pass user details
    }

    res.render("guide", { guide, isloggedin, user });
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/uploads"); // Opprett "uploads" mappen hvis den ikke eksisterer
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = Date.now() + ext; // Bruk tidstempel for å unngå duplikater
        cb(null, filename);
    }
});
const upload = multer({ storage: storage });


app.get("/create", (req, res) => {
    let isloggedin=false;

  if(req.session.user){
    isloggedin=true;
  }
    res.render("createUser", {isloggedin});
});
let isloggedin = false
app.get("/login", (req, res) => {
    let isloggedin = false
   if(req.session.user){
    isloggedin=true;
  }
    res.render("login", {isloggedin});

});

app.get("/dashborad", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");  // Redirect if the user is not logged in
    }

    const userId = req.session.user._id;  // Access user ID from session
    
    // Fetch user-specific guides or other personalized content
    const guides = await Guide.find({ creator: userId });  // Example query to get user-specific data
    
    res.render("dashborad", { guides, user: req.session.user });  // Pass the user and guides to the dashboard view
});
// Middleware to check if the user is logged in
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect("/login");  // Redirect to login if not authenticated
}

app.get("/dashborad", isAuthenticated, async (req, res) => {
    const userId = req.session.user._id;  // Access user ID from session
    const guides = await Guide.find({ creator: userId });
    
    res.render("dashborad", { guides, user: req.session.user });
});

app.get("/ny_guide", (req, res) => {
    res.render("ny_guide"); 
});
const Guide = mongoose.model("Guide", guideSchema);
// app.post("/ny_guide",uploads.single("bilde"),async (req, res )=> {
//     console.log(req.body)
//     console.log(req.file, "FILE")
app.post("/guide/:id/edit", upload.array("bilde"), async (req, res) => {
    const { id } = req.params;
    const { tittel, tag, overskrift, beskrivelse, oldBilde } = req.body;

    try {
        // Fetch the existing guide
        const guide = await Guide.findById(id);
        if (!guide) {
            return res.status(404).send("Guide not found");
        }

        // Prepare the new images array, replacing old images with new uploads if any
        let bilde = oldBilde; // Start with the old images

        if (req.files && req.files.length > 0) {
            // Loop through the uploaded files and replace the corresponding old image
            req.files.forEach((file, index) => {
                if (file && file.filename) {
                    // Replace the image at the corresponding index
                    bilde[index] = file.filename;
                }
            });
        }

        // Update the guide with the new data, including images
        await Guide.findByIdAndUpdate(id, { 
            tittel, 
            tag, 
            overskrift, 
            beskrivelse, 
            bilde, // Updated image array
        });

        // Redirect to the updated guide
        res.redirect(`/guide/${id}`);
    } catch (error) {
        console.error("Error updating guide:", error);
        res.status(500).send("Error updating guide.");
    }
});

// })

app.post("/ny_guide", upload.array("bilde"), async (req, res) => {
    const { tittel, tag, overskrift, beskrivelse } = req.body;

    // Ensure user is authenticated
    if (!req.session.user || !req.session.user._id) {
        return res.status(403).send("You must be logged in to create a guide.");
    }

    // Convert overskrift and beskrivelse to arrays if they are coming in as strings
    const overskrifter = Array.isArray(overskrift) ? overskrift : [overskrift];
    const beskrivelser = Array.isArray(beskrivelse) ? beskrivelse : [beskrivelse];
    const bilde = req.files.map(file => file.filename); // Get filenames of uploaded images

    // Create the new guide instance
    const newGuide = new Guide({
        tittel,
        tag,
        
        overskrift:overskrifter, // Store as an array of strings
        beskrivelse:beskrivelser, // Store as an array of strings
        bilde, // Store an array of image filenames
        creator: req.session.user._id  
    });
    console.log(newGuide)
    try {
        await newGuide.save();
        res.redirect(`/guide/${newguide._id}`);
    } catch (error) {
        console.error("Error saving guide:", error);
        res.status(500).json({ message: "Error saving guide", error });
    }
    
});


// Delete Guide Route
// Delete Guide Route
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


// let logget = false;

app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Could not log out.");
        }
        res.redirect("/login");  // Redirect to login page after logout
    });
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
                    req.session.user = { name: newUser.email}
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


// app.post("/login", async (req, res) => {
//     const { brukernavn, password } = req.body;
//     const user = await User.findOne({ email: brukernavn });

//     if (!user) {
//         return res.status(400).json({ message: "User not found" });
//     }

//     try {
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (isMatch) {
//             logget =true
//             return res.redirect("/dashboard");
//         } else {
//             return res.status(400).json({ message: "Invalid password" });
//         }
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: "Server error" });
//     }
// });
app.post("/login", async (req, res) => {
    const { brukernavn, password } = req.body;

    // Find user by email (brukernavn)
    User.findOne({ email: brukernavn }).then((user) => {
        if (!user) {
            // If user is not found, redirect to login with an error message
            return res.status(400).redirect("/login");
        }

        // If user is found, compare passwords
        bcrypt.compare(password, user.password).then((isMatch) => {
            if (isMatch) {
                // If password matches, save the user ID in the session
                req.session.user = { _id: user._id, email: user.email };
                
                // Redirect to the dashboard after successful login
                return res.status(200).redirect("/dashborad");
            } else {
                // If password doesn't match, redirect to login
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
let isloggedin;
    if(req.session.user){
        isloggedin=true;
      }
    

    try {
        const matchingGuides = await Guide.find({ 
              $or: [
                { tittel: { $regex: new RegExp(searchTerm, "i") } }, // Search in title
                { beskrivelse: { $regex: new RegExp(searchTerm, "i") } } // Search in description
            ]
        });

        if (matchingGuides.length > 0) {
            const guides = matchingGuides;  // If there's a match, get the first guide
            // const guide = matchingGuides[0];  // If there's a match, get the first guide
            // Redirect to the guide's page by its ID
            res.render("index", { guides, isloggedin });
        } else {
            // No matches found
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