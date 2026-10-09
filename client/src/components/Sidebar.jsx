import React from 'react';
import { Box, VStack, Button, Text, Flex, Avatar, Icon } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { BookOpen, LogIn, LogOut, Home, Compass, Library } from 'lucide-react';

export default function Sidebar() {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
  const location = useLocation();

  const NavItem = ({ icon, children, to }) => {
    const isActive = location.pathname === to;
    return (
      <Button
        as={Link}
        to={to}
        variant="ghost"
        justifyContent="flex-start"
        leftIcon={<Icon as={icon} size={20} />}
        w="full"
        bg={isActive ? "whiteAlpha.200" : "transparent"}
        color={isActive ? "brand.300" : "gray.400"}
        _hover={{ bg: "whiteAlpha.200", color: "white", transform: "translateX(5px)" }}
        transition="all 0.3s ease"
        size="lg"
        fontWeight={isActive ? "bold" : "medium"}
      >
        {children}
      </Button>
    );
  };

  return (
    <Box 
      w="280px" 
      bg="gray.900" 
      h="full" 
      p={6} 
      borderRight="1px solid" 
      borderColor="whiteAlpha.100"
      boxShadow="lg"
      display="flex"
      flexDirection="column"
    >
      <VStack spacing={8} align="stretch" h="full">
        <Flex alignItems="center" gap={3} mb={4}>
          <Box p={2} bgGradient="linear(to-br, brand.400, pink.500)" borderRadius="xl" boxShadow="0 0 20px rgba(138, 43, 226, 0.4)">
            <Icon as={BookOpen} w={6} h={6} color="white" />
          </Box>
          <Text fontSize="2xl" fontWeight="extrabold" bgGradient="linear(to-r, brand.300, pink.300)" bgClip="text" letterSpacing="tight">
            Text2Learn
          </Text>
        </Flex>
        
        <Box w="full" h="1px" bgGradient="linear(to-r, transparent, whiteAlpha.200, transparent)" />
        
        <VStack align="stretch" spacing={3} flex={1} mt={4}>
          <NavItem icon={Home} to="/dashboard">Dashboard</NavItem>
          <NavItem icon={Compass} to="/dashboard/explore">Explore</NavItem>
          <NavItem icon={Library} to="/dashboard/library">My Library</NavItem>
        </VStack>

        <Box mt="auto">
          {isAuthenticated ? (
            <Box p={4} bg="whiteAlpha.50" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" backdropFilter="blur(10px)">
              <Flex align="center" gap={3} mb={4}>
                <Avatar size="sm" src={user.picture} name={user.name} />
                <Box overflow="hidden">
                  <Text fontSize="sm" fontWeight="bold" color="white" isTruncated>{user.name}</Text>
                  <Text fontSize="xs" color="brand.300" isTruncated>Pro Member</Text>
                </Box>
              </Flex>
              <Button 
                w="full"
                colorScheme="red" 
                variant="ghost" 
                leftIcon={<Icon as={LogOut} size={18} />} 
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                _hover={{ bg: "red.500", color: "white" }}
                size="sm"
              >
                Log Out
              </Button>
            </Box>
          ) : (
            <Button 
              w="full"
              size="lg"
              bgGradient="linear(to-r, brand.400, pink.500)" 
              color="white"
              leftIcon={<Icon as={LogIn} size={20} />} 
              onClick={() => loginWithRedirect()}
              _hover={{ transform: 'translateY(-2px)', boxShadow: '0 10px 20px rgba(138,43,226,0.4)' }}
              transition="all 0.2s"
            >
              Sign In
            </Button>
          )}
        </Box>
      </VStack>
    </Box>
  );
}