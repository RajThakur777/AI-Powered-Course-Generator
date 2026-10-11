import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, VStack, Code, RadioGroup, Radio, Spinner, Button, useToast, Flex, Icon, HStack } from '@chakra-ui/react';
import { CheckCircle, XCircle, BrainCircuit } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../utils/api';

export const toSafeString = (val) => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    return val.text || val.title || val.content || val.name || val.question || val.message || JSON.stringify(val);
  }
  return String(val);
};

const VideoBlock = ({ query }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAccessTokenSilently } = useAuth0();
  const safeQuery = toSafeString(query);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!safeQuery) {
        setLoading(false);
        return;
      }
      try {
        const token = await getAccessTokenSilently();
        const res = await api.get(`/youtube/search?q=${encodeURIComponent(safeQuery)}`, {
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
  }, [safeQuery, getAccessTokenSilently]);

  return (
    <Box borderRadius="md" overflow="hidden" my={4} border="1px solid" borderColor="gray.700" bg="gray.900" p={4}>
      <Text fontSize="lg" fontWeight="bold" mb={4} color="brand.300">Related Videos (Playlist)</Text>
      {loading ? (
        <Flex justify="center"><Spinner /></Flex>
      ) : videos.length > 0 ? (
        <VStack spacing={6} w="100%">
          {videos.map((vid, idx) => (
            <Box key={idx} w="100%">
              <Text mb={2} fontWeight="medium">{toSafeString(vid.title)}</Text>
              <Box as="iframe" w="100%" h="400px" src={`https://www.youtube.com/embed/${vid.videoId}`} allowFullScreen />
            </Box>
          ))}
        </VStack>
      ) : (
        <Text color="brand.400">Suggested Video Search: {safeQuery}</Text>
      )}
    </Box>
  );
};

const QuizSection = ({ questions = [], courseId, lessonId }) => {
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { getAccessTokenSilently } = useAuth0();
  const toast = useToast();

  const validQuestions = questions.filter(
    (q) => q && Array.isArray(q.options) && q.options.length >= 2
  );

  if (validQuestions.length === 0) return null;

  const handleSelect = (qIdx, optIdx) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [qIdx]: optIdx
    }));
  };

  const handleGradeQuiz = async () => {
    let correctCount = 0;
    validQuestions.forEach((q, idx) => {
      const correctIndex = typeof q.answer === 'number' ? q.answer : parseInt(q.answer, 10);
      if (userAnswers[idx] === correctIndex) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / validQuestions.length) * 100);
    setScore(calculatedScore);
    setIsSubmitted(true);

    if (courseId && lessonId) {
      setSubmitting(true);
      try {
        const token = await getAccessTokenSilently();
        await api.post('/progress', {
          courseId,
          lessonId,
          completed: true,
          quizScore: calculatedScore
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({
          title: `Quiz graded: ${calculatedScore}%`,
          description: `You answered ${correctCount} of ${validQuestions.length} questions correctly. Progress updated!`,
          status: calculatedScore >= 70 ? "success" : "info",
          duration: 4000,
          isClosable: true,
        });
      } catch (err) {
        console.error("Failed to save progress:", err);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleRetake = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setScore(null);
  };

  const allAnswered = validQuestions.every((_, idx) => userAnswers[idx] !== undefined);

  return (
    <Box p={8} bgGradient="linear(to-br, gray.800, gray.900)" borderRadius="2xl" border="1px solid" borderColor="brand.500" boxShadow="2xl" my={10} position="relative" overflow="hidden">
      <Box position="absolute" top="-10%" right="-5%" w="30%" h="60%" bgGradient="radial(brand.600, transparent, transparent)" opacity={0.15} filter="blur(40px)" pointerEvents="none" />

      <Flex align="center" justify="space-between" mb={8} wrap="wrap" gap={4} position="relative" zIndex={1}>
        <Flex align="center" gap={3}>
          <Box p={3} bg="brand.900" borderRadius="xl" border="1px solid" borderColor="brand.500">
            <Icon as={BrainCircuit} w={6} h={6} color="brand.300" />
          </Box>
          <Box>
            <Heading size="lg" bgGradient="linear(to-r, brand.300, pink.300)" bgClip="text" fontWeight="extrabold">
              Lesson Knowledge Check
            </Heading>
            <Text fontSize="sm" color="gray.400">
              {validQuestions.length} Question{validQuestions.length > 1 ? 's' : ''} • Test your understanding of this lesson
            </Text>
          </Box>
        </Flex>

        {isSubmitted && score !== null && (
          <Box px={5} py={2} bg={score >= 70 ? "green.900" : "orange.900"} border="1px solid" borderColor={score >= 70 ? "green.500" : "orange.500"} borderRadius="full">
            <Text fontWeight="extrabold" color={score >= 70 ? "green.300" : "orange.300"} fontSize="lg">
              Score: {score}%
            </Text>
          </Box>
        )}
      </Flex>

      <VStack spacing={8} align="stretch" position="relative" zIndex={1}>
        {validQuestions.map((q, qIdx) => {
          const selected = userAnswers[qIdx];
          const correctIdx = typeof q.answer === 'number' ? q.answer : parseInt(q.answer, 10);
          const isCorrect = selected === correctIdx;
          const questionPrompt = toSafeString(q.question || q.text || `Question ${qIdx + 1}`);

          return (
            <Box key={qIdx} p={6} bg="blackAlpha.400" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
              <HStack spacing={3} mb={4} align="flex-start">
                <Box w={7} h={7} borderRadius="full" bg="brand.900" border="1px solid" borderColor="brand.500" color="brand.300" display="flex" alignItems="center" justifyContent="center" fontWeight="bold" fontSize="sm" flexShrink={0}>
                  {qIdx + 1}
                </Box>
                <Text fontSize="lg" color="white" fontWeight="medium" lineHeight="tall">
                  {questionPrompt}
                </Text>
              </HStack>

              <VStack align="stretch" spacing={3} pl={{ base: 0, md: 10 }}>
                {q.options?.map((opt, oIdx) => {
                  const optText = toSafeString(opt);
                  let bg = "whiteAlpha.50";
                  let borderColor = "whiteAlpha.200";
                  let color = "gray.300";
                  let icon = null;

                  if (isSubmitted) {
                    if (oIdx === correctIdx) {
                      bg = "green.900";
                      borderColor = "green.500";
                      color = "green.100";
                      icon = <Icon as={CheckCircle} color="green.400" w={5} h={5} />;
                    } else if (selected === oIdx) {
                      bg = "red.900";
                      borderColor = "red.500";
                      color = "red.100";
                      icon = <Icon as={XCircle} color="red.400" w={5} h={5} />;
                    } else {
                      bg = "blackAlpha.400";
                      borderColor = "transparent";
                    }
                  } else if (selected === oIdx) {
                    bg = "rgba(138, 43, 226, 0.2)";
                    borderColor = "brand.400";
                    color = "white";
                  }

                  return (
                    <Box
                      key={oIdx}
                      p={4}
                      bg={bg}
                      border="1px solid"
                      borderColor={borderColor}
                      borderRadius="lg"
                      cursor={isSubmitted ? "default" : "pointer"}
                      onClick={() => handleSelect(qIdx, oIdx)}
                      _hover={!isSubmitted ? { bg: "whiteAlpha.100", transform: "translateX(4px)" } : {}}
                      transition="all 0.2s"
                    >
                      <Flex align="center" justify="space-between">
                        <HStack spacing={3}>
                          <Box
                            w={5}
                            h={5}
                            borderRadius="full"
                            border="2px solid"
                            borderColor={selected === oIdx ? "brand.400" : "gray.500"}
                            bg={selected === oIdx ? "brand.400" : "transparent"}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            {selected === oIdx && <Box w={2} h={2} borderRadius="full" bg="white" />}
                          </Box>
                          <Text color={color} fontSize="md">{optText}</Text>
                        </HStack>
                        {icon && <Box ml={3}>{icon}</Box>}
                      </Flex>
                    </Box>
                  );
                })}
              </VStack>

              {isSubmitted && (
                <Box mt={4} pl={{ base: 0, md: 10 }}>
                  <Box p={4} borderRadius="md" bg={isCorrect ? "green.950" : "red.950"} border="1px solid" borderColor={isCorrect ? "green.700" : "red.700"}>
                    <Text fontWeight="bold" color={isCorrect ? "green.300" : "red.300"} fontSize="sm">
                      {isCorrect ? "✓ Correct!" : `✗ Incorrect — Correct answer: ${toSafeString(q.options?.[correctIdx])}`}
                    </Text>
                    {q.explanation && (
                      <Text mt={2} color="gray.300" fontSize="sm">
                        {toSafeString(q.explanation)}
                      </Text>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          );
        })}

        <Box pt={4}>
          {!isSubmitted ? (
            <Button
              size="lg"
              w="full"
              h={14}
              fontSize="xl"
              fontWeight="bold"
              bgGradient="linear(to-r, brand.400, pink.500)"
              color="white"
              onClick={handleGradeQuiz}
              isDisabled={!allAnswered}
              isLoading={submitting}
              _hover={{ transform: 'translateY(-2px)', boxShadow: '0 10px 25px rgba(138,43,226,0.4)' }}
              transition="all 0.2s"
            >
              Submit & Auto-Grade Quiz ({Object.keys(userAnswers).length}/{validQuestions.length} answered)
            </Button>
          ) : (
            <Button
              size="lg"
              w="full"
              variant="outline"
              borderColor="brand.400"
              color="brand.200"
              onClick={handleRetake}
              _hover={{ bg: "brand.900" }}
            >
              Retake Quiz
            </Button>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default function LessonRenderer({ content, courseId, lessonId }) {
  if (!content || !Array.isArray(content) || content.length === 0) {
    return <Text color="gray.400" py={6}>Lesson content is being finalized.</Text>;
  }

  const safeContent = content.filter(Boolean);

  // Collect all valid MCQs
  const mcqBlocks = safeContent.filter(
    (b) => b.type === 'mcq' && Array.isArray(b.options) && b.options.length >= 2
  );

  return (
    <VStack align="stretch" spacing={6}>
      {safeContent.map((block, idx) => {
        switch (block.type) {
          case 'heading':
            return <Heading key={idx} size="lg" mt={4} color="white">{toSafeString(block.text)}</Heading>;
          case 'paragraph':
            return <Text key={idx} fontSize="lg" lineHeight="tall" color="gray.300">{toSafeString(block.text)}</Text>;
          case 'code':
            return (
              <Box key={idx} p={4} bg="black" borderRadius="md" overflowX="auto" border="1px solid" borderColor="gray.700">
                <Text color="gray.400" fontSize="sm" mb={2}>{toSafeString(block.language) || 'code'}</Text>
                <Code bg="transparent" color="brand.200" whiteSpace="pre">{toSafeString(block.text)}</Code>
              </Box>
            );
          case 'list':
            return (
              <VStack key={idx} align="stretch" spacing={2} pl={4}>
                {(block.items || (typeof block.text === 'string' ? block.text.split('\n') : [])).map((item, iIdx) => (
                  <Text key={iIdx} fontSize="lg" color="gray.300">
                    • {toSafeString(item)}
                  </Text>
                ))}
              </VStack>
            );
          case 'callout':
            return (
              <Box key={idx} p={5} bg="brand.900" borderLeft="4px solid" borderColor="brand.400" borderRadius="md" my={4}>
                <Text color="gray.200" fontSize="lg" fontStyle="italic">{toSafeString(block.text)}</Text>
              </Box>
            );
          case 'video':
            return <VideoBlock key={idx} query={block.query || block.url} />;
          case 'mcq':
            // Rendered together below in QuizSection
            return null;
          default:
            return null;
        }
      })}

      {mcqBlocks.length > 0 && (
        <QuizSection questions={mcqBlocks} courseId={courseId} lessonId={lessonId} />
      )}
    </VStack>
  );
}