import Difficulty from '../../common/difficulty'

export function formatDifficulty(difficulty: Difficulty) {
  switch (difficulty) {
  case Difficulty.Easy:
    return 'Helppo';
  case Difficulty.Medium:
    return 'Keskivaikea';
  case Difficulty.Hard:
    return 'Vaikea';
  }
}

export function formatMinutesSeconds(time: number) {
  const totalSeconds = time | 0;
  const seconds = totalSeconds % 60;
  const minutes = (totalSeconds / 60) | 0;
  return String(minutes) + ':' + String(seconds).padStart(2, '0');
}
