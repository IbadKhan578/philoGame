import Phaser from 'phaser';
import GameScene from './GameScene';

export const createGameConfig = (parent) => {
  return {
    type: Phaser.AUTO,
    parent: parent,
    width: window.innerWidth,
    height: window.innerHeight,
    pixelArt: true,
    roundPixels: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    backgroundColor: '#69a855',
    scene: [GameScene],
  };
};

export default createGameConfig;
