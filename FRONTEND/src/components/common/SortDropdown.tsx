// components/common/SortDropdown.tsx
// react-select에서 inline 방법을 권장.. css 파일 따로 빼면 안먹음

import Select, { StylesConfig } from "react-select";

export interface OptionType<T> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: OptionType<T>[];
}

export default function SortDropdown<T extends string>({ value, onChange, options }: Props<T>) {
  const customStyles: StylesConfig<OptionType<T>> = {
    control: (base) => ({
      ...base,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "transparent",
      border: "none",
      boxShadow: "none",
      cursor: "pointer",
      fontFamily: "SEJONG",
      color: "#fffaf8",
      fontSize: "1rem",
      height: "2rem",
      padding: "0 0.5rem",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#21203e",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#fffaf8",
      whiteSpace: "nowrap",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#312a53" : "transparent",
      color: "#fffaf8",
      cursor: "pointer",
      fontFamily: "SEJONG",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      margin: 0,
      color: "#fffaf8",
    }),
    indicatorSeparator: () => ({ display: "none" }),
  };

  const selectedOption = options?.find((opt) => opt.value === value);
  // console.log("SortDropdown props:", { value, options });

  return (
    <Select<OptionType<T>>
      options={options}
      value={selectedOption}
      onChange={(selected) => {
        if (selected) onChange(selected.value);
      }}
      styles={customStyles}
      isSearchable={false}
    />
  );
}
