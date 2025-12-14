
export interface Activity {
  id: string;
  type: 'navigation' | 'search' | 'report' | 'note';
  description: string;
  timestamp: string; // ISO string
  url?: string;
}

const getActivityLogKey = (userEmail: string | null): string | null => {
  if (!userEmail) return null;
  return `activity-log-${userEmail}`;
};

export const logActivity = (userEmail: string | null, activity: Omit<Activity, 'id' | 'timestamp'>) => {
  const key = getActivityLogKey(userEmail);
  if (!key) return;

  try {
    const log = getActivityLog(userEmail);
    const newActivity: Activity = {
      ...activity,
      id: `activity-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    // Add new activity to the top and limit log size
    const updatedLog = [newActivity, ...log].slice(0, 100);
    localStorage.setItem(key, JSON.stringify(updatedLog));
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

export const getActivityLog = (userEmail: string | null): Activity[] => {
  const key = getActivityLogKey(userEmail);
  if (!key) return [];

  try {
    const savedLog = localStorage.getItem(key);
    return savedLog ? JSON.parse(savedLog) : [];
  } catch (error) {
    console.error("Failed to retrieve activity log:", error);
    return [];
  }
};

export const deleteActivity = (userEmail: string | null, activityId: string) => {
  const key = getActivityLogKey(userEmail);
  if (!key) return;

  try {
    const log = getActivityLog(userEmail);
    const updatedLog = log.filter(activity => activity.id !== activityId);
    localStorage.setItem(key, JSON.stringify(updatedLog));
  } catch (error) {
    console.error("Failed to delete activity:", error);
  }
};
