// // REQUIRE ALL THE UTILITIES
// const { respF, uuid } = require("../utilities");

// async function routes(fastify, options, next) {
//   // DB
//   const db = fastify.mongo
//     .db(process.env.DATABASE)
//     .collection(process.env.COLLECTIONROUTINES);

//   // DB USERS
//   const dbUsers = fastify.mongo
//     .db(process.env.DATABASE)
//     .collection(process.env.COLLECTIONUS);

//   //
//   // ───────────────────────────────────────────── WRITE ROUTINE ─────
//   //
//   fastify.route({
//     url: "/routine",
//     method: "POST",
//     schema: {
//       body: {
//         type: "object",
//         required: ["id", "title", "subject", "content"],
//         properties: {
//           id: {
//             type: "string",
//           },
//           title: {
//             type: "string",
//           },
//           groups: {
//             type: "array",
//             items: {
//               type: "string",
//             },
//           },
//         },
//       },
//       response: {
//         200: {
//           type: "object",
//           properties: {
//             message: { type: "string" },
//           },
//         },
//       },
//     },
//     preValidation: [fastify.authForced],
//     handler: async (request, reply) => {
//       let inputData = request.body;

//       let id = inputData.id ? inputData.id : uuid.v1();

//       let newRoutine = {
//         _id: id,
//         id: id,
//         title: inputData.title,
//         pauses: [],
//         templates: [],
//         contacts: [],
//         groups: inputData.groups ? inputData.groups : [],
//         creator: request.data.username,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//       };

//       await db.insertOne(newRoutine);
//       return respF(reply, { message: "ok" });
//     },
//   });

//   //
//   // ───────────────────────────────────────────── UPDATE ROUTINE ─────
//   //
//   fastify.route({
//     url: "/routine",
//     method: "PUT",
//     schema: {
//       body: {
//         type: "object",
//         required: ["id"],
//         properties: {
//           id: {
//             type: "string",
//           },
//           title: {
//             type: "string",
//           },
//           groups: {
//             type: "array",
//             items: {
//               type: "string",
//             },
//           },
//         },
//       },
//     },
//     preValidation: [fastify.authForced],
//     handler: async (request, reply) => {
//       try {
//         let inputData = request.body;

//         let data = await db.findOne({ _id: inputData.id });

//         // Get routine
//         if (data) {
//           await db.updateOne(
//             {
//               _id: inputData.id,
//             },
//             {
//               $set: {
//                 ["groups"]: inputData.groups
//                   ? inputData.groups && inputData.groups.length > 0
//                     ? inputData.groups
//                     : []
//                   : data.groups,
//                 ["title"]: inputData.title ? inputData.title : data.title,
//                 ["updatedAt"]: new Date().toISOString(),
//               },
//             }
//           );
//           return respF(reply, { message: "ok" });
//         } else {
//           throw fastify.httpErrors.notFound();
//         }
//       } catch (error) {
//         console.error(error);
//         throw fastify.httpErrors.badRequest(error);
//       }
//     },
//   });

//   //
//   // ───────────────────────────────────────────── DELETE ROUTINE ─────
//   //
//   fastify.route({
//     url: "/routine",
//     method: "DELETE",
//     schema: {
//       body: {
//         type: "object",
//         required: ["id"],
//         properties: {
//           id: {
//             type: "string",
//           },
//         },
//       },
//       response: {
//         200: {
//           type: "object",
//           properties: {
//             message: { type: "string" },
//           },
//         },
//       },
//     },
//     preValidation: [fastify.authForced],
//     handler: async (request, reply) => {
//       let id = request.body.id;

//       let data = await db.findOne({ _id: id });

//       // Get routine from cache or set it
//       if (data) {
//         await db.removeOne({
//           _id: id,
//         });

//         return respF(reply, { message: "ok" });
//       } else {
//         throw fastify.httpErrors.notFound();
//       }
//     },
//   });
//   //
//   // ───────────────────────────────────────────── GET ROUTINES ────────
//   //
//   fastify.route({
//     url: "/routines",
//     method: "GET",
//     schema: {},
//     response: {
//       200: {
//         type: "object",
//         properties: {
//           id: { type: "string" },
//           title: { type: "string" },
//           creator: { type: "string" },
//           updatedAt: { type: "string" },
//           createdAt: { type: "string" },
//           groups: {
//             type: "array",
//             items: {
//               type: "string",
//             },
//           },
//         },
//       },
//     },
//     preValidation: [fastify.authForced],
//     handler: async (request, reply) => {
//       let data = await db.find({}).toArray();

//       // Get routines
//       if (data) {
//         let response = data.map((routine) => {
//           return {
//             id: routine._id,
//             title: routine.title,
//             groups: routine.groups,
//             createdAt: routine.createdAt,
//             updatedAt: routine.updatedAt,
//             creator: routine.updatedAt,
//           };
//         });

//         return respF(reply, response);
//       } else {
//         throw fastify.httpErrors.notFound();
//       }
//     },
//   });

//   //
//   // ───────────────────────────────────────────── GET ROUTINE ────────
//   //
//   fastify.route({
//     url: "/routine",
//     method: "GET",
//     schema: {
//       querystring: {
//         type: "object",
//         required: ["id"],
//         properties: {
//           id: {
//             type: "string",
//           },
//         },
//       },
//     },
//     response: {
//       200: {
//         type: "object",
//         properties: {
//           id: { type: "string" },
//           title: { type: "string" },
//           creator: { type: "string" },
//           updatedAt: { type: "string" },
//           createdAt: { type: "string" },
//           groups: {
//             type: "array",
//             items: {
//               type: "string",
//             },
//           },
//         },
//       },
//     },
//     preValidation: [fastify.authForced],
//     handler: async (request, reply) => {
//       let id = request.query.id;

//       let data = await db.findOne({ _id: id });

//       if (data) {
//         let response = {
//           id: data._id,
//           title: data.title,
//           groups: data.groups,
//           createdAt: data.createdAt,
//           creator: data.creator,
//           updatedAt: data.updatedAt,
//           contacts: data.contacts.map((val) => {
//             return { id: val.id, addedAt: val.addedAt };
//           }),
//           templates: data.templates.map((val) => {
//             return {
//               id: val.id,
//               hour: val.hour,
//               step: val.step,
//               complete: val.complete,
//               sendAfter: val.sendAfter,
//               contacts: val.contacts.map((contact) => {
//                 let contactInRoutine = data.contacts.find(
//                   (val) => val.id == contact.id
//                 );
//                 return {
//                   id: contact.id,
//                   sent: contact.sent,
//                   previousRead: contact.previousRead,
//                   delay: contact.delay,
//                   opened: contact.opened,
//                   delayUpdatedAt: contact.delayUpdatedAt,
//                   addedAt: contactInRoutine ? contactInRoutine.addedAt : null,
//                   customContent: contact.customContent,
//                   customSubject: contact.customSubject,
//                 };
//               }),
//             };
//           }),
//         };
//         return respF(reply, response);
//       } else {
//         throw fastify.httpErrors.notFound();
//       }
//     },
//   });

//   //
//   // ──────────────────────────────────── WRITE ROUTINE TEMPLATES ─────
//   //
//   fastify.route({
//     url: "/routine/template",
//     method: "POST",
//     schema: {
//       body: {
//         type: "object",
//         required: ["id", "templates"],
//         properties: {
//           id: {
//             type: "string",
//           },
//           templates: {
//             type: "array",
//             items: {
//               type: "object",
//               required: ["id", "hour", "step", "sendAfter"],
//               properties: {
//                 id: {
//                   type: "string",
//                 },
//                 complete: {
//                   type: "boolean",
//                 },
//                 hour: {
//                   type: "number",
//                   min: 0,
//                   max: 23,
//                 },
//                 step: {
//                   type: "number",
//                   min: 0,
//                 },
//                 sendAfter: {
//                   type: "number",
//                   min: 0,
//                 },
//               },
//             },
//           },
//         },
//       },
//       response: {
//         200: {
//           type: "object",
//           properties: {
//             message: { type: "string" },
//           },
//         },
//       },
//     },
//     preValidation: [fastify.authForced],
//     handler: async (request, reply) => {
//       try {
//         let inputData = request.body;

//         let data = await db.findOne({ _id: inputData.id });

//         // Get routine
//         if (data) {
//           let templates = [];

//           // Push each template
//           for (let template of inputData.templates) {
//             let indexTemplate = data.template.findIndex(
//               (val) => val.id == template.id
//             );
//             if (indexTemplate == -1) {
//               templates.push({
//                 id: template.id,
//                 step: Number(template.step),
//                 sendAfter: Number(template.sendAfter),
//                 hour: Number(template.hour),
//                 complete: false,
//                 contacts: [],
//               });
//             }
//           }

//           templates = templates.sort((a, b) => a.step - b.step);

//           for (let i = 0; i < templates.length; i++) templates[i] = i + 1;

//           await db.updateOne(
//             {
//               _id: inputData.id,
//             },
//             {
//               $set: {
//                 updatedAt: new Date().toISOString(),
//               },
//               $push: {
//                 templates: {
//                   $each: templates,
//                 },
//               },
//             }
//           );
//           return respF(reply, { message: "ok" });
//         } else {
//           throw fastify.httpErrors.notFound();
//         }
//       } catch (error) {
//         console.error(error);
//         throw fastify.httpErrors.badRequest(error);
//       }
//     },
//   });

//   //
//   // ───────────────────────────────────── UPDATE ROUTINE TEMPLATES ─────
//   //
//   fastify.route({
//     url: "/routine/template",
//     method: "PUT",
//     schema: {
//       body: {
//         type: "object",
//         required: ["id"],
//         properties: {
//           id: {
//             type: "string",
//           },
//           templates: {
//             type: "array",
//             items: {
//               type: "object",
//               required: ["id"],
//               properties: {
//                 id: {
//                   type: "string",
//                 },
//                 complete: {
//                   type: "boolean",
//                 },
//                 hour: {
//                   type: "number",
//                   min: 0,
//                   max: 23,
//                 },
//                 step: {
//                   type: "number",
//                   min: 0,
//                 },
//                 sendAfter: {
//                   type: "number",
//                   min: 0,
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//     preValidation: [fastify.authForced],
//     handler: async (request, reply) => {
//       try {
//         let inputData = request.body;

//         let data = await db.findOne({ _id: inputData.id });

//         // Get routine
//         if (data) {
//           let updateExpression = {};
//           updateExpression["updatedAt"] = new Date().toISOString();

//           // Update each template
//           for (let template of inputData.templates) {
//             let indexTemplate = data.template.findIndex(
//               (val) => val.id == template.id
//             );
//             let oldTemplate = data.template.find(
//               (val) => val.id == template.id
//             );
//             if (indexTemplate !== -1) {
//               if (
//                 template.hasOwnProperty("complete") &&
//                 oldTemplate.complete !== template.complete
//               ) {
//                 updateExpression["templates." + templateIndex + ".complete"] =
//                   template.complete;
//               }
//               if (
//                 template.hasOwnProperty("hour") &&
//                 oldTemplate.hour !== Number(template.hour)
//               ) {
//                 updateExpression[
//                   "templates." + templateIndex + ".hour"
//                 ] = Number(template.hour);
//               }
//               if (
//                 template.hasOwnProperty("step") &&
//                 oldTemplate.step !== Number(template.step)
//               ) {
//                 updateExpression[
//                   "templates." + templateIndex + ".step"
//                 ] = Number(template.step);
//               }
//               if (
//                 template.hasOwnProperty("sendAfter") &&
//                 oldTemplate.sendAfter !== Number(template.sendAfter)
//               ) {
//                 updateExpression[
//                   "templates." + templateIndex + ".sendAfter"
//                 ] = Number(template.sendAfter);
//               }
//             }
//           }

//           await db.updateOne(
//             {
//               _id: inputData.id,
//             },
//             {
//               $set: updateExpression,
//             }
//           );
//           return respF(reply, { message: "ok" });
//         } else {
//           throw fastify.httpErrors.notFound();
//         }
//       } catch (error) {
//         console.error(error);
//         throw fastify.httpErrors.badRequest(error);
//       }
//     },
//   });

//   //
//   // ──────────────────────────────────── REMOVE ROUTINE TEMPLATES ─────
//   //
//   fastify.route({
//     url: "/routine/template",
//     method: "DELETE",
//     schema: {
//       body: {
//         type: "object",
//         required: ["id", "templates"],
//         properties: {
//           id: {
//             type: "string",
//           },
//           templates: {
//             type: "array",
//             items: {
//               type: "string",
//             },
//           },
//         },
//       },
//       response: {
//         200: {
//           type: "object",
//           properties: {
//             message: { type: "string" },
//           },
//         },
//       },
//     },
//     preValidation: [fastify.authForced],
//     handler: async (request, reply) => {
//       try {
//         let inputData = request.body;

//         let data = await db.findOne({ _id: inputData.id });

//         // Get routine
//         if (data) {
//           let templates = [];

//           // Pull each template
//           for (let template of inputData.templates) {
//             let indexTemplate = data.template.findIndex(
//               (val) => val.id == template
//             );
//             if (indexTemplate != -1) {
//               templates.push(template);
//             }
//           }

//           await db.updateOne(
//             {
//               _id: inputData.id,
//             },
//             {
//               $set: {
//                 updatedAt: new Date().toISOString(),
//               },
//               $pull: {
//                 templates: {
//                   id: { $each: templates },
//                 },
//               },
//             }
//           );
//           return respF(reply, { message: "ok" });
//         } else {
//           throw fastify.httpErrors.notFound();
//         }
//       } catch (error) {
//         console.error(error);
//         throw fastify.httpErrors.badRequest(error);
//       }
//     },
//   });

//   //
//   // ─────────────────────── UPDATE ROUTINE TEMPLATES ORDER ─────
//   //
//   fastify.route({
//     url: "/routine/template",
//     method: "PUT",
//     schema: {
//       body: {
//         type: "object",
//         required: ["id", "templates"],
//         properties: {
//           id: {
//             type: "string",
//           },
//           templates: {
//             type: "array",
//             items: {
//               type: "string",
//             },
//           },
//         },
//       },
//     },
//     preValidation: [fastify.authForced],
//     handler: async (request, reply) => {
//       try {
//         let inputData = request.body;

//         let data = await db.findOne({ _id: inputData.id });

//         // Get routine
//         if (data) {
//           let updateExpression = {};
//           updateExpression["updatedAt"] = new Date().toISOString();

//           // Set the old index in a temp property
//           for (let i = 0; i < data.templates.length; i++)
//             data.templates[i].tempIndex = i;

//           // Order with the new order
//           data.templates = data.templates.sort(
//             (a, b) =>
//               inputData.templates.indexOf(a.id) -
//               inputData.templates.indexOf(b.id)
//           );

//           // Update the order in the db
//           for (let i = 0; i < data.templates.length; i++)
//             updateExpression[
//               "templates." + data.templates[i].tempIndex + ".step"
//             ] = i + 1;

//           await db.updateOne(
//             {
//               _id: inputData.id,
//             },
//             {
//               $set: updateExpression,
//             }
//           );
//           return respF(reply, { message: "ok" });
//         } else {
//           throw fastify.httpErrors.notFound();
//         }
//       } catch (error) {
//         console.error(error);
//         throw fastify.httpErrors.badRequest(error);
//       }
//     },
//   });
//   //
//   // ───────────────────────────── ADD CONTACTS IN ROUTINE ─────
//   //
//   fastify.route({
//     url: "/routine/contact",
//     method: "POST",
//     schema: {
//       body: {
//         type: "object",
//         required: ["id", "contacts"],
//         properties: {
//           id: {
//             type: "string",
//           },
//           contacts: {
//             type: "array",
//             items: {
//               type: "object",
//               required: ["id", "templates", "timezone"],
//               properties: {
//                 id: {
//                   type: "string",
//                 },
//                 timezone: {
//                   type: "string",
//                 },
//                 templates: {
//                   type: "array",
//                   items: {
//                     type: "object",
//                     required: ["id"],
//                     properties: {
//                       id: {
//                         type: "string",
//                       },
//                       customSubject: {
//                         type: "string",
//                       },
//                       customContent: {
//                         type: "string",
//                       },
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//     preValidation: [fastify.authForced],
//     handler: async (request, reply) => {
//       try {
//         const inputData = request.body;

//         let routine = await db.findOne({ _id: inputData.id });

//         // Get routine
//         if (routine) {
//           let templates = routine.templates;
//           let routineContacts = routine.contacts;

//           // Create a support map:
//           // {[idTemplate]:
//           //  {
//           //    index: templateIndex,
//           //    oldContacts: mapWithTheOldUser,
//           //    newContacts: newContactsToAdd
//           //  }
//           // }

//           let templatesMap = {};
//           for (let i = 0; i < templates.length; i++) {
//             const template = templates[i];
//             let oldContactsMap = {};
//             for (let contTemp of template.contacts)
//               oldContactsMap[contTemp.id] = true;
//             templatesMap[template.id] = {
//               index: i,
//               oldContacts: oldContactsMap,
//               newContacts: [],
//             };
//           }

//           // Add contacts
//           for (const contact of inputData.contacts) {
//             // Check if is valid the contact
//             if (
//               routineContacts.findIndex((val) => contact.id == val.id) == -1
//             ) {
//               // Add contact to the contact list
//               routineContacts.push({
//                 id: contact.id,
//                 addedAt: new Date().toISOString(),
//                 timezone: contact.timezone,
//               });
//             }
//             for (const contactTemplate of contact.templates) {
//               // Check if the template exist and if the user isn't yet in the template
//               if (
//                 templatesMap[contactTemplate.id] &&
//                 templatesMap[contactTemplate.id].oldContacts[contact.id] !==
//                   true
//               ) {
//                 // Add contact in the template
//                 templatesMap[contactTemplate.id].newContacts.push({
//                   id: contact.id,
//                   customSubject: contactTemplate.customSubject
//                     ? contactTemplate.customSubject
//                     : null,
//                   customContent: contactTemplate.customContent
//                     ? contactContent.customContent
//                     : null,
//                   sent: false,
//                   opened: false,
//                   previous: false,
//                   delay: 0,
//                   delayUpdatedAt: new Date().toISOString(),
//                 });
//               }
//             }
//           }

//           // Create updateExpression
//           for (key in templatesMap) {
//             const template = templatesMap[key];
//             // If the template has new users
//             if (template.newContacts && template.newContacts.length > 0) {
//               updateExpression["templates." + template.index + ".contacts"] = {
//                 $each: template.newContacts,
//               };
//             }
//           }

//           if (updateExpression != {}) {
//             await db.updateOne(
//               {
//                 _id: inputData.id,
//               },
//               {
//                 $push: updateExpression,
//                 $set: {
//                   ["contacts"]: routineContacts,
//                   ["updatedAt"]: new Date().toISOString(),
//                 },
//               }
//             );
//             return respF(reply, { message: "ok" });
//           } else {
//             throw fastify.httpErrors.badRequest({
//               message: "All the contacts are invalid",
//             });
//           }
//         } else {
//           throw fastify.httpErrors.notFound();
//         }
//       } catch (error) {
//         console.error(error);
//         throw fastify.httpErrors.badRequest(error);
//       }
//     },
//   });

//   //
//   // ───────────────────────── UPDATE CONTACTS IN ROUTINE ─────
//   //
//   fastify.route({
//     url: "/routine/contact",
//     method: "PUT",
//     schema: {
//       body: {
//         type: "object",
//         required: ["id", "contacts"],
//         properties: {
//           id: {
//             type: "string",
//           },
//           contacts: {
//             type: "array",
//             items: {
//               type: "object",
//               required: ["id", "templates"],
//               properties: {
//                 id: {
//                   type: "string",
//                 },
//                 templates: {
//                   type: "array",
//                   items: {
//                     type: "object",
//                     required: ["id"],
//                     properties: {
//                       id: {
//                         type: "string",
//                       },
//                       customSubject: {
//                         type: "string",
//                       },
//                       customContent: {
//                         type: "string",
//                       },
//                       sent: {
//                         type: "boolean",
//                       },
//                       previousRead: {
//                         type: "boolean",
//                       },
//                       delay: {
//                         type: "number",
//                       },
//                       opened: {
//                         type: "number",
//                       },
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//     preValidation: [fastify.authForced],
//     handler: async (request, reply) => {
//       try {
//         const inputData = request.body;

//         let routine = await db.findOne({ _id: inputData.id });

//         // Get routine
//         if (routine) {
//           // Update all contacts
//           let updateExpression = {};
//           for (const contact of inputData.contacts) {
//             for (const template of contact.templates) {
//               // Search the template
//               const indexTemplate = routine.template.findIndex(
//                 (val) => val.id == template.id
//               );
//               const oldTemplate = routine.template.find(
//                 (val) => val.id == template.id
//               );
//               if (indexTemplate !== -1) {
//                 // Search the contact
//                 const indexContactTemplate = oldTemplate.contacts.findIndex(
//                   (val) => val.id == contact.id
//                 );
//                 const oldContactTemplate = oldTemplate.contacts.find(
//                   (val) => val.id == contact.id
//                 );
//                 if (indexContactTemplate !== -1) {
//                   // Update the contact in the template
//                   if (
//                     template.hasOwnProperty("customContent") &&
//                     oldContactTemplate.customContent !== template.customContent
//                   ) {
//                     updateExpression[
//                       "templates." +
//                         templateIndex +
//                         ".contacts." +
//                         indexContactTemplate +
//                         ".customContent"
//                     ] = template.customContent;
//                   }
//                   if (
//                     template.hasOwnProperty("customSubject") &&
//                     oldContactTemplate.customSubject !== template.customSubject
//                   ) {
//                     updateExpression[
//                       "templates." +
//                         templateIndex +
//                         ".contacts." +
//                         indexContactTemplate +
//                         ".customSubject"
//                     ] = template.customSubject;
//                   }
//                   if (
//                     template.hasOwnProperty("sent") &&
//                     oldContactTemplate.sent !== template.sent
//                   ) {
//                     updateExpression[
//                       "templates." +
//                         templateIndex +
//                         ".contacts." +
//                         indexContactTemplate +
//                         ".sent"
//                     ] = template.sent;
//                   }
//                   if (
//                     template.hasOwnProperty("previousRead") &&
//                     oldContactTemplate.previousRead !== template.previousRead
//                   ) {
//                     updateExpression[
//                       "templates." +
//                         templateIndex +
//                         ".contacts." +
//                         indexContactTemplate +
//                         ".previousRead"
//                     ] = template.previousRead;
//                   }
//                   if (
//                     template.hasOwnProperty("delay") &&
//                     oldContactTemplate.delay !== template.delay
//                   ) {
//                     updateExpression[
//                       "templates." +
//                         templateIndex +
//                         ".contacts." +
//                         indexContactTemplate +
//                         ".delay"
//                     ] = Number(template.delay);
//                   }
//                   if (
//                     template.hasOwnProperty("opened") &&
//                     oldContactTemplate.opened !== template.opened
//                   ) {
//                     updateExpression[
//                       "templates." +
//                         templateIndex +
//                         ".contacts." +
//                         indexContactTemplate +
//                         ".opened"
//                     ] = template.opened;
//                   }
//                 }
//               }
//             }
//           }

//           if (updateExpression != {}) {
//             updateExpression["updatedAt"] = new Date().toISOString();
//             await db.updateOne(
//               {
//                 _id: inputData.id,
//               },
//               {
//                 $set: updateExpression,
//               }
//             );
//             return respF(reply, { message: "ok" });
//           } else {
//             throw fastify.httpErrors.badRequest({
//               message: "All the contacts are invalid",
//             });
//           }
//         } else {
//           throw fastify.httpErrors.notFound();
//         }
//       } catch (error) {
//         console.error(error);
//         throw fastify.httpErrors.badRequest(error);
//       }
//     },
//   });

//   //
//   // ───────────────────────────── REMOVE CONTACTS IN ROUTINE ─────
//   //
//   fastify.route({
//     url: "/routine/contact",
//     method: "DELETE",
//     schema: {
//       body: {
//         type: "object",
//         required: ["id", "contacts"],
//         properties: {
//           id: {
//             type: "string",
//           },
//           contacts: {
//             type: "array",
//             items: {
//               type: "object",
//               required: ["id", "templates"],
//               properties: {
//                 id: {
//                   type: "string",
//                 },
//                 templates: {
//                   type: "array",
//                   items: {
//                     type: "string",
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//     preValidation: [fastify.authForced],
//     handler: async (request, reply) => {
//       try {
//         const inputData = request.body;

//         let routine = await db.findOne({ _id: inputData.id });

//         // Get routine
//         if (routine) {
//           let templates = routine.templates;
//           let routineContacts = routine.contacts;

//           // Create a support map:
//           // {[idTemplate]:
//           //  {
//           //    index: templateIndex,
//           //    oldContacts: mapWithTheOldUser,
//           //    newContacts: newContactsToAdd
//           //  }
//           // }

//           let templatesMap = {};
//           for (let i = 0; i < templates.length; i++) {
//             const template = templates[i];
//             let oldContactsMap = {};
//             for (let contTemp of template.contacts)
//               oldContactsMap[contTemp.id] = true;
//             templatesMap[template.id] = {
//               index: i,
//               oldContacts: oldContactsMap,
//               removeContacts: [],
//             };
//           }

//           for (const contact of inputData.contacts) {
//             // Check if the contact exists
//             const indexRoutineContacts = routineContacts.findIndex(
//               (val) => contact.id == val.id
//             );

//             if (indexRoutineContacts != -1) {
//               let noContactInTemplates = true;
//               for (let template of templates) {
//                 if (
//                   // The template has the contact and the contact wants to remove the template
//                   contact.templates.includes(template.id) &&
//                   templatesMap[template.id].oldContacts[contact.id] == true
//                 ) {
//                   templatesMap[template.id].removeContacts.push(contact.id);
//                 } else if (
//                   // The template has the contact and the contact doesn't want to remove the template
//                   templatesMap[template.id].oldContacts[contact.id] == true
//                 ) {
//                   noContactInTemplates = false;
//                 }
//               }

//               // Remove contact from the contact list if exist and if the contact doesn't exist in any template
//               if (noContactInTemplates) {
//                 routineContacts.splice(indexRoutineContacts, 1);
//               }
//             }
//           }

//           // Create updateExpression
//           for (key in templatesMap) {
//             const template = templatesMap[key];
//             // If the template has to remove user
//             if (template.removeContacts && template.removeContacts.length > 0) {
//               updateExpression["templates." + template.index + ".contacts"] = {
//                 id: { $each: template.removeContacts },
//               };
//             }
//           }

//           if (updateExpression != {}) {
//             await db.updateOne(
//               {
//                 _id: inputData.id,
//               },
//               {
//                 $pull: updateExpression,
//                 $set: {
//                   ["contacts"]: routineContacts,
//                   ["updatedAt"]: new Date().toISOString(),
//                 },
//               }
//             );
//             return respF(reply, { message: "ok" });
//           } else {
//             throw fastify.httpErrors.badRequest({
//               message: "All the contacts are invalid",
//             });
//           }
//         } else {
//           throw fastify.httpErrors.notFound();
//         }
//       } catch (error) {
//         console.error(error);
//         throw fastify.httpErrors.badRequest(error);
//       }
//     },
//   });

//   //
//   // ──────────────────────────────────── ADD PAUSE ROUTINE ─────
//   //
//   fastify.route({
//     url: "/routineaddpause",
//     method: "POST",
//     schema: {
//       body: {
//         type: "object",
//         required: ["id", "from", "to"],
//         properties: {
//           id: {
//             type: "string",
//           },
//           from: {
//             type: "string",
//           },
//           to: {
//             type: "string",
//           },
//         },
//       },
//     },
//     preValidation: [fastify.authForced],
//     handler: async (request, reply) => {
//       try {
//         let inputData = request.body;

//         let data = await db.findOne({ _id: inputData.id });

//         // Get routine
//         if (data) {
//           if (new Date(inputData.from) >= new Date(inputData.to)) {
//             throw fastify.httpErrors.badRequest({
//               error: "From is greater than to",
//             });
//           } else {
//             await db.updateOne(
//               {
//                 _id: inputData.id,
//               },
//               {
//                 $push: {
//                   ["pauses"]: {
//                     from: inputData.from,
//                     to: inputData.to,
//                     id: uuid.v1(),
//                   },
//                 },
//               }
//             );
//             return respF(reply, { message: "ok" });
//           }
//         } else {
//           throw fastify.httpErrors.notFound();
//         }
//       } catch (error) {
//         console.error(error);
//         throw fastify.httpErrors.badRequest(error);
//       }
//     },
//   });
// }

// module.exports = routes;
