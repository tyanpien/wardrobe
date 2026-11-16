"use client";

import { useEffect, useRef, useState } from "react";
import type { OrganizationMapPoint } from "@/entities/organization/model/dto";
import styles from "./MapView.module.css";

type YandexMapApi = {
  ready: Promise<void>;

  YMap: new (
    container: HTMLElement,
    options: {
      location:
        | { center: [number, number]; zoom: number }
        | { bounds: [[number, number], [number, number]] };
      behaviors?: string[];
    },
  ) => {
    addChild: (child: unknown) => void;
    destroy: () => void;
  };

  YMapDefaultSchemeLayer: new () => unknown;
  YMapDefaultFeaturesLayer: new () => unknown;

  YMapMarker: new (
    props: {
      coordinates: [number, number];
    },
    element: HTMLElement,
  ) => unknown;
};

declare global {
  interface Window {
    ymaps3?: YandexMapApi;
  }
}

const DEFAULT_CENTER: [number, number] = [60.6057, 56.8389];

function loadYandexMaps(apiKey: string): Promise<YandexMapApi> {
  return new Promise((resolve, reject) => {
    if (window.ymaps3) {
      window.ymaps3.ready
        .then(() => resolve(window.ymaps3!))
        .catch(reject);

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

      window.ymaps3.ready
        .then(() => resolve(window.ymaps3!))
        .catch(reject);
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

export function MapView({
  points,
}: {
  points: OrganizationMapPoint[];
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");

  const geocodedPoints = points.filter(
    (point) =>
      point.latitude !== null &&
      point.longitude !== null,
  );

  const geocodedPointCount = geocodedPoints.length;

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

        const coordinates = geocodedPoints.map(
          (point) =>
            [
              point.longitude as number,
              point.latitude as number,
            ] as [number, number],
        );

        const firstPoint = coordinates[0];

        let location:
          | {
              center: [number, number];
              zoom: number;
            }
          | {
              bounds: [[number, number], [number, number]];
            };

        if (coordinates.length === 0) {
          location = {
            center: DEFAULT_CENTER,
            zoom: 10,
          };
        } else if (coordinates.length === 1) {
          location = {
            center: firstPoint,
            zoom: 15,
          };
        } else {
          const longitudes = coordinates.map(
            ([longitude]) => longitude,
          );

          const latitudes = coordinates.map(
            ([, latitude]) => latitude,
          );

          const minLongitude = Math.min(...longitudes);
          const maxLongitude = Math.max(...longitudes);
          const minLatitude = Math.min(...latitudes);
          const maxLatitude = Math.max(...latitudes);

          if (
            minLongitude === maxLongitude &&
            minLatitude === maxLatitude
          ) {
            location = {
              center: firstPoint,
              zoom: 15,
            };
          } else {
            location = {
              bounds: [
                [minLongitude, minLatitude],
                [maxLongitude, maxLatitude],
              ],
            };
          }
        }

        const instance = new ymaps3.YMap(
          mapContainerRef.current,
          {
            location,
            behaviors: [
              "drag",
              "scrollZoom",
              "pinchZoom",
              "dblClick",
            ],
          },
        );

        map = instance;

        instance.addChild(
          new ymaps3.YMapDefaultSchemeLayer(),
        );

        instance.addChild(
          new ymaps3.YMapDefaultFeaturesLayer(),
        );

        geocodedPoints.forEach((point) => {
          if (
            point.latitude === null ||
            point.longitude === null
          ) {
            return;
          }

          const markerElement = document.createElement("div");

          markerElement.className = styles.pointMarker;
          markerElement.setAttribute("role", "img");

          markerElement.setAttribute(
            "aria-label",
            `${point.organization_name}: ${point.title}`,
          );

          markerElement.title = [
            point.organization_name,
            point.city,
            point.address_line,
            point.working_hours,
          ].join("\n");

          markerElement.textContent = "•";

          instance.addChild(
            new ymaps3.YMapMarker(
              {
                coordinates: [
                  point.longitude,
                  point.latitude,
                ],
              },
              markerElement,
            ),
          );
        });
      } catch (mapError) {
        if (!cancelled) {
          setError(
            mapError instanceof Error
              ? mapError.message
              : "Не удалось загрузить карту",
          );
        }
      }
    }

    setError("");
    void initMap();

    return () => {
      cancelled = true;
      map?.destroy();
    };
  }, [points]);

  return (
    <section className={styles.mapSection}>
      <div
        ref={mapContainerRef}
        className={styles.map}
      />

      {error && (
        <div className={styles.mapError} role="alert">
          {error}
        </div>
      )}

      {!error &&
        points.length > 0 &&
        geocodedPointCount === 0 && (
          <div className={styles.mapNotice}>
            У пунктов приёма пока нет координат для отображения.
          </div>
        )}

      {geocodedPointCount > 0 &&
        points.length > geocodedPointCount && (
          <div className={styles.mapNotice}>
            На карте показаны пункты с определёнными координатами.
            Остальные доступны в списке.
          </div>
        )}

      {points.length === 0 && !error && (
        <div className={styles.mapNotice}>
          По выбранным условиям пункты приёма не найдены.
        </div>
      )}
    </section>
  );
}