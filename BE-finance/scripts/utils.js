const mailer = require('nodemailer');
const env = require("dotenv").config({
    path: ".env",
}).parsed;
// const apikey = env.AV_API_KEY;


function findByKey(obj, keyToFind) {
    return Object.entries(obj)
        .reduce((acc, [key, value]) => {
            if (key === keyToFind) {
                return acc.concat(value)
            } else {
                if (typeof value === 'object') {
                    return acc.concat(findByKey(value, keyToFind))
                } else {
                    return acc
                }
            }
        }, [])
}

// function findByKey(obj, keyToFind) {
//     return Object.entries(obj)
//         .reduce((acc, [key, value]) => (key === keyToFind)
//             ? acc.concat(value)
//             : (typeof value === 'object') 
//                 ? acc.concat(findByKey(value, keyToFind))
//                 : acc
//             , [])
// }

function subStringCustom(input, start, end, startOffset, endOffset) {
    let startIndex = input.indexOf(start) + startOffset;
    let endIndex = input.indexOf(end) + endOffset;
    return input.substr(startIndex, endIndex - startIndex)
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function sendEmail(adressee) {
    let config = {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: "antonelgabor2@gmail.com",
            pass: env.PWD,
        },
    };

    let transporter = mailer.createTransport(config);
    await transporter.sendMail({
        from: '"Data loader script" <script_server@gmail.com>',
        to: adressee,
        subject: "API data load recap",
        text: "Here's today's data load recap",
        // attachments: [{
        //     filename: filename,
        //     path: path
        // }]
    });
}

module.exports = {
    findByKey,
    subStringCustom,
    delay,
    sendEmail
};