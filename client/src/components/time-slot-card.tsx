import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useState } from "react";

interface TimeSlotCardProps {
  match?: {
    id: number;
    date: string;
    timeSlot: string;
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
  timeSlot: string;
  date: Date;
  currentUser: {
    id: number;
    name: string;
    avatar: string;
  } | null;
  onNameSubmit?: (name: string) => void;
  onMatchUpdate: () => void;
  slotInfo: {
    icon: any;
    label: string;
    color: string;
  };
}

export default function TimeSlotCard({
  match,
  timeSlot,
  date,
  currentUser,
  onMatchUpdate,
  slotInfo,
  onNameSubmit,
}: TimeSlotCardProps) {
  const { toast } = useToast();
  const { icon: Icon, label, color } = slotInfo;
  const [nameInput, setNameInput] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);

  const rsvps = match?.rsvps || [];
  const confirmedRsvps = rsvps.filter(rsvp => rsvp.status === "confirmed");
  const waitlistedRsvps = rsvps.filter(rsvp => rsvp.status === "waitlisted");
  const currentPlayerRsvp = rsvps.find(rsvp => currentUser && rsvp.user.name === currentUser.name);
  const isUserJoined = !!currentPlayerRsvp;
  const playerCount = confirmedRsvps.length;
  const maxPlayers = match?.maxPlayers || 4;
  const isFull = playerCount >= maxPlayers;

  const handleNameSubmit = (name: string) => {
    if (name.trim().length >= 2) {
      if (onNameSubmit) {
        onNameSubmit(name.trim());
      }
      setShowNameInput(false);
      setNameInput("");
    }
  };

  const createAndJoinMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) {
        throw new Error("No user available");
      }
      
      // First create the match if it doesn't exist
      if (!match) {
        const createResponse = await fetch("/api/matches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: date.toISOString(),
            timeSlot: timeSlot,
            maxPlayers: 4,
            status: "open",
          }),
        });
        
        if (!createResponse.ok) {
          throw new Error("Failed to create match");
        }
        
        const newMatch = await createResponse.json();
        
        // Then join the new match
        const joinResponse = await fetch(`/api/matches/${newMatch.id}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName: currentUser.name }),
        });
        
        if (!joinResponse.ok) {
          const error = await joinResponse.json();
          throw new Error(error.error || "Failed to join match");
        }
        
        return { newMatch, rsvp: await joinResponse.json() };
      } else {
        // Just join existing match
        const response = await fetch(`/api/matches/${match.id}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName: currentUser.name }),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to join match");
        }
        
        return { rsvp: await response.json() };
      }
    },
    onSuccess: () => {
      toast({
        title: "Joined match!",
        description: `You've joined the ${label.toLowerCase()} volleyball session.`,
      });
      onMatchUpdate();
    },
    onError: (error) => {
      toast({
        title: "Failed to join",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/matches/${match!.id}/leave`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: currentUser.name }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to leave match");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Left match",
        description: `You've left the ${label.toLowerCase()} session.`,
      });
      onMatchUpdate();
    },
    onError: (error) => {
      toast({
        title: "Failed to leave",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getBorderColor = () => {
    if (isFull) return "border-green-300";
    if (playerCount > 0) return "border-blue-300";
    return "border-gray-300";
  };

  const getStatusColor = () => {
    if (isFull) return "bg-green-100 text-green-800";
    if (playerCount > 0) return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className={`p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${color} ${getBorderColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Icon className="h-4 w-4" />
          <span className="text-sm font-medium">{label}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1">
          <Users className="h-3 w-3 text-gray-500" />
          <span className="text-xs text-gray-600">{playerCount}/{maxPlayers}</span>
        </div>
        {playerCount > 0 && (
          <Badge className={`text-xs px-2 py-1 ${getStatusColor()}`}>
            {isFull ? "Full" : playerCount === maxPlayers - 1 ? "Almost Full" : "Open"}
          </Badge>
        )}
      </div>
      
      {playerCount > 0 && (
        <div className="mb-3 space-y-2">
          {/* Confirmed players */}
          <div className="flex -space-x-1">
            {confirmedRsvps.slice(0, 3).map((rsvp) => (
              <div key={rsvp.userId} className="player-avatar w-6 h-6 text-xs">
                {rsvp.user.avatar}
              </div>
            ))}
            {playerCount > 3 && (
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                +{playerCount - 3}
              </div>
            )}
          </div>
          
          {/* Waitlisted players */}
          {waitlistedRsvps.length > 0 && (
            <div className="flex -space-x-1">
              {waitlistedRsvps.slice(0, 3).map((rsvp) => (
                <div key={rsvp.userId} className="waitlist-avatar w-6 h-6 text-xs">
                  {rsvp.user.avatar}
                </div>
              ))}
              {waitlistedRsvps.length > 3 && (
                <div className="w-6 h-6 bg-gray-100 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-500">
                  +{waitlistedRsvps.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {!currentUser ? (
        showNameInput ? (
          <div className="flex space-x-2">
            <Input
              placeholder="Enter your name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="text-xs h-8"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleNameSubmit(nameInput);
                }
              }}
              autoFocus
            />
            <Button
              className="bg-court-blue hover:bg-blue-700 text-white text-xs h-8 px-3"
              onClick={() => handleNameSubmit(nameInput)}
              disabled={nameInput.trim().length < 2}
            >
              Join
            </Button>
          </div>
        ) : (
          <Button
            className="w-full bg-court-blue hover:bg-blue-700 text-white text-xs h-8"
            onClick={() => setShowNameInput(true)}
          >
            {playerCount === 0 ? "Start Match" : isFull ? "Join Waitlist" : "Join"}
          </Button>
        )
      ) : isUserJoined ? (
        <Button
          variant="outline"
          className="w-full text-xs h-8"
          onClick={() => leaveMutation.mutate()}
          disabled={leaveMutation.isPending}
        >
          {leaveMutation.isPending ? "Leaving..." : "Leave"}
        </Button>
      ) : (
        <Button
          className="w-full bg-court-blue hover:bg-blue-700 text-white text-xs h-8"
          onClick={() => createAndJoinMutation.mutate()}
          disabled={createAndJoinMutation.isPending}
        >
          {createAndJoinMutation.isPending ? "Joining..." : playerCount === 0 ? "Start Match" : isFull ? "Join Waitlist" : "Join"}
        </Button>
      )}
    </div>
  );
}