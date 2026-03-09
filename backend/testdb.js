const mongoose = require('mongoose');
const User = require('./Model/user');

mongoose.connect('mongodb://localhost:27017/studentmanagement')
    .then(async () => {
        console.log("Connected");
        const testId = '69a1ade3891afd89915e3370';
        const user = await User.findOne({ _id: testId });
        console.log("Found user:", user);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
