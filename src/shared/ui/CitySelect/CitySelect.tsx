"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CitySelect.module.css";

type CitySelectProps = {
  name: string;
  value: string;
  cities: string[];
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function CitySelect({
  name,
  value,
  cities,
  disabled = false,
  onChange,
}: CitySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const options = Array.from(
    new Set([...(value ? [value] : []), ...cities]),
  );

  const filteredCities = options.filter((city) =>
    city.toLocaleLowerCase("ru").includes(search.toLocaleLowerCase("ru")),
  );

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setSearch("");
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function selectCity(city: string) {
    onChange(city);
    setIsOpen(false);
    setSearch("");
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <input type="hidden" name={name} value={value} />

      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.open : ""}`}
        onClick={() => {
          if (!disabled) {
            setIsOpen((open) => !open);
            setSearch("");
          }
        }}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={!value ? styles.placeholder : ""}>
          {value || "Город не указан"}
        </span>
        <span className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ""}`} />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.options} role="listbox" aria-label="Города">
            {filteredCities.map((city) => (
              <button
                type="button"
                role="option"
                aria-selected={value === city}
                className={`${styles.option} ${
                  value === city ? styles.selected : ""
                }`}
                key={city}
                onClick={() => selectCity(city)}
              >
                {city}
              </button>
            ))}

            <button
              type="button"
              role="option"
              aria-selected={!value}
              className={`${styles.option} ${!value ? styles.selected : ""}`}
              onClick={() => selectCity("")}
            >
              Другой
            </button>
          </div>
        </div>
      )}
    </div>
  );
}