// js/login.js

document.addEventListener('DOMContentLoaded', function() {

    // --- LÓGICA PARA MOSTRAR/OCULTAR CONTRASEÑA ---
    const passwordToggle = document.querySelector('.password-toggle-icon');
    if (passwordToggle) {
        passwordToggle.addEventListener('click', () => {
            const passwordInput = document.getElementById('login-pass');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            passwordToggle.classList.toggle('fa-eye-slash');
        });
    }

    // --- LÓGICA DE VALIDACIÓN DEL FORMULARIO ---
    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-pass');
    const submitBtn = form.querySelector('.submit-btn');

    // Funciones auxiliares para la UI de validación
    const showError = (input, message) => {
        const group = input.closest('.input-group');
        group.classList.remove('success');
        group.classList.add('error');
        group.querySelector('.error-message').textContent = message;
    };

    const showSuccess = (input) => {
        const group = input.closest('.input-group');
        group.classList.remove('error');
        group.classList.add('success');
    };
    
    // Objeto para mantener el estado de validez
    const validationStatus = {
        email: false,
        password: false
    };

    // Función para habilitar/deshabilitar el botón
    const checkFormValidity = () => {
        const allValid = Object.values(validationStatus).every(status => status === true);
        submitBtn.disabled = !allValid;
    };

    // Listeners para validación en tiempo real
    emailInput.addEventListener('input', () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(emailInput.value)) {
            showSuccess(emailInput);
            validationStatus.email = true;
        } else {
            showError(emailInput, 'Introduce un correo electrónico válido.');
            validationStatus.email = false;
        }
        checkFormValidity();
    });

    passInput.addEventListener('input', () => {
        if (passInput.value.length > 0) {
            showSuccess(passInput);
            validationStatus.password = true;
        } else {
            showError(passInput, 'La contraseña es requerida.');
            validationStatus.password = false;
        }
        checkFormValidity();
    });

    // Envío del formulario
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        if (!submitBtn.disabled) {
            alert('¡Inicio de sesión exitoso! (Aquí iría la lógica de Flask)');
            form.reset();
            
            validationStatus.email = false;
            validationStatus.password = false;
            checkFormValidity();
            
            form.querySelectorAll('.input-group').forEach(group => {
                group.classList.remove('success', 'error');
            });
        }
    });
});