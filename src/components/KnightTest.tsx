import { useState, useEffect, useCallback, useRef } from "react";

// Import all knight animations
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

// Level backgrounds
import bgLevel1 from "@/assets/bg_level_1.png";
import bgLevel2 from "@/assets/bg_level_2.png";
import bgLevel3 from "@/assets/bg_level_3.png";
import bgBoss from "@/assets/bg_boss.png";

// Music
import titleMainMusic from "@/assets/title_main_music.webm";
import bossMusic from "@/assets/boss_music.webm";

type Direction = "left" | "right";
type State = "idle" | "run" | "attack" | "crouch-idle" | "crouch-walk" | "crouch-attack";
type GameState = "menu" | "playing" | "boss" | "level-complete" | "game-over";
type EnemyType = "fire";
type BossType = "candle" | "fire";

/* ---------- unchanged code above ---------- */

export const KnightTest = () => {
  const [direction, setDirection] = useState<Direction>("right");
  const [state, setState] = useState<State>("idle");
  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(60);
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [isAttacking, setIsAttacking] = useState(false);
  const [isCrouching, setIsCrouching] = useState(false);

  /* ================================
     🔹 ADDED VELOCITY REFS (ONLY)
  ================================ */
  const velocityX = useRef(0);
  const velocityY = useRef(0);

  /* ---------- everything else unchanged ---------- */

  /* =========================================
     PLAYER STATE (minor direction tweak)
  ========================================= */
  useEffect(() => {
    if (gameState !== "playing" && gameState !== "boss") return;

    const isMoving =
      keys.has("arrowleft") || keys.has("a") ||
      keys.has("arrowright") || keys.has("d") ||
      keys.has("arrowup") || keys.has("w") ||
      keys.has("arrowdown") || keys.has("s");

    // Smooth facing direction (velocity-based)
    if (velocityX.current < -0.1) setDirection("left");
    if (velocityX.current > 0.1) setDirection("right");

    if (isAttacking) {
      setState(isCrouching ? "crouch-attack" : "attack");
    } else if (isCrouching && isMoving) {
      setState("crouch-walk");
    } else if (isCrouching) {
      setState("crouch-idle");
    } else if (isMoving) {
      setState("run");
    } else {
      setState("idle");
    }
  }, [keys, isAttacking, isCrouching, gameState]);

  /* =====================================================
     ❌ OLD MOVEMENT EFFECT REMOVED
     ✅ NEW SMOOTH MOVEMENT EFFECT
  ===================================================== */
  useEffect(() => {
    if (gameState !== "playing" && gameState !== "boss") return;

    const ACCEL = isCrouching ? 0.08 : 0.18;
    const MAX_SPEED = isCrouching ? 0.7 : 1.8;
    const FRICTION = 0.85;

    const interval = setInterval(() => {
      const left = keys.has("arrowleft") || keys.has("a");
      const right = keys.has("arrowright") || keys.has("d");
      const up = keys.has("arrowup") || keys.has("w");
      const down = keys.has("arrowdown") || keys.has("s");

      if (!isAttacking) {
        if (left) velocityX.current -= ACCEL;
        if (right) velocityX.current += ACCEL;
        if (up) velocityY.current += ACCEL;
        if (down) velocityY.current -= ACCEL;
      }

      velocityX.current = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, velocityX.current));
      velocityY.current = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, velocityY.current));

      velocityX.current *= FRICTION;
      velocityY.current *= FRICTION;

      if (Math.abs(velocityX.current) < 0.01) velocityX.current = 0;
      if (Math.abs(velocityY.current) < 0.01) velocityY.current = 0;

      setPositionX(x =>
        Math.max(5, Math.min(95, x + velocityX.current))
      );

      setPositionY(y =>
        Math.max(
          PLAY_AREA_MIN_Y,
          Math.min(PLAY_AREA_MAX_Y, y + velocityY.current)
        )
      );

      setBackgroundOffset(o => o - velocityX.current * 2);
    }, 16); // ~60 FPS

    return () => clearInterval(interval);
  }, [keys, isAttacking, isCrouching, gameState]);

  /* ---------- EVERYTHING BELOW IS UNCHANGED ---------- */

  return (
    /* your full JSX exactly as before */
  );
};

