const form = document.getElementById("transactionForm");

const description = document.getElementById("description");
const amount = document.getElementById("amount");
const type = document.getElementById("type");
const category = document.getElementById("category");
const date = document.getElementById("date");

const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

const transactionList =
    document.getElementById("transactionList");

const filter = document.getElementById("filter");


/* Get saved transactions */

let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];


/* Add Transaction */

form.addEventListener("submit", function (event) {

    event.preventDefault();

    const transaction = {

        id: Date.now(),

        description: description.value,

        amount: Number(amount.value),

        type: type.value,

        category: category.value,

        date: date.value

    };

    transactions.push(transaction);

    saveTransactions();

    form.reset();

    displayTransactions();

    updateSummary();

});


/* Save transactions */

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}


/* Display transactions */

function displayTransactions() {

    transactionList.innerHTML = "";

    const selectedFilter = filter.value;

    const filteredTransactions =
        transactions.filter(function (transaction) {

            if (selectedFilter === "all") {
                return true;
            }

            return transaction.type === selectedFilter;

        });


    /* No transactions */

    if (filteredTransactions.length === 0) {

        transactionList.innerHTML = `
            <p class="empty">
                No transactions found.
            </p>
        `;

        return;
    }


    /* Create transaction */

    filteredTransactions.forEach(function (transaction) {

        const transactionElement =
            document.createElement("div");

        transactionElement.classList.add("transaction");


        const sign =
            transaction.type === "income"
                ? "+"
                : "-";


        const amountClass =
            transaction.type === "income"
                ? "income-amount"
                : "expense-amount";


        transactionElement.innerHTML = `

            <div class="transaction-info">

                <h4>
                    ${transaction.description}
                </h4>

                <p>
                    ${transaction.category}
                    •
                    ${transaction.date}
                </p>

            </div>


            <div class="transaction-right">

                <span class="${amountClass}">
                    ${sign} ₹${transaction.amount}
                </span>

                <button
                    class="delete-btn"
                    onclick="deleteTransaction(${transaction.id})"
                >
                    Delete
                </button>

            </div>

        `;


        transactionList.appendChild(
            transactionElement
        );

    });

}


/* Delete transaction */

function deleteTransaction(id) {

    transactions =
        transactions.filter(function (transaction) {

            return transaction.id !== id;

        });


    saveTransactions();

    displayTransactions();

    updateSummary();

}


/* Update Summary */

function updateSummary() {

    let totalIncome = 0;
    let totalExpense = 0;


    transactions.forEach(function (transaction) {

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

}


/* Filter */

filter.addEventListener(
    "change",
    displayTransactions
);


/* Initial Load */

displayTransactions();

updateSummary();