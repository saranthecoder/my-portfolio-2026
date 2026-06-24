document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================================================
       0. INTRO PRELOADER & FLAG ANIMATION
       ========================================================================== */
    const preloader = document.getElementById('preloader');
    const loaderFlag = document.getElementById('loaderFlag');
    const flyingIn = document.getElementById('flyingIn');
    const headerIn = document.querySelector('.header .logo .tricolor-text');
    const headerLogo = document.querySelector('.header .logo');
    const entryVideo = document.getElementById('entryVideo');

    if (preloader) {
        // Prevent scrolling during intro
        document.body.classList.add('no-scroll');
        
        // Hide target tricolor-text in header initially
        if (headerIn) {
            headerIn.style.opacity = '0';
            headerIn.style.transition = 'opacity 0.2s ease';
        }

        let introStarted = false;
        
        const startMorphAndFlight = () => {
            if (introStarted) return;
            introStarted = true;

            // 1. Start flight immediately to navbar (from center of video)
            if (flyingIn && headerIn) {
                // Clear CSS entrance animation so it doesn't block the transform transition
                flyingIn.style.animation = 'none';
                
                const startRect = flyingIn.getBoundingClientRect();
                const endRect = headerIn.getBoundingClientRect();
                
                const startX = startRect.left + startRect.width / 2;
                const startY = startRect.top + startRect.height / 2;
                const endX = endRect.left + endRect.width / 2;
                const endY = endRect.top + endRect.height / 2;
                
                const deltaX = endX - startX;
                const deltaY = endY - startY;
                const scale = endRect.width / startRect.width;

                flyingIn.style.transition = 'transform 1.2s cubic-bezier(0.25, 1, 0.3, 1), opacity 0.8s ease';
                flyingIn.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px)) scale(${scale})`;
            }

            // 2. Dock "in" to header logo, pulse logo, and fade out the preloader screen (video + background) after flight ends (1.2s)
            setTimeout(() => {
                if (headerIn) {
                    headerIn.style.opacity = '1';
                }
                if (headerLogo) {
                    headerLogo.classList.add('logo-pulse');
                    setTimeout(() => {
                        headerLogo.classList.remove('logo-pulse');
                    }, 550);
                }
                if (flyingIn) {
                    flyingIn.style.opacity = '0';
                }
                
                // Fade out both the video loader container and the main preloader background together
                if (loaderFlag) {
                    loaderFlag.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                    loaderFlag.style.opacity = '0';
                    loaderFlag.style.transform = 'scale(0.95)';
                }
                if (preloader) {
                    preloader.style.transition = 'opacity 0.8s ease';
                    preloader.style.opacity = '0';
                    preloader.style.pointerEvents = 'none';
                }
            }, 1200);

            // 3. Clean up preloader and enable scroll after fade out completes (2.0s)
            setTimeout(() => {
                if (preloader) {
                    preloader.style.display = 'none';
                }
                document.body.classList.remove('no-scroll');
            }, 2000);
        };

        if (entryVideo) {
            // Morph as soon as video ends
            entryVideo.addEventListener('ended', startMorphAndFlight);

            // Handle video loading errors immediately
            entryVideo.addEventListener('error', () => {
                console.warn('Video preloader failed to load, opening page immediately.');
                startMorphAndFlight();
            });

            // Attempt to play the video and catch autoplay blockages (e.g. low-power mode or browser policies)
            entryVideo.play().catch(err => {
                console.warn('Video preloader autoplay was blocked:', err);
                // Start fallback morph after a short 1s delay so the user isn't stuck on a blank screen
                setTimeout(startMorphAndFlight, 1000);
            });
            
            // Absolute fallback after 4.5 seconds in case video gets stuck or is blocked from playing
            setTimeout(startMorphAndFlight, 4500);
        } else {
            // Immediately start fallback if video doesn't exist
            setTimeout(startMorphAndFlight, 1500);
        }
    }
    
    /* ==========================================================================
       1. HEADER SCROLL & PROGRESS EFFECT
       ========================================================================== */
    const header = document.querySelector('.header');
    const scrollProgress = document.getElementById('scrollProgress');
    
    window.addEventListener('scroll', () => {
        // Header styling on scroll
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Scroll progress calculation
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (windowHeight > 0) {
            const scrollPercent = (window.scrollY / windowHeight) * 100;
            scrollProgress.style.width = scrollPercent + '%';
        }

        // Timeline line filling effect
        updateTimelineProgress();
    });

    /* ==========================================================================
       2. INTERACTIVE CANVAS PARTICLE SYSTEM (WOW Factor)
       ========================================================================== */
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');

    let particles = [];
    const particleCount = 45;
    let mouse = { x: null, y: null, radius: 150 };

    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1; // small elegant nodes
            this.baseX = this.x;
            this.baseY = this.y;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.density = (Math.random() * 30) + 10;
        }

        draw() {
            ctx.fillStyle = 'rgba(255, 90, 31, 0.45)'; // Soft orange particles
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }

        update() {
            // Constant drifting motion
            this.x += this.speedX;
            this.y += this.speedY;

            // Bounce off canvas boundaries
            if (this.x < 0 || this.x > canvas.width) this.speedX = -this.speedX;
            if (this.y < 0 || this.y > canvas.height) this.speedY = -this.speedY;

            // Mouse Interactive gravity
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                
                if (distance < mouse.radius) {
                    let force = (mouse.radius - distance) / mouse.radius;
                    let directionX = forceDirectionX * force * this.density * 0.3;
                    let directionY = forceDirectionY * force * this.density * 0.3;
                    
                    // Repel slightly
                    this.x -= directionX;
                    this.y -= directionY;
                }
            }
        }
    }

    const initParticles = () => {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    };
    initParticles();

    const connectParticles = () => {
        let opacityValue = 1;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let dx = particles[a].x - particles[b].x;
                let dy = particles[a].y - particles[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                // Connect nodes that are close to each other
                if (distance < 110) {
                    opacityValue = 1 - (distance / 110);
                    ctx.strokeStyle = `rgba(0, 0, 0, ${opacityValue * 0.04})`; // Subtle dark connections
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    };

    const animateParticles = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        connectParticles();
        requestAnimationFrame(animateParticles);
    };
    animateParticles();

    /* ==========================================================================
       3. TYPEWRITER DYNAMIC TEXT EFFECT
       ========================================================================== */
    const typedTextSpan = document.getElementById('typedText');
    const roles = [
        "Full Stack Developer.",
        "Technical Trainer.",
        "GenAI & MERN Expert.",
        "Engineering Mentor."
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    const typeRole = () => {
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            typedTextSpan.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50; // faster deletion
        } else {
            typedTextSpan.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100; // standard typing
        }

        if (!isDeleting && charIndex === currentRole.length) {
            isDeleting = true;
            typingSpeed = 2000; // Pause at full word
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typingSpeed = 500; // brief pause before next word
        }

        setTimeout(typeRole, typingSpeed);
    };
    setTimeout(typeRole, 1000);

    /* ==========================================================================
       4. MOBILE MENU INTERACTIVITY
       ========================================================================== */
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    const toggleMenu = () => {
        mobileMenuBtn.classList.toggle('active');
        mobileNav.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    };

    mobileMenuBtn.addEventListener('click', toggleMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileNav.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    /* ==========================================================================
       5. EXPERIENCE COLLAPSIBLE CARDS & CENTER LINE FILL
       ========================================================================== */
    const expContainer = document.querySelector('.experience-layout-container');
    const centerLineFill = document.querySelector('.experience-center-line-fill');
    const expCards = document.querySelectorAll('.exp-card');

    const updateTimelineProgress = () => {
        if (!expContainer || !centerLineFill) return;

        const containerTop = expContainer.getBoundingClientRect().top + window.scrollY;
        const containerHeight = expContainer.offsetHeight;
        const viewportMid = window.scrollY + (window.innerHeight * 0.50);

        let progress = ((viewportMid - containerTop) / containerHeight) * 100;
        progress = Math.max(0, Math.min(100, progress));
        centerLineFill.style.height = progress + '%';

        // Auto-expand/collapse cards as the center line progress reaches them
        expCards.forEach(card => {
            const cardTop = card.getBoundingClientRect().top + window.scrollY;
            // The horizontal dot connector sits at cardTop + 38px
            if (viewportMid >= cardTop + 38) {
                if (!card.classList.contains('active')) {
                    card.classList.add('active');
                }
            } else {
                if (card.classList.contains('active')) {
                    card.classList.remove('active');
                }
            }
        });
    };

    expCards.forEach(card => {
        const header = card.querySelector('.exp-card-header');
        if (header) {
            header.addEventListener('click', (e) => {
                if (e.target.tagName === 'A' || e.target.closest('a')) return;
                card.classList.toggle('active');
                
                // Recalculate container height and progress fill after a brief layout transition
                setTimeout(updateTimelineProgress, 400);
            });
        }
    });

    /* ==========================================================================
       6. 3D TILT EFFECT (Cards)
       ========================================================================== */
    const tiltCards = document.querySelectorAll('.tilt-target');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const cardRect = card.getBoundingClientRect();
            const cardWidth = cardRect.width;
            const cardHeight = cardRect.height;
            const centerX = cardRect.left + cardWidth / 2;
            const centerY = cardRect.top + cardHeight / 2;
            const mouseX = e.clientX - centerX;
            const mouseY = e.clientY - centerY;

            // Maximum rotation angle in degrees
            const maxRotate = 6;
            const rotateX = ((mouseY / (cardHeight / 2)) * -maxRotate).toFixed(2);
            const rotateY = ((mouseX / (cardWidth / 2)) * maxRotate).toFixed(2);

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            card.style.transition = 'transform 0.1s ease-out';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
            card.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
        });
    });

    /* ==========================================================================
       7. MAGNETIC BUTTON EFFECT
       ========================================================================== */
    const magneticBtns = document.querySelectorAll('.magnetic');

    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Shift element toward mouse coordinate
            btn.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px) scale(1.03)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = `translate(0px, 0px) scale(1)`;
        });
    });

    /* ==========================================================================
       8. PROJECTS GRID FILTER
       ========================================================================== */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const filterValue = e.target.getAttribute('data-filter');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
                    card.classList.remove('hide');
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.classList.add('hide');
                }
            });
        });
    });

    /* ==========================================================================
       9. SCROLL REVEAL ANIMATIONS (Intersection Observer)
       ========================================================================== */
    const revealElements = document.querySelectorAll('.scroll-reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px'
    });

    const triggerReveal = () => {
        revealElements.forEach(element => {
            if (element.getBoundingClientRect().top < window.innerHeight) {
                element.classList.add('active');
            }
            revealObserver.observe(element);
        });
    };

    triggerReveal();

    /* ==========================================================================
       10. STATS COUNTER ANIMATION
       ========================================================================== */
    const statsNumbers = document.querySelectorAll('.stat-number');
    let animatedStats = false;

    const animateCounters = () => {
        statsNumbers.forEach(stat => {
            const target = +stat.getAttribute('data-target');
            const duration = 2000;
            const stepTime = 30;
            const steps = duration / stepTime;
            const increment = target / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    clearInterval(timer);
                    if (target === 4) {
                        stat.textContent = '4+';
                    } else if (target === 2500) {
                        stat.textContent = '2.5k+';
                    } else if (target === 20) {
                        stat.textContent = '20+';
                    } else if (target === 94) {
                        stat.textContent = '94%';
                    } else {
                        stat.textContent = Math.round(target);
                    }
                } else {
                    if (target === 2500) {
                        stat.textContent = (current / 1000).toFixed(1) + 'k+';
                    } else if (target === 4) {
                        stat.textContent = Math.round(current) + '+';
                    } else if (target === 20) {
                        stat.textContent = Math.round(current) + '+';
                    } else if (target === 94) {
                        stat.textContent = Math.round(current) + '%';
                    } else {
                        stat.textContent = Math.round(current);
                    }
                }
            }, stepTime);
        });
    };

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animatedStats) {
                    animateCounters();
                    animatedStats = true;
                }
            });
        }, { threshold: 0.2 });
        
        statsObserver.observe(statsSection);
    }

    /* ==========================================================================
       11. CONTACT FORM VALIDATION & SUBMISSION SIMULATION
       ========================================================================== */
    const contactForm = document.getElementById('contactForm');
    const successMsg = document.getElementById('successMsg');
    const formSubmitBtn = document.getElementById('formSubmitBtn');
    const resetFormBtn = document.getElementById('resetFormBtn');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !subject || !message) {
                alert('Please fill out all fields.');
                return;
            }

            formSubmitBtn.disabled = true;
            formSubmitBtn.innerHTML = 'Sending Message... <i class="fa-solid fa-circle-notch fa-spin"></i>';

            setTimeout(() => {
                contactForm.classList.add('hidden');
                successMsg.classList.remove('hidden');
                
                formSubmitBtn.disabled = false;
                formSubmitBtn.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane animate-arrow"></i>';
                contactForm.reset();
            }, 1500);
        });
    }

    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', () => {
            successMsg.classList.add('hidden');
            contactForm.classList.remove('hidden');
        });
    }
});
