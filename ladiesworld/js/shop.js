document.addEventListener('DOMContentLoaded', function() {
    const cart = [];
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartItemsContainer = document.querySelector('.cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const deliveryFeeElement = document.getElementById('delivery-fee');
    const totalElement = document.getElementById('total');
    const checkoutBtn = document.querySelector('.checkout-btn');
    const paymentModal = document.querySelector('.payment-modal');
    const confirmPaymentBtn = document.querySelector('.confirm-payment');
    const customerNameInput = document.getElementById('customer-name');
    const customerPhoneInput = document.getElementById('customer-phone');
    const customerAddressInput = document.getElementById('customer-address');
    const deliveryAddressField = document.querySelector('.delivery-address');
    let orderNumber = generateOrderNumber();

    // Generate random order number
    function generateOrderNumber() {
        return 'LW' + Math.floor(1000 + Math.random() * 9000);
    }

    // Initialize form state
    function initForm() {
        document.getElementById('order-ref').textContent = orderNumber;
        // Set collection as default
        document.querySelector('input[name="delivery"][value="collection"]').checked = true;
        deliveryAddressField.style.display = 'none';
        customerAddressInput.removeAttribute('required');
    }

    // Toggle cart sidebar
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const product = {
                id: productCard.querySelector('img').src.split('/').pop().split('.')[0],
                name: productCard.querySelector('h3').textContent,
                price: parseFloat(productCard.querySelector('.price').textContent.replace('R', '')),
                quantity: parseInt(productCard.querySelector('.quantity').textContent),
                image: productCard.querySelector('img').src
            };
            
            // Add to cart or update quantity
            const existingItem = cart.find(item => item.id === product.id);
            if (existingItem) {
                existingItem.quantity += product.quantity;
            } else {
                cart.push(product);
            }
            
            updateCart();
            cartSidebar.classList.add('active');
        });
    });

    // Quantity controls
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const quantityElement = this.parentElement.querySelector('.quantity');
            let quantity = parseInt(quantityElement.textContent);
            
            if (this.classList.contains('minus') && quantity > 1) {
                quantity--;
            } else if (this.classList.contains('plus')) {
                quantity++;
            }
            
            quantityElement.textContent = quantity;
        });
    });

    // Update cart display
    function updateCart() {
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;
        
        cart.forEach((item, index) => {
            subtotal += item.price * item.quantity;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>R${item.price.toFixed(2)} × ${item.quantity}</p>
                    <p>R${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button class="remove-item" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            cartItemsContainer.appendChild(cartItem);
        });

        // Calculate delivery
        const deliveryMethod = document.querySelector('input[name="delivery"]:checked').value;
        let deliveryFee = 0;
        
        if (deliveryMethod === 'local') {
            deliveryFee = 50;
        } else if (deliveryMethod === 'nationwide') {
            deliveryFee = 120;
        }

        // Update totals
        subtotalElement.textContent = `R${subtotal.toFixed(2)}`;
        deliveryFeeElement.textContent = `R${deliveryFee.toFixed(2)}`;
        totalElement.textContent = `R${(subtotal + deliveryFee).toFixed(2)}`;
        
        updateCartCount();
    }

    // Remove item from cart
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-item')) {
            const index = e.target.closest('.remove-item').dataset.index;
            cart.splice(index, 1);
            updateCart();
        }
    });

    // Delivery method change
    document.querySelectorAll('input[name="delivery"]').forEach(radio => {
        radio.addEventListener('change', function() {
            updateCart();
            // Show/hide address field based on delivery method
            if (this.value === 'collection') {
                deliveryAddressField.style.display = 'none';
                customerAddressInput.removeAttribute('required');
            } else {
                deliveryAddressField.style.display = 'block';
                customerAddressInput.setAttribute('required', '');
            }
        });
    });

    // Checkout button
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        // Update order number in payment modal
        document.getElementById('order-ref').textContent = orderNumber;
        paymentModal.style.display = 'flex';
    });

    // Confirm payment
    confirmPaymentBtn.addEventListener('click', function() {
        // Validate inputs
        if (!customerNameInput.value || !customerPhoneInput.value) {
            alert('Please fill in your name and phone number');
            return;
        }
        
        const deliveryMethod = document.querySelector('input[name="delivery"]:checked').value;
        if (deliveryMethod !== 'collection' && !customerAddressInput.value) {
            alert('Please provide your delivery address');
            return;
        }
        
        if (!document.getElementById('payment-proof').files[0]) {
            alert('Please upload proof of payment');
            return;
        }
        
        // Validate phone number format (South African)
        const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
        if (!phoneRegex.test(customerPhoneInput.value.replace(/\s/g, ''))) {
            alert('Please enter a valid South African phone number (e.g., 0812345678 or +27812345678)');
            return;
        }
        
        // Prepare order data
        const orderData = {
            orderNumber: orderNumber,
            date: new Date().toLocaleString(),
            customer: {
                name: customerNameInput.value,
                phone: customerPhoneInput.value,
                address: deliveryMethod !== 'collection' ? customerAddressInput.value : 'Collection'
            },
            items: [...cart],
            subtotal: parseFloat(subtotalElement.textContent.replace('R', '')),
            deliveryFee: parseFloat(deliveryFeeElement.textContent.replace('R', '')),
            total: parseFloat(totalElement.textContent.replace('R', '')),
            deliveryMethod: deliveryMethod,
            paymentProof: document.getElementById('payment-proof').files[0].name,
            additionalNotes: document.getElementById('customer-note').value,
            bankDetails: {
                name: "ABSA",
                accountNumber: "1234567890",
                accountType: "Current Account",
                reference: orderNumber
            }
        };
        
        // In a real app, you would send this to your server
        console.log('Order submitted:', orderData);
        
        // Show confirmation
        const confirmationMessage = `Thank you, ${orderData.customer.name}!
        
Order #${orderNumber} submitted successfully!
Total: R${orderData.total.toFixed(2)}

We'll contact you on ${orderData.customer.phone} to confirm ${orderData.deliveryMethod === 'collection' ? 'collection' : 'delivery'} details.`;

        alert(confirmationMessage);
        
        // Reset form and cart
        resetOrder();
    });

    function resetOrder() {
        cart.length = 0;
        updateCart();
        paymentModal.style.display = 'none';
        orderNumber = generateOrderNumber();
        
        // Clear form inputs
        customerNameInput.value = '';
        customerPhoneInput.value = '';
        customerAddressInput.value = '';
        document.getElementById('payment-proof').value = '';
        document.getElementById('customer-note').value = '';
        
        // Reset to default state
        initForm();
    }

    // Close modals
    document.querySelector('.close-cart').addEventListener('click', function() {
        cartSidebar.classList.remove('active');
    });

    document.querySelector('.close-payment').addEventListener('click', function() {
        paymentModal.style.display = 'none';
    });

    // Cart toggle for mobile
    const cartToggle = document.createElement('div');
    cartToggle.className = 'cart-toggle';
    cartToggle.innerHTML = '<i class="fas fa-shopping-cart"></i> <span class="cart-count">0</span>';
    document.body.appendChild(cartToggle);
    
    cartToggle.addEventListener('click', function() {
        cartSidebar.classList.toggle('active');
    });

    // Update cart count
    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelector('.cart-count').textContent = totalItems;
    }

    // Initialize the form
    initForm();
});


// When opening cart
function openCart() {
  document.querySelector('.cart-sidebar').classList.add('active');
  document.querySelector('.cart-backdrop').style.display = 'block';
}

// When closing cart
function closeCart() {
  document.querySelector('.cart-sidebar').classList.remove('active');
  document.querySelector('.cart-backdrop').style.display = 'none';
}