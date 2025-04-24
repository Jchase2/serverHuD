"use client";

import { Box, Heading, Container, Text, Button, Flex } from "@chakra-ui/react";
import "animate.css";

const LandingPage = () => {
  return (
    <Box
      as="section"
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      className="animate__animated animate__fadeInUp"
      px={4}
    >
      <Container maxW="3xl">
        <Flex
          direction="column"
          align="center"
          textAlign="center"
          gap={6}
          py={{ base: 20, md: 36 }}
        >
          <Heading
            fontWeight={600}
            fontSize={{ base: "2xl", sm: "4xl", md: "6xl" }}
            lineHeight="110%"
          >
            Monitor your servers with <br />
            <Text as="span" color="blue.600">
              serverHuD
            </Text>
          </Heading>

          <Text color={{ base: "gray.900", _dark: "white" }}>
            serverHuD is a convenient way to avoid surprise outages and monitor
            the status of your SSL certs, upgrades, and more!
          </Text>

          <Button
            colorScheme="green"
            bg="blue.400"
            rounded="full"
            px={6}
            _hover={{ bg: "blue.600" }}
          >
            Sign Up
          </Button>
        </Flex>
      </Container>
    </Box>
  );
};

export default LandingPage;
