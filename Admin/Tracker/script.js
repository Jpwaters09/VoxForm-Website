let currentUser = null;
let isManager = null;

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
    let paidMonths = data[1];

    let incomeTableBody = document.getElementById("incomeTableBody");
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

    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
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

        tr.onclick = () => editIncome(i.id);

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
        orderDate.textContent = i.order_date;

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

async function editIncome(incomeId) {

}