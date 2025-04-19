database.ref('enrollments').once('value').then(snapshot => {
    const data = [];
    snapshot.forEach(child => data.push(child.val()));

    document.getElementById('totalParticipants').textContent = data.length;

    const attendance = { present: 0, absent: 0 };
    const eventCounts = {};
    const bloodCounts = {};
    let totalAge = 0;

    data.forEach(p => {
        if (p.attendance) attendance.present++;
        else attendance.absent++;

        eventCounts[p.category] = (eventCounts[p.category] || 0) + 1;
        bloodCounts[p.bloodGroup] = (bloodCounts[p.bloodGroup] || 0) + 1;
        totalAge += parseInt(p.age || 0);
    });

    document.getElementById('attendanceSummary').textContent =
        `Present: ${attendance.present} | Absent: ${attendance.absent}`;

    const eventStats = document.getElementById('eventStats');
    for (let [event, count] of Object.entries(eventCounts)) {
        eventStats.innerHTML += `<li>${event}: ${count}</li>`;
    }

    const bloodStats = document.getElementById('bloodStats');
    for (let [group, count] of Object.entries(bloodCounts)) {
        bloodStats.innerHTML += `<li>${group}: ${count}</li>`;
    }

    const avgAge = data.length > 0 ? (totalAge / data.length).toFixed(1) : 'N/A';
    document.getElementById('averageAge').textContent = avgAge;
});
