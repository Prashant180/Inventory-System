const asyncHandler = require("express-async-handler");
const User = require("../models/userModel"); 
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id)=>{
  return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1d"});
};

//register user
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

  //send HTTP-only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 86400),
    sameSite: "none",
    secure: true,
  });

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

//login user
const loginUser = asyncHandler( async (req,res) => {
  const {email, password} = req.body;
  //validate request  
  if (!email || !password){
    res.status(400);
    throw new Error("Please add email and password");
  }
  //check if user exists
  const user = await User.findOne({email});

  if(!user){
    res.status(400);
    throw new Error("User not found, please signup");
  }

  //user exists, validate password
  const passwordIsCorrect = await bcrypt.compare(password, user.password);

    //generate token
    const token = generateToken(user._id);

    //send HTTP-only cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 600*1000),
      sameSite: "none",
      secure: true,
    });

  if(user && passwordIsCorrect){
    const {_id, name, email, photo, phone, bio} = user
    res.status(200).json({
        _id, name, email, photo, phone, bio, token
    })
  } else {
    res.status(400);
    throw new Error("Invalid email or password")
  }

});

//create logout function

const logout = asyncHandler(async (req,res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });

  return res.status(200).json({message: "Successfully Loged Out"});
});

//get user data

const getUser = asyncHandler(async (req,res) => {
  const user =await User.findById(req.user._id);

  if(user) {
    const {_id, name, email, photo, phone, bio} = user
    res.status(200).json({
        _id, name, email, photo, phone, bio,
    })
  } else {
    res.status(400)
    throw new Error("User not found")
  }

});

//get login status

const loginStatus = asyncHandler (async (req,res)=> {

  const token = req.cookies.token;
  if (!token){
    return res.json(false);
  }
  
  //verify token
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    return res.json(true);
  } else {
    return res.json(false);
  }

});

//Update user

const updateUser = asyncHandler (async (req,res)=>{
  const user = await User.findById(req.user._id)

  if (user) {
    const {name, email, photo, phone, bio} = user;
    user.email = email;
    user.name = req.body.name || name;
    user.photo = req.body.photo || photo;
    user.phone = req.body.phone || phone;
    user.bio = req.body.bio || bio;

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      photo: updatedUser.photo,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
    })
  } else {
    res.status(404)
    throw new Error("User not found")
  }
});

//change password
const changePassword = asyncHandler (async (req,res)=>{
  const user = await User.findById(req.user._id);

  const {oldPassword, password} = req.body

  if(!user) {
    res.status(404)
    throw new Error("User not found please signup")
  }

  //Validate
  if(!oldPassword || !password) {
    res.status(400)
    throw new Error("Please add old and new password")
  }

  // Validate old password
  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

  // save new password
  if (user && passwordIsCorrect){
    user.password = password;
    await user.save();
    res.status(200).send("Password change successfull");
  } else {
    res.status(400)
    throw new Error("Old password is incorrect");
  }

});

const forgotPassword = asyncHandler (async (req,res)=>{
  res.send("Forgot password");
})

module.exports = {
    registerUser,
    loginUser,
    logout,
    getUser,
    loginStatus,
    updateUser,
    changePassword,
    forgotPassword,
}