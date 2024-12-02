// Bloqueia clique direito para evitar menu de contexto
document.addEventListener('contextmenu', function (e) {
    if (e.target.tagName === 'VIDEO') {
        e.preventDefault();
    }
});

// Impede interação com o vídeo (toques ou cliques)
document.getElementById('video').addEventListener('touchstart', function (e) {
    e.preventDefault();
});

document.getElementById('video').addEventListener('mousedown', function (e) {
    e.preventDefault();
});

// Espera o vídeo carregar antes de exibir
const video = document.getElementById('video');
const loading = document.getElementById('loading');

video.addEventListener('canplaythrough', () => {
    loading.style.display = 'none'; // Oculta o loader
    video.style.display = 'block'; // Exibe o vídeo
});