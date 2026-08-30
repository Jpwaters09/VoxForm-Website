function sendEmail() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    let sendBtn = document.getElementById("sendBtn");

    if (!name || !email || !subject || !message) {
        alert('Please fill in all fields');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        alert("Please enter a valid email address");
        return;
    }

    document.body.style.cursor = "wait";
    sendBtn.disabled = true;

    const formData = new FormData();

    formData.append('name', name);
    formData.append('email', email);
    formData.append('subject', subject);
    formData.append('messageBody', message);

    fetch("/scripts/sendEmail.php", {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert("Message sent! We will respond within 48 hours. If you don't hear back, please check your spam or junk folder.");
            document.getElementById('name').value = "";
            document.getElementById('email').value = "";
            document.getElementById('subject').selectedIndex = 0;
            document.getElementById('message').value = "";
        }

        else {
            alert(result.error || "Something went wrong. Please try again.");
        }
    })
    .catch(() => {
        alert("Network error! Please check your connection and try again.")
    })

    document.body.style.cursor = "default";
    sendBtn.disabled = false;
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