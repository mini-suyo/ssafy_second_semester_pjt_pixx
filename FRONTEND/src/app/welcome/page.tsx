import Image from "next/image";
import Logo from "@/../public/icons/main-logo.png";
import KakaoLogin from "@/components/login/KakaoLogin";
import styles from "./page.module.css";

export default function Page() {
  return (
    <>
      <Image src={Logo} alt="PIXX Logo" className={styles.logo} />
      <KakaoLogin />
    </>
  );
}
