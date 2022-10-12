/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
// const Stripe = require('stripe');
const stripe = Stripe(
   'pk_test_51LrhRIL07EofuiMMbxeClLISZfvQ39q5OFkmeZK928RtPiEGSAQhNMc1pc1H1FB5SWVELlFcSTGt6EkyChJwSCdt001VUTHVNA'
);

export const bookTour = async (tourId) => {
   try {
      // 1) Get checkout session from API
      const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

      // 2) Create checkout form + chanre credit card
      await stripe.redirectToCheckout({
         sessionId: session.data.session.id,
      });
   } catch (err) {
      showAlert('error', err);
   }
};
