document.addEventListener('DOMContentLoaded', function() {
    
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
            // Al cambiar de pestaña, resetea el formulario y deshabilita el botón
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

    // --- LÓGICA DEL MODAL ---
    const modal = document.getElementById('terms-modal');
    document.getElementById('open-terms-link').addEventListener('click', () => modal.classList.add('active'));
    document.getElementById('close-terms-btn').addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });

    // --- LÓGICA DE VALIDACIÓN ---
    const validationStatus = {}; // Estado de validación para la pestaña activa

    // Funciones auxiliares de UI
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
        // 1. Quita los colores de contorno (verde/rojo) de todos los campos
        form.querySelectorAll('.input-group').forEach(group => {
            group.classList.remove('error', 'success');
        });

        // 2. Borra el contenido de todos los campos de contraseña
        form.querySelectorAll('input[type="password"]').forEach(input => {
            input.value = '';
        });

        // 3. Reinicia el estado visual del checklist de contraseña
        checklist.querySelectorAll('li').forEach(item => item.className = '');

        // 4. Resetea el objeto de validación para la nueva pestaña
        setupValidationForActiveTab();
    };

    // Configura la validación según la pestaña activa
    const setupValidationForActiveTab = () => {
        const activeTabId = document.querySelector('.tab-content.active').id;
        Object.keys(validationStatus).forEach(key => delete validationStatus[key]); // Limpia el objeto

        // Se configuran los campos que deben ser válidos para cada formulario
        if (activeTabId === 'cliente') {
            Object.assign(validationStatus, { nombre: false, email: false, pass: false, passConfirm: false, terms: false });
        } else if (activeTabId === 'restaurante') {
            Object.assign(validationStatus, { nombre: false, direccion: false, tipo: false, telefono: false, email: false, pass: false, passConfirm: false, terms: false });
        } else if (activeTabId === 'repartidor') {
            Object.assign(validationStatus, { nombre: false, email: false, vehiculo: false, pass: false, passConfirm: false, terms: false });
        }
        checkFormValidity(); // Re-evalúa el estado del botón
    };

    // Validador de Contraseña (común a todos los formularios)
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
            // No mostramos error aquí para no ser tan invasivos, el checklist guía al usuario
            passInput.parentElement.classList.remove('success', 'error');
        }
        validationStatus.pass = isValid;
        checkFormValidity();
    };

    // Listener genérico para inputs
    form.addEventListener('input', e => {
        const activeTabId = document.querySelector('.tab-content.active').id;
        const input = e.target;
        const id = input.id;
        
        // Validaciones para CLIENTE
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

        // Validaciones para RESTAURANTE
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
        
        // Validaciones para REPARTIDOR
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

        // Validación de Términos (común a todos)
        if (id === 'terms-check') {
            validationStatus.terms = input.checked;
        }

        checkFormValidity();
    });

    // Envío del formulario
    form.addEventListener('submit', e => {
        e.preventDefault();
        if (!submitBtn.disabled) {
            alert('¡Cuenta creada con éxito! (Aquí iría la lógica de Flask)');
            form.reset();
            resetValidation(); // Resetea todo para un nuevo registro
        }
    });
    
    // Inicializa la validación para la pestaña activa al cargar la página
    setupValidationForActiveTab();
});