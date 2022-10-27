import Phaser from "phaser";
import { getPhrase } from "../services/translations";
import keys from "../enums/keys";

export default class GameOver extends Phaser.Scene {
	#language;

	#gameOverText = keys.sceneGameOver.gameOver;
	#retryText = keys.sceneGameOver.retry;

    constructor () {
        super('game-over');
    }

	init({ language }) {
		this.#language = language;
	}

    create(){
        const { width, height } = this.scale

		this.add.text(width * 0.5, height * 0.3, getPhrase(this.#gameOverText), {
			fontSize: '52px',
			color: '#ff0000'
		})
		.setOrigin(0.5)

		const button = this.add.rectangle(width * 0.5, height * 0.55, 150, 75, 0xffffff)
			.setInteractive()
			.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
				this.scene.start('game')
			})

		this.add.text(button.x, button.y, getPhrase(this.#retryText), {
			color: '#000000'
		})
		.setOrigin(0.5)
    }
}