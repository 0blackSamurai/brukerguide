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

const Schema = mongoose.Schema;

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

const userSchema = new Schema({
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/guide", (req, res) => {
    res.render("guide");
});

app.get("/create", (req, res) => {
    res.render("createUser");
});

app.get("/login", (req, res) => {
     if(logget=True){
        res.render("create")
     }
    else{
        res.render("login");

    }
});

app.get("/dashboard", (req, res) => {
    res.render("dashborad"); 
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


app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
