const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (req, res) => {
  const { adultGuests, childrenGuests, infantGuests, fullName, email} = req.body;
  console.log(fullName);
  
  const calculateOrderAmount = () => {
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    let total =
      (adultGuests * 880 + childrenGuests * 500 + infantGuests * 200) * 100;
    return total;
  };

  console.log(
    "Payment Intent requested for amount(in USD):",
    calculateOrderAmount() / 100
  );

  // Create a PaymentIntent with the order amount and currency
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(), // this amount will be divided by 100. An example of final amount is  ---> 1100/100 = 11USD
      currency: "usd",
      payment_method_types: ["card"],
      metadata: {
        adultGuests:adultGuests, 
        childrenGuests:childrenGuests, 
        infantGuests:infantGuests,
        totalGuests: adultGuests + childrenGuests + infantGuests,
        date:new Date().toISOString(),
        fullName: fullName,
        email: email,
      }
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
      paymentId: paymentIntent.id
    });

    console.log("Successfully sent client secret and paymentId is--->", paymentIntent.id);
  } catch (e) {
    res.send({
      status: 400,
      errorMessage: `A payment error occurred: ${e.message}`,
    });

    switch (e.type) {
      case "StripeCardError":
        console.log(`A payment error occurred: ${e.message}`);
        break;
      case "StripeInvalidRequestError":
        console.log("An invalid request occurred.");
        break;
      default:
        console.log("Another problem occurred, maybe unrelated to Stripe.");
        break;
    }
  }
};

exports.getPaymentDetails = async (req, res) => {
  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: "Payment ID is required." });
  }

  console.log("Retrieving payment details for--->", paymentId);

  try {
    // Retrieve the payment intent using the payment ID
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

    // Extract details from the payment intent
    const { amount, metadata, id} = paymentIntent;
    
    // Construct the booking details
    const bookingDetails = {
      paymentId: id,
      amount: (amount / 100).toFixed(2), // Convert amount from cents to dollars (or other currency)
      name: metadata.fullName,  // Metadata contains additional info like name (if provided)
      email: metadata.email ,
      guests: metadata.totalGuests,
      date: metadata.date, // Default to current date if not provided
    };
    
    res.status(200).json(bookingDetails); // Send the booking details to the client
  } catch (error) {
    console.error("Error retrieving payment details:", error.message);
    res.status(500).json({ error: "Failed to retrieve payment details." });
  }
};

