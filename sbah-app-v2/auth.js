// Fonctions d'authentification
function showLogin() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('register-screen').classList.add('hidden');
    document.getElementById('main-app').classList.add('hidden');
}

function showRegister() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('register-screen').classList.remove('hidden');
    document.getElementById('main-app').classList.add('hidden');
}

function login(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        alert('Veuillez remplir tous les champs');
        return;
    }
    
    // Simuler une connexion réussie pour le test
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Masquer tous les écrans sauf login
    document.getElementById('register-screen').classList.add('hidden');
    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    
    // Écouteurs d'événements
    document.getElementById('login-form').addEventListener('submit', login);
    
    document.getElementById('register-link').addEventListener('click', function(e) {
        e.preventDefault();
        showRegister();
    });
    
    document.getElementById('login-link').addEventListener('click', function(e) {
        e.preventDefault();
        showLogin();
    });
}); 