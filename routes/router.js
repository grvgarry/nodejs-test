let express = require('express');
let router = express.Router();
let userController = require('../controller/controller');

router.get('/all', userController.authentication, userController.getAllUser);
router.get('/:id', userController.authentication, userController.getUser);
router.post('/update', userController.authentication, userController.update);
router.post('/login', userController.login);
router.post('/create', userController.create);
router.delete('/:id', userController.authentication, userController.delete);
router.post('/logout', userController.authentication, userController.logout);
router.post('/forgotpassword', userController.forgotPassword);
router.post('/resetpassword', userController.resetPassword);

module.exports = router;

// Gaurav Ganger