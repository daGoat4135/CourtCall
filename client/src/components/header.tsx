import { Bell, Volleyball, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import TeamSelectorDialog from "./team-selector-dialog";

interface HeaderProps {
  currentUser: {
    id: number;
    name: string;
    avatar: string;
    department?: string;
  } | null;
  onChangeUser?: () => void;
  onTeamUpdate?: (team: string) => void;
}

export default function Header({ currentUser, onChangeUser, onTeamUpdate }: HeaderProps) {
  const [showTeamDialog, setShowTeamDialog] = useState(false);

  const handleUserClick = () => {
    if (onChangeUser) {
      onChangeUser();
    }
  };

  const handleTeamUpdate = (team: string) => {
    if (onTeamUpdate) {
      onTeamUpdate(team);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-court-blue rounded-lg flex items-center justify-center">
              <Volleyball className="text-white h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CourtCall</h1>
              <p className="text-sm text-gray-500">Volleyball Scheduling</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <Button variant="ghost" size="sm" className="p-2">
                  <Bell className="h-4 w-4 text-gray-500" />
                </Button>
                <div className="flex items-center space-x-2 relative">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium text-gray-700">Hi, {currentUser.name}!</span>
                    {currentUser.department && (
                      <span className="text-xs text-gray-500">{currentUser.department}</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUserClick}
                    className="player-avatar hover:ring-2 hover:ring-court-blue cursor-pointer"
                  >
                    {currentUser.avatar}
                  </Button>
                  
                  {/* Fun floating action button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTeamDialog(true)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-court-blue hover:bg-blue-700 text-white rounded-full p-0 shadow-lg transition-all duration-200 hover:scale-110"
                    title="Tell us what team you're on!"
                  >
                    <Users className="h-3 w-3" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Welcome to CourtCall!</span>
                <span className="text-xs text-gray-500">Enter your name to join matches</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Team Selector Dialog */}
      <TeamSelectorDialog
        open={showTeamDialog}
        onOpenChange={setShowTeamDialog}
        currentTeam={currentUser?.department}
        onTeamUpdate={handleTeamUpdate}
      />
    </header>
  );
}
