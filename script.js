const fallbackPhotos = [
  "https://lh3.googleusercontent.com/pw/AP1GczOCcX5d2DetPyhPuys34DUSE6M9HCJPwIvV8T1iCzxIEO-BJw4yZhsO0H6y70loBNU9N-ceVGrtKEW21IVJvI8dh8rbYSRdxwDWRV5xhCxoZ4mNexE=w1800-h1200-no"
];

const tracks = [
  { title: "Centro de gravedad", meta: "Single demo · 3:42" },
  { title: "Luces de Barranco", meta: "Ensayo en vivo · 4:08" },
  { title: "Noches que prenden", meta: "Version acustica · 3:28" },
  { title: "Todo vuelve al ruido", meta: "Demo de sala · 3:57" }
];

const galleryGrid = document.querySelector("#galleryGrid");
const galleryStatus = document.querySelector("#galleryStatus");
const refreshGallery = document.querySelector("#refreshGallery");
const heroImage = document.querySelector("#heroImage");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const closeLightbox = document.querySelector("#closeLightbox");

const trackNumber = document.querySelector("#trackNumber");
const trackTitle = document.querySelector("#trackTitle");
const trackMeta = document.querySelector("#trackMeta");
const trackList = document.querySelector("#trackList");
const toggleTrack = document.querySelector("#toggleTrack");
const prevTrack = document.querySelector("#prevTrack");
const nextTrack = document.querySelector("#nextTrack");
const progressBar = document.querySelector("#progressBar");

let currentTrack = 0;
let isPlaying = false;
let progressTimer;

function photoMarkup(photo, index) {
  return `
    <button class="gallery-item" type="button" data-full="${photo.src}" aria-label="Abrir foto ${index + 1}">
      <img src="${photo.thumb || photo.src}" alt="${photo.alt || "Foto de la banda"}" loading="lazy">
    </button>
  `;
}

function renderGallery(photos, updatedAt) {
  const galleryPhotos = photos.length
    ? photos
    : fallbackPhotos.map((src, index) => ({
        src,
        thumb: src,
        alt: `Juanma $ The Center People ${index + 1}`
      }));

  heroImage.src = galleryPhotos[0].src;
  galleryGrid.innerHTML = galleryPhotos.slice(0, 24).map(photoMarkup).join("");

  const dateText = updatedAt
    ? new Intl.DateTimeFormat("es-PE", {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(new Date(updatedAt))
    : "modo respaldo";

  galleryStatus.textContent = `${galleryPhotos.length} fotos sincronizadas · ${dateText}`;
}

async function loadGallery() {
  galleryStatus.textContent = "Sincronizando fotos...";
  refreshGallery.disabled = true;

  try {
    const response = await fetch(`/api/gallery?ts=${Date.now()}`);
    if (!response.ok) throw new Error("No se pudo leer la galeria");
    const data = await response.json();
    renderGallery(data.photos || [], data.updatedAt);
    if (data.error) {
      galleryStatus.textContent += " · usando cache";
    }
  } catch {
    renderGallery([], null);
    galleryStatus.textContent = "Galeria en modo respaldo. Inicia el servidor para sincronizar.";
  } finally {
    refreshGallery.disabled = false;
  }
}

function renderTracks() {
  trackList.innerHTML = tracks
    .map(
      (track, index) => `
        <li>
          <button type="button" class="${index === currentTrack ? "active" : ""}" data-track="${index}">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <strong>${track.title}</strong>
            <small>${track.meta.split("·")[1].trim()}</small>
          </button>
        </li>
      `
    )
    .join("");
}

function selectTrack(index) {
  currentTrack = (index + tracks.length) % tracks.length;
  const track = tracks[currentTrack];
  trackNumber.textContent = `Track ${String(currentTrack + 1).padStart(2, "0")}`;
  trackTitle.textContent = track.title;
  trackMeta.textContent = track.meta;
  progressBar.style.width = "12%";
  renderTracks();
}

function setPlaying(nextState) {
  isPlaying = nextState;
  toggleTrack.textContent = isPlaying ? "Pausa" : "Play";
  document.querySelectorAll("[data-play-index]").forEach((button) => {
    button.textContent = isPlaying ? "Pausa" : "Play";
  });

  clearInterval(progressTimer);
  if (isPlaying) {
    progressTimer = setInterval(() => {
      const current = Number.parseFloat(progressBar.style.width) || 12;
      progressBar.style.width = `${current >= 100 ? 12 : current + 3}%`;
    }, 700);
  }
}

galleryGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".gallery-item");
  if (!button) return;
  lightboxImage.src = button.dataset.full;
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
});

closeLightbox.addEventListener("click", () => {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox.click();
});

refreshGallery.addEventListener("click", loadGallery);

trackList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-track]");
  if (!button) return;
  selectTrack(Number(button.dataset.track));
  setPlaying(true);
});

toggleTrack.addEventListener("click", () => setPlaying(!isPlaying));
prevTrack.addEventListener("click", () => selectTrack(currentTrack - 1));
nextTrack.addEventListener("click", () => selectTrack(currentTrack + 1));

document.querySelectorAll("[data-play-index]").forEach((button) => {
  button.addEventListener("click", () => {
    selectTrack(Number(button.dataset.playIndex));
    setPlaying(!isPlaying);
  });
});

document.querySelector("#contactForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const subject = encodeURIComponent(`Contacto web - ${data.get("name")}`);
  const body = encodeURIComponent(
    `Nombre: ${data.get("name")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`
  );
  window.location.href = `mailto:booking@juanmarockpop.pe?subject=${subject}&body=${body}`;
});

document.querySelector("#subscribeForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const email = new FormData(event.currentTarget).get("email");
  const subscribers = JSON.parse(localStorage.getItem("centerPeopleSubscribers") || "[]");
  if (!subscribers.includes(email)) subscribers.push(email);
  localStorage.setItem("centerPeopleSubscribers", JSON.stringify(subscribers));
  document.querySelector("#subscribeMessage").textContent =
    "Listo. Te guardamos en esta demo local de suscripciones.";
  event.currentTarget.reset();
});

renderTracks();
selectTrack(0);
loadGallery();
