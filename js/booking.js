document.addEventListener('DOMContentLoaded', function() {
    // ======================
    // DROPDOWN ENHANCEMENTS
    // ======================
    function createCustomSelect() {
        const serviceSelect = document.getElementById('service');
        const container = serviceSelect.parentElement;
        
        // Create custom select structure
        const customSelect = document.createElement('div');
        customSelect.className = 'custom-select';
        customSelect.innerHTML = `
            <div class="custom-select__trigger">
                <span>-- Select Service --</span>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="custom-select__options"></div>
        `;
        
        // Populate options
        const optionsContainer = customSelect.querySelector('.custom-select__options');
        let currentOptgroup = null;
        
        Array.from(serviceSelect.children).forEach(option => {
            if (option.tagName === 'OPTGROUP') {
                // Add optgroup label
                const optgroupLabel = document.createElement('div');
                optgroupLabel.className = 'custom-option optgroup-label';
                optgroupLabel.textContent = option.label;
                optionsContainer.appendChild(optgroupLabel);
                
                // Add options in this group
                Array.from(option.children).forEach(opt => {
                    const optElement = document.createElement('div');
                    optElement.className = 'custom-option';
                    optElement.dataset.value = opt.value;
                    optElement.innerHTML = opt.text;
                    optionsContainer.appendChild(optElement);
                });
            } else if (option.tagName === 'OPTION') {
                const optElement = document.createElement('div');
                optElement.className = 'custom-option';
                optElement.dataset.value = option.value;
                optElement.innerHTML = option.text;
                optionsContainer.appendChild(optElement);
            }
        });
        
        // Replace original select
        serviceSelect.style.display = 'none';
        container.appendChild(customSelect);
        
        // Add interaction
        const trigger = customSelect.querySelector('.custom-select__trigger');
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            customSelect.classList.toggle('open');
        });
        
        document.querySelectorAll('.custom-option:not(.optgroup-label)').forEach(option => {
            option.addEventListener('click', () => {
                serviceSelect.value = option.dataset.value;
                trigger.querySelector('span').textContent = option.textContent;
                customSelect.classList.remove('open');
                
                // Update price display if you have one
                updateServicePriceDisplay();
            });
        });
        
        // Close when clicking outside
        document.addEventListener('click', () => {
            customSelect.classList.remove('open');
        });
    }
    
    // Initialize custom select immediately
    createCustomSelect();

    // ======================
    // EXISTING FUNCTIONALITY
    // ======================
    
    // Initialize date picker
    flatpickr("#date", {
        minDate: "today",
        dateFormat: "Y-m-d",
        disable: [
            function(date) {
                // Disable Sundays
                return (date.getDay() === 0);
            }
        ]
    });

    // Service price mapping
    const servicePrices = {
        'small-box-braids': 400,
        'medium-box-braids': 350,
        'large-box-braids': 300,
        'crochet-braids': 350,
        'basic-cornrows': 150,
        'design-cornrows': 200,
        'basic-ponytail': 200,
        'high-ponytail': 250,
        'low-ponytail': 250,
        'puffy-ponytail': 300,
        'boho-ponytail': 350,
        'braided-ponytail': 350,
        'basic-frontal': 450,
        'high-frontal': 500,
        'low-frontal': 500,
        'bridal-frontal': 800,
        'wash-blowout': 250,
        'silk-press': 300,
        'hair-color-full': 800,
        'hair-color-roots': 500,
        'hair-treatment': 400,
        'bridesmaid-style': 450,
        'bridal-trial': 1000,
        'house-call': 500
    };

    // Booking data object
    let bookingData = {};

    // Branch Selection
    document.querySelectorAll('.branch-card .btn-pink').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const branchCard = this.closest('.branch-card');
            const branchId = branchCard.dataset.branch;
            
            // Store branch selection
            bookingData.branch = {
                id: branchId,
                name: branchCard.querySelector('h3').textContent,
                address: branchCard.querySelector('p').textContent
            };
            
            // Highlight selection
            document.querySelectorAll('.branch-card').forEach(card => {
                card.classList.remove('selected');
            });
            branchCard.classList.add('selected');
            
            // Move to Step 2
            document.getElementById('step1').classList.remove('active');
            document.getElementById('step2').classList.add('active');
        });
    });

    // Back to Branches
    document.getElementById('backToBranches').addEventListener('click', function() {
        document.getElementById('step2').classList.remove('active');
        document.getElementById('step1').classList.add('active');
    });

    // Terms Modal
    const termsModal = document.querySelector('.terms-modal');
    document.querySelector('.view-terms').addEventListener('click', function(e) {
        e.preventDefault();
        termsModal.style.display = 'flex';
    });

    document.querySelector('.close-terms').addEventListener('click', function() {
        termsModal.style.display = 'none';
    });

    // Form Submission
    document.getElementById('bookingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate terms
        if (!document.getElementById('terms').checked) {
            alert("Please accept the Terms & Conditions");
            return;
        }

        // Validate file upload
        const paymentProof = document.getElementById('paymentProof').files[0];
        if (!paymentProof) {
            alert("Please upload proof of payment");
            return;
        }

        // Get selected service
        const serviceSelect = document.getElementById('service');
        const serviceId = serviceSelect.value;
        const serviceText = serviceSelect.selectedOptions[0].text;
        
        // Extract price from service text
        const priceMatch = serviceText.match(/R(\d+)/);
        const price = priceMatch ? parseInt(priceMatch[1]) : 0;

        // Collect all data
        bookingData.service = {
            id: serviceId,
            name: serviceText.split(' - ')[0],
            price: price
        };
        bookingData.date = document.getElementById('date').value;
        bookingData.time = document.getElementById('time').value;
        bookingData.customer = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value
        };
        bookingData.paymentProof = paymentProof.name;

        // Show confirmation
        showConfirmation();
    });

    function showConfirmation() {
        const modal = document.querySelector('.confirmation-modal');
        const summary = document.querySelector('.booking-summary');
        
        summary.innerHTML = `
            <p><strong>Branch:</strong> ${bookingData.branch.name}</p>
            <p><strong>Address:</strong> ${bookingData.branch.address}</p>
            <p><strong>Service:</strong> ${bookingData.service.name} (R${bookingData.service.price})</p>
            <p><strong>Date:</strong> ${bookingData.date}</p>
            <p><strong>Time:</strong> ${bookingData.time}</p>
            <p><strong>Customer:</strong> ${bookingData.customer.name}</p>
            <p><strong>Contact:</strong> ${bookingData.customer.phone}</p>
            <p><strong>Total Paid:</strong> R${bookingData.service.price}</p>
        `;
        
        modal.style.display = 'flex';
    }

    // Close modal
    document.getElementById('closeModal').addEventListener('click', function() {
        document.querySelector('.confirmation-modal').style.display = 'none';
        resetForm();
    });

    function resetForm() {
        document.getElementById('bookingForm').reset();
        document.querySelectorAll('.branch-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.getElementById('step2').classList.remove('active');
        document.getElementById('step1').classList.add('active');
        bookingData = {};
        
        // Reset custom select display
        const customSelect = document.querySelector('.custom-select');
        if (customSelect) {
            customSelect.querySelector('.custom-select__trigger span').textContent = '-- Select Service --';
        }
    }
    
    function updateServicePriceDisplay() {
        // Add this if you want to show prices when selecting services
        const serviceSelect = document.getElementById('service');
        const priceDisplay = document.getElementById('price-display'); // Add this element to your HTML
        
        if (priceDisplay && serviceSelect.value) {
            const priceMatch = serviceSelect.selectedOptions[0].text.match(/R(\d+)/);
            if (priceMatch) {
                priceDisplay.textContent = `Price: R${priceMatch[1]}`;
            }
        }
    }
});
