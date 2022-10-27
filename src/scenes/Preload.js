import Phaser from "phaser";
import { getLanguageConfig, getTranslations } from "../services/translations";

export default class Preload extends Phaser.Scene {
    #language;

    constructor() {
        super('preload');
    }

    preload(){
        this.#language = getLanguageConfig();
        alert(this.#language)
        
        this.load.atlas('penquin', 'assets/penquin.png', 'assets/penquin.json');
        this.load.image('sky', 'assets/space3.png')
        this.load.image('red', 'assets/red.png')
    }

    create(){
        getTranslations(
            this.#language,
            () => this.scene.start('menu', { language: this.#language }),
        );
    }
}