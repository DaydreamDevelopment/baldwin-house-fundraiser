import * as functions from 'firebase-functions';
import * as stripePackage from 'stripe';
import * as cors from 'cors';
import * as admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase);

const stripe = stripePackage(functions.config().stripe.testkey);
const donationDB = admin.database().ref('donations');
const corsAllowed = cors({ origin: true });

const singleTicketPrice = 1000;
const fiveTicketPrice = 3000;
const tenTicketPrice = 5000;

 // Charge and save an entry
 export const saveEntry = functions.https.onRequest((req, res) => {
    corsAllowed(req, res, async () => {
        
        // Verify cost is correct
        if(!req.body.email && !req.body.phone && !req.body.firstName && !req.body.lastName && !req.body.address && !req.body.postalCode) {
            return res.send('Missing form value');
        }
        if(!req.body.token) {
            return res.send('Missing token value');
        }
        if(!req.body.tickets || req.body.tickets.length < 0) {
            return res.send('No tickets were sent');
        }
        if(parseInt(req.body.donation) !== getTotal(req.body.tickets, singleTicketPrice, fiveTicketPrice, tenTicketPrice)) {
            return res.send('Donation amount does not match number of tickets');
        }
        try {
            // Create the customer in Stripe
            const customer = await stripe.customers.create({description: 'Baldwin donation customer: ' + req.body.email, source: req.body.token});
            // Create a charge on the users source
            const charge = await stripe.charges.create({amount: parseInt(req.body.donation), currency: 'cad', customer: customer.id});
            
            // Save data to database
            await donationDB.child(charge.id).set({
                customer: customer,
                charge: charge,
                donation: req.body.donation,
                email: req.body.email,
                phone: req.body.phone,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                address: req.body.address,
                postalCode: req.body.postalCode
            });

            // Send back response
            return res.send("Success");
        } catch(err) {
            return res.send(err);
        }
    });
 });

 function getTotal(ticketsSelected, ticketPrice, ticketPriceFive, ticketPriceTen) {
    let totalCost = 0;
    let totalTickets = 0;
  
    for(const ticket of ticketsSelected) {
      totalTickets += parseInt(ticket.count);
    }  

    if(totalTickets >= 10) {
      totalCost += Math.floor(totalTickets / 10) * ticketPriceTen;
      const remainingTicketsTen = totalTickets % 10;
      if(remainingTicketsTen >= 5) {
        totalCost += Math.floor(remainingTicketsTen / 5) * ticketPriceFive;
        const remainingTicketsFive = remainingTicketsTen % 5;
        totalCost += remainingTicketsFive * ticketPrice;
      }
      else {
        totalCost += remainingTicketsTen * ticketPrice;
      }
    }
    else if(totalTickets >= 5) {
      totalCost += Math.floor(totalTickets / 5) * ticketPriceFive;
      const remainingTicketsFive = totalTickets % 5;
      totalCost += remainingTicketsFive * ticketPrice;
    }
    else {
      totalCost += totalTickets * ticketPrice;
    }

    return totalCost;
  }
