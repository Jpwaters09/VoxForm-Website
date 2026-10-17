(async () => {
    const root = document.documentElement;

    if (!root.classList.contains('print-intro')) return;

    const content = document.getElementById('content');
    const logo = [...document.querySelectorAll('#headerLogo')]
        .find(el => el.getClientRects().length > 0);
    const bail = () => {
        clearTimeout(window.__printFailsafe);
        root.classList.remove('print-intro');
    };

    if (!content || !logo) return bail();

    let head = null;

    const decoded = [...content.querySelectorAll('img'), logo].map(i => i.decode().catch(() => {}));

    await Promise.race([
        Promise.all([document.fonts.ready, ...decoded]),
        new Promise(r => setTimeout(r, 1200))
    ]);

    if (!root.classList.contains('print-intro')) return;

    clearTimeout(window.__printFailsafe);
    window.scrollTo({ top: 0, behavior: 'instant' });

    const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
    const easeIO = t => 0.5 - 0.5 * Math.cos(Math.PI * t);
    const vh = () => (window.visualViewport ? visualViewport.height : innerHeight);

    const L = logo.getBoundingClientRect();
    const C0 = content.getBoundingClientRect();
    const tip = L.height;
    const mobile = innerWidth < 700;
    
    const dropMs = clamp((C0.top + C0.height) * 0.5, 650, 1100);
    const printMs = clamp(C0.height * 1.6, 3000, 4200);
    const homeMs = 500;
    const total = dropMs + printMs + homeMs;

    let sweeps = clamp(Math.round(C0.height / (mobile ? 160 : 90)), 10, 30);
    sweeps += sweeps % 2;

    head = document.createElement('div');
    const inner = document.createElement('div');
    const bar = document.createElement('div');
    const v = logo.cloneNode();

    v.removeAttribute('id');

    v.style.cssText = `width:${L.width}px; height:${L.height}px`;
    head.id = 'printHead';
    bar.id = 'printLayer';
    bar.style.top = tip + 'px';
    head.style.transform = `translate(${L.left}px, ${L.top}px)`;
    inner.appendChild(v);
    head.append(inner, bar);
    document.body.appendChild(head);
    logo.style.visibility = 'hidden';

    let raf, done = false;
    let sy = scrollY;
    let last = performance.now();
    const t0 = last;

    const stay  = () => finish(true);
    const toTop = () => finish(false);
    const listeners = [['wheel', stay], ['touchmove', stay], ['keydown', stay], ['click', toTop]];

    const finish = (skipped) => {
        if (done) return;

        done = true;

        cancelAnimationFrame(raf);

        listeners.forEach(([e, fn]) => removeEventListener(e, fn));
        root.classList.remove('print-intro');
        content.style.clipPath = '';
        head.remove();
        logo.style.visibility = '';

        if (!skipped) window.scrollTo({ top: 0, behavior: 'instant' });
    };

    const frame = (now) => {
        if (done) return;

        const dt = clamp(now - last, 0, 50);
        last = now;

        const t = Math.max(0, now - t0);

        if (t >= total) return finish(false);

        const r = content.getBoundingClientRect();
        const R = { left: r.left + scrollX, top: r.top + scrollY, w: r.width, h: r.height };

        let ox, y, ix = 0, p = 0, barOpacity = 0;

        if (t < dropMs) {
            const k = easeIO(t / dropMs);

            ox = L.left + (R.left - L.left) * k;
            y  = L.top + (R.top + R.h - tip - L.top) * k;
        }
        
        else if (t < dropMs + printMs) {
            const u = (t - dropMs) / printMs;

            p  = easeIO(u);
            ox = R.left;
            y  = R.top + (1 - p) * R.h - tip;

            const s = u * sweeps, f = s % 2;

            ix = easeIO(f < 1 ? f : 2 - f) * (R.w - L.width);
            barOpacity = Math.min(1, u * 30, (1 - u) * 30);
            bar.style.width = R.w + 'px';
        }
        
        else {
            p  = 1;

            const k = easeIO(clamp((t - dropMs - printMs) / homeMs, 0, 1));
            const y0 = R.top - tip;

            ox = R.left + (L.left - R.left) * k;
            y  = y0 + (L.top - y0) * k;
        }

        content.style.clipPath = `inset(${(1 - p) * 100}% 0 0 0)`;
        head.style.transform = `translate(${ox}px, ${y}px)`;
        inner.style.transform = `translateX(${ix}px)`;
        bar.style.opacity = barOpacity;

        const max = Math.max(0, root.scrollHeight - vh());
        const target = clamp(y + tip / 2 - vh() * 0.4, 0, max);

        sy += (target - sy) * (1 - Math.exp(-dt / 70));
        window.scrollTo({ top: sy, behavior: 'instant' });

        raf = requestAnimationFrame(frame);
    };

    listeners.forEach(([e, fn]) => addEventListener(e, fn, { passive: true }));

    raf = requestAnimationFrame(frame);
    
    setTimeout(() => finish(false), total + 2000);
})();