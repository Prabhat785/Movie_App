const mongoose = require('mongoose');

const URI ="mongodb+srv://pk:cC5mnfnqJqC1kEKa@cluster0.ql1o7.mongodb.net/LoginData?retryWrites=true&w=majority";

const connectDB = async () => {
  await mongoose.connect(URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex : true
  });
  console.log('db connected..!');
};
module.exports = connectDB;