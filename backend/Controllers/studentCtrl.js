const User = require('../Model/user');
const Task = require('../Model/task');

// ═════════════════════════════════════════════════════════════════════════════
// STUDENT CONTROLLER ENDPOINTS
// ═════════════════════════════════════════════════════════════════════════════

// GET all students
exports.getAllStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select('-password')
            .populate('assignedTasks')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: students.length,
            data: students,
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// GET student by ID
exports.getStudentById = async (req, res) => {
    try {
        const student = await User.findById(req.params.id)
            .select('-password')
            .populate('assignedTasks');

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        return res.status(200).json({ success: true, data: student });
    } catch (error) {
        console.error('Error fetching student:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// CREATE new student
exports.createStudent = async (req, res) => {
    try {
        const { name, usn, phone, email, class: cls, section, rollNo, joinYear, passoutYear, parentPhone, status, notes, loginId, password, createdBy } = req.body;

        // Validate required fields
        if (!name || !usn || !rollNo) {
            return res.status(400).json({ success: false, message: 'Name, USN, and Roll No are required' });
        }

        // Check if USN already exists
        const existingStudent = await User.findOne({ usn: usn.toUpperCase() });
        if (existingStudent) {
            return res.status(409).json({ success: false, message: 'A student with this USN already exists' });
        }

        // Check if loginId already exists
        if (loginId) {
            const existingLogin = await User.findOne({ loginId });
            if (existingLogin) {
                return res.status(409).json({ success: false, message: 'This login ID is already in use' });
            }
        }

        // Create new student
        const newStudent = new User({
            name,
            usn: usn.toUpperCase(),
            phone: phone || '',
            email: email || '',
            class: cls || '12A',
            section: section || 'A',
            rollNo,
            joinYear: joinYear || new Date().getFullYear().toString(),
            passoutYear: passoutYear || (parseInt(new Date().getFullYear()) + 1).toString(),
            parentPhone: parentPhone || '',
            status: status || 'Active',
            notes: notes || '',
            loginId: loginId || name.toUpperCase(),
            password: password || `${usn.toUpperCase()}@2026`,
            role: 'student',
            createdBy: createdBy || 'teacher',
            isActive: status === 'Active',
        });

        await newStudent.save();

        return res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: newStudent.toObject({ versionKey: false }),
        });
    } catch (error) {
        console.error('Error creating student:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// UPDATE student
exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };

        // Don't allow updates to loginId or password through this endpoint
        delete updates.loginId;
        delete updates.password;

        // Normalize USN if provided
        if (updates.usn) {
            updates.usn = updates.usn.toUpperCase();

            // Check for duplicate USN
            const existingStudent = await User.findOne({ usn: updates.usn, _id: { $ne: id } });
            if (existingStudent) {
                return res.status(409).json({ success: false, message: 'A student with this USN already exists' });
            }
        }

        // Update isActive based on status
        if (updates.status) {
            updates.isActive = updates.status === 'Active';
        }

        const updatedStudent = await User.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        }).select('-password');

        if (!updatedStudent) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Student updated successfully',
            data: updatedStudent,
        });
    } catch (error) {
        console.error('Error updating student:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// DELETE student
exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedStudent = await User.findByIdAndDelete(id);

        if (!deletedStudent) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Also remove this student from any assigned tasks
        await Task.updateMany(
            { assignedTo: id },
            { $pull: { assignedTo: id } }
        );

        return res.status(200).json({
            success: true,
            message: 'Student deleted successfully',
            data: deletedStudent,
        });
    } catch (error) {
        console.error('Error deleting student:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ═════════════════════════════════════════════════════════════════════════════
// TASK CONTROLLER ENDPOINTS
// ═════════════════════════════════════════════════════════════════════════════

// GET all tasks
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('assignedTo', 'name email usn class section')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks,
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// CREATE new task (assign to students)
exports.createTask = async (req, res) => {
    try {
        const { title, description, subject, class: cls, section, dueDate, priority, assignedTo, assignedCount } = req.body;

        // Validate required fields
        if (!title || !description || !subject || !dueDate) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, subject, and dueDate are required',
            });
        }

        // If assignedTo not provided, fetch students based on class/section filters
        let studentIds = assignedTo || [];

        if (studentIds.length === 0) {
            const query = { role: 'student', status: 'Active' };

            if (cls && cls !== 'All') {
                query.class = cls;
            }
            if (section && section !== 'All') {
                query.section = section;
            }

            const students = await User.find(query).select('_id');
            studentIds = students.map((s) => s._id);
        }

        // Create new task
        const newTask = new Task({
            title,
            description,
            subject,
            class: cls || 'All',
            section: section || 'All',
            dueDate: new Date(dueDate),
            priority: priority || 'Medium',
            assignedTo: studentIds,
            assignedCount: studentIds.length,
            createdBy: req.userId || null,
            status: 'Pending',
        });

        await newTask.save();

        // Add task to students' assignedTasks
        await User.updateMany(
            { _id: { $in: studentIds } },
            { $push: { assignedTasks: newTask._id } }
        );

        await newTask.populate([
            { path: 'assignedTo', select: 'name email usn class section' },
            { path: 'createdBy', select: 'name email' },
        ]);

        return res.status(201).json({
            success: true,
            message: `Task assigned to ${studentIds.length} students`,
            data: newTask,
        });
    } catch (error) {
        console.error('Error creating task:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// GET tasks by student ID
exports.getStudentTasks = async (req, res) => {
    try {
        const { studentId } = req.params;

        const tasks = await Task.find({ assignedTo: studentId })
            .populate('createdBy', 'name email')
            .sort({ dueDate: 1 });

        return res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks,
        });
    } catch (error) {
        console.error('Error fetching student tasks:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// UPDATE task status
exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, completedBy } = req.body;

        const updates = {};
        if (status) updates.status = status;
        if (completedBy) {
            updates.$push = { completedBy };
        }

        const updatedTask = await Task.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        })
            .populate('assignedTo', 'name email usn class section')
            .populate('createdBy', 'name email');

        if (!updatedTask) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: updatedTask,
        });
    } catch (error) {
        console.error('Error updating task:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// DELETE task
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedTask = await Task.findByIdAndDelete(id);

        if (!deletedTask) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Remove task from students' assignedTasks
        await User.updateMany(
            { _id: { $in: deletedTask.assignedTo } },
            { $pull: { assignedTasks: id } }
        );

        return res.status(200).json({
            success: true,
            message: 'Task deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
