// import { Box, Button, Checkbox, Input, Stack, Text } from "@chakra-ui/react";
// import { UseMutationResult } from "@tanstack/react-query";
// import { useEffect, useState } from "react";
// import { IAddServer } from "../../types";
// import { AxiosError } from "axios";
// import UpdateOptionalServer from "../../components/UpdateServer/UpdateOptionalServer";

// interface IAddServerProps {
//   addNewServer: UseMutationResult<any, AxiosError<any>, IAddServer, unknown>;
// }

// const AdminDash = (props: IAddServerProps) => {

//   const [adminSettingsState, setAdminSettingsState] = useState({
//     enable_registration: ''
//   });

//   const [checkedItems, setCheckedItems] = useState({
//     trackDisk: true,
//     trackResources: true,
//     trackUpgrades: true,
//     trackSmart: false,
//   });

//   useEffect(() => {
//     setServerState({ ...serverState, trackOptions: checkedItems });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [checkedItems]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setServerState((currentEvent) => ({
//       ...currentEvent,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     props.addNewServer.mutate(serverState);
//     setServerState({

//     });
//   };

//   return (
//     <Box
//       p={8}
//       m={2}
//       borderWidth={1}
//       borderRadius={8}
//       boxShadow="lg"
//       minW="20vw"
//       textAlign={"center"}
//     >
//       <Text m={2}>New Server:</Text>
//       <form onSubmit={handleSubmit}>
//         <Stack spacing={1}>
//           <Checkbox
//             pt={2}
//             isChecked={adminSettingsState?.enable_registration === "t"}
//             onChange={(e) =>
//               setAdminSettingsState({
//                 ...adminSettingsState,
//               })
//             }
//           >
//             Enable Registration?
//           </Checkbox>
//           <Button type="submit">Add Server</Button>
//         </Stack>
//       </form>
//     </Box>
//   );
// };

// export default AdminDash;
