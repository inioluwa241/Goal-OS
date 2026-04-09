export const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long", // "Sunday"
    month: "short", // "Mar"
    day: "numeric", // "29"
  }).format(date);
};

export const getRelativeDate = (targetDateString: string) => {
  const now = new Date();
  const target = new Date(targetDateString);

  // Reset hours to compare only the dates (not times)
  const diffInMs = target.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
  const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Tomorrow";
  if (diffInDays === -1) return "Yesterday";
  if (diffInDays > 1) return `${diffInDays} days`;

  // For older dates, use your previous format
  return target.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};
