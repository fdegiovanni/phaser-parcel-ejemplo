import Phaser from "phaser";
import { getPhrase } from "../services/translations";
import { sharedInstance as events } from "./EventCenter";
import keys from "../enums/keys";

export default class UI extends Phaser.Scene {
  #starsLabel;
  #starsCollected = 0;
  #graphics;
  #lastHealth = 100;
  #language;

  #scoreText = keys.sceneGame.score;

  constructor() {
    super({ key: "ui" });
  }

  init({ language }) {
    this.#starsCollected = 0;
    this.#language = language;
  }

  create() {
    this.#graphics = this.add.graphics();
    this.setHealthBar(100);

    this.starsLabel = this.add.text(10, 35, `${getPhrase(this.#scoreText)}: 0`, {
      fontSize: "32px",
    });

    events.on("star-collected", this.handleStarCollected, this);
    events.on("health-changed", this.handleHealthChanged, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      events.off("star-collected", this.handleStarCollected, this);
    });
  }

  setHealthBar(value) {
    const width = 200;
    const percent = Phaser.Math.Clamp(value, 0, 100) / 100;

    // Se le definen las propiedad al grafico que se usa de barra de salud
    this.#graphics.clear();
    // se agrega color grisado
    this.#graphics.fillStyle(0x808080);

    //se le da forma de rectangulo, con bordes redondeados.
    this.#graphics.fillRoundedRect(10, 10, width, 20, 5);
    if (percent > 0) {
      this.#graphics.fillStyle(0x00ff00);

      //se pinta de verda el proporcional a la vida que le queda
      this.#graphics.fillRoundedRect(10, 10, width * percent, 20, 5);
    }
  }

  handleHealthChanged(value) {
    this.tweens.addCounter({
      from: this.#lastHealth,
      to: value,
      duration: 200,
      ease: Phaser.Math.Easing.Sine.InOut,
      onUpdate: (tween) => {
        const value = tween.getValue();
        this.setHealthBar(value);
      },
    });

    this.#lastHealth = value;
  }

  handleStarCollected() {
    ++this.#starsCollected;
    this.starsLabel.text = `${getPhrase(this.#scoreText)}: ${this.#starsCollected}`;
  }
}
