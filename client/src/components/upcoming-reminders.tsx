import { Bell, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface UpcomingRemindersProps {
  notifications: Array<{
    id: number;
    matchId: number;
    type: string;
    message: string;
    scheduledFor: string;
  }>;
}

export default function UpcomingReminders({ notifications }: UpcomingRemindersProps) {
  const upcomingNotifications = notifications
    .filter(notification => new Date(notification.scheduledFor) > new Date())
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
    .slice(0, 3);

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "final_call":
        return "bg-amber-50 border-amber-200";
      case "reminder":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getNotificationDotColor = (type: string) => {
    switch (type) {
      case "final_call":
        return "bg-court-amber";
      case "reminder":
        return "bg-court-blue";
      default:
        return "bg-gray-400";
    }
  };

  const getTimeUntil = (scheduledFor: string) => {
    try {
      return formatDistanceToNow(new Date(scheduledFor), { addSuffix: false });
    } catch {
      return "Soon";
    }
  };

  if (upcomingNotifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Bell className="h-5 w-5 text-amber-500 mr-2" />
            Upcoming Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No upcoming reminders</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Bell className="h-5 w-5 text-amber-500 mr-2" />
          Upcoming Reminders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-center p-3 rounded-lg border ${getNotificationColor(notification.type)}`}
            >
              <div className={`w-2 h-2 rounded-full mr-3 ${getNotificationDotColor(notification.type)}`}></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {notification.type.replace("_", " ")}
                </p>
              </div>
              <span className={`text-xs font-medium ${
                notification.type === "final_call" ? "text-amber-600" : "text-blue-600"
              }`}>
                {getTimeUntil(notification.scheduledFor)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
