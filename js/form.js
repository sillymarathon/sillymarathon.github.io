// Event Prices Map
const eventPrices = {
  '5k': 500,
  '10k': 700,
  '20k': 1000,
  '40k': 1200
};

const form = document.getElementById('form');
const message = document.getElementById('message');
const costDisplay = document.getElementById('cost');

// Update total cost when event selection changes
document.getElementById('category').addEventListener('change', function () {
  const selected = this.value;
  const price = eventPrices[selected] || 0;
  costDisplay.textContent = price;
});

// Handle form submission
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const age = parseInt(document.getElementById('age').value);
  const bloodGroup = document.getElementById('bloodGroup').value;
  const category = document.getElementById('category').value;
  const totalCost = eventPrices[category] || 0;
  const agreed = document.getElementById('agree')?.checked;

  // Validate form fields
  if (!fullName || !email || !phone || isNaN(age) || age <= 0 || !bloodGroup || !category) {
    message.textContent = '❌ Please fill all fields correctly.';
    message.style.color = 'red';
    return;
  }

  if (!agreed) {
    message.textContent = '❌ You must agree to the terms and conditions.';
    message.style.color = 'red';
    return;
  }

  try {
    // Reference to Firebase
    const newEntryRef = firebase.database().ref('enrollments').push();
    const userId = newEntryRef.key;

    const userData = {
      fullName,
      email,
      phone,
      age,
      bloodGroup,
      category,
      totalCost,
      attendance: false,
      timestamp: new Date().toISOString()
    };

    console.log("Submitting userData:", userData);

    // Save data to Firebase
    await newEntryRef.set(userData);

    // Generate QR Code with userId as the code value
    const qr = new QRious({
      value: userId,
      size: 150,
      background: '#ffffff',
      foreground: '#000000',
      level: 'H'
    });

    // Auto-download the generated QR Code
    const link = document.createElement('a');
    link.href = qr.toDataURL();
    link.download = `${fullName.replace(/\s+/g, '_')}_QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Success message
    message.innerHTML = `✅ Thanks, ${fullName}! You've enrolled for the ${category.toUpperCase()} event.<br>Your QR Code has been downloaded.`;
    message.style.color = 'green';

    form.reset();
    costDisplay.textContent = '0';

  } catch (error) {
    console.error('Error submitting form:', error);
    message.textContent = '❌ Something went wrong. Please try again.';
    message.style.color = 'red';
  }
});
