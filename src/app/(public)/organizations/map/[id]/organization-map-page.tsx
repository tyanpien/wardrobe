"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

import {
  getOrganizationMapPoints,
} from "@/entities/organization/api";

import type {
  OrganizationMapPoint,
} from "@/entities/organization/model/dto";

import { getApiErrorMessage } from "@/shared/api/errors";

import styles from "./organization-map-page.module.css";

const MapView = dynamic(
  () =>
    import("@/widgets/map-view").then(
      (module) => module.MapView,
    ),
  {
    ssr: false,
    loading: () => (
      <div className={styles.state}>
        Подготавливаем карту...
      </div>
    ),
  },
);

type Props = {
  organizationId: string;
};

export function OrganizationMapPage({
  organizationId,
}: Props) {
  const [points, setPoints] = useState<OrganizationMapPoint[]>([]);
  const [organizationName, setOrganizationName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPoints() {
      setLoading(true);
      setError("");

      try {
        const allPoints = await getOrganizationMapPoints();

        if (cancelled) return;

        const organizationPoints = allPoints.filter(
          (point) =>
            String(point.organization_id) ===
            String(organizationId),
        );

        setPoints(organizationPoints);

        if (organizationPoints.length > 0) {
          setOrganizationName(
            organizationPoints[0].organization_name,
          );
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            getApiErrorMessage(
              requestError,
              "Не удалось загрузить пункты приёма организации.",
            ),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPoints();

    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>
          Пункты приёма организации
          {organizationName && ` «${organizationName}»`}
        </h1>

        {!loading && !error && (
          <p>
            Найдено пунктов приёма: {points.length}
          </p>
        )}
      </header>

      <section className={styles.mapContainer}>
        {loading ? (
          <div className={styles.state}>
            Загружаем пункты приёма...
          </div>
        ) : error ? (
          <div className={styles.state} role="alert">
            <strong>Ошибка загрузки</strong>
            <p>{error}</p>
          </div>
        ) : (
          <MapView points={points} />
        )}
      </section>
    </main>
  );
}
