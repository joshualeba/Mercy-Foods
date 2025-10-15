// --- LÓGICA PARA OCULTAR EL LOADER ---
    window.addEventListener('load', function() {
        const loaderWrapper = document.getElementById('loader-wrapper');
        loaderWrapper.style.opacity = '0';
        setTimeout(() => {
            loaderWrapper.style.display = 'none';
        }, 500);
    });

var typed = new Typed('#typed-text', {
            strings: ["apoyo local", "sabor sin esperas", "calidad y rapidez", "comunidad a tu puerta", "la comida que amas, más cerca"],
            typeSpeed: 70,
            backSpeed: 40,
            loop: true
        });

const swiper = new Swiper('.testimonials-slider', {
        // Opciones
        loop: true,
        grabCursor: true,
        spaceBetween: 30,
        
        // Autoplay
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },

        // Paginación
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },

        // Responsividad (Breakpoints)
        breakpoints: {
            // Cuando la pantalla es >= 640px
            640: {
                slidesPerView: 1,
            },
            // Cuando la pantalla es >= 768px
            768: {
                slidesPerView: 2,
            },
            // Cuando la pantalla es >= 1024px
            1024: {
                slidesPerView: 3,
            },
        }
    });

document.addEventListener('DOMContentLoaded', function() {
    // --- LÓGICA PARA TODOS LOS MODALES ---
    const modals = [
        { id: 'privacy-modal', openBtnId: 'open-modal-link', closeBtnId: 'close-modal-btn' },
        { id: 'terms-modal', openBtnId: 'open-terms-link', closeBtnId: 'close-terms-btn' },
        { id: 'faq-modal', openBtnId: 'open-faq-link', closeBtnId: 'close-faq-btn' }
    ];

    modals.forEach(modalInfo => {
        const modal = document.getElementById(modalInfo.id);
        const openBtn = document.getElementById(modalInfo.openBtnId);
        const closeBtn = document.getElementById(modalInfo.closeBtnId);

        const openModal = () => modal.classList.add('active');
        const closeModal = () => modal.classList.remove('active');

        if (openBtn) {
            openBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal); 
        }
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }
    });

    // --- LÓGICA PARA EL ACORDEÓN DE FAQ ---
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');

            // Cierra todos los items
            faqItems.forEach(i => {
                i.classList.remove('active');
                i.querySelector('.faq-answer').style.maxHeight = '0px';
            });

            // Si el item clickeado no estaba abierto, ábrelo
            if (!isOpen) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
});