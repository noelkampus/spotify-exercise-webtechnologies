const SPOTIFY_CLIENT_ID = "67b411e20d594f30bf7a8d3bbde54285";
const SPOTIFY_CLIENT_SECRET = "161fc5e3df004b95af3ba8c62f3eaf54";

// Initial playlist ID
let PLAYLIST_ID = "37i9dQZF1DZ06evO05n2Xm";

const container = document.querySelector('div[data-js="tracks"]');
const activeTrackName = document.querySelector('.active-track__track-name');
const activeArtistName = document.querySelector('.active-track__track-details--artist-name');
const activeAlbumName = document.querySelector('.active-track__track-details--album-name');
const activeTrackImage = document.querySelector('.active-track__image--source');
const activeTrackReleaseDate = document.querySelector('.active-track__release-date');
const activeTrackPopularity = document.querySelector('.active-track__popularity');
const activeTrackAvailableMarkets = document.querySelector('.active-track__available-markets');

const playlistName = document.querySelector('.playlist-details__name');
const playlistFollower = document.querySelector('.playlist-details__follower');
const followButton = document.querySelector('.playlist-details__follow-button');
const playlistInput = document.getElementById('playlist-input');

let audio = new Audio(); 
let currentTrackItem = null;

const inputField = document.querySelector('.nav-switch__input-link');

inputField.addEventListener('paste', (event) => {
  setTimeout(() => {
    const pasteText = event.target.value;
    const newPlaylistId = extractPlaylistIdFromUrl(pasteText);
    if (newPlaylistId) {
      PLAYLIST_ID = newPlaylistId;
      fetchAccessToken(); 
    }
  }, 100);
});

function extractPlaylistIdFromUrl(url) {
  const match = url.match(/playlist\/([a-zA-Z0-9]+)\b/);
  return match ? match[1] : null;
}

function fetchPlaylist(token, playlistId) {
  console.log("token: ", token);

  fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      if (data.name && data.followers) {
        updatePlaylistDetails(data.name, data.followers.total, playlistId);
      }

      if (data.tracks && data.tracks.items) {
        container.innerHTML = '';
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

    const pauseIcon = document.createElement('i');
    pauseIcon.classList.add('ri-pause-fill', 'track-list__pause-icon');
    pauseIcon.style.display = 'none';

    const trackContent = document.createElement('div');
    trackContent.classList.add('track-list__item--content');

    const trackName = document.createElement('h6');
    trackName.classList.add('content__track-name');
    trackName.textContent = track.name;

    const trackDetails = document.createElement('div');
    trackDetails.classList.add('content__track-details');

    const artistName = document.createElement('span');
    artistName.classList.add('content__track-details--artist-name');

    // links for each artist
    track.artists.forEach((artist, i) => {
      const artistLink = document.createElement('a');
      artistLink.href = `https://open.spotify.com/artist/${artist.id}`;
      artistLink.target = "_blank";
      artistLink.textContent = artist.name;
      if (i > 0) artistName.append(', ');
      artistName.appendChild(artistLink);
    });

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
    trackDurationInteractions.appendChild(pauseIcon);

    trackItem.appendChild(trackContent);
    trackItem.appendChild(trackDurationInteractions);

    trackItem.addEventListener('click', () => togglePlayPause(track, trackItem, playIcon, pauseIcon));

    container.appendChild(trackItem);

    // set the first track as active initially
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
  progressInterval = setInterval(updateProgressBar, 100);
}

function resetProgressBar() {
  clearInterval(progressInterval);
  progressBarIndicator.style.width = '0%';
}

function togglePlayPause(track, trackItem, playIcon, pauseIcon) { // presentation -> no idea what the problem is with the play icon --> next steps Gsap transitions and lottie animations
  if (currentTrackItem === trackItem) {
    if (audio.paused) {
      audio.play();
      startProgressBar();
      trackItem.classList.add('active');
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'inline';
    } else {
      audio.pause();
      clearInterval(progressInterval);
      trackItem.classList.remove('active');
      playIcon.style.display = 'inline';
      pauseIcon.style.display = 'none';
    }
  } else {
    if (currentTrackItem) {
      const previousPlayIcon = currentTrackItem.querySelector('.track-list__play-icon');
      const previousPauseIcon = currentTrackItem.querySelector('.track-list__pause-icon');
      previousPlayIcon.style.display = 'block';
      previousPauseIcon.style.display = 'none';
    }
    updateActiveTrack(track, trackItem);
    audio.src = track.preview_url;
    audio.play();
    resetProgressBar();
    startProgressBar();
    currentTrackItem = trackItem;
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
  }
}

function updateActiveTrack(track, trackItem) {
  activeTrackName.textContent = track.name;
  activeArtistName.textContent = track.artists.map(artist => artist.name).join(', ');
  activeAlbumName.textContent = track.album.name;
  activeTrackImage.src = track.album.images[0]?.url || './assets/img/profilepicture.jpg';
  activeTrackPopularity.textContent = track.popularity;
  activeTrackAvailableMarkets.textContent = track.available_markets.length

  // format the release date
  const releaseDate = new Date(track.album.release_date);
  const day = String(releaseDate.getDate()).padStart(2, '0');
  const month = String(releaseDate.getMonth() + 1).padStart(2, '0');
  const year = releaseDate.getFullYear();
  activeTrackReleaseDate.textContent = `${day}.${month}.${year}`;

  document.querySelectorAll('.track-list__item').forEach(item => {
    item.classList.remove('active');
    const playIcon = item.querySelector('.track-list__play-icon');
    const pauseIcon = item.querySelector('.track-list__pause-icon');
    playIcon.style.display = 'inline';
    pauseIcon.style.display = 'none';
  });
  trackItem.classList.add('active');
  resetProgressBar();
}

audio.addEventListener('ended', resetProgressBar);
audio.addEventListener('pause', () => clearInterval(progressInterval));
audio.addEventListener('play', startProgressBar);

function updatePlaylistDetails(name, followers, playlistId) {
  playlistName.textContent = name;
  playlistFollower.textContent = `${followers} followers`;
  followButton.href = `https://open.spotify.com/playlist/${playlistId}`;
}

document.addEventListener("DOMContentLoaded", function() {
    const activeTrackElement = document.querySelector(".active-track");
    if (activeTrackElement) {
        activeTrackElement.addEventListener("click", shrinkActiveTrack);
    }

    function shrinkActiveTrack() {
        const activeTrack = document.querySelector(".active-track");
        const activeTrackImage = document.querySelector(".active-track__image");
        const progressBar = document.querySelector(".progress-bar");
        const additionalInfos = document.querySelector(".additional-informations");

        if (activeTrack.classList.contains('small')) {
            activeTrack.classList.remove('small');
            activeTrackImage.classList.remove('small');
            progressBar.classList.remove('small');
            additionalInfos.classList.remove('small');
        } else {
            activeTrack.classList.add('small');
            activeTrackImage.classList.add('small');
            progressBar.classList.add('small');
            additionalInfos.classList.add('small');
        }
    }
});


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
