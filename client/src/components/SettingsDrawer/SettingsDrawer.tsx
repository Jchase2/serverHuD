import {
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  useDisclosure,
  DrawerHeader,
  Stack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { SettingsIcon } from "@chakra-ui/icons";
import { FaUser } from "react-icons/fa";
import { FaHome } from "react-icons/fa";
import { getUserId } from "../../shared/utils";

export const SettingsDrawer = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const userid = getUserId();
  const perms = localStorage.getItem("perms");

  return (
    <>
      <Button onClick={onOpen}>
        <SettingsIcon />
      </Button>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader textAlign={"center"} borderBottomWidth="1px">
            Settings
          </DrawerHeader>
          <DrawerBody>
            <Stack>
              <Button
                leftIcon={<FaHome />}
                variant="ghost"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </Button>
              <Button
                leftIcon={<FaUser />}
                variant="ghost"
                onClick={() => navigate("/user/" + userid)}
              >
                Account Info
              </Button>
              {perms?.includes("enable_disable_registration") ?
                <Button
                  leftIcon={<FaUser />}
                  variant="ghost"
                  onClick={() => navigate("/admin/" + userid)}
                >
                  Admin Panel
                </Button>
              : null}
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};
