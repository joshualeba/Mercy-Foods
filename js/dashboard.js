// js/dashboard.js

document.addEventListener('DOMContentLoaded', function() {
    
    // --- LÓGICA PARA MOSTRAR EL NOMBRE DE USUARIO ---
    const welcomeTitle = document.getElementById('welcome-title');
    const userData = JSON.parse(localStorage.getItem('mercifood_user'));

    if (userData && userData.fullName) {
        welcomeTitle.textContent = `¡Hola, ${userData.fullName}!`;
    } else {
        welcomeTitle.textContent = '¡Bienvenido/a!';
    }

    // --- LÓGICA PARA EL MODAL DE CIERRE DE SESIÓN ---
    const logoutBtn = document.getElementById('logout-btn');
    const confirmationModal = document.getElementById('confirmation-modal');
    const confirmLogoutBtn = document.getElementById('confirm-logout-btn');
    const cancelLogoutBtn = document.getElementById('cancel-logout-btn');

    // Función para mostrar el modal
    const openConfirmationModal = () => {
        confirmationModal.classList.add('active');
    };

    // Función para cerrar el modal
    const closeConfirmationModal = () => {
        confirmationModal.classList.remove('active');
    };

    // La función que realmente cierra la sesión
    const executeLogout = () => {
        localStorage.removeItem('mercifood_user');
        window.location.href = '/login.html';
    };

    // 1. Al hacer clic en "Cerrar Sesión", solo ABRIMOS el modal
    logoutBtn.addEventListener('click', openConfirmationModal);

    // 2. Si el usuario confirma, EJECUTAMOS el cierre de sesión
    confirmLogoutBtn.addEventListener('click', executeLogout);

    // 3. Si el usuario cancela, solo CERRAMOS el modal
    cancelLogoutBtn.addEventListener('click', closeConfirmationModal);
    
    // 4. También cerramos el modal si se hace clic fuera de la caja
    confirmationModal.addEventListener('click', (e) => {
        if (e.target === confirmationModal) {
            closeConfirmationModal();
        }
    });
    
    // --- LÓGICA PARA EL MENÚ RESPONSIVO ---
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
});