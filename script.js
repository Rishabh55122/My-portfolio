document.addEventListener('DOMContentLoaded', () => {
    // --- Custom Cursor ---
    const cursorDot = document.createElement('div');
    const cursorRing = document.createElement('div');
    cursorDot.classList.add('cursor-dot');
    cursorRing.classList.add('cursor-ring');
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorRing);

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Immediate update for dot
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });

    // Smooth follow for ring
    function animateCursor() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;

        cursorRing.style.left = `${ringX}px`;
        cursorRing.style.top = `${ringY}px`;

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effects
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .project-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });


    // --- Scroll Animations (Observer) ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Timeline specific animation
                if (entry.target.classList.contains('timeline-line')) {
                    entry.target.style.height = '100%';
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe fade-in elements (we need to add a fade-in class in HTML or style generically)
    // For now, let's look for sections and specific elements
    const animatedElements = document.querySelectorAll('.about-text, .project-card, .timeline-item, .contact-form');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });

    // We can reuse the observer logic to trigger the style change
    // Let's manually trigger the class addition in the observer callback
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => revealObserver.observe(el));

    // Timeline Line Observer
    const timelineLine = document.querySelector('.timeline-line');
    if (timelineLine) {
        // Set initial style
        timelineLine.style.transition = 'height 1.5s ease-out';
        observer.observe(timelineLine);
    }


    // --- Parallax Effect ---
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;

        // Hero background
        const heroBg = document.querySelector('.hero-bg');
        if (heroBg) {
            heroBg.style.transform = `scale(1.1) translateY(${scrolled * 0.5}px)`;
        }

        // Project images
        const projectImages = document.querySelectorAll('.project-img-inner');
        projectImages.forEach(img => {
            const speed = 0.1;
            const rect = img.getBoundingClientRect();
            // simple check if in view
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const yPos = -(rect.top * speed);
                img.style.backgroundPosition = `center ${yPos}px`;
            }
        });

        // --- Sticky Nav Glass darkening ---
        const nav = document.querySelector('.nav-bar');
        if (scrolled > 50) {
            nav.style.background = 'rgba(10, 10, 10, 0.8)';
            nav.style.padding = '15px 40px';
        } else {
            nav.style.background = 'transparent';
            nav.style.padding = '24px 40px';
        }
    });

    // --- Dynamic Time/Availability (Simulated) ---
    // Could fetch real time, but for design we stick to static "Available" or simple toggle

    // --- Type Foundry (Spring Physics & Interaction) ---
    const initTypeFoundry = () => {
        const section = document.getElementById('type-foundry');
        if (!section) return;

        // Elements
        const chars = document.querySelectorAll('.tf-char');
        const kerningValDisplay = document.getElementById('kerning-value');
        const weightValDisplay = document.getElementById('weight-value');
        const kerningBar = document.getElementById('kerning-bar');
        const weightBar = document.getElementById('weight-bar');

        // Physics State
        const physics = {
            kerning: { target: 0, current: 0, velocity: 0, k: 0.1, d: 0.8 },
            weight: { target: 600, current: 600, velocity: 0, k: 0.1, d: 0.8 }
        };

        const limits = {
            kerning: { min: -25, max: 25 }, // Reduced range for cleaner look
            weight: { min: 100, max: 900 }
        };

        let isHovering = false;

        const handleMouseMove = (e) => {
            if (!isHovering) return;
            const rect = section.getBoundingClientRect();
            const relX = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
            const relY = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);

            physics.kerning.target = limits.kerning.min + (relX * (limits.kerning.max - limits.kerning.min));
            physics.weight.target = limits.weight.min + (relY * (limits.weight.max - limits.weight.min));
        };

        section.addEventListener('mousemove', handleMouseMove);
        section.addEventListener('mouseenter', () => isHovering = true);
        section.addEventListener('mouseleave', () => {
            isHovering = false;
            physics.kerning.target = 0;
            physics.weight.target = 500;
        });

        const updatePhysics = () => {
            // Kerning Spring
            const kForce = (physics.kerning.target - physics.kerning.current) * physics.kerning.k;
            physics.kerning.velocity += kForce;
            physics.kerning.velocity *= physics.kerning.d;
            physics.kerning.current += physics.kerning.velocity;

            // Weight Spring
            const wForce = (physics.weight.target - physics.weight.current) * physics.weight.k;
            physics.weight.velocity += wForce;
            physics.weight.velocity *= physics.weight.d;
            physics.weight.current += physics.weight.velocity;

            requestAnimationFrame(updatePhysics);
            render();
        };

        const render = () => {
            const currentKerning = physics.kerning.current;
            const currentWeight = physics.weight.current;

            chars.forEach(char => {
                // If variable font not available, it handles 100-900 weight automatically if valid font family
                // Cormorant Garamond supports 300, 400, 500, 600, 700. We might need to map closely or let browser interpolate if it's variable.
                // Since we imported specific weights, it will snap to nearest if not variable. 
                // But let's try setting it.
                char.style.fontWeight = Math.round(currentWeight);

                // Margin for spacing
                char.style.marginRight = `${currentKerning * 0.5}px`;
                char.style.marginLeft = `${currentKerning * 0.5}px`;
            });

            if (kerningValDisplay) kerningValDisplay.textContent = `${currentKerning.toFixed(2)}pt`;
            if (weightValDisplay) weightValDisplay.textContent = `${Math.round(currentWeight)}WGHT`;

            const kPercent = ((currentKerning - limits.kerning.min) / (limits.kerning.max - limits.kerning.min)) * 100;
            const wPercent = ((currentWeight - limits.weight.min) / (limits.weight.max - limits.weight.min)) * 100;

            if (kerningBar) kerningBar.style.width = `${Math.max(0, Math.min(100, kPercent))}%`;
            if (weightBar) weightBar.style.width = `${Math.max(0, Math.min(100, wPercent))}%`;
        };

        updatePhysics();
    };

    initTypeFoundry();

    // --- Blueprint Mode Toggle ---
    const blueprintToggle = document.getElementById('blueprint-toggle');
    if (blueprintToggle) {
        blueprintToggle.addEventListener('click', () => {
            document.body.classList.toggle('blueprint-mode');
        });
    }

    // --- Mobile Nav Toggle ---
    const navToggle = document.getElementById('nav-toggle');
    const navDrawer = document.getElementById('nav-drawer');

    if (navToggle && navDrawer) {
        navToggle.addEventListener('click', () => {
            navDrawer.classList.toggle('open');
            // Toggle icon??
            const icon = navToggle.querySelector('.nav-icon');
            if (navDrawer.classList.contains('open')) {
                icon.textContent = '－'; // Close
            } else {
                icon.textContent = '＋'; // Open
            }
        });

        // Close on link click
        navDrawer.querySelectorAll('.nav-item').forEach(link => {
            link.addEventListener('click', () => {
                navDrawer.classList.remove('open');
                navToggle.querySelector('.nav-icon').textContent = '＋';
            });
        });
    }

    // --- Neural Archive Mobile Logic (Scroll Reveal) ---
    // Check if mobile
    if (window.innerWidth <= 768) {
        const viCols = document.querySelectorAll('.vi-col');

        const mobileArchiveObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Simulate hover effect
                    entry.target.style.zIndex = '5';
                    entry.target.querySelector('.vi-bg').style.transform = 'scale(1.1)';
                    entry.target.querySelector('.vi-bg').style.filter = 'grayscale(0%) brightness(0.8)';
                    entry.target.querySelector('.vi-module').style.transform = 'translateY(0)';
                    entry.target.querySelector('.vi-module').style.opacity = '1';
                    entry.target.querySelector('.vi-icon').style.opacity = '1';
                } else {
                    // Reset
                    entry.target.style.zIndex = '1';
                    entry.target.querySelector('.vi-bg').style.transform = 'scale(1)';
                    entry.target.querySelector('.vi-bg').style.filter = 'grayscale(100%) brightness(0.4)';
                    entry.target.querySelector('.vi-module').style.transform = 'translateY(20px)';
                    entry.target.querySelector('.vi-module').style.opacity = '0';
                    entry.target.querySelector('.vi-icon').style.opacity = '0';
                }
            });
        }, { threshold: 0.6 }); // 60% visibility to trigger

        viCols.forEach(col => mobileArchiveObserver.observe(col));
    }
    // --- Loading Screen Logic ---
    window.addEventListener('load', () => {
        const loader = document.getElementById('loader');
        const counter = document.getElementById('loader-counter');
        const memVal = document.getElementById('mem-val');

        if (loader && counter) {
            let count = 0;
            const interval = setInterval(() => {
                count += Math.floor(Math.random() * 5) + 1;
                if (count > 100) count = 100;

                counter.textContent = count < 10 ? `0${count}` : count;

                // Randomize mem value slightly
                if (memVal && Math.random() > 0.7) {
                    memVal.textContent = Math.floor(Math.random() * 20) + 30;
                }

                if (count === 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        loader.classList.add('loaded');
                    }, 500); // Slight delay at 100%
                }
            }, 30); // Speed of counter
        }
    });

    // Fallback if load event doesn't fire fast enough or already fired
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader && !loader.classList.contains('loaded')) {
            // Force load if stuck
            // But usually window.load is reliable. 
            // Just in case specifically for dev envs where load might be weird
        }
    }, 5000);
});
