window.addEventListener('scroll', function() {
    var navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.55)';
    } else {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.55)';
    }
});