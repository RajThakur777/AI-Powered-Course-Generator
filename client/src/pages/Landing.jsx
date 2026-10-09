import React from 'react';
import { Box, Container, Heading, Text, Button, VStack, HStack, SimpleGrid, Icon, Flex, useColorModeValue } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, BrainCircuit, Headphones, LayoutList, ArrowRight, LogIn } from 'lucide-react';

export default function Landing() {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  const handleCtaClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      loginWithRedirect();
    }
  };

  return (
    <Box bg="gray.900" color="white" minH="100vh" overflowX="hidden">
      {/* Header */}
      <Box as="nav" borderBottom="1px solid" borderColor="whiteAlpha.100" py={4} backdropFilter="blur(10px)" position="sticky" top={0} zIndex={100} bg="rgba(23, 25, 35, 0.8)">
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <Flex alignItems="center" gap={3}>
              <Box p={2} bgGradient="linear(to-br, brand.400, pink.500)" borderRadius="xl">
                <Icon as={BookOpen} w={5} h={5} color="white" />
              </Box>
              <Text fontSize="xl" fontWeight="extrabold" bgGradient="linear(to-r, brand.300, pink.300)" bgClip="text" letterSpacing="tight">
                Text2Learn
              </Text>
            </Flex>
            <HStack spacing={4}>
              {isAuthenticated ? (
                <Button colorScheme="purple" variant="solid" borderRadius="full" px={6} onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
              ) : (
                <Button colorScheme="brand" variant="outline" borderRadius="full" px={6} leftIcon={<LogIn size={18} />} onClick={() => loginWithRedirect()}>
                  Sign In
                </Button>
              )}
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box position="relative" pt={{ base: 20, md: 32 }} pb={{ base: 20, md: 24 }}>
        <Box position="absolute" top="10%" left="50%" transform="translateX(-50%)" w="70%" h="60%" bgGradient="radial(brand.500, transparent, transparent)" opacity={0.2} filter="blur(80px)" zIndex={0} pointerEvents="none" />
        
        <Container maxW="container.lg" position="relative" zIndex={1} textAlign="center">
          <VStack spacing={8}>
            <Heading size="4xl" fontWeight="extrabold" letterSpacing="tight" lineHeight="1.2">
              Transform Any Topic into a <br />
              <Text as="span" bgGradient="linear(to-r, brand.400, pink.400)" bgClip="text">Complete Course</Text>
            </Heading>
            <Text fontSize="2xl" color="gray.400" maxW="2xl" lineHeight="tall">
              Harness the power of AI to generate structured, multi-module online courses on literally any subject in seconds.
            </Text>
            <Button 
              size="lg" 
              bgGradient="linear(to-r, brand.500, pink.500)" 
              color="white"
              px={10} 
              py={8} 
              fontSize="xl"
              borderRadius="full"
              rightIcon={<ArrowRight size={24} />}
              onClick={handleCtaClick}
              _hover={{ transform: 'translateY(-4px)', boxShadow: '0 20px 40px -10px rgba(138,43,226,0.6)' }}
              transition="all 0.3s"
            >
              Start Learning Now
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={24} bg="blackAlpha.400">
        <Container maxW="container.xl">
          <VStack spacing={16}>
            <Heading size="2xl" textAlign="center">Supercharge Your Learning</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} w="full">
              <FeatureCard 
                icon={BrainCircuit}
                title="AI Curriculum Generation"
                desc="Instantly generate structured modules and lessons tailored to your exact prompt and difficulty level."
              />
              <FeatureCard 
                icon={Headphones}
                title="Immersive Audio"
                desc="Listen to your lessons on the go with high-quality, AI-generated text-to-speech audio narration."
              />
              <FeatureCard 
                icon={LayoutList}
                title="Interactive Quizzes"
                desc="Test your knowledge after every lesson with auto-generated quizzes to reinforce what you've learned."
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box py={10} borderTop="1px solid" borderColor="whiteAlpha.100">
        <Container maxW="container.xl" textAlign="center">
          <Text color="gray.500">© 2026 Text2Learn. All rights reserved.</Text>
        </Container>
      </Box>
    </Box>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <Box p={8} bg="gray.800" borderRadius="3xl" border="1px solid" borderColor="whiteAlpha.100" _hover={{ transform: 'translateY(-8px)', boxShadow: '2xl', borderColor: 'brand.500' }} transition="all 0.3s">
      <Box p={4} display="inline-block" bg="whiteAlpha.50" borderRadius="2xl" mb={6} color="brand.400">
        <Icon as={icon} w={8} h={8} />
      </Box>
      <Heading size="md" mb={4}>{title}</Heading>
      <Text color="gray.400" lineHeight="tall">{desc}</Text>
    </Box>
  );
}
