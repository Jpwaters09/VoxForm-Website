async function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (!username || !password) {
        alert("Please fill in all fields");
        return;
    }

    const res = await fetch('login.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password})
    });

    const data = await res.json();

    if (data.success) {
        window.location.href = 'dashboard.html';
    }

    else {
        alert(data.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('username').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });

    document.getElementById('password').addEventListener('keydown', function(e) {
        if (e.key == 'Enter') {
            login();
        }
    });
});
