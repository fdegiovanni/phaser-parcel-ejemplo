import Phaser from "phaser";
import { DE_DE, EN_US, ES_AR, PT_BR } from "../enums/languages";
import { FETCHED, FETCHING, READY, TODO } from "../enums/status";
import { getTranslations, getPhrase } from "../services/translations";
import keys from "../enums/keys";

export default class InitialMenu extends Phaser.Scene {
  #textSpanish;
  #textGerman;
  #textEnglish;
  #textPortuguese;

  #updatedTextInScene;
  #updatedString = "Siguiente";
  #wasChangedLanguage = TODO;

  constructor() {
    super("menu");
    const { next, hello, howAreU } = keys.sceneInitialMenu;
    this.#updatedString = next;
    this.hello = hello;
    this.howAreU = howAreU;
  }

  init({ language }) {
    this.language = language;
  }

  create() {
    const { width, height } = this.scale;

    this.add.image(400, 300, "sky");
    this.matter.world.setBounds(0, 0, width, height);

    const player = this.matter.add.sprite(400, 300, "penquin");

    player.setVelocity(100, 200);
    player.setBounce(1);

    const buttonSpanish = this.add
      .rectangle(width * 0.1, height * 0.15, 150, 75, 0xffffff)
      .setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
        this.getTranslations(ES_AR);
      });

    this.#textSpanish = this.add
      .text(buttonSpanish.x, buttonSpanish.y, "Español", {
        color: "#000000",
      })
      .setOrigin(0.5);

    const buttonGerman = this.add
      .rectangle(width * 0.3, height * 0.15, 150, 75, 0xffffff)
      .setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
        this.getTranslations(DE_DE);
      });

    this.#textGerman = this.add
      .text(buttonGerman.x, buttonGerman.y, "Aleman", {
        color: "#000000",
      })
      .setOrigin(0.5);

    const buttonEnglish = this.add
      .rectangle(width * 0.5, height * 0.15, 150, 75, 0xffffff)
      .setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
        this.getTranslations(EN_US);
      });

    this.#textEnglish = this.add
      .text(buttonEnglish.x, buttonEnglish.y, "Inglés", {
        color: "#000000",
      })
      .setOrigin(0.5);

    const buttonPortuguese = this.add
      .rectangle(width * 0.7, height * 0.15, 150, 75, 0xffffff)
      .setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
        this.getTranslations(PT_BR);
      });

    this.#textPortuguese = this.add
      .text(buttonPortuguese.x, buttonPortuguese.y, "Portugués", {
        color: "#000000",
      })
      .setOrigin(0.5);

    const buttonUpdate = this.add
      .rectangle(width * 0.5, height * 0.75, 150, 75, 0x44d27e)
      .setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
        this.scene.start("game", { language: this.language });
      });

    this.#updatedTextInScene = this.add
      .text(buttonUpdate.x, buttonUpdate.y, getPhrase(this.#updatedString), {
        color: "#000000",
      })
      .setOrigin(0.5);

    this.helloText = this.add.text(
      width * 0.5,
      height * 0.3,
      getPhrase(this.hello),
      {
        color: "#ffffff",
      }
    );

    this.howAreUText = this.add.text(
      width * 0.5,
      height * 0.45,
      getPhrase(this.howAreU),
      {
        color: "#ffffff",
      }
    );
  }

  update() {
    if (this.#wasChangedLanguage === FETCHED) {
      this.#wasChangedLanguage = READY;
      this.#updatedTextInScene.setText(getPhrase(this.#updatedString));
      this.helloText.setText(getPhrase(this.hello));
      this.howAreUText.setText(getPhrase(this.howAreU));
    }
  }

  updateWasChangedLanguage = () => {
    this.#wasChangedLanguage = FETCHED;
  };

  async getTranslations(language) {
    this.language = language;
    this.#wasChangedLanguage = FETCHING;

    await getTranslations(language, this.updateWasChangedLanguage);
  }
}
