import { onMounted, onUnmounted, reactive } from "vue";
import { PlayerStatus } from "@/interfaces";

export default function () {
  const audioPlayer: HTMLAudioElement = new Audio();
  const playerStatus = reactive<PlayerStatus>({
    volume: 0,
    hasEnded: false,
    isMuted: true,
    currentTime: "--:--",
    duration: "--:--",
  });
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
    playerStatus.currentTime = formatDuration(audioPlayer.currentTime);
  };

  const onEnded = () => {
    audioPlayer.src = "";
    playerStatus.hasEnded = true;
  };

  const toggleMute = () => {
    if (playerStatus.isMuted) {
      playerStatus.volume = savedVolume;
      audioPlayer.muted = false;
    } else {
      playerStatus.volume = 0;
      audioPlayer.muted = true;
    }
    playerStatus.isMuted = !playerStatus.isMuted;
  };

  const changeVolume = () => {
    audioPlayer.volume = playerStatus.volume;
    savedVolume = playerStatus.volume;
    // if the user adjusts to 0, toggle mute
    if (playerStatus.volume === 0) {
      playerStatus.isMuted = true;
      audioPlayer.muted = true;
    } else {
      playerStatus.isMuted = false;
      audioPlayer.muted = false;
    }
  };

  const setupTrack = (time: number, src: string) => {
    if (!audioPlayer) {
      throw new Error("Audio element not yet mounted.");
    }
    audioPlayer.src = src;
    audioPlayer.currentTime = time;
    playerStatus.hasEnded = false;
  };

  const playTrack = async () => {
    playerStatus.duration = formatDuration(audioPlayer.duration);
    try {
      await audioPlayer.play();
    } catch (err) {
      console.error(
        "Play failed. TODO: handle with a resync option.",
        err.message
      );
    }
  };

  onMounted(() => {
    if (audioPlayer) {
      audioPlayer.volume = savedVolume;
      audioPlayer.muted = playerStatus.isMuted;
      audioPlayer.addEventListener("timeupdate", handleTimeUpdate);
      audioPlayer.addEventListener("loadedmetadata", playTrack);
      audioPlayer.addEventListener("ended", onEnded);
    }
  });

  onUnmounted(() => {
    audioPlayer.removeEventListener("timeupdate", handleTimeUpdate);
    audioPlayer.removeEventListener("loadedmetadata", playTrack);
    audioPlayer.removeEventListener("ended", onEnded);
  });

  return {
    playerStatus,
    toggleMute,
    changeVolume,
    setupTrack,
  };
}
