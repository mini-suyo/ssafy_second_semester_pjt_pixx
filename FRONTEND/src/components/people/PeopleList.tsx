'use client';

import PeopleItem from './PeopleItem';
import styles from './people.module.css';

const dummyNames = ['Unknown', '김우주', '박은하', '최성운', '정달', '강햇살'];

export default function PeopleList() {
  return (
    <div className={styles.peopleGrid}>
      {dummyNames.map((name, index) => (
        <PeopleItem key={index} name={name} />
      ))}
    </div>
  );
}