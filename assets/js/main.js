document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. PRELOADER ---
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

    // --- 4. SISTEMA DE DADOS (JSON) ---
    const heroContainer = document.querySelector('.hero-section .container');
    const targetGrid = document.querySelector('.posts-grid') || document.getElementById('related-posts-grid');
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    let allPosts = [];
    let postsToRender = []; 
    let displayedCount = 0;

    fetch('assets/data/posts.json')
        .then(response => response.json())
        .then(data => {
            allPosts = data; 

            // Lógica Home vs Post
            const isHomePage = !!heroContainer;
            const isPostPage = document.body.classList.contains('single-post');

            if (isHomePage) {
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
                postsToRender = data.slice(1);
            
            } else if (isPostPage) {
                const currentH1 = document.querySelector('.entry-title').textContent.trim().toLowerCase();
                postsToRender = data.filter(post => {
                    const jsonTitle = post.title.trim().toLowerCase();
                    return !currentH1.includes(jsonTitle);
                });
            }

            if (targetGrid) renderBatch(6);
        })
        .catch(error => console.error('Error loading posts:', error));


    function renderBatch(count) {
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
            setTimeout(() => applyReveal([card]), index * 100);
        });
        displayedCount += batch.length;

        if (loadMoreBtn) {
            if (displayedCount >= postsToRender.length) {
                loadMoreBtn.classList.add('hidden');
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'inline-block';
            }
        }
    }

    if (loadMoreBtn) loadMoreBtn.addEventListener('click', () => renderBatch(3));


    // --- 5. SEARCH MODULE (COM NAVEGAÇÃO POR TECLADO) ---
    const searchTrigger = document.getElementById('search-trigger');
    const searchOverlay = document.getElementById('search-overlay');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results-container');
    const closeSearchBtn = document.getElementById('close-search');
    
    // Variável para controlar a navegação
    let selectedIndex = -1; 

    // Abrir Busca
    if (searchTrigger) {
        searchTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            openSearch();
        });
    }

    function openSearch() {
        searchOverlay.classList.remove('hidden');
        searchInput.value = '';
        searchResults.innerHTML = '';
        selectedIndex = -1; // Reseta seleção
        setTimeout(() => searchInput.focus(), 100);
    }

    function closeSearch() {
        searchOverlay.classList.add('hidden');
        selectedIndex = -1;
    }

    if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearch);
    if (searchOverlay) {
        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) closeSearch();
        });
    }

    // --- LISTENER GLOBAL DE TECLADO (NAVEGAÇÃO) ---
    document.addEventListener('keydown', (e) => {
        // Se a busca estiver FECHADA
        if (searchOverlay.classList.contains('hidden')) {
            // Abre com CTRL+K ou CMD+K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                openSearch();
            }
            // (Nota: O ESC do Lightbox é tratado separadamente abaixo)
            return; 
        }

        // Se a busca estiver ABERTA
        const results = document.querySelectorAll('.search-item');
        
        if (e.key === 'Escape') {
            closeSearch();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault(); // Impede cursor de andar no input
            if (results.length > 0) {
                selectedIndex++;
                if (selectedIndex >= results.length) selectedIndex = 0; // Loop pro topo
                updateSelection(results);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (results.length > 0) {
                selectedIndex--;
                if (selectedIndex < 0) selectedIndex = results.length - 1; // Loop pro final
                updateSelection(results);
            }
        } else if (e.key === 'Enter') {
            // Se tiver algo selecionado, navega
            if (selectedIndex > -1 && results[selectedIndex]) {
                e.preventDefault();
                results[selectedIndex].click(); // Simula clique no link
            }
        }
    });

    // Função Visual de Seleção
    function updateSelection(items) {
        items.forEach((item, index) => {
            if (index === selectedIndex) {
                item.classList.add('active');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('active');
            }
        });
    }

    // Input Search (Filtragem)
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            selectedIndex = -1; // Reseta seleção ao digitar

            if (term.length < 2) {
                searchResults.innerHTML = '';
                return;
            }

            const filteredPosts = allPosts.filter(post => {
                return post.title.toLowerCase().includes(term) || 
                       post.category.toLowerCase().includes(term);
            });

            if (filteredPosts.length > 0) {
                searchResults.innerHTML = filteredPosts.map((post, index) => `
                    <a href="${post.url}" class="search-item" data-index="${index}">
                        <span>${post.category}</span>
                        <h4>${post.title}</h4>
                    </a>
                `).join('');
            } else {
                searchResults.innerHTML = `
                    <div style="padding:20px; text-align:center; color:#666;">
                        <i class="fa-solid fa-ghost"></i> No intels found.
                    </div>`;
            }
        });
    }

    // --- 6. IMAGE LIGHTBOX (ZOOM) ---
    const imageModal = document.getElementById('image-modal');
    const modalImg = document.getElementById('img-expanded');
    const captionText = document.getElementById('caption-text');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // Seleciona todas as imagens dentro do corpo do post
    const postImages = document.querySelectorAll('.post-body img, .screenshot-container img');

    if (postImages.length > 0) {
        postImages.forEach(img => {
            img.addEventListener('click', function() {
                if (imageModal) {
                    imageModal.classList.remove('hidden');
                    modalImg.src = this.src; // Pega URL da imagem clicada
                    
                    // Tenta pegar a legenda (figcaption)
                    const parentFigcaption = this.parentElement.querySelector('figcaption');
                    const nextFigcaption = this.nextElementSibling;
                    
                    if (parentFigcaption) {
                        captionText.innerHTML = parentFigcaption.innerHTML;
                    } else if (nextFigcaption && nextFigcaption.tagName === 'FIGCAPTION') {
                        captionText.innerHTML = nextFigcaption.innerHTML;
                    } else {
                        captionText.innerHTML = '';
                    }
                }
            });
        });
    }

    // Função para fechar o Modal de Imagem
    function closeImageModal() {
        if (imageModal) imageModal.classList.add('hidden');
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeImageModal);

    // Fecha ao clicar fora da imagem
    if (imageModal) {
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal || e.target === modalImg) {
                closeImageModal();
            }
        });
    }

    // Listener específico para fechar o Modal de Imagem com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && imageModal && !imageModal.classList.contains('hidden')) {
            closeImageModal();
        }
    });

    // --- SYSTEM STATUS ---
    console.log(
        "%c ngr3p %c system: online %c",
        "background:#00FF88; color:#000; font-weight:bold; border-radius:3px 0 0 3px; padding:2px 5px;",
        "background:#1a1a1a; color:#00FF88; font-weight:bold; border-radius:0 3px 3px 0; padding:2px 5px;",
        "background:transparent"
    );
});