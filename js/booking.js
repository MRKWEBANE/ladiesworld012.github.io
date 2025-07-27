document.addEventListener('DOMContentLoaded', function() {
    // Debugging - log when DOM is loaded
    console.log('Document loaded, initializing booking system...');

    // ============= IMAGE PREVIEW SYSTEM =============
    const serviceSelect = document.getElementById('service');
    const previewContainer = document.querySelector('.service-preview');
    const previewImage = document.getElementById('service-preview-image');
    const previewNote = document.getElementById('preview-note');

    // Debug image elements
    console.log('Preview elements:', {
        container: previewContainer,
        image: previewImage,
        note: previewNote
    });

    // ============= ENHANCED DROPDOWN =============
    function createCustomSelect() {
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
        
        Array.from(serviceSelect.children).forEach(option => {
            if (option.tagName === 'OPTGROUP') {
                // Add category headers
                const optgroupLabel = document.createElement('div');
                optgroupLabel.className = 'custom-option optgroup-label';
                optgroupLabel.textContent = option.label;
                optionsContainer.appendChild(optgroupLabel);
                
                // Add services in category
                Array.from(option.children).forEach(opt => {
                    optionsContainer.appendChild(createCustomOption(opt));
                });
            } else if (option.tagName === 'OPTION') {
                optionsContainer.appendChild(createCustomOption(option));
            }
        });

        // Create selectable option
        function createCustomOption(option) {
            const optElement = document.createElement('div');
            optElement.className = 'custom-option';
            optElement.dataset.value = option.value;
            optElement.dataset.image = option.dataset.image || '';
            optElement.innerHTML = option.text;
            
            optElement.addEventListener('click', function() {
                const value = option.value;
                const text = option.text;
                const image = option.dataset.image;
                console.log('Service selected:', {value, text, image});
                
                // Update the hidden original select
                serviceSelect.value = value;
                
                // Update UI
                customSelect.querySelector('.custom-select__trigger span').textContent = text;
                customSelect.classList.remove('open');
                
                // Handle image preview
                if (image) {
                    const imagePath = `images/${image}`;
                    console.log('Loading image:', imagePath);
                    previewImage.src = imagePath;
                    previewImage.onload = function() {
                        console.log('Image loaded successfully');
                        previewContainer.style.display = 'block';
                    };
                    previewImage.onerror = function() {
                        console.error('Failed to load image:', imagePath);
                        previewContainer.style.display = 'none';
                    };
                    
                    // Set service-specific notes
                    if (value === 'custom-install') {
                        previewNote.textContent = "Please come 1 hour prior for customization services";
                    } else if (value === 'lagos-hairline') {
                        previewNote.textContent = "Note: This modification cannot be undone";
                    }
                } else {
                    console.log('No image for this service');
                    previewContainer.style.display = 'none';
                }
            });
            
            return optElement;
        }

        // Toggle dropdown
        const trigger = customSelect.querySelector('.custom-select__trigger');
        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            customSelect.classList.toggle('open');
        });

        // Close when clicking outside
        document.addEventListener('click', function(e) {
            if (!customSelect.contains(e.target)) {
                customSelect.classList.remove('open');
            }
        });

        // Replace original select
        serviceSelect.style.display = 'none';
        container.appendChild(customSelect);
        
        console.log('Custom select initialized');
    }

    // Initialize the enhanced dropdown
    createCustomSelect();

    // ============= DATE PICKER =============
    flatpickr("#date", {
        minDate: "today",
        dateFormat: "Y-m-d",
        disable: [
            function(date) {
                return (date.getDay() === 0); // Disable Sundays
            }
        ]
    });
    console.log('Date picker initialized');

    // ============= BRANCH SELECTION =============
    const bookingData = {};
    
    document.querySelectorAll('.branch-card .btn-pink').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const branchCard = this.closest('.branch-card');
            
            bookingData.branch = {
                id: branchCard.dataset.branch,
                name: branchCard.querySelector('h3').textContent,
                address: branchCard.querySelector('p').textContent
            };
            
            // Update UI
            document.querySelectorAll('.branch-card').forEach(card => {
                card.classList.remove('selected');
            });
            branchCard.classList.add('selected');
            
            // Go to booking form
            document.getElementById('step1').classList.remove('active');
            document.getElementById('step2').classList.add('active');
            
            console.log('Branch selected:', bookingData.branch);
        });
    });

    // Back button
    document.getElementById('backToBranches').addEventListener('click', function() {
        document.getElementById('step2').classList.remove('active');
        document.getElementById('step1').classList.add('active');
        console.log('Returned to branch selection');
    });

    // ============= TERMS MODAL =============
    const termsModal = document.querySelector('.terms-modal');
    document.querySelector('.view-terms').addEventListener('click', function(e) {
        e.preventDefault();
        termsModal.style.display = 'flex';
        console.log('Terms modal opened');
    });

    document.querySelector('.close-terms').addEventListener('click', function() {
        termsModal.style.display = 'none';
        console.log('Terms modal closed');
    });

    // ============= FORM SUBMISSION =============
    document.getElementById('bookingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submission started');
        
        // Validate terms
        if (!document.getElementById('terms').checked) {
            alert("Please accept the Terms & Conditions");
            console.warn('Form rejected - terms not accepted');
            return;
        }

        // Validate payment proof
        const paymentProof = document.getElementById('paymentProof').files[0];
        if (!paymentProof) {
            alert("Please upload proof of payment");
            console.warn('Form rejected - no payment proof');
            return;
        }

        // Get selected service
        const serviceId = serviceSelect.value;
        const serviceText = serviceSelect.selectedOptions[0].text;
        
        // Extract price
        const priceMatch = serviceText.match(/R(\d+)/);
        const price = priceMatch ? parseInt(priceMatch[1]) : 0;

        // Store booking data
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

        console.log('Booking data prepared:', bookingData);
        showConfirmation();
    });

    // ============= CONFIRMATION MODAL =============
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
        console.log('Confirmation modal shown');
    }

    // Close confirmation
    document.getElementById('closeModal').addEventListener('click', function() {
        document.querySelector('.confirmation-modal').style.display = 'none';
        resetForm();
        console.log('Confirmation modal closed');
    });

    function resetForm() {
        document.getElementById('bookingForm').reset();
        document.querySelectorAll('.branch-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.getElementById('step2').classList.remove('active');
        document.getElementById('step1').classList.add('active');
        
        const customSelect = document.querySelector('.custom-select');
        if (customSelect) {
            customSelect.querySelector('.custom-select__trigger span').textContent = '-- Select Service --';
        }
        
        if (previewContainer) {
            previewContainer.style.display = 'none';
        }
        
        console.log('Form reset to initial state');
    }

    // Debugging - check if images exist
    function verifyImages() {
        const servicesWithImages = Array.from(serviceSelect.querySelectorAll('option[data-image]'));
        console.log('Services that should have images:', servicesWithImages.map(opt => ({
            value: opt.value,
            image: opt.dataset.image,
            text: opt.text
        })));
    }

    verifyImages();
});
