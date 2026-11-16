"use client";

import { useEffect, useRef, useState } from "react";
import type { OrganizationListMock } from "@/shared/lib/organization-list-mock";
import styles from "./MapView.module.css";

type MapViewProps = {
  organizations: OrganizationListMock[];
};

type YandexMapApi = {
  ready: Promise<void>;
  YMap: new (
    container: HTMLElement,
    options: {
      location: {
        center: [number, number];
        zoom: number;
      };
      behaviors?: string[];
    },
  ) => {
    addChild: (child: unknown) => void;
    destroy: () => void;
  };
  YMapDefaultSchemeLayer: new () => unknown;
  YMapDefaultFeaturesLayer: new () => unknown;
  YMapMarker: new (
    props: { coordinates: [number, number] },
    element: HTMLElement,
  ) => unknown;
};

declare global {
  interface Window {
    ymaps3?: YandexMapApi;
  }
}

const EKATERINBURG_CENTER: [number, number] = [60.6057, 56.8389];

function loadYandexMaps(apiKey: string): Promise<YandexMapApi> {
  return new Promise((resolve, reject) => {
    if (window.ymaps3) {
      window.ymaps3.ready.then(() => resolve(window.ymaps3!));
      return;
    }

    let script = document.querySelector<HTMLScriptElement>(
      'script[src*="api-maps.yandex.ru/v3/"]',
    );

    const handleLoad = () => {
      if (!window.ymaps3) {
        reject(new Error("Яндекс Карты не загрузились"));
        return;
      }

      window.ymaps3.ready.then(() => resolve(window.ymaps3!)).catch(reject);
    };

    if (script) {
      script.addEventListener("load", handleLoad, { once: true });
      script.addEventListener(
        "error",
        () => reject(new Error("Не удалось загрузить Яндекс Карты")),
        { once: true },
      );
      return;
    }

    script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/v3/?apikey=${apiKey}&lang=ru_RU`;
    script.async = true;

    script.onload = handleLoad;
    script.onerror = () =>
      reject(new Error("Не удалось загрузить Яндекс Карты"));

    document.head.appendChild(script);
  });
}

export function MapView({ organizations: _organizations }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let map: InstanceType<YandexMapApi["YMap"]> | null = null;
    let cancelled = false;

    async function initMap() {
      try {
        const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

        if (!apiKey) {
          throw new Error("Не найден ключ Яндекс Карт");
        }

        const ymaps3 = await loadYandexMaps(apiKey);

        if (cancelled || !mapContainerRef.current) return;

        const instance = new ymaps3.YMap(mapContainerRef.current, {
          location: {
            center: EKATERINBURG_CENTER,
            zoom: 12,
          },
          behaviors: ["drag", "scrollZoom", "pinchZoom", "dblClick"],
        });

        map = instance;

        instance.addChild(new ymaps3.YMapDefaultSchemeLayer());
        instance.addChild(new ymaps3.YMapDefaultFeaturesLayer());

        const markerElement = document.createElement("div")

        instance.addChild(
          new ymaps3.YMapMarker(
            { coordinates: EKATERINBURG_CENTER },
            markerElement,
          ),
        );
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Не удалось загрузить карту",
          );
        }
      }
    }

    initMap();

    return () => {
      cancelled = true;
      map?.destroy();
    };
  }, []);

  return (
    <section className={styles.mapSection}>
      <div ref={mapContainerRef} className={styles.map} />

      {error && (
        <div className={styles.mapError}>
          {error}
        </div>
      )}
    </section>
  );
}