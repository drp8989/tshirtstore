const express=require("express");
const app = express();
const morgan=require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cors=require("cors");

//regular middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//swagger ui
const swaggerUi = require("swagger-ui-express");
const YAML = require("yaml")
const fs = require("fs")
const file  = fs.readFileSync("./swagger.yaml", "utf8")
const swaggerDocument = YAML.parse(file)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


//cookies and file middleware
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp/",
}));


//temp check
app.set("view engine","ejs");

//cors
app.use(cors());

//morgan middleware
app.use(morgan("tiny"));



//import all routes here 
const home = require("./routes/home");
const user = require("./routes/user");

//router middleware
app.use("/api/v1", home);
app.use("/api/v1", user);


app.get("/signuptest",(req,res)=>{
    res.render("signuptest")
})



//export app js
module.exports= app;