let selectedFilamentType;
let selectedFilamentColour;

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
    let itemStyle = document.getElementById("itemStyle").value;
    let personalisationInput = document.getElementById("personalisationInput").value;
    let readLegalBox = document.getElementById("readLegalBox").checked;
    let quantity = document.getElementById("quantity").value;
    let submitBtn = document.getElementById("submitBtn");
    let shipping = document.getElementById("shipping").value;

    if (!nameInput || !emailInput || !phoneInput || !address1Input || !cityInput || !postcodeInput || !countyInput || !countryInput || !itemStyle || !personalisationInput || !quantity) {
        alert('Please fill in all fields');
        return;
    }

    if (quantity < 1 || quantity > 100) {
        alert("Please enter a quantity greater than 1 and less than 10");
        return;
    }
    
    if (personalisationInput.length > 16) {
        alert("Please enter personalisation text that is less that 16 characters");
        return;
    }
    
    if (!selectedFilamentColour) {
        alert("Please choose the filament");
        return;
    }
    
    if (!shipping) {
        alert("Please select a shipping method");
        return;
    }

    if (!readLegalBox) {
        alert("Please agree to our Legal Policies before submitting");
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
    formData.append("item", "Plant Pot Label");
    formData.append("city", cityInput);
    formData.append("filament_type1", selectedFilamentType);
    formData.append("filament_colour1", selectedFilamentColour);
    formData.append("style", itemStyle);
    formData.append("personalisation", personalisationInput);
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

    let ABSGrey = document.getElementById("ABSGrey");
    let PLABlack = document.getElementById("PLABlack");
    let PLAWhite = document.getElementById("PLAWhite");
    let PLARed = document.getElementById("PLARed");
    let PLABlue = document.getElementById("PLABlue");

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
    document.getElementById("itemStyle").value = "";
    document.getElementById("personalisationInput").value = "";
    document.getElementById("shipping").selectedIndex = 0;
    document.getElementById("readLegalBox").checked = false;
    document.getElementById("quantity").value = "1";

    ABSGrey.style.outline = "2px solid #00000000";
    PLABlack.style.outline = "2px solid #00000000";
    PLAWhite.style.outline = "2px solid #00000000";
    PLARed.style.outline = "2px solid #00000000";
    PLABlue.style.outline = "2px solid #00000000";

    selectedFilamentType = "";
    selectedFilamentColour = "";
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

function filamentColour(material, colour) {
    let ABSGrey = document.getElementById("ABSGrey");
    let PLABlack = document.getElementById("PLABlack");
    let PLAWhite = document.getElementById("PLAWhite");
    let PLARed = document.getElementById("PLARed");
    let PLABlue = document.getElementById("PLABlue");

    if (material == "ABS") {
        if (colour == "Grey") {
            ABSGrey.style.outline = "2px solid #ffffff31";

            PLABlack.style.outline = "2px solid #00000000";
            PLAWhite.style.outline = "2px solid #00000000";
            PLARed.style.outline = "2px solid #00000000";
            PLABlue.style.outline = "2px solid #00000000";

            selectedFilamentType = "ABS";
            selectedFilamentColour = "Grey";
        }
    }

    if (material == "PLA") {
        if (colour == "Black") {
            PLABlack.style.outline = "2px solid #ffffff31";

            ABSGrey.style.outline = "2px solid #00000000";
            PLAWhite.style.outline = "2px solid #00000000";
            PLARed.style.outline = "2px solid #00000000";
            PLABlue.style.outline = "2px solid #00000000";

            selectedFilamentType = "PLA";
            selectedFilamentColour = "Black";
        }

        if (colour == "White") {
            PLAWhite.style.outline = "2px solid #ffffff31";

            ABSGrey.style.outline = "2px solid #00000000";
            PLABlack.style.outline = "2px solid #00000000";
            PLARed.style.outline = "2px solid #00000000";
            PLABlue.style.outline = "2px solid #00000000";

            selectedFilamentType = "PLA";
            selectedFilamentColour = "White";
        }

        if (colour == "Red") {
            PLARed.style.outline = "2px solid #ffffff31";

            ABSGrey.style.outline = "2px solid #00000000";
            PLABlack.style.outline = "2px solid #00000000";
            PLAWhite.style.outline = "2px solid #00000000";
            PLABlue.style.outline = "2px solid #00000000";

            selectedFilamentType = "PLA";
            selectedFilamentColour = "Red";
        }

        if (colour == "Blue") {
            PLABlue.style.outline = "2px solid #ffffff31";

            ABSGrey.style.outline = "2px solid #00000000";
            PLABlack.style.outline = "2px solid #00000000";
            PLAWhite.style.outline = "2px solid #00000000";
            PLARed.style.outline = "2px solid #00000000";

            selectedFilamentType = "PLA";
            selectedFilamentColour = "Blue";
        }
    }
}