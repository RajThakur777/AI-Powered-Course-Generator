import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, VStack, Code, RadioGroup, Radio, Spinner, Button, useToast, Flex, Icon } from '@chakra-ui/react';
import { CheckCircle, XCircle, BrainCircuit } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../utils/api';

const VideoBlock = ({ query }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchVideo = async () => {
      if (!query) {
        setLoading(false);
        return;
      }
      try {
        const token = await getAccessTokenSilently();
        const res = await api.get(`/youtube/search?q=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setVideos(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch video:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [query, getAccessTokenSilently]);

  return (
    <Box borderRadius="md" overflow="hidden" my={4} border="1px solid" borderColor="gray.700" bg="gray.900" p={4}>
      <Text fontSize="lg" fontWeight="bold" mb={4} color="brand.300">Related Videos (Playlist)</Text>
      {loading ? (
        <Flex justify="center"><Spinner /></Flex>
      ) : videos.length > 0 ? (
        <VStack spacing={6} w="100%">
          {videos.map((vid, idx) => (
            <Box key={idx} w="100%">
              <Text mb={2} fontWeight="medium">{vid.title}</Text>
              <Box as="iframe" w="100%" h="400px" src={`https://www.youtube.com/embed/${vid.videoId}`} allowFullScreen />
            </Box>
          ))}
        </VStack>
      ) : (
        <Text color="brand.400">Suggested Video Search: {query}</Text>
      )}
    </Box>
  );
};

const QuizBlock = ({ block, courseId, lessonId }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { getAccessTokenSilently } = useAuth0();
  const toast = useToast();

  const handleSubmit = async () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);
    
    // Check answer
    const isCorrect = parseInt(selectedOption) === block.answer;
    
    // Submit progress to API
    if (courseId && lessonId) {
      try {
        const token = await getAccessTokenSilently();
        await api.post('/progress', {
          courseId,
          lessonId,
          completed: true,
          quizScore: isCorrect ? 100 : 0
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({
          title: "Progress saved",
          description: "Your quiz result has been recorded.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (err) {
        console.error("Failed to update progress:", err);
      }
    }
  };

  return (
    <Box p={8} bgGradient="linear(to-br, gray.800, gray.900)" borderRadius="2xl" border="1px solid" borderColor="brand.500" boxShadow="2xl" my={8} position="relative" overflow="hidden">
      <Box position="absolute" top="-10%" right="-5%" w="30%" h="60%" bgGradient="radial(brand.600, transparent, transparent)" opacity={0.15} filter="blur(40px)" pointerEvents="none" />
      
      <Flex align="center" gap={3} mb={6} position="relative" zIndex={1}>
        <Box p={3} bg="brand.900" borderRadius="xl" border="1px solid" borderColor="brand.500">
          <Icon as={BrainCircuit} w={6} h={6} color="brand.300" />
        </Box>
        <Heading size="lg" bgGradient="linear(to-r, brand.300, pink.300)" bgClip="text" fontWeight="extrabold">Knowledge Check</Heading>
      </Flex>
      
      <Text mb={8} fontSize="xl" color="white" fontWeight="medium" position="relative" zIndex={1} lineHeight="tall">{block.question || block.text}</Text>
      
      <RadioGroup onChange={setSelectedOption} value={selectedOption} isDisabled={isSubmitted} position="relative" zIndex={1}>
        <VStack align="stretch" spacing={4}>
          {block.options?.map((opt, oIdx) => {
            let bg = "whiteAlpha.50";
            let borderColor = "whiteAlpha.200";
            let color = "gray.300";
            let icon = null;
            
            if (isSubmitted) {
              if (oIdx === block.answer) {
                bg = "green.900";
                borderColor = "green.500";
                color = "green.100";
                icon = <Icon as={CheckCircle} color="green.400" w={5} h={5} />;
              } else if (parseInt(selectedOption) === oIdx) {
                bg = "red.900";
                borderColor = "red.500";
                color = "red.100";
                icon = <Icon as={XCircle} color="red.400" w={5} h={5} />;
              } else {
                 bg = "blackAlpha.400";
                 borderColor = "transparent";
              }
            }
            
            return (
              <Box 
                key={oIdx} 
                p={5} 
                bg={bg} 
                border="1px solid" 
                borderColor={isSubmitted ? borderColor : (selectedOption === oIdx.toString() ? "brand.500" : borderColor)} 
                borderRadius="xl" 
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                boxShadow={selectedOption === oIdx.toString() && !isSubmitted ? "0 4px 20px rgba(138, 43, 226, 0.2)" : "none"}
                _hover={!isSubmitted ? { bg: "whiteAlpha.200", transform: "translateY(-2px)" } : {}}
                cursor={isSubmitted ? "default" : "pointer"}
                onClick={() => !isSubmitted && setSelectedOption(oIdx.toString())}
              >
                <Flex align="center" justify="space-between">
                  <Radio value={oIdx.toString()} colorScheme="brand" w="100%" size="lg">
                    <Text color={color} ml={3} fontSize="lg">{opt}</Text>
                  </Radio>
                  {icon && <Box ml={4}>{icon}</Box>}
                </Flex>
              </Box>
            );
          })}
        </VStack>
      </RadioGroup>
      
      {!isSubmitted && (
        <Button 
          mt={8} 
          size="lg"
          bgGradient="linear(to-r, brand.400, pink.500)" 
          color="white"
          onClick={handleSubmit} 
          isDisabled={selectedOption === null} 
          w="full"
          _hover={{ transform: 'translateY(-2px)', boxShadow: '0 10px 20px rgba(138, 43, 226, 0.4)' }}
          transition="all 0.2s"
          h={14}
          fontSize="xl"
          fontWeight="bold"
        >
          Submit Answer
        </Button>
      )}
      
      {isSubmitted && (
        <Box 
          mt={8} 
          p={6} 
          borderRadius="xl" 
          bg={parseInt(selectedOption) === block.answer ? "green.900" : "red.900"} 
          border="1px solid" 
          borderColor={parseInt(selectedOption) === block.answer ? "green.500" : "red.500"}
          boxShadow="lg"
          animation="fadeIn 0.5s ease"
        >
          <Flex align="center" gap={3} mb={2}>
            <Icon as={parseInt(selectedOption) === block.answer ? CheckCircle : XCircle} color={parseInt(selectedOption) === block.answer ? "green.400" : "red.400"} w={6} h={6} />
            <Text fontWeight="extrabold" fontSize="xl" color={parseInt(selectedOption) === block.answer ? "green.300" : "red.300"}>
              {parseInt(selectedOption) === block.answer ? "Correct! Great job." : `Incorrect. The correct answer was: ${block.options[block.answer]}`}
            </Text>
          </Flex>
          {block.explanation && (
            <Text mt={4} color="whiteAlpha.800" fontSize="md" lineHeight="relaxed">{block.explanation}</Text>
          )}
        </Box>
      )}
    </Box>
  );
};

export default function LessonRenderer({ content, courseId, lessonId }) {
  if (!content || !Array.isArray(content)) return <Text>No content available.</Text>;

  return (
    <VStack align="stretch" spacing={6}>
      {content.map((block, idx) => {
        switch (block.type) {
          case 'heading':
            return <Heading key={idx} size="lg" mt={4}>{block.text}</Heading>;
          case 'paragraph':
            return <Text key={idx} fontSize="lg" lineHeight="tall" color="gray.300">{block.text}</Text>;
          case 'code':
            return (
              <Box key={idx} p={4} bg="black" borderRadius="md" overflowX="auto" border="1px solid" borderColor="gray.700">
                <Text color="gray.400" fontSize="sm" mb={2}>{block.language}</Text>
                <Code bg="transparent" color="brand.200" whiteSpace="pre">{block.text}</Code>
              </Box>
            );
          case 'video':
            return <VideoBlock key={idx} query={block.query || block.url} />;
          case 'mcq':
            if (!block.options || block.options.length < 2 || block.answer === undefined || block.answer === null) return null;
            return <QuizBlock key={idx} block={block} courseId={courseId} lessonId={lessonId} />;
          default:
            return null;
        }
      })}
    </VStack>
  );
}