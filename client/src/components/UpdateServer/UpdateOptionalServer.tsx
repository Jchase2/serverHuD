import { Checkbox, Stack } from "@chakra-ui/react";

interface IUpdateOptionalServerProps {
  checkedItems: {
    trackDisk: boolean;
    trackResources: boolean;
    trackUpgrades: boolean;
    trackSmart: boolean;
  };
  setCheckedItems: React.Dispatch<
    React.SetStateAction<{
      trackDisk: boolean;
      trackResources: boolean;
      trackUpgrades: boolean;
      trackSmart: boolean;
    }>
  >;
}

const UpdateOptionalServer = (props: IUpdateOptionalServerProps) => {
  const { checkedItems, setCheckedItems } = props;

  return (
    <Stack direction={"column"} mt={4}>
      <Checkbox
        isChecked={checkedItems.trackDisk}
        onChange={(e) =>
          setCheckedItems({
            ...checkedItems,
            trackDisk: e.target.checked,
          })
        }
      >
        Track Disk Space
      </Checkbox>
      <Checkbox
        isChecked={checkedItems.trackResources}
        onChange={(e) =>
          setCheckedItems({
            ...checkedItems,
            trackResources: e.target.checked,
          })
        }
      >
        Track Resources
      </Checkbox>
      <Checkbox
        isChecked={checkedItems.trackUpgrades}
        onChange={(e) =>
          setCheckedItems({
            ...checkedItems,
            trackUpgrades: e.target.checked,
          })
        }
      >
        Track Upgrades
      </Checkbox>
      <Checkbox
        isChecked={checkedItems.trackSmart}
        onChange={(e) =>
          setCheckedItems({
            ...checkedItems,
            trackSmart: e.target.checked,
          })
        }
      >
        Track Smart Disk Status
      </Checkbox>
    </Stack>
  );
};

export default UpdateOptionalServer;
