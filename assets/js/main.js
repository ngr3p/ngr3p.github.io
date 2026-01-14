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

    // --- 4. SISTEMA DE DADOS INTELIGENTE (JSON) ---
    const heroContainer = document.querySelector('.hero-section .container');
    const targetGrid = document.querySelector('.posts-grid') || document.getElementById('related-posts-grid');
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    let allPosts = [];
    let postsToRender = []; 
    let displayedCount = 0;
    
    // Flag: Se o usuário clicou no botão, o resize para de remover posts (comportamento padrão)
    // Mas ainda vai garantir múltiplos corretos para evitar órfãos.
    let userHasInteracted = false; 

    // [NOVA FUNÇÃO INFALÍVEL] 
    // Conta as colunas reais desenhadas pelo CSS (auto-fit)
    function getGridColumns() {
        if (!targetGrid) return 1;
        
        // Pega o estilo computado do grid
        const gridStyle = window.getComputedStyle(targetGrid);
        
        // Pega a propriedade grid-template-columns (ex: "300px 300px 300px")
        const gridTemplate = gridStyle.getPropertyValue('grid-template-columns');

        // Proteção caso o grid ainda não tenha carregado ou seja "none"
        if (!gridTemplate || gridTemplate === 'none') return 1;
        
        // Conta quantos valores existem (ex: 3 valores = 3 colunas)
        const columns = gridTemplate.trim().split(/\s+/).length;
        
        return columns > 0 ? columns : 1;
    }

    // Calcula quantos posts carregar inicialmente (sempre 2 linhas completas)
    function getInitialPostCount() {
        const cols = getGridColumns();
        // Se for mobile (1 coluna), carrega 6 para scrollar. Se não, 2 linhas cheias.
        return (cols === 1) ? 6 : (cols * 2);
    }

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

            // Renderiza inicial
            if (targetGrid) renderBatch(getInitialPostCount());
        })
        .catch(error => console.error('Error loading posts:', error));


    function renderBatch(count) {
        if (count <= 0) return;

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
        updateLoadMoreButton();
    }

    function updateLoadMoreButton() {
        if (loadMoreBtn) {
            if (displayedCount >= postsToRender.length) {
                loadMoreBtn.classList.add('hidden');
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.classList.remove('hidden');
                loadMoreBtn.style.display = 'inline-block';
            }
        }
    }

    // [LÓGICA "LOAD MORE" SEM ÓRFÃOS]
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            userHasInteracted = true;
            
            const cols = getGridColumns();
            // Lógica: Sempre carrega o suficiente para preencher 2 linhas novas
            // Ex: Se tem 3 colunas, carrega 6. Se tem 4, carrega 8.
            const batchSize = (cols === 1) ? 6 : (cols * 2);
            
            renderBatch(batchSize); 
        });
    }

    // [LÓGICA "RESIZE" SEM ÓRFÃOS]
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        // Debounce para performance
        resizeTimer = setTimeout(() => {
            if (targetGrid) {
                const cols = getGridColumns();
                
                // 1. Se o usuário NÃO interagiu, forçamos o padrão inicial (2 linhas perfeitas)
                if (!userHasInteracted) {
                    const idealCount = getInitialPostCount();
                    const diff = idealCount - displayedCount;

                    if (diff > 0) {
                        renderBatch(diff); // Adiciona para completar a linha
                    } else if (diff < 0) {
                        // Remove posts extras para não sobrar órfão ao diminuir a tela
                        const items = targetGrid.querySelectorAll('.grid-item');
                        for (let i = displayedCount - 1; i >= idealCount; i--) {
                            if (items[i]) items[i].remove();
                        }
                        displayedCount = idealCount;
                        updateLoadMoreButton();
                    }
                } 
                // 2. Se o usuário JÁ interagiu (já carregou mais posts)
                // Precisamos garantir que o TOTAL exibido seja múltiplo das colunas atuais
                else {
                    const remainder = displayedCount % cols;
                    
                    // Se remainder > 0, significa que tem posts órfãos na última linha
                    if (remainder !== 0) {
                        // Opção A: Carregar mais posts para fechar a linha
                        const needed = cols - remainder;
                        
                        // Verifica se existem posts suficientes no JSON para completar
                        if (displayedCount + needed <= postsToRender.length) {
                            renderBatch(needed);
                        } else {
                            // Se não tiver mais posts no banco de dados, paciência (fim da lista)
                            // Ou poderíamos remover os órfãos, mas melhor deixar visível se for o fim.
                        }
                    }
                }
            }
        }, 200);
    });


    // --- 5. SEARCH MODULE ---
    const searchTrigger = document.getElementById('search-trigger');
    const searchOverlay = document.getElementById('search-overlay');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results-container');
    const closeSearchBtn = document.getElementById('close-search');
    let selectedIndex = -1; 

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
        selectedIndex = -1; 
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

    document.addEventListener('keydown', (e) => {
        if (searchOverlay.classList.contains('hidden')) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                openSearch();
            }
            return; 
        }

        const results = document.querySelectorAll('.search-item');
        
        if (e.key === 'Escape') {
            closeSearch();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault(); 
            if (results.length > 0) {
                selectedIndex++;
                if (selectedIndex >= results.length) selectedIndex = 0; 
                updateSelection(results);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (results.length > 0) {
                selectedIndex--;
                if (selectedIndex < 0) selectedIndex = results.length - 1; 
                updateSelection(results);
            }
        } else if (e.key === 'Enter') {
            if (selectedIndex > -1 && results[selectedIndex]) {
                e.preventDefault();
                results[selectedIndex].click(); 
            }
        }
    });

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

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            selectedIndex = -1; 

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

    const postImages = document.querySelectorAll('.post-body img, .screenshot-container img');

    if (postImages.length > 0) {
        postImages.forEach(img => {
            img.addEventListener('click', function() {
                if (imageModal) {
                    imageModal.classList.remove('hidden');
                    modalImg.src = this.src; 
                    
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

    function closeImageModal() {
        if (imageModal) imageModal.classList.add('hidden');
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeImageModal);

    if (imageModal) {
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal || e.target === modalImg) {
                closeImageModal();
            }
        });
    }

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