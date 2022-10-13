const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const cors = require('cors');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const AppError = require('./utils/appError');

const globalErrorHandler = require('./controllers/errorController');

const app = express();
//Serving static files

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//1) MIDDLEWARES
app.use(express.static(`${__dirname}/public`));
app.use(compression);
app.use(cors());

//Set security HTTP headers
// app.use(helmet());
app.post(
   '/webhook-checkout',
   bodyParser.raw({ type: 'application/json' }),
   bookingController.webhookCheckout
);
//Development logging
if (process.env.NODE_ENV === 'development') {
   app.use(morgan('dev'));
}

//Set limit request
const limiter = rateLimit({
   // Limiting Ip request to prevent BruteForce attacks and DOA attacks.
   max: 100,
   windowMs: 60 * 60 * 1000,
   message: 'Too many request from this IP, please try again in one hour!',
});

app.use('/api', limiter);
app.use(cookieParser());
//Body parser, reading data from body to req.body
app.use(
   express.json({
      extended: true,
      limit: '10kb', //limit the data that comes from request
   })
);

//Data sanitization against NoSQL query Injection
app.use(mongoSanitize()); //removes dolarSigns and dots!
//Data sanitization against CrossSide Attacks
app.use(xss());

//Prevent parameter pollution
app.use(
   hpp({
      whitelist: [
         'duration',
         'ratingsAverage',
         'ratingsQuantity',
         'maxGroupSize',
         'difficulty',
         'price',
      ],
   })
);

//Test middleware
app.use((req, res, next) => {
   req.requestTime = new Date().toISOString();
   next();
});

//2) ROUTES

app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
   next(new AppError(`Can't find ${req.originalUrl} on this server`, 404)); //If we have something passed into next express will assume it is an error!
});

app.use(globalErrorHandler);

module.exports = app;
