const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 5000;


app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(bodyparser.jason);
//routes
app.get("/",(req,res)=>{
    res.send("Home page");
});

//connect to DB and start server 
mongoose
    .connect(process.env.MONGO_URI)
    .then(()=>{
        app.listen(PORT,()=>{
            console.log('server running on port ${PORT}');
        })
    })
    .catch((err)=>console.log(err))