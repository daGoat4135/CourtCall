import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { addWeeks, subWeeks } from "date-fns";
import Header from "@/components/header";
import WeeklyCalendar from "@/components/weekly-calendar";
import Leaderboard from "@/components/leaderboard";
import StatsCards from "@/components/stats-cards";
import UpcomingReminders from "@/components/upcoming-reminders";
import { formatWeekRange } from "@/lib/date-utils";

export default function Dashboard() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [currentUser] = useState({ id: 1, name: "John Doe", avatar: "JD" }); // Mock current user

  const { data: matches = [], isLoading: matchesLoading, refetch: refetchMatches } = useQuery({
    queryKey: ["/api/matches/week", currentWeek.toISOString()],
    queryFn: async () => {
      const response = await fetch(`/api/matches/week?date=${currentWeek.toISOString()}`);
      if (!response.ok) throw new Error("Failed to fetch matches");
      return response.json();
    },
  });

  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
    queryFn: async () => {
      const response = await fetch("/api/leaderboard");
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      return response.json();
    },
  });

  const { data: userStats } = useQuery({
    queryKey: ["/api/users", currentUser.id, "stats"],
    queryFn: async () => {
      const response = await fetch(`/api/users/${currentUser.id}/stats`);
      if (!response.ok) throw new Error("Failed to fetch user stats");
      return response.json();
    },
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications", currentUser.id],
    queryFn: async () => {
      const response = await fetch(`/api/notifications/${currentUser.id}`);
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return response.json();
    },
  });

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeek(prev => 
      direction === "prev" ? subWeeks(prev, 1) : addWeeks(prev, 1)
    );
  };

  const handleMatchUpdate = () => {
    refetchMatches();
  };

  const weeklyStats = {
    gamesThisWeek: matches.length,
    activePlayers: new Set(matches.flatMap(m => m.rsvps?.map(r => r.userId) || [])).size,
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header currentUser={currentUser} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <WeeklyCalendar
              matches={matches}
              currentWeek={currentWeek}
              currentUser={currentUser}
              isLoading={matchesLoading}
              onNavigateWeek={navigateWeek}
              onMatchUpdate={handleMatchUpdate}
            />
          </div>
          
          <div className="space-y-6">
            <StatsCards
              gamesThisWeek={weeklyStats.gamesThisWeek}
              activePlayers={weeklyStats.activePlayers}
            />
            
            <Leaderboard
              leaderboard={leaderboard}
              currentUser={currentUser}
              isLoading={leaderboardLoading}
            />
            
            <UpcomingReminders
              notifications={notifications}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
