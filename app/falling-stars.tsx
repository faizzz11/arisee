"use client";

import React, { useMemo } from "react";
import styles from "./FallingStars.module.css";

const createStars = (count: number) => {
  return Array.from({ length: count }, (_, i) => {
    const top = Math.random() * 100;
    const left = Math.random() * 100;
    const delay = Math.random() * 5;
    const duration = 3 + Math.random() * 2;

    return (
      <div
        key={i}
        className={styles.star}
        style={{
          "--top": `${top}%`,
          "--left": `${left}%`,
          "--delay": `${delay}s`,
          "--duration": `${duration}s`,
        } as React.CSSProperties}
      />
    );
  });
};

export default function FallingStars() {
  const stars = useMemo(() => createStars(12), []);
  
  return (
    <div className={styles.night} aria-hidden="true">
      {stars}
    </div>
  );
}
