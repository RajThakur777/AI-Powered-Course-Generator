import React, { useState } from 'react';
import { Box, Heading, Text, Input, Button, VStack, Spinner, Container, HStack, Icon } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, LogIn } from 'lucide-react';
import api from '../utils/api';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently, error } = useAuth0();

  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const res = await api.post('/generate/course', { topic }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const generatedCourse = res.data.data;
      
      // 1. Save the Course
      const saveRes = await api.post('/courses', {
        ...generatedCourse,
        originalPrompt: topic
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newCourseId = saveRes.data.data._id;

      // 2. Save each Module and its Lessons
      if (generatedCourse.modules && generatedCourse.modules.length > 0) {
        for (let mIdx = 0; mIdx < generatedCourse.modules.length; mIdx++) {
          const mod = generatedCourse.modules[mIdx];
          
          const modRes = await api.post(`/modules/course/${newCourseId}`, {
            title: mod.title,
            description: mod.description,
            order: mIdx
          }, { headers: { Authorization: `Bearer ${token}` } });
          
          const newModuleId = modRes.data.data._id;

          if (mod.lessons && mod.lessons.length > 0) {
            for (let lIdx = 0; lIdx < mod.lessons.length; lIdx++) {
              const les = mod.lessons[lIdx];
              await api.post(`/lessons/module/${newModuleId}`, {
                title: les.title,
                order: lIdx
              }, { headers: { Authorization: `Bearer ${token}` } });
            }
          }
        }
      }

      navigate(`/courses/${newCourseId}`);
      
    } catch (error) {
      console.error(error);
      window.alert('Generation failed: ' + (error.response?.data?.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" h="100%" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="brand.500" />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container maxW="container.lg" centerContent py={32}>
        <VStack spacing={8} textAlign="center">
          <Icon as={BookOpen} w={20} h={20} color="brand.500" />
          <Heading size="4xl" fontWeight="extrabold" letterSpacing="tight">
            Welcome to <Text as="span" bgGradient="linear(to-r, brand.400, pink.400)" bgClip="text">Text2Learn</Text>
          </Heading>
          <Text fontSize="2xl" color="gray.400" maxW="2xl">
            Transform any topic into a structured, multi-module online course in seconds using the power of AI.
          </Text>
          <Box pt={8}>
            <Button 
              size="lg" 
              colorScheme="purple" 
              px={10} 
              py={8} 
              fontSize="xl"
              leftIcon={<LogIn size={24} />}
              onClick={() => loginWithRedirect()}
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
              transition="all 0.2s"
            >
              Get Started for Free
            </Button>
          </Box>
          {error && (
            <Box mt={4} p={4} bg="red.500" borderRadius="md" color="white">
              <Text fontWeight="bold">Auth0 Error:</Text>
              <Text>{error.message}</Text>
            </Box>
          )}
        </VStack>
      </Container>
    );
  }

  // Dashboard / Generation View for Authenticated Users
  return (
    <Container maxW="container.md" centerContent py={20}>
      <VStack spacing={8} w="full">
        <HStack spacing={3}>
          <Icon as={Sparkles} w={8} h={8} color="brand.400" />
          <Heading size="3xl" bgGradient="linear(to-r, brand.400, pink.400)" bgClip="text" textAlign="center">
            What do you want to learn?
          </Heading>
        </HStack>
        
        <Text fontSize="xl" color="gray.400" textAlign="center">
          Enter any topic, and our AI will generate a complete, structured course curriculum for you.
        </Text>
        
        <Box w="full" bg="whiteAlpha.100" p={8} borderRadius="2xl" boxShadow="2xl" border="1px solid" borderColor="whiteAlpha.200">
          <VStack spacing={6}>
            <Input 
              size="lg" 
              placeholder="e.g. Introduction to React Hooks, Basics of Quantum Physics..." 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              bg="gray.800"
              border="none"
              p={6}
              fontSize="lg"
              _focus={{ ring: 2, ringColor: "brand.500" }}
            />
            <Button 
              size="lg" 
              w="full" 
              colorScheme="purple" 
              onClick={handleGenerate} 
              isDisabled={!topic.trim() || loading}
              h="16"
              fontSize="xl"
            >
              {loading ? <Spinner mr={3} /> : null}
              {loading ? 'Generating Course Curriculum...' : 'Generate Course'}
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}