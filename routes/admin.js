const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

router.post('/', (req, res) => {
   
    admin.auth().createUser({
        email: req.body.email,
        password: req.body.password,
      })
        .then((userRecord) => {
            res.send(userRecord);
        })
        .catch((error) => {
            res.status(400).send(error);
        });
});

router.delete('/:id', (req, res) => {
    
    admin.auth().deleteUser(req.params.id)
    .then(function() {
        res.send({
            msg: 'User deleted'
        });
    })
    .catch(function(error) {
        res.status(400).send(error);
    });
});

module.exports = router;