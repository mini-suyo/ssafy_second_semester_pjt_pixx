"use client";

import QrCode from "@/components/main/QrCode";
import AddFile from "@/components/main/AddFile";
import styles from "./page.module.css";

export default function Page() {
  return (
    <div className={styles.mainContainer}>
      <QrCode />
      <AddFile />
    </div>
  );
}
