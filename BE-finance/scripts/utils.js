const mailer = require('nodemailer');
const env = require("dotenv").config({
    path: "../.env",
}).parsed;


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

function subStringCustom(input, start, end, startOffset, endOffset) {
    let startIndex = input.indexOf(start) + startOffset;
    let endIndex = input.indexOf(end) + endOffset;
    return input.substr(startIndex, endIndex - startIndex)
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function sendEmail(adressee, message, filename, path) {
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
    let mail = {
        from: '"Data loader script" <script_server@gmail.com>',
        to: adressee,
        subject: "API data load recap",
        text: message,
    }
    if (filename && path) {
        mail.attachments = {
            filename: filename,
            path: path
        }
    }
    await transporter.sendMail(mail);
}


function standardDeviation(arr) {
    // Creating the mean with Array.reduce
    let mean = arr.reduce((acc, curr) => {
        return acc + curr
    }, 0) / arr.length;
    
    // Assigning (value - mean) ^ 2 to
    // every array item
    arr = arr.map((k) => {
        return (k - mean) ** 2
    });
 
    // Calculating the sum of updated array 
    let sum = arr.reduce((acc, curr) => acc + curr, 0);
 
    // Returning the standard deviation
    return (sum / arr.length) ** 0.5
}

module.exports = {
    findByKey,
    subStringCustom,
    delay,
    sendEmail,
    standardDeviation
};