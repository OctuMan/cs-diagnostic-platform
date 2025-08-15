
const menu = document.getElementById('menu-icon');
const navbar = document.getElementById('navbar');

menu.addEventListener('click', () => {
const isHidden = navbar.classList.toggle('hidden');

if (isHidden) {
    menu.classList.remove('fa-xmark');
    menu.classList.add('fa-bars');
} else {
    menu.classList.remove('fa-bars');
    menu.classList.add('fa-xmark');
}
});

// Get & Store Date
var today = new Date();
today = today.getFullYear();


// Display Date
document.getElementById('year').textContent = today;