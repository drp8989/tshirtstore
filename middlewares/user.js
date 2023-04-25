const User = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const jwt = require("jsonwebtoken");

exports.isLoggedIn = BigPromise(async(req,res,next)=>{
    const token = req.cookies.tok || req.header("Authorizaton").replace("Bearer ","")
    
    if (!token){
        return next(new CustomError("Login first to access",401));
    }
    //Based on this token you can verify the user
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    //injecting one of custom properties
    req.user=await User.findById(decoded.id)
    next()

});