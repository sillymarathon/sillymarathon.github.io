// Ensure the admin is logged in
if (sessionStorage.getItem('isAdmin') !== 'true') {
    window.location.href = "login.html";
}

document.getElementById('logoutBtn').onclick = function () {
    sessionStorage.removeItem('isAdmin');
    window.location.href = "login.html";
};

const filterType = document.getElementById('filterType');
const filterValue = document.getElementById('filterValue');
const container = document.getElementById('participantsCards');
const searchInput = document.getElementById('searchInput');

let allData = [];

// Load data from Firebase
database.ref('enrollments').on('value', snapshot => {
    allData = [];
    container.innerHTML = "";

    snapshot.forEach(childSnapshot => {
        let data = childSnapshot.val();
        data.id = childSnapshot.key;
        allData.push(data);
    });

    populateFilterOptions(allData);
    renderCards(allData);
});

// Render participant cards with optional highlight
function renderCards(dataArray, highlight = "") {
    container.innerHTML = "";

    const regex = highlight ? new RegExp(`(${highlight})`, "gi") : null;

    dataArray.forEach(data => {
        const fullName = data.fullName || '';
        const userId = data.userID || '';
        const email = data.email || '';
        const phone = data.phone || '';

        const highlightedFullName = highlight ? fullName.replace(regex, "<mark>$1</mark>") : fullName;
        const highlightedUserId = highlight ? userId.replace(regex, "<mark>$1</mark>") : userId;
        const highlightedEmail = highlight ? email.replace(regex, "<mark>$1</mark>") : email;
        const highlightedPhone = highlight ? phone.replace(regex, "<mark>$1</mark>") : phone;

        const card = document.createElement('div');
        card.className = 'participant-card';
        card.innerHTML = `
            <h3>${highlightedFullName}</h3>
            <p><strong>User ID:</strong> ${highlightedUserId || 'N/A'}</p>
            <p><strong>Email:</strong> ${highlightedEmail}</p>
            <p><strong>Phone:</strong> ${highlightedPhone}</p>
            <p><strong>Age:</strong> ${data.age}</p>
            <p><strong>Blood Group:</strong> ${data.bloodGroup}</p>
            <p><strong>Event:</strong> ${data.category} (${data.totalCost}₹)</p>
            <p><strong>Attendance:</strong> 
                <span class="attendance-status ${data.attendance ? '' : 'absent'}">
                    ${data.attendance ? 'Present' : 'Absent'}
                </span>
            </p>
            <div class="card-actions">
                <button onclick="updateParticipant('${data.id}')">Update</button>
                <button onclick="deleteParticipant('${data.id}')">Delete</button>
                <button onclick="toggleAttendance('${data.id}')">Toggle Attendance</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// 🔍 Real-time search listener
searchInput.addEventListener('input', function () {
    const query = this.value.trim().toLowerCase();

    if (!query) {
        renderCards(allData);
        return;
    }

    const results = allData.filter(participant => {
        const fullName = participant.fullName?.toLowerCase() || '';
        const userId = participant.userID?.toLowerCase() || '';
        const email = participant.email?.toLowerCase() || '';
        const phone = participant.phone?.toLowerCase() || '';

        return (
            fullName.includes(query) ||
            userId.includes(query) ||
            email.includes(query) ||
            phone.includes(query)
        );
    });

    renderCards(results, query);
});

function populateFilterOptions(dataArray) {
    const categories = ["fullName", "bloodGroup", "age", "category", "attendance"];
    filterType.innerHTML = `<option value="">Select Category</option>`;
    categories.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        filterType.appendChild(option);
    });
}

// Filter handling
filterType.addEventListener('change', function () {
    const selected = this.value;

    if (!selected) {
        filterValue.disabled = true;
        renderCards(allData);
        return;
    }

    const uniqueValues = [...new Set(allData.map(item => item[selected]))];
    filterValue.innerHTML = `<option value="">Select Value</option>`;
    uniqueValues.forEach(val => {
        const option = document.createElement('option');
        option.value = val;
        option.textContent = selected === 'attendance' ? (val ? 'Present' : 'Absent') : val;
        filterValue.appendChild(option);
    });

    filterValue.disabled = false;
});

filterValue.addEventListener('change', function () {
    const type = filterType.value;
    const value = this.value;

    if (!type || !value) {
        renderCards(allData);
    } else {
        const filtered = allData.filter(item => {
            if (type === 'attendance') {
                return String(item[type]) === String(value === 'Present' || value === 'true');
            }
            return String(item[type]) === value;
        });
        renderCards(filtered);
    }
});

function resetFilter() {
    filterType.value = "";
    filterValue.innerHTML = `<option value="">Select a type first</option>`;
    filterValue.disabled = true;
    renderCards(allData);
}

// Participant update
function updateParticipant(id) {
    database.ref('enrollments/' + id).once('value').then(snapshot => {
        const data = snapshot.val();
        document.getElementById('updateId').value = id;
        document.getElementById('updateFullName').value = data.fullName;
        document.getElementById('updateEmail').value = data.email;
        document.getElementById('updatePhone').value = data.phone;
        document.getElementById('updateAge').value = data.age;
        document.getElementById('updateBloodGroup').value = data.bloodGroup;
        document.getElementById('updateCategory').value = data.category;
        document.getElementById('updateModal').style.display = 'block';
    });
}

function closeModal() {
    document.getElementById('updateModal').style.display = 'none';
}

document.getElementById('updateForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const id = document.getElementById('updateId').value;
    const updatedData = {
        fullName: document.getElementById('updateFullName').value,
        email: document.getElementById('updateEmail').value,
        phone: document.getElementById('updatePhone').value,
        age: document.getElementById('updateAge').value,
        bloodGroup: document.getElementById('updateBloodGroup').value,
        category: document.getElementById('updateCategory').value,
        totalCost: calculateCost(document.getElementById('updateCategory').value),
        attendance: false
    };

    database.ref('enrollments/' + id).update(updatedData).then(() => {
        closeModal();
        alert('Participant info updated successfully!');
    });
});

function calculateCost(category) {
    switch (category) {
        case '5k': return 500;
        case '10k': return 700;
        case '20k': return 1000;
        case '40k': return 1200;
        default: return 0;
    }
}

function deleteParticipant(id) {
    if (confirm('Are you sure you want to delete this registration?')) {
        database.ref('enrollments/' + id).remove();
    }
}

function toggleAttendance(id) {
    const participantRef = database.ref('enrollments/' + id);
    participantRef.once('value').then(snapshot => {
        const data = snapshot.val();
        const newAttendance = !data.attendance;
        participantRef.update({ attendance: newAttendance }).then(() => {
            alert('Attendance status updated!');
        }).catch(error => {
            console.error('Error updating attendance:', error);
        });
    });
}
