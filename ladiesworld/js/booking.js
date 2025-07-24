document.addEventListener('DOMContentLoaded', function() {
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
    }
});