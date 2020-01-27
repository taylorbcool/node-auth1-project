const bcrypt = require('bcryptjs')
const router = require('express').Router()

const Users = require('../users/users-model')

router.post('/register', (req, res) => {
  const user = req.body
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      res.status(500).json({ error: 'there was a problem creating hash' })
    } else {
      user.password = hash
      .then(res => {
        res.json(user)
      })
      .catch(err => {
        res.json(err, { error: 'there was a problem after generating hash'} )
      })
    }
  })

  Users.add(user)
    .then(registered => {
      res.status(201).json(registered)
    })
    .catch(err => {
      res.status(500).json({ error: 'there was a problem registering user'})
    })
})

router.post('/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user) {
      bcrypt.compare(password, user.password, (err, res))
        .then(match => {
          if (match) {
            res.status(200).json(match) // good password
          } else {
            res.status(401).json({ message: 'you shall not pass' })  // they don't match
          }
        })
        .catch(err => {
          res.status(500).json({ err: 'error logging in' })
        })
      } else {
        res.status(401).json({ message: "you shall not pass" });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

router.get('/users', (req, res) => {
  if (req.headers.authorization) {
    bcrypt.hash(req.headers.authorization, 8, (err, hash) => {
      if (err) {
        res.status(500).json({ err: 'problem hashing' });
      } else {
        res.status(200).json({ hash });
        Users.find()
          .then(users => {
            res.status(200).json(users)
          })
          .catch(err => {
            res.status(500).json({ error: 'problem getting users' })
          })
      }
    });
  } else {
    res.status(400).json({ error: "missing header" });
  }
})