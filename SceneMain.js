class SceneMain extends Phaser.Scene {
    constructor(){
        super('stage1');
    }

    preload(){
        this.load.image('miner', 'assets/miner.png');
        this.load.image('lives', 'assets/minerLives.png');
        this.load.image('guard', 'assets/guard.png');
        this.load.image('gold', 'assets/goldBar.png');
        this.load.image('crystal', 'assets/crystal.png');
        this.load.image('diamond', 'assets/diamond.png');
        this.load.image('rock', 'assets/rock.png');
        this.load.image('backgroundRegular','assets/backgrounds/regular.jpg');
        this.load.image('backgroundHot','assets/backgrounds/hot.jpg');
        this.load.image('backgroundCold','assets/backgrounds/cold.jpg');
    }

    create(){
        this.score = 0;
        this.SCORE_NUM_DIGITS = 4;
        this.minerLives = 3;
        this.stage1 = true;
        this.stage2 = false;
        this.stage3 = false;
        this.SCORE_SECTION_HEIGHT = 50;

        this.requestUserLocation(this.determineBackgroundFun);
        this.add.rectangle(0, 0, 1000, 100, 0x757575);

        //from documentation at https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Text.html
        this.scoreLabel =  this.add.text(20, 15, 'SCORE 0000', { color:'#FFD700', fontStyle:'bold', fontFamily: 'Courier New', fontSize:'30px',letterSpacing: '1.3'  });
        this.livesLabel =  this.add.text(config.width - 95, 17, `+${this.minerLives}`, { color:'#FFD700', fontStyle:'bold', fontFamily: 'Courier New', fontSize:'28px'});
        this.physics.add.image(config.width - 35, 32, 'lives').setImmovable();  

        this.miner = this.physics.add.image(0, 550, 'miner').setDepth(1).setImmovable();
        this.miner.setCollideWorldBounds(true);

        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.golds = this.add.group();  
        this.crystals = this.add.group();  
        this.diamonds = this.add.group();  
        this.guards = this.add.group();  
        this.createGold();
        this.createGuards();

        this.physics.add.collider(this.miner, this.golds, (miner, gold)=>{
            this.collectingGold(gold);
        }, null, this);

        this.physics.add.collider(this.miner, this.crystals, (miner, crystal)=>{
            this.collectingCrystals(crystal);
        }, null, this);

        this.physics.add.collider(this.miner, this.diamonds, (miner, diamond)=>{
            this.collectingDiamonds(diamond);
        }, null, this);

        this.physics.add.collider(this.miner, this.guards, (miner, guard)=>{
            this.repositionMiner();
        }, null, this);


        // These are useful when new treasures are positioned directly on the miner/wagon
        this.physics.add.overlap(this.miner, this.golds, (miner, gold)=>{
            console.log('overlap');
            this.collectingGold(gold);
        }, null, this);

        this.physics.add.overlap(this.miner, this.crystals, (miner, crystal)=>{
            console.log('overlap');
            this.collectingCrystals(crystal);
        }, null, this);

        this.physics.add.overlap(this.miner, this.diamonds, (miner, diamond)=>{            
            console.log('overlap');

            this.collectingDiamonds(diamond);
        }, null, this);
    }

    update(){
        // Controls the miner wagon movement, based on phaser week1 tutorial
        if(this.cursorKeys.left.isDown){
            this.miner.setVelocityX(-140);
        }else if(this.cursorKeys.right.isDown){
            this.miner.setVelocityX(140);
        } else if(this.cursorKeys.left.up){
            this.miner.setVelocityX(0);
        }else if(this.cursorKeys.right.isUp){
            this.miner.setVelocityX(0);
        } 

        if(this.cursorKeys.up.isDown){
            this.miner.setVelocityY(-140);
        }else if(this.cursorKeys.down.isDown){
            this.miner.setVelocityY(140);
        }else if(this.cursorKeys.up.isUp){
            this.miner.setVelocityY(0);
        }else if(this.cursorKeys.down.isUp){
            this.miner.setVelocityY(0);
        }   

        // guards fully displayed even at x vertex edges
        if((this.guard1.x <= this.guard1.width/2 && this.guard1.body.velocity.x < 0) || (this.guard1.x >= config.width - this.guard1.width/2 && this.guard1.body.velocity.x > 0)){
            let currentVelocity = this.guard1.body.velocity.x;
            this.guard1.setVelocityX(-currentVelocity);
        }
        if((this.guard2.x <= this.guard2.width/2 && this.guard2.body.velocity.x < 0) || (this.guard2.x >= config.width - this.guard2.width/2 && this.guard2.body.velocity.x > 0)){
            let currentVelocity = this.guard2.body.velocity.x;
            this.guard2.setVelocityX(-currentVelocity);
        }

        // wagon can not access the score section
        if(this.miner.y <= this.SCORE_SECTION_HEIGHT + this.miner.height/2 && this.miner.body.velocity.y < 0){
            this.miner.setVelocityY(0);
            this.miner.y = this.SCORE_SECTION_HEIGHT + this.miner.height/2
        }
    }

    createGold = () => {
        let goldWidth = 110;
        let goldHeight = 73;
        
        for(let i = 0; i< 18; i++){
            let x = Math.random() * (config.width - goldWidth);
            let y = Math.random() * (config.height - this.SCORE_SECTION_HEIGHT - goldHeight);
            let gold = this.physics.add.image(x + goldWidth/2, y + this.SCORE_SECTION_HEIGHT + goldHeight/2, 'gold').setImmovable();  
            this.golds.add(gold);
        }
    }

    createCrystals = () => {
        let crystalWidth = 40; 
        let crystalHeight = 52; 

        for(let i = 0; i< 8; i++){
            let x = Math.random() * (config.width - crystalWidth);
            let y = Math.random() * (config.height - this.SCORE_SECTION_HEIGHT - crystalHeight);
            let crystal = this.physics.add.image(x + crystalWidth/2, y + this.SCORE_SECTION_HEIGHT + crystalHeight, 'crystal').setImmovable();  
            this.crystals.add(crystal);
        }
    }

    createDiamonds = () => {
        let diamondWidth = 37;
        let diamondHeight = 30;

        for(let i = 0; i< 5; i++){
            let x = Math.random() * (config.width - diamondWidth);
            let y = Math.random() * (config.height - this.SCORE_SECTION_HEIGHT - diamondHeight);
            let diamond = this.physics.add.image(x + diamondWidth/2, y + this.SCORE_SECTION_HEIGHT + diamondHeight, 'diamond').setImmovable();  
            this.diamonds.add(diamond);
        }
    }

    createGuards = () => {
        let x1 = 50;
        let y1 = 400;
        let x2 = 450;
        let y2 = 200;
        this.guard1 = this.physics.add.image(x1, y1, 'guard').setDepth(1).setImmovable();  
        this.guard2 = this.physics.add.image(x2, y2, 'guard').setDepth(1).setImmovable();  
        this.guards.add(this.guard1);
        this.guards.add(this.guard2);
        this.guard1.setVelocityX(200);
        this.guard2.setVelocityX(-300);
    }

    collectingGold = (gold) => {
        this.score += 25;
        gold.destroy();
        this.adjustScoreLabel();

        if(this.golds.children.size === 0){
            if(this.stage2 === false){
                this.createGold();
                this.createCrystals();
                this.stage2 = true;
            } else if(this.stage3 === true && this.crystals.children.size === 0 && this.diamonds.children.size === 0){
                this.gameCompleted();
            } else if(this.stage3 === false && this.crystals.children.size === 0){
                this.createGold();
                this.createCrystals();
                this.createDiamonds();
                this.stage3 = true;
            } 
        }
    }

    collectingCrystals = (crystal) => {
        this.score += 125;
        crystal.destroy();
        this.adjustScoreLabel();

        if(this.crystals.children.size === 0 && this.golds.children.size === 0){
            if(this.stage3 === true && this.diamonds.children.size === 0){
                this.gameCompleted();
            }else if(this.stage3 === false) {
                this.stage3 = true;
                this.createGold();
                this.createCrystals();
                this.createDiamonds();
            }
        }
    }

    collectingDiamonds = (diamond) => {
        this.score += 425;
        diamond.destroy();
        this.adjustScoreLabel();

        if(this.diamonds.children.size === 0 && this.crystals.children.size === 0 && this.golds.children.size === 0){
            this.gameCompleted();
        }
    }

    repositionMiner = () => {
        this.miner.x = 0;
        this.miner.y = 500;
        this.minerLives--;
        this.livesLabel.text = `+${this.minerLives}`; 

        if(this.minerLives<0){
            alert(`
            Game over.
            Your score is: ${this.score}. 
            New game will start.`);
            //from https://stackoverflow.com/questions/58317743/how-to-reload-the-game-on-phaser-3
            this.registry.destroy(); // destroy registry
            this.events.off(); // disable all active events
            this.scene.restart();// restart current scene
        }
    }


    gameCompleted=()=>{
       alert(`
            Game Completed!
            Your score is: ${this.score}
            New game will start.`);
             //from https://stackoverflow.com/questions/58317743/how-to-reload-the-game-on-phaser-3
            this.registry.destroy(); // destroy registry
            this.events.off(); // disable all active events
            this.scene.restart();// restart current scene
    }

    adjustScoreLabel(){
        let maxDigits = Math.pow(10, this.SCORE_NUM_DIGITS);
        let scoreString = '';

        while(this.score < maxDigits){
            if(maxDigits<1) break;
            scoreString += '0';
            maxDigits /= 10;
        }
        this.scoreLabel.text = 'SCORE ' + scoreString + this.score;
    }

    //I used similar code for the extra credit assignment - Benjamin Gomori
    requestUserLocation(determineBackgroundFun){
        if('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                let latitude = position.coords.latitude;
                let longitude = position.coords.longitude;
                let temperature = -1234;
                const KEY = "40957205b16d09e2892fceabaad8f847";
                let url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${KEY}&units=metric`;
                // this.temperature = 
                fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.main && data.main.temp !== undefined){
                        temperature = data.main.temp;
                    }
                    console.log('temperature: ' + temperature + ' Celsius');
                    determineBackgroundFun(temperature);
                })
                .catch(err => console.warn(err.message));
            });
        } else {
            console.log('Geo Location is not available');
        }
    }

    determineBackgroundFun = (temperature) => {
        // if no temperature was retrieved from the api
        if(temperature === -1234) return; 

        if(temperature <= 15){
            this.background = this.add.tileSprite(0, 0, config.width, config.height, 'backgroundCold', this).setDepth(-1);
            this.background.setOrigin(0, 0);
        } else if(temperature > 15 && temperature < 25){
            this.background = this.add.tileSprite(0, 0, config.width, config.height, 'backgroundRegular', this).setDepth(-1);
            this.background.setOrigin(0, 0);       
        } else {
            this.background = this.add.tileSprite(0, 0, config.width, config.height, 'backgroundHot', this).setDepth(-1);
            this.background.setOrigin(0, 0);
        }
    } 
}
