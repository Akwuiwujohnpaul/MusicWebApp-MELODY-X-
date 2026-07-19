const global = {
  currentPage: window.location.pathname,
};

// Fetch Data from API
async function fetchAPIData(endpoint) {
  const PROXY_URL = "/.netlify/functions/deezer-proxy";

  try {
    const response = await fetch(
      `${PROXY_URL}?endpoint=${encodeURIComponent(endpoint)}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(`Failed fetching endpoint [${endpoint}]:`, error);
    return null;
  }
}

// Display trending music tracks
async function displayTrendingMusic() {
  const { tracks } = await fetchAPIData("chart");
  const trackList = tracks.data;
  const container = document.querySelector(".popular");

  trackList.forEach((music, index) => {
    const songData = {
      id: music.id,
      title: music.title_short,
      artist: music.artist.name,
      album: music.album.title,
      cover: music.album.cover_medium || "images/no-image.jpg",
      preview: music.preview,
    };

    const div = document.createElement("div");
    div.className = "songs";
    div.innerHTML = `
      <a href="nowPlaying.html?id=${music.id}" class="song-row-link">
        <div class="song-row">
          <span class="song-id">${index + 1}</span>
          <div class="song-main">
            <img class="song-cover" src="${music.album.cover_medium}" alt="${music.title_short}" />
            <span class="song-title">${music.title_short}</span>
          </div>
          <span class="song-artist">${music.artist.name}</span>
          <span class="song-album">${music.album.title}</span>
          <span class="song-duration">${music.duration}s</span>
          <i class="fa-regular fa-heart fav-icon"></i>
        </div>
      </a>
    `;

    const heartIcon = div.querySelector(".fav-icon");

    // check if already liked and reflect it on load
    const liked = getItemsFromStorage();
    const alreadyLiked = liked.some((s) => s.id === songData.id);
    if (alreadyLiked) {
      heartIcon.className = "fa-solid fa-heart fav-icon";
    }

    // now attach the click
    heartIcon.addEventListener("click", (e) => {
      e.preventDefault(); // prevent the <a> tag from firing
      let likedSongs = getItemsFromStorage();
      const isLiked = likedSongs.some((s) => s.id === songData.id);

      if (isLiked) {
        removeSongsFromStorage(songData.id);
        heartIcon.className = "fa-regular fa-heart fav-icon";
      } else {
        setSongsToStorage(songData);
        heartIcon.className = "fa-solid fa-heart fav-icon";
      }
    });

    container.appendChild(div);
  });
}

function displayLikedSongs() {
  const liked = getItemsFromStorage();
  const container = document.querySelector(".searchContent");

  if (liked.length === 0) {
    container.innerHTML = `<p>No liked songs yet.</p>`;
    return;
  }

  liked.forEach((track) => {
    const songCard = document.createElement("div");
    songCard.className = "songCard";
    const songData = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      cover: track.cover,
      preview: track.preview,
    };

    const playButton = document.createElement("button");
    playButton.className = "playBtn";
    playButton.innerHTML = `<i class="fa-solid fa-play"></i>`;

    const image = document.createElement("img");
    image.src = track.cover;

    const songInfo = document.createElement("div");
    songInfo.className = "songInfo";
    const songMeta = document.createElement("div");
    songMeta.className = "songMeta";
    const timeSpan = document.createElement("span");
    timeSpan.className = "time";
    timeSpan.textContent = "xxx";
    const h4 = document.createElement("h4");
    h4.textContent = track.title;
    const p = document.createElement("p");
    p.textContent = track.artist;
    const span = document.createElement("span");
    span.textContent = track.album;
    const songActions = document.createElement("div");
    songActions.className = "songActions";
    const heartIcon = document.createElement("i");
    heartIcon.className = "fa-solid fa-heart";
    const ellipsisIcon = document.createElement("i");
    ellipsisIcon.className = "fa-solid fa-ellipsis-vertical";
    songInfo.appendChild(h4);
    songInfo.appendChild(p);
    songInfo.appendChild(span);
    songMeta.appendChild(timeSpan);
    songActions.appendChild(heartIcon);
    songActions.appendChild(ellipsisIcon);

    // heart icon (to unlike from this page too)
    heartIcon.addEventListener("click", (e) => {
      e.preventDefault();
      let likedSongs = getItemsFromStorage();
      const isLiked = likedSongs.some((s) => s.id === songData.id);
      if (isLiked) {
        removeSongsFromStorage(track.id);
        songCard.remove();
      } else {
        setSongsToStorage(track);
        heartIcon.className = "fa-solid fa-heart fav-icon";
      }
    });
    songCard.appendChild(image);
    songCard.appendChild(playButton);
    songCard.appendChild(songInfo);
    songCard.appendChild(songMeta);
    songCard.appendChild(songActions);
    container.appendChild(songCard);
  });
}

// Display trending playlist tracks as sliders
async function displaySlider() {
  const { playlists } = await fetchAPIData("chart");
  const playlistList = playlists.data;
  const div2 = document.querySelector(".swiper-wrapper");
  const div3 = document.querySelector(".swiper");
  playlistList.forEach((playlist) => {
    const div = document.createElement("div");
    div.className = "swiper-slide";
    div.innerHTML = `      
                <img src=${playlist.picture_small} />
                <p>Album title - ${playlist.title}</p>
              `;
    div.addEventListener("click", () => {
      window.location.href = `playlist.html?id=${playlist.id}`;
    });
    div2.appendChild(div);
    div3.appendChild(div2);
  });
  initSwipper();
}

function initSwipper() {
  const swiper = new Swiper(".swiper", {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    freeMode: true,
    autoplay: {
      disableOnInteraction: false,
      delay: 5000,
    },
    breakpoints: {
      700: {
        slidesPerView: 1,
      },
      800: {
        slidesPerView: 2,
        spaceBetween: 10,
      },
      // when window width is >= 480px
      1000: {
        slidesPerView: 3,
        spaceBetween: 20,
      },
      // when window width is >= 640px
      1100: {
        slidesPerView: 4,
        spaceBetween: 30,
      },
    },
  });
}

// display playlist tracks on playlist.html
async function playlistTracks() {
  try {
    const playlistID = new URLSearchParams(window.location.search).get("id");
    const DEFAULT_PLAYLIST_ID = "1111142221";
    const actualPlaylistID = playlistID || DEFAULT_PLAYLIST_ID;
    const data = await fetchAPIData(`playlist/${actualPlaylistID}/tracks`);
    const dataPlaylist = await fetchAPIData(`playlist/${actualPlaylistID}`);

    const favouriteHeader = document.querySelector(".favouriteHeader");
    favouriteHeader.innerHTML = `
      <div class="image">
        <img src="${dataPlaylist.picture_small}" alt="${dataPlaylist.title}" />
      </div>
      <div class="playlistInfo">
        <p>Playlist</p>
        <h2>${dataPlaylist.title}</h2>
         <p><span>User</span>xxx </span></p>
      </div>`;

    const trackList = data.data;
    const playlistMusic = document.querySelector(".likedSongList");

    trackList.forEach((music, index) => {
      const songData = {
        id: music.id,
        title: music.title_short,
        artist: music.artist.name,
        album: music.album.title,
        cover: music.album.cover_medium || "images/no-image.jpg",
        preview: music.preview,
      };
      const a = document.createElement("a");
      a.href = `nowPlaying.html?id=${music.id}`;
      a.innerHTML = `
        <div class="likedSongTitle">
          <p>${index + 1}</p>
          <div class="song-main">
            <p>${music.artist.name}</p>
          </div>
          <p>${music.title_short}</p>
          <p>${music.album.title}</p>
          <p>xxxx</p>
          <i class="fa-regular fa-heart fav-icon"></i>
        </div>`;
      const heartIcon = a.querySelector(".fav-icon");
      const liked = getItemsFromStorage();
      const alreadyLiked = liked.some((s) => s.id === music.id);
      if (alreadyLiked) {
        heartIcon.className = "fa-solid fa-heart fav-icon";
      }

      heartIcon.addEventListener("click", (e) => {
        e.preventDefault();
        let likedSongs = getItemsFromStorage();
        const isLiked = likedSongs.some((s) => s.id === songData.id);
        if (isLiked) {
          removeSongsFromStorage(music.id);
          heartIcon.className = "fa-regular fa-heart fav-icon";
        } else {
          setSongsToStorage(music);
          heartIcon.className = "fa-solid fa-heart fav-icon";
        }
      });

      playlistMusic.appendChild(a);
    });
  } catch (error) {
    console.error("Failed to load playlist:", error);
  }
}

// Play music on nowPlaying.html
async function playMusic() {
  try {
    const musicID = new URLSearchParams(window.location.search).get("id");
    if (!musicID) {
      console.error("No music ID provided in the URL.");
      return;
    }
    const data = await fetchAPIData(`track/${musicID}`);
    const div = document.querySelector(".nowPlayingContainer");
    const div2 = document.createElement("div");
    div2.className = "nowPlayingMiddle";
    const imgSrc = data.album.cover_medium || "images/noImage.jpg";
    const contributors = data.contributors
      .map((contributor) => contributor.name)
      .join(", ");
    div2.innerHTML = `<div class="imagePlaylist">
          <img src=${imgSrc} alt="" />
        </div>

        <div class="spotify-grid">
          <div class="artist-card">
            <img
              src=${data.artist.picture_medium}
              alt=${data.artist.name}
              class="artist-bg-img"
            />
            <div class="artist-card-content">
              <h3 class="card-title">${data.title_short}</h3>
              <div class="artist-details">
                <h2 class="artist-name">${data.artist.name}</h2>
                <p class="listeners-count">${data.artist.nb_fan}</p>
                <button class="follow-btn">Follow</button>
              </div>
            </div>
          </div>

          <div class="grid-sidebar">
            <div class="sidebar-box credits-box">
              <div class="box-header">
                <h3>Credits</h3>
                <a href="#" class="show-all">Show all</a>
              </div>
              <div class="credit-item">
                <div class="credit-text">
                  <h4>${data.artist.name}</h4>
                  <p>${contributors}</p>
                </div>
                <button class="pill-btn">Follow</button>
              </div>
              <div class="credit-item">
                <div class="credit-text">
                  <h4>${data.artist.name}</h4>
                  <p>${contributors}</p>
                </div>
                <i
                  class="fa-solid fa-arrow-up-right-from-square share-icon"
                ></i>
              </div>
            </div>

            <div class="sidebar-box merch-box">
              <h3>xxx</h3>
              <div class="merch-item">
                    <img src="${data.album.cover_small}" alt="${data.album.title}" />
                <p>xxx</p>
              </div>
              <div class="merch-item">
                    <img src="${data.album.cover_small}" alt="${data.album.title}" />
                <p>xxx</p>
              </div>
            </div>
          </div>
        </div>`;

    div.appendChild(div2);
    document.querySelector(".nowPlayingBody").appendChild(div);
  } catch (error) {
    console.log("failed to load track, error:", error);
  }
}

// Search API data
async function searchAPIData() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const searchTerm = urlParams.get("search-term");
  console.log("searchTerm:", searchTerm);

  if (!searchTerm) {
    document.querySelector(".results").innerHTML =
      `<p class="no-search-msg">Enter a song or artist name to search.</p>`;
    return;
  }

  const { data } = await fetchAPIData(`search?q=${searchTerm}`);

  if (!data) {
    console.log("No search results found.");
    return;
  }
  displaySearchResult(data);
}
//Display search result
async function displaySearchResult(data) {
  const searchResult = document.querySelector(".results");
  const searchAudio = document.querySelector(".searchAudio");
  let activeButton = null;
  data.forEach((search) => {
    const songCard = document.createElement("div");
    songCard.className = "songCard";
    const image = document.createElement("img");
    if (search.album.cover_medium) {
      image.src = search.album.cover_medium;
    } else {
      image.src = "images/no-image.jpg";
    }
    const songInfo = document.createElement("div");
    songInfo.className = "songInfo";
    const h4 = document.createElement("h4");
    h4.textContent = search.title_short;
    const p = document.createElement("p");
    p.textContent = search.artist.name;
    const span = document.createElement("span");
    span.textContent = search.album.title;
    songInfo.appendChild(h4);
    songInfo.appendChild(p);
    songInfo.appendChild(span);

    const button = document.createElement("button");
    button.className = "playBtn";
    button.type = "button";
    button.innerHTML = `<i class="fa-solid fa-play"></i>`;

    const songMeta = document.createElement("div");
    songMeta.className = "songMeta";
    const timeSpan = document.createElement("span");
    timeSpan.className = "xxx";
    timeSpan.textContent = "xxx";
    const genreSpan = document.createElement("span");
    genreSpan.textContent = "Pop";
    songMeta.appendChild(timeSpan);
    songMeta.appendChild(genreSpan);

    const songActions = document.createElement("div");
    songActions.className = "songActions";
    const heartIcon = document.createElement("i");
    heartIcon.className = "fa-regular fa-heart";

    button.addEventListener("click", async (e) => {
      e.stopPropagation();
      e.preventDefault();

      if (activeButton && activeButton !== button) {
        activeButton.innerHTML = `<i class="fa-solid fa-play"></i>`;
        searchAudio.pause();
        searchAudio.currentTime = 0;
      }

      if (button.innerHTML.includes("fa-play")) {
        const freshData = await fetchAPIData(`track/${search.id}`);
        if (!freshData || !freshData.preview) {
          return;
        }
        searchAudio.src = freshData.preview;
        searchAudio.load();
        searchAudio.play();
        button.innerHTML = `<i class="fa-solid fa-pause"></i>`;
        activeButton = button;
      } else if (button.innerHTML.includes("fa-pause")) {
        searchAudio.pause();
        button.innerHTML = `<i class="fa-solid fa-play"></i>`;
        activeButton = null;
      }
    });

    // card click navigates to nowPlaying
    songCard.addEventListener("click", () => {
      window.location.href = `nowPlaying.html?id=${search.id}`;
    });

    const liked = getItemsFromStorage();
    const alreadyLiked = liked.some((s) => s.id === search.id);
    if (alreadyLiked) {
      heartIcon.className = "fa-solid fa-heart fav-icon";
    }

    heartIcon.addEventListener("click", (e) => {
      e.preventDefault();
      let likedSongs = getItemsFromStorage();
      const isLiked = likedSongs.some((s) => s.id === search.id);
      if (isLiked) {
        removeSongsFromStorage(search.id);
        heartIcon.className = "fa-regular fa-heart fav-icon";
      } else {
        setSongsToStorage(search);
        heartIcon.className = "fa-solid fa-heart fav-icon";
      }
    });

    const ellipsisIcon = document.createElement("i");
    ellipsisIcon.className = "fa-solid fa-ellipsis-vertical";
    songActions.appendChild(heartIcon);
    songActions.appendChild(ellipsisIcon);

    const link = document.createElement("a");
    link.className = "searchLink";
    link.href = `nowPlaying.html?id=${search.id}`;
    link.style.cursor = "pointer";

    songCard.appendChild(image);
    songCard.appendChild(songInfo);
    songCard.appendChild(button);
    songCard.appendChild(songMeta);
    songCard.appendChild(songActions);
    link.appendChild(songCard);
    searchResult.appendChild(link);
  });
}

async function playPreview() {
  const audio = document.querySelector(".audio");
  const urlParams = new URLSearchParams(window.location.search);
  const trackId = urlParams.get("id");
  const data = await fetchAPIData(`track/${trackId}`);

  audio.src = data.preview;

  const play = document.querySelector(".fa-play");
  const pause = document.querySelector(".fa-pause");
  const control = document.querySelector(".progressBar");

  play.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      play.classList.remove("fa-play");
      play.classList.add("fa-pause");
    } else {
      audio.pause();
      play.classList.remove("fa-pause");
      play.classList.add("fa-play");
    }
  });

  audio.addEventListener("timeupdate", () => {
    control.value = (audio.currentTime / audio.duration) * 100 || 0;
  });

  control.addEventListener("input", () => {
    if (!isNaN(audio.duration)) {
      audio.currentTime = (control.value / 100) * audio.duration;
    }
  });
}

const search = document.querySelector(".nowPlayingInput");
if (search) {
  search.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const searchTerm = search.value.trim();
      if (searchTerm) {
        window.location.href = `search.html?search-term=${encodeURIComponent(searchTerm)}`;
      }
    }
  });
}

// Add New Playlist
const showBody = document.querySelector(".showBody");

// open popup
function openPopup() {
  showBody.classList.add("active");
}

// close popup
function closePopup() {
  showBody.classList.remove("active");
}

const newPlaylistButton = document.querySelector(".newPlaylistButton");
if (newPlaylistButton) {
  newPlaylistButton.addEventListener("click", openPopup);
}

const cancelButton = document.querySelector(".cancel");
if (cancelButton) {
  cancelButton.addEventListener("click", closePopup);
}

const createButton = document.querySelector(".create");
if (createButton) {
  createButton.addEventListener("click", () => {
    const playlistName = document.querySelector(".showBodyInput").value.trim();
    if (playlistName) {
      setPlaylistsToStorage({ name: playlistName, tracks: [] });
      displayAddedPlaylists();
      closePopup();
    }
  });
}

function displayAddedPlaylists() {
  const playlist = document.querySelector(".playLists");
  const playListInput = document.querySelector(".playListInput");
  playListInput.innerHTML = ""; // clear before re-rendering

  const playlists = getPlaylistsFromStorage();

  if (playlists.length === 0) return;

  playlists.forEach((item) => {
    const playlistLink = document.createElement("a");
    const options = document.createElement("div");
    const icon = document.createElement("i");
    const icon2 = document.createElement("i");
    const p = document.createElement("p");
    const left = document.createElement("div");
    left.className = "leftControl";
    const right = document.createElement("div");
    right.className = "rightControl";

    left.style.display = "flex";
    left.style.alignItems = "center";
    left.style.gap = "0.5rem";
    right.style.display = "flex";
    right.style.alignItems = "center";
    options.style.display = "flex";
    options.style.justifyContent = "space-between";

    options.className = "options";
    icon.className = "fa-brands fa-itunes-note";
    icon2.className = "fa-solid fa-x";
    playlistLink.href = "#";
    options.style.border = "1px solid #8b5cf6";
    options.style.marginBottom = "0.5rem";
    p.textContent = item.name;
    playlistLink.className = "playlist-link";

    icon2.addEventListener("click", (e) => {
      e.preventDefault();
      removePlaylistsFromStorage(item.name);
      displayAddedPlaylists();
    });

    left.appendChild(icon);
    left.appendChild(p);
    right.appendChild(icon2);
    options.appendChild(left);
    options.appendChild(right);
    options.style.display = "flex";
    playlistLink.appendChild(options);
    playListInput.appendChild(playlistLink);
    playlist.appendChild(playListInput);
  });
}

// Add playlists to localStorage
function getPlaylistsFromStorage() {
  let playlistsFromStorage;

  if (localStorage.getItem("playlists") === null) {
    playlistsFromStorage = [];
  } else {
    playlistsFromStorage = JSON.parse(localStorage.getItem("playlists"));
  }
  return playlistsFromStorage;
}

// set playlist to storage
function setPlaylistsToStorage(item) {
  let playlistsFromStorage = getPlaylistsFromStorage();

  playlistsFromStorage.push(item);

  localStorage.setItem("playlists", JSON.stringify(playlistsFromStorage));
}

// Remove playlist from storage
function removePlaylistsFromStorage(name) {
  let playlistsFromStorage = getPlaylistsFromStorage();

  playlistsFromStorage = playlistsFromStorage.filter((i) => i.name !== name);

  localStorage.setItem("playlists", JSON.stringify(playlistsFromStorage));
}

// Add Liked Songs to localStorage
function getItemsFromStorage() {
  let songsFromStorage;

  if (localStorage.getItem("likedSongs") === null) {
    songsFromStorage = [];
  } else {
    songsFromStorage = JSON.parse(localStorage.getItem("likedSongs"));
  }
  return songsFromStorage;
}

function setSongsToStorage(item) {
  let songsFromStorage = getItemsFromStorage();

  songsFromStorage.push(item);

  localStorage.setItem("likedSongs", JSON.stringify(songsFromStorage));
}

function removeSongsFromStorage(id) {
  let songsFromStorage = getItemsFromStorage();

  songsFromStorage = songsFromStorage.filter((i) => i.id !== id);

  localStorage.setItem("likedSongs", JSON.stringify(songsFromStorage));
}

//Hide and remove spinner
function showSpinner() {
  document.querySelector(".spinner").classList.add("loading");
}

function hideSpinner() {
  document.querySelector(".spinner").classList.remove("loading");
}

// Init App
async function init() {
  const page = global.currentPage.toLowerCase();

  if (page === "/index.html" || page === "/") {
    showSpinner();
    await Promise.all([
      displayTrendingMusic(),
      displaySlider(),
      displayAddedPlaylists(),
    ]);
    hideSpinner();
  } else if (page.includes("playlist")) {
    showSpinner();
    await Promise.all([playlistTracks(), displayAddedPlaylists()]);
    hideSpinner();
  } else if (page.includes("search")) {
    showSpinner();
    await searchAPIData();
    hideSpinner();
  } else if (page.includes("likedsongs")) {
    showSpinner();
    await displayLikedSongs();
    hideSpinner();
  } else if (page.includes("nowplaying")) {
    showSpinner();
    await Promise.all([playMusic(), playPreview()]);
    hideSpinner();
  }
  highlightActiveLink();
}

// Highlight active link
function highlightActiveLink() {
  const home = document.querySelector(".homePage");
  const playlist = document.querySelector(".playlistPage");
  const likedSongs = document.querySelector(".likedSongsPage");
  const search = document.querySelector(".searchPage");

  const page = global.currentPage.toLowerCase();

  if (page === "/index.html" || page === "/") {
    home.style.background = "#8b5cf6";
    home.style.borderRadius = "0.4rem";
  } else if (page.includes("playlist")) {
    playlist.style.background = "#8b5cf6";
    playlist.style.borderRadius = "0.4rem";
  } else if (page.includes("likedsongs")) {
    likedSongs.style.background = "#8b5cf6";
    likedSongs.style.borderRadius = "0.4rem";
  } else if (page.currentPage === "/search.html") {
    search.style.background = "#8b5cf6";
    search.style.borderRadius = "0.4rem";
  }
}

init();
