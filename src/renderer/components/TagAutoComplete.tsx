import { ipcRenderer } from "electron";
import { AutoComplete } from "primereact/autocomplete";
import React, { useContext, useState } from "react";
import { UseState } from "../../common/types";
import { DriverContext } from "../contexts/DriverContext";

interface Props {
  selectedTags: string[],
  onChange: (selectedTags: string[]) => void
}

export const TagAutoComplete = ({ selectedTags, onChange }: Props) => {
  const { driverState: { selectedDriver } } = useContext(DriverContext);

  const [filteredTags, setFilteredTags]: UseState<string[]> = useState(null);

  const searchTag = e => {
    const query: string = e.query.trim();

    if (selectedDriver == null) {
      setFilteredTags([query]);
      return;
    }

    ipcRenderer.invoke('tag-list', query, selectedDriver).then((res: string[]) => {
      // add the query to list if it isn't in list
      if (!res.includes(query)) res.push(query);

      // filter the selected tags from list
      if (selectedTags != null) res = res.filter(v => !selectedTags.includes(v));

      setFilteredTags(res);
    });
  }

  return (<AutoComplete
    className="tag-input"
    value={selectedTags}
    multiple
    suggestions={filteredTags}
    completeMethod={searchTag}
    onChange={e => onChange(e.value)}
    placeholder="Enter tags"
  />);
}