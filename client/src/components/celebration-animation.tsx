import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper, Trophy, Zap, Heart, Star } from "lucide-react";

interface CelebrationAnimationProps {
  show: boolean;
  type: "match-join" | "match-create" | "milestone" | "first-match";
  playerName?: string;
  matchCount?: number;
  onComplete?: () => void;
}

const celebrationMessages = {
  "match-join": [
    "🏐 You're in! Game on!",
    "🎉 Match joined! See you on the court!",
    "⚡ Ready to spike some balls?",
    "🏆 Another game, another victory!",
    "🔥 You're on fire! Match joined!"
  ],
  "match-create": [
    "🌟 Match created! Time to rally the team!",
    "🎯 New match is live! Who's ready?",
    "🚀 Court is booked! Let's play!",
    "⭐ Match scheduled! Spread the word!",
    "🏐 Fresh match alert! Join the fun!"
  ],
  "milestone": [
    "🏆 Milestone achieved! You're a volleyball legend!",
    "🎉 Amazing dedication! Keep spiking!",
    "⚡ Incredible streak! You're unstoppable!",
    "🌟 Volleyball champion in the making!",
    "🔥 Outstanding performance! Court master!"
  ],
  "first-match": [
    "🎊 Welcome to the court! First match joined!",
    "🏐 Your volleyball journey begins now!",
    "⭐ First spike coming right up!",
    "🎯 New player on the court! Welcome!",
    "🚀 Ready for your first volleyball adventure?"
  ]
};

const getRandomMessage = (type: keyof typeof celebrationMessages) => {
  const messages = celebrationMessages[type];
  return messages[Math.floor(Math.random() * messages.length)];
};

const confettiColors = [
  "#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24", "#f0932b", 
  "#eb4d4b", "#6c5ce7", "#a29bfe", "#fd79a8", "#e17055"
];

export default function CelebrationAnimation({ 
  show, 
  type, 
  playerName = "Player",
  matchCount = 0,
  onComplete 
}: CelebrationAnimationProps) {
  const [message, setMessage] = useState("");
  const [confetti, setConfetti] = useState<Array<{id: number, x: number, y: number, color: string, delay: number}>>([]);

  useEffect(() => {
    if (show) {
      setMessage(getRandomMessage(type));
      
      // Generate confetti particles
      const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        delay: Math.random() * 0.5
      }));
      setConfetti(particles);

      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [show, type, onComplete]);

  const getIcon = () => {
    switch (type) {
      case "match-join":
        return <Zap className="w-8 h-8 text-yellow-400" />;
      case "match-create":
        return <Star className="w-8 h-8 text-blue-400" />;
      case "milestone":
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case "first-match":
        return <Heart className="w-8 h-8 text-red-400" />;
      default:
        return <PartyPopper className="w-8 h-8 text-purple-400" />;
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
        >
          {/* Confetti particles */}
          {confetti.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ 
                scale: 0,
                x: "50vw",
                y: "50vh",
                rotate: 0
              }}
              animate={{
                scale: [0, 1, 0],
                x: `${particle.x}vw`,
                y: `${particle.y}vh`,
                rotate: 360
              }}
              transition={{
                duration: 2,
                delay: particle.delay,
                ease: "easeOut"
              }}
              className="absolute w-3 h-3 rounded-full"
              style={{ backgroundColor: particle.color }}
            />
          ))}

          {/* Main celebration card */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              duration: 0.6
            }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center"
          >
            {/* Bouncing icon */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2,
                ease: "easeInOut"
              }}
              className="mb-6 flex justify-center"
            >
              {getIcon()}
            </motion.div>

            {/* Main message */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-gray-800 mb-4"
            >
              {message}
            </motion.h2>

            {/* Player name */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-gray-600 mb-2"
            >
              Way to go, {playerName}!
            </motion.p>

            {/* Match count for milestones */}
            {type === "milestone" && matchCount > 0 && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-gray-500 mb-4"
              >
                {matchCount} matches and counting! 🎯
              </motion.p>
            )}

            {/* Pulsing court-themed accent */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5,
                ease: "easeInOut"
              }}
              className="w-16 h-1 bg-gradient-to-r from-court-blue to-blue-400 rounded-full mx-auto"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}