const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '請輸入您的名稱'],
  },
  email: {
    type: String,
    required: [true, '請輸入您的Email'],
    unique: true,
    lowercase: true,
    select: false,
  },
  photo: String,
  sex:{
    type: String,
    enum:["male","female"]
  },
  image: String,
  password:{
    type: String,
    required: [true,'請輸入密碼'],
    minlength: 8,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    select: false
  }
}, {versionKey: false})

// const User_Schema = new mongoose.Schema(
//   userSchema,
//   {
//     versionKey: false,
//   }
// )

const User = mongoose.model('User', userSchema);

module.exports = User;