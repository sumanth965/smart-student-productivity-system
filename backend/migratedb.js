const mongoose = require('mongoose');
const User = require('./Model/user');

mongoose.connect('mongodb://localhost:27017/studentmanagement')
    .then(async () => {
        console.log("Connected to DB");

        // Set bypassing validation true as enum might be strict if any
        const res = await User.collection.updateMany(
            { role: 'user' },
            { $set: { role: 'student' } }
        );
        console.log("Updated users:", res.modifiedCount);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
