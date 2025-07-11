import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MatchCard from "./match-card";
import CreateMatchDialog from "./create-match-dialog";
import { getWeekDates, formatWeekRange, getDayName, getDayNumber } from "@/lib/date-utils";
import { isSameDay } from "date-fns";

interface WeeklyCalendarProps {
  matches: any[];
  currentWeek: Date;
  currentUser: { id: number; name: string; avatar: string };
  isLoading: boolean;
  onNavigateWeek: (direction: "prev" | "next") => void;
  onMatchUpdate: () => void;
}

export default function WeeklyCalendar({ 
  matches, 
  currentWeek, 
  currentUser, 
  isLoading, 
  onNavigateWeek, 
  onMatchUpdate 
}: WeeklyCalendarProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const weekDates = getWeekDates(currentWeek);

  const getMatchesForDate = (date: Date) => {
    return matches.filter(match => isSameDay(new Date(match.date), date));
  };

  const handleCreateMatch = (date: Date) => {
    setSelectedDate(date);
    setIsCreateDialogOpen(true);
  };

  const handleMatchCreated = () => {
    setIsCreateDialogOpen(false);
    setSelectedDate(null);
    onMatchUpdate();
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-8"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">This Week's Matches</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateWeek("prev")}
              className="p-2 hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-gray-700">
              {formatWeekRange(currentWeek)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateWeek("next")}
              className="p-2 hover:bg-gray-100"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-6">
          {weekDates.map((date) => {
            const dayMatches = getMatchesForDate(date);
            const hasMatches = dayMatches.length > 0;

            return (
              <div key={date.toISOString()} className="text-center">
                <div className="text-sm font-medium text-gray-500 mb-2">
                  {getDayName(date)}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-3">
                  {getDayNumber(date)}
                </div>
                
                {hasMatches ? (
                  <div className="space-y-2">
                    {dayMatches.map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        currentUser={currentUser}
                        onMatchUpdate={onMatchUpdate}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    className="match-card bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300 hover:border-court-blue cursor-pointer"
                    onClick={() => handleCreateMatch(date)}
                  >
                    <div className="text-center">
                      <Plus className="h-5 w-5 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Create Match</p>
                      <p className="text-xs text-gray-400">12:00 PM</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1 bg-court-blue hover:bg-blue-700 text-white"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Match
          </Button>
          <Button
            variant="outline"
            className="flex-1"
          >
            <Calendar className="h-4 w-4 mr-2" />
            View Full Calendar
          </Button>
        </div>
      </Card>

      <CreateMatchDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        selectedDate={selectedDate}
        currentUser={currentUser}
        onMatchCreated={handleMatchCreated}
      />
    </>
  );
}
