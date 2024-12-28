let currentSong = document.querySelector('.songslist');
let songNameDisplay = document.getElementById('songName');
let currentTimeDisplay = document.getElementById('currentTime');
let durationDisplay = document.getElementById('duration');
let progressBar = document.getElementById('progressbar');
let playPauseIcon = document.getElementById('playPause');

// This array simulates song data (name, duration, etc.)
const songs = [
    { name: "Wkkb", duration: "04:29" },
    { name: "Mahishmathi.. Brace Yourself", duration: "02:28" },
    { name: "Stoned Heart", duration: "01:02" },
    { name: "The Saviour", duration: "01:14" },
    { name: "My Faith My Mentor", duration: "06:32" },
    { name: "Undying Glory", duration: "02:55" },
    { name: "War And Passion", duration: "01:05" },
];

let audio = new Audio();
let currentIndex = 0;
let isPlaying = false;
let pausedTime = 0; // Stores the timestamp where the song was paused

// Update the song info (name and duration)
function updateSongInfo(song) {
    songNameDisplay.textContent = 'Now Playing: ' + song.name;
    durationDisplay.textContent = song.duration;
}

// Play or pause the song
function togglePlayPause() {
    if (isPlaying) {
        pausedTime = audio.currentTime; // Save the current time
        audio.pause();
        playPauseIcon.classList.remove('fa-pause');
        playPauseIcon.classList.add('fa-play');
        updateSongListIcon(currentIndex, 'fa-play'); // Reset current song icon
    } else {
        if (audio.src !== `${songs[currentIndex].name}.mp3`) {
            audio.src = `${songs[currentIndex].name}.mp3`; // Set the song source
        }
        audio.currentTime = pausedTime; // Resume from the paused time
        audio.play();
        playPauseIcon.classList.remove('fa-play');
        playPauseIcon.classList.add('fa-pause');
        updateSongListIcon(currentIndex, 'fa-pause'); // Update the current song icon
        updateSongInfo(songs[currentIndex]);
    }
    isPlaying = !isPlaying;
}

// Update the progress bar
function updateProgressBar() {
    if (audio.duration) {
        let progress = (audio.currentTime / audio.duration) * 100;
        progressBar.value = progress;

        // Change the color of the progress bar's completed portion to red
        progressBar.style.background = `linear-gradient(to right, red ${progress}%, #ddd ${progress}%)`;

        let currentTime = formatTime(audio.currentTime);
        currentTimeDisplay.textContent = currentTime;
    }
}

// Format time from seconds to MM:SS format
function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' + secs : secs}`;
}

// Update play/pause icon for the song list
function updateSongListIcon(index, iconClass) {
    const songElements = document.querySelectorAll('.songslist');
    const iconElement = songElements[index].querySelector('.iconsp i');
    iconElement.classList.remove('fa-play', 'fa-pause');
    iconElement.classList.add(iconClass);
}

// Event listener for progress bar change
progressBar.addEventListener('input', function () {
    let seekTime = (audio.duration / 100) * progressBar.value;
    audio.currentTime = seekTime;
});

// Event listener for song ended
audio.addEventListener('ended', function () {
    updateSongListIcon(currentIndex, 'fa-play'); // Reset current song icon
    if (currentIndex < songs.length - 1) {
        currentIndex++;
    } else {
        currentIndex = 0;
    }
    audio.src = `${songs[currentIndex].name}.mp3`; // Set the next song source
    pausedTime = 0; // Reset paused time for new song
    togglePlayPause(); // Play the next song
});

// Event listener for play/pause button click
playPauseIcon.addEventListener('click', togglePlayPause);

// Update the initial song info
updateSongInfo(songs[currentIndex]);

// Event listener for each song click to change the song
document.querySelectorAll('.songslist').forEach((songElement, index) => {
    songElement.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            updateSongListIcon(currentIndex, 'fa-play'); // Reset previous song icon
        }

        currentIndex = index;
        audio.src = `${songs[currentIndex].name}.mp3`; // Use the song name with .mp3 extension
        pausedTime = 0; // Reset paused time for new song
        isPlaying = false; // Reset play state to ensure playback starts
        togglePlayPause(); // Play the clicked song
    });
});

// Next song functionality
document.querySelector('.fa-step-forward').addEventListener('click', function () {
    updateSongListIcon(currentIndex, 'fa-play'); // Reset the previous song icon
    if (currentIndex < songs.length - 1) {
        currentIndex++;
    } else {
        currentIndex = 0;
    }
    audio.src = `${songs[currentIndex].name}.mp3`; // Set the next song source
    pausedTime = 0; // Reset paused time for new song
    isPlaying = false; // Reset play state to ensure playback starts
    togglePlayPause(); // Play the next song
});

// Previous song functionality
document.querySelector('.fa-step-backward').addEventListener('click', function () {
    updateSongListIcon(currentIndex, 'fa-play'); // Reset the previous song icon
    if (currentIndex > 0) {
        currentIndex--;
    } else {
        currentIndex = songs.length - 1;
    }
    audio.src = `${songs[currentIndex].name}.mp3`; // Set the previous song source
    pausedTime = 0; // Reset paused time for new song
    isPlaying = false; // Reset play state to ensure playback starts
    togglePlayPause(); // Play the previous song
});

// Update progress bar while playing
setInterval(() => {
    if (isPlaying) {
        updateProgressBar();
    }
}, 100); // Update every 100ms for smooth progress updates
