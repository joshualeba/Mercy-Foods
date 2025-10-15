// --- LÓGICA PARA OCULTAR EL LOADER ---
window.addEventListener('load', function() {
    const loaderWrapper = document.getElementById('loader-wrapper');
    loaderWrapper.style.opacity = '0';
    setTimeout(() => {
        loaderWrapper.style.display = 'none';
    }, 500);
});

document.addEventListener('DOMContentLoaded', function() {
    
    // --- LÓGICA DEL MODAL DE NOTIFICACIONES (Versión simplificada) ---
    const notificationModal = document.getElementById('notification-modal');
    const modalMessage = document.getElementById('modal-message');
    let modalTimer; // Variable para controlar el temporizador

    const showNotification = (message) => {
        // Limpiamos cualquier temporizador anterior para evitar que el modal se cierre antes de tiempo
        clearTimeout(modalTimer);

        // Mostramos el mensaje y el modal
        modalMessage.textContent = message;
        notificationModal.classList.add('active');

        // Configuramos el modal para que se cierre automáticamente después de 3 segundos
        modalTimer = setTimeout(() => {
            notificationModal.classList.remove('active');
        }, 3000);
    };

    // --- LÓGICA GENERAL Y DE PESTAÑAS ---
    const form = document.getElementById('register-form');
    const submitBtn = form.querySelector('.submit-btn');
    const tabs = document.querySelectorAll('.tab-link');
    const contents = document.querySelectorAll('.tab-content');
    const checklist = document.querySelector('.password-checklist');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            contents.forEach(c => c.classList.toggle('active', c.id === target));
            resetValidation();
        });
    });

    // --- LÓGICA PARA MOSTRAR/OCULTAR CONTRASEÑA ---
    document.querySelectorAll('.password-toggle-icon').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const passwordInput = toggle.previousElementSibling;
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            toggle.classList.toggle('fa-eye-slash');
        });
    });

    // --- LÓGICA DEL MODAL DE TÉRMINOS Y CONDICIONES ---
    const termsModal = document.getElementById('terms-modal');
    document.getElementById('open-terms-link').addEventListener('click', () => termsModal.classList.add('active'));
    document.getElementById('close-terms-btn').addEventListener('click', () => termsModal.classList.remove('active'));
    termsModal.addEventListener('click', e => { if (e.target === termsModal) termsModal.classList.remove('active'); });

    // --- LÓGICA DE VALIDACIÓN ---
    const validationStatus = {};

    const showError = (input, message) => {
        const group = input.parentElement;
        group.classList.remove('success'); group.classList.add('error');
        group.querySelector('.error-message').textContent = message;
    };
    const showSuccess = (input) => {
        const group = input.parentElement;
        group.classList.remove('error'); group.classList.add('success');
    };
    
    const checkFormValidity = () => {
        const allValid = Object.values(validationStatus).every(status => status === true);
        submitBtn.disabled = !allValid;
    };

    const resetValidation = () => {
        form.querySelectorAll('.input-group').forEach(group => {
            group.classList.remove('error', 'success');
        });
        form.querySelectorAll('input[type="password"]').forEach(input => {
            input.value = '';
        });
        checklist.querySelectorAll('li').forEach(item => item.className = '');
        setupValidationForActiveTab();
    };

    const setupValidationForActiveTab = () => {
        const activeTabId = document.querySelector('.tab-content.active').id;
        Object.keys(validationStatus).forEach(key => delete validationStatus[key]);

        if (activeTabId === 'cliente') {
            Object.assign(validationStatus, { nombre: false, email: false, pass: false, passConfirm: false, terms: false });
        } else if (activeTabId === 'restaurante') {
            Object.assign(validationStatus, { nombre: false, direccion: false, tipo: false, telefono: false, email: false, pass: false, passConfirm: false, terms: false });
        } else if (activeTabId === 'repartidor') {
            Object.assign(validationStatus, { nombre: false, email: false, vehiculo: false, pass: false, passConfirm: false, terms: false });
        }
        checkFormValidity();
    };

    const validatePassword = (passInput) => {
        const value = passInput.value;
        const isLengthValid = value.length >= 8 && value.length <= 25;
        const hasUppercase = /[A-Z]/.test(value);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        
        document.getElementById('length').className = isLengthValid ? 'valid' : '';
        document.getElementById('uppercase').className = hasUppercase ? 'valid' : '';
        document.getElementById('special').className = hasSpecial ? 'valid' : '';
        
        const isValid = isLengthValid && hasUppercase && hasSpecial;
        if(isValid) {
            showSuccess(passInput);
        } else {
            passInput.parentElement.classList.remove('success', 'error');
        }
        validationStatus.pass = isValid;
        checkFormValidity();
    };

    form.addEventListener('input', e => {
        const activeTabId = document.querySelector('.tab-content.active').id;
        const input = e.target;
        const id = input.id;
        
        if (activeTabId === 'cliente') {
            if (id === 'cliente-nombre') {
                const isValid = /^[a-zA-Z\s]{3,}$/.test(input.value);
                isValid ? showSuccess(input) : showError(input, 'El nombre solo debe contener letras (mín. 3).');
                validationStatus.nombre = isValid;
            }
            if (id === 'cliente-email') {
                const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
                isValid ? showSuccess(input) : showError(input, 'Por favor, introduce un correo válido.');
                validationStatus.email = isValid;
            }
            if (id === 'cliente-pass') {
                validatePassword(input);
            }
            if (id === 'cliente-pass-confirm') {
                const pass = document.getElementById('cliente-pass').value;
                const isValid = input.value === pass && input.value.length > 0;
                isValid ? showSuccess(input) : showError(input, 'Las contraseñas no coinciden.');
                validationStatus.passConfirm = isValid;
            }
        }

        if (activeTabId === 'restaurante') {
            if (id === 'restaurante-nombre') {
                const isValid = input.value.length >= 3;
                isValid ? showSuccess(input) : showError(input, 'El nombre es requerido (mín. 3 caracteres).');
                validationStatus.nombre = isValid;
            }
            if (id === 'restaurante-direccion') {
                const isValid = input.value.length >= 10;
                isValid ? showSuccess(input) : showError(input, 'La dirección es requerida (mín. 10 caracteres).');
                validationStatus.direccion = isValid;
            }
            if (id === 'restaurante-tipo') {
                const isValid = input.value !== "";
                isValid ? showSuccess(input) : showError(input, 'Debes seleccionar un tipo de cocina.');
                validationStatus.tipo = isValid;
            }
            if (id === 'restaurante-telefono') {
                const isValid = /^\d{10}$/.test(input.value);
                isValid ? showSuccess(input) : showError(input, 'Introduce un teléfono válido de 10 dígitos.');
                validationStatus.telefono = isValid;
            }
            if (id === 'restaurante-email') {
                const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
                isValid ? showSuccess(input) : showError(input, 'Por favor, introduce un correo válido.');
                validationStatus.email = isValid;
            }
            if (id === 'restaurante-pass') {
                validatePassword(input);
            }
            if (id === 'restaurante-pass-confirm') {
                const pass = document.getElementById('restaurante-pass').value;
                const isValid = input.value === pass && input.value.length > 0;
                isValid ? showSuccess(input) : showError(input, 'Las contraseñas no coinciden.');
                validationStatus.passConfirm = isValid;
            }
        }
        
        if (activeTabId === 'repartidor') {
            if (id === 'repartidor-nombre') {
                const isValid = /^[a-zA-Z\s]{3,}$/.test(input.value);
                isValid ? showSuccess(input) : showError(input, 'El nombre solo debe contener letras (mín. 3).');
                validationStatus.nombre = isValid;
            }
            if (id === 'repartidor-email') {
                const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
                isValid ? showSuccess(input) : showError(input, 'Por favor, introduce un correo válido.');
                validationStatus.email = isValid;
            }
            if (id === 'repartidor-vehiculo') {
                const isValid = input.value !== "";
                isValid ? showSuccess(input) : showError(input, 'Debes seleccionar un tipo de vehículo.');
                validationStatus.vehiculo = isValid;
            }
            if (id === 'repartidor-pass') {
                validatePassword(input);
            }
            if (id === 'repartidor-pass-confirm') {
                const pass = document.getElementById('repartidor-pass').value;
                const isValid = input.value === pass && input.value.length > 0;
                isValid ? showSuccess(input) : showError(input, 'Las contraseñas no coinciden.');
                validationStatus.passConfirm = isValid;
            }
        }

        if (id === 'terms-check') {
            validationStatus.terms = input.checked;
        }

        checkFormValidity();
    });

    // Envío del formulario
    form.addEventListener('submit', e => {
        e.preventDefault();
        
        if (!submitBtn.disabled) {
            const activeTabId = document.querySelector('.tab-content.active').id;
            let formData = {
                role: activeTabId
            };

            if (activeTabId === 'cliente') {
                formData.nombre = document.getElementById('cliente-nombre').value;
                formData.email = document.getElementById('cliente-email').value;
                formData.password = document.getElementById('cliente-pass').value;
            } else if (activeTabId === 'restaurante') {
                formData.nombre = document.getElementById('restaurante-nombre').value;
                formData.direccion = document.getElementById('restaurante-direccion').value;
                formData.tipo = document.getElementById('restaurante-tipo').value;
                formData.telefono = document.getElementById('restaurante-telefono').value;
                formData.email = document.getElementById('restaurante-email').value;
                formData.password = document.getElementById('restaurante-pass').value;
            } else if (activeTabId === 'repartidor') {
                formData.nombre = document.getElementById('repartidor-nombre').value;
                formData.email = document.getElementById('repartidor-email').value;
                formData.vehiculo = document.getElementById('repartidor-vehiculo').value;
                formData.password = document.getElementById('repartidor-pass').value;
            }

            fetch('http://127.0.0.1:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })
            .then(response => response.json())
            .then(data => {
                showNotification(data.message);
                
                if (data.message === '¡Cuenta creada con éxito!') {
                    // Esperamos 2 segundos para que el usuario vea el mensaje y luego redirigimos
                    setTimeout(() => {
                        window.location.href = '/login.html';
                    }, 2000);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                showNotification('Error de Conexión. Inténtalo más tarde.');
            });
        }
    });
    
    setupValidationForActiveTab();
});