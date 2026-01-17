document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. PRELOADER ---
    const progressFill = document.getElementById('progress-bar');
    const loaderWrapper = document.getElementById('loader-wrapper');
    let width = 0;

    const loadingInterval = setInterval(() => {
        if (width >= 90) clearInterval(loadingInterval);
        else {
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
            
            // INICIALIZAÇÕES VISUAIS
            fitTitle();      // Ajusta texto do Hero
            initReveal();    // Animações de entrada
            initSmartGrid(); // Lógica de Quantidade de Posts (NOVO)
        }, 600);
    });

    // --- 2. HEADER SCROLL ---
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('header-scrolled');
        else if (!document.body.classList.contains('single-post')) header.classList.remove('header-scrolled');
    });

    // --- 3. REVEAL ANIMATION (SCROLL) ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    function initReveal() {
        // Pega elementos visuais estáticos (Header, Hero)
        const elements = document.querySelectorAll('.post-card.featured, .hero-content');
        elements.forEach(el => {
            Object.assign(el.style, {
                opacity: '0',
                transform: 'translateY(30px)',
                transition: 'all 0.6s ease-out'
            });
            revealObserver.observe(el);
        });
    }

    // --- 4. SMART GRID LOGIC (RESPONSIVO) ---
    // Essa lógica controla os posts gerados pelo Python com a classe .js-control
    const loadMoreBtn = document.getElementById('load-more-btn');
    const gridContainer = document.querySelector('.posts-grid');
    
    // Pega todos os posts invisíveis gerados pelo Python
    let allGridItems = Array.from(document.querySelectorAll('.js-control'));
    let displayedCount = 0;

    // Descobre quantas colunas o CSS está mostrando na tela atual
    function getGridColumns() {
        if (!gridContainer) return 1;
        const style = window.getComputedStyle(gridContainer);
        const template = style.getPropertyValue('grid-template-columns');
        // Conta os espaços definidos no grid (ex: "1fr 1fr" = 2)
        return template.split(' ').length || 1;
    }

    // Define quantos posts mostrar por vez (Lote)
    function getBatchSize() {
        const cols = getGridColumns();
        // Se 1 coluna (mobile) -> Mostra 6
        // Se 2, 3 ou 4 colunas -> Mostra (Colunas * 2). Ex: 4 cols = 8 posts.
        return (cols === 1) ? 6 : (cols * 2);
    }

    function showNextBatch() {
        const batchSize = getBatchSize();
        const total = allGridItems.length;
        
        let nextLimit = displayedCount + batchSize;
        if (nextLimit > total) nextLimit = total;

        // Loop para revelar os itens
        for (let i = displayedCount; i < nextLimit; i++) {
            if (allGridItems[i]) {
                allGridItems[i].classList.remove('hidden');
                
                // Aplica animação suave
                allGridItems[i].style.opacity = '0';
                allGridItems[i].style.transform = 'translateY(20px)';
                allGridItems[i].style.transition = 'all 0.6s ease-out';
                
                // Pequeno delay para efeito cascata
                setTimeout(() => {
                    allGridItems[i].style.opacity = '1';
                    allGridItems[i].style.transform = 'translateY(0)';
                }, (i - displayedCount) * 100);
            }
        }
        displayedCount = nextLimit;

        // Controle do Botão
        if (loadMoreBtn) {
            if (displayedCount >= total) {
                loadMoreBtn.style.display = 'none'; // Acabaram os posts
            } else {
                loadMoreBtn.style.display = 'inline-block'; // Ainda tem posts
            }
        }
    }

    function initSmartGrid() {
        if (allGridItems.length > 0) {
            // Mostra o primeiro lote imediatamente
            showNextBatch();
            
            // Ativa o clique do botão
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', (e) => {
                    e.preventDefault(); // Impede o link de pular para o topo
                    showNextBatch();
                });
            }
        } else {
            // Se não tem posts, esconde o botão
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        }
    }


    // --- 5. HERO TITLE FIT (TIPOGRAFIA) ---
    function fitTitle() {
        const title = document.querySelector('.hero-title') || document.querySelector('.entry-title');
        if (!title) return;

        let text = title.innerHTML; 
        if (!text.includes('&nbsp;') && title.textContent.trim().split(' ').length > 2) {
            title.innerHTML = title.textContent.trim().replace(/\s+([^\s]+)$/, '&nbsp;$1');
        }

        const textLength = title.textContent.trim().length;
        const screenWidth = window.innerWidth;
        
        let maxFontSize, minFontSize;

        if (screenWidth >= 1600) { maxFontSize = 6.0; minFontSize = 4.0; } 
        else if (screenWidth >= 1200) { maxFontSize = 5.0; minFontSize = 3.5; } 
        else if (screenWidth >= 768) { maxFontSize = 4.0; minFontSize = 2.5; } 
        else { maxFontSize = 2.5; minFontSize = 1.8; }

        let calculatedSize;
        if (textLength < 15) calculatedSize = maxFontSize;
        else if (textLength > 40) calculatedSize = minFontSize;
        else {
            const ratio = (textLength - 15) / (40 - 15); 
            calculatedSize = maxFontSize - (ratio * (maxFontSize - minFontSize));
        }

        title.style.fontSize = `${calculatedSize}rem`;
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            fitTitle();
        }, 100); 
    });


    // --- 6. SEARCH MODULE ---
    const searchTrigger = document.getElementById('search-trigger');
    const searchOverlay = document.getElementById('search-overlay');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results-container');
    const closeSearchBtn = document.getElementById('close-search');
    
    let allPosts = []; 
    let selectedIndex = -1; 

    // Busca silenciosa dos dados
    fetch('assets/data/posts.json')
        .then(response => response.json())
        .then(data => { allPosts = data; })
        .catch(err => console.error("Search system offline (local check):", err));

    if (searchTrigger) searchTrigger.addEventListener('click', (e) => { e.preventDefault(); openSearch(); });

    function openSearch() {
        searchOverlay.classList.remove('hidden');
        searchInput.value = '';
        searchResults.innerHTML = '';
        selectedIndex = -1; 
        setTimeout(() => searchInput.focus(), 100);
    }
    
    function closeSearch() { searchOverlay.classList.add('hidden'); selectedIndex = -1; }
    
    if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearch);
    if (searchOverlay) searchOverlay.addEventListener('click', (e) => { if (e.target === searchOverlay) closeSearch(); });

    document.addEventListener('keydown', (e) => {
        if (searchOverlay.classList.contains('hidden')) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
            return; 
        }
        const results = document.querySelectorAll('.search-item');
        if (e.key === 'Escape') closeSearch();
        else if (e.key === 'ArrowDown') {
            e.preventDefault(); 
            if (results.length > 0) { selectedIndex++; if (selectedIndex >= results.length) selectedIndex = 0; updateSelection(results); }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (results.length > 0) { selectedIndex--; if (selectedIndex < 0) selectedIndex = results.length - 1; updateSelection(results); }
        } else if (e.key === 'Enter') {
            if (selectedIndex > -1 && results[selectedIndex]) { e.preventDefault(); results[selectedIndex].click(); }
        }
    });

    function updateSelection(items) {
        items.forEach((item, index) => {
            if (index === selectedIndex) { item.classList.add('active'); item.scrollIntoView({ block: 'nearest' }); }
            else item.classList.remove('active');
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            selectedIndex = -1; 
            if (term.length < 2) { searchResults.innerHTML = ''; return; }
            
            const filteredPosts = allPosts.filter(post => post.title.toLowerCase().includes(term) || post.category.toLowerCase().includes(term));
            
            if (filteredPosts.length > 0) {
                searchResults.innerHTML = filteredPosts.map((post, index) => `
                    <a href="${post.url}" class="search-item" data-index="${index}">
                        <span>${post.category}</span><h4>${post.title}</h4>
                    </a>`).join('');
            } else { 
                searchResults.innerHTML = `<div style="padding:20px; text-align:center; color:#666;"><i class="fa-solid fa-ghost"></i> No intels found.</div>`; 
            }
        });
    }

    // --- 7. IMAGE LIGHTBOX ---
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
                    if (parentFigcaption) captionText.innerHTML = parentFigcaption.innerHTML;
                    else if (nextFigcaption && nextFigcaption.tagName === 'FIGCAPTION') captionText.innerHTML = nextFigcaption.innerHTML;
                    else captionText.innerHTML = '';
                }
            });
        });
    }

    function closeImageModal() { if (imageModal) imageModal.classList.add('hidden'); }
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeImageModal);
    if (imageModal) imageModal.addEventListener('click', (e) => { if (e.target === imageModal || e.target === modalImg) closeImageModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && imageModal && !imageModal.classList.contains('hidden')) closeImageModal(); });

    console.log("%c ngr3p %c system: online %c", "background:#00FF88; color:#000; font-weight:bold; border-radius:3px 0 0 3px; padding:2px 5px;", "background:#1a1a1a; color:#00FF88; font-weight:bold; border-radius:0 3px 3px 0; padding:2px 5px;", "background:transparent");
});