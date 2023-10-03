const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const cors = require("cors");
const userRoute = require("./routes/userRoute");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();


//middlewares
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(bodyparser.json());

//routes middlewares
app.use("/api/users", userRoute)

//routes
app.get("/",(req,res)=>{
    res.send("Home page");
});

//error middleware
app.use(errorHandler);

//connect to DB and start server 
const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(()=>{ 
        app.listen(PORT,()=>{
            console.log('server running on port ${PORT}');
        })
    })
    .catch((err)=>console.log(err))