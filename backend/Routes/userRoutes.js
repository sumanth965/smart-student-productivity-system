const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
} = require('../Controllers/userCtrl');

// Post routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Get routes
router.get('/users', getUsers);
router.get('/users/:id', getUserById);

// Put routes
router.put('/users/:id', updateUser);

// Delete routes
router.delete('/users/:id', deleteUser);

module.exports = router;
