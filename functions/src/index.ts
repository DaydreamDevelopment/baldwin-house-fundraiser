import * as functions from 'firebase-functions';
import stripePackage from 'stripe';
import * as cors from 'cors';
import * as admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase);

const stripe = stripePackage(functions.config().stripe.testkey);
const db = admin.database();
const corsAllowed = cors({ origin: true });

 // Charge and save an entry
 export const saveEntry = functions.https.onRequest((req, res) => {
    corsAllowed(req, res, async () => {
        // Verify cost is correct

        // Create charge using token

        // Create a new customer and then a new charge for that customer:
        try {
            // Create the customer in Stripe
            const customer = await stripe.customers.create({email: req.body.email});
            // Create a source to charge the user with
            const source = stripe.customers.createSource(customer.id, {source: req.body.token});
            // Create a charge on the users source
            const charge = stripe.charges.create({amount: 1600, currency: 'cad', customer: source.customer});
            
            // Save data to database


            // Send back response

            res.send("Success");
        } catch(err) {
            res.send(err);
        }
    });
 });
