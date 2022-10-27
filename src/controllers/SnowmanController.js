import StateMachine from "../statemachine/StateMachine";
import { sharedInstance as events } from "../scenes/EventCenter";

export default class SnowmanController {
    #scene;
    #sprite;
    #stateMachine;
    #moveTime;

    constructor(scene, sprite) {
        this.#scene = scene;
        this.#sprite = sprite;

        this.createAnimations();
        this.#stateMachine = new StateMachine(this, 'snowman');

        this.#stateMachine.addState('idle', {
			onEnter: this.idleOnEnter
		})
		.addState('move-left', {
			onEnter: this.moveLeftOnEnter,
			onUpdate: this.moveLeftOnUpdate
		})
		.addState('move-right', {
			onEnter: this.moveRightOnEnter,
			onUpdate: this.moveRightOnUpdate
		})
		.addState('dead')
		.setState('idle')

		events.on('snowman-stomped', this.handleStomped, this)
    }

    createAnimations() {
		this.#sprite.anims.create({
			key: 'idle',
			frames: [{ key: 'snowman', frame: 'snowman_left_1.png' }]
		})

		this.#sprite.anims.create({
			key: 'move-left',
			frames: this.#sprite.anims.generateFrameNames('snowman', {
				start: 1,
				end: 2,
				prefix: 'snowman_left_',
				suffix: '.png'
			}),
			frameRate: 5,
			repeat: -1
		})

		this.#sprite.anims.create({
			key: 'move-right',
			frames: this.#sprite.anims.generateFrameNames('snowman', {
				start: 1,
				end: 2,
				prefix: 'snowman_right_',
				suffix: '.png'
			}),
			frameRate: 5,
			repeat: -1
		})
	}

    idleOnEnter() {
		this.#sprite.play('idle');
		const r = Phaser.Math.Between(1, 100);
		
		// probabilidad de que se mueve para un lado o el otro.
		if (r < 50) {
			this.#stateMachine.setState('move-left');
		}
		else {
			this.#stateMachine.setState('move-right');
		}
	}

    moveLeftOnEnter() {
		this.#moveTime = 0;
		this.#sprite.play('move-left');
	}

    moveLeftOnUpdate(dt) {
		// dt = delta time es el tiempo desde el ultimo frame
		// se suma y se acumula
		// cuando sea mayor a 2segundos, cambia de sentido
		
		this.#moveTime += dt;
		this.#sprite.setVelocityX(-3);

		if (this.#moveTime > 2000) {
			this.#stateMachine.setState('move-right');
		}
	}

    moveRightOnEnter() {
		this.#moveTime = 0;
		this.#sprite.play('move-right');
	}

    moveRightOnUpdate(dt) {
		// dt = delta time es el tiempo desde el ultimo frame
		// se suma y se acumula
		// cuando sea mayor a 2segundos, cambia de sentido

		this.#moveTime += dt;
		this.#sprite.setVelocityX(3);

		if (this.#moveTime > 2000) {
			this.#stateMachine.setState('move-left');
		}
	}

    handleStomped(snowman) {
		if (this.#sprite !== snowman) {
			return
		}

		events.off('snowman-stomped', this.handleStomped, this);

		this.#scene.tweens.add({
			targets: this.#sprite,
			displayHeight: 0,
			y: this.#sprite.y + (this.#sprite.displayHeight * 0.5),
			duration: 200,
			onComplete: () => {
				this.#sprite.destroy()
			}
		})

		this.#stateMachine.setState('dead');
	}

	destroy() {
		events.off('snowman-stomped', this.handleStomped, this)
	}

	update(dt)
	{
		this.#stateMachine.update(dt)
	}
}