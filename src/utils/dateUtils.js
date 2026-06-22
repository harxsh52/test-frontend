export const formatDate = (dateValue) => {
  if (!dateValue) return '-';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(dateValue));
};

export const formatTime = (dateValue) => {
  if (!dateValue) return '-';

  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateValue));
};

export const getTodayKey = () => new Date().toISOString().slice(0, 10);

export const getDurationLabel = (startDate, endDate = new Date()) => {
  if (!startDate) return '0h 00m';

  const diffMs = new Date(endDate).getTime() - new Date(startDate).getTime();
  const safeDiffMs = Math.max(diffMs, 0);
  const totalMinutes = Math.floor(safeDiffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${String(minutes).padStart(2, '0')}m`;
};
