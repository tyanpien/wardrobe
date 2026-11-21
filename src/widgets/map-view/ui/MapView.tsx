"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { OrganizationMapPoint } from "@/entities/organization/model/dto";
import styles from "./MapView.module.css";

type Coordinates = [number, number];
type YandexMapApi = {
  ready: Promise<void>;

  YMap: new (
    container: HTMLElement,
    options: {
      location:
        | { center: Coordinates; zoom: number }
        | { bounds: [Coordinates, Coordinates] };
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
      coordinates: Coordinates;
    },
    element: HTMLElement,
  ) => unknown;
};

declare global {
  interface Window {
    ymaps3?: YandexMapApi;
  }
}

const DEFAULT_CENTER: Coordinates = [60.6057, 56.8389];

function waitForYandexMaps(): Promise<YandexMapApi> {
  return new Promise((resolve, reject) => {
    if (window.ymaps3) {
      window.ymaps3.ready
        .then(() => resolve(window.ymaps3!))
        .catch(reject);

      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

    if (!apiKey) {
      reject(new Error("Не указан ключ API Яндекс Карт."));
      return;
    }

    let script = document.querySelector<HTMLScriptElement>(
      'script[src*="api-maps.yandex.ru/v3/"]',
    );

    let timeoutId: ReturnType<typeof setTimeout>;

    const cleanup = () => {
      script?.removeEventListener("load", handleLoad);
      script?.removeEventListener("error", handleError);
      clearTimeout(timeoutId);
    };

    const handleLoad = () => {
      if (!window.ymaps3) {
        cleanup();
        reject(
          new Error(
            "Скрипт Яндекс Карт загружен, но API недоступен. Проверьте ключ API.",
          ),
        );
        return;
      }

      window.ymaps3.ready
        .then(() => {
          cleanup();
          resolve(window.ymaps3!);
        })
        .catch((error) => {
          cleanup();
          reject(error);
        });
    };

    const handleError = () => {
      cleanup();
      reject(new Error("Не удалось загрузить Яндекс Карты."));
    };

    if (!script) {
      script = document.createElement("script");
      script.src = `https://api-maps.yandex.ru/v3/?apikey=${apiKey}&lang=ru_RU`;
      script.async = true;
      document.head.appendChild(script);
    }

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    timeoutId = setTimeout(() => {
      cleanup();
      reject(
        new Error(
          "Превышено время ожидания загрузки Яндекс Карт. Проверьте подключение к интернету и ключ API.",
        ),
      );
    }, 20000);
  });
}

function getMapLocation(
  coordinates: Coordinates[],
):
  | { center: Coordinates; zoom: number }
  | { bounds: [Coordinates, Coordinates] } {
  if (coordinates.length === 0) {
    return {
      center: DEFAULT_CENTER,
      zoom: 10,
    };
  }

  if (coordinates.length === 1) {
    return {
      center: coordinates[0],
      zoom: 15,
    };
  }

  const longitudes = coordinates.map(([longitude]) => longitude);
  const latitudes = coordinates.map(([, latitude]) => latitude);

  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);

  if (
    minLongitude === maxLongitude &&
    minLatitude === maxLatitude
  ) {
    return {
      center: coordinates[0],
      zoom: 15,
    };
  }

  return {
    bounds: [
      [minLongitude, minLatitude],
      [maxLongitude, maxLatitude],
    ],
  };
}

export function MapView({
  points,
}: {
  points: OrganizationMapPoint[];
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [error, setError] = useState("");

  const geocodedPoints = useMemo(
    () =>
      points.filter(
        (point) =>
          typeof point.latitude === "number" &&
          typeof point.longitude === "number" &&
          Number.isFinite(point.latitude) &&
          Number.isFinite(point.longitude),
      ),
    [points],
  );

  useEffect(() => {
    let map: InstanceType<YandexMapApi["YMap"]> | null = null;
    let cancelled = false;

    async function initializeMap() {
      try {
        setError("");

        const ymaps3 = await waitForYandexMaps();

        if (cancelled || !mapContainerRef.current) {
          return;
        }

        const coordinates: Coordinates[] = geocodedPoints.map(
          (point) => [
            point.longitude as number,
            point.latitude as number,
          ],
        );

        const instance = new ymaps3.YMap(
          mapContainerRef.current,
          {
            location: getMapLocation(coordinates),
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

          const marker = document.createElement("div");

          marker.className = styles.pointMarker;
          marker.setAttribute("role", "img");
          marker.setAttribute(
            "aria-label",
            `${point.organization_name}: ${point.title}`,
          );

          marker.title = [
            point.organization_name,
            point.title,
            point.city,
            point.address_line,
            point.working_hours,
          ]
            .filter(Boolean)
            .join("\n");

          instance.addChild(
            new ymaps3.YMapMarker(
              {
                coordinates: [
                  point.longitude,
                  point.latitude,
                ],
              },
              marker,
            ),
          );
        });
      } catch (mapError) {
        if (!cancelled) {
          setError(
            mapError instanceof Error
              ? mapError.message
              : "Не удалось отобразить карту.",
          );
        }
      }
    }

    void initializeMap();

    return () => {
      cancelled = true;
      map?.destroy();
    };
  }, [geocodedPoints]);

  return (
    <section className={styles.mapSection}>
      <div
        ref={mapContainerRef}
        className={styles.map}
      />

      {error && (
        <div className={styles.mapError} role="alert">
          <strong>Не удалось загрузить карту</strong>
          <span>{error}</span>
        </div>
      )}

      {!error &&
        points.length > 0 &&
        geocodedPoints.length === 0 && (
          <div className={styles.mapNotice}>
            У пунктов приёма пока нет координат для отображения.
          </div>
        )}

      {!error &&
        geocodedPoints.length > 0 &&
        points.length > geocodedPoints.length && (
          <div className={styles.mapNotice}>
            На карте показаны пункты с определёнными координатами.
            Остальные пункты не имеют координат.
          </div>
        )}

      {!error && points.length === 0 && (
        <div className={styles.mapNotice}>
          У этой организации пока нет пунктов приёма.
        </div>
      )}
    </section>
  );
}
