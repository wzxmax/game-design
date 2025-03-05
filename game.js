// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    const finalScoreElement = document.getElementById('finalScore');
    const winScreen = document.getElementById('winScreen');
    const restartButton = document.getElementById('restartButton');

    // 设置画布大小
    canvas.width = 800;
    canvas.height = 400;

    // 游戏状态
    let score = 0;
    let level = 1;
    let mouseX = 0;
    let mouseY = 0;
    let isMouseDown = false;
    let imageLoaded = false;
    let gameOver = false;

    // 加载玩家图片
    const playerImage = new Image();
    playerImage.onload = () => {
        console.log('Player image loaded successfully');
        imageLoaded = true;
    };
    playerImage.onerror = (e) => {
        console.error('Failed to load player image:', e);
        imageLoaded = false;
    };
    playerImage.src = 'assets/player.png.jpg';

    // 玩家对象
    const player = {
        x: 50,
        y: canvas.height - 100,
        width: 60,
        height: 60,
        speed: 8,
        jumpForce: 12,
        gravity: 0.5,
        velocityY: 0,
        isJumping: false,
        facingRight: true
    };

    // 子弹数组
    let bullets = [];

    // 敌人数组
    let enemies = [];

    // 关卡配置
    const levels = [
        {
            platforms: [
                { x: 0, y: canvas.height - 40, width: canvas.width, height: 40, color: '#8B4513' },
                { x: 300, y: canvas.height - 120, width: 200, height: 20, color: '#8B4513' },
                { x: 600, y: canvas.height - 160, width: 200, height: 20, color: '#8B4513' },
                { x: 100, y: canvas.height - 200, width: 200, height: 20, color: '#8B4513' }
            ],
            coins: [
                { x: 350, y: canvas.height - 160, width: 20, height: 20, collected: false, color: '#FFD700' },
                { x: 650, y: canvas.height - 200, width: 20, height: 20, collected: false, color: '#FFD700' },
                { x: 150, y: canvas.height - 240, width: 20, height: 20, collected: false, color: '#FFD700' }
            ],
            enemies: []
        },
        {
            platforms: [
                { x: 0, y: canvas.height - 40, width: canvas.width, height: 40, color: '#8B4513' },
                { x: 200, y: canvas.height - 120, width: 150, height: 20, color: '#8B4513' },
                { x: 400, y: canvas.height - 160, width: 150, height: 20, color: '#8B4513' },
                { x: 600, y: canvas.height - 200, width: 150, height: 20, color: '#8B4513' }
            ],
            coins: [
                { x: 250, y: canvas.height - 160, width: 20, height: 20, collected: false, color: '#FFD700' },
                { x: 450, y: canvas.height - 200, width: 20, height: 20, collected: false, color: '#FFD700' },
                { x: 650, y: canvas.height - 240, width: 20, height: 20, collected: false, color: '#FFD700' }
            ],
            enemies: [
                { x: 300, y: canvas.height - 80, width: 40, height: 40, speed: 2, direction: 1, color: '#FF0000' }
            ]
        },
        {
            platforms: [
                { x: 0, y: canvas.height - 40, width: canvas.width, height: 40, color: '#8B4513' },
                { x: 100, y: canvas.height - 120, width: 100, height: 20, color: '#8B4513' },
                { x: 300, y: canvas.height - 160, width: 100, height: 20, color: '#8B4513' },
                { x: 500, y: canvas.height - 200, width: 100, height: 20, color: '#8B4513' },
                { x: 700, y: canvas.height - 240, width: 100, height: 20, color: '#8B4513' }
            ],
            coins: [
                { x: 150, y: canvas.height - 160, width: 20, height: 20, collected: false, color: '#FFD700' },
                { x: 350, y: canvas.height - 200, width: 20, height: 20, collected: false, color: '#FFD700' },
                { x: 550, y: canvas.height - 240, width: 20, height: 20, collected: false, color: '#FFD700' }
            ],
            enemies: [
                { x: 200, y: canvas.height - 80, width: 40, height: 40, speed: 3, direction: 1, color: '#FF0000' },
                { x: 400, y: canvas.height - 120, width: 40, height: 40, speed: 2, direction: -1, color: '#FF0000' },
                { x: 600, y: canvas.height - 160, width: 40, height: 40, speed: 4, direction: 1, color: '#FF0000' }
            ]
        }
    ];

    let currentLevel = levels[0];
    let platforms = currentLevel.platforms;
    let coins = currentLevel.coins;
    enemies = currentLevel.enemies;

    // 鼠标事件监听
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        
        // 更新角色朝向
        player.facingRight = mouseX > player.x;
    });

    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // 左键跳跃
            isMouseDown = true;
            if (!player.isJumping) {
                player.velocityY = -player.jumpForce;
                player.isJumping = true;
                console.log('Jumping');
            }
        } else if (e.button === 2) { // 右键发射子弹
            if (!gameOver) {
                const bullet = {
                    x: player.x + player.width / 2,
                    y: player.y + player.height / 2,
                    width: 10,
                    height: 5,
                    speed: 10,
                    direction: player.facingRight ? 1 : -1
                };
                bullets.push(bullet);
            }
        }
    });

    canvas.addEventListener('mouseup', () => {
        isMouseDown = false;
    });

    // 禁用右键菜单
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // 重新开始按钮
    restartButton.addEventListener('click', () => {
        resetGame();
    });

    // 重置游戏
    function resetGame() {
        score = 0;
        level = 1;
        gameOver = false;
        winScreen.style.display = 'none';
        scoreElement.textContent = score;
        levelElement.textContent = level;
        currentLevel = levels[0];
        platforms = currentLevel.platforms;
        coins = currentLevel.coins;
        enemies = currentLevel.enemies;
        bullets = [];
        player.x = 50;
        player.y = canvas.height - 100;
        player.velocityY = 0;
        player.isJumping = false;
    }

    // 碰撞检测
    function checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    // 更新游戏状态
    function update() {
        if (gameOver) return;

        // 玩家跟随鼠标移动
        const targetX = mouseX - player.width / 2;
        const dx = targetX - player.x;
        
        // 平滑移动
        if (Math.abs(dx) > 1) {
            player.x += Math.sign(dx) * player.speed;
        }

        // 跳跃
        if (isMouseDown && !player.isJumping) {
            player.velocityY = -player.jumpForce;
            player.isJumping = true;
            console.log('Jumping');
        }

        // 重力
        player.velocityY += player.gravity;
        player.y += player.velocityY;

        // 平台碰撞检测
        let onPlatform = false;
        platforms.forEach(platform => {
            if (checkCollision(player, platform)) {
                if (player.velocityY > 0) {
                    player.y = platform.y - player.height;
                    player.velocityY = 0;
                    player.isJumping = false;
                    onPlatform = true;
                }
            }
        });

        // 金币碰撞检测
        coins.forEach(coin => {
            if (!coin.collected && checkCollision(player, coin)) {
                coin.collected = true;
                score += 10;
                scoreElement.textContent = score;
                console.log('Coin collected!');
            }
        });

        // 更新子弹
        bullets = bullets.filter(bullet => {
            bullet.x += bullet.speed * bullet.direction;
            
            // 检查子弹是否击中敌人
            enemies = enemies.filter(enemy => {
                if (checkCollision(bullet, enemy)) {
                    return false;
                }
                return true;
            });

            // 检查子弹是否击中平台
            for (let platform of platforms) {
                if (checkCollision(bullet, platform)) {
                    return false;
                }
            }

            // 移除超出屏幕的子弹
            return bullet.x > 0 && bullet.x < canvas.width;
        });

        // 更新敌人
        enemies.forEach(enemy => {
            enemy.x += enemy.speed * enemy.direction;
            
            // 敌人碰到平台边缘时改变方向
            platforms.forEach(platform => {
                if (checkCollision(enemy, platform)) {
                    if (enemy.x <= platform.x) {
                        enemy.direction = 1;
                    } else if (enemy.x + enemy.width >= platform.x + platform.width) {
                        enemy.direction = -1;
                    }
                }
            });

            // 检查玩家是否碰到敌人
            if (checkCollision(player, enemy)) {
                gameOver = true;
                showWinScreen();
            }
        });

        // 检查是否完成当前关卡
        if (coins.every(coin => coin.collected)) {
            if (level < levels.length) {
                level++;
                levelElement.textContent = level;
                currentLevel = levels[level - 1];
                platforms = currentLevel.platforms;
                coins = currentLevel.coins;
                enemies = currentLevel.enemies;
                bullets = [];
                player.x = 50;
                player.y = canvas.height - 100;
                player.velocityY = 0;
                player.isJumping = false;
            } else {
                gameOver = true;
                showWinScreen();
            }
        }

        // 边界检查
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
        if (player.y + player.height > canvas.height) {
            player.y = canvas.height - player.height;
            player.velocityY = 0;
            player.isJumping = false;
        }
    }

    // 显示胜利界面
    function showWinScreen() {
        finalScoreElement.textContent = score;
        winScreen.style.display = 'block';
    }

    // 绘制游戏画面
    function draw() {
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制平台
        platforms.forEach(platform => {
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        });

        // 绘制金币
        coins.forEach(coin => {
            if (!coin.collected) {
                ctx.fillStyle = coin.color;
                ctx.beginPath();
                ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/2, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // 绘制敌人
        enemies.forEach(enemy => {
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        });

        // 绘制子弹
        bullets.forEach(bullet => {
            ctx.fillStyle = '#FFFF00';
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });

        // 绘制玩家
        if (imageLoaded) {
            // 使用图片绘制玩家
            ctx.save();
            if (!player.facingRight) {
                ctx.scale(-1, 1);
                ctx.translate(-player.x - player.width, player.y);
            } else {
                ctx.translate(player.x, player.y);
            }
            ctx.drawImage(playerImage, 0, 0, player.width, player.height);
            ctx.restore();
        } else {
            // 如果图片未加载，使用红色方块
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(player.x, player.y, player.width, player.height);
            
            // 添加眼睛
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(player.x + 5, player.y + 5, 8, 8);
            ctx.fillRect(player.x + 27, player.y + 5, 8, 8);
        }
    }

    // 游戏主循环
    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    // 开始游戏
    console.log('Game starting...');
    gameLoop();
}); 