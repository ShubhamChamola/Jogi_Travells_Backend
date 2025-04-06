const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const stripeRoutes = require('./routes/stripeRoutes'); // my stripe routes used in api
const YOUR_DOMAIN = process.env.YOUR_DOMAIN


// Middleware
app.use(cors({
  origin: YOUR_DOMAIN, // Allow only your React app's origin
  methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
  credentials: true, // Allow cookies or other credentials
}));

app.use(bodyParser.json());

// Routes
app.use('/stripe/', stripeRoutes);

app.get('/', (req, res) => {
  res.send({
    greet: "hello"
  })
})

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
