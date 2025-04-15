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

document.getElementById('form').addEventListener('submit', function (e) {
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

  const entry = database.ref('enrollments').push();
  entry.set({
    fullName,
    email,
    phone,
    age,
    bloodGroup,
    category,
    totalCost: cost,
    timestamp: new Date().toISOString()
  })
    .then(() => {
      message.textContent = `Thanks, ${fullName}! You've enrolled for the ${category.toUpperCase()} event.`;
      message.style.color = 'green';
      this.reset();
      document.getElementById('cost').textContent = 0;
    })
    .catch(error => {
      console.error(error);
      message.textContent = 'Something went wrong. Please try again.';
      message.style.color = 'red';
    });
});
