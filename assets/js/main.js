document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. PRELOADER & SETUP ---
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
            // Chama o ajuste inteligente assim que carrega
            fitTitle();
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

    // --- 4. SISTEMA DE DADOS (GRID + TITLE FIT) ---
    const heroContainer = document.querySelector('.hero-section .container');
    const targetGrid = document.querySelector('.posts-grid') || document.getElementById('related-posts-grid');
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    let allPosts = [];
    let postsToRender = []; 
    let displayedCount = 0;
    let userHasInteracted = false; 

    // [FUNÇÃO INTELIGENTE: TITLE AUTO-FIT + LAYOUT CONTROL]
    // Controla tanto o tamanho da fonte quanto a largura da caixa para evitar órfãos
    function fitTitle() {
        const title = document.querySelector('.post-title') || document.querySelector('.entry-title');
        if (!title) return;

        const textLength = title.textContent.trim().length;
        const screenWidth = window.innerWidth;
        
        // 1. Cálculo do Tamanho da Fonte (Font Size)
        let maxFontSize, minFontSize;

        if (screenWidth >= 1600) {      // iMac
            maxFontSize = 6.0; minFontSize = 4.0; 
        } else if (screenWidth >= 1200) { // Desktop
            maxFontSize = 5.0; minFontSize = 3.5; 
        } else if (screenWidth >= 768) {  // Tablet
            maxFontSize = 4.0; minFontSize = 2.5; 
        } else {                          // Mobile
            maxFontSize = 3.0; minFontSize = 2.0; 
        }

        let calculatedSize;
        if (textLength < 15) {
            calculatedSize = maxFontSize;
        } else if (textLength > 35) {
            calculatedSize = minFontSize;
        } else {
            const ratio = (textLength - 15) / (35 - 15); 
            calculatedSize = maxFontSize - (ratio * (maxFontSize - minFontSize));
        }

        title.style.fontSize = `${calculatedSize}rem`;

        // 2. Controle de Largura (Anti-Orphan Logic)
        // Em telas grandes (Desktop/iMac), travamos a largura em 'em'
        // Isso força o 'text-wrap: balance' a trabalhar dentro de uma caixa mais apertada,
        // garantindo que palavras de conexão (como 'with') caiam para a segunda linha.
        if (screenWidth >= 1200) {
            title.style.width = '100%';
            title.style.maxWidth = '11em'; // O "ponto doce" para quebra de linha visual
            title.style.marginLeft = '0';  // Garante alinhamento à esquerda
        } else {
            // Em mobile/tablet, deixamos mais solto pois a tela já é estreita
            title.style.maxWidth = '100%';
        }
    }

    // [GRID LOGIC]
    function getGridColumns() {
        if (!targetGrid) return 1;
        const gridStyle = window.getComputedStyle(targetGrid);
        const gridTemplate = gridStyle.getPropertyValue('grid-template-columns');
        if (!gridTemplate || gridTemplate === 'none') return 1;
        const columns = gridTemplate.trim().split(/\s+/).length;
        return columns > 0 ? columns : 1;
    }

    function getInitialPostCount() {
        const cols = getGridColumns();
        return (cols === 1) ? 6 : (cols * 2);
    }

    fetch('assets/data/posts.json')
        .then(response => response.json())
        .then(data => {
            allPosts = data; 

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
                fitTitle(); // Aplica ajuste imediato
                applyReveal(heroContainer.querySelectorAll('.post-card'));
                postsToRender = data.slice(1);
            
            } else if (isPostPage) {
                fitTitle(); // Aplica ajuste no post individual
                const currentH1 = document.querySelector('.entry-title').textContent.trim().toLowerCase();
                postsToRender = data.filter(post => {
                    const jsonTitle = post.title.trim().toLowerCase();
                    return !currentH1.includes(jsonTitle);
                });
            }

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

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            userHasInteracted = true;
            const cols = getGridColumns();
            renderBatch((cols === 1) ? 6 : (cols * 2)); 
        });
    }

    // [RESIZE HANDLER]
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        
        // Ajusta título instantaneamente
        fitTitle(); 
        
        resizeTimer = setTimeout(() => {
            if (targetGrid) {
                const cols = getGridColumns();
                
                if (!userHasInteracted) {
                    const idealCount = getInitialPostCount();
                    const diff = idealCount - displayedCount;

                    if (diff > 0) {
                        renderBatch(diff);
                    } else if (diff < 0) {
                        const items = targetGrid.querySelectorAll('.grid-item');
                        for (let i = displayedCount - 1; i >= idealCount; i--) {
                            if (items[i]) items[i].remove();
                        }
                        displayedCount = idealCount;
                        updateLoadMoreButton();
                    }
                } else {
                    const remainder = displayedCount % cols;
                    if (remainder !== 0) {
                        const needed = cols - remainder;
                        if (displayedCount + needed <= postsToRender.length) {
                            renderBatch(needed);
                        }
                    }
                }
            }
        }, 100); 
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