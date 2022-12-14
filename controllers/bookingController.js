const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const factory = require('./handlerFactory');
const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
   //1. Get currently booked store
   const tour = await Tour.findById(req.params.tourID);
   //2. Create checkout sessions
   const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get('host')}/`,
      cancel_url: `${req.protocol}://${req.get('host')}/our/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourID,
      currency: 'ron',
      line_items: [
         {
            quantity: 1,
            price_data: {
               currency: 'ron',
               unit_amount: tour.price * 100,
               product_data: {
                  name: tour.name,
                  description: tour.summary,
               },
            },
         },
      ],
   });

   //3. Create sessions as response
   res.status(200).json({
      status: 'success',
      session,
   });
});
const createBookingCheckout = async (session) => {
   const tour = session.client_reference_id;
   const user = (await User.findOne({ email: session.customer_email })).id;
   const price = session.display_items[0].amount / 100;
   await Booking.create({ tour, user, price });
};
exports.webhookCheckout = (req, res, next) => {
   const signature = req.headers['stripe-signature'];

   let event;
   try {
      event = stripe.webhooks.constructEvent(
         req.body,
         signature,
         process.env.STRIPE_WEBHOOK_SECRET
      );
   } catch (err) {
      return res.status(400).send(`Webhook error: ${err.message}`);
   }

   if (event.type === 'checkout.session.completed') createBookingCheckout(event.data.object);

   res.status(200).json({ received: true });
};
exports.createBooking = factory.addNewOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
