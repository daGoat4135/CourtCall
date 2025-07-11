import { Bell, Volleyball, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  currentUser: {
    id: number;
    name: string;
    avatar: string;
  } | null;
  onChangeUser?: () => void;
}

export default function Header({ currentUser, onChangeUser }: HeaderProps) {
  const handleUserClick = () => {
    if (onChangeUser) {
      onChangeUser();
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
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Hi, {currentUser.name}!</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUserClick}
                    className="player-avatar hover:ring-2 hover:ring-court-blue cursor-pointer"
                  >
                    {currentUser.avatar}
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
    </header>
  );
}
