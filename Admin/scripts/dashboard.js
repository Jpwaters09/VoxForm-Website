let currentUser = null;
let tasks;
let assignOrderNumber;
let totalPrice;
let itemCost;
let shippingCost;
let mass;
let videoFile;
let itemQuantity;

init();

async function init() {
    const res = await fetch('login.php');
    const data = await res.json();

    if (!data.loggedIn) {
        window.location.href = "login.html";
        return;
    }

    currentUser = data;
    document.getElementById("usernameText").innerHTML = `Logged in as <strong>${currentUser.username}</strong>`;
    loadTasks();

    if (!currentUser.isManager) {
        document.getElementById("filterOtherOrders").style.display = "none";
    }
}

async function loadTasks() {
    const res = await fetch('tasks.php');
    tasks = await res.json();

    renderTasks();
}

function renderTasks() {
    tasks.forEach(order => {
        let orderDiv = document.getElementById("orders");
        let otherOrderDiv = document.getElementById("otherOrders");
        let completedOrderDiv = document.getElementById("completedOrders");
        let orderNumber = order.order_id;
        let orderName = order.item;
        let orderStatus = order.status;
        let orderAssignee = order.assignee;
        
        let orderCard = document.createElement("div");
        let orderNumberText = document.createElement("span");
        let orderAssigneeText = document.createElement("span");
        let orderTitleText = document.createElement("span");
        let orderStatusText = document.createElement("span");

        if (order.status == "Completed" || order.status == "Cancelled") {
            completedOrderDiv.appendChild(orderCard);
        }

        else if (orderAssignee == null || orderAssignee == currentUser.username) {
            orderDiv.appendChild(orderCard);
        }

        else {
            otherOrderDiv.appendChild(orderCard);
        }

        orderCard.classList.add("orderCard");

        if (orderAssignee == null) {
            orderCard.onclick = () => orderClicked(orderNumber, "False");
        }

        if (orderAssignee && orderStatus == "Pending") {
            orderCard.onclick = () => orderClicked(orderNumber, "Pending", order.shipping, orderName, "", "", "", "", "", "", "", "", "", order.model_file, order.extra_info, "", order.filament_type1, order.filament_type2, order.filament_colour1, order.filament_colour2, order.personalisation, order.style, order.finish, order.quantity);
        }

        if (orderStatus == "Paid") {
            orderCard.onclick = () => orderClicked(orderNumber, "Paid", order.shipping, orderName, order.name, order.email, order.phone, order.address_line_1, order.address_line_2, order.city, order.county, order.postcode, order.country, order.model_file, order.extra_info, order.weight);
        }

        if (orderStatus == "Shipped") {
            orderCard.onclick = () => orderClicked(orderNumber, "Shipped");
        }

        orderCard.appendChild(orderNumberText);
        orderNumberText.classList.add("orderNumber");
        orderNumberText.textContent = `#${orderNumber}`;

        orderCard.appendChild(orderAssigneeText);
        orderAssigneeText.classList.add("orderAssignee");
        orderAssigneeText.textContent = `Assignee: ${orderAssignee ?? "None"}`;

        orderCard.appendChild(orderTitleText);
        orderTitleText.classList.add("orderTitle");
        orderTitleText.textContent = orderName;

        orderCard.appendChild(orderStatusText);
        orderStatusText.classList.add("orderStatus");
        orderStatusText.textContent = orderStatus;
    });
}

function orderClicked(orderNumber, assigned, shipping="", quoteItem="", buyerName="", buyerEmail="", buyerPhone="", addressLine1="", addressLine2="", city="", county="", postcode="", country="", modelFile="", extraInfo="", weight="", filamentType1="", filamentType2="", filamentColour1="", filamentColour2="", personalisation="", style="", finish="", quantity="") {
    if (assigned == "False") {
        document.getElementById("assignOrderDiv").style.display = "";
        document.getElementById("dim").style.display = "";

        document.getElementById("assignOrderText").innerHTML = `Assign Order <strong>#${orderNumber}</strong> to:`;
        assignOrderNumber = orderNumber;
    }

    if (assigned == "Pending") {
        document.getElementById("quoteOrderDiv").style.display = "";
        document.getElementById("dim").style.display = "";

        document.getElementById("quoteOrderText").innerHTML = `Quote Order <strong>#${orderNumber}</strong>:`;
        document.getElementById("quoteItemText").innerHTML = `Item: <strong>${quoteItem}</strong>`;

        if (filamentType1) {
            document.getElementById("filamentType1").innerHTML = `Filament Type 1: <strong>${filamentType1}</strong>`;
        }

        if (filamentType2) {
            document.getElementById("filamentType2").innerHTML = `Filament Type 2: <strong>${filamentType2}</strong>`;
        }

        if (filamentColour1) {
            document.getElementById("filamentColour1").innerHTML = `Filament Colour 1: <strong>${filamentColour1}</strong>`;
        }

        if (filamentColour2) {
            document.getElementById("filamentColour2").innerHTML = `Filament Colour 2: <strong>${filamentColour2}</strong>`;
        }

        if (personalisation) {
            document.getElementById("personalisation").innerHTML = `Personalisation: <strong>${personalisation}</strong>`;
        }

        if (style) {
            document.getElementById("style").innerHTML = `Style: <strong>${style}</strong>`;
        }

        if (finish) {
            document.getElementById("finish").innerHTML = `Finish: <strong>${finish}</strong>`;
        }

        if (quantity) {
            document.getElementById("quantity").innerHTML = `Quantity: <strong>${quantity}</strong>`;
        }

        if (quoteItem == "Custom 3D Print") {
            let modelPath = modelFile.replace('/home/www/public/', '');

            document.getElementById("fileDownload").style.display = "";
            document.getElementById("fileDownload").innerHTML = `<a href="https://voxform.co.uk/${modelPath}">Download 3D File</a>`;
        }

        if (extraInfo) {
            document.getElementById("quoteInfo").innerHTML = `Info: ${extraInfo}`;
        }

        if (shipping == "RMT48") {
            document.getElementById("shippingHeading").innerHTML = `Shipping Price for <a href="https://pro.packlink.com/app/checkout/search" target="_blank">Royal Mail Tracked 48</a>`;
        }

        if (shipping == "RMT24") {
            document.getElementById("shippingHeading").innerHTML = `Shipping Price for <a href="https://pro.packlink.com/app/checkout/search" target="_blank">Royal Mail Tracked 24</a>`;
        }

        if (shipping == "YODEL") {
            document.getElementById("shippingHeading").innerHTML = `Shipping Price for <a href="https://pro.packlink.com/app/checkout/search" target="_blank">Yodel</a>`;
        }

        assignOrderNumber = orderNumber;
        itemQuantity = quantity;
    }

    if (assigned == "Paid") {
        document.getElementById("paidOrderDiv").style.display = "";
        document.getElementById("dim").style.display = "";

        document.getElementById("paidOrderText").innerHTML = `Shipping for Order <strong>#${orderNumber}</strong>:`;
        document.getElementById("paidItemText").innerHTML = `Item: <strong>${quoteItem}</strong>`;
        document.getElementById("itemMassText").innerHTML = `Weight: <strong>${weight}g</strong>`;

        document.getElementById("nameText").innerHTML = `Name: ${buyerName}`;
        document.getElementById("emailText").innerHTML = `Email: ${buyerEmail}`;
        document.getElementById("phoneText").innerHTML = `Phone: ${buyerPhone}`;
        document.getElementById("addressLine1Text").innerHTML = addressLine1;
        document.getElementById("addressLine2Text").innerHTML = addressLine2;
        document.getElementById("cityText").innerHTML = city;
        document.getElementById("countyText").innerHTML = county;
        document.getElementById("postcodeText").innerHTML = postcode;
        document.getElementById("countryText").innerHTML = country;

        if (shipping == "RMT48") {
            document.getElementById("labelButton").onclick = () => window.open('https://pro.packlink.com/app/checkout/search', '_blank', 'noopener,noreferrer');
        }

        if (shipping == "RMT24") {
            document.getElementById("labelButton").onclick = () => window.open('https://pro.packlink.com/app/checkout/search', '_blank', 'noopener,noreferrer');
        }

        if (shipping == "YODEL") {
            document.getElementById("labelButton").onclick = () => window.open('https://pro.packlink.com/app/checkout/search', '_blank', 'noopener,noreferrer');
        }

        assignOrderNumber = orderNumber;
    }

    if (assigned == "Shipped") {
        document.getElementById("completeOrderDiv").style.display = "";
        document.getElementById("dim").style.display = "";

        document.getElementById("completeOrderText").innerHTML = `Mark Order <strong>#${orderNumber}</strong> as Completed`;

        assignOrderNumber = orderNumber;
    }
}

function filter(orderFilter) {
    let filterOrders = document.getElementById("filterOrders");
    let filterOtherOrders = document.getElementById("filterOtherOrders");
    let filterCompletedOrders = document.getElementById("filterCompletedOrders");

    if (orderFilter == "orders") {
        filterOrders.classList.remove("unSelectedFilter");
        filterOrders.classList.add("selectedFilter");
        filterOtherOrders.classList.add("unSelectedFilter");
        filterOtherOrders.classList.remove("selectedFilter");
        filterCompletedOrders.classList.add("unSelectedFilter");
        filterCompletedOrders.classList.remove("selectedFilter");

        document.getElementById("orders").style.display = "";
        document.getElementById("otherOrders").style.display = "none";
        document.getElementById("completedOrders").style.display = "none";
    }

    if (orderFilter == "otherOrders") {
        filterOtherOrders.classList.remove("unSelectedFilter");
        filterOtherOrders.classList.add("selectedFilter");
        filterOrders.classList.add("unSelectedFilter");
        filterOrders.classList.remove("selectedFilter");
        filterCompletedOrders.classList.add("unSelectedFilter");
        filterCompletedOrders.classList.remove("selectedFilter");

        document.getElementById("orders").style.display = "none";
        document.getElementById("otherOrders").style.display = "";
        document.getElementById("completedOrders").style.display = "none";
    }

    if (orderFilter == "completedOrders") {
        filterCompletedOrders.classList.remove("unSelectedFilter");
        filterCompletedOrders.classList.add("selectedFilter");
        filterOtherOrders.classList.add("unSelectedFilter");
        filterOtherOrders.classList.remove("selectedFilter");
        filterOrders.classList.add("unSelectedFilter");
        filterOrders.classList.remove("selectedFilter");

        document.getElementById("orders").style.display = "none";
        document.getElementById("otherOrders").style.display = "none";
        document.getElementById("completedOrders").style.display = "";
    }
}

async function assignOrder() {
    let assignOrderBox = document.getElementById("assignOrderBox").value;

    if (document.getElementById("assignOrderBox").selectedIndex == 0) {
        alert("Please select an option");
        return;
    }

    const res = await fetch('assignOrder.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({assignOrderNumber, assignOrderBox})
    });

    const data = await res.json();

    if (data.success) {
        assignClose();
        document.getElementById("orders").innerHTML = "";
        document.getElementById("otherOrders").innerHTML = "";
        document.getElementById("completedOrders").innerHTML = "";

        init();
    }
}

function assignClose() {
    document.getElementById("assignOrderDiv").style.display = "none";
    document.getElementById("dim").style.display = "none";
    document.getElementById("assignOrderBox").selectedIndex = 0;

    document.getElementById("assignOrderText").innerHTML = "";
    assignOrderNumber = null;
}

function priceCalcChanged() {
    let priceCalcSelect = document.getElementById("priceCalcSelect").selectedIndex;

    if (priceCalcSelect == 1) {
        document.getElementById("fixedPriceBox").style.display = "";
        document.getElementById("fixedPriceText").style.display = "";
        document.getElementById("timeDiv").style.display = "none";
        document.getElementById("materialCalcDiv").style.display = "none";
    }

    if (priceCalcSelect == 2) {
        document.getElementById("fixedPriceBox").style.display = "none";
        document.getElementById("fixedPriceText").style.display = "none";
        document.getElementById("timeDiv").style.display = "";
        document.getElementById("materialCalcDiv").style.display = "";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let fixedPriceBox = document.getElementById("fixedPriceBox");

    fixedPriceBox.addEventListener('blur', () => {
        const num = parseFloat(fixedPriceBox.value.replace(/[^0-9.]/g, ''));
        if (!isNaN(num)) {
            fixedPriceBox.value = '£' + num.toFixed(2);
        }
    });

    fixedPriceBox.addEventListener('focus', () => {
        fixedPriceBox.value = fixedPriceBox.value.replace('£', '');
    });

    let filamentCost = document.getElementById("filamentCost");

    filamentCost.addEventListener('blur', () => {
        const num = parseFloat(filamentCost.value.replace(/[^0-9.]/g, ''));
        if (!isNaN(num)) {
            filamentCost.value = '£' + num.toFixed(2);
        }
    });

    filamentCost.addEventListener('focus', () => {
        filamentCost.value = filamentCost.value.replace('£', '');
    });

    let shippingPrice = document.getElementById("shippingPrice");

    shippingPrice.addEventListener('blur', () => {
        const num = parseFloat(shippingPrice.value.replace(/[^0-9.]/g, ''));
        if (!isNaN(num)) {
            shippingPrice.value = '£' + num.toFixed(2);
        }
    });

    shippingPrice.addEventListener('focus', () => {
        shippingPrice.value = shippingPrice.value.replace('£', '');
    });
});

function calculatePrice() {
    let hours = document.getElementById("hours");
    let minutes = document.getElementById("minutes");
    let filamentCost = document.getElementById("filamentCost");
    let shippingPrice = document.getElementById("shippingPrice");
    let fixedPriceBox = document.getElementById("fixedPriceBox");
    let massInput = document.getElementById("mass");
    let mode = document.getElementById("priceCalcSelect").selectedIndex;

    const ENERGY_PER_HOUR = 0.16;
    const WEAR_PER_HOUR = 1.0;
    const LABOUR_RATE = 15;
    const LABOUR_MINUTES = 20;
    const FILAMENT_WASTE = 1.1;
    const FAILURE_ALLOWANCE = 1.1;
    const MARKUP = 1.8;
    const FIXED_FEE = 0.75;

    const toNum = v => parseFloat(String(v ?? "").replace("£", ""));
    const toNumOrZero = v => toNum(v) || 0;

    const quantity = Number(itemQuantity) || 1;
    const shipping = shippingPrice ? toNumOrZero(shippingPrice.value) : 0;

    let unitPrice = NaN;
    let massText = "N/A";

    if (mode == 1) {
        if (!fixedPriceBox) return;

        unitPrice = toNum(fixedPriceBox.value);
    }

    else if (mode == 2) {
        if (!(hours && minutes && filamentCost && massInput)) return;

        const printHours = toNumOrZero(hours.value) + toNumOrZero(minutes.value) / 60;
        const grams = toNum(massInput.value);
        const pricePerKg = toNum(filamentCost.value);

        if (printHours > 0 && grams > 0 && isFinite(pricePerKg)) {
            const energyCost = printHours * ENERGY_PER_HOUR;
            const wearCost = printHours * WEAR_PER_HOUR;
            const material = (pricePerKg / 1000) * grams * FILAMENT_WASTE;
            const labourCost = (LABOUR_RATE / 60) * LABOUR_MINUTES;

            const unitCost = (energyCost + wearCost + material) * FAILURE_ALLOWANCE + labourCost;

            unitPrice = unitCost * MARKUP;
        }

        massText = massInput.value;
    }

    else {
        return;
    }

    const valid = isFinite(unitPrice) && unitPrice > 0;
    const itemTotal = unitPrice * quantity;
    const total = valid ? itemTotal + shipping + FIXED_FEE : 0;

    mass = massText;
    shippingCost = valid ? shipping.toFixed(2) : null;
    itemCost = valid ? itemTotal.toFixed(2) : null;
    totalPrice = total.toFixed(2);

    document.getElementById("totalPrice").innerHTML = `Total Price: <strong>£${totalPrice}</strong>`;
}

async function submitQuote() {
    if (!totalPrice) {
        alert("Please enter a price");
        return;
    }

    const res = await fetch('submitQuote.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({assignOrderNumber, itemCost, shippingCost, totalPrice, mass})
    });

    const data = await res.json();

    if (data.success) {
        closeQuote();
        document.getElementById("orders").innerHTML = "";
        document.getElementById("otherOrders").innerHTML = "";
        document.getElementById("completedOrders").innerHTML = "";

        init();
    }
}

function closeQuote() {
    document.getElementById("quoteOrderDiv").style.display = "none";
    document.getElementById("dim").style.display = "none";
    document.getElementById("priceCalcSelect").selectedIndex = 0;
    document.getElementById("fixedPriceBox").value = "";
    document.getElementById("hours").value = "";
    document.getElementById("minutes").value = "";
    document.getElementById("filamentCost").value = "£16.00";
    document.getElementById("mass").value = "";
    document.getElementById("shippingPrice").value = "";
    document.getElementById("quoteInfo").innerHTML = "";
    document.getElementById("fileDownload").style.display = "none";
    document.getElementById("fileDownload").innerHTML = "";
    document.getElementById("totalPrice").innerHTML = "";

    document.getElementById("fixedPriceBox").style.display = "none";
    document.getElementById("fixedPriceText").style.display = "none";
    document.getElementById("timeDiv").style.display = "none";
    document.getElementById("materialCalcDiv").style.display = "none";

    document.getElementById("quoteOrderText").innerHTML = "";

    assignOrderNumber = null;
    totalPrice = null;
    itemCost = null;
    shippingCost = null;
    mass = null;
    itemQuantity = null;
}

function takeVideo() {
    let filePicker = document.getElementById("video");

    filePicker.click();
}

function uploadVideo() {
    let video = document.getElementById("video").files[0];

    if (!video) {
        return;
    }

    document.getElementById("videoText").textContent = "Video Uploaded";

    videoFile = video;
}

async function submitShipping() {
    let trackingNumber = document.getElementById("trackingNumber").value;

    if (!videoFile) {
        alert("Please upload a video");
        return;
    }

    if (!trackingNumber) {
        alert("Please enter a tracking number");
        return;
    }

    const formData = new FormData();

    formData.append("assignOrderNumber", assignOrderNumber);
    formData.append("trackingNumber", trackingNumber);
    formData.append("videoFile", videoFile);

    const res = await fetch("submitShipping.php", {
        method: "POST",
        body: formData
    });

    const data = await res.json();

    if (data.success) {
        closeShipping();

        document.getElementById("orders").innerHTML = "";
        document.getElementById("otherOrders").innerHTML = "";
        document.getElementById("completedOrders").innerHTML = "";

        init();
    }
}

function closeShipping() {
    document.getElementById("paidOrderDiv").style.display = "none";
    document.getElementById("dim").style.display = "none";
    document.getElementById("paidOrderText").innerHTML = "";
    document.getElementById("paidItemText").innerHTML = "";
    document.getElementById("itemMassText").innerHTML = "";
    document.getElementById("nameText").innerHTML = "";
    document.getElementById("emailText").innerHTML = "";
    document.getElementById("phoneText").innerHTML = "";
    document.getElementById("addressLine1Text").innerHTML ="";
    document.getElementById("addressLine2Text").innerHTML = "";
    document.getElementById("cityText").innerHTML = "";
    document.getElementById("countyText").innerHTML ="";
    document.getElementById("postcodeText").innerHTML = "";
    document.getElementById("countryText").innerHTML = "";
    document.getElementById("trackingNumber").value = "";
    document.getElementById("video").value = "";
    document.getElementById("videoText").innerHTML = "Upload a Video";
    
    videoFile = null;
    assignOrderNumber = null;
}

async function submitComplete() {
    const res = await fetch('submitComplete.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({assignOrderNumber})
    });

    const data = await res.json();

    if (data.success) {
        closeComplete();
        document.getElementById("orders").innerHTML = "";
        document.getElementById("otherOrders").innerHTML = "";
        document.getElementById("completedOrders").innerHTML = "";

        init();
    }
}

function closeComplete() {
    document.getElementById("completeOrderDiv").style.display = "none";
    document.getElementById("dim").style.display = "none";
    document.getElementById("completeOrderText").innerHTML = "";

    assignOrderNumber = null;
}