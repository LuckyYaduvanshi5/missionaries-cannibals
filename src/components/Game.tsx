
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Menu, Moon, Sun, HelpCircle, RotateCcw, Award, Zap } from "lucide-react";

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
  });
  
  const [darkMode, setDarkMode] = useState(false);
  const [selectedPassengers, setSelectedPassengers] = useState({ missionaries: 0, cannibals: 0 });
  
  // Hints for optimal solution
  const hints = [
    "Start by sending 2 cannibals across",
    "Return 1 cannibal back",
    "Send 2 cannibals across",
    "Return 1 cannibal back",
    "Send 2 missionaries across",
    "Return 1 missionary and 1 cannibal back",
    "Send 2 missionaries across",
    "Return 1 cannibal back",
    "Send 2 cannibals across",
    "Return 1 cannibal back",
    "Send 2 cannibals across"
  ];
  
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
    setGameState({
      leftBank: { missionaries: 3, cannibals: 3 },
      rightBank: { missionaries: 0, cannibals: 0 },
      boat: { missionaries: 0, cannibals: 0, position: 'left' },
      moveCount: 0,
      gameStatus: 'playing',
      difficulty: gameState.difficulty,
      maxMoves: gameState.difficulty === 'easy' ? 15 : 11,
      showHints: gameState.showHints,
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
    // Can't select if game is over
    if (gameState.gameStatus !== 'playing') return;
    
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
    if (selectedPassengers[type] > 0) {
      setSelectedPassengers(prev => ({
        ...prev,
        [type]: prev[type] - 1
      }));
    }
  };
  
  // Move boat
  const moveBoat = () => {
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
        toast.error("Mission Failed!", { description: "Cannibals outnumbered the missionaries!" });
      }
      // Check win condition
      else if (checkWinCondition()) {
        setGameState(prev => ({
          ...prev,
          gameStatus: 'won'
        }));
        toast.success("Victory!", { description: "You safely transported everyone across the river!" });
      }
      // Check move limit on hard mode
      else if (newGameState.moveCount >= newGameState.maxMoves && gameState.difficulty === 'hard') {
        setGameState(prev => ({
          ...prev,
          gameStatus: 'lost'
        }));
        toast.error("Mission Failed!", { description: `You exceeded the ${newGameState.maxMoves} move limit!` });
      }
    }, 1000);
  };
  
  // Auto solve function
  const autoSolve = () => {
    resetGame();
    toast("Auto-solving puzzle...");
    
    // We'll implement an animation that shows the optimal solution
    // For now, just show the winning state
    setTimeout(() => {
      setGameState({
        leftBank: { missionaries: 0, cannibals: 0 },
        rightBank: { missionaries: 3, cannibals: 3 },
        boat: { missionaries: 0, cannibals: 0, position: 'right' },
        moveCount: 11,
        gameStatus: 'won',
        difficulty: gameState.difficulty,
        maxMoves: gameState.maxMoves,
        showHints: gameState.showHints,
      });
      toast.success("Puzzle solved!", { description: "The optimal solution takes 11 moves." });
    }, 1500);
  };

  // Render bank with people
  const renderBank = (side) => {
    const bank = gameState[`${side}Bank`];
    const isBoatHere = gameState.boat.position === side;
    const canSelect = isBoatHere && gameState.gameStatus === 'playing';
    
    return (
      <div className={`relative h-40 ${side === 'left' ? 'rounded-l-lg' : 'rounded-r-lg'} flex flex-col justify-end items-center p-4 bg-gradient-to-b from-green-200 to-green-300 dark:from-green-900 dark:to-green-800`}>
        <h3 className="text-lg font-bold mb-2">{side.charAt(0).toUpperCase() + side.slice(1)} Bank</h3>
        <div className="flex gap-2 mb-2">
          {Array(bank.missionaries).fill(0).map((_, i) => (
            <div 
              key={`m-${i}`} 
              className={`w-10 h-10 flex items-center justify-center text-lg rounded-full ${
                canSelect ? 'cursor-pointer hover:scale-110 transition-transform' : ''
              } bg-blue-500 text-white dark:bg-blue-700`}
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
              className={`w-10 h-10 flex items-center justify-center text-lg rounded-full ${
                canSelect ? 'cursor-pointer hover:scale-110 transition-transform' : ''
              } bg-red-500 text-white dark:bg-red-700`}
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
      <div className={`boat ${animationClass} w-32 h-20 absolute bottom-2 transition-all duration-1000 flex flex-col items-center`}>
        <div className="flex gap-2 mb-1">
          {/* Selected passengers */}
          {Array(selectedPassengers.missionaries).fill(0).map((_, i) => (
            <div 
              key={`bm-${i}`} 
              className="w-10 h-10 flex items-center justify-center text-lg rounded-full bg-blue-500 text-white cursor-pointer hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
              onClick={() => deselectPassenger('missionaries')}
            >
              👨‍🦳
            </div>
          ))}
          {Array(selectedPassengers.cannibals).fill(0).map((_, i) => (
            <div 
              key={`bc-${i}`} 
              className="w-10 h-10 flex items-center justify-center text-lg rounded-full bg-red-500 text-white cursor-pointer hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800"
              onClick={() => deselectPassenger('cannibals')}
            >
              🧟
            </div>
          ))}
        </div>
        <div className="boat-shape w-32 h-12 bg-yellow-800 dark:bg-yellow-900 rounded-b-xl rounded-t-md flex items-center justify-center">
          <span role="img" aria-label="boat" className="text-xl">🚣</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''} bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800`}>
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
            <Button 
              variant="outline" 
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={autoSolve}
            >
              <Zap className="h-4 w-4" /> Auto Solve
            </Button>
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
          <div className="game-area h-60 flex rounded-lg overflow-hidden shadow-2xl animate-fade-in">
            {/* Left bank */}
            {renderBank('left')}
            
            {/* River */}
            <div className="h-full flex-grow relative bg-gradient-to-r from-blue-300 via-blue-400 to-blue-300 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 flex items-center justify-center">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNIDAgMTAwIHEgNTAgLTUwIDEwMCAwIHQgMTAwIDAgIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+')] animate-[wave_10s_linear_infinite] opacity-30"></div>
              {renderBoat()}
              <div className="absolute top-0 left-0 right-0 text-center -mt-6">
                <p className="text-sm font-medium bg-white/70 dark:bg-black/70 inline-block px-3 py-1 rounded-full shadow-lg">
                  {gameState.boat.position === 'left' ? 'Select passengers from the left bank' : 'Select passengers from the right bank'}
                </p>
              </div>
            </div>
            
            {/* Right bank */}
            {renderBank('right')}
          </div>
          
          <div className="mt-4 flex justify-center">
            <Button
              disabled={gameState.gameStatus !== 'playing'}
              onClick={moveBoat}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500"
            >
              Move Boat {gameState.boat.position === 'left' ? 'to Right' : 'to Left'}
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
              "Click "Move Boat" to cross the river.",
              "In Hard Mode, you must solve the puzzle in 11 moves."
            ].map((rule, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-blue-500 dark:text-blue-400">•</span>
                {rule}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Game;
