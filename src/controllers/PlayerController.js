import Phaser from "phaser";
import StateMachine from "../statemachine/StateMachine";
import { sharedInstance as events } from "../scenes/EventCenter";
import ObstaclesController from "./ObstaclesController";

export default class PlayerController {
  #scene;
  #sprite;
  #cursors;
  #obstacles;
  #stateMachine;
  #health = 100;
  #lastSnowman;

  constructor(scene, sprite, cursors, obstacles) {
    this.#scene = scene;
    this.#sprite = sprite;
    this.#cursors = cursors;
    this.#obstacles = obstacles;

    this.createAnimations();

    this.#stateMachine = new StateMachine(this, "player");

    this.#stateMachine
      .addState("idle", {
        onEnter: this.idleOnEnter,
        onUpdate: this.idleOnUpdate,
      })
      .addState("walk", {
        onEnter: this.walkOnEnter,
        onUpdate: this.walkOnUpdate,
        onExit: this.walkOnExit,
      })
      .addState("jump", {
        onEnter: this.jumpOnEnter,
        onUpdate: this.jumpOnUpdate,
      })
      .addState("spike-hit", {
        onEnter: this.spikeHitOnEnter,
      })
      .addState("snowman-hit", {
        onEnter: this.snowmanHitOnEnter,
      })
      .addState("snowman-stomp", {
        onEnter: this.snowmanStompOnEnter,
      })
      .addState("dead", {
        onEnter: this.deadOnEnter,
      })
      .setState("idle");

    this.#sprite.setOnCollide((data) => {
      const body = data.bodyB;

      if (this.#obstacles.is("spikes", body)) {
        //si es un pincho, llama a la funcion spike-hit
        this.#stateMachine.setState("spike-hit");
        return;
      }

      if (this.#obstacles.is("snowman", body)) {
        this.#lastSnowman = body.gameObject;
        if (this.#sprite.y < body.position.y) {
          //si es un snowman, y lo choca de "arriba", lo pisa y mata. Llama a la funcion snowman-stomp

          // stomp on snowman
          this.#stateMachine.setState("snowman-stomp");
        } else {
          //si es un snowman, y lo choca otro lado que no sea arriba
          // Llama a la funcion snowman-hit

          // hit by snowman
          this.#stateMachine.setState("snowman-hit");
        }
        return;
      }

      const gameObject = body.gameObject;

      if (!gameObject) {
        return;
      }

      if (gameObject instanceof Phaser.Physics.Matter.TileBody) {
        if (this.#stateMachine.isCurrentState("jump")) {
          this.#stateMachine.setState("idle");
        }
        return;
      }

      const sprite = gameObject;
      const type = sprite.getData("type");

      switch (type) {
        case "star": {
          // Llama a cada uno de los oyentes registrados para un evento determinado.
          // para este caso, star-collected, lo va a escuchar la UI
          events.emit("star-collected");
          sprite.destroy();
          break;
        }

        case "health": {
          const value = sprite.getData("healthPoints") ?? 10;

          //Forzar un valor dentro de los límites sujetándolo al rango mínimo, máximo.
          //evita que se pase de 100 y que sea menor a 0
          this.#health = Phaser.Math.Clamp(this.#health + value, 0, 100);

          // Llama a evento health-changed, lo va a escuchar la UI.
          events.emit("health-changed", this.#health);
          sprite.destroy();
          break;
        }
      }
    });
  }

  update(dt) {
    this.#stateMachine.update(dt);
  }

  idleOnEnter() {
    this.#sprite.play("player-idle");
  }

  idleOnUpdate() {
    if (this.#cursors.left.isDown || this.#cursors.right.isDown) {
      this.#stateMachine.setState("walk");
    }

    const spaceJustPressed = Phaser.Input.Keyboard.JustDown(
      this.#cursors.space
    );
    if (spaceJustPressed) {
      this.#stateMachine.setState("jump");
    }
  }

  walkOnEnter() {
    this.#sprite.play("player-walk");
  }

  walkOnUpdate() {
    const speed = 5;

    if (this.#cursors.left.isDown) {
      this.#sprite.flipX = true;
      this.#sprite.setVelocityX(-speed);
    } else if (this.#cursors.right.isDown) {
      this.#sprite.flipX = false;
      this.#sprite.setVelocityX(speed);
    } else {
      this.#sprite.setVelocityX(0);
      this.#stateMachine.setState("idle");
    }

    const spaceJustPressed = Phaser.Input.Keyboard.JustDown(
      this.#cursors.space
    );
    if (spaceJustPressed) {
      this.#stateMachine.setState("jump");
    }
  }

  walkOnExit() {
    this.#sprite.stop();
  }

  jumpOnEnter() {
    this.#sprite.setVelocityY(-12);
  }

  jumpOnUpdate() {
    const speed = 5;

    if (this.#cursors.left.isDown) {
      this.#sprite.flipX = true;
      this.#sprite.setVelocityX(-speed);
    } else if (this.#cursors.right.isDown) {
      this.#sprite.flipX = false;
      this.#sprite.setVelocityX(speed);
    }
  }

  spikeHitOnEnter() {
    this.#sprite.setVelocityY(-12);

    const startColor = Phaser.Display.Color.ValueToColor(0xffffff);
    const endColor = Phaser.Display.Color.ValueToColor(0xff0000);

    this.#scene.tweens.addCounter({
      from: 0,
      to: 100,
      duration: 100,
      repeat: 2,
      yoyo: true,
      ease: Phaser.Math.Easing.Sine.InOut,
      onUpdate: (tween) => {
        const value = tween.getValue();
        const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(
          startColor,
          endColor,
          100,
          value
        );

        const color = Phaser.Display.Color.GetColor(
          colorObject.r,
          colorObject.g,
          colorObject.b
        );

        this.#sprite.setTint(color);
      },
    });

    this.#stateMachine.setState("idle");

    this.setHealth(this.#health - 10);
  }

  snowmanHitOnEnter() {
    if (this.#lastSnowman) {
      if (this.#sprite.x < this.#lastSnowman.x) {
        this.#sprite.setVelocityX(-20);
      } else {
        this.#sprite.setVelocityX(20);
      }
    } else {
      this.#sprite.setVelocityY(-20);
    }

    const startColor = Phaser.Display.Color.ValueToColor(0xffffff);
    const endColor = Phaser.Display.Color.ValueToColor(0x0000ff);

    this.#scene.tweens.addCounter({
      from: 0,
      to: 100,
      duration: 100,
      repeat: 2,
      yoyo: true,
      ease: Phaser.Math.Easing.Sine.InOut,
      onUpdate: (tween) => {
        const value = tween.getValue();
        const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(
          startColor,
          endColor,
          100,
          value
        );

        const color = Phaser.Display.Color.GetColor(
          colorObject.r,
          colorObject.g,
          colorObject.b
        );

        this.#sprite.setTint(color);
      },
    });

    this.#stateMachine.setState("idle");

    this.setHealth(this.#health - 25);
  }

  snowmanStompOnEnter() {
    this.#sprite.setVelocityY(-10);

    //le manda un mensaje al snowman que se choco con el player
    // Llama a evento snowman-stomped, lo va a escuchar snowmanController.
    events.emit("snowman-stomped", this.#lastSnowman);

    this.#stateMachine.setState("idle");
  }

  deadOnEnter() {
    this.#sprite.play("player-death");

    //si el personaje muere, se sacan las colisiones
    this.#sprite.setOnCollide(() => {});

    this.#scene.time.delayedCall(1500, () => {
      this.#scene.scene.start("game-over");
    });
  }

  setHealth(value) {
    this.#health = Phaser.Math.Clamp(value, 0, 100);

    // Llama a evento health-changed, lo va a escuchar la UI.
    events.emit("health-changed", this.#health);

    // TODO: check for death
    if (this.#health <= 0) {
      this.#stateMachine.setState("dead");
    }
  }

  createAnimations() {
    this.#sprite.anims.create({
      key: "player-idle",
      frames: [{ key: "penquin", frame: "penguin_walk01.png" }],
    });

    this.#sprite.anims.create({
      key: "player-walk",
      frameRate: 10,
      frames: this.#sprite.anims.generateFrameNames("penquin", {
        start: 1,
        end: 4,
        prefix: "penguin_walk0",
        suffix: ".png",
      }),
      repeat: -1,
    });

    this.#sprite.anims.create({
      key: "player-death",
      frames: this.#sprite.anims.generateFrameNames("penquin", {
        start: 1,
        end: 4,
        prefix: "penguin_die",
        zeroPad: 2,
        suffix: ".png",
      }),
      frameRate: 10,
    });
  }
}
