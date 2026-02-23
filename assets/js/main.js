

(function() {
    'use strict';
    const header = document.getElementById('header');
    const themeToggle = document.getElementById('themeToggle');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    const formError = document.getElementById('formError');
    const ThemeManager = {
        STORAGE_KEY: 'portfolio-theme',
        
        init() {
            const savedTheme = localStorage.getItem(this.STORAGE_KEY);
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = savedTheme || (prefersDark ? 'dark' : 'light');
            
            this.setTheme(theme, false);
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem(this.STORAGE_KEY)) {
                    this.setTheme(e.matches ? 'dark' : 'light', false);
                }
            });
        },
        
        setTheme(theme, save = true) {
            document.documentElement.setAttribute('data-theme', theme);
            if (save) {
                localStorage.setItem(this.STORAGE_KEY, theme);
            }
        },
        
        toggle() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
        }
    };
    const HeaderController = {
        scrollThreshold: 50,
        
        init() {
            this.handleScroll();
            window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
        },
        
        handleScroll() {
            const scrollY = window.scrollY;
            
            if (scrollY > this.scrollThreshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    };
    const MobileNav = {
        isOpen: false,
        
        init() {
            navLinks.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => this.close());
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });
        },
        
        toggle() {
            this.isOpen = !this.isOpen;
            navToggle.classList.toggle('active', this.isOpen);
            navLinks.classList.toggle('active', this.isOpen);
            document.body.style.overflow = this.isOpen ? 'hidden' : '';
        },
        
        close() {
            this.isOpen = false;
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
    };
    const SmoothScroll = {
        init() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    const href = anchor.getAttribute('href');
                    if (href === '#') return;
                    
                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        const headerHeight = header.offsetHeight;
                        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        }
    };
    const AnimationObserver = {
        init() {
            const animateElements = document.querySelectorAll(
                '.section-header, .project-card, .expertise-card, .timeline-item, .about-text, .about-stats, .about-image, .contact-content, .contact-form-wrapper'
            );
            
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('fade-in-up');
                            observer.unobserve(entry.target);
                        }
                    });
                },
                {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                }
            );
            
            animateElements.forEach((el, index) => {
                el.style.opacity = '0';
                el.style.animationDelay = `${index * 0.05}s`;
                observer.observe(el);
            });
        }
    };
    const ContactFormHandler = {
        init() {
            if (!contactForm) return;
            
            contactForm.addEventListener('submit', (e) => this.handleSubmit(e));
        },
        
        handleSubmit(e) {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            if (!this.validate(data)) return;
            this.showLoading();
            setTimeout(() => {
                this.hideLoading();
                this.showSuccess();
                contactForm.reset();
            }, 1500);
        },
        
        validate(data) {
            if (!data.name || !data.email || !data.message) {
                this.showError('Please fill in all fields.');
                return false;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                this.showError('Please enter a valid email address.');
                return false;
            }
            
            return true;
        },
        
        showLoading() {
            const btn = contactForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.innerHTML = `
                <span class="loading-spinner"></span>
                Sending...
            `;
        },
        
        hideLoading() {
            const btn = contactForm.querySelector('button[type="submit"]');
            btn.disabled = false;
            btn.innerHTML = `
                Send Message
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
            `;
        },
        
        showSuccess() {
            formSuccess.classList.add('show');
            formError.classList.remove('show');
            
            setTimeout(() => {
                formSuccess.classList.remove('show');
            }, 5000);
        },
        
        showError(message) {
            formError.textContent = message || 'Something went wrong. Please try again.';
            formError.classList.add('show');
            formSuccess.classList.remove('show');
            
            setTimeout(() => {
                formError.classList.remove('show');
            }, 5000);
        }
    };
    const StatsCounter = {
        init() {
            const stats = document.querySelectorAll('.stat-value');
            
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            this.animateValue(entry.target);
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.5 }
            );
            
            stats.forEach(stat => observer.observe(stat));
        },
        
        animateValue(element) {
            const text = element.textContent;
            const match = text.match(/(\d+)/);
            
            if (!match) return;
            
            const target = parseInt(match[1], 10);
            const suffix = text.replace(match[1], '');
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                element.textContent = Math.floor(current) + suffix;
            }, 16);
        }
    };
    const KeyboardNav = {
        init() {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    document.body.classList.add('keyboard-nav');
                }
            });
            
            document.addEventListener('mousedown', () => {
                document.body.classList.remove('keyboard-nav');
            });
        }
    };
    const ActiveNavHighlight = {
        init() {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('.nav-link');
            
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const id = entry.target.getAttribute('id');
                            navLinks.forEach(link => {
                                const href = link.getAttribute('href');
                                if (href === `#${id}`) {
                                    link.classList.add('active');
                                } else {
                                    link.classList.remove('active');
                                }
                            });
                        }
                    });
                },
                {
                    threshold: 0.3,
                    rootMargin: '-100px 0px -50% 0px'
                }
            );
            
            sections.forEach(section => observer.observe(section));
        }
    };
    function init() {
        ThemeManager.init();
        HeaderController.init();
        MobileNav.init();
        SmoothScroll.init();
        AnimationObserver.init();
        ContactFormHandler.init();
        StatsCounter.init();
        KeyboardNav.init();
        ActiveNavHighlight.init();
        if (themeToggle) {
            themeToggle.addEventListener('click', () => ThemeManager.toggle());
        }
        
        if (navToggle) {
            navToggle.addEventListener('click', () => MobileNav.toggle());
        }
        console.log('%c Portfolio Initialized ', 'background: #0a0a0b; color: #fafafa; padding: 4px 8px; border-radius: 4px;');
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
