const bigPromise = require("../middlewares/bigPromise");

const cookieToken = require("../utils/cookieToken");
const CustomError = require("../utils/customError");
const mailHelper = require("../utils/emailHelper");

const User = require("../models/user");
const fileUpload = require("express-fileupload");

const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");

exports.signup = bigPromise(async (req,res,next)=>{

    let result;
    if(req.files){
        let file= req.files.photo;
        result= await cloudinary.uploader.upload(file.tempFilePath,{
            folder:"user",
            width:150,
            crop:"scale"
        })
    
    }

    const {name,email,password}=req.body;
    if(!email || !name || !password){
        return next(new CustomError("Please send email",400));
    }

    const user = await User.create({
        name,
        email,
        password,
        photo:{
            id:result.public_id,
            secure_url:result.secure_url,
        }
    })
    // options={
    //     to: "gamergun8@gmail.com", // list of receivers
    //     subject: "normal", // Subject line
    //     text: "sdadbashdsahjdbasd", // plain text body
    // }
    cookieToken(user,res)
    // emailHelper(options)
});

exports.login = bigPromise(async(req,res,next)=>{
    const {email,password} = req.body
    if(!email || !password){
        return next(new CustomError("Please provide email and password",400))
    }

    const user = await User.findOne({email}).select("+password")
    if(!user){
        return next(new CustomError("You are not registered in our database",400))
    }
    const isPasswordCorrect = await user.isValidatedPassword(password)
    if(!isPasswordCorrect){
        return next(new CustomError("You are not registred",400))
    }

    cookieToken(user,res);
});

exports.logout = bigPromise(async(req,res,next)=>{
    //getting the token deleted from the system because thats a responsibility
    res.cookie("tok",null,{
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success:true,
        message:"Logout success"
    })
});

exports.forgotPassword = bigPromise(async(req,res,next)=>{
    //getting the user from the database via email
    const email = req.body;
    console.log(email)
    const user = await User.findOne(email)

    if(!user){
        return next(new CustomError("Email not found as registered",400))
    }

    const forgotToken = user.getForgotPasswordToken()

    await user.save({
        validateBeforeSave:false
    })

    const myUrl = `${req.protocol}://${req.get("host")}/password/reset/${forgotToken}`;

    const message=`Copy paste this link in your URL and hit enter \n\n ${myUrl}`;

    try {
        await mailHelper({
            email : user.email,
            subject : "LCO TStore - Password reset email",
            message,
        });
        res.status(200).json({
            success:true,
            message:"Email send successfully"
        })
    } catch (error) {
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;
        await user.save({ validateBeforeSave : false });
        return next(new CustomError("Error 500",500));        
    }
});

exports.resetPasword = bigPromise(async(req,res,next)=>{
    const token=req.params.token
    const encryToken = crypto.createHash("sha256").update(token).digest("hex");

    const user=await User.findOne({
        encryToken,
        forgotPasswordExpiry:{$gt:Date.now()}
    });
    if(!user){
        return next(new CustomError("Token is invalid or expired"));
    }
    if(req.body.password !== req.body.confirmPassword){
        return next(new CustomError("Password and Confirm Password doesnt match ",400))
    }
    user.password=req.body.password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save()
    //send a JSON response or send token
    cookieToken(user,res);

});


exports.getLoggedInUserDetails = bigPromise(async(req,res,next)=>{
    const user=await User.findById(req.user.id)
    res.status(200).json({
        success:true,
        user,
    })

});


exports.changePassword = bigPromise(async(req,res,next)=>{
    const userId=req.user.id;
    const user=await User.findById(userId).select("+password");
    const isCorrectOldPassword = await user.isValidatedPassword(req.body.oldPassword);

    if(!isCorrectOldPassword){
        return next(new CustomError("Old password is incorrect",400))
    }
    user.password = req.body.password;
    await user.save({validateBeforeSave : false})
    cookieToken(user,res)
});

exports.updateUserDetails = bigPromise(async(req,res,next)=>{
    
    const userId=req.user.id;
    const newData={
        name:req.body.name,
        email:req.body.email,
    };
    if(req.files.photo !== ""){
        const user = await User.findById(req.user.id)
        const imageId=user.photo.id
        const rep = await cloudinary.v2.uploader.destroy(imageId)
        const result= await cloudinary.uploader.upload(req.files.photo.tempFilePath,{
            folder:"user",
            width:150,
            crop:"scale"
        });
        newData.photo={
            id:result.public_id,
            secure_url:result.secure_url,
        }
    }
    const user= await User.findByIdAndUpdate(userId,newData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,

    }) 
    res.status(200).json({
        success:true,
    })
});

