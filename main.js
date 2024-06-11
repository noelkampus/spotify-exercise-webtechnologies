const SPOTIFY_CLIENT_ID = "67b411e20d594f30bf7a8d3bbde54285";
const SPOTIFY_CLIENT_SECRET = "161fc5e3df004b95af3ba8c62f3eaf54";
const PLAYLIST_ID = "7fXKDSXrj7RljWC4QTixrd";
const container = document.querySelector('main[data-js="tracks"]');
const activeTrackName = document.querySelector('.active-track__track-name');
const activeArtistName = document.querySelector('.active-track__track-details--artist-name');
const activeAlbumName = document.querySelector('.active-track__track-details--album-name');
const activeTrackImage = document.querySelector('.active-track__image--source');

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

    const likeButton = document.createElement('div');
    likeButton.classList.add('duration-interactions__like-button');
    likeButton.innerHTML = '<i class="ri-heart-line ri-xl"></i>'; // HEART ICON

    trackDurationInteractions.appendChild(duration);
    trackDurationInteractions.appendChild(likeButton);

    trackItem.appendChild(trackContent);
    trackItem.appendChild(trackDurationInteractions);

    trackItem.addEventListener('click', () => updateActiveTrack(track, trackItem));

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

function updateActiveTrack(track, trackItem) {
  activeTrackName.textContent = track.name;
  activeArtistName.textContent = track.artists.map(artist => artist.name).join(', ');
  activeAlbumName.textContent = track.album.name;
  activeTrackImage.src = track.album.images[0]?.url || './assets/img/profilepicture.jpg';

  document.querySelectorAll('.track-list__item').forEach(item => {
    item.classList.remove('active');
  });
  trackItem.classList.add('active');
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
