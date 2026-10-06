import Link from "next/link";
import { Card, Container, PageHeader } from "@/shared/ui";
import { MapView } from "@/widgets/map-view";
import styles from "./home.module.css";

export default function HomePage() {
  return (
    <Container>
      <PageHeader
        title="Добрый шкаф"
        description="Передавайте вещи людям и организациям, находите нужное рядом и помогайте как волонтер."
      />
      <div className={styles.grid}>
        <Card>
          <h2>Отдать или найти вещь</h2>
          <p>Публикуйте объявления и ищите вещи по категории, состоянию и способу передачи.</p>
          <div className={styles.actions}>
            <Link href="/catalog">Открыть каталог</Link>
          </div>
        </Card>
        <Card>
          <h2>Организации</h2>
          <p>Узнайте, какие вещи принимают организации, и найдите пункты приема.</p>
          <div className={styles.actions}>
            <Link href="/organizations">Смотреть организации</Link>
          </div>
        </Card>
        <Card>
          <h2>Волонтерство</h2>
          <p>Откликайтесь на задачи организаций и помогайте на местах.</p>
          <div className={styles.actions}>
            <Link href="/volunteer">Волонтерские задачи</Link>
          </div>
        </Card>
      </div>
      <section className={styles.scenarios}>
        <Card>
          <h2>Основные сценарии</h2>
          <p>Пользователь → пользователь: публикация вещи, запрос и договоренность о передаче.</p>
          <p>Пользователь → организация: подбор организации и передача вещей.</p>
          <p>Организация → пользователи: потребности, пункты приема и правила.</p>
          <p>Организация → волонтер: задача, отклик, назначение и выполнение.</p>
        </Card>
      </section>
      <MapView title="Карта организаций и пунктов приема" />
    </Container>
  );
}
