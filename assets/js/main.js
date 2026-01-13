document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. LÓGICA DO PRELOADER ---
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

    // --- 2. HEADER SCROLL ---
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('header-scrolled');
        } else {
            if (!document.body.classList.contains('single-post')) {
                header.classList.remove('header-scrolled');
            }
        }
    });
    
    // --- 3. REVEAL ANIMATION ---
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

    // --- 4. SISTEMA DE POSTS UNIFICADO ---
    
    // Elementos da Interface
    const heroContainer = document.querySelector('.hero-section .container');
    // Tenta pegar o grid da Home OU o grid do Post
    const targetGrid = document.querySelector('.posts-grid') || document.getElementById('related-posts-grid');
    const loadMoreBtn = document.getElementById('load-more-btn');

    // Variáveis de Controle
    let postsToRender = []; // Lista filtrada que será exibida
    let displayedCount = 0; // Quantos já mostramos

    fetch('assets/data/posts.json')
        .then(response => response.json())
        .then(data => {
            // Verifica onde estamos
            const isHomePage = !!heroContainer;
            const isPostPage = document.body.classList.contains('single-post');

            if (isHomePage) {
                // --- CENÁRIO 1: HOME PAGE ---
                
                // 1. Renderiza o Hero (Índice 0)
                const latest = data[0];
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

                // 2. Prepara a lista para o Grid (Todos menos o Hero)
                postsToRender = data.slice(1);
            
            } else if (isPostPage) {
                // --- CENÁRIO 2: POST PAGE ---
                
                // 1. Descobre qual post estamos lendo (pelo H1) e normaliza para minúsculo
                const currentH1 = document.querySelector('.entry-title').textContent.trim().toLowerCase();
                
                // 2. Filtra: Remove o post se o Título do H1 CONTIVER o título do JSON
                postsToRender = data.filter(post => {
                    const jsonTitle = post.title.trim().toLowerCase();
                    // Se o H1 da página contiver o título do JSON (ex: "NTLM..." contém "NTLM"), remove da lista.
                    return !currentH1.includes(jsonTitle);
                });
            }

            // --- RENDERIZAÇÃO INICIAL DO GRID (COMUM PARA OS DOIS) ---
            // Se existir um grid na tela, renderiza o primeiro lote de 6
            if (targetGrid) {
                renderBatch(6);
            }
        })
        .catch(error => console.error('Error loading posts:', error));


    // Função que gerencia a exibição em lotes
    function renderBatch(count) {
        // Pega o próximo lote da lista 'postsToRender'
        const batch = postsToRender.slice(displayedCount, displayedCount + count);

        batch.forEach((post, index) => {
            const card = document.createElement('a');
            card.href = post.url;
            card.className = 'grid-item';
            card.innerHTML = `
                <span class="post-cat">${post.category}</span>
                <h3>${post.title}</h3>
                <p>${post.short_desc}</p>
                <span class="read-link">Read Analysis_</span>
            `;
            targetGrid.appendChild(card);
            
            // Delay para efeito cascata
            setTimeout(() => applyReveal([card]), index * 100);
        });

        displayedCount += batch.length;

        // Gerencia o Botão
        if (loadMoreBtn) {
            // Se já mostramos tudo, esconde o botão
            if (displayedCount >= postsToRender.length) {
                loadMoreBtn.classList.add('hidden'); // O CSS precisa ter .hidden { display: none; }
                loadMoreBtn.style.display = 'none'; // Garante via inline style
            } else {
                loadMoreBtn.style.display = 'inline-block';
            }
        }
    }

    // Evento do Botão (Carrega mais 3 ou 6, como preferir)
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => renderBatch(3));
    }

    // --- SYSTEM STATUS ---
    console.log(
        "%c ngr3p %c system: active %c",
        "background:#00FF88; color:#000; font-weight:bold; border-radius:3px 0 0 3px; padding:2px 5px;",
        "background:#1a1a1a; color:#00FF88; font-weight:bold; border-radius:0 3px 3px 0; padding:2px 5px;",
        "background:transparent"
    );
});