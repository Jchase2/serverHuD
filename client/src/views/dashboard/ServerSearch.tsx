import { Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const ServerSearch = (props: any) => {
  const { setSearchData, data } = props;
  const [searchInput, setSearchInput] = useState<string>("");

  useEffect(() => {
    if (data) {
      let res = data.filter((elem: any) => {
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

  const handleChange = (e: any) => {
    e.preventDefault();
    setSearchInput(e.target.value);
  };

  return <Input placeholder="Server Search" onChange={handleChange} />;
};

export default ServerSearch;
