// DOM 元素
const cardsGrid = document.getElementById('cards-grid');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const flipAllFrontBtn = document.getElementById('flip-all-front');
const flipAllBackBtn = document.getElementById('flip-all-back');
const themeSelect = document.getElementById('theme-select');
const gridSizeSelect = document.getElementById('grid-size');
const countdownTimeSelect = document.getElementById('countdown-time');
const hideMatchedCheckbox = document.getElementById('hide-matched');
const countdownElement = document.getElementById('countdown');
const scoreElement = document.getElementById('score-count');

// 音效元素
const flipSound = document.getElementById('flip-sound');
const matchSound = document.getElementById('match-sound');
const errorSound = document.getElementById('error-sound');

// 遊戲變數
let timer;
let countdown;
let score = 0;
let firstCard, secondCard;
let lockBoard = false;
let matchedPairs = 0;
let cardImages = [];
let frontImage = '';
let gridSize;
let isGameRunning = false;
let isCountdownFinished = false;

// 主題設置
const themes = {
    theme1: {
        front: 'img/theme1/front.jpg',
        backs: [
            'img/theme1/image1.png', 'img/theme1/image2.png', 'img/theme1/image3.png', 'img/theme1/image4.png',
            'img/theme1/image5.png', 'img/theme1/image6.png', 'img/theme1/image7.png', 'img/theme1/image8.png', 'img/theme1/image9.jpg'
        ]
    },
    theme2: {
        front: 'img/theme2/front.png',
        backs: [
            'img/theme2/image1.jpg', 'img/theme2/image2.jpg', 'img/theme2/image3.jpg', 'img/theme2/image4.jpg',
            'img/theme2/image5.jpg', 'img/theme2/image6.jpg', 'img/theme2/image7.jpg', 'img/theme2/image8.jpg', 'img/theme2/image9.jpg'
        ]
    }
};

// 預載圖片函數
function preloadImages(imageUrls) {
    return Promise.all(imageUrls.map(url => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = () => reject(url);
            img.src = url;
        });
    }));
}

// 創建卡片元素
async function createCardElements() {
    cardsGrid.innerHTML = '';
    let selectedTheme = themes[themeSelect.value];
    frontImage = selectedTheme.front;
    gridSize = parseInt(gridSizeSelect.value);
    let pairsCount = (gridSize * gridSize) / 2;
    
    // 預載所有圖片
    const allImages = [frontImage, ...selectedTheme.backs];
    try {
        await preloadImages(allImages);
    } catch (error) {
        console.error('無法載入部分圖片:', error);
        alert('部分圖片載入失敗，請檢查網絡連接或重新整理頁面。');
        return;
    }

    // 隨機選擇圖片
    let selectedBacks = shuffle(selectedTheme.backs.slice());
    cardImages = selectedBacks.slice(0, pairsCount);
    cardImages = [...cardImages, ...cardImages];
    cardImages = shuffle(cardImages);

    cardsGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    cardsGrid.className = `size-${gridSize}`;

    cardImages.forEach((image, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <div class="front" style="background-image: url('${frontImage}');"></div>
            <div class="back" style="background-image: url('${image}');"></div>
        `;
        card.addEventListener('click', flipCard);
        card.dataset.image = image; // 儲存圖片路徑而不是索引
        cardsGrid.appendChild(card);
    });

    document.querySelectorAll('.card').forEach(card => card.classList.add('flipped'));
}

// 新增 hideAllCards 函數
function hideAllCards() {
    console.log('Hiding all cards');
    const cards = document.querySelectorAll('.card');
    console.log(`Found ${cards.length} cards to hide`);
    cards.forEach((card, index) => {
        card.style.display = 'none';
        console.log(`Card ${index} hidden`);
    });
}

// 新增 showAllCards 函數
function showAllCards() {
    console.log('Showing all cards');
    const cards = document.querySelectorAll('.card');
    console.log(`Found ${cards.length} cards`);
    cards.forEach((card, index) => {
        card.style.display = 'block';
        card.classList.remove('flipped'); // 顯示背面
        console.log(`Card ${index} displayed and flipped`); 
    });
}
// 洗牌函數
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 開始遊戲
function startGame() {
    console.log('Starting game');
    if (isGameRunning) {
        console.log('Game is already running');
        return;
    }
    
    resetGame();
    startBtn.style.display = 'none';
    restartBtn.style.display = 'inline-block';
    restartBtn.textContent = '重新開始';
    countdown = parseInt(countdownTimeSelect.value);
    isCountdownFinished = false;
    updateCountdown();
    
    console.log('Displaying cards grid');
    cardsGrid.style.display = 'grid';
    
    console.log('Showing all cards');
    showAllCards();

    timer = setInterval(updateCountdown, 1000);
    isGameRunning = true;

    // 禁用主題和網格大小選擇
    themeSelect.disabled = true;
    gridSizeSelect.disabled = true;
    countdownTimeSelect.disabled = true;
    
    console.log('Game started successfully');
}

// 更新倒計時
function updateCountdown() {
    countdown--;
    countdownElement.textContent = countdown;
    if (countdown === 0) {
        clearInterval(timer);
        isCountdownFinished = true;
        flipAllCardsFront();  // 倒計時結束時翻到正面
    } else if (countdown < 0) {
        clearInterval(timer);
        countdownElement.textContent = 0;
    }
}

// 新增 flipAllCardsFront 函數
function flipAllCardsFront() {
    const cards = document.querySelectorAll('.card');
    let index = 0;

    const flipNextCard = () => {
        if (index < cards.length) {
            cards[index].classList.remove('flipped');
            flipSound.play();
            index++;
            setTimeout(flipNextCard, 100);
        } else {
            lockBoard = false; // 允許玩家開始翻牌
        }
    };

    flipNextCard();
}

// 重置遊戲
function resetGame() {
    score = 0;
    matchedPairs = 0;
    scoreElement.textContent = score;
    lockBoard = true;
    clearInterval(timer);
    countdown = parseInt(countdownTimeSelect.value);
    countdownElement.textContent = countdown;
    isCountdownFinished = false;
    createCardElements();
    cardsGrid.style.display = 'none';
    isGameRunning = false;

    // 重新啟用主題和網格大小選擇
    themeSelect.disabled = false;
    gridSizeSelect.disabled = false;
    countdownTimeSelect.disabled = false;
}


// 新增 flipAllCards 函數
function flipAllCards() {
    const cards = document.querySelectorAll('.card');
    let index = 0;

    const flipNextCard = () => {
        if (index < cards.length) {
            cards[index].classList.add('flipped');
            flipSound.play();
            index++;
            setTimeout(flipNextCard, 100);
        } else {
            lockBoard = false; // 允許玩家開始翻牌
        }
    };

    flipNextCard();
}

// 翻牌
function flipCard() {
    if (lockBoard) return;
    if (!isCountdownFinished) return; // 如果倒數未結束，不允許翻牌
    if (this === firstCard) return;

    flipSound.play();
    this.classList.add('flipped');

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
}

// 檢查配對
function checkForMatch() {
    let isMatch = firstCard.dataset.image === secondCard.dataset.image;
    isMatch ? disableCards() : unflipCards();
}

// 禁用已配對的卡片
function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    matchSound.play();
    score += 1;
    scoreElement.textContent = score;
    matchedPairs++;

    firstCard.classList.add('matched');
    secondCard.classList.add('matched');

    updateMatchedCardsVisibility();

    if (matchedPairs === cardImages.length / 2) {
        endGame();
    }

    resetBoard();
}

// 翻回未配對的卡片
function unflipCards() {
    lockBoard = true;
    errorSound.play();

    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000);
}

// 重置板子
function resetBoard() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}

// 結束遊戲
function endGame() {
    clearInterval(timer);
    isGameRunning = false;
    Swal.fire({
        title: '恭喜！',
        text: `你已經成功配對所有卡片！得分：${score}`,
        icon: 'success',
        confirmButtonText: '再玩一次',
        focusConfirm: false,
        heightAuto: false
    }).then(() => {
        resetGame();
        startBtn.style.display = 'inline-block';
        restartBtn.style.display = 'none';
    });

    // 重新啟用主題和網格大小選擇
    themeSelect.disabled = false;
    gridSizeSelect.disabled = false;
    countdownTimeSelect.disabled = false;
}

// 更新已配對卡片的可見性
function updateMatchedCardsVisibility() {
    const matchedCards = document.querySelectorAll('.card.matched');
    matchedCards.forEach(card => {
        if (hideMatchedCheckbox.checked) {
            card.style.visibility = 'hidden';
        } else {
            card.style.visibility = 'visible';
        }
    });
}

// 事件監聽器
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => {
    resetGame();
    startBtn.style.display = 'inline-block';
    restartBtn.style.display = 'none';
});

flipAllFrontBtn.addEventListener('click', () => {
    const cards = document.querySelectorAll('.card');
    let index = 0;

    const flipNextCard = () => {
        if (index < cards.length) {
            cards[index].classList.remove('flipped');
            flipSound.play();
            index++;
            setTimeout(flipNextCard, 100);
        }
    };

    flipNextCard();
});

flipAllBackBtn.addEventListener('click', () => {
    const cards = document.querySelectorAll('.card');
    let index = 0;

    const flipNextCard = () => {
        if (index < cards.length) {
            cards[index].classList.add('flipped');
            flipSound.play();
            index++;
            setTimeout(flipNextCard, 100);
        }
    };

    flipNextCard();
});

themeSelect.addEventListener('change', createCardElements);
gridSizeSelect.addEventListener('change', createCardElements);
countdownTimeSelect.addEventListener('change', () => {
    countdown = parseInt(countdownTimeSelect.value);
    countdownElement.textContent = countdown;
});
hideMatchedCheckbox.addEventListener('change', updateMatchedCardsVisibility);

// 初始化遊戲
async function initGame() {
    await createCardElements();
    countdown = parseInt(countdownTimeSelect.value);
    countdownElement.textContent = countdown;
    updateMatchedCardsVisibility();
    cardsGrid.style.display = 'grid';
    hideAllCards();  // 確保初始時所有卡片都是隱藏的
}
// 當頁面加載完成時初始化遊戲
window.addEventListener('load', initGame);
