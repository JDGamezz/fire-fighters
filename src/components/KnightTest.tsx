import { useState, useEffect, useCallback, useRef } from "react";

// Animations
import idleRight from "@/assets/Idle_Animation_Knight_Right.gif";
import idleLeft from "@/assets/Idle_Animation_Knight_Left.gif";
import runRight from "@/assets/Knight_Running_Right.gif";
import runLeft from "@/assets/Knight_Running_Left.gif";
import attackRight from "@/assets/Knight_Normal_Attack.gif";
import attackLeft from "@/assets/Knight_Normal_Attack_Left.gif";
import crouchWalkRight from "@/assets/Crouch_Walking_Right.gif";
import crouchWalkLeft from "@/assets/Crouch_Walking_Left.gif";
import crouchAttackRight from "@/assets/Crouch_Attack_Right.gif";
import crouchAttackLeft from "@/assets/Crouch_Attack_Left.gif";

import fireEnemy from "@/assets/fire-enemy.gif";
import candleEnemyLeft from "@/assets/candle_enemy_left.gif";
import candleEnemyRight from "@/assets/candle_enemy_right.gif";
import candleEnemyIdle from "@/assets/candle_enemy_idle.gif";
import candleDissolvingGif from "@/assets/candle_enemy_dissolving.gif";
import fireBoss from "@/assets/fire_boss.gif";

import bgLevel1 from "@/assets/bg_level_1.png";
import bgLevel2 from "@/assets/bg_level_2.png";
import bgLevel3 from "@/assets/bg_level_3.png";
import bgBoss from "@/assets/bg_boss.png";

import titleMainMusic from "@/assets/title_main_music.webm";
import bossMusic from "@/assets/boss_music.webm";

type Direction = "left" | "right";
type State = "idle" | "run" | "attack" | "crouch-idle" | "crouch-walk" | "crouch-attack";
type GameState = "menu" | "playing" | "boss" | "level-complete" | "game-over";

const animations: Record<string, string> = {
  "idle-right": idleRight,
  "idle-left": idleLeft,
  "run-right": runRight,
  "run-left": runLeft,
  "attack-right": attackRight,
  "attack-left": attackLeft,
  "crouch-idle-right": crouchWalkRight,
  "crouch-idle-left": crouchWalkLeft,
  "crouch-walk-right": crouchWalkRight,
  "crouch-walk-left": crouchWalkLeft,
  "crouch-attack-right": crouchAttackRight,
  "crouch-attack-left": crouchAttackLeft,
};

const PLAY_AREA_MIN_Y = 0;
const PLAY_AREA_MAX_Y = 87;

export const KnightTest = () => {
  const [direction, setDirection] = useState<Direction>("right");
  const [state, setState] = useState<State>("idle");
  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(60);
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [isAttacking, setIsAttacking] = useState(false);
  const [isCrouching, setIsCrouching] = useState(false);
  const [gameState, setGameState] = useState<GameState>("menu");

  /* ===========================
     🔹 SMOOTH MOVEMENT SYSTEM
     =========================== */

  const velocityX = useRef(0);
  const velocityY = useRef(0);

  const TARGET_SPEED = 1.8;
  const ACCEL = 0.25;
  const FRICTION = 0.85;

  /* ===========================
     🔹 INPUT HANDLING
     =========================== */

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    setKeys((prev) => new Set(prev).add(e.key.toLowerCase()));

    if (e.key.toLowerCase() === "c") {
      setIsCrouching((c) => !c);
    }

    if (e.key === " " && !isAttacking) {
      setIsAttacking(true);
      setTimeout(() => setIsAttacking(false), 350);
    }
  }, [isAttacking]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setKeys((prev) => {
      const next = new Set(prev);
      next.delete(e.key.toLowerCase());
      return next;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  /* ===========================
     🔹 PLAYER STATE LOGIC
     =========================== */

  useEffect(() => {
    const left = keys.has("arrowleft") || keys.has("a");
    const right = keys.has("arrowright") || keys.has("d");
    const up = keys.has("arrowup") || keys.has("w");
    const down = keys.has("arrowdown") || keys.has("s");

    const moving = left || right || up || down;

    if (left) setDirection("left");
    if (right) setDirection("right");

    if (isAttacking) setState(isCrouching ? "crouch-attack" : "attack");
    else if (isCrouching && moving) setState("crouch-walk");
    else if (isCrouching) setState("crouch-idle");
    else if (moving) setState("run");
    else setState("idle");
  }, [keys, isAttacking, isCrouching]);

  /* ===========================
     🔹 SMOOTH MOVEMENT LOOP
     =========================== */

  useEffect(() => {
    if (gameState !== "playing" && gameState !== "boss") return;

    let last = performance.now();

    const loop = (now: number) => {
      const delta = (now - last) / 16.67;
      last = now;

      const left = keys.has("arrowleft") || keys.has("a");
      const right = keys.has("arrowright") || keys.has("d");
      const up = keys.has("arrowup") || keys.has("w");
      const down = keys.has("arrowdown") || keys.has("s");

      const speed = isCrouching ? TARGET_SPEED * 0.5 : TARGET_SPEED;

      if (!isAttacking) {
        if (left) velocityX.current -= ACCEL * delta;
        if (right) velocityX.current += ACCEL * delta;
        if (up) velocityY.current += ACCEL * delta;
        if (down) velocityY.current -= ACCEL * delta;
      }

      velocityX.current = Math.max(-speed, Math.min(speed, velocityX.current));
      velocityY.current = Math.max(-speed, Math.min(speed, velocityY.current));

      velocityX.current *= FRICTION;
      velocityY.current *= FRICTION;

      if (!left && !right) velocityX.current = 0;
      if (!up && !down) velocityY.current = 0;

      if (!isAttacking) {
        setPositionX((x) => Math.max(5, Math.min(95, x + velocityX.current * delta)));
        setPositionY((y) =>
          Math.max(PLAY_AREA_MIN_Y, Math.min(PLAY_AREA_MAX_Y, y + velocityY.current * delta))
        );
      } else {
        velocityX.current = 0;
        velocityY.current = 0;
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }, [keys, isAttacking, isCrouching, gameState]);

  /* ===========================
     🔹 RENDER
     =========================== */

  const currentAnimation = animations[`${state}-${direction}`];

  return (
    <div className="relative w-[800px] h-[500px] bg-black overflow-hidden">
      {(gameState === "playing" || gameState === "boss") && (
        <div
          className="absolute transition-transform duration-50 ease-out"
          style={{
            left: `${positionX}%`,
            bottom: `${80 + positionY}px`,
            transform: `translateX(-50%) scale(2)`,
          }}
        >
          <img src={currentAnimation} alt="Knight" className="w-16 h-16" />
        </div>
      )}
    </div>
  );
};
