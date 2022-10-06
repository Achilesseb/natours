const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

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

const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

const importData = async () => {
   try {
      await User.create(users, { validateBeforeSave: false });
      await Tour.create(tours);
      await Review.create(reviews);
      console.log('Data successfully imported');
   } catch (err) {
      console.log(err.message);
   }
   process.exit();
};

const deleteAllData = async () => {
   try {
      await User.deleteMany();
      await Tour.deleteMany();
      await Review.deleteMany();
      console.log('Data successfully deleted');
   } catch (err) {
      console.log(err.message);
   }
   process.exit();
};

if (process.argv[2] === '--import') {
   importData();
} else if (process.argv[2] === '--delete') {
   deleteAllData();
}
