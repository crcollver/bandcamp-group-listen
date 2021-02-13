import { onMounted, ref } from "vue";

export default function() {
  const audioPlayer = ref<HTMLAudioElement | null>(null);
  const currentTime = ref<string>("--:--");
  const duration = ref<string>("--:--");
  const playerVolume = ref<number>(0);
  const isMuted = ref<boolean>(true);
  let savedVolume = playerVolume.value;

  const formatDuration = (seconds: number): string => {
    let sec = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    const min = Math.floor(seconds / 60);
    const hour = Math.floor(seconds / 3600);
    return hour ? `${hour}:${min}:${sec}` : `${min}:${sec}`;
  };

  const handleTimeUpdate = () => {
    currentTime.value = formatDuration(audioPlayer.value!.currentTime);
  };

  const toggleMute = () => {
    if (isMuted.value) {
      playerVolume.value = savedVolume;
      audioPlayer.value!.muted = false;
    } else {
      playerVolume.value = 0;
      audioPlayer.value!.muted = true;
    }
    isMuted.value = !isMuted.value;
  };

  const changeVolume = () => {
    audioPlayer.value!.volume = playerVolume.value;
    savedVolume = playerVolume.value;
    // if the user adjusts to 0, toggle mute
    if (playerVolume.value === 0) {
      isMuted.value = true;
      audioPlayer.value!.muted = true;
    } else {
      isMuted.value = false;
      audioPlayer.value!.muted = false;
    }
  };

  const setupTrack = (time: number, src: string, dur: number) => {
    if (!audioPlayer.value) {
      throw new Error("Audio element not yet mounted.");
    }
    duration.value = formatDuration(dur);
    audioPlayer.value!.currentTime = time;
    audioPlayer.value!.src = src;
    audioPlayer.value!.play();
  };

  onMounted(() => {
    audioPlayer.value!.volume = playerVolume.value;
    audioPlayer.value!.muted = isMuted.value;
  });

  return {
    audioPlayer,
    playerVolume,
    isMuted,
    currentTime,
    duration,
    toggleMute,
    changeVolume,
    handleTimeUpdate,
    setupTrack,
  };
}
