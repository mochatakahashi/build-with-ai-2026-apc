export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatDate(dateString);
};

export const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  const val = Number(num);
  if (isNaN(val)) return '0';
  if (val >= 1000000) return `${(val / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return val.toString();
};

export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
};
