import { TrendingUp, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  gamesThisWeek: number;
  activePlayers: number;
}

export default function StatsCards({ gamesThisWeek, activePlayers }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{gamesThisWeek}</p>
              <p className="text-sm text-gray-500">Games This Week</p>
            </div>
            <div className="w-10 h-10 bg-court-green rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{activePlayers}</p>
              <p className="text-sm text-gray-500">Active Players</p>
            </div>
            <div className="w-10 h-10 bg-court-amber rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
