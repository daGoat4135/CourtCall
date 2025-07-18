import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useRef } from "react";
import { formatTime } from "@/lib/date-utils";
import { createConfetti } from "@/lib/confetti";

interface MatchCardProps {
  match: {
    id: number;
    date: string;
    time: string;
    matchType: string;
    maxPlayers: number;
    status: string;
    rsvps?: Array<{
      userId: number;
      user: {
        id: number;
        name: string;
        avatar: string;
      };
    }>;
  };
  currentUser: {
    id: number;
    name: string;
    avatar: string;
    department?: string;
  };
  onMatchUpdate: () => void;
}

export default function MatchCard({ match, currentUser, onMatchUpdate }: MatchCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const joinButtonRef = useRef<HTMLButtonElement>(null);

  const rsvps = match.rsvps || [];
  const currentPlayerRsvp = rsvps.find(rsvp => rsvp.userId === currentUser.id);
  const isUserJoined = !!currentPlayerRsvp;
  const isFull = rsvps.length >= match.maxPlayers;
  const isNearlyFull = rsvps.length === match.maxPlayers - 1;

  const joinMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/matches/${match.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, userName: currentUser.name, department: currentUser.department }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to join match");
      }
      return response.json();
    },
    onSuccess: () => {
      // Trigger confetti effect
      if (joinButtonRef.current) {
        createConfetti(joinButtonRef.current);
      }

      toast({
        title: "Match joined!",
        description: "You've successfully joined the match.",
      });
      onMatchUpdate();
    },
    onError: (error) => {
      toast({
        title: "Failed to join match",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/matches/${match.id}/leave`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, userName: currentUser.name, department: currentUser.department }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to leave match");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Left match",
        description: "You've left the match.",
      });
      onMatchUpdate();
    },
    onError: (error) => {
      toast({
        title: "Failed to leave match",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusColor = () => {
    if (isFull) return "bg-court-green";
    if (isNearlyFull) return "bg-court-amber";
    return "bg-gray-500";
  };

  const getStatusText = () => {
    if (isFull) return match.matchType;
    if (isNearlyFull) return "Almost Full";
    return "Open";
  };

  const getBorderColor = () => {
    if (isFull) return "border-green-200";
    if (isNearlyFull) return "border-amber-200";
    return "border-gray-200";
  };

  const renderPlayerAvatars = () => {
    const confirmedRsvps = rsvps.filter(rsvp => rsvp.status === "confirmed");
    const waitlistedRsvps = rsvps.filter(rsvp => rsvp.status === "waitlisted");

    const avatars = [];

    // Add confirmed players
    confirmedRsvps.forEach((rsvp) => {
      avatars.push(
        <TooltipProvider key={rsvp.userId} delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="player-avatar">
                {rsvp.user.avatar}
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-white text-gray-800 border rounded shadow-md p-2">
              {rsvp.user.name}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    });

    // Add empty slots for confirmed players
    const emptySlots = match.maxPlayers - confirmedRsvps.length;
    for (let i = 0; i < emptySlots; i++) {
      avatars.push(
        <div
          key={`empty-${i}`}
          className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center"
        >
          <Plus className="h-3 w-3 text-gray-400" />
        </div>
      );
    }

    // Add waitlisted players
    waitlistedRsvps.forEach((rsvp) => {
      avatars.push(
        <TooltipProvider key={`waitlist-${rsvp.userId}`} delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="waitlist-avatar">
                {rsvp.user.avatar}
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-white text-gray-800 border rounded shadow-md p-2">
              {rsvp.user.name}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    });

    return avatars;
  };

  return (
    <div className={`match-card bg-white rounded-lg p-4 border shadow-sm ${getBorderColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <Badge className={`text-xs text-white px-2 py-1 ${getStatusColor()}`}>
          {getStatusText()}
        </Badge>
        <span className="text-xs text-gray-500">
          {formatTime(match.time)}
        </span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex -space-x-2">
          {renderPlayerAvatars()}
        </div>
        <div className={`text-xs font-medium ${
          isFull ? 'text-green-600' : 
          isNearlyFull ? 'text-amber-600' : 
          'text-gray-500'
        }`}>
          {rsvps.filter(rsvp => rsvp.status === "confirmed").length}/{match.maxPlayers}
          {rsvps.filter(rsvp => rsvp.status === "waitlisted").length > 0 && (
            <span className="text-gray-400 ml-1">
              (+{rsvps.filter(rsvp => rsvp.status === "waitlisted").length} waitlisted)
            </span>
          )}
        </div>
      </div>

      {isUserJoined ? (
        <Button
          variant="outline"
          className="w-full text-sm"
          onClick={() => leaveMutation.mutate()}
          disabled={leaveMutation.isPending}
        >
          {leaveMutation.isPending ? "Leaving..." : "Leave Match"}
        </Button>
      ) : (
        <Button
          ref={joinButtonRef}
          className="w-full bg-court-blue hover:bg-blue-700 text-white text-sm"
          onClick={() => joinMutation.mutate()}
          disabled={joinMutation.isPending}
        >
          {joinMutation.isPending ? "Joining..." : isFull ? "Join Waitlist" : "Join Match"}
        </Button>
      )}
    </div>
  );
}