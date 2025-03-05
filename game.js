// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');

    // 设置画布大小
    canvas.width = 800;
    canvas.height = 400;

    // 游戏状态
    let score = 0;
    let mouseX = 0;
    let mouseY = 0;
    let isMouseDown = false;
    let imageLoaded = false;

    // 加载玩家图片
    const playerImage = new Image();
    playerImage.onload = () => {
        console.log('Player image loaded successfully');
        imageLoaded = true;
    };
    playerImage.onerror = (e) => {
        console.error('Failed to load player image:', e);
        // 如果图片加载失败，使用默认的红色方块
        imageLoaded = false;
    };
    playerImage.src = 'assets/player.png.jpg';  // 修改为正确的文件名

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

    // 平台数组
    const platforms = [
        { x: 0, y: canvas.height - 40, width: canvas.width, height: 40, color: '#8B4513' },
        { x: 300, y: canvas.height - 120, width: 200, height: 20, color: '#8B4513' },
        { x: 600, y: canvas.height - 160, width: 200, height: 20, color: '#8B4513' },
        { x: 100, y: canvas.height - 200, width: 200, height: 20, color: '#8B4513' }
    ];

    // 金币数组
    const coins = [
        { x: 350, y: canvas.height - 160, width: 20, height: 20, collected: false, color: '#FFD700' },
        { x: 650, y: canvas.height - 200, width: 20, height: 20, collected: false, color: '#FFD700' },
        { x: 150, y: canvas.height - 240, width: 20, height: 20, collected: false, color: '#FFD700' }
    ];

    // 鼠标事件监听
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        
        // 更新角色朝向
        player.facingRight = mouseX > player.x;
    });

    canvas.addEventListener('mousedown', () => {
        isMouseDown = true;
        if (!player.isJumping) {
            player.velocityY = -player.jumpForce;
            player.isJumping = true;
            console.log('Jumping');
        }
    });

    canvas.addEventListener('mouseup', () => {
        isMouseDown = false;
    });

    // 碰撞检测
    function checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    // 更新游戏状态
    function update() {
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

        // 边界检查
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
        if (player.y + player.height > canvas.height) {
            player.y = canvas.height - player.height;
            player.velocityY = 0;
            player.isJumping = false;
        }
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