const mongoose  = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"]
    },
    email:{
        type: String,
        required: [true, "Please add a email"],
        unique: true,
        trim: true,
        match: [/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/, "Please enter a valid email"]
    },
    password:{
        type: String,
        required: [true, "Please add a password"],
        minLength: [6, "Password must be at least 6 characters or more"],
        // maxLength: [24, "Password must be at max 24 characters or less"],
    },
    photo:{
        type: String,
        required: [true, "Please add a photo"],
        default: "https://www.pexels.com/photo/woman-in-black-spaghetti-strap-dress-holding-blue-scarf-14395818/"
    },
    phone:{
        type: String
    },
    bio:{
        type: String,
        maxLength: [300, "Bio must be less than 300 chharacters"],
        default: "bio"
    }
},{
    timestamps: true
});

//encrypt password before saving to db
userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
})

const User = mongoose.model("User", userSchema);
module.exports = User;