document.addEventListener('contextmenu', function (e) {
    if (e.target.tagName === 'VIDEO') {
        e.preventDefault();
    }
});

document.getElementById('video').addEventListener('touchstart', function (e) {
    e.preventDefault();
});

document.getElementById('video').addEventListener('mousedown', function (e) {
    e.preventDefault();
});

const video = document.getElementById('video');
const loading = document.getElementById('loading');

video.addEventListener('canplaythrough', () => {
    loading.style.display = 'none';
    video.style.display = 'block';
});
