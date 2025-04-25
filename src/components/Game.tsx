import React, { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  Moon, Sun, HelpCircle, RotateCcw, 
  Award, Zap, ArrowRight, Play, Square 
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const Game = () => {
  const isMobile = useIsMobile();
  
  const [gameState, setGameState] = useState({
    leftBank: { missionaries: 3, cannibals: 3 },
    rightBank: { missionaries: 0, cannibals: 0 },
    boat: { missionaries: 0, cannibals: 0, position: 'left' },
    moveCount: 0,
    gameStatus: 'playing',
    difficulty: 'easy',
    maxMoves: 15,
    showHints: false,
    autoSolving: false,
    solutionStep: 0
  });
  
  const [darkMode, setDarkMode] = useState(false);
  const [selectedPassengers, setSelectedPassengers] = useState({ missionaries: 0, cannibals: 0 });
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState({ title: '', description: '', type: 'info' });
  const autoSolveTimeoutRef = useRef(null);
  
  const solutionSteps = [
    { 
      action: 'Move 2 cannibals from left to right',
      leftBank: { missionaries: 3, cannibals: 1 },
      rightBank: { missionaries: 0, cannibals: 2 },
      boat: { position: 'right', missionaries: 0, cannibals: 0 }
    },
    { 
      action: 'Return 1 cannibal from right to left',
      leftBank: { missionaries: 3, cannibals: 2 },
      rightBank: { missionaries: 0, cannibals: 1 },
      boat: { position: 'left', missionaries: 0, cannibals: 0 }
    },
    { 
      action: 'Move 2 cannibals from left to right',
      leftBank: { missionaries: 3, cannibals: 0 },
      rightBank: { missionaries: 0, cannibals: 3 },
      boat: { position: 'right', missionaries: 0, cannibals: 0 }
    },
    { 
      action: 'Return 1 cannibal from right to left',
      leftBank: { missionaries: 3, cannibals: 1 },
      rightBank: { missionaries: 0, cannibals: 2 },
      boat: { position: 'left', missionaries: 0, cannibals: 0 }
    },
    { 
      action: 'Move 2 missionaries from left to right',
      leftBank: { missionaries: 1, cannibals: 1 },
      rightBank: { missionaries: 2, cannibals: 2 },
      boat: { position: 'right', missionaries: 0, cannibals: 0 }
    },
    { 
      action: 'Return 1 missionary and 1 cannibal from right to left',
      leftBank: { missionaries: 2, cannibals: 2 },
      rightBank: { missionaries: 1, cannibals: 1 },
      boat: { position: 'left', missionaries: 0, cannibals: 0 }
    },
    { 
      action: 'Move 2 missionaries from left to right',
      leftBank: { missionaries: 0, cannibals: 2 },
      rightBank: { missionaries: 3, cannibals: 1 },
      boat: { position: 'right', missionaries: 0, cannibals: 0 }
    },
    { 
      action: 'Return 1 cannibal from right to left',
      leftBank: { missionaries: 0, cannibals: 3 },
      rightBank: { missionaries: 3, cannibals: 0 },
      boat: { position: 'left', missionaries: 0, cannibals: 0 }
    },
    { 
      action: 'Move 2 cannibals from left to right',
      leftBank: { missionaries: 0, cannibals: 1 },
      rightBank: { missionaries: 3, cannibals: 2 },
      boat: { position: 'right', missionaries: 0, cannibals: 0 }
    },
    { 
      action: 'Return 1 cannibal from right to left',
      leftBank: { missionaries: 0, cannibals: 2 },
      rightBank: { missionaries: 3, cannibals: 1 },
      boat: { position: 'left', missionaries: 0, cannibals: 0 }
    },
    { 
      action: 'Move 2 cannibals from left to right',
      leftBank: { missionaries: 0, cannibals: 0 },
      rightBank: { missionaries: 3, cannibals: 3 },
      boat: { position: 'right', missionaries: 0, cannibals: 0 }
    }
  ];
  
  const hints = solutionSteps.map(step => step.action);
  
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
    document.documentElement.classList.toggle('dark');
  };

  const validateGameState = () => {
    const { leftBank, rightBank } = gameState;
    
    if (leftBank.missionaries > 0 && leftBank.missionaries < leftBank.cannibals) {
      return false;
    }
    
    if (rightBank.missionaries > 0 && rightBank.missionaries < rightBank.cannibals) {
      return false;
    }
    
    return true;
  };
  
  const checkWinCondition = () => {
    return gameState.rightBank.missionaries === 3 && gameState.rightBank.cannibals === 3;
  };
  
  const resetGame = () => {
    if (autoSolveTimeoutRef.current) {
      clearTimeout(autoSolveTimeoutRef.current);
      autoSolveTimeoutRef.current = null;
    }
    
    setGameState({
      leftBank: { missionaries: 3, cannibals: 3 },
      rightBank: { missionaries: 0, cannibals: 0 },
      boat: { missionaries: 0, cannibals: 0, position: 'left' },
      moveCount: 0,
      gameStatus: 'playing',
      difficulty: gameState.difficulty,
      maxMoves: gameState.difficulty === 'easy' ? 15 : 11,
      showHints: gameState.showHints,
      autoSolving: false,
      solutionStep: 0
    });
    setSelectedPassengers({ missionaries: 0, cannibals: 0 });
    toast("Game Reset", { description: "Good luck on your new journey!" });
  };
  
  const toggleDifficulty = () => {
    const newDifficulty = gameState.difficulty === 'easy' ? 'hard' : 'easy';
    const maxMoves = newDifficulty === 'easy' ? 15 : 11;
    
    setGameState(prev => ({
      ...prev,
      difficulty: newDifficulty,
      maxMoves: maxMoves
    }));
    
    toast(`Difficulty set to ${newDifficulty.toUpperCase()}`, { 
      description: `You now have ${maxMoves} moves to complete the puzzle.` 
    });
  };
  
  const toggleHints = () => {
    setGameState(prev => ({
      ...prev,
      showHints: !prev.showHints
    }));
  };
  
  const selectPassenger = (type, bank) => {
    if (gameState.gameStatus !== 'playing' || gameState.autoSolving) return;
    
    if (bank !== gameState.boat.position) return;
    
    const currentBank = gameState[`${bank}Bank`];
    const totalSelected = selectedPassengers.missionaries + selectedPassengers.cannibals;
    
    if (totalSelected >= 2) {
      toast("Boat is full!", { description: "The boat can only carry up to 2 people." });
      return;
    }
    
    if (currentBank[type] <= 0) return;
    
    setSelectedPassengers(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
  };
  
  const deselectPassenger = (type) => {
    if (selectedPassengers[type] > 0 && !gameState.autoSolving) {
      setSelectedPassengers(prev => ({
        ...prev,
        [type]: prev[type] - 1
      }));
    }
  };
  
  const moveBoat = () => {
    if (gameState.autoSolving) return;
    
    const totalPassengers = selectedPassengers.missionaries + selectedPassengers.cannibals;
    
    if (totalPassengers === 0) {
      toast("Boat is empty!", { description: "At least one person must pilot the boat." });
      return;
    }
    
    const currentPosition = gameState.boat.position;
    const newPosition = currentPosition === 'left' ? 'right' : 'left';
    
    const newGameState = {
      ...gameState,
      moveCount: gameState.moveCount + 1,
      boat: {
        ...gameState.boat,
        position: newPosition,
        missionaries: selectedPassengers.missionaries,
        cannibals: selectedPassengers.cannibals,
      },
      leftBank: {
        missionaries: 
          currentPosition === 'left'
            ? gameState.leftBank.missionaries - selectedPassengers.missionaries
            : gameState.leftBank.missionaries + selectedPassengers.missionaries,
        cannibals:
          currentPosition === 'left'
            ? gameState.leftBank.cannibals - selectedPassengers.cannibals
            : gameState.leftBank.cannibals + selectedPassengers.cannibals,
      },
      rightBank: {
        missionaries:
          currentPosition === 'right'
            ? gameState.rightBank.missionaries - selectedPassengers.missionaries
            : gameState.rightBank.missionaries + selectedPassengers.missionaries,
        cannibals:
          currentPosition === 'right'
            ? gameState.rightBank.cannibals - selectedPassengers.cannibals
            : gameState.rightBank.cannibals + selectedPassengers.cannibals,
      }
    };
    
    setGameState(newGameState);
    setSelectedPassengers({ missionaries: 0, cannibals: 0 });
    
    setTimeout(() => {
      if (!validateGameState()) {
        setGameState(prev => ({
          ...prev,
          gameStatus: 'lost'
        }));
        showGamePopup('Mission Failed!', 'Cannibals outnumbered the missionaries!', 'error');
      }
      else if (checkWinCondition()) {
        setGameState(prev => ({
          ...prev,
          gameStatus: 'won'
        }));
        showGamePopup('Victory!', 'You safely transported everyone across the river!', 'success');
      }
      else if (newGameState.moveCount >= newGameState.maxMoves && gameState.difficulty === 'hard') {
        setGameState(prev => ({
          ...prev,
          gameStatus: 'lost'
        }));
        showGamePopup('Mission Failed!', `You exceeded the ${newGameState.maxMoves} move limit!`, 'error');
      }
    }, 1000);
  };
  
  const showGamePopup = (title, description, type = 'info') => {
    setPopupMessage({ title, description, type });
    setShowPopup(true);
    
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };
  
  const autoSolve = () => {
    resetGame();
    
    setGameState(prev => ({
      ...prev,
      autoSolving: true,
      solutionStep: 0
    }));
    
    toast("Auto-solving puzzle...", { 
      description: "Watch carefully as the optimal solution unfolds step by step!" 
    });
    
    executeNextSolutionStep();
  };

  const executeNextSolutionStep = () => {
    const { solutionStep } = gameState;
    
    if (solutionStep >= solutionSteps.length) {
      setGameState(prev => ({ 
        ...prev, 
        autoSolving: false,
        gameStatus: 'won'
      }));
      showGamePopup('Puzzle Solved!', 'The optimal solution takes 11 moves.', 'success');
      return;
    }
    
    toast(solutionSteps[solutionStep].action, { 
      description: `Move ${solutionStep + 1} of ${solutionSteps.length}` 
    });
    
    setGameState(prev => ({
      ...prev,
      leftBank: { ...solutionSteps[solutionStep].leftBank },
      rightBank: { ...solutionSteps[solutionStep].rightBank },
      boat: { ...solutionSteps[solutionStep].boat },
      moveCount: solutionStep + 1,
      solutionStep: solutionStep + 1
    }));
    
    autoSolveTimeoutRef.current = setTimeout(() => {
      executeNextSolutionStep();
    }, 2000);
  };
  
  const stopAutoSolve = () => {
    if (autoSolveTimeoutRef.current) {
      clearTimeout(autoSolveTimeoutRef.current);
      autoSolveTimeoutRef.current = null;
    }
    
    setGameState(prev => ({
      ...prev,
      autoSolving: false
    }));
    
    toast("Auto-solve stopped", { 
      description: "You can continue playing from this point." 
    });
  };
  
  useEffect(() => {
    return () => {
      if (autoSolveTimeoutRef.current) {
        clearTimeout(autoSolveTimeoutRef.current);
      }
    };
  }, []);

  const renderBank = (side) => {
    const bank = gameState[`${side}Bank`];
    const isBoatHere = gameState.boat.position === side;
    const canSelect = isBoatHere && gameState.gameStatus === 'playing' && !gameState.autoSolving;
    
    return (
      <div className={`relative h-32 md:h-48 ${side === 'left' ? 'rounded-l-lg' : 'rounded-r-lg'} 
        flex flex-col justify-end items-center p-2 md:p-4 
        bg-gradient-to-b from-game-bank to-game-bank/80 
        dark:from-game-bankDark dark:to-game-bankDark/80`}>
        <h3 className="text-xs md:text-lg font-bold mb-1 md:mb-2 text-green-800 dark:text-green-300">
          {side.charAt(0).toUpperCase() + side.slice(1)} Bank
        </h3>
        <div className="flex flex-wrap gap-1 md:gap-2 mb-1 md:mb-2 justify-center">
          {Array(bank.missionaries).fill(0).map((_, i) => (
            <div 
              key={`m-${i}`} 
              className={`w-6 h-6 md:w-12 md:h-12 flex items-center justify-center text-sm md:text-xl rounded-full 
                ${canSelect ? 'cursor-pointer active:scale-95 hover:scale-110 transform transition-transform' : ''} 
                bg-gradient-to-br from-blue-400 to-blue-600 text-white 
                dark:from-blue-700 dark:to-blue-900 shadow-md animate-bounce-subtle`}
              style={{ animationDelay: `${i * 0.2}s` }}
              onClick={() => canSelect ? selectPassenger('missionaries', side) : null}
            >
              👨‍🦳
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-1 md:gap-2 justify-center">
          {Array(bank.cannibals).fill(0).map((_, i) => (
            <div 
              key={`c-${i}`} 
              className={`w-6 h-6 md:w-12 md:h-12 flex items-center justify-center text-sm md:text-xl rounded-full 
                ${canSelect ? 'cursor-pointer active:scale-95 hover:scale-110 transform transition-transform' : ''} 
                bg-gradient-to-br from-red-400 to-red-600 text-white 
                dark:from-red-700 dark:to-red-900 shadow-md animate-bounce-subtle`}
              style={{ animationDelay: `${i * 0.2}s` }}
              onClick={() => canSelect ? selectPassenger('cannibals', side) : null}
            >
              🧟
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBoat = () => {
    const { boat, gameStatus } = gameState;
    const isMoving = selectedPassengers.missionaries > 0 || selectedPassengers.cannibals > 0;
    
    return (
      <div 
        className={`absolute bottom-2 ${boat.position === 'left' ? 'boat-left' : 'boat-right'} 
          transition-all duration-700 ease-in-out animate-boat-rock`}
      >
        <div 
          className={`w-20 h-8 md:w-32 md:h-14 rounded-b-full relative 
            bg-gradient-to-b from-game-boat to-game-boat/80
            dark:from-game-boatDark dark:to-game-boatDark/80
            ${isMoving ? 'scale-105' : ''} 
            transition-transform duration-300
            ${gameStatus === 'playing' && !gameState.autoSolving ? 'cursor-pointer hover:scale-105' : ''}
            shadow-md`}
          onClick={() => {
            if (gameStatus === 'playing' && !gameState.autoSolving) {
              moveBoat();
            }
          }}
        >
          <div className="absolute -top-6 md:-top-8 left-1 md:left-2 flex gap-1">
            {Array(selectedPassengers.missionaries).fill(0).map((_, i) => (
              <div 
                key={`selected-m-${i}`} 
                className="w-5 h-5 md:w-9 md:h-9 flex items-center justify-center text-xs md:text-base rounded-full 
                  bg-gradient-to-br from-blue-400 to-blue-600 text-white 
                  dark:from-blue-700 dark:to-blue-900 shadow-md 
                  cursor-pointer hover:scale-110 active:scale-95 transform transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                  deselectPassenger('missionaries');
                }}
              >
                👨‍🦳
              </div>
            ))}
          </div>
          
          <div className="absolute -top-6 md:-top-8 right-1 md:right-2 flex gap-1">
            {Array(selectedPassengers.cannibals).fill(0).map((_, i) => (
              <div 
                key={`selected-c-${i}`} 
                className="w-5 h-5 md:w-9 md:h-9 flex items-center justify-center text-xs md:text-base rounded-full 
                  bg-gradient-to-br from-red-400 to-red-600 text-white 
                  dark:from-red-700 dark:to-red-900 shadow-md 
                  cursor-pointer hover:scale-110 active:scale-95 transform transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                  deselectPassenger('cannibals');
                }}
              >
                🧟
              </div>
            ))}
          </div>
          
          <div className={`absolute ${boat.position === 'left' ? 'right-1' : 'left-1'} -top-3 h-6 w-1 md:h-8 md:w-1.5 bg-amber-900 dark:bg-amber-800`}></div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gradient-to-br from-purple-100 via-blue-100 to-green-100 dark:from-gray-900 dark:via-blue-900/30 dark:to-green-900/30 min-h-screen pb-20">
        <div className="container mx-auto p-2 md:p-4 max-w-4xl">
          <header className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-6 animate-fade-in gap-2">
            <h1 className="text-xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400 text-center md:text-left">
              {isMobile ? 'River Escape' : 'River Escape: Missionaries vs Cannibals'}
            </h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={toggleDarkMode} className="rounded-full hover:rotate-90 transition-transform duration-300">
                {darkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
              </Button>
            </div>
          </header>

          <Card className="mb-4 md:mb-6 p-3 md:p-4 glass-card animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 mb-3 md:mb-4">
              <div className="flex items-center gap-2 w-full md:w-auto justify-between">
                <h2 className="text-lg md:text-xl font-bold">Controls</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  gameState.difficulty === 'easy' 
                    ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' 
                    : 'bg-gradient-to-r from-red-400 to-red-500 text-white'
                }`}>
                  {gameState.difficulty.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto justify-between">
                <span className="text-sm font-medium">Hard Mode</span>
                <Switch 
                  checked={gameState.difficulty === 'hard'} 
                  onCheckedChange={toggleDifficulty}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm md:text-base"
                onClick={resetGame}
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm md:text-base"
                onClick={toggleHints}
              >
                <HelpCircle className="h-4 w-4" /> {gameState.showHints ? 'Hide Hints' : 'Hints'}
              </Button>
              {!gameState.autoSolving ? (
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm md:text-base col-span-2 md:col-span-1"
                  onClick={autoSolve}
                >
                  <Play className="h-4 w-4" /> Auto Solve
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900 transition-colors text-sm md:text-base col-span-2 md:col-span-1"
                  onClick={stopAutoSolve}
                >
                  <Square className="h-4 w-4" /> Stop
                </Button>
              )}
            </div>
          </Card>

          <div className="flex justify-between items-center mb-3 md:mb-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm md:text-base">Moves:</span>
              <span className="px-2 md:px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full font-medium text-sm md:text-base">
                {gameState.moveCount} / {gameState.maxMoves}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm md:text-base">Status:</span>
              <span className={`px-2 md:px-3 py-1 rounded-full font-medium text-sm md:text-base ${
                gameState.gameStatus === 'playing' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' 
                  : gameState.gameStatus === 'won'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
              }`}>
                {gameState.gameStatus === 'playing' ? 'In Progress' : 
                 gameState.gameStatus === 'won' ? 'Victory!' : 'Failed'}
              </span>
            </div>
          </div>

          <div className="relative mb-4 md:mb-6">
            <div className="game-area h-48 md:h-64 flex rounded-lg overflow-hidden shadow-2xl animate-fade-in">
              {renderBank('left')}
              
              <div className="h-full flex-grow relative bg-gradient-to-r from-game-river via-blue-400 to-game-river dark:from-game-riverDark dark:via-blue-700 dark:to-game-riverDark flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNIDAgMTAwIHEgNTAgLTUwIDEwMCAwIHQgMTAwIDAgIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+')] animate-[wave_10s_linear_infinite] opacity-30"></div>
                <div className="absolute top-0 left-0 right-0 text-center -mt-4 md:-mt-6">
                  <p className="text-xs md:text-sm font-medium bg-white/70 dark:bg-black/70 inline-block px-2 md:px-3 py-1 rounded-full shadow-lg">
                    {gameState.boat.position === 'left' 
                      ? gameState.autoSolving 
                        ? 'Auto-solving...' 
                        : 'Select from left'
                      : gameState.autoSolving 
                        ? 'Auto-solving...'
                        : 'Select from right'}
                  </p>
                </div>
                {renderBoat()}
              </div>
              
              {renderBank('right')}
            </div>
            
            <div className="mt-3 md:mt-4 flex justify-center">
              <Button
                disabled={gameState.gameStatus !== 'playing' || gameState.autoSolving}
                onClick={moveBoat}
                className="w-full md:w-auto px-4 md:px-6 py-2 bg-gradient-to-r from-blue-500 to-green-500 
                  hover:from-blue-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl 
                  transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 
                  flex items-center justify-center gap-2 text-sm md:text-base"
              >
                Move Boat {gameState.boat.position === 'left' ? 'Right' : 'Left'} 
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Card className="p-4 md:p-6 glass-card animate-fade-in">
            <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400">
              Game Rules
            </h2>
            <ul className="list-none space-y-1.5 md:space-y-2 text-sm md:text-base">
              {[
                "Move all 3 Missionaries and 3 Cannibals across.",
                "Boat carries 1-2 people, can't move empty.",
                "Missionaries can't be outnumbered by Cannibals.",
                "Tap characters to select/deselect for boat.",
                "Tap boat or button to cross river.",
                "Hard Mode: Solve in 11 moves."
              ].map((rule, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-blue-500 dark:text-blue-400">•</span>
                  {rule}
                </li>
              ))}
            </ul>
          </Card>

          {showPopup && (
            <div className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in">
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowPopup(false)}></div>
              <Alert 
                className={`w-80 shadow-2xl border-2 ${
                  popupMessage.type === 'success' 
                    ? 'border-green-400 bg-green-50 dark:bg-green-900/30' 
                    : popupMessage.type === 'error'
                    ? 'border-red-400 bg-red-50 dark:bg-red-900/30'
                    : 'border-blue-400 bg-blue-50 dark:bg-blue-900/30'
                }`}
              >
                <AlertTitle className={`text-xl font-bold ${
                  popupMessage.type === 'success' 
                    ? 'text-green-600 dark:text-green-300' 
                    : popupMessage.type === 'error'
                    ? 'text-red-600 dark:text-red-300'
                    : 'text-blue-600 dark:text-blue-300'
                }`}>
                  {popupMessage.title}
                </AlertTitle>
                <AlertDescription className="text-gray-700 dark:text-gray-300">
                  {popupMessage.description}
                </AlertDescription>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" onClick={() => setShowPopup(false)}>Close</Button>
                </div>
              </Alert>
            </div>
          )}
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 py-2 px-4 shadow-lg">
        <div className="container mx-auto flex flex-wrap justify-center md:justify-between items-center gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span>Created by Lucky Yaduvanshi</span>
            <a href="https://github.com/LuckyYaduvanshi5" target="_blank" rel="noopener noreferrer" 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span>GitHub</span>
              </div>
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span>More Puzzles:</span>
            <a href="https://luckyyaduvanshi5.github.io/WaterJugPuzzle/" target="_blank" rel="noopener noreferrer" 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">Water Jug</a>
            <a href="https://luckyyaduvanshi5.github.io/MonkeyBananaPuzzle/" target="_blank" rel="noopener noreferrer" 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">Monkey Banana</a>
            <a href="https://luckyyaduvanshi5.github.io/Portfolio/" target="_blank" rel="noopener noreferrer" 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">Portfolio</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Game;
