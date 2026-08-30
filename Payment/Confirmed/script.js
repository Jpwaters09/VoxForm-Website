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

document.addEventListener("DOMContentLoaded", function() {
    const params = new URLSearchParams(window.location.search);

    fetch(`/scripts/paymentSuccess.php?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                window.location.href = '/';
                return;
            }

            document.getElementById('subheading').innerHTML = `
                We've received your payment and your order is now being processed. Your order ID is <strong>#${data.orderID}</strong>.<br>
                A confirmation receipt has been sent to ${data.email}. If you have any questions, contact us at <a href="mailto:contact@voxform.co.uk">contact@voxform.co.uk</a>.
            `;
        });
});