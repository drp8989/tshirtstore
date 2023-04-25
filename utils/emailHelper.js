const nodemailer = require("nodemailer");

const mailHelper = async({options})=>{

    // let transporter = nodemailer.createTransport({
    //     host: process.env.SMTP_HOST,
    //     port: process.env.SMTP_PORT,
    //     auth: {
    //       user: process.env.SMTP_USER, // generated ethereal user
    //       pass: process.env.SMTP_PASS, // generated ethereal password
    //     },
    // });
    // const transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //       user: 'pahilwanidarshan@gmail.com',
    //       pass: 'vzhjqxwrfvlcmuyl',
    //     }
    //   });
   
    var transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "342ca67b8b7f65",
        pass: "6aba4a6f2def58"
      }
    });
    const message={
        from: 'mailtrap@financialguru.com', // sender address
        to: options.email, // list of receivers
        subject: options.subject, // Subject line
        text: options.message, // plain text body
    }
    await transport.sendMail(message,function(error,info){
      if (error){
        console.log(error);
      }else{
        console.log('Email sent:'+ info.response)
      }
    });    
}

module.exports = mailHelper