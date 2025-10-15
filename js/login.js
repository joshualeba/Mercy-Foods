// --- LÓGICA PARA OCULTAR EL LOADER ---
window.addEventListener('load', function() {
    const loaderWrapper = document.getElementById('loader-wrapper');
    loaderWrapper.style.opacity = '0';
    setTimeout(() => {
        loaderWrapper.style.display = 'none';
    }, 500);
});

document.addEventListener('DOMContentLoaded', function() {

    // --- LÓGICA DEL MODAL DE NOTIFICACIONES ---
    const modal = document.getElementById('notification-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const closeModalBtn = document.getElementById('modal-close-btn');

    // Función para mostrar el modal con un mensaje personalizado
    const showNotification = (title, message) => {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.classList.add('active');
    };

    // Función para cerrar el modal
    const closeModal = () => {
        modal.classList.remove('active');
    };

    // Event listeners para cerrar el modal
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });


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
            const email = emailInput.value;
            const password = passInput.value;

            fetch('http://127.0.0.1:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.user) {
                    // Muestra un mensaje de éxito antes de redirigir
                    showNotification('¡Éxito!', data.message);

                    localStorage.setItem('mercifood_user', JSON.stringify(data.user));

                    // Espera un momento para que el usuario vea el mensaje y luego redirige
                    setTimeout(() => {
                        switch (data.user.role) {
                            case 'cliente':
                                window.location.href = '/cliente-dashboard.html';
                                break;
                            case 'restaurante':
                                window.location.href = '/restaurante-dashboard.html';
                                break;
                            case 'repartidor':
                                window.location.href = '/repartidor-dashboard.html';
                                break;
                            default:
                                window.location.href = '/'; 
                                break;
                        }
                    }, 1500);

                } else {
                    // Si hubo un error, muestra el mensaje de error en el modal
                    showNotification('Error de inicio de sesión', data.message);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                showNotification('Error de conexión', 'Ocurrió un error al intentar iniciar sesión. Revisa tu conexión a internet.');
            });
        }
    });
});