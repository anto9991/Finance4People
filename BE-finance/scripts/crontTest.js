'use strict'
const mailer = require('nodemailer');
const env = require("dotenv").config({
    path: "../.env",
}).parsed;

async function sendMail(){
    console.log(env)
    console.log(env.GMAIL_PWD)
    let config = {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: "antonelgabor2@gmail.com",
            pass: env.GMAIL_PWD,
        },
    };
    
    let transporter = mailer.createTransport(config);
    await transporter.sendMail({
        from: '"167" <script_server@gmail.com>',
        to: "antonelgabor@gmail.com",
        subject: "Cron test",
        text: "Here's today's data load recap"
    });
}

sendMail();
