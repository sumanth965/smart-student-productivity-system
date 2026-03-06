const express = require('express');
const router = express.Router();
const studentCtrl = require('../Controllers/studentCtrl');

// ═════════════════════════════════════════════════════════════════════════════
// STUDENT ROUTES
// ═════════════════════════════════════════════════════════════════════════════

// GET all students
router.get('/students', studentCtrl.getAllStudents);

// GET student by ID
router.get('/students/:id', studentCtrl.getStudentById);

// CREATE new student
router.post('/students', studentCtrl.createStudent);

// UPDATE student
router.put('/students/:id', studentCtrl.updateStudent);

// DELETE student
router.delete('/students/:id', studentCtrl.deleteStudent);

// ═════════════════════════════════════════════════════════════════════════════
// TASK ROUTES
// ═════════════════════════════════════════════════════════════════════════════

// GET all tasks
router.get('/tasks', studentCtrl.getAllTasks);

// CREATE new task (assign to students)
router.post('/tasks', studentCtrl.createTask);

// GET tasks by student ID
router.get('/students/:studentId/tasks', studentCtrl.getStudentTasks);

// UPDATE task
router.put('/tasks/:id', studentCtrl.updateTask);

// DELETE task
router.delete('/tasks/:id', studentCtrl.deleteTask);

module.exports = router;
