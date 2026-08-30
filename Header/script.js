let headerLinksMobileMenu;
let menuButton;
let menuCloseButton;

function initialiseHeader() {
    headerLinksMobileMenu = document.getElementById("headerLinksMobileMenu");
    menuButton = document.getElementById("menuImg");
    menuCloseButton = document.getElementById("closeButton");
}

function showMobileMenu() {
    headerLinksMobileMenu.style.display = "flex";
    menuButton.style.display = "none";
    menuCloseButton.style.display = "";
}

function hideMobileMenu() {
    headerLinksMobileMenu.style.display = "none";
    menuButton.style.display = "";
    menuCloseButton.style.display = "none";
}

window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    }
    
    else {
        header.classList.remove('scrolled');
    }
});

window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    }
    
    else {
        header.classList.remove('scrolled');
    }
});

window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 50;

    document.getElementById("desktopHeader").classList.toggle('scrolled', scrolled);
    document.getElementById("mobileHeader").classList.toggle('scrolled', scrolled);
    document.getElementById("headerLogo").classList.toggle('scrolled', scrolled);
    document.getElementById("closeButton").classList.toggle('scrolled', scrolled);
    document.body.classList.toggle('scrolled', scrolled);
});