const express = require('express');
const { createPaymentIntent, getPaymentDetails } = require('../controllers/stripeController');
const router = express.Router();

// Route for creating a payment intent
router.post('/create-payment-intent', createPaymentIntent);
router.post('/get-payment-details', getPaymentDetails);

module.exports = router;