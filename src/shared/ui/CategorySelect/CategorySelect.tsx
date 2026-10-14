"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CategorySelect.module.css";

type CategorySelectProps<T extends string> = {
  value: T | "";
  options: { value: T; label: string }[];
  placeholder?: string;
  onChange: (value: T | "") => void;
};

export function CategorySelect<T extends string>({
  value,
  options,
  placeholder = "Все категории",
  onChange,
}: CategorySelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function selectOption(nextValue: T | "") {
    onChange(nextValue);
    setIsOpen(false);
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.open : ""}`}
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={!value ? styles.placeholder : ""}>
          {selectedOption?.label ?? placeholder}
        </span>

        <span
          className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ""}`}
        />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.options} role="listbox" aria-label="Категории">
            <button
              type="button"
              role="option"
              aria-selected={!value}
              className={`${styles.option} ${!value ? styles.selected : ""}`}
              onClick={() => selectOption("")}
            >
              {placeholder}
            </button>

            {options.map((option) => (
              <button
                type="button"
                role="option"
                aria-selected={value === option.value}
                className={`${styles.option} ${
                  value === option.value ? styles.selected : ""
                }`}
                key={option.value}
                onClick={() => selectOption(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}