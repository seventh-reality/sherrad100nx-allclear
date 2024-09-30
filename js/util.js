var audio = document.getElementById('audioPlayer');

// Define the function
export function playAudio(audioFile) {
    // Stop current audio if playing
    if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0; // Reset time to start
    }

    // Set the new audio source and play
    audio.src = audioFile;
    audio.play().catch(function (error) {
        console.log('Playback prevented:', error);
    });
}