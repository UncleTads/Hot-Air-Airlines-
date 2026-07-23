// Global State
const state = {
  currentUser: null,
  currentBooking: null,
  currentMeal: null,
  currentPayment: null,
  // Enterprise Module State
  crewRoster: [
    { id: "C101", name: "Capt. Sarah Jenkins", role: "Pilot", status: "Available", flightHoursThisMonth: 62, maxHours: 100 },
    { id: "C102", name: "First Officer Mark Ross", role: "Co-Pilot", status: "Available", flightHoursThisMonth: 85, maxHours: 100 },
    { id: "C103", name: "Cute Erin Mhlanga", role: "Cabin Crew Lead", status: "Rest Period", flightHoursThisMonth: 98, maxHours: 100 },
    { id: "C110", name: "Capt. Ngonidzashe Chitombo", role: "Pilot", status: "Leave", flightHoursThisMonth: 120, maxHours: 100 },
    { id: "C132", name: "First Officer Blessing Masuku", role: "Co-Pilot", status: "Available", flightHoursThisMonth: 99, maxHours: 100 },
    { id: "C113", name: "Mufaro Moyo", role: "Cabin Crew Lead", status: "Unavailable", flightHoursThisMonth: 98, maxHours: 100 }
  ],
  operationalMetrics: {
    loadFactor: "84.2%",
    onTimePerformance: "92.8%",
    revPAS: "$142.50",
    activeFlights: 14
  }
};

const STAFF_CREDENTIALS = {
  username: "admin",
  password: "HotAir2026!"
};

// Navigation Manager & Background Switcher
function navigateTo(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  // Dynamically update the body background image according to current page
  document.body.className = `bg-${pageId}`;

  updateNavUI();
}

function updateNavUI() {
  const navLinks = document.getElementById('nav-links');
  if (state.currentUser) {
    navLinks.innerHTML = `
      <span>User: <strong>${state.currentUser.username}</strong></span>
      <a onclick="logout()">Logout</a>
    `;
  } else {
    navLinks.innerHTML = `
      <a onclick="navigateTo('page-welcome')">Home</a>
      <a onclick="openModal('login-modal')">Sign In</a>
    `;
  }
}

// Notification Toast Engine
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Modal Controllers
function openModal(modalId) {
  document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// Dynamic Pricing Engine for Flights
function calculateDynamicPrice() {
  const flyFrom = document.getElementById('fly-from').value;
  const flyTo = document.getElementById('fly-to').value;
  const departDate = document.getElementById('depart-date').value;
  const passengers = parseInt(document.getElementById('passengers').value) || 1;
  const cabinClass = document.getElementById('cabin-class').value;

  let basePrice = 200;
  let demandMultiplier = 1.0;

  if (departDate) {
    const daysUntilFlight = Math.ceil((new Date(departDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilFlight < 7) {
      demandMultiplier = 1.6;
    } else if (daysUntilFlight < 30) {
      demandMultiplier = 1.25;
    }
  }

  let classMultiplier = 1.0;
  if (cabinClass === 'Business Class') classMultiplier = 2.5;
  if (cabinClass === 'First Class') classMultiplier = 4.0;

  const calculatedTotal = Math.round((basePrice * demandMultiplier * classMultiplier) * passengers);

  document.getElementById('demand-indicator').textContent = `${demandMultiplier}x Yield Index`;
  document.getElementById('dash-demand-index').textContent = `${demandMultiplier}x Yield Index`;
  document.getElementById('calculated-price').textContent = calculatedTotal;

  return calculatedTotal;
}

// Dining Subtotal Calculation
function calculateTotalOrder() {
  const mealSelect = document.getElementById('meal-option');
  const beverageSelect = document.getElementById('beverage-option');

  const mealPrice = mealSelect.options[mealSelect.selectedIndex]?.dataset.price || 0;
  const beveragePrice = beverageSelect.options[beverageSelect.selectedIndex]?.dataset.price || 0;

  const foodSubtotal = parseInt(mealPrice) + parseInt(beveragePrice);
  document.getElementById('food-subtotal').textContent = foodSubtotal;

  return foodSubtotal;
}

// 1. Staff Login Engine
function handleStaffLogin(event) {
  event.preventDefault();
  const user = document.getElementById('staff-user').value.trim();
  const pass = document.getElementById('staff-pass').value.trim();

  if (user === STAFF_CREDENTIALS.username && pass === STAFF_CREDENTIALS.password) {
    state.currentUser = { username: "Staff Administrator", type: "staff" };
    closeModal('staff-modal');
    showToast("Staff Access Granted.", "success");
    
    renderStaffDashboard();
    navigateTo('page-dashboard');
  } else {
    showToast("Invalid Staff Credentials.", "error");
  }
}

function renderStaffDashboard() {
  document.getElementById('dashboard-title').textContent = "Staff Operations & Analytics Management";
  
  const crewRows = state.crewRoster.map(c => `
    <tr>
      <td>${c.id}</td>
      <td><strong>${c.name}</strong></td>
      <td>${c.role}</td>
      <td>
        <span class="status-pill ${c.status === 'Available' ? 'success' : 'warning'}">
          ${c.status}
        </span>
      </td>
      <td>${c.flightHoursThisMonth} / ${c.maxHours} hrs</td>
      <td>
        <button class="btn btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.8rem;" 
                onclick="assignCrewMember('${c.id}')">
          Assign Flight
        </button>
      </td>
    </tr>
  `).join('');

  document.getElementById('dashboard-content').innerHTML = `
    <div class="metrics-grid">
      <div class="metric-card">
        <h4>Average Load Factor</h4>
        <div class="value">${state.operationalMetrics.loadFactor}</div>
      </div>
      <div class="metric-card">
        <h4>On-Time Performance</h4>
        <div class="value">${state.operationalMetrics.onTimePerformance}</div>
      </div>
      <div class="metric-card">
        <h4>RevPAS (Yield)</h4>
        <div class="value">${state.operationalMetrics.revPAS}</div>
      </div>
      <div class="metric-card">
        <h4>Active Airborne Flights</h4>
        <div class="value">${state.operationalMetrics.activeFlights}</div>
      </div>
    </div>

    <div style="margin-top: 2rem;">
      <h3>Crew Management & Regulation Compliance</h3>
      <p style="font-size:0.9rem; color:#64748b;">Flight Time Limitations (FAA/EASA Compliance Tracking)</p>
      
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Crew ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Compliance Status</th>
              <th>Monthly Flight Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${crewRows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function assignCrewMember(crewId) {
  const member = state.crewRoster.find(c => c.id === crewId);
  if (member.flightHoursThisMonth >= member.maxHours) {
    showToast(`Compliance Alert: ${member.name} exceeds flight time limits!`, "error");
  } else {
    showToast(`Assigned ${member.name} to flight leg.`, "success");
  }
}

// 2. Guest Registration & Login
function handleGuestSignUp(event) {
  event.preventDefault();

  const user = {
    username: document.getElementById('reg-username').value.trim(),
    id: document.getElementById('reg-id').value.trim(),
    email: document.getElementById('reg-email').value.trim(),
    pass: document.getElementById('reg-password').value.trim(),
    contact: document.getElementById('reg-contact').value.trim(),
    gender: document.getElementById('reg-gender').value,
    country: document.getElementById('reg-country').value.trim(),
    address: document.getElementById('reg-address').value.trim(),
    type: 'guest'
  };

  if (Object.values(user).some(val => val === '')) {
    showToast("Please fill out all required registration fields.", "error");
    return;
  }

  localStorage.setItem(`user_${user.email}`, JSON.stringify(user));
  state.currentUser = user;
  
  closeModal('signup-modal');
  showToast("Account created successfully! Proceeding to Flight Booking...", "success");

  navigateTo('page-booking');
}

function handleGuestLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value.trim();

  const storedUser = localStorage.getItem(`user_${email}`);

  if (storedUser) {
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.pass === pass) {
      state.currentUser = parsedUser;
      closeModal('login-modal');
      showToast("Signed in successfully!", "success");
      navigateTo('page-booking');
      return;
    }
  }
  
  showToast("Authentication failed. Invalid email or password.", "error");
}

function logout() {
  state.currentUser = null;
  state.currentBooking = null;
  state.currentMeal = null;
  state.currentPayment = null;
  showToast("Logged out.", "success");
  navigateTo('page-welcome');
}

// 3. Step 1: Flight Booking Form Handler
function handleBookingSubmit(event) {
  event.preventDefault();

  const flyFrom = document.getElementById('fly-from').value;
  const flyTo = document.getElementById('fly-to').value;
  const departDate = document.getElementById('depart-date').value;
  const passengers = document.getElementById('passengers').value;
  const cabinClass = document.getElementById('cabin-class').value;

  if (!flyFrom || !flyTo || !departDate) {
    showToast("Please fill in all mandatory flight selection fields.", "error");
    return;
  }

  if (flyFrom === flyTo) {
    showToast("Origin and Destination cannot be identical.", "error");
    return;
  }

  const flightPrice = calculateDynamicPrice();

  state.currentBooking = {
    pnr: "NDC-" + Math.floor(100000 + Math.random() * 900000),
    flyFrom,
    flyTo,
    departDate,
    passengers,
    cabinClass,
    flightPrice
  };

  showToast("Flight reserved! Now please pick your in-flight meals.", "success");
  navigateTo('page-food');
}

// 4. Step 2: In-Flight Meal Selection Handler
function handleFoodSubmit(event) {
  event.preventDefault();

  const mealOption = document.getElementById('meal-option').value;
  const beverageOption = document.getElementById('beverage-option').value;
  const dietaryNotes = document.getElementById('dietary-notes').value.trim();

  // Strict Blank Space Check Notification
  if (!mealOption || !beverageOption) {
    showToast("Blank space detected! All meal and beverage fields must be filled out.", "error");
    return;
  }

  const foodCost = calculateTotalOrder();

  state.currentMeal = {
    mealOption,
    beverageOption,
    dietaryNotes,
    foodCost
  };

  // Consolidate Total Price (Flight + Food)
  const combinedGrandTotal = state.currentBooking.flightPrice + state.currentMeal.foodCost;

  // Prepare Consolidated Payment Summary
  document.getElementById('booking-summary').innerHTML = `
    <h3>Consolidated Invoice [PNR: ${state.currentBooking.pnr}]</h3>
    <p><strong>Route:</strong> ${state.currentBooking.flyFrom} ➔ ${state.currentBooking.flyTo}</p>
    <p><strong>Class:</strong> ${state.currentBooking.cabinClass} (${state.currentBooking.passengers} pax) - <strong>$${state.currentBooking.flightPrice}</strong></p>
    <p><strong>Dining Choice:</strong> ${mealOption} & ${beverageOption} - <strong>$${foodCost}</strong></p>
    <hr style="margin: 0.5rem 0; border: 0; border-top: 1px solid var(--border);">
    <p style="font-size: 1.2rem; color: var(--primary);"><strong>Total Combined Amount Due: $${combinedGrandTotal}</strong></p>
  `;

  document.getElementById('pay-button').textContent = `Pay Total Sum ($${combinedGrandTotal})`;

  showToast("Meal preferences saved! Proceeding to payment.", "success");
  navigateTo('page-payment');
}

// 5. Step 3: Consolidated Payment Handler
function handlePaymentSubmit(event) {
  event.preventDefault();

  const cardName = document.getElementById('card-name').value.trim();
  const cardNumber = document.getElementById('card-number').value.trim();
  const expDate = document.getElementById('exp-date').value.trim();
  const cvv = document.getElementById('cvv').value.trim();

  // Blank space validation check
  if (!cardName || !cardNumber || !expDate || !cvv) {
    showToast("Information missing! All payment fields must be filled.", "error");
    return;
  }

  if (cardNumber.length < 16) {
    showToast("Invalid card number length.", "error");
    return;
  }

  const grandTotal = state.currentBooking.flightPrice + state.currentMeal.foodCost;
  state.currentPayment = { cardName, lastFour: cardNumber.slice(-4), grandTotal };

  // Final Confirmation Rendering
  document.getElementById('dashboard-title').textContent = "Ticket & Dining Receipt";
  document.getElementById('dashboard-content').innerHTML = `
    <div style="text-align: center; margin-bottom: 1.5rem;">
      <h3 style="color: var(--success);">🎉 Flight & Dining Paid Successfully!</h3>
      <p>Thank you for choosing Hot Air Airlines, ${state.currentUser ? state.currentUser.username : 'Guest'}.</p>
    </div>
    
    <div class="summary-box">
      <h4>Electronic Ticket & Boarding Pass</h4>
      <p><strong>PNR Reference:</strong> ${state.currentBooking.pnr}</p>
      <p><strong>Itinerary:</strong> ${state.currentBooking.flyFrom} ➔ ${state.currentBooking.flyTo}</p>
      <p><strong>Departure Date:</strong> ${state.currentBooking.departDate}</p>
      <p><strong>Class:</strong> ${state.currentBooking.cabinClass}</p>
    </div>

    <div class="summary-box" style="border-left-color: var(--accent);">
      <h4>Confirmed Meal Options</h4>
      <p><strong>Meal Choice:</strong> ${state.currentMeal.mealOption}</p>
      <p><strong>Beverage Choice:</strong> ${state.currentMeal.beverageOption}</p>
      <p><strong>Special Instructions:</strong> ${state.currentMeal.dietaryNotes || 'None'}</p>
    </div>

    <div class="summary-box" style="border-left-color: var(--success);">
      <h4>Payment Clearance</h4>
      <p><strong>Total Sum Paid:</strong> $${grandTotal}</p>
      <p><strong>Cardholder:</strong> ${cardName} (Ending in ****${cardNumber.slice(-4)})</p>
    </div>
  `;

  showToast("Transaction complete! Ticket issued.", "success");
  navigateTo('page-dashboard');
}

// Initial Boot
document.addEventListener('DOMContentLoaded', () => {
  navigateTo('page-welcome');
});