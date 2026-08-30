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