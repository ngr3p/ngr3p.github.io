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
            initReveal();    
            initSmartGrid(); 
            checkHashPosition(); 
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

    // --- 4. SMART GRID LOGIC ---
    const loadMoreBtn = document.getElementById('load-more-btn');
    const gridContainer = document.querySelector('.posts-grid');
    let allGridItems = Array.from(document.querySelectorAll('.js-control'));
    let displayedCount = 0;

    function getGridColumns() {
        if (!gridContainer) return 1;
        const style = window.getComputedStyle(gridContainer);
        const template = style.getPropertyValue('grid-template-columns');
        return template.split(' ').length || 1;
    }

    function getBatchSize() {
        const cols = getGridColumns();
        return (cols === 1) ? 6 : (cols * 2);
    }

    function showNextBatch() {
        const batchSize = getBatchSize();
        const total = allGridItems.length;
        let nextLimit = displayedCount + batchSize;
        if (nextLimit > total) nextLimit = total;

        for (let i = displayedCount; i < nextLimit; i++) {
            if (allGridItems[i]) {
                allGridItems[i].classList.remove('hidden');
                allGridItems[i].style.opacity = '0';
                allGridItems[i].style.transform = 'translateY(20px)';
                allGridItems[i].style.transition = 'all 0.6s ease-out';
                setTimeout(() => {
                    allGridItems[i].style.opacity = '1';
                    allGridItems[i].style.transform = 'translateY(0)';
                }, (i - displayedCount) * 100);
            }
        }
        displayedCount = nextLimit;
        if (loadMoreBtn) {
            if (displayedCount >= total) loadMoreBtn.style.display = 'none';
            else loadMoreBtn.style.display = 'inline-block';
        }
    }

    function initSmartGrid() {
        if (allGridItems.length > 0) {
            showNextBatch();
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    showNextBatch();
                });
            }
        } else {
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        }
    }

    // --- 5. SEARCH MODULE ---
    const searchTrigger = document.getElementById('search-trigger');
    const searchOverlay = document.getElementById('search-overlay');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results-container');
    const closeSearchBtn = document.getElementById('close-search');
    
    const isSinglePost = document.body.classList.contains('single-post');
    const pathPrefix = isSinglePost ? '../' : './';

    let allPosts = []; 
    let selectedIndex = -1; 

    function normalizeText(text) {
        if (!text) return "";
        return text.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/g, " "); 
    }

    fetch(pathPrefix + 'assets/data/posts.json')
        .then(response => response.json())
        .then(data => { allPosts = data; })
        .catch(err => console.error("Search system offline:", err));

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
            const rawTerm = e.target.value;
            const searchTokens = normalizeText(rawTerm).split(' ').filter(token => token.length > 0);
            selectedIndex = -1; 
            if (searchTokens.length === 0) { searchResults.innerHTML = ''; return; }
            
            const filteredPosts = allPosts.filter(post => {
                const fullContent = normalizeText(`${post.title} ${post.category} ${post.short_desc} ${post.description} ${post.date}`);
                return searchTokens.every(token => fullContent.includes(token));
            });
            
            if (filteredPosts.length > 0) {
                searchResults.innerHTML = filteredPosts.map((post, index) => `
                    <a href="${pathPrefix}${post.url}" class="search-item" data-index="${index}">
                        <span>${post.category} | ${post.date}</span>
                        <h4>${post.title}</h4>
                        <p>${post.short_desc}</p>
                    </a>`).join('');
            } else { 
                searchResults.innerHTML = `<div style="padding:20px; text-align:center; color:#666;"><i class="fa-solid fa-ghost"></i> No intels found.</div>`; 
            }
        });
    }

    // --- 6. IMAGE LIGHTBOX ---
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

    // --- 7. SHARE SYSTEM ---
    function initShareSystem() {
        const currentUrl = encodeURIComponent(window.location.href);
        const pageTitle = encodeURIComponent(document.title);
        
        const btnX = document.getElementById('share-x');
        const btnTele = document.getElementById('share-telegram');
        const btnLinked = document.getElementById('share-linkedin');
        const btnCopy = document.getElementById('share-copy');
        const feedback = document.getElementById('copy-feedback');

        if(btnX) btnX.href = `https://twitter.com/intent/tweet?text=${pageTitle}&url=${currentUrl}`;
        if(btnTele) btnTele.href = `https://t.me/share/url?url=${currentUrl}&text=${pageTitle}`;
        if(btnLinked) btnLinked.href = `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`;

        if (btnCopy) {
            btnCopy.addEventListener('click', () => {
                navigator.clipboard.writeText(window.location.href).then(() => {
                    if (feedback) {
                        feedback.classList.remove('hidden');
                        setTimeout(() => feedback.classList.add('hidden'), 3000);
                    }
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                });
            });
        }
    }

    initShareSystem();

    // --- 8. HASH POSITION CHECK ---
    function checkHashPosition() {
        if (window.location.hash) {
            const targetElement = document.querySelector(window.location.hash);
            if (targetElement) {
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }

    // --- 9. HERO IMAGE RANDOMIZER (LÓGICA ANTI-COLISÃO) ---
    // Garante que a imagem nunca se repita duas vezes seguidas
    const heroBg = document.getElementById('hero-dynamic-bg');
    if (heroBg) {
        // 1. Recupera a última imagem usada da memória da sessão
        const lastIndex = sessionStorage.getItem('ngr3p_last_hero');
        let randomNum;

        // 2. Loop de verificação: Se o número sorteado for IGUAL ao anterior, sorteia de novo
        // Isso impede matematicamente que a mesma imagem apareça 2x seguidas
        do {
            randomNum = Math.floor(Math.random() * 10) + 1;
        } while (randomNum == lastIndex);

        // 3. Salva o novo número para a próxima verificação
        sessionStorage.setItem('ngr3p_last_hero', randomNum);

        const index = randomNum.toString().padStart(2, '0'); // ex: "03"
        
        // Pega o SRC atual que veio do HTML
        const currentSrc = heroBg.getAttribute('src');
        
        if (currentSrc) {
            // Substitui apenas o nome do arquivo (.jpg)
            const newSrc = currentSrc.replace(/hero_\d+\.jpg/, `hero_${index}.jpg`);
            heroBg.src = newSrc;
        }
    }

    console.log("%c ngr3p %c system: online %c", "background:#00FF88; color:#000; font-weight:bold; border-radius:3px 0 0 3px; padding:2px 5px;", "background:#1a1a1a; color:#00FF88; font-weight:bold; border-radius:0 3px 3px 0; padding:2px 5px;", "background:transparent");
});