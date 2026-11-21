"use client";

import styles from "./EcoImpact.module.css";

type EcoImpactProps = {
  receivedCount?: number;
  transferredCount?: number;
};

function getWordForm(count: number): "one" | "few" | "many" {
  const value = Math.abs(Math.trunc(count));
  const lastTwo = value % 100;
  const lastOne = value % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return "many";
  }

  if (lastOne === 1) {
    return "one";
  }

  if (lastOne >= 2 && lastOne <= 4) {
    return "few";
  }

  return "many";
}

function getEcoLabel(
  count: number,
  action: "received" | "transferred",
): string {
  const form = getWordForm(count);

  if (action === "received") {
    switch (form) {
      case "one":
        return "спасена";
      case "few":
        return "спасены";
      default:
        return "спасено";
    }
  }

  switch (form) {
    case "one":
      return "передана";
    case "few":
      return "переданы";
    default:
      return "передано";
  }
}

export function EcoImpact({
  receivedCount = 0,
  transferredCount = 0,
}: EcoImpactProps) {
  const received = Math.max(0, receivedCount);
  const transferred = Math.max(0, transferredCount);

  return (
    <div className={styles.impact}>
      <div className={styles.stat}>
        <strong>{received}</strong>
        <span>{getEcoLabel(received, "received")}</span>
      </div>

      <div className={styles.stat}>
        <strong>{transferred}</strong>
        <span>{getEcoLabel(transferred, "transferred")}</span>
      </div>
    </div>
  );
}
