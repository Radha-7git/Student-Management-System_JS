const studentForm = document.getElementById('student-form');
const studentIdInput = document.getElementById('student-id');
const studentNameInput = document.getElementById('student-name');
const studentDeptInput = document.getElementById('student-department');
const studentMarksInput = document.getElementById('student-marks');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const formTitle = document.getElementById('form-title');
const studentsContainer = document.getElementById('students-container');
const totalCountDisplay = document.getElementById('total-count');
const alertContainer = document.getElementById('alert-container');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');

let students = [];

function init() {
    const storedStudents = localStorage.getItem('students');
    
    if (storedStudents) {
        students = JSON.parse(storedStudents);
    } else {
        students = [
            { id: generateId(), name: "Alice Johnson", department: "Computer Science", marks: 95 },
            { id: generateId(), name: "Bob Smith", department: "Mathematics", marks: 78 },
            { id: generateId(), name: "Charlie Davis", department: "Physics", marks: 88 }
        ];
        saveData();
    }
    
    renderStudents();
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function saveData() {
    localStorage.setItem('students', JSON.stringify(students));
}

function renderStudents(dataToRender = students) {
    studentsContainer.innerHTML = '';
    
    totalCountDisplay.textContent = students.length;

    if (dataToRender.length === 0) {
        studentsContainer.innerHTML = `
            <div class="empty-state">
                <h3>No students found</h3>
                <p>Add a new student to see them here.</p>
            </div>
        `;
        return;
    }

    let maxMarks = -1;
    if (students.length > 0) {
        maxMarks = Math.max(...students.map(s => s.marks));
    }

    dataToRender.forEach(student => {
        const isTopScorer = student.marks === maxMarks && maxMarks > 0;
        
        const card = document.createElement('div');
        card.className = `student-card ${isTopScorer ? 'top-scorer' : ''}`;
        
        card.innerHTML = `
            <div class="card-header">
                <h3>${student.name}</h3>
                <span class="card-dept">${student.department}</span>
            </div>
            <div class="card-body">
                <span class="marks-badge">${student.marks}%</span>
                <div class="card-actions">
                    <button class="btn-small edit-btn" onclick="editStudent('${student.id}')">Edit</button>
                    <button class="btn-small delete-btn" onclick="deleteStudent('${student.id}')">Delete</button>
                </div>
            </div>
        `;
        
        studentsContainer.appendChild(card);
    });
}

function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

studentForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = studentIdInput.value;
    const name = studentNameInput.value.trim();
    const dept = studentDeptInput.value.trim();
    const marks = parseInt(studentMarksInput.value.trim());

    if (!name || !dept || isNaN(marks)) {
        showAlert('Please fill in all fields correctly.', 'error');
        return;
    }

    if (marks < 0 || marks > 100) {
        showAlert('Marks must be between 0 and 100.', 'error');
        return;
    }

    if (id) {
        const index = students.findIndex(s => s.id === id);
        if (index !== -1) {
            students[index] = { id, name, department: dept, marks };
            showAlert('Student updated successfully!');
            resetForm();
        }
    } else {
        const newStudent = {
            id: generateId(),
            name: name,
            department: dept,
            marks: marks
        };
        students.push(newStudent);
        showAlert('Student added successfully!');
        resetForm();
    }
    
    saveData();
    renderStudents();
    
    searchInput.value = '';
    sortSelect.value = 'default';
});

window.deleteStudent = function(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        students = students.filter(student => student.id !== id);
        saveData();
        renderStudents();
        showAlert('Student deleted successfully!', 'success');
        
        if (studentIdInput.value === id) {
            resetForm();
        }
    }
}

window.editStudent = function(id) {
    const student = students.find(s => s.id === id);
    if (student) {
        studentIdInput.value = student.id;
        studentNameInput.value = student.name;
        studentDeptInput.value = student.department;
        studentMarksInput.value = student.marks;
        
        formTitle.textContent = 'Update Student';
        submitBtn.textContent = 'Update';
        cancelEditBtn.classList.remove('hidden');
        
        studentForm.scrollIntoView({ behavior: 'smooth' });
    }
}

function resetForm() {
    studentIdInput.value = '';
    studentForm.reset();
    formTitle.textContent = 'Add New Student';
    submitBtn.textContent = 'Add Student';
    cancelEditBtn.classList.add('hidden');
}

cancelEditBtn.addEventListener('click', resetForm);

searchInput.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm)
    );
    
    applySortAndRender(filteredStudents);
});

sortSelect.addEventListener('change', function() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm)
    );
    
    applySortAndRender(filteredStudents);
});

function applySortAndRender(data) {
    const sortValue = sortSelect.value;
    let result = [...data];
    
    if (sortValue === 'marks-desc') {
        result.sort((a, b) => b.marks - a.marks);
    } else if (sortValue === 'marks-asc') {
        result.sort((a, b) => a.marks - b.marks);
    }
    
    renderStudents(result);
}

document.addEventListener('DOMContentLoaded', init);
