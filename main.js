class TypingGame {
    constructor() {
        this.words = [];
        this.usedWords = new Set();
        this.currentWord = "";
        this.score = 0;
        this.timeLeft = 60.00;
        this.timer = null;
        this.difficulty = 'easy';
        this.gameActive = false;
        this.totalTyped = 0;
        this.missedTyped = 0;

        this.easyButton = document.getElementById('easy-button');
        this.normalButton = document.getElementById('normal-button');
        this.hardButton = document.getElementById('hard-button');
        this.wordContainer = document.getElementById('word-container');
        this.scoreDisplay = document.getElementById('score');
        this.timerDisplay = document.getElementById('timer');
        this.startButton = document.getElementById('start-button');
        this.rankingList = document.getElementById('ranking-list');
        this.inputIndex = 0;

        this.mobileInput = document.getElementById('mobile-input');

        this.loadWords();
    }
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }


    init() {
        this.startButton.addEventListener('click', this.startGame.bind(this));
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        this.mobileInput.addEventListener('input', this.handleInput.bind(this));
        this.addDifficultyListeners();
        this.displayRanking();
    }

    startGame() {
        this.resetGame();
        this.gameActive = true;
        this.startButton.disabled = true;
        this.timer = setInterval(() => {
            this.timeLeft -= 0.01;
            this.timerDisplay.textContent = `Time: ${this.timeLeft.toFixed(2)}`;
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 10);
        this.generateWord();
    }

    resetGame() {
        this.score = 0;
        this.timeLeft = 60.00;
        this.inputIndex = 0;
        this.totalTyped = 0;
        this.missedTyped = 0;
        this.usedWords.clear();
        this.scoreDisplay.textContent = "Score: 0";
        this.timerDisplay.textContent = "Time: 60.00";
        this.wordContainer.innerHTML = '';
    }

    endGame(gameCleared = false) {
        this.gameActive = false;
        clearInterval(this.timer);
        this.startButton.disabled = false;
    
        if (gameCleared) {
            // 残り時間をスコアに追加
            this.score += Math.floor(this.timeLeft * 10); // 残り秒数を10倍してスコアに追加
        }
    
        const elapsedTime = 60.00 - this.timeLeft;
        const typingSpeed = (this.totalTyped / elapsedTime).toFixed(2);
    
        const title = gameCleared ? 'Congratulations! You cleared the game!' : 'Game Over!';
        const message = gameCleared
            ? `<p>Final Score (with time bonus): ${this.score}</p>`
            : `<p>Final Score: ${this.score}</p>`;
    
        Swal.fire({
            title,
            html: `
                ${message}
                <p>Total Typed: ${this.totalTyped}</p>
                <p>Missed Typed: ${this.missedTyped}</p>
                <p>Typing Speed: ${typingSpeed} chars/sec</p>
            `,
            icon: 'success',
            confirmButtonText: 'OK'
        });
    
        this.saveScore();
        this.displayRanking();
    }
    
    generateWord() {
        if (this.filteredWords.length === this.usedWords.size) {
            // 全単語が使われた場合
            this.endGame(true); // ゲームクリアとして終了
            return;
        }
    
        do {
            this.currentWord = this.filteredWords[Math.floor(Math.random() * this.filteredWords.length)];
        } while (this.usedWords.has(this.currentWord));
    
        this.usedWords.add(this.currentWord);
        this.inputIndex = 0;
        this.renderWord();
    }
    
    handleInput(event) {
        if (!this.gameActive) return;

        const inputText = event.target.value;
        const spans = this.wordContainer.children;
        let matchIndex = 0;

        // 正しく入力された部分を探す
        for (let i = 0; i < inputText.length; i++) {
            if (matchIndex < this.currentWord.length && inputText[i] === this.currentWord[matchIndex]) {
                spans[matchIndex].classList.add('text-green-500');
                spans[matchIndex].classList.remove('text-gray-700');
                matchIndex++;
            }
        }

        this.inputIndex = matchIndex;
        this.totalTyped = inputText.length;

        // 正しく入力された部分の長さが単語の長さと一致したら次の単語へ
        if (this.inputIndex === this.currentWord.length) {
            this.score += this.currentWord.length;
            if(this.difficulty == "normal")this.score += this.currentWord.length * 0.2
            if(this.difficulty == "hard")this.score += this.currentWord.length * 0.5
            this.mobileInput.value = "";
            this.generateWord();
        }

        this.scoreDisplay.textContent = `Score: ${this.score}`;
    }

    handleKeyPress(event) {
        if (!this.gameActive) {
            if (event.keyCode === 13) this.startGame();
            return;
        }

        if (event.key.length > 1 || event.ctrlKey || event.altKey) {
            return;
        }

        this.totalTyped++;
        const spans = this.wordContainer.children;

        if (this.inputIndex < this.currentWord.length) {
            if (event.key === this.currentWord[this.inputIndex]) {
                spans[this.inputIndex].classList.remove('text-gray-700');
                spans[this.inputIndex].classList.add('text-green-500');
                this.inputIndex++;
                this.score++;
                if(this.difficulty == "normal")this.score += 0.2
                if(this.difficulty == "hard")this.score += 0.5
            }
            this.scoreDisplay.textContent = `Score: ${this.score}`;
        }

        if (this.inputIndex === this.currentWord.length) {
            const addedTime = this.currentWord.length * 0.18;
            this.timeLeft += addedTime;
            this.showTimeIncrease(addedTime);
            this.generateWord();
        }
    }

    addDifficultyListeners() {
        const buttons = document.querySelectorAll('.difficulty-button');
        buttons.forEach(button => {
            button.addEventListener('click', (event) => {
                // 全ボタンから選択中のスタイルを削除
                buttons.forEach(btn => btn.classList.remove('ring-4', 'ring-offset-2', 'ring-indigo-500'));
    
                // 選択されたボタンにスタイルを追加
                event.target.classList.add('ring-4', 'ring-offset-2', 'ring-indigo-500');
    
                // モードを設定し、表示を更新
                const selectedMode = event.target.textContent.toLowerCase();
                this.setDifficulty(selectedMode);
                document.getElementById('selected-difficulty').textContent = `現在の難易度: ${selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)}`;
            });
        });
    }
    

    setDifficulty(level) {
        this.difficulty = level;
        this.filterWordsByDifficulty();
        Swal.fire({
            title: 'Difficulty Selected',
            text: `You chose ${level.toUpperCase()} mode!`,
            icon: 'info',
            confirmButtonText: 'OK'
        });
    }

    loadWords() {
        this.words = [
            // Python
            'len', 'str', 'lower', 'upper', 'split', 'join', 'replace', 'strip', 
            'startswith', 'endswith', 'abs', 'round', 'min', 'max', 'sum', 'pow', 'divmod', 
            'append', 'extend', 'insert', 'remove', 'pop', 'sort', 'reverse', 'keys', 
            'values', 'items', 'get', 'update', 'pop', 'open', 'read', 'write', 'close', 
            'seek', 'tell', 'time', 'sleep', 'strftime', 'localtime', 'gmtime', 
            'enumerate', 'zip', 'map', 'filter', 'reduce', 'lambda', 'any', 'all',
            'isinstance', 'issubclass', 'next', 'iter', 'super', 'hasattr', 'setattr', 
            'getattr', 'delattr', 'classmethod', 'staticmethod', 'property',
        
            // JavaScript
            'length', 'toLowerCase', 'toUpperCase', 'split', 'join', 'replace', 'trim', 
            'startsWith', 'endsWith', 'charAt', 'charCodeAt', 'indexOf', 'lastIndexOf', 
            'substring', 'slice', 'includes', 'repeat', 'match', 'search', 'replaceAll',
            'Math.abs', 'Math.round', 'Math.min', 'Math.max', 'Math.sqrt', 'Math.pow', 
            'Math.random', 'Math.floor', 'Math.ceil', 'parseInt', 'parseFloat', 
            'push', 'pop', 'shift', 'unshift', 'splice', 'slice', 'map', 'filter', 
            'reduce', 'forEach', 'some', 'every', 'find', 'findIndex', 
            'Object.keys', 'Object.values', 'Object.entries', 'Object.assign', 
            'Object.hasOwnProperty', 'Object.create', 'Date.now', 'new Date', 
            'getFullYear', 'getMonth', 'getDate', 'getDay', 'getHours', 'getMinutes',
            'setFullYear', 'setMonth', 'setDate', 'setHours', 'setMinutes',
        
            // Java
            'Arrays.sort', 'Arrays.binarySearch', 'Arrays.equals', 'Arrays.copyOf', 
            'Arrays.fill', 'add', 'remove', 'get', 'set', 'size', 'contains', 'indexOf', 
            'FileReader', 'BufferedReader', 'FileWriter', 'BufferedWriter', 
            'LocalDate.now', 'LocalTime.now', 'LocalDateTime.now', 
            'ChronoUnit.DAYS.between', 'substring', 'replaceAll', 
            'Random.nextInt', 'Random.nextDouble', 'Collections.sort', 'Collections.shuffle', 
            'put', 'remove', 'containsKey', 'keys', 'values', 'entries', 
            'HashMap.put', 'HashMap.get', 'HashMap.remove', 'HashMap.containsKey', 
            'File.readText', 'File.writeText', 'File.appendText', 'File.create', 'File.delete',
        
            // C / C++
            'strlen', 'strcpy', 'strncpy', 'strcat', 'strncat', 'strcmp', 'strchr', 
            'strstr', 'abs', 'pow', 'sqrt', 'ceil', 'floor', 'round', 'rand', 'srand', 
            'memcpy', 'memset', 'qsort', 'bsearch', 'fopen', 'fclose', 'fread', 'fwrite', 
            'fprintf', 'fscanf', 'fgets', 'fputs', 'time', 'clock', 'difftime', 
            'localtime', 'gmtime', 'strftime',
        
            // その他汎用関数
            'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'log10', 'exp', 
            'hypot', 'fmod', 'remainder', 'modf', 'frexp', 'ldexp',
            "initWithBitmapDataPlanes:pixelsWide:pixelsHigh:bitsPerSample:samplesPerPixel:hasAlpha:isPlanar:colorSpaceName:bitmapFormat:bytesPerRow:bitsPerPixel:"
        ];
        this.filterWordsByDifficulty();
    }

    filterWordsByDifficulty() {
        if (this.difficulty === 'easy') {
            this.filteredWords = this.words.filter(word => /^[a-z]{3,6}$/.test(word));
        } else if (this.difficulty === 'normal') {
            this.filteredWords = this.words.filter(word => /^[a-zA-Z@_-]{5,10}$/.test(word));
        } else if (this.difficulty === 'hard') {
            this.filteredWords = this.words; // 全単語を使用
        }
    }

    renderWord() {
        this.wordContainer.innerHTML = '';
        for (let i = 0; i < this.currentWord.length; i++) {
            const span = document.createElement('span');
            span.textContent = this.currentWord[i];
            span.classList.add('text-gray-700');
            this.wordContainer.appendChild(span);
        }
    }

    showTimeIncrease(addedTime) {
        const timerElement = document.getElementById('timer');
        const timeIncreaseElement = document.createElement('span');
        timeIncreaseElement.textContent = ` +${addedTime.toFixed(2)}s`;
        timeIncreaseElement.className = 'text-green-500 font-bold ml-2 fade-out absolute5';
        timerElement.after(timeIncreaseElement);

        // 数秒後に要素を削除
        setTimeout(() => {
            timeIncreaseElement.remove();
        }, 1000); // 1秒後に削除
    }
    async saveScore() {
        const playerName = prompt("Enter your name for the leaderboard:") || "Anonymous";
        const response = await fetch('https://speedyfingers-gjbo.vercel.app/rankings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: playerName, score: this.score, difficulty: this.difficulty }),
        });
    
        if (response.ok) {
            console.log('Score successfully saved.');
        } else {
            console.error('Failed to save the score.');
        }
    }
    
    async displayRanking() {
        try {
            const response = await fetch(`https://speedyfingers-gjbo.vercel.app/rankings`);
            const rankings = await response.json();
    
            console.log('Fetched Rankings:', rankings); // デバッグ用出力
    
            this.rankingList.innerHTML = '';
            if (rankings.length === 0) {
                this.rankingList.innerHTML = '<li>No rankings yet</li>';
            } else {
                rankings.forEach((entry, index) => {
                    const li = document.createElement('li');
                    li.textContent = `${index + 1}. ${entry.name}: ${entry.score} pts (${entry.difficulty})`;
                    this.rankingList.appendChild(li);
                });
            }
        } catch (error) {
            console.error('Error displaying rankings:', error);
        }
    }
    
}

document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById("mobile-input");
    document.body.addEventListener("click", () => {
        if (navigator.userAgent.match(/iPhone|Android.+Mobile/))inputField.focus();
    });
    const game = new TypingGame();
    game.init();
});
