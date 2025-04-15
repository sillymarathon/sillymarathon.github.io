// Ensure the admin is logged in
if (sessionStorage.getItem('isAdmin') !== 'true') {
  window.location.href = "login.html";
}

// Logout functionality
document.getElementById('logoutBtn').onclick = function() {
  sessionStorage.removeItem('isAdmin');
  window.location.href = "login.html";
};

// Listen for changes in the 'enrollments' node
database.ref('enrollments').on('value', snapshot => {
  const container = document.getElementById('participantsCards');
  container.innerHTML = ""; // Clear old data

  snapshot.forEach(childSnapshot => {
    const data = childSnapshot.val();
    const id = childSnapshot.key;

    const card = document.createElement('div');
    card.className = 'participant-card';
    card.innerHTML = `
      <h3>${data.fullName}</h3>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Age:</strong> ${data.age}</p>
      <p><strong>Blood Group:</strong> ${data.bloodGroup}</p>
      <p><strong>Event:</strong> ${data.category} (${data.totalCost}₹)</p>
      <p><strong>Attendance:</strong> <span class="attendance-status">${data.attendance ? 'Present' : 'Absent'}</span></p>
      <div class="card-actions">
        <button onclick="updateParticipant('${id}')">Update</button>
        <button onclick="deleteParticipant('${id}')">Delete</button>
        <button onclick="toggleAttendance('${id}')">Toggle Attendance</button>
      </div>
    `;

    container.appendChild(card);
  });
});

// Dummy action handlers

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

document.getElementById('updateForm').addEventListener('submit', function(e) {
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
    attendance: false // Make sure attendance is false when updating
  };

  database.ref('enrollments/' + id).update(updatedData).then(() => {
    closeModal();
    alert('Participant info updated successfully!');
  });
});

// Helper for enrollment cost
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

// Toggle attendance status
function toggleAttendance(id) {
  const participantRef = database.ref('enrollments/' + id);
  
  participantRef.once('value').then(snapshot => {
    const data = snapshot.val();
    const newAttendanceStatus = !data.attendance; // Toggle attendance

    // Update attendance status
    participantRef.update({ attendance: newAttendanceStatus }).then(() => {
      alert('Attendance status updated successfully!');
    }).catch(error => {
      console.error('Error updating attendance status:', error);
    });
  });
}
