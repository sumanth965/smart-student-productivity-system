// API_ENDPOINTS.md
// Backend API Documentation for AWT Project

/**
 * BASE URL: http://localhost:5000
 * All endpoints are prefixed with /api
 */

// ═════════════════════════════════════════════════════════════════════════════
// STUDENT MANAGEMENT ENDPOINTS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/students
 * Description: Fetch all students
 * Response: {
 *   success: boolean,
 *   count: number,
 *   data: Array<Student>
 * }
 */

/**
 * GET /api/students/:id
 * Description: Fetch a specific student by ID
 * Response: {
 *   success: boolean,
 *   data: Student
 * }
 */

/**
 * POST /api/students
 * Description: Create a new student
 * Body: {
 *   name: string (required),
 *   usn: string (required, unique),
 *   phone: string,
 *   email: string,
 *   class: '11A' | '11B' | '12A' | '12B',
 *   section: 'A' | 'B' | 'C',
 *   rollNo: string (required),
 *   joinYear: string,
 *   passoutYear: string,
 *   parentPhone: string,
 *   status: 'Active' | 'Suspended',
 *   notes: string,
 *   loginId: string (optional, auto-generated if not provided),
 *   password: string (optional, auto-generated if not provided),
 *   createdBy: string
 * }
 * Response: {
 *   success: boolean,
 *   message: string,
 *   data: Student
 * }
 */

/**
 * PUT /api/students/:id
 * Description: Update a student
 * Body: {
 *   name?: string,
 *   phone?: string,
 *   email?: string,
 *   class?: string,
 *   section?: string,
 *   rollNo?: string,
 *   joinYear?: string,
 *   passoutYear?: string,
 *   parentPhone?: string,
 *   status?: string,
 *   notes?: string
 * }
 * Note: Password and loginId cannot be updated through this endpoint
 * Response: {
 *   success: boolean,
 *   message: string,
 *   data: Student
 * }
 */

/**
 * DELETE /api/students/:id
 * Description: Delete a student
 * Response: {
 *   success: boolean,
 *   message: string,
 *   data: Student (deleted student)
 * }
 */

// ═════════════════════════════════════════════════════════════════════════════
// TASK ASSIGNMENT ENDPOINTS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/tasks
 * Description: Fetch all tasks
 * Response: {
 *   success: boolean,
 *   count: number,
 *   data: Array<Task>
 * }
 */

/**
 * POST /api/tasks
 * Description: Create and assign a new task to students
 * Body: {
 *   title: string (required),
 *   description: string (required),
 *   subject: string (required),
 *   class: 'All' | '11A' | '11B' | '12A' | '12B' (default: 'All'),
 *   section: 'All' | 'A' | 'B' | 'C' (default: 'All'),
 *   dueDate: string (ISO date format, required),
 *   priority: 'Low' | 'Medium' | 'High' (default: 'Medium'),
 *   assignedTo?: Array<studentId> (optional, auto-filters if not provided)
 * }
 * Response: {
 *   success: boolean,
 *   message: string,
 *   data: Task
 * }
 */

/**
 * GET /api/students/:studentId/tasks
 * Description: Fetch tasks assigned to a specific student
 * Response: {
 *   success: boolean,
 *   count: number,
 *   data: Array<Task>
 * }
 */

/**
 * PUT /api/tasks/:id
 * Description: Update a task status
 * Body: {
 *   status?: 'Pending' | 'In Progress' | 'Completed',
 *   completedBy?: studentId
 * }
 * Response: {
 *   success: boolean,
 *   message: string,
 *   data: Task
 * }
 */

/**
 * DELETE /api/tasks/:id
 * Description: Delete a task
 * Response: {
 *   success: boolean,
 *   message: string
 * }
 */

// ═════════════════════════════════════════════════════════════════════════════
// DATABASE SCHEMA
// ═════════════════════════════════════════════════════════════════════════════

/**
 * STUDENT (User) SCHEMA:
 * {
 *   _id: ObjectId,
 *   name: string,
 *   email?: string,
 *   password: string (hashed),
 *   usn: string,
 *   loginId: string,
 *   role: 'student' | 'teacher' | 'admin',
 *   isActive: boolean,
 *   phone?: string,
 *   rollNo?: string,
 *   class?: '11A' | '11B' | '12A' | '12B',
 *   section?: 'A' | 'B' | 'C',
 *   joinYear?: string,
 *   passoutYear?: string,
 *   parentPhone?: string,
 *   status?: 'Active' | 'Suspended',
 *   notes?: string,
 *   createdBy?: string,
 *   assignedTasks?: Array<TaskId>,
 *   createdAt: Date,
 *   updatedAt: Date
 * }
 */

/**
 * TASK SCHEMA:
 * {
 *   _id: ObjectId,
 *   title: string,
 *   description: string,
 *   subject: string,
 *   class: 'All' | '11A' | '11B' | '12A' | '12B',
 *   section: 'All' | 'A' | 'B' | 'C',
 *   dueDate: Date,
 *   priority: 'Low' | 'Medium' | 'High',
 *   assignedTo: Array<StudentId>,
 *   assignedCount: number,
 *   createdBy: UserId (optional),
 *   completedBy: Array<StudentId>,
 *   status: 'Pending' | 'In Progress' | 'Completed',
 *   createdAt: Date,
 *   updatedAt: Date
 * }
 */

// ═════════════════════════════════════════════════════════════════════════════
// ERROR RESPONSES
// ═════════════════════════════════════════════════════════════════════════════

/**
 * All error responses follow this format:
 * {
 *   success: false,
 *   message: string,
 *   error?: string
 * }
 *
 * Common HTTP Status Codes:
 * - 200: Success
 * - 201: Created
 * - 400: Bad Request (missing/invalid fields)
 * - 404: Not Found
 * - 409: Conflict (duplicate USN/loginId)
 * - 500: Server Error
 */
