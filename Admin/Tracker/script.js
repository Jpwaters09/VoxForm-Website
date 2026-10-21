let currentUser = null;
let isManager = null;
let lastMonthStart;
let currentIncomeId = null;
let currentExpenseId = null;

async function init() {
    const res = await fetch('../login.php');
    const data = await res.json();

    if (!data.loggedIn) {
        window.location.href = "../login.html";
        return;
    }

    currentUser = data;
    document.getElementById("usernameText").innerHTML = `Logged in as <strong>${currentUser.username}</strong>`;

    isManager = currentUser.isManager;

    loadIncome();
}

init();

let formatPrice = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
});

async function loadIncome() {
    const res = await fetch('../getIncome.php');
    const data = await res.json();

    let income = data[0];
    let expenses = data[1];
    let paidMonths = data[2];

    let incomeTableBody = document.getElementById("incomeTableBody");
    let expenseTableBody = document.getElementById("expenseTableBody");

    let logPaymentsBtn = document.getElementById("logPaymentsBtn");

    let receiving = document.getElementById("receiving");
    let profit = document.getElementById("profit");
    let sending = document.getElementById("sending");

    const today = new Date();

    let lastMonthPaid = false;
    
    paidMonths.forEach(month => {
        let d = new Date(month.date).toLocaleDateString('en-CA');
        let prevDate = new Date(today.getFullYear(), today.getMonth() - 1, 1).toLocaleDateString('en-CA');
        let currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1).toLocaleDateString('en-CA');

        if (month.paid_by == currentUser.username && d >= prevDate && d < currentMonthStart) {
            lastMonthPaid = true;
        }
    });

    lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const profitStart = thisMonthStart.toLocaleDateString('en-CA');
    const profitEnd = nextMonthStart.toLocaleDateString('en-CA');

    const payStart = (lastMonthPaid ? thisMonthStart : lastMonthStart).toLocaleDateString('en-CA');
    const payEnd = (lastMonthPaid ? nextMonthStart : thisMonthStart).toLocaleDateString('en-CA');

    const fmtMonth = d => d.toLocaleString('en-GB', { month: 'long', year: 'numeric' });

    profit.textContent = `Profit from 1st ${fmtMonth(thisMonthStart)}`;

    if (lastMonthPaid) {
        receiving.textContent = `Receiving on 1st ${fmtMonth(nextMonthStart)}`;
        sending.textContent = `Sending on 1st ${fmtMonth(nextMonthStart)}`;
        logPaymentsBtn.style.display = "none";
    }

    else {
        receiving.textContent = `Receiving for ${fmtMonth(lastMonthStart)} (Needs Paying)`;
        sending.textContent = `Sending for ${fmtMonth(lastMonthStart)} (Needs Paying)`;
        logPaymentsBtn.style.display = "";
    }

    let jwRecv = 0;
    let mtRecv = 0;
    let jcRecv = 0;

    let jwProfit = 0;
    let mtProfit = 0;
    let jcProfit = 0;

    let jwToMt = 0;
    let jwToJc = 0;
    let mtToJw = 0;
    let mtToJc = 0;
    let jcToJw = 0;
    let jcToMt = 0;

    expenses.forEach(e => {
        let tr = document.createElement("tr");
        expenseTableBody.appendChild(tr);

        let expenseId = document.createElement("td");
        let description = document.createElement("td");
        let category = document.createElement("td");
        let createdBy = document.createElement("td");
        let amount = document.createElement("td");
        let expenseDate = document.createElement("td");

        tr.appendChild(expenseId);
        tr.appendChild(description);
        tr.appendChild(category);
        tr.appendChild(createdBy);
        tr.appendChild(amount);
        tr.appendChild(expenseDate);

        tr.onclick = () => addExpense(e.id, e.description, e.category, parseFloat(e.amount_pence / 100), e.expense_date);

        expenseId.textContent = e.id;
        description.textContent = e.description;
        category.textContent = e.category;
        createdBy.textContent = e.created_by;
        amount.textContent = formatPrice.format(parseFloat(e.amount_pence / 100));
        expenseDate.textContent = new Date(e.expense_date).toLocaleDateString('en-CA');

        let expenseDay = e.expense_date.slice(0, 10);
        let inProfit = (expenseDay >= profitStart && expenseDay < profitEnd) ? 1 : 0;
        let inPay = (expenseDay >= payStart && expenseDay < payEnd) ? 1 : 0;

        let amount1 = parseInt(e.amount_pence);
        let partnerShare = Math.floor(amount1 / 3);
        let payerShare = amount1 - partnerShare * 2;

        if (e.created_by == "Jacob Waters") {
            jwProfit -= payerShare * inProfit;
            mtProfit -= partnerShare * inProfit;
            jcProfit -= partnerShare * inProfit;

            mtToJw += partnerShare * inPay;
            jcToJw += partnerShare * inPay;

            jwRecv += partnerShare * 2 * inPay;
        }

        else if (e.created_by == "Matthew Taylor") {
            mtProfit -= payerShare * inProfit;
            jwProfit -= partnerShare * inProfit;
            jcProfit -= partnerShare * inProfit;

            jwToMt += partnerShare * inPay;
            jcToMt += partnerShare * inPay;

            mtRecv += partnerShare * 2 * inPay;
        }

        else if (e.created_by == "James Colley") {
            jcProfit -= payerShare * inProfit;
            jwProfit -= partnerShare * inProfit;
            mtProfit -= partnerShare * inProfit;

            jwToJc += partnerShare * inPay;
            mtToJc += partnerShare * inPay;

            jcRecv += partnerShare * 2 * inPay;
        }
    });

    income.forEach(i => {
        let tr = document.createElement("tr");
        incomeTableBody.appendChild(tr);

        let incomeId = document.createElement("td");
        let reference = document.createElement("td");
        let description = document.createElement("td");
        let tookBy = document.createElement("td");
        let printedBy = document.createElement("td");
        let channel = document.createElement("td");
        let price = document.createElement("td");
        let shippingPrice = document.createElement("td");
        let costs = document.createElement("td");
        let profit = document.createElement("td");
        let orderType = document.createElement("td");
        let orderDate = document.createElement("td");

        tr.appendChild(incomeId);
        tr.appendChild(reference);
        tr.appendChild(description);
        tr.appendChild(tookBy);
        tr.appendChild(printedBy);
        tr.appendChild(channel);
        tr.appendChild(price);
        tr.appendChild(shippingPrice);
        tr.appendChild(costs);
        tr.appendChild(profit);
        tr.appendChild(orderType);
        tr.appendChild(orderDate);

        tr.onclick = () => addIncome(i.id, i.reference, i.description, i.taker_partner, i.print_partner, i.channel, parseFloat(i.price_pence / 100), parseFloat(i.shipping_price_pence / 100), parseFloat(i.cost_pence / 100), formatPrice.format(parseFloat(i.profit_pence / 100)), i.order_type, new Date(i.order_date).toLocaleDateString('en-CA'));

        incomeId.textContent = i.id;
        reference.textContent = i.reference;
        description.textContent = i.description;
        tookBy.textContent = i.taker_partner;
        printedBy.textContent = i.print_partner;
        channel.textContent = i.channel;
        price.textContent = formatPrice.format(parseFloat(i.price_pence / 100));
        shippingPrice.textContent = formatPrice.format(parseFloat(i.shipping_price_pence / 100));
        costs.textContent = formatPrice.format(parseFloat(i.cost_pence / 100));
        profit.textContent = formatPrice.format(parseFloat(i.profit_pence / 100));
        orderType.textContent = i.order_type;
        orderDate.textContent = new Date(i.order_date).toLocaleDateString('en-CA');

        let profit1 = parseInt(i.profit_pence);

        let orderDay = i.order_date.slice(0, 10);
        let inProfit = (orderDay >= profitStart && orderDay < profitEnd) ? 1 : 0;
        let inPay = (orderDay >= payStart && orderDay < payEnd) ? 1 : 0;

        if (i.taker_partner == "Jacob Waters") {
            if (i.order_type == "Standard") {
                let partnerShare = Math.floor(profit1 * 0.075);
                let partnerShareMax = Math.round(profit1 * 0.075);
                let difference = partnerShareMax * 2 - partnerShare * 2;
                
                jwProfit += (Math.round(profit1 * 0.85) + difference) * inProfit;
                mtProfit += partnerShare * inProfit;
                jcProfit += partnerShare * inProfit;

                mtRecv += partnerShare * inPay;
                jcRecv += partnerShare * inPay;
                
                jwToMt += partnerShare * inPay;
                jwToJc += partnerShare * inPay;
            }

            else {
                let share90Percent = Math.round(profit1 * 0.9);
                let share10Percent = Math.round(profit1 * 0.1);
                let partnerShare = Math.floor(share90Percent / 3);
                let partnerShareMax = Math.round(share90Percent / 3);
                let difference = partnerShareMax * 2 - partnerShare * 2;

                jwProfit += (share10Percent + partnerShare + difference) * inProfit;
                mtProfit += partnerShare * inProfit;
                jcProfit += partnerShare * inProfit;

                mtRecv += partnerShare * inPay;
                jcRecv += partnerShare * inPay;

                jwToMt += partnerShare * inPay;
                jwToJc += partnerShare * inPay;
            }
        }
        
        else if (i.taker_partner == "Matthew Taylor") {
            if (i.order_type == "Standard") {
                let partnerShare = Math.floor(profit1 * 0.075);
                let partnerShareMax = Math.round(profit1 * 0.075);
                let difference = partnerShareMax * 2 - partnerShare * 2;
                
                mtProfit += (Math.round(profit1 * 0.85) + difference) * inProfit;
                jwProfit += partnerShare * inProfit;
                jcProfit += partnerShare * inProfit;

                jwRecv += partnerShare * inPay;
                jcRecv += partnerShare * inPay;

                mtToJw += partnerShare * inPay;
                mtToJc += partnerShare * inPay;
            }

            else {
                let share90Percent = Math.round(profit1 * 0.9);
                let share10Percent = Math.round(profit1 * 0.1);
                let partnerShare = Math.floor(share90Percent / 3);
                let partnerShareMax = Math.round(share90Percent / 3);
                let difference = partnerShareMax * 2 - partnerShare * 2;

                mtProfit += (share10Percent + partnerShare + difference) * inProfit;
                jwProfit += partnerShare * inProfit;
                jcProfit += partnerShare * inProfit;

                jwRecv += partnerShare * inPay;
                jcRecv += partnerShare * inPay;

                mtToJw += partnerShare * inPay;
                mtToJc += partnerShare * inPay;
            }
        }

        else if (i.taker_partner == "James Colley") {
            if (i.order_type == "Standard") {
                let partnerShare = Math.floor(profit1 * 0.075);
                let partnerShareMax = Math.round(profit1 * 0.075);
                let difference = partnerShareMax * 2 - partnerShare * 2;
                
                jcProfit += (Math.round(profit1 * 0.85) + difference) * inProfit;
                mtProfit += partnerShare * inProfit;
                jwProfit += partnerShare * inProfit;

                mtRecv += partnerShare * inPay;
                jwRecv += partnerShare * inPay;

                jcToJw += partnerShare * inPay;
                jcToMt += partnerShare * inPay;
            }

            else {
                let share90Percent = Math.round(profit1 * 0.9);
                let share10Percent = Math.round(profit1 * 0.1);
                let partnerShare = Math.floor(share90Percent / 3);
                let partnerShareMax = Math.round(share90Percent / 3);
                let difference = partnerShareMax * 2 - partnerShare * 2;

                jcProfit += (share10Percent + partnerShare + difference) * inProfit;
                mtProfit += partnerShare * inProfit;
                jwProfit += partnerShare * inProfit;

                mtRecv += partnerShare * inPay;
                jwRecv += partnerShare * inPay;

                jcToJw += partnerShare * inPay;
                jcToMt += partnerShare * inPay;
            }
        }
    });

    let jwRec = document.getElementById("jwRec");
    let mtRec = document.getElementById("mtRec");
    let jcRec = document.getElementById("jcRec");

    let jwProfit1 = document.getElementById("jwProfit");
    let mtProfit1 = document.getElementById("mtProfit");
    let jcProfit1 = document.getElementById("jcProfit");

    let jwSen = document.getElementById("jwSen");
    let mtSen = document.getElementById("mtSen");
    let jcSen = document.getElementById("jcSen");

    jwRec.innerHTML = `Jacob Waters: <strong>${formatPrice.format(parseFloat(jwRecv / 100))}</strong>`;
    mtRec.innerHTML = `Matthew Taylor: <strong>${formatPrice.format(parseFloat(mtRecv / 100))}</strong>`;
    jcRec.innerHTML = `James Colley: <strong>${formatPrice.format(parseFloat(jcRecv / 100))}</strong>`;

    jwProfit1.innerHTML = `Jacob Waters: <strong>${formatPrice.format(parseFloat(jwProfit / 100))}</strong>`;
    mtProfit1.innerHTML = `Matthew Taylor: <strong>${formatPrice.format(parseFloat(mtProfit / 100))}</strong>`;
    jcProfit1.innerHTML = `James Colley: <strong>${formatPrice.format(parseFloat(jcProfit / 100))}</strong>`;

    if (currentUser.username == "Jacob Waters") {
        mtSen.style.display = "";
        jcSen.style.display = "";

        mtSen.innerHTML = `Matthew Taylor: <strong>${formatPrice.format(parseFloat(jwToMt / 100))}</strong>`;
        jcSen.innerHTML = `James Colley: <strong>${formatPrice.format(parseFloat(jwToJc / 100))}</strong>`;
    }

    else if (currentUser.username == "Matthew Taylor") {
        jwSen.style.display = "";
        jcSen.style.display = "";

        jwSen.innerHTML = `Jacob Waters: <strong>${formatPrice.format(parseFloat(mtToJw / 100))}</strong>`;
        jcSen.innerHTML = `James Colley: <strong>${formatPrice.format(parseFloat(mtToJc / 100))}</strong>`;
    }

    else if (currentUser.username == "James Colley") {
        jwSen.style.display = "";
        mtSen.style.display = "";

        jwSen.innerHTML = `Jacob Waters: <strong>${formatPrice.format(parseFloat(jcToJw / 100))}</strong>`;
        mtSen.innerHTML = `Matthew Taylor: <strong>${formatPrice.format(parseFloat(jcToMt / 100))}</strong>`;
    }
}

function addIncome(incomeId = null, reference = null, description = null, tookBy = "", printedBy = "", channel = "", price = null, shippingPrice = null, costs = null, profit = null, orderType = "", orderDate = null) {
    let incomePopup = document.getElementById("incomePopup");
    let dim = document.getElementById("dim");

    let referenceInput = document.getElementById("referenceInput");
    let descriptionInput = document.getElementById("descriptionInput");
    let tookBySelect = document.getElementById("tookBySelect");
    let printedBySelect = document.getElementById("printedBySelect");
    let channelSelect = document.getElementById("channelSelect");
    let itemPriceInput = document.getElementById("itemPriceInput");
    let shippingPriceInput = document.getElementById("shippingPriceInput");
    let costsPriceInput = document.getElementById("costsPriceInput");
    let incomePopupProfit = document.getElementById("incomePopupProfit");
    let orderTypeSelect = document.getElementById("orderTypeSelect");
    let orderDateInput = document.getElementById("orderDateInput");

    currentIncomeId = incomeId;

    if (incomeId) {
        document.getElementById("deleteIncomeBtn").style.display = "";
    }

    else {
        document.getElementById("deleteIncomeBtn").style.display = "none";
    }

    referenceInput.value = reference;
    descriptionInput.value = description;
    tookBySelect.value = tookBy;
    printedBySelect.value = printedBy;
    channelSelect.value = channel;
    if (profit) {
        incomePopupProfit.innerHTML = `Profit: <strong>${profit}</strong>`;
    }

    else {
        incomePopupProfit.innerHTML = 'Profit: <strong>£-.--</strong>';
    }
    itemPriceInput.value = price;
    shippingPriceInput.value = shippingPrice;
    costsPriceInput.value = costs;
    orderTypeSelect.value = orderType;
    orderDateInput.value = orderDate;

    dim.style.display = "";
    incomePopup.style.display = "";
}

function addExpense(expenseId = null, description = null, category = "", amount = null, expenseDate = null) {
    let expensePopup = document.getElementById("expensePopup");
    let dim = document.getElementById("dim");

    let descriptionInput = document.getElementById("descriptionInput1");
    let categorySelect = document.getElementById("categorySelect");
    let expenseAmountInput = document.getElementById("expenseAmountInput");
    let expenseDateInput = document.getElementById("expenseDateInput");

    currentExpenseId = expenseId;

    if (expenseId) {
        document.getElementById("deleteExpenseBtn").style.display = "";
    }

    else {
        document.getElementById("deleteExpenseBtn").style.display = "none";
    }

    descriptionInput.value = description;
    categorySelect.value = category;
    expenseAmountInput.value = amount;
    expenseDateInput.value = expenseDate;

    dim.style.display = "";
    expensePopup.style.display = "";
}

async function logIncome1() {
    let referenceInput = document.getElementById("referenceInput").value;
    let descriptionInput = document.getElementById("descriptionInput").value;
    let tookBySelect = document.getElementById("tookBySelect").value;
    let printedBySelect = document.getElementById("printedBySelect").value;
    let channelSelect = document.getElementById("channelSelect").value;
    let itemPriceInput = parseFloat(document.getElementById("itemPriceInput").value);
    let shippingPriceInput = parseFloat(document.getElementById("shippingPriceInput").value);
    let costsPriceInput = parseFloat(document.getElementById("costsPriceInput").value);
    let orderTypeSelect = document.getElementById("orderTypeSelect").value;
    let orderDateInput = document.getElementById("orderDateInput").value;

    if (!referenceInput || !descriptionInput || !tookBySelect || !printedBySelect || !channelSelect || isNaN(itemPriceInput) || isNaN(shippingPriceInput) || isNaN(costsPriceInput) || !orderTypeSelect || !orderDateInput) {
        alert("Please fill in all fields.");
        
        return;
    }

    let profit = itemPriceInput - (shippingPriceInput + costsPriceInput);

    const formData = new FormData();

    formData.append("id", currentIncomeId);
    formData.append("reference", referenceInput);
    formData.append("description", descriptionInput);
    formData.append("took_by", tookBySelect);
    formData.append("printed_by", printedBySelect);
    formData.append("channel", channelSelect);
    formData.append("item_price", parseInt(itemPriceInput * 100));
    formData.append("shipping_price", parseInt(shippingPriceInput * 100));
    formData.append("costs_price", parseInt(costsPriceInput * 100));
    formData.append("profit", parseInt(profit * 100));
    formData.append("order_type", orderTypeSelect);
    formData.append("order_date", orderDateInput);

    const response = await fetch("../logIncome1.php", {
        method: "POST",
        body: formData
    });

    const result = await response.json();

    if (result.success) {
        cancelLogIncome();
        updateIncome();
    }

    else {
        alert("Error saving income log. Please try again.");
    }
}

async function logExpense1() {
    let descriptionInput = document.getElementById("descriptionInput1").value;
    let categorySelect = document.getElementById("categorySelect").value;
    let expenseAmountInput = parseFloat(document.getElementById("expenseAmountInput").value);
    let expenseDateInput = document.getElementById("expenseDateInput").value;

    if (!descriptionInput || !categorySelect || !expenseAmountInput || !expenseDateInput) {
        alert("Please fill in all fields.");
        
        return;
    }

    const formData = new FormData();

    formData.append("id", currentExpenseId);
    formData.append("created_by", currentUser.username);
    formData.append("description", descriptionInput);
    formData.append("category", categorySelect);
    formData.append("amount", parseInt(expenseAmountInput * 100));
    formData.append("expense_date", expenseDateInput);

    const response = await fetch("../logExpense.php", {
        method: "POST",
        body: formData
    });

    const result = await response.json();

    if (result.success) {
        cancelLogExpense();
        updateIncome();
    }

    else {
        alert("Error saving income log. Please try again.");
    }
}

async function deleteLogIncome() {
    const res = await fetch('../deleteIncome.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({currentIncomeId})
    });

    const data = await res.json();

    if (data.success) {
        cancelLogIncome();
        updateIncome();
    }

    else {
        alert("Error deleting income log. Please try again.")
    }
}

async function deleteLogExpense() {
    const res = await fetch('../deleteExpense.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({currentExpenseId})
    });

    const data = await res.json();

    if (data.success) {
        cancelLogExpense();
        updateIncome();
    }

    else {
        alert("Error deleting expense log. Please try again.")
    }
}

function profitInputChanged() {
    let itemPriceInput = parseFloat(document.getElementById("itemPriceInput").value);
    let shippingPriceInput = parseFloat(document.getElementById("shippingPriceInput").value);
    let costsPriceInput = parseFloat(document.getElementById("costsPriceInput").value);
    let incomePopupProfit = document.getElementById("incomePopupProfit");

    let profit = formatPrice.format(itemPriceInput - (shippingPriceInput + costsPriceInput));

    if (profit != "£NaN") {
        incomePopupProfit.innerHTML = `Profit: <strong>${profit}</strong>`;
    }

    else {
        incomePopupProfit.innerHTML = 'Profit: <strong>£-.--</strong>';
    }
}

function logIncome() {
    let logIncomePopup = document.getElementById("logIncomePopup");
    let dim = document.getElementById("dim");

    dim.style.display = "";
    logIncomePopup.style.display = "";
}

async function logPayment() {
    let readCheckbox = document.getElementById("readCheckbox").checked;

    if (readCheckbox) {
        let curUsr = currentUser.username;
        let incomeDate = lastMonthStart.toLocaleDateString('en-CA');

        const res = await fetch('../logIncome.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({curUsr, incomeDate})
        });

        const data = await res.json();

        if (data.success) {
            cancelLog();
            updateIncome();
        }

        else {
            alert("Error logging payment. Please try again.")
        }
    }

    else {
        alert("Please check the checkbox to confirm that you have sent the required payments to each partner.")
    }
}

function cancelLog() {
    let logIncomePopup = document.getElementById("logIncomePopup");
    let dim = document.getElementById("dim");

    dim.style.display = "none";
    logIncomePopup.style.display = "none";
}

function updateIncome() {
    document.getElementById("incomeTableBody").innerHTML = "";
    document.getElementById("expenseTableBody").innerHTML = "";

    loadIncome();
}

function cancelLogIncome() {
    let incomePopup = document.getElementById("incomePopup");
    let dim = document.getElementById("dim");

    dim.style.display = "none";
    incomePopup.style.display = "none";

    currentIncomeId = null;
}

function cancelLogExpense() {
    let expensePopup = document.getElementById("expensePopup");
    let dim = document.getElementById("dim");

    dim.style.display = "none";
    expensePopup.style.display = "none";

    currentExpenseId = null;
}

function filter(type) {
    let incomeListDiv = document.getElementById("incomeListDiv");
    let expenseListDiv = document.getElementById("expenseListDiv");
    let filterIncome = document.getElementById("filterIncome");
    let filterExpenses = document.getElementById("filterExpenses");
    let addBtn = document.getElementById("addBtn");

    if (type == "income") {
        incomeListDiv.style.display = "";
        expenseListDiv.style.display = "none";

        filterIncome.classList.remove("unSelectedFilter");
        filterIncome.classList.add("selectedFilter");

        filterExpenses.classList.add("unSelectedFilter");
        filterExpenses.classList.remove("selectedFilter");

        addBtn.innerText = "Log Income";
        addBtn.onclick = () => addIncome();
    }

    if (type == "expenses") {
        incomeListDiv.style.display = "none";
        expenseListDiv.style.display = "";

        filterExpenses.classList.remove("unSelectedFilter");
        filterExpenses.classList.add("selectedFilter");

        filterIncome.classList.add("unSelectedFilter");
        filterIncome.classList.remove("selectedFilter");

        addBtn.innerText = "Log Expense";
        addBtn.onclick = () => addExpense();
    }

    updateIncome();
}