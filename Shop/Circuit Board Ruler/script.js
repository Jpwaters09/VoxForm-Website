let selectedImage = 1;

function leftBtnClick() {
    let productImage = document.getElementById("productImage");
    let image1Btn = document.getElementById("image1Btn");
    let image2Btn = document.getElementById("image2Btn");

    if (selectedImage == 2) {
        image1Btn.style.color = "#ffffff";
        image2Btn.style.color = "#8ba4bc";
        productImage.src = "/Assets/Images/Product/Circuit Board Ruler/Image 1.webp";
        productImage.alt = "Circuit Board Ruler";
        selectedImage = 1;
    }
}

function rightBtnClick() {
    let productImage = document.getElementById("productImage");
    let image1Btn = document.getElementById("image1Btn");
    let image2Btn = document.getElementById("image2Btn");

    if (selectedImage == 1) {
        image1Btn.style.color = "#8ba4bc";
        image2Btn.style.color = "#ffffff";
        productImage.src = "/Assets/Images/Product/Circuit Board Ruler/Image 2.webp";
        productImage.alt = "Circuit Board Ruler";
        selectedImage = 2;
    }
}

function imageBtn1() {
    let productImage = document.getElementById("productImage");
    let image1Btn = document.getElementById("image1Btn");
    let image2Btn = document.getElementById("image2Btn");

    image1Btn.style.color = "#ffffff";
    image2Btn.style.color = "#8ba4bc";
    productImage.src = "/Assets/Images/Product/Circuit Board Ruler/Image 1.webp";
    productImage.alt = "Circuit Board Ruler";
    selectedImage = 1;
}

function imageBtn2() {
    let productImage = document.getElementById("productImage");
    let image1Btn = document.getElementById("image1Btn");
    let image2Btn = document.getElementById("image2Btn");

    image1Btn.style.color = "#8ba4bc";
    image2Btn.style.color = "#ffffff";
    productImage.src = "/Assets/Images/Product/Circuit Board Ruler/Image 2.webp";
    productImage.alt = "Circuit Board Ruler";
    selectedImage = 2;
}

document.addEventListener("DOMContentLoaded", function() {
    fetch("/Header/index.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("header").innerHTML = data;

            initialiseHeader();
        });

    fetch("/Footer/index.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer").innerHTML = data;

            initialiseHeader();
        });
});

function order() {
    let dim = document.getElementById("dim");
    let orderForm = document.getElementById("orderForm");

    dim.style.display = "";
    orderForm.style.display = "";
}

async function submit() {
    let nameInput = document.getElementById("nameInput").value;
    let emailInput = document.getElementById("emailInput").value;
    let phoneInput = document.getElementById("phoneInput").value;
    let address1Input = document.getElementById("address1Input").value;
    let address2Input = document.getElementById("address2Input").value;
    let cityInput = document.getElementById("cityInput").value;
    let postcodeInput = document.getElementById("postcodeInput").value;
    let countyInput = document.getElementById("countyInput").value;
    let countryInput = document.getElementById("countryInput").value;
    let readLegalBox = document.getElementById("readLegalBox").checked;
    let quantity = document.getElementById("quantity").value;
    let submitBtn = document.getElementById("submitBtn");
    let shipping = document.getElementById("shipping").value;

    if (!nameInput || !emailInput || !phoneInput || !address1Input || !cityInput || !postcodeInput || !countyInput || !countryInput || !quantity) {
        alert('Please fill in all fields');
        return;
    }

    if (quantity < 1 || quantity > 10) {
        alert("Please enter a quantity greater than 1 and less than 10");
        return;
    }
    
    if (!shipping) {
        alert("Please select a shipping method");
        return;
    }

    if (!readLegalBox) {
        alert("Please agree to our Legal Policies before submitting.");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(\+447|07)\d{9}$/;

    let phoneNumber = phoneInput.replace(/[\s\-\(\)]/g, '');

    if (!emailRegex.test(emailInput)) {
        alert("Please enter a valid email address");
        return;
    }

    if (!phoneRegex.test(phoneNumber)) {
        alert("Please enter a valid phone number")
        return;
    }

    document.body.style.cursor = "wait";
    submitBtn.disabled = true;
    submitBtn.textContent = "Processing...";

    const formData = new FormData();

    formData.append("name", nameInput);
    formData.append("address_line_1", address1Input);
    formData.append("address_line_2", address2Input);
    formData.append("email", emailInput.toLowerCase());
    formData.append("phone", phoneNumber);
    formData.append("postcode", postcodeInput);
    formData.append("county", countyInput);
    formData.append("country", countryInput);
    formData.append("item", "Circuit Board Ruler");
    formData.append("city", cityInput);
    formData.append("quantity", quantity);
    formData.append("shipping", shipping);

    const response = await fetch("/scripts/submitOrder.php", {
        method: "POST",
        body: formData
    });

    const result = await response.json();

    document.body.style.cursor = "default";
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit";
    
    let orderStatusHeading = document.getElementById("orderStatusHeading");
    let orderSucccesfulSubheading = document.getElementById("orderSucccesfulSubheading");
    let orderNumber = document.getElementById("orderNumber");
    let orderForm = document.getElementById("orderForm");
    let placedPopup = document.getElementById("placedPopup");

    if (result.success) {
        orderForm.style.display = "none";
        placedPopup.style.display = "";
        orderStatusHeading.textContent = "Order Placed Successfully!";
        orderSucccesfulSubheading.textContent = `Thank you for your order! We've received your request and will send a confirmation email to ${emailInput} within 48 hours. A confirmation email has been sent — if you don't see it, check your spam or junk folder.`;
        document.getElementById("orderNumberText").style.display = "";
        orderNumber.textContent = `#${result.order_id}`;
    }

    else {
        orderStatusHeading.textContent = "Order Error!";
        orderSucccesfulSubheading.textContent = result.error;
    }

    document.getElementById("nameInput").value = "";
    document.getElementById("emailInput").value = "";
    document.getElementById("phoneInput").value = "";
    document.getElementById("address1Input").value = "";
    document.getElementById("address2Input").value = "";
    document.getElementById("cityInput").value = "";
    document.getElementById("postcodeInput").value = "";
    document.getElementById("countyInput").value = "";
    document.getElementById("countryInput").value = "";
    document.getElementById("quantity").value = "1";
    document.getElementById("shipping").selectedIndex = 0;
    document.getElementById("readLegalBox").checked = false;
}

function closePopup() {
    let placedPopup = document.getElementById("placedPopup");
    let dim = document.getElementById("dim");

    placedPopup.style.display = "none";
    dim.style.display = "none";
}

function closeOrderPopup() {
    let orderForm = document.getElementById("orderForm");
    let dim = document.getElementById("dim");

    orderForm.style.display = "none";
    dim.style.display = "none";
}