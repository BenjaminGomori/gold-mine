let config = {
    width:500,
    height: 550,
    backgroundColor: '#999999',
    scene: [SceneMain],
    pixelArt: true,
    physics:{
        default: 'arcade',
        arcade:{
            debug: false
        }
    }
}

window.onload = function(){
    let game = new Phaser.Game(config);
}
