import { onMounted, onUnmounted, ref } from "vue";

export default function() {
  const audioPlayer: HTMLAudioElement = new Audio();
  const currentTime = ref<string>("--:--");
  const duration = ref<string>("--:--");
  const playerVolume = ref<number>(0);
  const isMuted = ref<boolean>(true);
  let savedVolume = 0.85;

  const formatDuration = (seconds: number): string => {
    const sec = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    const min = Math.floor(seconds / 60);
    const hour = Math.floor(seconds / 3600);
    return hour ? `${hour}:${min}:${sec}` : `${min}:${sec}`;
  };

  const handleTimeUpdate = () => {
    currentTime.value = formatDuration(audioPlayer.currentTime);
  };

  const toggleMute = () => {
    if (isMuted.value) {
      playerVolume.value = savedVolume;
      audioPlayer.muted = false;
    } else {
      playerVolume.value = 0;
      audioPlayer.muted = true;
    }
    isMuted.value = !isMuted.value;
  };

  const changeVolume = () => {
    audioPlayer.volume = playerVolume.value;
    savedVolume = playerVolume.value;
    // if the user adjusts to 0, toggle mute
    if (playerVolume.value === 0) {
      isMuted.value = true;
      audioPlayer.muted = true;
    } else {
      isMuted.value = false;
      audioPlayer.muted = false;
    }
  };

  const setupTrack = (time: number, src: string) => {
    if (!audioPlayer) {
      throw new Error("Audio element not yet mounted.");
    }
    audioPlayer.src = src;
    audioPlayer.currentTime = time;
  };

  const playTrack = async () => {
    duration.value = formatDuration(audioPlayer.duration);
    try {
      await audioPlayer.play();
    } catch (err) {
      console.error(
        "Play failed. TODO: handle with a resync option.",
        err.message
      );
    }
  };

  // TODO: add event listener for ended track here with callback
  onMounted(() => {
    if (audioPlayer) {
      audioPlayer.volume = savedVolume;
      audioPlayer.muted = isMuted.value;
      audioPlayer.addEventListener("timeupdate", handleTimeUpdate);
      audioPlayer.addEventListener("loadedmetadata", playTrack);
    }
  });

  onUnmounted(() => {
    audioPlayer.removeEventListener("timeupdate", handleTimeUpdate);
    audioPlayer.removeEventListener("loadedmetadata", playTrack);
  });

  return {
    audioPlayer,
    playerVolume,
    isMuted,
    currentTime,
    duration,
    toggleMute,
    changeVolume,
    setupTrack,
  };
}
