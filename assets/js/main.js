document.addEventListener('DOMContentLoaded', () => {
    // --- 1. LÓGICA DO PRELOADER (SEM PORCENTAGEM) ---
    const progressFill = document.getElementById('progress-bar');
    const loaderWrapper = document.getElementById('loader-wrapper');
    let width = 0;

    const loadingInterval = setInterval(() => {
        if (width >= 90) {
            clearInterval(loadingInterval);
        } else {
            width += Math.random() * 10;
            if (width > 90) width = 90;
            if (progressFill) progressFill.style.width = `${Math.round(width)}%`;
        }
    }, 200);

    window.addEventListener('load', () => {
        clearInterval(loadingInterval);
        if (progressFill) progressFill.style.width = '100%';
        
        setTimeout(() => {
            if (loaderWrapper) loaderWrapper.classList.add('loader-hidden');
        }, 600);
    });

    // --- 2. HEADER & SCROLL EFFECT ---
    const header = document.querySelector('.main-header');
    const footer = document.querySelector('.main-footer');
    let hiddenPosts = Array.from(document.querySelectorAll('.hidden-post'));

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(10, 10, 10, 0.9)';
            header.style.backdropFilter = 'blur(10px)';
            header.style.padding = '15px 0';
        } else {
            header.style.background = 'transparent';
            header.style.backdropFilter = 'none';
            header.style.padding = '40px 0';
        }
    });

    // --- 3. REVEAL ANIMATION (INTERSECTION OBSERVER) ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    function applyReveal(elements) {
        elements.forEach(el => {
            Object.assign(el.style, {
                opacity: '0',
                transform: 'translateY(30px)',
                transition: 'all 0.6s ease-out'
            });
            revealObserver.observe(el);
        });
    }

    applyReveal(document.querySelectorAll('.grid-item:not(.hidden-post), .post-card'));

    // --- 4. MECÂNICA DE CARREGAMENTO (6 INICIAIS + INFINITE SCROLL) ---
    
    function showMorePosts(amount) {
        // .splice remove os itens do array original, evitando duplicatas ou cargas infinitas
        const toShow = hiddenPosts.splice(0, amount);
        
        toShow.forEach(post => {
            post.classList.remove('hidden-post');
            applyReveal([post]);
            setTimeout(() => post.classList.add('show'), 100);
        });
    }

    // Carrega +3 posts iniciais após um micro-delay para garantir estabilidade do DOM
    setTimeout(() => {
        if (hiddenPosts.length > 0) {
            showMorePosts(3);
        }
    }, 100);

    // Observer para o Infinite Scroll com margem de 200px para carregar antes do fim
    const loadMoreObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hiddenPosts.length > 0) {
            showMorePosts(3);
        }
    }, { rootMargin: '200px' });

    if (footer) loadMoreObserver.observe(footer);

    // --- 5. SYSTEM STATUS ---
    console.log(
        "%c ngr3p %c system: online %c",
        "background:#00FF88; color:#000; font-weight:bold; border-radius:3px 0 0 3px; padding:2px 5px;",
        "background:#1a1a1a; color:#00FF88; font-weight:bold; border-radius:0 3px 3px 0; padding:2px 5px;",
        "background:transparent"
    );
});