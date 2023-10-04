const asyncHandler = require("express-async-handler");
const User = require("../models/userModel"); 
const jwt = require("jsonwebtoken");

const generateToken = (id)=>{
  return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1d"});
};

const registerUser = asyncHandler( async (req,res)=>{
    const {name, email, password} = req.body
    
    //validation
    if(!name || !email || !password){
    res.status(400)
    throw new Error("Please fill in all required fields")
}
  if(password.length < 6){
      res.status(400)
      throw new Error("Password cannot be less than 6 characters")
    }
    
  //check if email is already registered
  const userExists = await User.findOne({email})
  
  if(userExists){
      res.status(400)
      throw new Error("Email has already been registered")
    }
    
    //create new user
    const user = await User.create({
    name,
    email,
    password
  })

  //generate token
  const token = generateToken(user._id);

  if(user) {
    const {_id, name, email, photo, phone, bio} = user
    res.status(201).json({
        _id, name, email, photo, phone, bio, token
    })
  } else {
    res.status(400)
    throw new Error("Invalid user data")
  }
});


module.exports = {
    registerUser,
}