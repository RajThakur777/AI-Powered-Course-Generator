import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Input, 
  Button, 
  VStack, 
  Spinner, 
  Container, 
  HStack, 
  Icon, 
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  Badge
} from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../utils/api';

export default function Dashboard() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Read topic passed from Landing page state, URL query parameter, or localStorage
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryTopic = searchParams.get('topic');
    const stateTopic = location.state?.topic;
    const storedTopic = localStorage.getItem('pendingCourseTopic');

    const incomingTopic = stateTopic || queryTopic || storedTopic;
    if (incomingTopic && typeof incomingTopic === 'string' && incomingTopic.trim()) {
      setTopic(incomingTopic.trim());
      localStorage.removeItem('pendingCourseTopic');
    }
  }, [location]);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    const cleanTopic = topic.trim();
    if (!cleanTopic) return;
    
    setLoading(true);
    setErrorMessage(null);
    setGenerationStep('Synthesizing course curriculum with Google Gemini AI...');

    try {
      const token = await getAccessTokenSilently();

      // Step 1: Generate outline with AI
      const res = await api.post('/generate/course', { topic: cleanTopic }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const generatedCourse = res.data.data;
      if (!generatedCourse || !generatedCourse.title) {
        throw new Error('Course curriculum could not be generated. Please try again.');
      }

      // Step 2: Save complete course and all modules & lessons atomically
      setGenerationStep('Creating course modules & lessons in your library...');
      const saveRes = await api.post('/courses', {
        ...generatedCourse,
        modules: generatedCourse.modules,
        originalPrompt: cleanTopic
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const savedCourse = saveRes.data.data;
      const newCourseId = savedCourse?._id;

      // Fallback: If modules were not attached on the server, create them manually
      if ((!savedCourse.modules || savedCourse.modules.length === 0) && generatedCourse.modules && generatedCourse.modules.length > 0) {
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

      toast({
        title: 'Course generated successfully!',
        description: `"${generatedCourse.title}" is ready.`,
        status: 'success',
        duration: 3500,
        isClosable: true
      });

      navigate(`/dashboard/courses/${newCourseId}`);
      
    } catch (error) {
      console.error('Course generation error:', error);
      const serverMsg = error.response?.data?.message || error.message || 'An error occurred during course generation.';
      setErrorMessage(serverMsg);
      toast({
        title: 'Generation Error',
        description: serverMsg,
        status: 'error',
        duration: 6000,
        isClosable: true
      });
    } finally {
      setLoading(false);
      setGenerationStep('');
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

        {errorMessage && (
          <Alert status="error" borderRadius="xl" bg="red.900" border="1px solid" borderColor="red.500" color="white">
            <AlertIcon color="red.300" />
            <Box flex="1">
              <AlertTitle fontWeight="bold">Generation failed</AlertTitle>
              <AlertDescription fontSize="sm" color="gray.200">
                {errorMessage}
              </AlertDescription>
            </Box>
            <Button size="sm" colorScheme="red" variant="outline" onClick={handleGenerate} leftIcon={<RefreshCw size={14} />}>
              Retry
            </Button>
          </Alert>
        )}
        
        <Box 
          as="form" 
          onSubmit={handleGenerate} 
          w="full" 
          bg="whiteAlpha.100" 
          p={8} 
          borderRadius="2xl" 
          boxShadow="2xl" 
          border="1px solid" 
          borderColor="whiteAlpha.200"
        >
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
              disabled={loading}
              _focus={{ ring: 2, ringColor: "brand.500" }}
            />

            {loading && (
              <Box w="full" py={2}>
                <Progress size="xs" isIndeterminate colorScheme="purple" borderRadius="full" mb={3} />
                <HStack justify="center" spacing={2}>
                  <Spinner size="sm" color="brand.400" />
                  <Text fontSize="sm" color="brand.300" fontWeight="medium">
                    {generationStep || 'Generating Course Curriculum...'}
                  </Text>
                </HStack>
              </Box>
            )}

            <Button 
              type="submit"
              size="lg" 
              w="full" 
              colorScheme="purple" 
              isDisabled={!topic.trim() || loading}
              h="16"
              fontSize="xl"
              bgGradient="linear(to-r, brand.500, pink.500)"
              _hover={{ bgGradient: "linear(to-r, brand.600, pink.600)", transform: "translateY(-2px)" }}
              transition="all 0.2s"
            >
              {loading ? (
                <HStack spacing={3}>
                  <Spinner size="md" />
                  <Text>Generating Curriculum...</Text>
                </HStack>
              ) : (
                'Generate Course'
              )}
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}
