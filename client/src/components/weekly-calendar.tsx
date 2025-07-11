import { useState } from "react";
import { ChevronLeft, ChevronRight, Sunrise, Clock, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TimeSlotCard from "./time-slot-card";
import { getWeekDates, formatWeekRange, getDayName, getDayNumber } from "@/lib/date-utils";
import { isSameDay } from "date-fns";

interface WeeklyCalendarProps {
  matches: any[];
  currentWeek: Date;
  currentUser: { id: number; name: string; avatar: string } | null;
  isLoading: boolean;
  onNavigateWeek: (direction: "prev" | "next") => void;
  onMatchUpdate: () => void;
  onNameSubmit?: (name: string) => void;
}

export default function WeeklyCalendar({ 
  matches, 
  currentWeek, 
  currentUser, 
  isLoading, 
  onNavigateWeek, 
  onMatchUpdate,
  onNameSubmit
}: WeeklyCalendarProps) {
  const weekDates = getWeekDates(currentWeek);

  const getMatchesForDate = (date: Date) => {
    return matches.filter(match => isSameDay(new Date(match.date), date));
  };

  const getTimeSlotInfo = (slot: string) => {
    switch (slot) {
      case "morning":
        return { icon: Sunrise, label: "Morning", color: "bg-yellow-100 border-yellow-300" };
      case "lunch":
        return { icon: Clock, label: "Lunch", color: "bg-blue-100 border-blue-300" };
      case "afterwork":
        return { icon: Moon, label: "Evening", color: "bg-purple-100 border-purple-300" };
      default:
        return { icon: Clock, label: "Match", color: "bg-gray-100 border-gray-300" };
    }
  };

  const findMatchForSlot = (date: Date, timeSlot: string) => {
    const dayMatches = getMatchesForDate(date);
    return dayMatches.find(match => match.timeSlot === timeSlot);
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
          {weekDates.map((date) => (
            <div key={date.toISOString()} className="text-center">
              <div className="text-sm font-medium text-gray-500 mb-2">
                {getDayName(date)}
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-3">
                {getDayNumber(date)}
              </div>
              
              <div className="space-y-2">
                {["morning", "lunch", "afterwork"].map((timeSlot) => {
                  const match = findMatchForSlot(date, timeSlot);
                  const slotInfo = getTimeSlotInfo(timeSlot);
                  const Icon = slotInfo.icon;
                  
                  return (
                    <TimeSlotCard
                      key={`${date.toISOString()}-${timeSlot}`}
                      match={match}
                      timeSlot={timeSlot}
                      date={date}
                      currentUser={currentUser}
                      onMatchUpdate={onMatchUpdate}
                      slotInfo={slotInfo}
                      onNameSubmit={onNameSubmit}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-sm text-gray-500 mt-4">
          <p>Click any time slot to join a match. Fixed slots make it simple!</p>
        </div>
      </Card>
    </>
  );
}
