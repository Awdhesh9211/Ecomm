import { asyncHandler } from "../middleware/asyncHandler.js";
import stripe from "stripe";


// Process Payement
const processPayment = asyncHandler(async (req, res) => {
  console.log("processPayment");
  const myPayment = await stripe(process.env.STRIPE_SECRET_KEY).paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",
    metadata: {
      company: "Ecomm",
    },
  });
  console.log("Called");
  res.status(200).json({ success: true, client_secret: myPayment.client_secret });
});

// Sending payement key
const sendStripeApiKey = asyncHandler(async (req, res) => {
  console.log("sendStripeApiKey");
  const stripeApiKey="Your Strip Api Key ";
  res.status(200).json({success:true,stripeApiKey,});
});

export {processPayment,sendStripeApiKey};
