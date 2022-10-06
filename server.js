/* eslint-disable no-console */
const mongoose = require('mongoose');

const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
   // when there is an uncaught exception we must shut down the app because node is in an unclean state! Process must be terminated and restart! In production some tool to do that!
   console.log(err.name, err.message);
   console.log('Uncaught Exception! Shutting down...');
   //give the server time to end what processes need to run then shut down the app!
   process.exit(1); //uncaught exception
});

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
   .connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
   })
   .then(() => {
      console.log('DB connection successful');
   });

const app = require('./app');

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
   console.log(`App running on port ${port}... `);
});

process.on('unhandledRejection', (err) => {
   console.log(err.name, err.message);
   console.log('Unhandled Rejection! Shutting down...');
   server.close(() => {
      //give the server time to end what processes need to run then shut down the app!
      process.exit(1); //uncaught exception
   });
});
