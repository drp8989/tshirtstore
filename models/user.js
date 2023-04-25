const mongoose =require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    //name: String,
    name: {
        type:String,
        required:[true,"Please provide a name"],
        maxLength:[40,"Name should be under 40 characters"]
    },
    email: {
        type:String,
        required:[true,"Please provide an email"],
        validate:[validator.isEmail,"Please enter email in correct format"],
        unique:true,
    },
    password: {
        type:String,
        required:[true,"Please provide a password"],
        minlength:[6,"Password should be atleast 6 characters"],
        select:false,
    },
    role: {
        type:String,
        default:"user",
    },
    photo: {
        id: {
            type:String,
            required:true,
        },
        secure_url: {
            type:String,
            required:true,
        },
    },
    forgotPasswordToken: {
        type:String,
    },
    forgotPasswordExpiry: {
        type:String,
    },
    createdAt: {
        type:Date,
        default:Date.now()

    },
});

//encrypt password before save
//isModified is a mongoose methid returns true is path is satisfied
userSchema.pre("save",async function(next){
    if(!this.isModified("password")){ 
        return next();
    }
    this.password= await bcrypt.hash(this.password,10)
})

userSchema.methods.isValidatedPassword = async function(usersendPassword){
    return await bcrypt.compare(usersendPassword,this.password)
}
//craete and return jwt token 
userSchema.methods.getJwtToken = async function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRY,
    })
}

//genrate forgot password token(String)

userSchema.methods.getForgotPasswordToken = async function(){
    //genrate a long and random string
    const forgotToken=crypto.randomBytes(20).toString("hex");
    
    //getting a hash - make sure to get a hash on backend
    this.forgotPasswordToken=crypto.createHash("sha256").update(forgotToken).digest("hex");
    this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000
     
    return forgotToken
     
}



module.exports = mongoose.model("User",userSchema);