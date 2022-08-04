const mongodb = require("mongodb").MongoClient;
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const env = require("dotenv").config({
    path: ".env",
});

let db;

main();

async function main() {
    try {
        db = await mongoDBConnect();
        let user = await db.collection("Users").findOne({ email: process.env.USER_MAIL });
        //Se l'ultimo aggiornamento del contatore non è oggi resetta il dailyCounter
        if (!isToday(user.dailyCounterUpdatedAt)) {
            let updateUser = await db.collection("Users").updateOne(
                { email: process.env.USER_MAIL },
                { $set: { "dailyCounter": 0, "dailyCounterUpdatedAt": Date.now() } }
            );
            if (updateUser.message.documents[0].nModifie == 0) {
                throw ("Daily Counter not updated");
            }
        }
        if (user == null)
            throw ("User not found");

        let routines = [];

        let delay = user.dailyCounter == user.dailyLimit;

        if (user.routines.length > 0) {
            routines = await db.collection("Routines").find({ "_id": { $in: user.routines } }).toArray();

            for (i = 0; i < routines.length; i++) {
                let templates = [];
                if (routines[i].pause)
                    delay = true;

                if (routines[i].templates.length > 0) {
                    templates = await db.collection("Templates").find({ "_id": { $in: routines[i].templates } }).toArray();

                    for (j = 0; j < templates.length; j++) {
                        let template = templates[j]

                        for (k = 0; k < templates[j].contacts.length; k++) {
                            let contact = template.contacts[k];
                            contact.previousRead = true;
                            //Se la mail precedente non è stata letta allora setto il delay a true (se lo era già non cambia nulla)
                            if (!contact.previousRead)
                                delay = true;

                            //Se la mail non è già stata inviata
                            if (!(contact.sent)) {
                                let alreadyDelayed = isToday(contact.delayUpdatedAt);
                                let dbContact = await db.collection("Contacts").findOne({ "_id": contact.contactID });

                                //Se la mail non è già stata inviata, è da ritardate e non è già stata ritardata oggi => aggiorno il campo delay e delayUpdatedAt nel DB
                                if (delay && !alreadyDelayed) {
                                    let update = await db.collection("Templates").updateOne({ _id: template._id, "contacts.contactID": contact.contactID }, { $set: { "contacts.$.delayUpdatedAt": Date.now() }, $inc: {"contacts.$.delay": 1} });

                                    if (update.message.documents[0].nModifie == 0) {
                                        throw ("Delay and delayUpdatedAt fields not updated");
                                    }
                                }
                                //Altrimenti, se è il momento corretto (anche aggiungendo che la mail non debba essere rimandata), invia la mail (dentro sendMail viene anche aggiornato il DB)
                                else if (!delay && !compareDates(contact.addedAt, template.sendAfter + contact.delay, template.hour, (dbContact.timezone == null ? "+00:00" : dbContact.timezone))) {
                                    await sendMail(user, dbContact, template, contact);
                                }
                            }
                        }
                    }
                }
            }
        } else
            process.exit(0);

        process.exit(0);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

async function sendMail(user, contact, template, templContact) {
    try {
        console.log("Sending email to: ", contact.email);
        let config = {
            host: user.host,
            port: user.port,
            secure: user.port == 465 ? true : false,
            auth: {
                user: user.senderMail,
                pass: decrypt(user.senderPassword)
            }
        }
        if (user.host == "smtp-mail.outlook.com") {
            config["secure"] = false;
            config["tls"] = { ciphers: 'SSLv3' }
        }

        let transporter = nodemailer.createTransport(config);

        await transporter.sendMail({
            from: '"IceMail" <' + user.senderMail + '>',
            to: contact.email,
            subject: templContact.customSubject ? templContact.customSubject : template.subject,
            text: templContact.customContent ? templContact.customContent : template.content,
        });

        let updateTemplateContact = await db.collection("Templates").updateOne(
            { _id: template._id, "contacts.contactID": contact._id },
            { $set: { "contacts.$.sent": true, "contacts.$.sentAt": Date.now() } });

        if (updateTemplateContact.message.documents[0].nModifie == 0) {
            throw ("Sent and sentAt fields not updated");
        }

        let updateUser = await db.collection("Users").updateOne(
            { email: process.env.USER_MAIL },
            { $set: { "dailyCounterUpdatedAt": Date.now() }, $inc: { "dailyCounter": 1 } }
        );

        if (updateUser.message.documents[0].nModifie == 0) {
            throw ("Daily Counter not updated");
        }

    } catch (err) {
        console.log(err)
        process.exit(1);
    }

}


/**
 * Check if today (whether info had already been updated or not)
 * @param {Timestamp} date: date to compare to today
 * @returns {bool}
 */
function isToday(date) {
    let today = new Date(Date.now());
    let checkDate = new Date(date ? date : 0);
    return today.getUTCDate() == checkDate.getUTCDate() &&
        today.getUTCMonth() == checkDate.getUTCMonth() &&
        today.getUTCFullYear() == checkDate.getUTCFullYear();
}
/**
 * 
 * @param {Timestamp} inDate 
 * @param {int} daysToAdd 
 * @param {int} hour 
 * @param {String} timezone 
 * @returns {bool} true if it is the correct hour to send the email, considering timezone and delay
 */
function compareDates(inDate, daysToAdd, hour, timezone) {
    let date = new Date(inDate);
    let now = new Date(Date.now());
    date.setUTCDate(date.getUTCDate() + daysToAdd);

    timezone = timezone.split(":");

    if (timezone[0].substr(0, 1) == "+") {
        date.setUTCMinutes(date.getUTCMinutes() + (parseInt(timezone[0].substr(1, 2) * 60)) + (parseInt(timezone[1])))
        now.setUTCMinutes(now.getUTCMinutes() + (parseInt(timezone[0].substr(1, 2) * 60)) + (parseInt(timezone[1])))
    } else {
        date.setUTCMinutes(date.getUTCMinutes() - (parseInt(timezone[0].substr(1, 2) * 60)) - (parseInt(timezone[1])))
        now.setUTCMinutes(now.getUTCMinutes() - (parseInt(timezone[0].substr(1, 2) * 60)) - (parseInt(timezone[1])))
    }

    date.setUTCHours(hour);

    if (now.getUTCDate() == date.getUTCDate() &&
        now.getUTCMonth() == date.getUTCMonth() &&
        now.getUTCFullYear() == date.getUTCFullYear() &&
        now.getUTCHours() == date.getUTCHours())
        return true;
    else
        return false;
}

async function mongoDBConnect() {
    try {
        const client = await mongodb.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).catch(err => { console.log(err); process.exit(1) });
        if (!client) {
            console.log("Error");
            process.exit(1);
        }
        return client.db(process.env.DB_NAME.toString());
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

const iv = process.env.IV;
const alg = "aes-256-cbc";
const secretKey = process.env.SENDER_PWD_KEY;

function encrypt(text) {
    let cipher = crypto.createCipheriv(alg, secretKey, iv);
    let encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return encrypted.toString('hex');
}

function decrypt(hash) {
    const decipher = crypto.createDecipheriv(alg, secretKey, iv);
    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash, 'hex')), decipher.final()]);

    return decrpyted.toString();
}