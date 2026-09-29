import React from 'react';
import { Box, VStack, Button, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { BookOpen, LogIn, LogOut, Home } from 'lucide-react';

export default function Sidebar() {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  return (
    <Box w="250px" bg="gray.800" h="full" p={4} borderRight="1px solid" borderColor="whiteAlpha.200">
      <VStack spacing={6} align="stretch" h="full">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="brand.500" display="flex" alignItems="center" gap={2}>
            <BookOpen /> Text2Learn
          </Text>
        </Box>
        
        <Box borderBottom="1px solid" borderColor="whiteAlpha.200" />
        
        <VStack align="stretch" spacing={2} flex={1}>
          <Button as={Link} to="/" variant="ghost" justifyContent="flex-start" leftIcon={<Home size={18} />}>
            Home
          </Button>
        </VStack>

        <Box>
          {isAuthenticated ? (
            <VStack align="stretch" spacing={3}>
              <Text fontSize="sm" color="gray.400" isTruncated>Hi, {user.name}</Text>
              <Button colorScheme="red" variant="outline" leftIcon={<LogOut size={18} />} onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
                Log Out
              </Button>
            </VStack>
          ) : (
            <Button colorScheme="purple" leftIcon={<LogIn size={18} />} onClick={() => loginWithRedirect()}>
              Log In
            </Button>
          )}
        </Box>
      </VStack>
    </Box>
  );
}