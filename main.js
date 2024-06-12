const SPOTIFY_CLIENT_ID = "f91ab29b8be54da58de9a9f856228ae9";
const SPOTIFY_CLIENT_SECRET = "5fa03355aaf84741a6b2f8f25b1a8aed";
const PLAYLIST_ID = "37i9dQZF1DZ06evO05n2Xm";

const container = document.querySelector('div[data-js="tracks"]');
const activeTrackName = document.querySelector('.active-track__track-name');
const activeArtistName = document.querySelector('.active-track__track-details--artist-name');
const activeAlbumName = document.querySelector('.active-track__track-details--album-name');
const activeTrackImage = document.querySelector('.active-track__image--source');
const playlistName = document.querySelector('.playlist-details__name');
const playlistFollower = document.querySelector('.playlist-details__follower');
let audio = new Audio(); // Create an audio element for track previews
let currentTrackItem = null; // To store the currently playing track item

function fetchPlaylist(token, playlistId) {
  console.log("token: ", token);

  fetch(`https://api.spotify.com/v1/playlists/${PLAYLIST_ID}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      if (data.name && data.followers) {
        updatePlaylistDetails(data.name, data.followers.total);
      }

      if (data.tracks && data.tracks.items) {
        addTracksToPage(data.tracks.items);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function addTracksToPage(tracks) {
  tracks.forEach((item, index) => {
    const track = item.track;

    const trackItem = document.createElement('div');
    trackItem.classList.add('track-list__item');

    const playIcon = document.createElement('i');
    playIcon.classList.add('ri-play-fill', 'track-list__play-icon');

    const trackContent = document.createElement('div');
    trackContent.classList.add('track-list__item--content');

    const trackName = document.createElement('h6');
    trackName.classList.add('content__track-name');
    trackName.textContent = track.name;

    const trackDetails = document.createElement('div');
    trackDetails.classList.add('content__track-details');

    const artistName = document.createElement('span');
    artistName.classList.add('content__track-details--artist-name');
    artistName.textContent = track.artists.map(artist => artist.name).join(', ');

    const albumName = document.createElement('span');
    albumName.classList.add('content__track-details--album-name');
    albumName.textContent = track.album.name;

    trackDetails.appendChild(artistName);
    trackDetails.appendChild(albumName);

    trackContent.appendChild(trackName);
    trackContent.appendChild(trackDetails);

    const trackDurationInteractions = document.createElement('div');
    trackDurationInteractions.classList.add('track-list__item--duration-interactions');

    const duration = document.createElement('span');
    duration.classList.add('duration-interactions__duration');
    duration.textContent = formatDuration(track.duration_ms);

    trackDurationInteractions.appendChild(duration);
    trackDurationInteractions.appendChild(playIcon);

    trackItem.appendChild(trackContent);
    trackItem.appendChild(trackDurationInteractions);

    trackItem.addEventListener('click', () => togglePlayPause(track, trackItem));

    container.appendChild(trackItem);

    // Set the first track as active initially
    if (index === 0) {
      updateActiveTrack(track, trackItem);
    }
  });
}

function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// function updateActiveTrack(track, trackItem) {
//   activeTrackName.textContent = track.name;
//   activeArtistName.textContent = track.artists.map(artist => artist.name).join(', ');
//   activeAlbumName.textContent = track.album.name;
//   activeTrackImage.src = track.album.images[0]?.url || './assets/img/profilepicture.jpg';

//   document.querySelectorAll('.track-list__item').forEach(item => {
//     item.classList.remove('active');
//   });
//   trackItem.classList.add('active');
// }

// function togglePlayPause(track, trackItem) {
//   if (currentTrackItem === trackItem) {
//     if (audio.paused) {
//       audio.play();
//       trackItem.classList.add('active');
//     } else {
//       audio.pause();
//       trackItem.classList.remove('active');
//     }
//   } else {
//     updateActiveTrack(track, trackItem);
//     audio.src = track.preview_url;
//     audio.play();
//     currentTrackItem = trackItem;
//   }
// }

const progressBarIndicator = document.querySelector('.progress-bar__indicator');
let progressInterval;

function updateProgressBar() {
  const duration = audio.duration;
  const currentTime = audio.currentTime;
  const progressPercentage = (currentTime / duration) * 100;
  progressBarIndicator.style.width = `${progressPercentage}%`;
}

function startProgressBar() {
  clearInterval(progressInterval);
  progressInterval = setInterval(updateProgressBar, 1);
}

function resetProgressBar() {
  clearInterval(progressInterval);
  progressBarIndicator.style.width = '0%';
}

function togglePlayPause(track, trackItem) {
  if (currentTrackItem === trackItem) {
    if (audio.paused) {
      audio.play();
      startProgressBar();
      trackItem.classList.add('active');
    } else {
      audio.pause();
      clearInterval(progressInterval);
      trackItem.classList.remove('active');
    }
  } else {
    updateActiveTrack(track, trackItem);
    audio.src = track.preview_url;
    audio.play();
    resetProgressBar();
    startProgressBar();
    currentTrackItem = trackItem;
  }
}

function updateActiveTrack(track, trackItem) {
  activeTrackName.textContent = track.name;
  activeArtistName.textContent = track.artists.map(artist => artist.name).join(', ');
  activeAlbumName.textContent = track.album.name;
  activeTrackImage.src = track.album.images[0]?.url || './assets/img/profilepicture.jpg';

  document.querySelectorAll('.track-list__item').forEach(item => {
    item.classList.remove('active');
  });
  trackItem.classList.add('active');
  resetProgressBar(); // Reset the progress bar for the new track
}

audio.addEventListener('ended', resetProgressBar); // Reset when the track ends
audio.addEventListener('pause', () => clearInterval(progressInterval)); // Stop updating progress on pause
audio.addEventListener('play', startProgressBar); // Start updating progress on play


function updatePlaylistDetails(name, followers) {
  playlistName.textContent = name;
  playlistFollower.textContent = `${followers} followers`;
}

function fetchAccessToken() {
  fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=client_credentials&client_id=${SPOTIFY_CLIENT_ID}&client_secret=${SPOTIFY_CLIENT_SECRET}`,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.access_token) {
        fetchPlaylist(data.access_token, PLAYLIST_ID);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

fetchAccessToken();
