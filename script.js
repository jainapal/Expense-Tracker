let editingRow = null;
let oldTitle, oldAmount, oldDate, oldCategory;
// EXPENSE ADDING
// 1.Sabse pehle, form aur table ke tbody ko access karenge
const expenseForm = document.getElementById('expense-form');
const expenseTableBody = document.querySelector('#expense-table tbody');

// 2.Form submit hone pe function chale
expenseForm.addEventListener('submit', function(event){
    event.preventDefault(); // Page reload hone se rokne ke liye

    // 3. Form ke input values nikal lo
    const title = document.getElementById('title').value;
    const amount = document.getElementById('amount').value;
    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;

    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

    if(editingRow){
        editingRow.querySelector('td:nth-child(1)').textContent = title;
        editingRow.querySelector('td:nth-child(2)').textContent = `₹${amount}`;
        editingRow.querySelector('td:nth-child(3)').textContent = date;
        editingRow.querySelector('td:nth-child(4)').textContent = category;

         // LocalStorage me bhi update karo
        expenses = expenses.filter(expense => 
            !(expense.title === oldTitle &&
              expense.amount == oldAmount &&
              expense.date === oldDate &&
              expense.category === oldCategory)
        );
        //Fir new updated expense ko add karo
        expenses.push({title, amount, date, category});

        editingRow = null;
    }

    else{
        // 4. Naya row banao
    const newRow = document.createElement('tr');

    // 5. Usme 5 cells daalo - title, amount, date, category, actions
    newRow.innerHTML = `
    <td>${title}</td>
    <td>₹${amount}</td>
    <td>${date}</td>
    <td>${category}</td>
    <td>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
    </td>
    `;
    // 6. Row ko table ke body me add karo
    expenseTableBody.appendChild(newRow);
    expenses.push({ title, amount, date, category });
    }

    localStorage.setItem('expenses', JSON.stringify(expenses)); // local storage mai save karo
    
    // 7. Form ko reset karo
    expenseForm.reset();
    updateTotalAmount();
});

// DELETING EXPENSE AND UPDATING TOTAL AMT
expenseTableBody.addEventListener('click', function(event) {
    if (event.target.classList.contains('delete-btn')) {  // Agar click delete button pe hua
        const row = event.target.closest('tr'); // Closest 'tr' ko get karo, jo row hai
        const title = row.children[0].textContent;
        const amount = row.children[1].textContent.replace('₹', '');
        const date = row.children[2].textContent;
        const category = row.children[3].textContent;

        row.remove(); // Us row ko delete karo
        // LocalStorage se bhi delete
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    expenses = expenses.filter(expense => 
        !(expense.title === title && 
          expense.amount == amount &&
          expense.date === date &&
          expense.category === category)
    );
    localStorage.setItem('expenses', JSON.stringify(expenses));

        updateTotalAmount(); // Total amount ko update karo
    }
});
// EDITING EXPENSE
expenseTableBody.addEventListener('click', function(event) {
    if (event.target.classList.contains('edit-btn')) {
        const row = event.target.closest('tr'); // jis row ka edit button click hua
        oldTitle = row.children[0].textContent;
        oldAmount = row.children[1].textContent.replace('₹', '');
        oldDate = row.children[2].textContent;
        oldCategory = row.children[3].textContent;

        // Form me old values bhar do
        document.getElementById('title').value = oldTitle;
        document.getElementById('amount').value = oldAmount;
        document.getElementById('date').value = oldDate;
        document.getElementById('category').value = oldCategory;

        // Save karlo ki kaunsi row edit ho rahi hai
        editingRow = row;
    }
});

// Ctegory Filter dropdown
document.getElementById('filter-category').addEventListener('change', function() {
    const selectedCategory = this.value; // User ne kya select kiya
    const rows = document.querySelectorAll('#expense-table tbody tr');

    rows.forEach(function(row) {
        const categoryCell = row.querySelector('td:nth-child(4)'); // 4th column: Category
        if (selectedCategory === '' || categoryCell.textContent === selectedCategory) {
            row.style.display = ''; // Show row
        } else {
            row.style.display = 'none'; // Hide row
        }
    });
});


function updateTotalAmount() {
    let totalAmount = 0;
    const rows = document.querySelectorAll('#expense-table tbody tr');
    
    rows.forEach(function(row) {
        const amountCell = row.querySelector('td:nth-child(2)'); // Amount wala cell (2nd column)
        const amount = parseFloat(amountCell.textContent.replace('₹', '')); // ₹ hata ke amount ko number me convert karo
        totalAmount += amount; // Total ko add karte raho
    });

    // Update total amount display
    document.getElementById('totalAmount').textContent = totalAmount.toFixed(2);
}
// LOCAL STORAGE SE LOAD EXPENSE
function loadExpensesFromLocalStorage() {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];

    expenses.forEach(function(expense) {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${expense.title}</td>
            <td>₹${expense.amount}</td>
            <td>${expense.date}</td>
            <td>${expense.category}</td>
            <td>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </td>
        `;
        expenseTableBody.appendChild(newRow);
    });

    updateTotalAmount(); // Total amount bhi update kar denge
}

// --- Page load hote hi ye function chalega
window.addEventListener('DOMContentLoaded', loadExpensesFromLocalStorage);

// Sorting Expenses by Amount (Ascending and Descending)
document.getElementById('sort-amount-asc').addEventListener('click', function() {
    sortTableByAmount('asc');
});

document.getElementById('sort-amount-desc').addEventListener('click', function() {
    sortTableByAmount('desc');
});

// Sorting Expenses by Date (Ascending and Descending)
document.getElementById('sort-date-asc').addEventListener('click', function() {
    sortTableByDate('asc');
});

document.getElementById('sort-date-desc').addEventListener('click', function() {
    sortTableByDate('desc');
});

// Function to Sort by Amount
function sortTableByAmount(order) {
    let rows = Array.from(expenseTableBody.rows);
    rows.sort(function(a, b) {
        const amountA = parseFloat(a.cells[1].textContent.replace('₹', ''));
        const amountB = parseFloat(b.cells[1].textContent.replace('₹', ''));
        return order === 'asc' ? amountA - amountB : amountB - amountA;
    });
    rows.forEach(row => expenseTableBody.appendChild(row)); // Reorder the rows
    updateTotalAmount(); // Update the total after sorting
}

// Function to Sort by Date
function sortTableByDate(order) {
    let rows = Array.from(expenseTableBody.rows);
    rows.sort(function(a, b) {
        const dateA = new Date(a.cells[2].textContent);
        const dateB = new Date(b.cells[2].textContent);
        return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
    rows.forEach(row => expenseTableBody.appendChild(row)); // Reorder the rows
    updateTotalAmount(); // Update the total after sorting
}

// Function to create pie chart
function createCategoryChart(expenses) {
    const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Others'];
    let categoryData = {
        'Food': 0,
        'Transport': 0,
        'Shopping': 0,
        'Bills': 0,
        'Others': 0
    };

    // Calculate total for each category
    expenses.forEach(expense => {
        categoryData[expense.category] += parseFloat(expense.amount);
    });

    const ctx = document.getElementById('categoryChart').getContext('2d');
    const categoryChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: Object.values(categoryData),
                backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FF33F6', '#F0E400'],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return `${tooltipItem.label}: ₹${tooltipItem.raw.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}
// Load Data and Create Chart:
const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
createCategoryChart(expenses); // Call to render the chart

function getMonthlySpending(expenses, monthOffset = 0) {
    const today = new Date();
    const targetMonth = new Date(today.setMonth(today.getMonth() - monthOffset)); // Current or previous month

    let total = 0;
    expenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        if (expenseDate.getMonth() === targetMonth.getMonth() && expenseDate.getFullYear() === targetMonth.getFullYear()) {
            total += parseFloat(expense.amount);
        }
    });
    return total;
}
function displaySpendingInsight() {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const currentMonthTotal = getMonthlySpending(expenses);
    const previousMonthTotal = getMonthlySpending(expenses, 1);

    const percentageChange = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;

    let insightMessage = `Total spending for this month is ₹${currentMonthTotal.toFixed(2)}. `;
    if (percentageChange > 0) {
        insightMessage += `You've spent ${percentageChange.toFixed(2)}% more compared to last month.`;
    } else if (percentageChange < 0) {
        insightMessage += `You've saved ${Math.abs(percentageChange).toFixed(2)}% compared to last month.`;
    } else {
        insightMessage += `Your spending is the same as last month.`;
    }

    document.getElementById('spendingInsight').textContent = insightMessage;
}
window.addEventListener('DOMContentLoaded', function() {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    
    // Call these functions after loading data
    createCategoryChart(expenses);
    displaySpendingInsight();
});


// Dark Mode Toggle Functionality
const darkModeToggle = document.getElementById('dark-mode-toggle');
const body = document.body;

// Check if dark mode was previously saved in localStorage
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('dark-mode') === 'enabled') {
        body.classList.add('dark-mode');
        darkModeToggle.classList.replace('fa-moon', 'fa-sun'); // Change icon to sun when dark mode is enabled
    }
  });

// Toggle dark mode on icon click
darkModeToggle.addEventListener('click', function() {
    body.classList.toggle('dark-mode');

    // Toggle the icon between moon and sun
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('dark-mode', 'enabled');
        darkModeToggle.classList.replace('fa-moon', 'fa-sun'); // Switch to sun icon
    } else {
        localStorage.setItem('dark-mode', 'disabled');
        darkModeToggle.classList.replace('fa-sun', 'fa-moon'); // Switch to moon icon
    }
});




