
import DragAndDrop from '@/components/drag_and_drop/drag_and_drop';
import styles from "./page.module.css";

export default function Home() {
  return (
    <main>
      <div className={styles.content}>
        <h1>Convert Shopify CSV to Drop & Go Format</h1>
        <div className="description">
          This tool for seamlessly converting Shopify order CSV files to the Drop & Go CSV format. Our intuitive platform simplifies the process of transitioning your Shopify order data into a format compatible with Drop & Go services, saving you time and effort.
        </div>
      </div>
      <DragAndDrop />
    </main>
  );
}
