import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, VStack, Code, RadioGroup, Radio, Spinner, Button, useToast } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../utils/api';

const VideoBlock = ({ query }) => {
  const [videoId, setVideoId] = useState(null);
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
        if (res.data.success && res.data.data.videoId) {
          setVideoId(res.data.data.videoId);
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
    <Box borderRadius="md" overflow="hidden" my={4} border="1px solid" borderColor="gray.700" bg="gray.900" p={4} textAlign="center">
      {loading ? <Spinner /> : videoId ? (
        <Box as="iframe" w="100%" h="400px" src={`https://www.youtube.com/embed/${videoId}`} allowFullScreen />
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
    <Box p={6} bg="gray.800" borderRadius="lg" border="1px solid" borderColor="brand.500" boxShadow="md" my={4}>
      <Heading size="md" mb={4} color="brand.400">Quiz Time!</Heading>
      <Text mb={6} fontSize="lg" color="white">{block.question || block.text}</Text>
      <RadioGroup onChange={setSelectedOption} value={selectedOption} isDisabled={isSubmitted}>
        <VStack align="stretch" spacing={3}>
          {block.options?.map((opt, oIdx) => {
            let bg = "whiteAlpha.100";
            let borderColor = "gray.600";
            
            if (isSubmitted) {
              if (oIdx === block.answer) {
                bg = "green.900";
                borderColor = "green.500";
              } else if (parseInt(selectedOption) === oIdx) {
                bg = "red.900";
                borderColor = "red.500";
              }
            }
            
            return (
              <Box 
                key={oIdx} 
                p={4} 
                bg={bg} 
                border="1px solid" 
                borderColor={borderColor} 
                borderRadius="md" 
                transition="all 0.2s"
                _hover={!isSubmitted ? { bg: "whiteAlpha.200" } : {}}
              >
                <Radio value={oIdx.toString()} colorScheme="brand" w="100%">
                  <Text color="white" ml={2}>{opt}</Text>
                </Radio>
              </Box>
            );
          })}
        </VStack>
      </RadioGroup>
      {!isSubmitted && (
        <Button mt={6} colorScheme="brand" onClick={handleSubmit} isDisabled={selectedOption === null} w="full">
          Submit Answer
        </Button>
      )}
      {isSubmitted && (
        <Box mt={6} p={4} borderRadius="md" bg={parseInt(selectedOption) === block.answer ? "green.900" : "red.900"} border="1px solid" borderColor={parseInt(selectedOption) === block.answer ? "green.500" : "red.500"}>
          <Text fontWeight="bold" color={parseInt(selectedOption) === block.answer ? "green.300" : "red.300"}>
            {parseInt(selectedOption) === block.answer ? "Correct! Great job." : `Incorrect. The correct answer was: ${block.options[block.answer]}`}
          </Text>
          {block.explanation && (
            <Text mt={2} color="gray.300" fontSize="sm">{block.explanation}</Text>
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
            return <QuizBlock key={idx} block={block} courseId={courseId} lessonId={lessonId} />;
          default:
            return null;
        }
      })}
    </VStack>
  );
}