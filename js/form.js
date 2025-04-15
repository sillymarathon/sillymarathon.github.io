const eventPrices = {
  '5k': 500,
  '10k': 700,
  '20k': 1000,
  '40k': 1200
};

document.getElementById('category').addEventListener('change', function () {
  const selected = this.value;
  const price = eventPrices[selected] || 0;
  document.getElementById('cost').textContent = price;
});

document.getElementById('form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const age = parseInt(document.getElementById('age').value);
  const bloodGroup = document.getElementById('bloodGroup').value.trim();
  const category = document.getElementById('category').value;
  const cost = eventPrices[category] || 0;
  const message = document.getElementById('message');

  if (!fullName || !email || !phone || isNaN(age) || !bloodGroup) {
    message.textContent = 'Please fill all fields correctly.';
    message.style.color = 'red';
    return;
  }

  try {
    // Create a new Firebase entry and get the unique key
    const newEntryRef = database.ref('enrollments').push();
    const userId = newEntryRef.key;

    await newEntryRef.set({
      fullName,
      email,
      phone,
      age,
      bloodGroup,
      category,
      totalCost: cost,
      attendance: false,
      timestamp: new Date().toISOString()
    });

    // Generate the QR code containing the user ID
    const qr = new QRious({
      value: userId,
      size: 250
    });

    // Trigger download of the QR code
    const a = document.createElement('a');
    a.href = qr.toDataURL();
    a.download = `MarathonTicket_${fullName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    message.textContent = `Thanks, ${fullName}! You've enrolled for the ${category.toUpperCase()} event. QR code downloaded!`;
    message.style.color = 'green';
    this.reset();
    document.getElementById('cost').textContent = 0;

  } catch (error) {
    console.error(error);
    message.textContent = 'Something went wrong. Please try again.';
    message.style.color = 'red';
  }
});
