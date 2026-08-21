const form = document.getElementById("transactionForm");

const description = document.getElementById("description");
const amount = document.getElementById("amount");
const type = document.getElementById("type");
const category = document.getElementById("category");
const date = document.getElementById("date");

const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const transactionCount =
    document.getElementById("transactionCount");

const transactionList =
    document.getElementById("transactionList");

const search =
    document.getElementById("search");

const filterType =
    document.getElementById("filterType");

const filterMonth =
    document.getElementById("filterMonth");

const submitButton =
    document.getElementById("submitButton");

const cancelEdit =
    document.getElementById("cancelEdit");

const formTitle =
    document.getElementById("formTitle");

const clearAll =
    document.getElementById("clearAll");


/* Transactions */

let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];

let editingId = null;


/* Charts */

let incomeExpenseChart = null;
let categoryChart = null;


/* Save */

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}


/* Add / Update Transaction */

form.addEventListener("submit", function(event) {

    event.preventDefault();

    const transactionData = {

        description: description.value.trim(),

        amount: Number(amount.value),

        type: type.value,

        category: category.value,

        date: date.value

    };


    /* Edit */

    if (editingId !== null) {

        transactions =
            transactions.map(function(transaction) {

                if (transaction.id === editingId) {

                    return {
                        ...transaction,
                        ...transactionData
                    };

                }

                return transaction;

            });

        editingId = null;

        formTitle.textContent = "Add Transaction";

        submitButton.textContent =
            "Add Transaction";

        cancelEdit.hidden = true;

    }

    /* Add */

    else {

        transactions.push({

            id: Date.now(),

            ...transactionData

        });

    }


    saveTransactions();

    form.reset();

    displayTransactions();

    updateSummary();

    updateCharts();

});


/* Display Transactions */

function displayTransactions() {

    transactionList.innerHTML = "";


    const searchText =
        search.value.toLowerCase().trim();

    const selectedType =
        filterType.value;

    const selectedMonth =
        filterMonth.value;


    const filteredTransactions =
        transactions.filter(function(transaction) {

            const matchesSearch =
                transaction.description
                    .toLowerCase()
                    .includes(searchText) ||

                transaction.category
                    .toLowerCase()
                    .includes(searchText);


            const matchesType =
                selectedType === "all" ||
                transaction.type === selectedType;


            const transactionMonth =
                transaction.date.split("-")[1];

            const matchesMonth =
                selectedMonth === "all" ||
                transactionMonth === selectedMonth;


            return (
                matchesSearch &&
                matchesType &&
                matchesMonth
            );

        });


    if (filteredTransactions.length === 0) {

        transactionList.innerHTML = `
            <p class="empty">
                No transactions found.
            </p>
        `;

        return;
    }


    /* Newest first */

    filteredTransactions
        .slice()
        .reverse()
        .forEach(function(transaction) {

            const element =
                document.createElement("div");

            element.classList.add("transaction");


            const sign =
                transaction.type === "income"
                    ? "+"
                    : "-";


            const amountClass =
                transaction.type === "income"
                    ? "income-amount"
                    : "expense-amount";


            element.innerHTML = `

                <div class="transaction-info">

                    <h4>
                        ${escapeHTML(transaction.description)}
                    </h4>

                    <p>
                        ${escapeHTML(transaction.category)}
                        •
                        ${transaction.date}
                    </p>

                </div>


                <div class="transaction-right">

                    <span class="${amountClass}">
                        ${sign} ₹${transaction.amount}
                    </span>

                    <button
                        class="edit-btn"
                        onclick="editTransaction(${transaction.id})"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteTransaction(${transaction.id})"
                    >
                        Delete
                    </button>

                </div>

            `;


            transactionList.appendChild(element);

        });

}


/* Edit Transaction */

function editTransaction(id) {

    const transaction =
        transactions.find(function(item) {

            return item.id === id;

        });


    if (!transaction) return;


    description.value =
        transaction.description;

    amount.value =
        transaction.amount;

    type.value =
        transaction.type;

    category.value =
        transaction.category;

    date.value =
        transaction.date;


    editingId = id;


    formTitle.textContent =
        "Edit Transaction";

    submitButton.textContent =
        "Update Transaction";

    cancelEdit.hidden = false;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* Cancel Edit */

cancelEdit.addEventListener("click", function() {

    editingId = null;

    form.reset();

    formTitle.textContent =
        "Add Transaction";

    submitButton.textContent =
        "Add Transaction";

    cancelEdit.hidden = true;

});


/* Delete */

function deleteTransaction(id) {

    transactions =
        transactions.filter(function(transaction) {

            return transaction.id !== id;

        });


    saveTransactions();

    displayTransactions();

    updateSummary();

    updateCharts();

}


/* Clear All */

clearAll.addEventListener("click", function() {

    if (transactions.length === 0) {
        return;
    }


    const confirmDelete =
        confirm(
            "Are you sure you want to delete all transactions?"
        );


    if (!confirmDelete) return;


    transactions = [];

    saveTransactions();

    displayTransactions();

    updateSummary();

    updateCharts();

});


/* Summary */

function updateSummary() {

    let totalIncome = 0;
    let totalExpense = 0;


    transactions.forEach(function(transaction) {

        if (transaction.type === "income") {

            totalIncome += transaction.amount;

        } else {

            totalExpense += transaction.amount;

        }

    });


    const currentBalance =
        totalIncome - totalExpense;


    income.textContent =
        `₹${totalIncome}`;

    expense.textContent =
        `₹${totalExpense}`;

    balance.textContent =
        `₹${currentBalance}`;

    transactionCount.textContent =
        transactions.length;

}


/* Search */

search.addEventListener(
    "input",
    displayTransactions
);


/* Filters */

filterType.addEventListener(
    "change",
    displayTransactions
);

filterMonth.addEventListener(
    "change",
    displayTransactions
);


/* Charts */

function updateCharts() {

    let totalIncome = 0;
    let totalExpense = 0;


    const categories = {};

    transactions.forEach(function(transaction) {

        if (transaction.type === "income") {

            totalIncome += transaction.amount;

        } else {

            totalExpense += transaction.amount;


            if (!categories[transaction.category]) {

                categories[transaction.category] = 0;

            }

            categories[transaction.category] +=
                transaction.amount;

        }

    });


    /* Income vs Expense */

    const incomeExpenseCanvas =
        document.getElementById(
            "incomeExpenseChart"
        );


    if (incomeExpenseChart) {

        incomeExpenseChart.destroy();

    }


    incomeExpenseChart =
        new Chart(
            incomeExpenseCanvas,
            {
                type: "doughnut",

                data: {

                    labels: [
                        "Income",
                        "Expense"
                    ],

                    datasets: [{

                        data: [
                            totalIncome,
                            totalExpense
                        ]

                    }]

                },

                options: {

                    responsive: true,

                    plugins: {

                        legend: {
                            position: "bottom"
                        }

                    }

                }

            }
        );


    /* Category Chart */

    const categoryCanvas =
        document.getElementById(
            "categoryChart"
        );


    if (categoryChart) {

        categoryChart.destroy();

    }


    categoryChart =
        new Chart(
            categoryCanvas,
            {
                type: "bar",

                data: {

                    labels:
                        Object.keys(categories),

                    datasets: [{

                        label:
                            "Expenses",

                        data:
                            Object.values(categories)

                    }]

                },

                options: {

                    responsive: true,

                    scales: {

                        y: {

                            beginAtZero: true

                        }

                    }

                }

            }

        );

}


/* Basic HTML safety */

function escapeHTML(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* Initial Load */

displayTransactions();

updateSummary();

updateCharts();