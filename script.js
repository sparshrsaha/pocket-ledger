// ---------- Data (saved in the browser using localStorage) ----------
const CATEGORIES = ["Food", "Travel", "Study", "Fun", "Other"];
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let budget = Number(localStorage.getItem("budget")) || 5000;

// ---------- Page elements ----------
const form = document.getElementById("form");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const budgetInput = document.getElementById("budget");
const searchBox = document.getElementById("search");
const filterCat = document.getElementById("filterCat");
const list = document.getElementById("list");
const breakdown = document.getElementById("breakdown");
const leftText = document.getElementById("left");
const spentText = document.getElementById("spentText");
const barFill = document.getElementById("barFill");
const themeBtn = document.getElementById("themeBtn");
const clearBtn = document.getElementById("clearBtn");

// ---------- Helper functions ----------
function money(n) {
  return "₹" + n.toLocaleString("en-IN");
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function save() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
  localStorage.setItem("budget", budget);
}

function totalSpent() {
  let total = 0;
  for (const e of expenses) {
    total += e.amount;
  }
  return total;
}

// ---------- Drawing the page ----------
function renderSummary() {
  const spent = totalSpent();
  const left = budget - spent;
  const percent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 100;

  if (left >= 0) {
    leftText.textContent = money(left);
  } else {
    leftText.textContent = "Over by " + money(-left);
  }

  spentText.textContent = money(spent) + " spent of " + money(budget);
  barFill.style.width = percent + "%";

  // Bar turns red when 80% or more of the budget is used
  if (percent >= 80) {
    barFill.classList.add("warn");
  } else {
    barFill.classList.remove("warn");
  }
}

function renderBreakdown() {
  const spent = totalSpent();
  breakdown.innerHTML = "";

  for (const cat of CATEGORIES) {
    let sum = 0;
    for (const e of expenses) {
      if (e.category === cat) sum += e.amount;
    }
    const width = spent > 0 ? (sum / spent) * 100 : 0;

    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML =
      '<div class="row-top"><span>' + cat + "</span><span>" + money(sum) + "</span></div>" +
      '<div class="track"><div class="fill" style="width:' + width + '%"></div></div>';
    breakdown.appendChild(row);
  }
}

function renderList() {
  const cat = filterCat.value;
  const text = searchBox.value.toLowerCase();

  // Keep only expenses that match the filter and search, newest first
  const shown = expenses
    .filter(function (e) {
      const catMatch = cat === "All" || e.category === cat;
      const textMatch = e.title.toLowerCase().includes(text);
      return catMatch && textMatch;
    })
    .sort(function (a, b) {
      return b.date.localeCompare(a.date);
    });

  list.innerHTML = "";

  if (shown.length === 0) {
    list.innerHTML = '<li class="empty">No expenses yet. Add your first one above.</li>';
    return;
  }

  for (const e of shown) {
    const li = document.createElement("li");

    const info = document.createElement("div");
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = e.title; // textContent keeps user input safe
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = e.category + " · " + e.date;
    info.appendChild(name);
    info.appendChild(meta);

    const right = document.createElement("div");
    const amt = document.createElement("span");
    amt.className = "amt";
    amt.textContent = money(e.amount) + " ";
    const del = document.createElement("button");
    del.className = "del";
    del.textContent = "Delete";
    del.dataset.id = e.id;
    right.appendChild(amt);
    right.appendChild(del);

    li.appendChild(info);
    li.appendChild(right);
    list.appendChild(li);
  }
}

function render() {
  renderSummary();
  renderBreakdown();
  renderList();
}

// ---------- Events ----------
form.addEventListener("submit", function (event) {
  event.preventDefault();

  const expense = {
    id: Date.now(),
    title: titleInput.value.trim(),
    amount: Number(amountInput.value),
    category: categoryInput.value,
    date: dateInput.value
  };

  if (expense.title === "" || expense.amount <= 0) return;

  expenses.push(expense);
  save();
  form.reset();
  dateInput.value = today();
  render();
});

// One listener on the list handles every Delete button
list.addEventListener("click", function (event) {
  if (event.target.classList.contains("del")) {
    const id = Number(event.target.dataset.id);
    expenses = expenses.filter(function (e) {
      return e.id !== id;
    });
    save();
    render();
  }
});

budgetInput.addEventListener("input", function () {
  budget = Number(budgetInput.value) || 0;
  save();
  renderSummary();
});

searchBox.addEventListener("input", renderList);
filterCat.addEventListener("change", renderList);

clearBtn.addEventListener("click", function () {
  if (expenses.length > 0 && confirm("Delete all expenses?")) {
    expenses = [];
    save();
    render();
  }
});

themeBtn.addEventListener("click", function () {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("dark", isDark);
  themeBtn.textContent = isDark ? "Light mode" : "Dark mode";
});

// ---------- Start ----------
if (localStorage.getItem("dark") === "true") {
  document.body.classList.add("dark");
  themeBtn.textContent = "Light mode";
}
budgetInput.value = budget;
dateInput.value = today();
render();
