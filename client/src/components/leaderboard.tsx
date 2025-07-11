import { Trophy, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LeaderboardProps {
  leaderboard: Array<{
    userId: number;
    user: {
      id: number;
      name: string;
      avatar: string;
      department: string;
    };
    gameCount: number;
  }>;
  currentUser: {
    id: number;
    name: string;
    avatar: string;
  };
  isLoading: boolean;
}

export default function Leaderboard({ leaderboard, currentUser, isLoading }: LeaderboardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
            Monthly Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded w-8"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "leaderboard-rank";
    if (rank === 2) return "w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-xs font-bold text-white";
    if (rank === 3) return "w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-xs font-bold text-white";
    return "w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-xs font-bold text-white";
  };

  const topPlayers = leaderboard.slice(0, 3);
  const currentUserRank = leaderboard.findIndex(player => player.userId === currentUser.id);
  const currentUserData = currentUserRank !== -1 ? leaderboard[currentUserRank] : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
          Monthly Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topPlayers.map((player, index) => {
            const rank = index + 1;
            const isCurrentUser = player.userId === currentUser.id;
            
            return (
              <div
                key={player.userId}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={getRankStyle(rank)}>
                    {rank}
                  </div>
                  <div className="player-avatar">
                    {player.user.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {player.user.name}
                      {isCurrentUser && <span className="text-blue-600"> • You</span>}
                    </p>
                    <p className="text-sm text-gray-500">{player.user.department}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{player.gameCount}</p>
                  <p className="text-xs text-gray-500">games</p>
                </div>
              </div>
            );
          })}
          
          {currentUserData && currentUserRank > 2 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {currentUserRank + 1}
                </div>
                <div className="player-avatar">
                  {currentUserData.user.avatar}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {currentUserData.user.name}
                    <span className="text-blue-600"> • You</span>
                  </p>
                  <p className="text-sm text-gray-500">{currentUserData.user.department}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{currentUserData.gameCount}</p>
                <p className="text-xs text-gray-500">games</p>
              </div>
            </div>
          )}
        </div>
        
        <Button
          variant="ghost"
          className="w-full mt-4 text-court-blue hover:text-blue-700"
        >
          View Full Leaderboard
        </Button>
      </CardContent>
    </Card>
  );
}
