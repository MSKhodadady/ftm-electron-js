import { ipcRenderer } from "electron";
import { AutoComplete } from "primereact/autocomplete";
import React, { useContext, useState } from "react";
import { UseState } from "../../common/types";
import { DriverContext } from "../contexts/DriverContext";

interface Props {
  selectedTags: string[],
  onChange: (selectedTags: string[]) => void
  disabled?: boolean
  placeHolder?: string
}

export const TagAutoComplete = ({ selectedTags, onChange, disabled, placeHolder }: Props) => {
  const { driverState: { selectedDriver } } = useContext(DriverContext);

  const [filteredTags, setFilteredTags]: UseState<string[]> = useState([]);

  const searchTag = async (e: any) => {
    const query: string = e.query.trim();

    if (selectedDriver == null) {
      setFilteredTags([query]);
      return;
    }

    const res: string[] = await ipcRenderer.invoke('tag-list', query, selectedDriver)

    setFilteredTags(
      [...new Set(
        [...res, query]
      )]
        .filter(v => !selectedTags.includes(v))
        .filter(v => !v.startsWith(':'))
    );

  }

  return (<AutoComplete
    className="tag-input"
    value={selectedTags}
    multiple
    suggestions={filteredTags}
    completeMethod={searchTag}
    onChange={e => onChange(e.value)}
    placeholder={placeHolder !== undefined ? placeHolder : "Enter tags"}
    disabled={disabled !== undefined ? disabled : false}
  />);
}