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
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        const normalizedLoginId = typeof loginId === 'string' ? loginId.trim() : '';

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
        if (normalizedLoginId) {
            const existingLogin = await User.findOne({ loginId: normalizedLoginId });
            if (existingLogin) {
                return res.status(409).json({ success: false, message: 'This login ID is already in use' });
            }
        }

        // Create new student
        const newStudent = new User({
            name,
            usn: usn.toUpperCase(),
            phone: phone || '',
            // Keep optional unique fields undefined when blank to avoid duplicate key errors on empty strings
            email: normalizedEmail || undefined,
            class: cls || 'BCA',
            section: section || 'A',
            rollNo,
            joinYear: joinYear || new Date().getFullYear().toString(),
            passoutYear: passoutYear || (parseInt(new Date().getFullYear()) + 1).toString(),
            parentPhone: parentPhone || '',
            status: status || 'Active',
            notes: notes || '',
            loginId: normalizedLoginId || name.toUpperCase(),
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

        // If status is being updated, sync isActive field
        if (updates.status) {
            updates.isActive = updates.status === 'Active';
        }

        // Ensure USN is uppercase if provided
        if (updates.usn) {
            updates.usn = updates.usn.toUpperCase();
        }

        const updatedStudent = await User.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        })
            .select('-password')
            .populate('assignedTasks');

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
            { $pull: { assignedTo: id }, $inc: { assignedCount: -1 } }
        );

        return res.status(200).json({
            success: true,
            message: 'Student deleted successfully',
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
            .populate('createdBy', 'name email role')
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
        const { title, description, subject, class: cls, section, dueDate, priority, assignedTo, assignedCount, createdBy } = req.body;

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
            assignedCount: assignedCount || studentIds.length,
            createdBy: req.userId || createdBy || null,
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
            { path: 'createdBy', select: 'name email role' },
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

// CREATE self-assigned task for a student
exports.createStudentSelfTask = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { title, description, subject, dueDate, priority } = req.body;

        if (!title || !description || !subject || !dueDate) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, subject, and dueDate are required',
            });
        }

        const student = await User.findOne({ _id: studentId, role: 'student' });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const selfTask = new Task({
            title,
            description,
            subject,
            class: student.class || 'All',
            section: student.section || 'All',
            dueDate: new Date(dueDate),
            priority: priority || 'Medium',
            assignedTo: [studentId],
            assignedCount: 1,
            createdBy: studentId,
            status: 'Pending',
        });

        await selfTask.save();

        await User.findByIdAndUpdate(studentId, { $push: { assignedTasks: selfTask._id } });

        await selfTask.populate([
            { path: 'assignedTo', select: 'name email usn class section' },
            { path: 'createdBy', select: 'name email role' },
        ]);

        return res.status(201).json({
            success: true,
            message: 'Self task created successfully',
            data: selfTask,
        });
    } catch (error) {
        console.error('Error creating self task:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// GET tasks by student ID
exports.getStudentTasks = async (req, res) => {
    try {
        const { studentId } = req.params;

        const tasks = await Task.find({
            $or: [
                { assignedTo: studentId },
                { createdBy: studentId },
            ],
        })
            .populate('createdBy', 'name email role')
            .sort({ createdAt: -1 });

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

// UPDATE task
exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            status,
            completedBy,
            title,
            description,
            subject,
            class: cls,
            section,
            dueDate,
            priority,
        } = req.body;

        const updates = {};
        if (status) updates.status = status;
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (subject !== undefined) updates.subject = subject;
        if (cls !== undefined) updates.class = cls;
        if (section !== undefined) updates.section = section;
        if (priority !== undefined) updates.priority = priority;
        if (dueDate !== undefined) updates.dueDate = new Date(dueDate);
        if (completedBy) {
            updates.$addToSet = { completedBy };
        }

        const updatedTask = await Task.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        })
            .populate('assignedTo', 'name email usn class section')
            .populate('createdBy', 'name email role');

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
