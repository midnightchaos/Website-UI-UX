// App.js - UI Logic and Interactions

document.addEventListener('DOMContentLoaded', () => {
    // Scroll Progress Bar
    const scrollProgress = document.getElementById('scroll-progress');
    window.addEventListener('scroll', () => {
        const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (totalScroll > 0) ? (window.scrollY / totalScroll) * 100 : 0;
        scrollProgress.style.width = `${progress}%`;
    });

    // Splash Screen Logic
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.classList.add('hidden');
            // Trigger initial hero animations after splash is gone
            setTimeout(() => {
                document.querySelectorAll('.hero-content .reveal-text, .hero-content .roll-in').forEach(el => el.classList.add('active'));

                // Activate nav
                const nav = document.querySelector('.glass-nav');
                if (nav) {
                    nav.classList.add('active');
                    const navItems = nav.querySelectorAll('.nav-item');
                    navItems.forEach((item, i) => {
                        item.style.transitionDelay = `${i * 0.1 + 0.3}s`;
                    });
                }
            }, 500);
        }
    }, 2500);

    // Letter Reveal Animation
    const revealText = (el) => {
        if (el.classList.contains('revealed-processed')) return;
        el.classList.add('revealed-processed');

        const text = el.textContent;
        el.textContent = '';
        el.style.opacity = '1';

        text.split('').forEach((char, i) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.animationDelay = `${i * 0.03}s`; // Faster reveal
            span.className = 'reveal-letter';
            el.appendChild(span);
        });
    };

    // Cursor Implementation
    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    document.body.appendChild(cursor);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Card Glow logic
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            if (mouseX > rect.left && mouseX < rect.right && mouseY > rect.top && mouseY < rect.bottom) {
                const x = mouseX - rect.left;
                const y = mouseY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            }
        });
    });

    const animateCursor = () => {
        // Smoothing (lerp)
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        requestAnimationFrame(animateCursor);
    };
    animateCursor();

    // Cursor Interaction States
    const interactiveElements = document.querySelectorAll('a, button, .card, input, textarea');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });

    // Reveal Observer Refined
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('section-title')) {
                    if (!entry.target.classList.contains('revealed')) {
                        revealText(entry.target);
                        entry.target.classList.add('revealed');
                    }
                } else if (entry.target.classList.contains('stagger-container')) {
                    entry.target.classList.add('active');
                    // Apply delays to children
                    const items = entry.target.querySelectorAll('.stagger-item, .roll-in');
                    items.forEach((item, i) => {
                        item.style.transitionDelay = `${i * 0.15}s`;
                    });
                } else {
                    entry.target.classList.add('active');
                }
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-text, .reveal-blur, .stagger-container, .roll-in').forEach(el => {
        revealObserver.observe(el);
    });

    // Contact Form Refined
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.textContent;

            btn.textContent = 'TRANSMITTED';
            btn.style.borderColor = 'var(--secondary)';
            btn.style.color = 'var(--secondary)';

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.borderColor = 'var(--primary)';
                btn.style.color = 'var(--primary)';
                contactForm.reset();
            }, 3000);
        });
    }

    // Smooth scroll for nav
    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetId.startsWith('#') && targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
