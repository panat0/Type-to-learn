import React, { useState, useEffect } from 'react';

// Score Modal Component
const ScoreModal = ({ score, level, onClose, onRestart }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gray-800 border-4 border-green-400 rounded-lg p-4 sm:p-6 lg:p-8 text-center w-full max-w-xs sm:max-w-md shadow-2xl">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-400 mb-2 sm:mb-4" style={{ fontFamily: 'monospace, "Courier New", Courier' }}>
          คะแนน {score}
        </h2>
        <p className="text-white text-lg sm:text-xl lg:text-2xl mb-4 sm:mb-6" style={{ fontFamily: 'monospace, "Courier New", Courier' }}>
          ระดับ: {level}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center">
          <button
            onClick={onRestart}
            className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white border-2 border-orange-300 rounded-lg text-base sm:text-lg lg:text-xl font-bold transition-all hover:scale-105 transform"
            style={{ fontFamily: 'monospace, "Courier New", Courier' }}
          >
            หน้าหลัก
          </button>
          <button
            onClick={onClose}
            className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 bg-green-500 hover:bg-green-600 text-white border-2 border-green-300 rounded-lg text-base sm:text-lg lg:text-xl font-bold transition-all hover:scale-105 transform"
            style={{ fontFamily: 'monospace, "Courier New", Courier' }}
          >
            เล่นต่อ
          </button>
        </div>
      </div>
    </div>
  );
};

// Level Selector Component
const LevelSelector = ({ onLevelChange }) => {
  const levels = [
    { id: 'easy', name: 'Easy', color: 'bg-green-500 hover:bg-green-600 border-green-300' },
    { id: 'medium', name: 'Medium', color: 'bg-cyan-500 hover:bg-cyan-600 border-cyan-300' },
    { id: 'hard', name: 'TOEIC', color: 'bg-red-500 hover:bg-red-600 border-red-300' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center text-white p-2 sm:p-4">
      <h1
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 lg:mb-12 text-center text-green-400 drop-shadow-lg"
        style={{ fontFamily: 'monospace, "Courier New", Courier' }}
      >
        TYPE TO LEARN
      </h1>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 w-full max-w-xs sm:max-w-none justify-center px-4">
        {levels.map(level => (
          <button
            key={level.id}
            onClick={() => onLevelChange(level.id)}
            className={`px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-white font-bold border-4 rounded-lg transition-all hover:scale-105 transform text-base sm:text-lg lg:text-xl ${level.color} w-full sm:w-auto shadow-lg`}
            style={{ fontFamily: 'monospace, "Courier New", Courier' }}
          >
            {level.name}
          </button>
        ))}
      </div>
    </div>
  );
};

// Game Component
const GameScreen = ({ level, onShowScore, score, wordsData, onStop }) => {
  const [currentWord, setCurrentWord] = useState(null);
  const [input, setInput] = useState('');
  const [nextWord, setNextWord] = useState(null);
  const [previousWord, setPreviousWord] = useState(null);
  const [currentStep, setCurrentStep] = useState('english'); // 'english' or 'thai'
  const [wordQueue, setWordQueue] = useState([]); // Queue of shuffled words
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isError, setIsError] = useState(false);

  // Detect mobile/tablet devices
  useEffect(() => {
    const checkIsMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initializeWordQueue = (level) => {
    // Map level names correctly
    const levelMap = {
      'hard': 'toeic',
      'easy': 'easy',
      'medium': 'medium'
    };
    const targetLevel = levelMap[level] || level;
    const levelWords = wordsData.filter(word => word.level === targetLevel);
    const shuffled = shuffleArray(levelWords);
    setWordQueue(shuffled);
    setCurrentIndex(0);
    return shuffled;
  };

  // Add level as dependency for getNextWord function
  const getNextWordForLevel = (levelParam) => {
    if (currentIndex >= wordQueue.length) {
      // Reshuffle when we reach the end
      const levelWords = wordsData.filter(word => word.level === levelParam);
      const newQueue = shuffleArray(levelWords);
      setWordQueue(newQueue);
      setCurrentIndex(1);
      return newQueue[0];
    } else {
      const word = wordQueue[currentIndex];
      setCurrentIndex(prev => prev + 1);
      return word;
    }
  };

  useEffect(() => {
    if (wordsData.length > 0) {
      const queue = initializeWordQueue(level);
      if (queue.length >= 2) {
        setCurrentWord(queue[0]);
        setNextWord(queue[1]);
        setCurrentIndex(2);
      } else if (queue.length === 1) {
        setCurrentWord(queue[0]);
        setNextWord(null);
        setCurrentIndex(1);
      }
      setPreviousWord(null);
      setCurrentStep('english');
      setIsError(false); // Reset error state when changing words
    }
  }, [level, wordsData]);

  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    // Check for errors in real-time
    if (currentStep === 'english') {
      const targetWord = currentWord?.en.toLowerCase() || '';
      const userInput = value.toLowerCase();

      if (userInput.length > 0 && !targetWord.startsWith(userInput)) {
        setIsError(true);
      } else {
        setIsError(false);
      }
    } else if (currentStep === 'thai') {
      const targetWord = currentWord?.th || '';

      if (value.length > 0 && !targetWord.startsWith(value)) {
        setIsError(true);
      } else {
        setIsError(false);
      }
    }
  };

  const checkAnswer = () => {
    const value = input.trim();

    if (currentStep === 'english') {
      // Check English word
      if (value.toLowerCase() === currentWord?.en.toLowerCase()) {
        playSuccessSound();
        setCurrentStep('thai');
        setInput('');
        setIsError(false); // Reset error state
      }
    } else if (currentStep === 'thai') {
      // Check Thai word
      if (value === currentWord?.th) {
        playSuccessSound();
        // Move to next word
        setPreviousWord(currentWord);
        setCurrentWord(nextWord);
        setNextWord(getNextWordForLevel(level));
        setCurrentStep('english');
        setInput('');
        setIsError(false); // Reset error state
        onShowScore();
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  const getLevelText = () => {
    switch (level) {
      case 'easy': return 'Easy';
      case 'medium': return 'Medium';
      case 'hard': return 'TOEIC';
      default: return level;
    }
  };

  if (!currentWord) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col text-white overflow-hidden">
      {/* Top bar with score and stop button - Fixed positioning */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-gray-900 to-gray-800 border-b-2 border-green-400 p-2 sm:p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <button
            onClick={onStop}
            className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-red-500 hover:bg-red-600 text-white border-2 border-red-300 rounded-lg font-bold transition-all hover:scale-105 transform text-sm sm:text-base lg:text-lg"
            style={{ fontFamily: 'monospace, "Courier New", Courier' }}
          >
            หยุด
          </button>
          <div className="text-right">
            <div
              className="text-lg sm:text-xl lg:text-2xl font-bold text-green-400"
              style={{ fontFamily: 'monospace, "Courier New", Courier' }}
            >
              คะแนน {score}
            </div>
            <div
              className="text-gray-300 text-xs sm:text-sm lg:text-base"
              style={{ fontFamily: 'monospace, "Courier New", Courier' }}
            >
              ระดับ : {getLevelText()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Adjusted for fixed header */}
      <div className="flex flex-col items-center justify-center min-h-screen pt-16 sm:pt-20 lg:pt-24 pb-8 px-2 sm:px-4 lg:px-8">
        {/* Current word display - Responsive sizing with error indication */}
        <div className={`flex flex-col items-center justify-center text-center mb-8 sm:mb-12 lg:mb-16 w-full max-w-6xl transition-all duration-300 ${isError ? 'transform scale-105' : ''}`}>
          <div className={`p-4 sm:p-6 lg:p-8 rounded-2xl border-4 transition-all duration-300 ${isError ? 'border-red-500 bg-red-900 bg-opacity-30 shadow-red-500/50 shadow-2xl' : 'border-transparent bg-transparent'}`}>
            <div
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-green-400 mb-2 sm:mb-3 lg:mb-4 drop-shadow-lg break-words"
              style={{
                fontFamily: 'monospace, "Courier New", Courier',
                textShadow: '0 0 10px rgba(74, 222, 128, 0.5)'
              }}
            >
              {currentWord.en}
            </div>
            {currentWord.pron && (
              <div
                className="text-lg sm:text-xl md:text-2xl lg:text-xl text-gray-500 mb-2 sm:mb-3 lg:mb-4 font-medium break-words"
                style={{
                  fontFamily: 'monospace, "Courier New", Courier'
                }}
              >
                {currentWord.pron}
              </div>
            )}
            <div
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-yellow-300 mb-2 sm:mb-3 lg:mb-4 font-bold break-words"
              style={{
                fontFamily: 'monospace, "Courier New", Courier',
                textShadow: '0 0 5px rgba(253, 224, 71, 0.5)'
              }}
            >
              {currentWord.th}
            </div>
            <div
              className={`text-sm sm:text-base lg:text-lg xl:text-xl font-bold px-2 sm:px-4 py-1 sm:py-2 border-2 rounded-lg transition-colors ${isError ? 'text-red-400 bg-red-800 border-red-300' : 'text-cyan-400 bg-gray-800 border-cyan-300'}`}
              style={{ fontFamily: 'monospace, "Courier New", Courier' }}
            >
              {currentStep === 'english' ? 'พิมพ์ภาษาอังกฤษ' : 'พิมพ์ภาษาไทย'}
            </div>
          </div>
        </div>

        {/* Input field and button - Responsive */}
        <div className="w-full max-w-2xl">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              className={`bg-gray-800 border-4 text-white text-lg sm:text-xl lg:text-2xl text-center w-full py-2 sm:py-3 rounded-lg focus:outline-none transition-all focus:shadow-lg ${isError ? 'border-red-500 focus:border-red-400 bg-red-900 bg-opacity-50' : 'border-green-400 focus:border-yellow-400'}`}
              style={{
                fontFamily: 'monospace, "Courier New", Courier',
                boxShadow: isError ? 'inset 0 0 10px rgba(239, 68, 68, 0.5), 0 0 20px rgba(239, 68, 68, 0.3)' : 'inset 0 0 10px rgba(0, 0, 0, 0.5)'
              }}
              placeholder={currentStep === 'english' ? 'พิมพ์ภาษาอังกฤษ...' : 'พิมพ์ภาษาไทย...'}
              autoFocus
            />
            {isMobile && (
              <button
                onClick={checkAnswer}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-green-500 hover:bg-green-600 text-white border-2 border-green-300 rounded-lg font-bold transition-all hover:scale-105 transform w-full sm:w-auto text-base sm:text-lg"
                style={{ fontFamily: 'monospace, "Courier New", Courier' }}
              >
                ยืนยัน
              </button>
            )}
          </div>
          <div
            className="mt-2 sm:mt-4 text-gray-400 text-xs sm:text-sm lg:text-base text-center"
            style={{ fontFamily: 'monospace, "Courier New", Courier' }}
          >
            {isMobile ? 'กดปุ่มยืนยัน หรือ Enter เพื่อส่งคำตอบ' : 'กด Enter เพื่อส่งคำตอบ'}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [gameState, setGameState] = useState('menu');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [score, setScore] = useState(0);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [wordsData, setWordsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load words from separate JSON files based on level
  const loadWordsForLevel = async (level) => {
    const fileMap = {
      'easy': '/words_easy.json',
      'medium': '/words_medium.json',
      'hard': '/words_toeic.json'
    };

    const fileName = fileMap[level];
    if (!fileName) {
      console.error('Invalid level:', level);
      return [];
    }

    try {
      const response = await fetch(fileName);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(`Loaded ${level} words:`, data.length, 'words');
      return data;
    } catch (error) {
      console.error(`Error loading ${fileName}:`, error);
      // Fallback words for each level
      const fallbackWords = {
        'easy': [
          { id: 1, en: 'cat', th: 'แมว', level: 'easy' },
        ],
        'medium': [
          { id: 1, en: 'restaurant', th: 'ร้านอาหาร', level: 'medium' },
        ],
        'hard': [
          { id: 1, en: 'achievement', th: 'ความสำเร็จ', level: 'toeic' },
        ]
      };
      return fallbackWords[level] || [];
    }
  };

  useEffect(() => {
    // Load all words from all files at startup
    const loadAllWords = async () => {
      setLoading(true);
      try {
        const [easyWords, mediumWords, hardWords] = await Promise.all([
          loadWordsForLevel('easy'),
          loadWordsForLevel('medium'),
          loadWordsForLevel('hard')
        ]);

        const allWords = [...easyWords, ...mediumWords, ...hardWords];
        setWordsData(allWords);
        console.log('Total words loaded:', allWords.length);
      } catch (error) {
        console.error('Error loading words:', error);
        alert('ไม่สามารถโหลดไฟล์คำศัพท์ได้ กำลังใช้คำศัพท์ตัวอย่าง');
      } finally {
        setLoading(false);
      }
    };

    loadAllWords();
  }, []);

  const handleLevelChange = (level) => {
    setSelectedLevel(level);
    setGameState('playing');
    setScore(0);
  };

  const handleScoreIncrease = () => {
    setScore(score + 1);
  };

  const handleStop = () => {
    setShowScoreModal(true);
  };

  const handleCloseScoreModal = () => {
    setShowScoreModal(false);
  };

  const handleRestart = () => {
    setShowScoreModal(false);
    setGameState('menu');
    setScore(0);
    setSelectedLevel('');
  };

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center text-white">
        <div
          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-400"
          style={{ fontFamily: 'monospace, "Courier New", Courier' }}
        >
          กำลังโหลด...
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {gameState === 'menu' && (
        <LevelSelector onLevelChange={handleLevelChange} />
      )}

      {gameState === 'playing' && (
        <GameScreen
          level={selectedLevel}
          onShowScore={handleScoreIncrease}
          score={score}
          wordsData={wordsData}
          onStop={handleStop}
        />
      )}

      {showScoreModal && (
        <ScoreModal
          score={score}
          level={selectedLevel}
          onClose={handleCloseScoreModal}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
};

export default App;