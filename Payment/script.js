// const stripe = Stripe('pk_live_51TQXjvHtkpOTBmmygxq730yGu2KqtjVAwr0T76obUBhl5XJ7pZFq7yAXp2z1LDkTFlqKwyqyPNrGStGp2sT72MiA00g0U4XwdP'); // Main Mode
const stripe = Stripe('pk_test_51TQXjvHtkpOTBmmyR8Y1WKWQ8aC1m8VizCyqgpj0CbIYLc2C9s0G9bYuiMxCQNendI0NHDT9jFr0JuNAIazwv52M00Ai9WGp2X'); // Test Mode
let clientSecret;
let orderID;
let email;
let card;
let elements;

document.addEventListener("DOMContentLoaded", async function() {
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

    const params = new URLSearchParams(window.location.search);

    const response = await fetch(`/scripts/checkOrderDetails.php?${params.toString()}`);

    const result = await response.json();

    if (result.error) {
        alert("Could not find order");
        window.location.href = "/";
        return;
    }

    clientSecret = result.clientSecret;
    let itemName = result.itemName;
    let totalPrice = result.totalPrice;
    let itemPrice = result.price;
    let shippingPrice = result.shippingPrice;
    let quantity = result.quantity;
    let shipping = result.shipping;

    if (shipping == "RMT24") {
        shipping = "Royal Mail Tracked 24";
    }

    if (shipping == "RMT48") {
        shipping = "Royal Mail Tracked 48";
    }

    if (shipping == "IPLS") {
        shipping = "InPost (Locker or Shop)";
    }

    if (shipping == "IPHA") {
        shipping = "InPost (Home Address)";
    }

    document.getElementById("item").textContent = `${itemName} x ${quantity}`;
    document.getElementById("itemPrice").textContent = `£${itemPrice}`;
    document.getElementById("shippingHeading").textContent = `Shipping - ${shipping}`;
    document.getElementById("shippingPrice").textContent = `£${shippingPrice}`;
    document.getElementById("total").textContent = `£${totalPrice}`;
    document.getElementById("payNow").textContent = `Pay £${totalPrice}`;

    elements = stripe.elements({
        clientSecret,
        fonts: [
            {cssSrc: 'https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,100..900;1,100..900&display=swap'}
        ],
        appearance: {
            theme: 'stripe',
            variables: {
                colorBackground: '#111e30',
                colorText: '#8ba4bc',
                colorPrimary: '#00c8d4',
                colorDanger: '#df1b41',
                colorSuccess: '#30b130',
                colorWarning: '#e69e2c',
                fontFamily: '"Exo 2"',
                fontSizeBase: '16px',
                borderRadius: '10px',
                focusBoxShadow: 'none',
                focusOutline: '1px solid #00c8d4'
            }
        }
    });

    const paymentElement = elements.create('payment');
    paymentElement.mount("#cardElement");
});

async function payNow() {
    let payNowBtn = document.getElementById("payNow");

    document.body.style.cursor = "wait";
    payNowBtn.disabled = true;
    payNowBtn.textContent = "Processing...";

    const { error } = await stripe.confirmPayment({elements, confirmParams: {return_url: 'https://voxform.co.uk/Payment/Confirmed/'}});

    if (error) {
        alert(error.message);
        document.body.style.cursor = "default";
        payNowBtn.disabled = false;
        payNowBtn.textContent = "Pay Now";
        return;
    }
}