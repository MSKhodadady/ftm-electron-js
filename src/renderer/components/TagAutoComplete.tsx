import { ipcRenderer } from "electron";
import { AutoComplete } from "primereact/autocomplete";
import React, { useContext, useState } from "react";
import { deduplicate } from "../../common/lib";
import { UseState } from "../../common/types";
import { DriverContext } from "../contexts/DriverContext";

interface Props {
  selectedTags: string[],
  onChange: (selectedTags: string[]) => void
  disabled?: boolean
  placeHolder?: string
  className?: string,
  injectSuggestTags?: string[]
}

export const TagAutoComplete = (p: Props) => {
  const { driverState: { selectedDriver } } = useContext(DriverContext);

  const [filteredTags, setFilteredTags]: UseState<string[]> = useState([]);

  const searchTag = async (e: any) => {
    const query: string = e.query.trim();

    if (selectedDriver == null) {
      setFilteredTags([query]);
      return;
    }

    const res: string[] = await ipcRenderer.invoke('tag-list', query, selectedDriver);

    setFilteredTags(
      deduplicate([...res, query, ...(p.injectSuggestTags || [])])
        .filter(v => !p.selectedTags.includes(v))
        .filter(v => !v.startsWith(':'))
    );

  }

  return (<AutoComplete
    className={"tag-input " + p.className || ""}
    value={p.selectedTags}
    multiple
    suggestions={filteredTags}
    completeMethod={searchTag}
    onChange={e => p.onChange(e.value)}
    placeholder={p.placeHolder !== undefined ? p.placeHolder : "Enter tags"}
    disabled={p.disabled !== undefined ? p.disabled : false}
  />);
}