<!DOCTYPE html>

<html lang="en-GB">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="/Shop/Dart Holder/styles.css">
        <link rel="shortcut icon" href="/Assets/Images/Icon.png" type="image/png">
        <script src="/Shop/Dart Holder/script.js"></script>
        <link rel="canonical" href="https://voxform.co.uk/Shop/AirTag%20Wallet%20Card/">
        <link rel="stylesheet" href="/Header/styles.css">
        <link rel="stylesheet" href="/Footer/styles.css">
        <script src="/Header/script.js" defer></script>
        <meta property="og:title" content="AirTag Wallet Card | VoxForm">
        <meta property="og:description" content="A slim, credit card-sized holder that snaps your AirTag in securely.">
        <meta property="og:image" content="https://voxform.co.uk/Assets/Images/Product/AirTag%20Wallet%20Card/Image%201.webp">
        <meta property="og:url" content="https://voxform.co.uk/Shop/Dart%20Holder/">
        <meta property="og:type" content="product">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:image" content="https://voxform.co.uk/Assets/Images/Product/AirTag%20Wallet%20Card/Image%201.webp">
        <title>AirTag Wallet Card | VoxForm</title>

        <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "3D Printed Dart Holder",
            "image": "https://voxform.co.uk/Assets/Images/Product/AirTag%20Wallet%20Card/Image%201.webp",
            "description": "A slim, credit card-sized holder that snaps your AirTag in securely.",
            "brand": {
                "@type": "Brand",
                "name": "VoxForm"
            },
            "offers": {
                "@type": "Offer",
                "url": "https://voxform.co.uk/Shop/AirTag%20Wallet%20Card/",
                "priceCurrency": "GBP",
                "price": "4.99",
                "availability": "https://schema.org/InStock",
                "itemCondition": "https://schema.org/NewCondition"
            }
        }
        </script>
    </head>
    <body>
        <div id="header"><?php include $_SERVER['DOCUMENT_ROOT'] . '/Header/index.html'; ?></div>

        <div id="content">
            <div id="images">
                <img id="productImage" src="/Assets/Images/Product/Dart Holder/Image 1.webp" alt="Dart Holder">
                <div id="imageSelector">
                    <img onclick="leftBtnClick()" id="leftBtn" src="/Assets/Images/Back.svg" alt="Left">
                    
                    <button onclick="imageBtn1()" id="image1Btn">1</button>
                    <button onclick="imageBtn2()" id="image2Btn">2</button>
                    <button onclick="imageBtn3()" id="image3Btn">3</button>
                    <button onclick="imageBtn4()" id="image4Btn">4</button>

                    <img onclick="rightBtnClick()" id="rightBtn" src="/Assets/Images/Forward.svg" alt="Right">
                </div>
            </div>
            <div id="info">
                <span id="itemTitle">AirTag Wallet Card</span>
                <span id="itemPrice">£4.99</span>
                <span id="descriptionText">Description</span>
                <h1 id="itemDescription">
                    Keep your AirTag with you without the bulk. This slim, credit card-sized holder fits neatly into any wallet or card slot, and your AirTag snaps in securely, with no glue or adhesive needed.
                    <br>
                    It sits flush alongside your other cards. It's 3D printed in the UK by VoxForm, with an open crosshatch infill pattern that gives it a clean, technical look.
                    <br>
                    AirTag not included.
                </h1>

                <button onclick="order()" id="orderBtn">Order</button>
            </div>

            <div id="placedPopup" style="display: none;">
                <span id="orderStatusHeading">Order Successfully Placed!</span>
                <span id="orderSucccesfulSubheading"></span>

                <span id="orderNumberText" style="display: none;">Your order number is:</span>
                <span id="orderNumber"></span>

                <button id="closeBtn" onclick="closePopup()">Close</button>

            </div>

            <div id="orderForm" style="display: none;">
                <span id="orderHeading">Order AirTag Wallet Card</span>

                <span id="orderDetails">Enter your details below and we'll send you an email with a secure payment link. Once your payment is complete, you'll receive a confirmation email with your order summary.</span>
                
                <span id="quantityHeading">Quantity</span>
                <input type="number" id="quantity" value="1" max="10" min="1">
                
                <span id="materialsHeading">Material & Colour</span>
                <span id="materialsInfo">Not sure which material to choose? Visit our <a href="/About" target="_blank">About page</a> to learn more about our filament materials. Please note: The physical print may differ slightly in colour compared to the preview.</span>

                <span id="ABSHeading">ABS</span>
                <span id="ABSDescription">Strong and heat resistant, suited for demanding applications</span>
                <div id="ABSColours">
                    <div id="ABSGreyBasic" class="ABSColour" onclick="filamentColour('ABS', 'Grey (Basic)')">
                        <div class="ABSColourBtn" style="background-color: #8f949b;"></div>
                        <span class="ABSColourText">Grey (Basic)</span>
                    </div>
                </div>
                
                <span id="PLAHeading">PLA</span>
                <span id="PLADescription">Great for detailed prints and everyday use</span>
                <div id="PLAColours">
                    <div id="PLABlackBasic" class="PLAColour" onclick="filamentColour('PLA', 'Black (Basic)')">
                        <div class="PLAColourBtn" style="background-color: #000000;"></div>
                        <span class="PLAColourText">Black (Basic)</span>
                    </div>

                    <div id="PLAWhiteBasic" class="PLAColour" onclick="filamentColour('PLA', 'White (Basic)')">
                        <div class="PLAColourBtn" style="background-color: #ffffff;"></div>
                        <span class="PLAColourText">White (Basic)</span>
                    </div>

                    <div id="PLAOliveGreenMatte" class="PLAColour" onclick="filamentColour('PLA', 'Olive Green (Matte)')">
                        <div class="PLAColourBtn" style="background-color: #5a6d3d;"></div>
                        <span class="PLAColourText">Olive Green (Matte)</span>
                    </div>
                </div>

                <span id="shippingHeading">Shipping</span>
                <span id="shippingDescription">For shipping estimates, please use the <a href="https://send.royalmail.com/" target="_blank">Royal Mail Website</a> or the <a href="https://www.yodel.co.uk/send-a-parcel" target="_blank">Yodel Website</a>.</span>
                <select id="shipping">
                    <option value="" disabled selected>Select Shipping</option>
                    <option value="RMT24">Royal Mail Tracked 24 - 1-2 days</option>
                    <option value="RMT48">Royal Mail Tracked 48 - 2-3 days</option>
                    <option value="YODEL">Yodel - 4-5 days</option>
                </select>

                <div id="orderFormDiv">
                    <div id="left">
                        <span id="nameHeading">Name</span>
                        <input type="text" id="nameInput" placeholder="Your Name">

                        <span id="emailHeading">Email</span>
                        <input type="email" id="emailInput" placeholder="Your Email">
                        
                        <span id="phoneHeading">Phone Number</span>
                        <input type="tel" id="phoneInput" placeholder="Your Phone Number">

                        <span id="address1Heading">Address Line 1</span>
                        <input type="text" id="address1Input" placeholder="Address Line 1">

                        <span id="address2Heading">Address Line 2</span>
                        <input type="text" id="address2Input" placeholder="Address Line 2 (optional)">
                    </div>
                    

                    <div id="right">
                        <span id="cityHeading">City</span>
                        <input type="text" id="cityInput" placeholder="City">

                        <span id="countyHeading">County</span>
                        <input type="text" id="countyInput" placeholder="County">

                        <span id="postcodeHeading">Postcode</span>
                        <input type="text" id="postcodeInput" placeholder="Postcode">

                        <span id="countryHeading">Country</span>
                        <input type="text" id="countryInput" placeholder="Country">
                    </div>
                </div>

                <div id="legalBox">
                    <input type="checkbox" id="readLegalBox">
                    <span id="legalText">I have read and agree to the <a target="_blank" href="/Legal/">Legal Policies</a>, including our Terms & Conditions, Privacy Policy, and Returns & Refunds Policy.</span>
                </div>
                
                <div id="orderFormBtns">
                    <button onclick="submit()" id="submitBtn">Submit</button>
                    <button onclick="closeOrderPopup()" id="closeBtn2">Close</button>
                </div>
            </div>

            <div id="dim" style="display: none;"></div>
        </div>

        <div id="footer"><?php include $_SERVER['DOCUMENT_ROOT'] . '/Footer/index.html'; ?></div>
    </body>
</html>
