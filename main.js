const osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay("osmd-container", {
  backend: "svg",
  drawTitle: true,
});

const audio = document.getElementById("audio");
const container = document.getElementById("container");
const cursor = document.getElementById("cursor");

// Position manuelle du curseur de départ
const cursorOffsetX = 215; // Décalage fixe en pixels (ajuste ici)

let isPlaying = false;

async function loadScore() {
  try {
    const response = await fetch("partition/soliste.musicxml");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const musicXML = await response.text();
    await osmd.load(musicXML);

    osmd.Zoom = 1; // 👈 ajuster ici (par exemple 0.6, 0.8, etc.)
    await osmd.render();

    osmd.cursor.hide();
    cursor.style.left = `${cursorOffsetX}px`;
  } catch (e) {
    console.error("Erreur lors du chargement de la partition :", e);
  }
}

loadScore();

document.getElementById("osmd-container").addEventListener("click", () => {
  if (!isPlaying) {
    startPlayback();
  } else {
    pausePlayback();
  }
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
