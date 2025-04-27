import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format a date string to a readable format
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Calculate time difference to human readable format (e.g., "2 hours ago")
export function timeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}

// Format points with commas (e.g., 1000 -> 1,000)
export function formatPoints(points: number): string {
  return points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Get initials from a username (e.g., "John Doe" -> "JD")
export function getInitials(name: string): string {
  if (!name) return '';
  
  // If the name contains a space, take first letter of first and last names
  if (name.includes(' ')) {
    const nameParts = name.split(' ');
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  }
  
  // If name has no spaces but is 2+ chars, return first two letters
  if (name.length >= 2) {
    return name.substring(0, 2).toUpperCase();
  }
  
  // Fall back to just the first letter
  return name[0].toUpperCase();
}

// Generate a random avatar color
export function getRandomAvatarColor(): string {
  const colors = [
    'bg-primary text-primary-foreground',
    'bg-accent text-accent-foreground',
    'bg-green-500 text-white',
    'bg-amber-500 text-white',
    'bg-blue-500 text-white',
    'bg-purple-500 text-white',
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

// Map difficulty to colors
export function getDifficultyColor(difficulty: string): { bgColor: string, textColor: string } {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return { bgColor: 'bg-green-500/20', textColor: 'text-green-500' };
    case 'medium':
      return { bgColor: 'bg-accent/20', textColor: 'text-accent' };
    case 'hard':
      return { bgColor: 'bg-amber-500/20', textColor: 'text-amber-500' };
    default:
      return { bgColor: 'bg-primary/20', textColor: 'text-primary' };
  }
}

// Generate badge icon based on badge name
export function getBadgeIcon(badgeName: string): string {
  const lowerName = badgeName.toLowerCase();
  
  if (lowerName.includes('first') || lowerName.includes('blood')) {
    return 'trophy';
  } else if (lowerName.includes('speed') || lowerName.includes('fast')) {
    return 'timer';
  } else if (lowerName.includes('brain') || lowerName.includes('smart')) {
    return 'brain';
  } else if (lowerName.includes('streak') || lowerName.includes('consecutive')) {
    return 'flame';
  } else if (lowerName.includes('top') || lowerName.includes('leader')) {
    return 'medal';
  } else {
    return 'award';
  }
}
