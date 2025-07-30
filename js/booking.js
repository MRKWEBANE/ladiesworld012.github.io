document.addEventListener('DOMContentLoaded', function() {
    console.log('Document loaded, initializing booking system...');

    // ============= IMAGE PREVIEW SYSTEM =============
    const serviceSelect = document.getElementById('service');
    const previewContainer = document.querySelector('.service-preview');
    const previewImage = document.getElementById('service-preview-image');
    const previewNote = document.getElementById('preview-note');

    // ============= ENHANCED DROPDOWN =============
    function createCustomSelect() {
        const container = serviceSelect.parentElement;
        
        const customSelect = document.createElement('div');
        customSelect.className = 'custom-select';
        customSelect.innerHTML = `
            <div class="custom-select__trigger">
                <span>-- Select Service --</span>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="custom-select__options"></div>
        `;

        const optionsContainer = customSelect.querySelector('.custom-select__options');
        
        Array.from(serviceSelect.children).forEach(option => {
            if (option.tagName === 'OPTGROUP') {
                const optgroupLabel = document.createElement('div');
                optgroupLabel.className = 'custom-option optgroup-label';
                optgroupLabel.textContent = option.label;
                optionsContainer.appendChild(optgroupLabel);
                
                Array.from(option.children).forEach(opt => {
                    optionsContainer.appendChild(createCustomOption(opt));
                });
            } else if (option.tagName === 'OPTION') {
                optionsContainer.appendChild(createCustomOption(option));
            }
        });

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
                
                serviceSelect.value = value;
                customSelect.querySelector('.custom-select__trigger span').textContent = text;
                customSelect.classList.remove('open');
                
                if (image) {
                    previewImage.src = `images/${image}`;
                    previewContainer.style.display = 'block';
                    
                    if (value === 'custom-install') {
                        previewNote.textContent = "Please come 1 hour prior for customization services";
                    } else if (value === 'lagos-hairline') {
                        previewNote.textContent = "Note: This modification cannot be undone";
                    }
                } else {
                    previewContainer.style.display = 'none';
                }
            });
            
            return optElement;
        }

        const trigger = customSelect.querySelector('.custom-select__trigger');
        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            customSelect.classList.toggle('open');
        });

        document.addEventListener('click', function(e) {
            if (!customSelect.contains(e.target)) {
                customSelect.classList.remove('open');
            }
        });

        serviceSelect.style.display = 'none';
        container.appendChild(customSelect);
    }

    createCustomSelect();

    // ============= DATE PICKER =============
    flatpickr("#date", {
        minDate: "today",
        dateFormat: "Y-m-d",
        disable: [date => date.getDay() === 0]
    });

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
            
            document.querySelectorAll('.branch-card').forEach(card => {
                card.classList.remove('selected');
            });
            branchCard.classList.add('selected');
            
            document.getElementById('step1').classList.remove('active');
            document.getElementById('step2').classList.add('active');
        });
    });

    document.getElementById('backToBranches').addEventListener('click', function() {
        document.getElementById('step2').classList.remove('active');
        document.getElementById('step1').classList.add('active');
    });

    // ============= TERMS MODAL =============
    const termsModal = document.querySelector('.terms-modal');
    document.querySelector('.view-terms').addEventListener('click', function(e) {
        e.preventDefault();
        termsModal.style.display = 'flex';
    });

    document.querySelector('.close-terms').addEventListener('click', function() {
        termsModal.style.display = 'none';
    });

    // ============= FORM VALIDATION HELPERS =============
    function validateForm() {
        let isValid = true;
        
        // Clear previous errors
        document.querySelectorAll('.error').forEach(el => {
            el.classList.remove('error');
        });
        document.querySelectorAll('.error-message').forEach(el => {
            el.remove();
        });

        // Check all required fields
        document.querySelectorAll('#bookingForm [required]').forEach(field => {
            if (!field.value) {
                field.classList.add('error');
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.textContent = 'This field is required';
                field.parentNode.appendChild(errorMsg);
                isValid = false;
            }
        });

        // Special validation for terms checkbox
        if (!document.getElementById('terms').checked) {
            const termsLabel = document.querySelector('.terms-group label');
            termsLabel.classList.add('error');
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'You must accept the terms';
            termsLabel.parentNode.appendChild(errorMsg);
            isValid = false;
        }

        // Validate payment proof
        const paymentProof = document.getElementById('paymentProof').files[0];
        if (!paymentProof) {
            const paymentGroup = document.getElementById('paymentProof').parentNode;
            paymentGroup.classList.add('error');
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'Please upload payment proof';
            paymentGroup.appendChild(errorMsg);
            isValid = false;
        } else if (paymentProof.size > 10 * 1024 * 1024) { // 10MB limit
            const paymentGroup = document.getElementById('paymentProof').parentNode;
            paymentGroup.classList.add('error');
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'File must be smaller than 10MB';
            paymentGroup.appendChild(errorMsg);
            isValid = false;
        }

        return isValid;
    }

    // ============= FORM SUBMISSION =============
    document.getElementById('bookingForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }

        // Get form data
        const serviceId = serviceSelect.value;
        const serviceText = serviceSelect.selectedOptions[0].text;
        const priceMatch = serviceText.match(/R(\d+)/);
        const price = priceMatch ? priceMatch[1] : '0';

        // Store booking data
        bookingData.service = {
            id: serviceId,
            name: serviceText.split(' - ')[0],
            price: price,
            description: serviceText
        };
        bookingData.date = document.getElementById('date').value;
        bookingData.time = document.getElementById('time').value;
        bookingData.customer = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value
        };
        
        const paymentProof = document.getElementById('paymentProof').files[0];
        bookingData.paymentProof = paymentProof.name;

        // Prepare Formspree submission
        const formData = new FormData();
        
        // Add all form data
        formData.append('_subject', `New Booking from ${bookingData.customer.name}`);
        formData.append('_replyto', bookingData.customer.email);
        formData.append('_honeypot', ''); // Spam prevention
        formData.append('branch', JSON.stringify(bookingData.branch));
        formData.append('service', JSON.stringify(bookingData.service));
        formData.append('date', bookingData.date);
        formData.append('time', bookingData.time);
        formData.append('customer_name', bookingData.customer.name);
        formData.append('customer_email', bookingData.customer.email);
        formData.append('customer_phone', bookingData.customer.phone);
        formData.append('payment_proof', paymentProof);

        try {
            // Show loading state
            const submitBtn = document.querySelector('#bookingForm button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

            // Send to Formspree
            const response = await fetch('https://formspree.io/f/xeozkqnw', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            const responseData = await response.json();

            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;

            if (response.ok) {
                console.log('Form successfully submitted to Formspree', responseData);
                showConfirmation();
            } else {
                console.error('Formspree submission failed', responseData);
                alert('Submission failed: ' + (responseData.error || 'Please try again or contact us directly'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Network error - please try again or contact us directly');
            
            // Fallback to simple form submission if JS fails
            this.removeEventListener('submit', arguments.callee);
            this.submit();
        }
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
    }

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
        
        const customSelect = document.querySelector('.custom-select');
        if (customSelect) {
            customSelect.querySelector('.custom-select__trigger span').textContent = '-- Select Service --';
        }
        
        previewContainer.style.display = 'none';
    }
});
