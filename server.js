const express= require("express");
const app = express();
require("dotenv").config();

app.get("/",(req, res )=> {
    res.render("index")
})
app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.urlencoded({extended:true}));


app.listen(process.env.PORT);