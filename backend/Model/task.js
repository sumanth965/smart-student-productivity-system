const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        class: {
            type: String,
            enum: ['All', '11A', '11B', '12A', '12B'],
            default: 'All',
        },
        section: {
            type: String,
            enum: ['All', 'A', 'B', 'C'],
            default: 'All',
        },
        dueDate: {
            type: Date,
            required: true,
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium',
        },
        assignedTo: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        assignedCount: {
            type: Number,
            default: 0,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        completedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Completed'],
            default: 'Pending',
        },
    },
    { timestamps: true }
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
