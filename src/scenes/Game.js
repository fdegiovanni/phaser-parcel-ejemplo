import Phaser from "phaser";
import ObstaclesController from "../controllers/ObstaclesController";
import PlayerController from "../controllers/PlayerController";
import SnowmanController from "../controllers/SnowmanController";

export default class Game extends Phaser.Scene {
    #cursors;
    #penquin;
    #playerController;
    #obstacles;
    #snowmen;

    constructor() {
		super('game');
	}

    init({language}) {
        this.language = language;
        this.#cursors = this.input.keyboard.createCursorKeys();
		this.#obstacles = new ObstaclesController();
		this.#snowmen = [];

		//manejador del evento de 'apagado' de la escena
		this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
			this.destroy();
		})
    }

    preload() {
		//precarga de assets
		this.load.image('tiles', 'assets/sheet.png');
		this.load.tilemapTiledJSON('tilemap', 'assets/game.json');

		this.load.image('star', 'assets/star.png');
		this.load.image('health', 'assets/health.png');

		this.load.atlas('snowman', 'assets/snowman.png', 'assets/snowman.json');
	}

    create()
	{
		//carga el menu de interfaz
		this.scene.launch('ui');

		/////////////////////////////////////////////////////////
		////////////// INICIO DE ARMADO DE MAPA//////////////////
		/////////////////////////////////////////////////////////

		const map = this.make.tilemap({ key: 'tilemap' });
		const tileset = map.addTilesetImage('iceworld', 'tiles');

		const ground = map.createLayer('ground', tileset);
		ground.setCollisionByProperty({ collides: true });

		map.createLayer('obstacles', tileset);

		const objectsLayer = map.getObjectLayer('objects');

		 objectsLayer.objects.forEach(objData => {
			const { x = 0, y = 0, name, width = 0, height = 0 } = objData;

			switch (name) {
				// por cada 'etiqueta' de elemento que encuentra
				// lo trabaja de una manera particular

				case 'penquin-spawn': {
					// si el objeto es un pinguino

					// crea es asset "pinguino"
					this.#penquin = this.matter.add.sprite(x + (width * 0.5), y, 'penquin')
						.setFixedRotation()
					
					//Crea el controlador del pinquino
					// Le pasa los parametros necesarios (para este caso)
					this.playerController = new PlayerController(
						this,
						this.#penquin,
						this.#cursors,
						this.#obstacles
					)
					
					//pone la camara a seguir al personaje principal
					this.cameras.main.startFollow(this.#penquin, true)
					break
				}

				case 'snowman': {
					// crea es asset "snowman" - muñeco de nieve
					const snowman = this.matter.add.sprite(x, y, 'snowman')
						.setFixedRotation()

					// lo agrega a la lista "muñecoS de nieve"
					this.#snowmen.push(new SnowmanController(this, snowman))

					// lo agrega a la lista de "obstaculos"
					this.#obstacles.add('snowman', snowman.body)
					break
				}

				case 'star': {
					// crea es asset "star" - estrella
					const star = this.matter.add.sprite(x, y, 'star', undefined, {
						isStatic: true,
						isSensor: true
					})

					// se le agregan "datos" que luego se van a necesitar
					star.setData('type', 'star')
					break
				}

				case 'health': {
					// crea es asset "health" - caja de salud
					const health = this.matter.add.sprite(x, y, 'health', undefined, {
						isStatic: true,
						isSensor: true
					})
					
					//Parametros adiciones para sprites con fisicas MATTER

					//isStatic
					// A flag that indicates whether a body is considered static. 
					// A static body can never change position or angle and is completely fixed.
					
					//isSensor
					// A flag that indicates whether a body is a sensor. 
					// Sensor triggers collision events, but doesn't react with colliding body physically.

					
					// se le agregan "datos" que luego se van a necesitar
					health.setData('type', 'health')
					health.setData('healthPoints', 10)
					break
				}

				case 'spikes': {
					// crea es asset "spikes" - pinchos
					const spike = this.matter.add.rectangle(x + (width * 0.5), y + (height * 0.5), width, height, {
						isStatic: true
					})
					
					// lo agrega a la lista de "obstaculos"
					this.#obstacles.add('spikes', spike)
					break
				}
			}
		 })
		
		/////////////////////////////////////////////////////////
		////////////// FIN DE ARMADO DE MAPA//////////////////
		/////////////////////////////////////////////////////////
		
		// Convierte al mapa en el 'MUNDO'
		// similar al de la fisica ARCADE: set collider to world
		this.matter.world.convertTilemapLayer(ground)
	}

    destroy() {
		//implementacion del manejador del evento de 'apagado' de la escena
		this.scene.stop('ui');
		this.#snowmen.forEach(snowman => snowman.destroy());
	}

    update(t, dt)
	{
		//Parametros adicionales

		//@param time — The current time. 
		// Either a High Resolution Timer value if it comes from Request Animation Frame, or Date.now if using SetTimeout.
		//@param delta — The delta time in ms since the last frame. 
		// This is a smoothed and capped value based on the FPS rate. 
		
		this.#playerController?.update(dt);

		this.#snowmen.forEach(snowman => snowman.update(dt));
	}
}