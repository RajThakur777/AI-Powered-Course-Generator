import React, { useState } from 'react';
import { Box, Heading, Text, Input, Button, VStack, Spinner, Container, HStack, Icon } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import api from '../utils/api';

export default function Dashboard() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const res = await api.post('/generate/course', { topic }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const generatedCourse = res.data.data;
      
      const saveRes = await api.post('/courses', {
        ...generatedCourse,
        originalPrompt: topic
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newCourseId = saveRes.data.data._id;

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

      navigate(`/dashboard/courses/${newCourseId}`);
      
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

  if (!isAuthenticated) return null;

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
