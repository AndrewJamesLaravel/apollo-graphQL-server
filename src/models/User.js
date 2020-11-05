const mongoose = require('mongoose')
const Joi = require('joi')

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50,
  },
  email: {
    type: String,
    minlength: 5,
    maxlength: 255,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
})

const User = mongoose.model('User', schema)

const validateUser = (user) => {
  return Joi.object({
    name: Joi.string().alphanum().min(1).max(50).required(),
    email: Joi.string().required().email(),
    password: Joi.string().min(5).max(60).required(),
  }).validate(user)
}

exports.User = User
exports.validateUser = validateUser
