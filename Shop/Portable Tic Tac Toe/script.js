let selectedFilamentType1;
let selectedFilamentType2;
let selectedFilamentColour1;
let selectedFilamentColour2;

let selectedImage = 1;

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

function leftBtnClick() {
    let productImage = document.getElementById("productImage");
    let image1Btn = document.getElementById("image1Btn");
    let image2Btn = document.getElementById("image2Btn");

    if (selectedImage == 2) {
        image1Btn.style.color = "#ffffff";
        image2Btn.style.color = "#8ba4bc";
        productImage.src = "/Assets/Images/Product/Portable Tic Tac Toe/Image 1.webp";
        productImage.alt = "Portable Tic Tac Toe";
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
        productImage.src = "/Assets/Images/Product/Portable Tic Tac Toe/Image 2.webp";
        productImage.alt = "Portable Tic Tac Toe";
        selectedImage = 2;
    }
}

function imageBtn1() {
    let productImage = document.getElementById("productImage");
    let image1Btn = document.getElementById("image1Btn");
    let image2Btn = document.getElementById("image2Btn");

    image1Btn.style.color = "#ffffff";
    image2Btn.style.color = "#8ba4bc";
    productImage.src = "/Assets/Images/Product/Portable Tic Tac Toe/Image 1.webp";
    productImage.alt = "Portable Tic Tac Toe";
    selectedImage = 1;
}

function imageBtn2() {
    let productImage = document.getElementById("productImage");
    let image1Btn = document.getElementById("image1Btn");
    let image2Btn = document.getElementById("image2Btn");

    image1Btn.style.color = "#8ba4bc";
    image2Btn.style.color = "#ffffff";
    productImage.src = "/Assets/Images/Product/Portable Tic Tac Toe/Image 2.webp";
    productImage.alt = "Portable Tic Tac Toe";
    selectedImage = 2;
}

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
    
    if (!selectedFilamentColour1) {
        alert("Please choose the filament");
        return;
    }
    
    if (!selectedFilamentColour2) {
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
    formData.append("item", "Portable Tic Tac Toe");
    formData.append("city", cityInput);
    formData.append("filament_type1", selectedFilamentType1);
    formData.append("filament_type2", selectedFilamentType2);
    formData.append("filament_colour1", selectedFilamentColour1);
    formData.append("filament_colour2", selectedFilamentColour2);
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
    document.getElementById("quantity").value = "1";
    document.getElementById("shipping").selectedIndex = 0;
    document.getElementById("readLegalBox").checked = false;

    ABSGrey.style.outline = "2px solid #00000000";
    PLABlack.style.outline = "2px solid #00000000";
    PLAWhite.style.outline = "2px solid #00000000";
    PLARed.style.outline = "2px solid #00000000";
    PLABlue.style.outline = "2px solid #00000000";

    selectedFilamentType1 = "";
    selectedFilamentType2 = "";
    selectedFilamentColour1 = "";
    selectedFilamentColour2 = "";
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

function filamentColour1(material, colour) {
    let ABSGrey1 = document.getElementById("ABSGrey1");
    let PLABlack1 = document.getElementById("PLABlack1");
    let PLAWhite1 = document.getElementById("PLAWhite1");
    let PLARed1 = document.getElementById("PLARed1");
    let PLABlue1 = document.getElementById("PLABlue1");

    if (material == "ABS") {
        if (colour == "Grey") {
            ABSGrey1.style.outline = "2px solid #ffffff31";

            PLABlack1.style.outline = "2px solid #00000000";
            PLAWhite1.style.outline = "2px solid #00000000";
            PLARed1.style.outline = "2px solid #00000000";
            PLABlue1.style.outline = "2px solid #00000000";

            selectedFilamentType1 = "ABS";
            selectedFilamentColour1 = "Grey";
        }
    }

    if (material == "PLA") {
        if (colour == "Black") {
            PLABlack1.style.outline = "2px solid #ffffff31";

            ABSGrey1.style.outline = "2px solid #00000000";
            PLAWhite1.style.outline = "2px solid #00000000";
            PLARed1.style.outline = "2px solid #00000000";
            PLABlue1.style.outline = "2px solid #00000000";

            selectedFilamentType1 = "PLA";
            selectedFilamentColour1 = "Black";
        }

        if (colour == "White") {
            PLAWhite1.style.outline = "2px solid #ffffff31";

            ABSGrey1.style.outline = "2px solid #00000000";
            PLABlack1.style.outline = "2px solid #00000000";
            PLARed1.style.outline = "2px solid #00000000";
            PLABlue1.style.outline = "2px solid #00000000";

            selectedFilamentType1 = "PLA";
            selectedFilamentColour1 = "White";
        }

        if (colour == "Red") {
            PLARed1.style.outline = "2px solid #ffffff31";

            ABSGrey1.style.outline = "2px solid #00000000";
            PLABlack1.style.outline = "2px solid #00000000";
            PLAWhite1.style.outline = "2px solid #00000000";
            PLABlue1.style.outline = "2px solid #00000000";

            selectedFilamentType1 = "PLA";
            selectedFilamentColour1 = "Red";
        }

        if (colour == "Blue") {
            PLABlue1.style.outline = "2px solid #ffffff31";

            ABSGrey1.style.outline = "2px solid #00000000";
            PLABlack1.style.outline = "2px solid #00000000";
            PLAWhite1.style.outline = "2px solid #00000000";
            PLARed1.style.outline = "2px solid #00000000";

            selectedFilamentType1 = "PLA";
            selectedFilamentColour1 = "Blue";
        }
    }
}

function filamentColour2(material, colour) {
    let ABSGrey2 = document.getElementById("ABSGrey2");
    let PLABlack2 = document.getElementById("PLABlack2");
    let PLAWhite2 = document.getElementById("PLAWhite2");
    let PLARed2 = document.getElementById("PLARed2");
    let PLABlue2 = document.getElementById("PLABlue2");

    if (material == "ABS") {
        if (colour == "Grey") {
            ABSGrey2.style.outline = "2px solid #ffffff31";

            PLABlack2.style.outline = "2px solid #00000000";
            PLAWhite2.style.outline = "2px solid #00000000";
            PLARed2.style.outline = "2px solid #00000000";
            PLABlue2.style.outline = "2px solid #00000000";

            selectedFilamentType2 = "ABS";
            selectedFilamentColour2 = "Grey";
        }
    }

    if (material == "PLA") {
        if (colour == "Black") {
            PLABlack2.style.outline = "2px solid #ffffff31";

            ABSGrey2.style.outline = "2px solid #00000000";
            PLAWhite2.style.outline = "2px solid #00000000";
            PLARed2.style.outline = "2px solid #00000000";
            PLABlue2.style.outline = "2px solid #00000000";

            selectedFilamentType2 = "PLA";
            selectedFilamentColour2 = "Black";
        }

        if (colour == "White") {
            PLAWhite2.style.outline = "2px solid #ffffff31";

            ABSGrey2.style.outline = "2px solid #00000000";
            PLABlack2.style.outline = "2px solid #00000000";
            PLARed2.style.outline = "2px solid #00000000";
            PLABlue2.style.outline = "2px solid #00000000";

            selectedFilamentType2 = "PLA";
            selectedFilamentColour2 = "White";
        }

        if (colour == "Red") {
            PLARed2.style.outline = "2px solid #ffffff31";

            ABSGrey2.style.outline = "2px solid #00000000";
            PLABlack2.style.outline = "2px solid #00000000";
            PLAWhite2.style.outline = "2px solid #00000000";
            PLABlue2.style.outline = "2px solid #00000000";

            selectedFilamentType2 = "PLA";
            selectedFilamentColour2 = "Red";
        }

        if (colour == "Blue") {
            PLABlue2.style.outline = "2px solid #ffffff31";

            ABSGrey2.style.outline = "2px solid #00000000";
            PLABlack2.style.outline = "2px solid #00000000";
            PLAWhite2.style.outline = "2px solid #00000000";
            PLARed2.style.outline = "2px solid #00000000";

            selectedFilamentType2 = "PLA";
            selectedFilamentColour2 = "Blue";
        }
    }
}