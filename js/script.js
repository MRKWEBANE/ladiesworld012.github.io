document.addEventListener('DOMContentLoaded', function() {
    // ===== Mobile Menu Functionality =====
    const initMobileMenu = () => {
        const mobileMenu = document.getElementById('mobile-menu');
        const navList = document.querySelector('nav ul');
        
        if (!mobileMenu || !navList) return;

        const toggleMenu = () => {
            mobileMenu.classList.toggle('active');
            navList.classList.toggle('active');
            document.body.style.overflow = navList.classList.contains('active') ? 'hidden' : 'auto';
        };

        const closeMenu = () => {
            mobileMenu.classList.remove('active');
            navList.classList.remove('active');
            document.body.style.overflow = 'auto';
        };

        mobileMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        document.querySelectorAll('nav ul li a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('click', (e) => {
            if (!navList.contains(e.target) && e.target !== mobileMenu) {
                closeMenu();
            }
        });
    };

    // ===== Service Category Filtering =====
    const initServiceFilter = () => {
        const categoryBtns = document.querySelectorAll('.category-btn');
        const serviceCards = document.querySelectorAll('.service-card');
        
        if (!categoryBtns.length || !serviceCards.length) return;

        categoryBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const category = this.dataset.category;
                
                // Update active button
                categoryBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Filter services
                serviceCards.forEach(card => {
                    card.style.display = (category === 'all' || card.dataset.category === category) 
                        ? 'block' 
                        : 'none';
                });
            });
        });
    };

    // ===== Shopping Cart Functionality =====
    const initCart = () => {
        const cartSidebar = document.querySelector('.cart-sidebar');
        if (!cartSidebar) return;

        const cartToggle = document.createElement('div');
        cartToggle.className = 'cart-toggle-mobile';
        cartToggle.innerHTML = '<i class="fas fa-shopping-cart"></i><span class="cart-count">0</span>';
        document.body.appendChild(cartToggle);

        const updateCartCount = () => {
            const count = document.querySelectorAll('.cart-item').length;
            document.querySelector('.cart-count').textContent = count;
        };

        cartToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            cartSidebar.classList.add('active');
        });

        document.addEventListener('click', (e) => {
            if (!cartSidebar.contains(e.target) && e.target !== cartToggle) {
                cartSidebar.classList.remove('active');
            }
        });

        updateCartCount();
    };

    // ===== Booking Form Submission =====
    const initBookingForm = () => {
        const bookingForm = document.getElementById('bookingForm');
        if (!bookingForm) return;

        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                branch: this.querySelector('#branch')?.value,
                service: this.querySelector('#service')?.value,
                date: this.querySelector('#date')?.value,
                time: this.querySelector('#time')?.value,
                name: this.querySelector('#name')?.value,
                phone: this.querySelector('#phone')?.value,
                notes: this.querySelector('#notes')?.value
            };
            
            // Validation
            if (!formData.branch || !formData.service || !formData.date || 
                !formData.time || !formData.name || !formData.phone) {
                alert("Please fill in all required fields!");
                return;
            }
            
            console.log("Booking Submitted:", formData);
            alert(`✅ Booking confirmed for ${formData.name}!\n\n${formData.service} at ${formData.branch}\nOn ${formData.date} at ${formData.time}\n\nWe'll contact you shortly at ${formData.phone}.`);
            this.reset();
        });
    };

    // ===== Active Page Highlighting =====
    const highlightActivePage = () => {
        const navLinks = document.querySelectorAll('nav ul li a');
        if (!navLinks.length) return;

        const currentPage = location.pathname.split('/').pop() || 'index.html';
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href').split('/').pop();
            if (currentPage === linkPage) {
                link.classList.add('active');
            }
        });
    };

    // Initialize all components
    initMobileMenu();
    initServiceFilter();
    initCart();
    initBookingForm();
    highlightActivePage();
});

