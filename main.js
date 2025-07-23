let isPlaying = false;
const cursorOffsetX = 215;
let selectedTheme = "introduction";

const osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay("osmd-container", {
  backend: "svg",
  drawTitle: true,
});

const audio = document.getElementById("audio");
const container = document.getElementById("container");
const cursor = document.getElementById("cursor");
const rythmeContainer = document.getElementById("rythme-image-container"); // ← ajouté

const themeTexts = {
  introduction: "Introduction : La progressivité en cartographie désigne...",
  sequence: "La séquence représente l’ordre dans lequel les informations cartographiques sont révélées.",
  coherence: "La cohérence garantit que les éléments cartographiques sont liés logiquement et visuellement.",
  sens: "Le sens fait référence à la capacité de la carte à transmettre une idée claire.",
  rythme: "Le rythme concerne la cadence de l’apparition des éléments pour guider la lecture.",
};

function selectView(viewId) {
  selectedTheme = viewId;

  const title = document.getElementById("content-title");
  const text = document.getElementById("content-text");
  const img = document.getElementById("theme-image");

  // Par défaut, on masque le conteneur spécial rythme
  if (rythmeContainer) rythmeContainer.style.display = "none";

  if (viewId === "rythme") {
    title.style.display = "none";
    text.style.display = "none";

    img.src = "images/intro_rythme.png";
    img.alt = "Image introductive sur le rythme";
    img.style.display = "block";

    // Affiche les textes et flèches uniquement pour le rythme
    if (rythmeContainer) rythmeContainer.style.display = "block";
  } else {
    title.textContent = formatTitle(viewId);
    title.style.display = "block";

    text.textContent = themeTexts[viewId];
    text.style.display = "block";

    img.src = "";
    img.alt = "";
    img.style.display = "none";
  }

  // Mise à jour des boutons sélectionnés
  document.querySelectorAll(".btn-group .btn").forEach(btn => {
    btn.classList.remove("selected");
    if (btn.dataset.view === viewId || btn.textContent.toLowerCase().includes(viewId)) {
      btn.classList.add("selected");
    }
  });
}

function formatTitle(viewId) {
  switch (viewId) {
    case "sequence": return "La séquence";
    case "coherence": return "La cohérence";
    case "sens": return "Le sens";
    case "rythme": return "Le rythme";
    case "introduction": return "Introduction";
    default: return "";
  }
}

function goToSelected() {
  if (selectedTheme === "rythme") {
    document.getElementById("home").style.display = "none";
    document.getElementById("rythme-view").classList.remove("hidden");
    loadScore();
  } else {
    alert(`Vous avez choisi "${formatTitle(selectedTheme)}". Cette section peut être développée ici.`);
  }
}

function goHome() {
  pausePlayback();
  document.getElementById("home").style.display = "block";
  document.getElementById("rythme-view").classList.add("hidden");
}

// Partition
async function loadScore() {
  try {
    const response = await fetch("partition/soliste.musicxml");
    const musicXML = await response.text();
    await osmd.load(musicXML);
    osmd.Zoom = 0.9;
    await osmd.render();
    osmd.cursor.hide();
    cursor.style.left = `${cursorOffsetX}px`;
  } catch (e) {
    console.error("Erreur lors du chargement de la partition :", e);
  }
}

document.getElementById("osmd-container").addEventListener("click", () => {
  if (!isPlaying) startPlayback();
  else pausePlayback();
});

function startPlayback() {
  isPlaying = true;
  audio.play();

  const duration = audio.duration;
  const scrollWidth = container.scrollWidth;
  const effectiveScrollWidth = scrollWidth - cursorOffsetX;

  function animateCursor() {
    if (!isPlaying) return;
    const percent = audio.currentTime / duration;
    const left = cursorOffsetX + percent * effectiveScrollWidth;
    cursor.style.left = `${left}px`;
    container.scrollLeft = Math.max(0, left - container.clientWidth / 2);
    if (!audio.paused && !audio.ended) {
      requestAnimationFrame(animateCursor);
    }
  }

  requestAnimationFrame(animateCursor);
}

function pausePlayback() {
  isPlaying = false;
  audio.pause();
}
