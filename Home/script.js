let wrap;
let track;
let prevBtn;
let nextBtn;
let dotsEl;
let resizeTimer;
let startX = 0, dragging = false, dragDelta = 0;
let current = 0;
let cards;
let total;
const DELAY = 4000;
let autoTimer;

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

    wrap = document.getElementById("carousel");
    track = document.getElementById("carouselTrack");
    prevBtn = document.getElementById("prevBtn");
    nextBtn = document.getElementById("nextBtn");
    dotsEl = document.getElementById("carouselDots");

    cards = Array.from(track.children);
    total = cards.length;

    let autoTimer = setInterval(() => {
        goTo(current >= maxIndex() ? 0 : current + 1);
    }, DELAY);

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    wrap.addEventListener('pointerdown', e => {
        if (e.target.closest('.orderBtn')) return;

        startX = e.clientX;
        dragging = true;
        dragDelta = 0;
        wrap.setPointerCapture(e.pointerId);
    });

    wrap.addEventListener('pointermove', e => {
        if (!dragging) return;

        dragDelta = e.clientX - startX;

        const cardW = cards[0].offsetWidth + 20;
        const base = -current * cardW;

        track.style.transition = 'none';
        track.style.transform = `translateX(${base + dragDelta}px)`;
    });

    wrap.addEventListener('pointerup', () => {
        if (!dragging) return;

        dragging = false;
        track.style.transition = '';

        if (dragDelta < -60) goTo(current + 1);

        else if (dragDelta > 60) goTo(current - 1);

        else goTo(current);
    });

    wrap.addEventListener('pointerenter', () => clearInterval(autoTimer));
        wrap.addEventListener('pointerleave', () => {
        autoTimer = setInterval(() => {
            goTo(current >= maxIndex() ? 0 : current + 1);
        }, DELAY);
    });

    init();
});

function visibleCount() {
    const w = wrap.offsetWidth;
    if (w <= 520) return 1;
    if (w <= 900) return 2;

    return 4;
}

function maxIndex() {
    return Math.max(0, total - visibleCount());
}

function buildDots() {
    dotsEl.innerHTML = '';
    const pages = maxIndex() + 1;

    for (let i = 0; i < pages; i++) {
        const d = document.createElement('button');
        d.className = 'dot' + (i === current ? ' active' : '');
        d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        d.addEventListener('click', () => goTo(i));
        dotsEl.appendChild(d);
    }
}

function updateDots() {
    const dots = dotsEl.querySelectorAll('.dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
}

function goTo(idx) {
    current = Math.max(0, Math.min(idx, maxIndex()));
    const cardW = cards[0].offsetWidth + 20;

    track.style.transform = `translateX(${-current * cardW}px)`;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current >= maxIndex();

    updateDots();
}

function init() {
    buildDots();
    goTo(0);
}