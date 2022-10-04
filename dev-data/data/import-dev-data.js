const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const dotenv = require('dotenv');
const fs = require('fs');

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

const tours = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

const importData = async () => {
   try {
      await User.create(tours);
      console.log('Data successfully imported');
   } catch (err) {
      console.log(err.message);
   }
   process.exit();
};

const deleteAllData = async () => {
   try {
      await User.deleteMany();
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
