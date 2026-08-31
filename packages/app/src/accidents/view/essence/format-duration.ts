const pad = (n: number): string => String(n).padStart(2, "0");

export const formatDuration = (totalSeconds: number): string =>
  `${pad(Math.floor(totalSeconds / 60))}:${pad(totalSeconds % 60)}`;
