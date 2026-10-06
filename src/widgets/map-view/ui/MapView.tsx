import styles from "./MapView.module.css";

type MapViewProps = {
  title?: string;
  unavailable?: boolean;
};

export function MapView({ title = "Карта пунктов приема", unavailable = true }: MapViewProps) {
  return (
    <section className={styles.map} aria-label={title}>
      <h2 className={styles.title}>{title}</h2>
      {unavailable ? (
        <p className={styles.text}>
          Карта временно недоступна. Список организаций и пунктов приема можно посмотреть без карты.
        </p>
      ) : (
        <p className={styles.text}>Здесь будет отображаться карта вещей, организаций и пунктов приема.</p>
      )}
    </section>
  );
}
