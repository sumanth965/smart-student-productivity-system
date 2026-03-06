// test-api.js
// Simple test script to verify all backend APIs are working

const BASE_URL = 'http://localhost:5000/api';

async function testApi() {
    try {
        console.log('🧪 Starting API Tests...\n');

        // Test 1: Fetch all students
        console.log('📌 Test 1: GET /api/students');
        const getRes = await fetch(`${BASE_URL}/students`);
        const getData = await getRes.json();
        console.log('Response:', getData);
        console.log('Status:', getRes.status, '\n');

        // Test 2: Create a student
        console.log('📌 Test 2: POST /api/students');
        const createRes = await fetch(`${BASE_URL}/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Student',
                usn: `TST${Date.now()}`,
                rollNo: 'T001',
                phone: '9876543210',
                email: `test${Date.now()}@example.com`,
                class: '12A',
                section: 'A',
                joinYear: '2024',
                passoutYear: '2026',
                status: 'Active',
                createdBy: 'test'
            })
        });
        const createData = await createRes.json();
        console.log('Response:', createData);
        console.log('Status:', createRes.status);

        if (createData.success && createData.data) {
            const studentId = createData.data._id;
            console.log('Created Student ID:', studentId, '\n');

            // Test 3: Get a single student
            console.log('📌 Test 3: GET /api/students/:id');
            const getOneRes = await fetch(`${BASE_URL}/students/${studentId}`);
            const getOneData = await getOneRes.json();
            console.log('Response:', getOneData);
            console.log('Status:', getOneRes.status, '\n');

            // Test 4: Update student
            console.log('📌 Test 4: PUT /api/students/:id');
            const updateRes = await fetch(`${BASE_URL}/students/${studentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: '9999999999',
                    notes: 'Updated via test'
                })
            });
            const updateData = await updateRes.json();
            console.log('Response:', updateData);
            console.log('Status:', updateRes.status, '\n');

            // Test 5: Create a task
            console.log('📌 Test 5: POST /api/tasks');
            const taskRes = await fetch(`${BASE_URL}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Test Task',
                    description: 'This is a test task assignment',
                    subject: 'Mathematics',
                    class: '12A',
                    section: 'A',
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    priority: 'Medium'
                })
            });
            const taskData = await taskRes.json();
            console.log('Response:', taskData);
            console.log('Status:', taskRes.status, '\n');

            // Test 6: Get all tasks
            console.log('📌 Test 6: GET /api/tasks');
            const tasksRes = await fetch(`${BASE_URL}/tasks`);
            const tasksData = await tasksRes.json();
            console.log('Response:', tasksData);
            console.log('Status:', tasksRes.status, '\n');

            // Test 7: Delete student
            console.log('📌 Test 7: DELETE /api/students/:id');
            const deleteRes = await fetch(`${BASE_URL}/students/${studentId}`, {
                method: 'DELETE'
            });
            const deleteData = await deleteRes.json();
            console.log('Response:', deleteData);
            console.log('Status:', deleteRes.status, '\n');
        }

        console.log('✅ All API tests completed!');
    } catch (error) {
        console.error('❌ Test Error:', error);
    }
}

testApi();
