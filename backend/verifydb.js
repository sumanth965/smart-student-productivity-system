const mongoose = require('mongoose');
const User = require('./Model/user');

mongoose.connect('mongodb://localhost:27017/studentmanagement')
    .then(async () => {
        const testId = '69a1ade3891afd89915e3370';
        const student = await User.findOne({ _id: testId, role: 'student' });
        if (student) {
            console.log("Success! Found student:", student.role);
        } else {
            console.log("Failed to find student with role 'student'.");
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
