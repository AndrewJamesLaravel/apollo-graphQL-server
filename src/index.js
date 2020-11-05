const { ApolloServer, UserInputError } = require('apollo-server')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const lodash = require('lodash')
const fs = require('fs')
const path = require('path')
const bcrypt = require("bcrypt");
const { Character, validateCharacter } = require('./models/Character')
const { User, validateUser } = require('./models/User')

mongoose.connect('mongodb://localhost/nuxtseries-db',
    {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});

const resolvers = {
  Query: {
    characters: () => Character.find({}, (error, characters) => {
      if (error) console.log('error', error)
        return characters
    }),
    character: (_, { id }) => Character.findById(id, (error, character) => {
        if (error) console.log('error', error)
          return character
    })
  },
  Mutation: {
    addCharacter(_, payload) {
      const { value, error } = validateCharacter(payload, { abortEarly: false })
        if (error) {
          throw new UserInputError('Failed to create a character due to validation errors', {
            validationErrors: error.details
          })
        }
      return Character.create(value)
    },
    async signup(_, {user}) {
      const {value, error} = validateUser(user, {abortEarly: false})
      if (error) {
        throw new UserInputError('Failed to create a user due to validation errors', {
          validationErrors: error.details
        })
      }
      const password = await bcrypt.hash(user.password, 10)
      const registerUser = await User.create({
        ...value,
        password
      })
      const token = await jwt.sign({
        _id: registerUser._id
      }, 'topSecret')
      return {
        token,
        user: lodash.pick(user, ['name', 'email'])
      }
    }
  }
}

const server = new ApolloServer({
  typeDefs: fs.readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8'),
  resolvers })

server.listen().then(({ url }) => {
  console.log(`Server is running at ${url}`)
})
