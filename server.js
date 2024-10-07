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

// app.listen(process.env.PORT);
const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const multer = require("multer")
const path = require("path");
const { stringify } = require("querystring");


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
        const filename = path.originalname + ".png"
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
    beskrivelse: Array,
    bilde: Array,
});
const brukerguide = mongoose.model("brukerguide", brukerSchema)

// const newbrukerguide  = new brukerguide({ tittel: req.body.tittel,tag: req.body.tag,

// })

const userSchema = new Schema({
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
    res.render("index");
});
const guideSchema = new Schema({
    tittel: String,
    tag: String,
    overskrift: String,
    beskrivelse: String,
    bilde: String,
});


// app.get("/guide", (req, res) => {
//     res.render("guide");
// });
app.get("/guide", async (req, res) => {
    const guides = await Guide.find();
    res.render("guide", { guides });
});
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads"); // Opprett "uploads" mappen hvis den ikke eksisterer
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = Date.now() + ext; // Bruk tidstempel for å unngå duplikater
        cb(null, filename);
    }
});
const upload = multer({ storage: storage });


app.get("/create", (req, res) => {
    res.render("createUser");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/dashboard", (req, res) => {
    res.render("dashborad"); 
});
app.get("/ny_guide", (req, res) => {
    res.render("ny_guide"); 
});
const Guide = mongoose.model("Guide", guideSchema);
// app.post("/ny_guide",uploads.single("bilde"),async (req, res )=> {
//     console.log(req.body)
//     console.log(req.file, "FILE")
// })
app.post("/ny_guide", upload.single("bilde"), async (req, res) => {
    const { tittel, tag, overskrift, beskrivelse } = req.body;
    const bilde = req.file ? req.file.filename : ""; // Lagre filnavn hvis opplastet

    // Opprett ny guide
    const newGuide = new Guide({ tittel, tag, overskrift, beskrivelse, bilde });

    try {
        await newGuide.save();
        console.log("Ny guide lagret:", newGuide);
        res.redirect("/guide"); // Omrediriger til guide-siden etter lagring
    } catch (error) {
        console.error("Feil ved lagring av guide:", error);
        res.status(500).json({ message: "Feil ved lagring av guide" });
    }
});

// let logget = false;

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
                    res.redirect("/dashboard");
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
    User.findOne({email: brukernavn}).then((user) => {
        console.log("result", user);
        
        bcrypt.compare(password, user.password).then(() => {
            res.status(200).redirect("/dashboard");
            
          }).catch((error) => {
              
              console.log("Error", error)
              return res.status(400).json({ message: "Invalid password" });
          })
          
          
      });
  
  });



app.get("/search", (req, res) => {
  const query = req.query.query;
  console.log("Search query:", query);
  res.render("guide");
  // res.send(`You searched for: ${query}`);
});


app.listen(process.env.PORT || 4000, () => {
  console.log(`Server is running on port ${process.env.PORT || 4000}`);
});
