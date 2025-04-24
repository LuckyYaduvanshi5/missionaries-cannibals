import React, { useState, useEffect, useRef } from 'react';
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
  // Game state
  const [gameState, setGameState] = useState({
    leftBank: { missionaries: 3, cannibals: 3 },
    rightBank: { missionaries: 0, cannibals: 0 },
    boat: { missionaries: 0, cannibals: 0, position: 'left' },
    moveCount: 0,
    gameStatus: 'playing', // 'playing', 'won', 'lost'
    difficulty: 'easy', // 'easy', 'hard'
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
  
  // Solution steps for the classic Missionaries and Cannibals problem
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
  
  // Hints for optimal solution - updated to match solution steps
  const hints = solutionSteps.map(step => step.action);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
    document.documentElement.classList.toggle('dark');
  };

  // Game logic functions
  const validateGameState = () => {
    const { leftBank, rightBank } = gameState;
    
    // Check left bank
    if (leftBank.missionaries > 0 && leftBank.missionaries < leftBank.cannibals) {
      return false;
    }
    
    // Check right bank
    if (rightBank.missionaries > 0 && rightBank.missionaries < rightBank.cannibals) {
      return false;
    }
    
    return true;
  };
  
  const checkWinCondition = () => {
    return gameState.rightBank.missionaries === 3 && gameState.rightBank.cannibals === 3;
  };
  
  const resetGame = () => {
    // Clear any auto-solve timeout
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
  
  // Passenger selection
  const selectPassenger = (type, bank) => {
    // Can't select if game is over or auto-solving
    if (gameState.gameStatus !== 'playing' || gameState.autoSolving) return;
    
    // Can only select from the bank where the boat is
    if (bank !== gameState.boat.position) return;
    
    const currentBank = gameState[`${bank}Bank`];
    const totalSelected = selectedPassengers.missionaries + selectedPassengers.cannibals;
    
    // Check if we can select more
    if (totalSelected >= 2) {
      toast("Boat is full!", { description: "The boat can only carry up to 2 people." });
      return;
    }
    
    // Check if there are people of this type available
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
  
  // Move boat
  const moveBoat = () => {
    // Can't move during auto-solve
    if (gameState.autoSolving) return;
    
    const totalPassengers = selectedPassengers.missionaries + selectedPassengers.cannibals;
    
    // Boat can't move empty
    if (totalPassengers === 0) {
      toast("Boat is empty!", { description: "At least one person must pilot the boat." });
      return;
    }
    
    // Update banks and boat
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
    
    // Set state and clear selected passengers
    setGameState(newGameState);
    setSelectedPassengers({ missionaries: 0, cannibals: 0 });
    
    // Check game state after move
    setTimeout(() => {
      // Check if rules are broken
      if (!validateGameState()) {
        setGameState(prev => ({
          ...prev,
          gameStatus: 'lost'
        }));
        showGamePopup('Mission Failed!', 'Cannibals outnumbered the missionaries!', 'error');
      }
      // Check win condition
      else if (checkWinCondition()) {
        setGameState(prev => ({
          ...prev,
          gameStatus: 'won'
        }));
        showGamePopup('Victory!', 'You safely transported everyone across the river!', 'success');
      }
      // Check move limit on hard mode
      else if (newGameState.moveCount >= newGameState.maxMoves && gameState.difficulty === 'hard') {
        setGameState(prev => ({
          ...prev,
          gameStatus: 'lost'
        }));
        showGamePopup('Mission Failed!', `You exceeded the ${newGameState.maxMoves} move limit!`, 'error');
      }
    }, 1000);
  };
  
  // Show popup message
  const showGamePopup = (title, description, type = 'info') => {
    setPopupMessage({ title, description, type });
    setShowPopup(true);
    
    // Auto-hide the popup after 3 seconds
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };
  
  // Auto solve function - execute solution step by step
  const autoSolve = () => {
    // Reset the game first
    resetGame();
    
    // Set autoSolving flag
    setGameState(prev => ({
      ...prev,
      autoSolving: true,
      solutionStep: 0
    }));
    
    toast("Auto-solving puzzle...", { 
      description: "Watch carefully as the optimal solution unfolds step by step!" 
    });
    
    // Execute the next step in the solution
    executeNextSolutionStep();
  };

  const executeNextSolutionStep = () => {
    const { solutionStep } = gameState;
    
    // If we've reached the end of the solution, mark the game as won
    if (solutionStep >= solutionSteps.length) {
      setGameState(prev => ({ 
        ...prev, 
        autoSolving: false,
        gameStatus: 'won'
      }));
      showGamePopup('Puzzle Solved!', 'The optimal solution takes 11 moves.', 'success');
      return;
    }
    
    // Show what's happening in this step
    toast(solutionSteps[solutionStep].action, { 
      description: `Move ${solutionStep + 1} of ${solutionSteps.length}` 
    });
    
    // Update the game state to the next step in the solution
    setGameState(prev => ({
      ...prev,
      leftBank: { ...solutionSteps[solutionStep].leftBank },
      rightBank: { ...solutionSteps[solutionStep].rightBank },
      boat: { ...solutionSteps[solutionStep].boat },
      moveCount: solutionStep + 1,
      solutionStep: solutionStep + 1
    }));
    
    // Schedule the next step
    autoSolveTimeoutRef.current = setTimeout(() => {
      executeNextSolutionStep();
    }, 2000); // 2 seconds between moves
  };
  
  // Stop auto-solving
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
  
  // Clean up any timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSolveTimeoutRef.current) {
        clearTimeout(autoSolveTimeoutRef.current);
      }
    };
  }, []);

  // Render bank with people
  const renderBank = (side) => {
    const bank = gameState[`${side}Bank`];
    const isBoatHere = gameState.boat.position === side;
    const canSelect = isBoatHere && gameState.gameStatus === 'playing' && !gameState.autoSolving;
    
    return (
      <div className={`relative h-48 ${side === 'left' ? 'rounded-l-lg' : 'rounded-r-lg'} flex flex-col justify-end items-center p-4 bg-gradient-to-b from-game-bank to-game-bank/80 dark:from-game-bankDark dark:to-game-bankDark/80`}>
        <h3 className="text-lg font-bold mb-2 text-green-800 dark:text-green-300">{side.charAt(0).toUpperCase() + side.slice(1)} Bank</h3>
        <div className="flex gap-2 mb-2">
          {Array(bank.missionaries).fill(0).map((_, i) => (
            <div 
              key={`m-${i}`} 
              className={`w-12 h-12 flex items-center justify-center text-xl rounded-full ${
                canSelect ? 'cursor-pointer hover:scale-110 transform transition-transform' : ''
              } bg-gradient-to-br from-blue-400 to-blue-600 text-white dark:from-blue-700 dark:to-blue-900 shadow-md`}
              onClick={() => canSelect ? selectPassenger('missionaries', side) : null}
            >
              👨‍🦳
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          {Array(bank.cannibals).fill(0).map((_, i) => (
            <div 
              key={`c-${i}`} 
              className={`w-12 h-12 flex items-center justify-center text-xl rounded-full ${
                canSelect ? 'cursor-pointer hover:scale-110 transform transition-transform' : ''
              } bg-gradient-to-br from-red-400 to-red-600 text-white dark:from-red-700 dark:to-red-900 shadow-md`}
              onClick={() => canSelect ? selectPassenger('cannibals', side) : null}
            >
              🧟
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render boat with selected people
  const renderBoat = () => {
    const boatPosition = gameState.boat.position;
    const animationClass = boatPosition === 'left' ? 'boat-left' : 'boat-right';
    
    return (
      <div className={`boat ${animationClass} w-32 h-24 absolute bottom-2 transition-all duration-1000 flex flex-col items-center animate-boat-rock`}>
        <div className="flex gap-2 mb-1">
          {/* Selected passengers */}
          {Array(selectedPassengers.missionaries).fill(0).map((_, i) => (
            <div 
              key={`bm-${i}`} 
              className="w-10 h-10 flex items-center justify-center text-lg rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white cursor-pointer hover:bg-blue-600 dark:from-blue-700 dark:to-blue-900 shadow-md transform transition-transform hover:scale-105"
              onClick={() => deselectPassenger('missionaries')}
            >
              👨‍🦳
            </div>
          ))}
          {Array(selectedPassengers.cannibals).fill(0).map((_, i) => (
            <div 
              key={`bc-${i}`} 
              className="w-10 h-10 flex items-center justify-center text-lg rounded-full bg-gradient-to-br from-red-400 to-red-600 text-white cursor-pointer hover:bg-red-600 dark:from-red-700 dark:to-red-900 shadow-md transform transition-transform hover:scale-105"
              onClick={() => deselectPassenger('cannibals')}
            >
              🧟
            </div>
          ))}
        </div>
        <div 
          className="boat-shape w-32 h-16 bg-gradient-to-b from-game-boat to-game-boatDark rounded-b-xl rounded-t-md flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow transform hover:scale-105"
          onClick={moveBoat}
        >
          <span role="img" aria-label="boat" className="text-2xl">🚣</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gradient-to-br from-purple-100 via-blue-100 to-green-100 dark:from-gray-900 dark:via-blue-900/30 dark:to-green-900/30 min-h-screen">
        <div className="container mx-auto p-4 max-w-4xl">
          <header className="flex justify-between items-center mb-6 animate-fade-in">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400">
              River Escape: Missionaries vs Cannibals
            </h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={toggleDarkMode} className="rounded-full hover:rotate-90 transition-transform duration-300">
                {darkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
              </Button>
            </div>
          </header>

          <Card className="mb-6 p-4 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">Game Controls</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  gameState.difficulty === 'easy' 
                    ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' 
                    : 'bg-gradient-to-r from-red-400 to-red-500 text-white'
                }`}>
                  {gameState.difficulty.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Hard Mode</span>
                <Switch 
                  checked={gameState.difficulty === 'hard'} 
                  onCheckedChange={toggleDifficulty}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={resetGame}
              >
                <RotateCcw className="h-4 w-4" /> Reset Game
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={toggleHints}
              >
                <HelpCircle className="h-4 w-4" /> {gameState.showHints ? 'Hide Hints' : 'Show Hints'}
              </Button>
              {!gameState.autoSolving ? (
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={autoSolve}
                >
                  <Play className="h-4 w-4" /> Auto Solve
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                  onClick={stopAutoSolve}
                >
                  <Square className="h-4 w-4" /> Stop Auto Solve
                </Button>
              )}
            </div>
          </Card>

          <div className="flex justify-between items-center mb-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="font-medium">Moves:</span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full font-medium">
                {gameState.moveCount} / {gameState.maxMoves}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <span className={`px-3 py-1 rounded-full font-medium ${
                gameState.gameStatus === 'playing' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' 
                  : gameState.gameStatus === 'won'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
              }`}>
                {gameState.gameStatus === 'playing' ? 'In Progress' : 
                 gameState.gameStatus === 'won' ? 'Victory!' : 'Mission Failed'}
              </span>
            </div>
          </div>
          
          {gameState.showHints && gameState.gameStatus === 'playing' && (
            <Card className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border-yellow-200 dark:border-yellow-800 animate-fade-in">
              <h3 className="font-medium mb-2 flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <Award className="h-4 w-4" /> Hint
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">{hints[Math.min(gameState.moveCount, hints.length - 1)]}</p>
            </Card>
          )}
          
          <div className="relative mb-6">
            <div className="game-area h-64 flex rounded-lg overflow-hidden shadow-2xl animate-fade-in">
              {/* Left bank */}
              {renderBank('left')}
              
              {/* River */}
              <div className="h-full flex-grow relative bg-gradient-to-r from-game-river via-blue-400 to-game-river dark:from-game-riverDark dark:via-blue-700 dark:to-game-riverDark flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNIDAgMTAwIHEgNTAgLTUwIDEwMCAwIHQgMTAwIDAgIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+')] animate-[wave_10s_linear_infinite] opacity-30"></div>
                {renderBoat()}
                <div className="absolute top-0 left-0 right-0 text-center -mt-6">
                  <p className="text-sm font-medium bg-white/70 dark:bg-black/70 inline-block px-3 py-1 rounded-full shadow-lg">
                    {gameState.boat.position === 'left' 
                      ? gameState.autoSolving 
                        ? 'Auto-solving in progress...' 
                        : 'Select passengers from the left bank'
                      : gameState.autoSolving 
                        ? 'Auto-solving in progress...'
                        : 'Select passengers from the right bank'}
                  </p>
                </div>
              </div>
              
              {/* Right bank */}
              {renderBank('right')}
            </div>
            
            <div className="mt-4 flex justify-center">
              <Button
                disabled={gameState.gameStatus !== 'playing' || gameState.autoSolving}
                onClick={moveBoat}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 flex items-center gap-2"
              >
                Move Boat {gameState.boat.position === 'left' ? 'to Right' : 'to Left'} 
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl animate-fade-in">
            <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400">Game Rules</h2>
            <ul className="list-none space-y-2">
              {[
                "Move all 3 Missionaries and 3 Cannibals across the river.",
                "The boat can carry 1 or 2 people and cannot move empty.",
                "Missionaries cannot be outnumbered by Cannibals on either side.",
                "Click on characters to select/deselect them for the boat.",
                "Click on the boat or the \"Move Boat\" button to cross the river.",
                "In Hard Mode, you must solve the puzzle in 11 moves."
              ].map((rule, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-blue-500 dark:text-blue-400">•</span>
                  {rule}
                </li>
              ))}
            </ul>
          </Card>

          {/* Game state popup */}
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
    </div>
  );
};

export default Game;
