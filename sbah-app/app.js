// DOM Elements
// Login & Register
const loginScreen = document.getElementById('login-screen');
const registerScreen = document.getElementById('register-screen');
const mainApp = document.getElementById('main-app');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const registerLink = document.getElementById('register-link');
const loginLink = document.getElementById('login-link');

// Main Navigation
const navHome = document.getElementById('nav-home');
const navDeposit = document.getElementById('nav-deposit');
const navHistory = document.getElementById('nav-history');
const navCeremonies = document.getElementById('nav-ceremonies');

// Screens
const homeScreen = document.getElementById('home-screen');
const depositScreen = document.getElementById('deposit-screen');
const historyScreen = document.getElementById('history-screen');
const ceremoniesScreen = document.getElementById('ceremonies-screen');
const profileScreen = document.getElementById('profile-screen');

// Home Screen Elements
const depositAction = document.getElementById('deposit-action');
const historyAction = document.getElementById('history-action');
const ceremoniesAction = document.getElementById('ceremonies-action');
const profileIcon = document.getElementById('profile-icon');

// Back Buttons
const depositBack = document.getElementById('deposit-back');
const historyBack = document.getElementById('history-back');
const ceremoniesBack = document.getElementById('ceremonies-back');
const profileBack = document.getElementById('profile-back');

// History Tabs
const depositsTab = document.getElementById('deposits-tab');
const withdrawalsTab = document.getElementById('withdrawals-tab');
const depositsContent = document.getElementById('deposits-content');
const withdrawalsContent = document.getElementById('withdrawals-content');

// Current User Data (simulated)
let currentUser = null;

// Auth Functions
function showLogin() {
    loginScreen.classList.remove('hidden');
    registerScreen.classList.add('hidden');
    mainApp.classList.add('hidden');
}

function showRegister() {
    loginScreen.classList.add('hidden');
    registerScreen.classList.remove('hidden');
    mainApp.classList.add('hidden');
}

function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (email && password) {
        // Simulate successful login
        currentUser = {
            name: "Ibrahim Bah",
            email: email,
            phone: "+1 234 567 8900",
            country: "USA",
            city: "New York",
            role: "member"
        };
        
        loginScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        showHomeScreen();
    } else {
        alert("Veuillez remplir tous les champs");
    }
}

function register() {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const country = document.getElementById('reg-country').value;
    const city = document.getElementById('reg-city').value;
    const password = document.getElementById('reg-password').value;
    
    if (name && email && phone && country && city && password) {
        // Simulate successful registration
        currentUser = {
            name: name,
            email: email,
            phone: phone,
            country: country,
            city: city,
            role: "member"
        };
        
        registerScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        showHomeScreen();
    } else {
        alert("Veuillez remplir tous les champs");
    }
}

// Navigation Functions
function showHomeScreen() {
    homeScreen.classList.remove('hidden');
    depositScreen.classList.add('hidden');
    historyScreen.classList.add('hidden');
    ceremoniesScreen.classList.add('hidden');
    profileScreen.classList.add('hidden');
    
    // Update navigation
    navHome.classList.add('active');
    navDeposit.classList.remove('active');
    navHistory.classList.remove('active');
    navCeremonies.classList.remove('active');
}

function showDepositScreen() {
    homeScreen.classList.add('hidden');
    depositScreen.classList.remove('hidden');
    historyScreen.classList.add('hidden');
    ceremoniesScreen.classList.add('hidden');
    profileScreen.classList.add('hidden');
    
    // Update navigation
    navHome.classList.remove('active');
    navDeposit.classList.add('active');
    navHistory.classList.remove('active');
    navCeremonies.classList.remove('active');
}

function showHistoryScreen() {
    homeScreen.classList.add('hidden');
    depositScreen.classList.add('hidden');
    historyScreen.classList.remove('hidden');
    ceremoniesScreen.classList.add('hidden');
    profileScreen.classList.add('hidden');
    
    // Update navigation
    navHome.classList.remove('active');
    navDeposit.classList.remove('active');
    navHistory.classList.add('active');
    navCeremonies.classList.remove('active');
}

function showCeremoniesScreen() {
    homeScreen.classList.add('hidden');
    depositScreen.classList.add('hidden');
    historyScreen.classList.add('hidden');
    ceremoniesScreen.classList.remove('hidden');
    profileScreen.classList.add('hidden');
    
    // Update navigation
    navHome.classList.remove('active');
    navDeposit.classList.remove('active');
    navHistory.classList.remove('active');
    navCeremonies.classList.add('active');
}

function showProfileScreen() {
    homeScreen.classList.add('hidden');
    depositScreen.classList.add('hidden');
    historyScreen.classList.add('hidden');
    ceremoniesScreen.classList.add('hidden');
    profileScreen.classList.remove('hidden');
    
    // Update navigation
    navHome.classList.remove('active');
    navDeposit.classList.remove('active');
    navHistory.classList.remove('active');
    navCeremonies.classList.remove('active');
}

// History Tab Functions
function showDepositsTab() {
    depositsTab.classList.add('active');
    withdrawalsTab.classList.remove('active');
    depositsContent.classList.remove('hidden');
    withdrawalsContent.classList.add('hidden');
}

function showWithdrawalsTab() {
    depositsTab.classList.remove('active');
    withdrawalsTab.classList.add('active');
    depositsContent.classList.add('hidden');
    withdrawalsContent.classList.remove('hidden');
}

// Submit Deposit Function
function submitDeposit() {
    const amount = document.getElementById('deposit-amount').value;
    
    if (amount >= 300000) {
        alert(`Dépôt de ${amount} GNF effectué avec succès !`);
        showHomeScreen();
    } else {
        alert("Le montant minimum est de 300 000 GNF");
    }
}

// Add Ceremony Function
function addCeremony() {
    alert("Fonctionnalité à venir : Ajouter une cérémonie");
}

// Logout Function
function logout() {
    currentUser = null;
    showLogin();
}

// Event Listeners
// Auth
loginBtn.addEventListener('click', login);
registerBtn.addEventListener('click', register);
registerLink.addEventListener('click', showRegister);
loginLink.addEventListener('click', showLogin);

// Navigation
navHome.addEventListener('click', showHomeScreen);
navDeposit.addEventListener('click', showDepositScreen);
navHistory.addEventListener('click', showHistoryScreen);
navCeremonies.addEventListener('click', showCeremoniesScreen);

// Home Actions
depositAction.addEventListener('click', showDepositScreen);
historyAction.addEventListener('click', showHistoryScreen);
ceremoniesAction.addEventListener('click', showCeremoniesScreen);
profileIcon.addEventListener('click', showProfileScreen);

// Back Buttons
depositBack.addEventListener('click', showHomeScreen);
historyBack.addEventListener('click', showHomeScreen);
ceremoniesBack.addEventListener('click', showHomeScreen);
profileBack.addEventListener('click', showHomeScreen);

// History Tabs
depositsTab.addEventListener('click', showDepositsTab);
withdrawalsTab.addEventListener('click', showWithdrawalsTab);

// Deposit Submission
document.getElementById('submit-deposit').addEventListener('click', submitDeposit);

// Add Ceremony
document.getElementById('add-ceremony-btn').addEventListener('click', addCeremony);

// Logout
document.querySelector('.logout').addEventListener('click', logout);

// Payment Method Selection
const paymentMethods = document.querySelectorAll('.payment-method');
paymentMethods.forEach(method => {
    method.addEventListener('click', function() {
        paymentMethods.forEach(m => m.classList.remove('active'));
        this.classList.add('active');
    });
});

// Initialize the app to login screen
showLogin();
