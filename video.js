document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('ideaVideo');
    const playPauseBtn = document.getElementById('playPauseBtn');

    // Check if the custom button exists
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (video.paused || video.ended) {
                video.play();
                playPauseBtn.textContent = 'Pause';
            } else {
                video.pause();
                playPauseBtn.textContent = 'Play';
            }
        });

        // Update button text based on video state
        video.addEventListener('play', () => {
            playPauseBtn.textContent = 'Pause';
        });

        video.addEventListener('pause', () => {
            playPauseBtn.textContent = 'Play';
        });
    }
});
