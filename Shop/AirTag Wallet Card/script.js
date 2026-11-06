let selectedFilamentType;
let selectedFilamentColour;

let selectedImage = 1;

function leftBtnClick() {
    let productImage = document.getElementById("productImage");
    let image1Btn = document.getElementById("image1Btn");
    let image2Btn = document.getElementById("image2Btn");
    let image3Btn = document.getElementById("image3Btn");
    let image4Btn = document.getElementById("image4Btn");

    if (selectedImage == 2) {
        image1Btn.style.color = "#ffffff";
        image2Btn.style.color = "#8ba4bc";
        image2Btn.style.color = "#8ba4bc";
        image4Btn.style.color = "#8ba4bc";
        productImage.src = "/Assets/Images/Product/AirTag Wallet Card/Image 1.webp";
        productImage.alt = "Dart Holder";
        selectedImage = 1;
    }

    else if (selectedImage == 3) {
        image1Btn.style.color = "#8ba4bc";
        image2Btn.style.color = "#ffffff";
        image3Btn.style.color = "#8ba4bc";
        image3Btn.style.color = "#8ba4bc";
        productImage.src = "/Assets/Images/Product/AirTag Wallet Card/Image 2.webp";
        productImage.alt = "Dart Holder";
        selectedImage = 2;
    }

    else if (selectedImage == 4) {
        image1Btn.style.color = "#8ba4bc";
        image2Btn.style.color = "#8ba4bc";
        image3Btn.style.color = "#ffffff";
        image4Btn.style.color = "#8ba4bc";
        productImage.src = "/Assets/Images/Product/AirTag Wallet Card/Image 3.webp";
        productImage.alt = "Dart Holder";
        selectedImage = 3;
    }
}

function rightBtnClick() {
    let productImage = document.getElementById("productImage");
    let image1Btn = document.getElementById("image1Btn");
    let image2Btn = document.getElementById("image2Btn");
    let image3Btn = document.getElementById("image3Btn");
    let image4Btn = document.getElementById("image4Btn");

    if (selectedImage == 1) {
        image1Btn.style.color = "#8ba4bc";
        image2Btn.style.color = "#ffffff";
        image3Btn.style.color = "#8ba4bc";
        image4Btn.style.color = "#8ba4bc";
        productImage.src = "/Assets/Images/Product/AirTag Wallet Card/Image 2.webp";
        productImage.alt = "Dart Holder";
        selectedImage = 2;
    }

    else if (selectedImage == 2) {
        image1Btn.style.color = "#8ba4bc";
        image2Btn.style.color = "#8ba4bc";
        image3Btn.style.color = "#ffffff";
        image4Btn.style.color = "#8ba4bc";
        productImage.src = "/Assets/Images/Product/AirTag Wallet Card/Image 3.webp";
        productImage.alt = "Dart Holder";
        selectedImage = 3;
    }

    else if (selectedImage == 3) {
        image1Btn.style.color = "#8ba4bc";
        image2Btn.style.color = "#8ba4bc";
        image3Btn.style.color = "#8ba4bc";
        image4Btn.style.color = "#ffffff";
        productImage.src = "/Assets/Images/Product/AirTag Wallet Card/Image 4.webp";
        productImage.alt = "Dart Holder";
        selectedImage = 4;
    }
}

function imageBtn1() {
    let productImage = document.getElementById("productImage");
    let image1Btn = document.getElementById("image1Btn");
    let image2Btn = document.getElementById("image2Btn");
    let image3Btn = document.getElementById("image3Btn");
    let image4Btn = document.getElementById("image4Btn");

    image1Btn.style.color = "#ffffff";
    image2Btn.style.color = "#8ba4bc";
    image3Btn.style.color = "#8ba4bc";
    image4Btn.style.color = "#8ba4bc";
    productImage.src = "/Assets/Images/Product/AirTag Wallet Card/Image 1.webp";
    productImage.alt = "AirTag Wallet Card";
    selectedImage = 1;
}

function imageBtn2() {
    let productImage = document.getElementById("productImage");
    let image1Btn = document.getElementById("image1Btn");
    let image2Btn = document.getElementById("image2Btn");
    let image3Btn = document.getElementById("image3Btn");
    let image4Btn = document.getElementById("image4Btn");

    image1Btn.style.color = "#8ba4bc";
    image2Btn.style.color = "#ffffff";
    image3Btn.style.color = "#8ba4bc";
    image4Btn.style.color = "#8ba4bc";
    productImage.src = "/Assets/Images/Product/AirTag Wallet Card/Image 2.webp";
    productImage.alt = "AirTag Wallet Card";
    selectedImage = 2;
}

function imageBtn3() {
    let productImage = document.getElementById("productImage");
    let image1Btn = document.getElementById("image1Btn");
    let image2Btn = document.getElementById("image2Btn");
    let image3Btn = document.getElementById("image3Btn");
    let image4Btn = document.getElementById("image4Btn");

    image1Btn.style.color = "#8ba4bc";
    image2Btn.style.color = "#8ba4bc";
    image3Btn.style.color = "#ffffff";
    image4Btn.style.color = "#8ba4bc";
    productImage.src = "/Assets/Images/Product/AirTag Wallet Card/Image 3.webp";
    productImage.alt = "AirTag Wallet Card";
    selectedImage = 3;
}

function imageBtn4() {
    let productImage = document.getElementById("productImage");
    let image1Btn = document.getElementById("image1Btn");
    let image2Btn = document.getElementById("image2Btn");
    let image3Btn = document.getElementById("image3Btn");
    let image4Btn = document.getElementById("image4Btn");

    image1Btn.style.color = "#8ba4bc";
    image2Btn.style.color = "#8ba4bc";
    image3Btn.style.color = "#8ba4bc";
    image4Btn.style.color = "#ffffff";
    productImage.src = "/Assets/Images/Product/AirTag Wallet Card/Image 4.webp";
    productImage.alt = "AirTag Wallet Card";
    selectedImage = 4;
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

    if (!shipping) {
        alert("Please select a shipping method");
        return;
    }

    if (!selectedFilamentColour) {
        alert("Please choose the filament");
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
    formData.append("item", "AirTag Wallet Card");
    formData.append("city", cityInput);
    formData.append("filament_type1", selectedFilamentType);
    formData.append("filament_colour1", selectedFilamentColour);
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
    let ABSGreyBasic = document.getElementById("ABSGreyBasic");
    let PLABlackBasic = document.getElementById("PLABlackBasic");
    let PLAWhiteBasic = document.getElementById("PLAWhiteBasic");
    let PLAOliveGreenMatte = document.getElementById("PLAOliveGreenMatte");

    if (material == "ABS") {
        if (colour == "Grey (Basic)") {
            ABSGreyBasic.style.backgroundColor = "var(--btn-primary)";
            ABSGreyBasic.style.border = "1px solid var(--cyan)";

            PLABlackBasic.style.backgroundColor = "var(--btn-secondary)";
            PLAWhiteBasic.style.backgroundColor = "var(--btn-secondary)";
            PLAOliveGreenMatte.style.backgroundColor = "var(--btn-secondary)";

            PLABlackBasic.style.border = "1px solid var(--border)";
            PLAWhiteBasic.style.border = "1px solid var(--border)";
            PLAOliveGreenMatte.style.border = "1px solid var(--border)";

            selectedFilamentType = "ABS";
            selectedFilamentColour = "Grey (Basic)";
        }
    }

    if (material == "PLA") {
        if (colour == "Black (Basic)") {
            PLABlackBasic.style.backgroundColor = "var(--btn-primary)";
            PLABlackBasic.style.border = "1px solid var(--cyan)";

            ABSGreyBasic.style.backgroundColor = "var(--btn-secondary)";
            PLAWhiteBasic.style.backgroundColor = "var(--btn-secondary)";
            PLAOliveGreenMatte.style.backgroundColor = "var(--btn-secondary)";

            ABSGreyBasic.style.border = "1px solid var(--border)";
            PLAWhiteBasic.style.border = "1px solid var(--border)";
            PLAOliveGreenMatte.style.border = "1px solid var(--border)";

            selectedFilamentType = "PLA";
            selectedFilamentColour = "Black (Basic)";
        }

        if (colour == "White (Basic)") {
            PLAWhiteBasic.style.backgroundColor = "var(--btn-primary)";
            PLAWhiteBasic.style.border = "1px solid var(--cyan)";

            ABSGreyBasic.style.backgroundColor = "var(--btn-secondary)";
            PLABlackBasic.style.backgroundColor = "var(--btn-secondary)";
            PLAOliveGreenMatte.style.backgroundColor = "var(--btn-secondary)";

            ABSGreyBasic.style.border = "1px solid var(--border)";
            PLABlackBasic.style.border = "1px solid var(--border)";
            PLAOliveGreenMatte.style.border = "1px solid var(--border)";

            selectedFilamentType = "PLA";
            selectedFilamentColour = "White (Basic)";
        }

        if (colour == "Olive Green (Matte)") {
            PLAOliveGreenMatte.style.backgroundColor = "var(--btn-primary)";
            PLAOliveGreenMatte.style.border = "1px solid var(--cyan)";

            ABSGreyBasic.style.backgroundColor = "var(--btn-secondary)";
            PLABlackBasic.style.backgroundColor = "var(--btn-secondary)";
            PLAWhiteBasic.style.backgroundColor = "var(--btn-secondary)";

            ABSGreyBasic.style.border = "1px solid var(--border)";
            PLABlackBasic.style.border = "1px solid var(--border)";
            PLAWhiteBasic.style.border = "1px solid var(--border)";

            selectedFilamentType = "PLA";
            selectedFilamentColour = "Olive Green (Matte)";
        }
    }
}