// Google Apps Script Web App URL
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwvRdopt4e6l4oRtx42KgiQ9IUXFCB9Kv0jdG6IFNQgLy_6kcNo_ZKue7jstifrKj-9PA/exec";

const form = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const totalDisplay = document.getElementById("total");

// Load saved expenses from localStorage
function getExpenses() {
  return JSON.parse(localStorage.getItem("expenses")) || [];
}

function saveExpenses(expenses) {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

function addExpenseToList(entry) {
  const div = document.createElement("div");
  div.className = "expense-item";
  div.innerHTML = `
    <strong>${entry.date}</strong> - ${entry.category} - ₹${entry.amount}
    ${entry.note ? `<br><small>${entry.note}</small>` : ""}
  `;
  expenseList.appendChild(div);
}

function updateTotal() {
  const expenses = getExpenses();
  const total = expenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  totalDisplay.textContent = `₹${total.toFixed(2)}`;
}

// On form submit
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const date = document.getElementById("date").value;
  const category = document.getElementById("category").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const note = document.getElementById("note").value;

  if (!date || !category || isNaN(amount)) {
    return alert("Please fill in all required fields.");
  }

  const newEntry = { date, category, amount, note };

  // 1️⃣ Save to localStorage
  const expenses = getExpenses();
  expenses.push(newEntry);
  saveExpenses(expenses);
  addExpenseToList(newEntry);
  updateTotal();
  form.reset();

  // 2️⃣ Send to Google Sheets (via Google Apps Script Web App)
  fetch(WEB_APP_URL, {
    method: "POST",
    body: JSON.stringify(newEntry),
    headers: {
      "Content-Type": "application/json"
    },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text(); // or response.json() based on the API's response format
    })
    .then(responseText => {
      console.log("✅ Data successfully sent to Google Sheets:", responseText);
    })
    .catch(error => {
      console.error("❌ Error sending data to Google Sheets:", error);
    });
});

// Load expenses on page load
window.addEventListener("DOMContentLoaded", () => {
  const expenses = getExpenses();
  expenses.forEach(addExpenseToList);
  updateTotal();
});
