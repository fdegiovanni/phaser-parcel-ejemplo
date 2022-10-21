import Phaser from 'phaser'

import Game from './scenes/Game'
import UI from './scenes/UI'
import GameOver from './scenes/GameOver'
import Preload from './scenes/Preload'
import InitialMenu from './scenes/InitialMenu'

const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		min: {
			width: 800,
			height: 600,
		},
		max: {
			width: 1600,
			height: 1200,
		},
	},
	physics: {
		default: 'matter',
		matter: {
			debug: true,
		}
	},
	scene: [Preload, InitialMenu, Game, UI, GameOver]
}

export default new Phaser.Game(config)
