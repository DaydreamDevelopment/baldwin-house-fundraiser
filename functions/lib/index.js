"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const stripe_1 = require("stripe");
const stripe = stripe_1.default(functions.config().stripe.testkey);
// Start writing Firebase Functions
// https://firebase.google.com/functions/write-firebase-functions
exports.helloWorld = functions.https.onRequest((request, response) => {
    // Verify cost is correct
    // Create charge using token
    // Save data to database
    // Send back response
    response.send("Hello from Firebase!");
});
//# sourceMappingURL=index.js.map