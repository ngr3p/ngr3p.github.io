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

    // --- 2. HEADER & SCROLL EFFECT (ESTABILIZADO) ---
    const header = document.querySelector('.main-header'); // Seleciona o menu

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('header-scrolled');
        } else {
            // Só remove a classe se NÃO estivermos na página interna (single-post)
            // Pois na página do post queremos o menu sempre escuro para ler melhor
            if (!document.body.classList.contains('single-post')) {
                header.classList.remove('header-scrolled');
            }
        }
    });
    
    const footer = document.querySelector('.main-footer');
    const heroContainer = document.querySelector('.hero-section .container');
    const postsGrid = document.querySelector('.posts-grid');
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    let allPosts = [];
    let displayedCount = 0;

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

    // --- 4. CARREGAMENTO DOS POSTS (JSON) ---
    fetch('assets/data/posts.json')
        .then(response => response.json())
        .then(data => {
            allPosts = data;
            renderInitialState();
        })
        .catch(error => console.error('Error loading posts:', error));

    function renderInitialState() {
        if (allPosts.length === 0) return;

        // Renderiza o Hero (Post 0)
        const latest = allPosts[0];
        if (heroContainer) {
            heroContainer.innerHTML = `
                <article class="post-card featured">
                    <h1 class="post-title">${latest.title}</h1>
                    <div class="description-container">
                        <div class="vertical-bar"></div>
                        <p class="description-text">${latest.description}</p>
                    </div>
                    <a href="${latest.url}" class="cta-button">Read Analysis</a>
                </article>
            `;
            applyReveal(heroContainer.querySelectorAll('.post-card'));
        }

        // Prepara os posts para o Grid (do 1 em diante)
        renderBatch(6);
    }

    function renderBatch(count) {
        const gridPosts = allPosts.slice(1); // Ignora o post do hero
        const toRender = gridPosts.slice(displayedCount, displayedCount + count);

        toRender.forEach((post, index) => {
            const card = document.createElement('a');
            card.href = post.url;
            card.className = 'grid-item';
            card.innerHTML = `
                <span class="post-cat">${post.category}</span>
                <h3>${post.title}</h3>
                <p>${post.short_desc}</p>
                <span class="read-link">Read Analysis</span>
            `;
            postsGrid.appendChild(card);
            
            // Aplica animação com delay pequeno para cada card
            setTimeout(() => applyReveal([card]), index * 100);
        });

        displayedCount += toRender.length;

        // Esconde o botão se não houver mais posts
        if (displayedCount >= gridPosts.length && loadMoreBtn) {
            loadMoreBtn.classList.add('hidden');
        }
    }

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => renderBatch(3));
    }

    // --- 5. SYSTEM STATUS ---
    console.log(
        "%c ngr3p %c system: online %c",
        "background:#00FF88; color:#000; font-weight:bold; border-radius:3px 0 0 3px; padding:2px 5px;",
        "background:#1a1a1a; color:#00FF88; font-weight:bold; border-radius:0 3px 3px 0; padding:2px 5px;",
        "background:transparent"
    );
});