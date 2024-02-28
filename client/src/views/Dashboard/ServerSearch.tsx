import { Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { IData } from "../../types";

interface ServerSearchProps {
  setSearchData: React.Dispatch<React.SetStateAction<IData[] | undefined>>,
  data: IData[] | undefined
}

const ServerSearch = (props: ServerSearchProps) => {
  const { setSearchData, data } = props;
  const [searchInput, setSearchInput] = useState<string>("");

  useEffect(() => {
    if (data) {
      let res = data.filter((elem: IData) => {
        if (
          elem.url.toLowerCase().includes(searchInput.toLocaleLowerCase()) ||
          elem.name.toLowerCase().includes(searchInput.toLowerCase())
        ) {
          return elem;
        }
        return false;
      });
      setSearchData(res);
    }
  }, [data, searchInput, setSearchData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setSearchInput(e.target.value);
  };

  return <Input placeholder="Server Search" onChange={handleChange} />;
};

export default ServerSearch;
