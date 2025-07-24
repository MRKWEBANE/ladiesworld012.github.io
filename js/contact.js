document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };
    
    // In a real app, you would send this to your backend
    console.log('Form submitted:', formData);
    
    alert('Thank you for your message! We will respond within 24 hours.');
    this.reset();
});