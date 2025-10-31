const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const gameOverDiv = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const playAgainBtn = document.getElementById('play-again');
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');
const storiesDiv = document.getElementById('stories');

canvas.width = 800;
canvas.height = 600;

let score = 0;
let lives = 3;
let gameRunning = false;
let baseSpeed = 2;
let speedMultiplier = 1;
let caughtBadItems = [];

const basket = {
    x: canvas.width / 2 - 50,
    y: canvas.height - 80,
    width: 100,
    height: 60,
    speed: 8,
    img: new Image()
};
basket.img.src = 'basket.png';

const keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

let fallingItems = [];

const itemTypes = {
    pudding: { points: 15, isGood: true, img: 'pudding.png', name: 'Malva Pudding', story: 'promised for getting location guess game correct. culinary rewards for basic deductive reasoning, very effective motivation.' },
    pizza: { points: 15, isGood: true, img: 'pizza.png', name: 'Layered Pizza', story: 'ordered layered pizza for english teacher\'s farewell party. i called it burger pizza but she corrected me. terminology matters apparently' },
    skittles: { points: 20, isGood: true, img: 'skittles.png', name: 'Skittles', story: 'favorite snack. taste the rainbow or whatever the slogan is' },
    ferrero: { points: 20, isGood: true, img: 'ferrero.png', name: 'Ferrero Rocher', story: 'favorite chocolate despite hating chocolate generally. your contradictions always baffle me' },
    chips: { points: 15, isGood: true, img: 'chips.png', name: 'Pringles', story: 'favorite snack, pringles. the uniform stackable chips in the tube. she has strong opinions about chip geometry' },
    stew: { points: 15, isGood: true, img: 'stew.png', name: 'Beef Stew', story: 'beef stew with carrots during sore throat. comfort food that actually provided comfort. rare successful medical intervention via beef' },
    slushie: { points: 15, isGood: true, img: 'slushie.png', name: 'Slushie', story: 'desperately wanted during sore throat. flavors: \'blue\' and \'red\'. as if colors are flavors' },
    avocado: { points: 15, isGood: true, img: 'avocado.png', name: 'Avocado', story: 'eats for breakfast regularly. when i said i never tried it she immediately offered to mail it from south africa. problem solving through international postage. very smart' },
    omelette: { points: 15, isGood: true, img: 'omelette.png', name: 'Omelette', story: 'made with onion, cheese, ham, and spices. then puts the entire omelette on toast. explained this construction method in detail as if i might need instructions' },
    
    custard: { points: 0, isGood: false, img: 'Custard.png', name: 'Custard', story: 'homemade with custard powder, milk, and sugar. fruit inclusion was firmly rejected. pure custard philosophy. no compromises' },
    chocolate: { points: 0, isGood: false, img: 'chocolate.png', name: 'Chocolate Bar', story: 'discord name is candy. doesn\'t like chocolate. chocolate is like candy\'s older brother. make it make sense' },
    cup: { points: 0, isGood: false, img: 'cup.png', name: 'Hot Drink', story: 'hot drink spilled directly onto soviet history notes. caused historically siginificant casualties but continued studying anyway. dedication is frankly concerning' },
    cake: { points: 0, isGood: false, img: 'cake.png', name: 'Cake', story: 'choked on cake while yearning. she clarified non-jake target mid-choking. her communication priorities are questionable' },
    chicken: { points: 0, isGood: false, img: 'fried-chicken.png', name: 'Fried Chicken', story: 'claimed chicken and her \'go a long way together\'. proceeds to describe large raw chunk in grandma\'s cooking. the relationship is complicated apparently' },
    spider: { points: 0, isGood: false, img: 'spider.png', name: 'Spider', story: 'first survivor of the pest control. leader of the halloween revenge operation. recruited scorpion and beetle. very strategic leadership' },
    scorpion: { points: 0, isGood: false, img: 'scorpion.png', name: 'Scorpion', story: 'survived the pest control and is now planning halloween revenge, money well spent apparently.' },
    beetle: { points: 0, isGood: false, img: 'beetle.png', name: 'Beetle', story: 'met the rabbit plushie. encounter did not end well for beetle' },
    bunny: { points: 0, isGood: false, img: 'bunny.png', name: 'Rabbit Plushie', story: 'deployed as weapon against beetle. effective but now haunted. consequences of militarization' },
    steak: { points: 0, isGood: false, img: 'steak.png', name: 'Steak', story: 'asked me to choose between steak and burgers. claimed vegetarian status hours later. timeline doesn\'t make it make sense' }
};

Object.values(itemTypes).forEach(type => {
    const img = new Image();
    img.src = type.img;
    type.imgLoaded = img;
});

function drawBasket() {
    ctx.drawImage(basket.img, basket.x, basket.y, basket.width, basket.height);
}

function moveBasket() {
    if (keys['ArrowLeft'] && basket.x > 0) basket.x -= basket.speed;
    if (keys['ArrowRight'] && basket.x < canvas.width - basket.width) basket.x += basket.speed;
}

function createFallingItem() {
    const types = Object.keys(itemTypes);
    const randomType = types[Math.floor(Math.random() * types.length)];
    fallingItems.push({
        x: Math.random() * (canvas.width - 40),
        y: -40,
        width: 40,
        height: 40,
        type: randomType,
        speed: baseSpeed * speedMultiplier
    });
}

function drawFallingItems() {
    fallingItems.forEach(item => {
        const type = itemTypes[item.type];
        if (type.imgLoaded) {
            ctx.drawImage(type.imgLoaded, item.x, item.y, item.width, item.height);
        }
    });
}

function showMessage(message) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'popup-message';
    msgDiv.textContent = message;
    document.body.appendChild(msgDiv);
    setTimeout(() => msgDiv.remove(), 2000);
}

function updateFallingItems() {
    fallingItems.forEach((item, index) => {
        item.y += item.speed;
        
        if (item.y + item.height >= basket.y &&
            item.y <= basket.y + basket.height &&
            item.x + item.width >= basket.x &&
            item.x <= basket.x + basket.width) {
            
            if (itemTypes[item.type].isGood) {
                score += itemTypes[item.type].points;
                scoreDisplay.textContent = score;
            } else {
                lives--;
                livesDisplay.textContent = lives;
                showMessage(itemTypes[item.type].story);
                if (!caughtBadItems.includes(item.type)) {
                    caughtBadItems.push(item.type);
                }
                if (lives <= 0) {
                    endGame();
                }
            }
            fallingItems.splice(index, 1);
        }
        
        if (item.y > canvas.height) {
            if (itemTypes[item.type].isGood) {
                lives--;
                livesDisplay.textContent = lives;
                if (lives <= 0) {
                    endGame();
                }
            }
            fallingItems.splice(index, 1);
        }
    });
}

let lastItemTime = 0;
let gameStartTime = Date.now();

function gameLoop() {
    if (!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const now = Date.now();
    if (now - lastItemTime > 1000) {
        createFallingItem();
        lastItemTime = now;
    }
    
    const elapsed = (now - gameStartTime) / 1000;
    speedMultiplier = 1 + Math.floor(elapsed / 10) * 0.1;
    
    moveBasket();
    updateFallingItems();
    drawBasket();
    drawFallingItems();
    
    requestAnimationFrame(gameLoop);
}

function startGame() {
    score = 0;
    lives = 3;
    fallingItems = [];
    caughtBadItems = [];
    speedMultiplier = 1;
    gameStartTime = Date.now();
    lastItemTime = Date.now();
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
    gameOverDiv.classList.add('hidden');
    startScreen.classList.add('hidden');
    gameRunning = true;
    gameLoop();
}

function endGame() {
    gameRunning = false;
    finalScoreDisplay.textContent = score;
    
    let allStories = '<h3>Your Story:</h3>';
    
    Object.keys(itemTypes).forEach(key => {
        const item = itemTypes[key];
        if (item.isGood && item.story) {
            allStories += `<p><strong>${item.name}:</strong> ${item.story}</p>`;
        }
    });
    
    if (caughtBadItems.length > 0) {
        allStories += '<h3 style="margin-top: 20px;">Even the "Bad" Memories Matter:</h3>';
        caughtBadItems.forEach(itemKey => {
            const item = itemTypes[itemKey];
            allStories += `<p><strong>${item.name}:</strong> ${item.story}</p>`;
        });
    }
    
    storiesDiv.innerHTML = allStories;
    
    gameOverDiv.classList.remove('hidden');
}

startBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', startGame);