import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Heading, Spinner, Button, HStack, Text, Badge, Wrap, WrapItem, Link as ChakraLink, Icon, VStack, Progress } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { ArrowLeft, Download, Languages, PlayCircle, Target, BookOpen, ExternalLink, Tag, CheckCircle2, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import LessonRenderer, { toSafeString } from '../components/LessonRenderer';
import api, { API_BASE_URL } from '../utils/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const GENERATION_STEPS = [
  "Analyzing module curriculum and learning goals...",
  "Synthesizing structured lesson concepts & code examples...",
  "Formulating interactive quiz questions & answer keys...",
  "Curating curated video lectures and reference readings...",
  "Finalizing your interactive lesson workspace..."
];

export default function Lesson() {
  const { courseId, moduleIndex, lessonIndex } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const stepTimerRef = useRef(null);

  // Cycle through generation step messages to keep user engaged while waiting
  useEffect(() => {
    if (loading && isGenerating) {
      stepTimerRef.current = setInterval(() => {
        setStepIndex((prev) => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
      }, 4000);
    } else {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    }
    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, [loading, isGenerating]);

  const loadLessonData = async () => {
    setLoading(true);
    setErrorMsg(null);
    setStepIndex(0);

    try {
      const token = await getAccessTokenSilently();
      const courseRes = await api.get(`/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const courseData = courseRes.data.data;
      
      const mIdx = parseInt(moduleIndex, 10);
      const lIdx = parseInt(lessonIndex, 10);
      
      if (!courseData?.modules || !courseData.modules[mIdx]) {
        throw new Error("Module not found in this course.");
      }
      
      const currentModule = courseData.modules[mIdx];
      const currentLessonRef = currentModule.lessons?.[lIdx];
      
      if (!currentLessonRef) {
        throw new Error("Lesson reference not found in module.");
      }
      
      let loadedLesson = null;

      if (currentLessonRef.isEnriched) {
        setIsGenerating(false);
        const lessonRes = await api.get(`/lessons/${currentLessonRef._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        loadedLesson = lessonRes.data.data;
      } else {
        setIsGenerating(true);
        // Request server to synthesize and persist the lesson with Gemini
        const generateRes = await api.post('/generate/lesson', {
          courseId: courseData._id,
          moduleId: currentModule._id,
          lessonTitle: currentLessonRef.title
        }, { headers: { Authorization: `Bearer ${token}` } });
        
        loadedLesson = generateRes.data.data;

        // If the server didn't set isEnriched or id, sync to lesson document
        if (loadedLesson && (!loadedLesson._id || loadedLesson._id === currentLessonRef._id)) {
          try {
            const updateRes = await api.put(`/lessons/${currentLessonRef._id}`, {
              ...loadedLesson,
              isEnriched: true
            }, { headers: { Authorization: `Bearer ${token}` } });
            if (updateRes.data?.data) {
              loadedLesson = updateRes.data.data;
            }
          } catch (syncErr) {
            console.warn("Secondary sync warning (content is already loaded):", syncErr);
          }
        }
      }

      setLesson(loadedLesson);

      if (loadedLesson?.audioUrl) {
        setAudioUrl(`${API_BASE_URL}${loadedLesson.audioUrl}`);
      }

      // Fetch current lesson completion progress
      if (loadedLesson?._id) {
        try {
          const progRes = await api.get(`/progress/lesson/${loadedLesson._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (progRes.data?.data?.completed) {
            setIsCompleted(true);
          }
        } catch (pErr) {
          console.warn("Could not fetch lesson progress:", pErr);
        }
      }

    } catch (err) {
      console.error("Lesson load/generation failed:", err);
      const serverMessage = err.response?.data?.message || err.message || "Failed to load lesson content.";
      setErrorMsg(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessonData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, moduleIndex, lessonIndex]);

  const handleToggleComplete = async () => {
    if (!lesson) return;
    setMarkingComplete(true);
    try {
      const token = await getAccessTokenSilently();
      const newStatus = !isCompleted;
      await api.post('/progress', {
        courseId,
        lessonId: lesson._id,
        completed: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsCompleted(newStatus);
    } catch (err) {
      console.error("Failed to update completion status:", err);
    } finally {
      setMarkingComplete(false);
    }
  };

  const downloadPDF = () => {
    const input = document.getElementById('lesson-content');
    if (!input) return;
    html2canvas(input, { backgroundColor: '#171923' }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${toSafeString(lesson.title) || 'lesson'}.pdf`);
    });
  };

  const handleTranslate = async () => {
    try {
      setIsTranslating(true);
      const token = await getAccessTokenSilently();
      const res = await api.post(`/translation/lesson/${lesson._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLesson(res.data.data);
      window.alert("Lesson translated successfully! Scroll down to see the Hinglish text.");
    } catch (error) {
      console.error(error);
      window.alert("Failed to translate lesson.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleGenerateAudio = async () => {
    try {
      setIsGeneratingAudio(true);
      const token = await getAccessTokenSilently();
      const res = await api.post(`/audio/lesson/${lesson._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAudioUrl(`${API_BASE_URL}${res.data.data.audioUrl}`);
    } catch (error) {
      console.error(error);
      window.alert("Failed to generate audio. Make sure it's translated first.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // 1. Actively Generating or Loading
  if (loading) {
    return (
      <Box maxW="5xl" mx="auto" py={12} px={4}>
        <Button 
          variant="ghost" 
          leftIcon={<ArrowLeft />} 
          onClick={() => navigate(`/dashboard/courses/${courseId}`)}
          mb={8}
          color="gray.400"
          _hover={{ color: "white", bg: "whiteAlpha.100" }}
        >
          Back to Course Curriculum
        </Button>
        <Box 
          p={{ base: 8, md: 16 }} 
          bg="rgba(15, 23, 42, 0.75)" 
          borderRadius="3xl" 
          border="1px solid" 
          borderColor="brand.500" 
          boxShadow="0 25px 60px -12px rgba(138, 43, 226, 0.3)"
          backdropFilter="blur(24px)"
          textAlign="center"
          position="relative"
          overflow="hidden"
        >
          <Box position="absolute" top="-15%" left="50%" transform="translateX(-50%)" w="70%" h="70%" bgGradient="radial(brand.500, transparent, transparent)" opacity={0.25} filter="blur(70px)" pointerEvents="none" />
          
          <VStack spacing={7} position="relative" zIndex={1}>
            <Box p={4} bg="brand.900" borderRadius="2xl" border="1px solid" borderColor="brand.400" boxShadow="0 0 35px rgba(138, 43, 226, 0.5)">
              <Spinner size="xl" thickness="4px" speed="0.8s" color="brand.200" />
            </Box>
            
            <VStack spacing={2}>
              <Heading size="xl" bgGradient="linear(to-r, brand.300, pink.300)" bgClip="text" fontWeight="extrabold">
                {isGenerating ? "Synthesizing Lesson Content" : "Loading Lesson..."}
              </Heading>
              <Text color="brand.200" fontSize="md" fontWeight="medium" display="flex" alignItems="center" gap={2}>
                <Sparkles size={18} /> {GENERATION_STEPS[stepIndex]}
              </Text>
            </VStack>

            <Text color="gray.400" fontSize="md" maxW="lg" lineHeight="relaxed">
              Our AI model is structuring concepts, drafting code examples, interactive quizzes, and gathering resources. This card remains active until the workspace is ready.
            </Text>

            <Box w="full" maxW="md" pt={2}>
              <Progress 
                size="xs" 
                isIndeterminate 
                colorScheme="purple" 
                borderRadius="full" 
                bg="whiteAlpha.100" 
              />
              <Text fontSize="xs" color="gray.500" mt={3}>
                Please keep this page open • Completing shortly
              </Text>
            </Box>
          </VStack>
        </Box>
      </Box>
    );
  }

  // 2. Error State (No blank black screen!)
  if (errorMsg || !lesson) {
    return (
      <Box maxW="5xl" mx="auto" py={12} px={4}>
        <Button 
          variant="ghost" 
          leftIcon={<ArrowLeft />} 
          onClick={() => navigate(`/dashboard/courses/${courseId}`)}
          mb={8}
          color="gray.400"
          _hover={{ color: "white", bg: "whiteAlpha.100" }}
        >
          Back to Course Curriculum
        </Button>
        <Box 
          p={10} 
          bg="rgba(15, 23, 42, 0.8)" 
          borderRadius="2xl" 
          border="1px solid" 
          borderColor="red.500" 
          boxShadow="2xl" 
          textAlign="center"
          backdropFilter="blur(20px)"
        >
          <VStack spacing={6}>
            <Box p={4} bg="red.900" borderRadius="full">
              <Icon as={AlertTriangle} color="red.300" w={8} h={8} />
            </Box>
            <Heading size="lg" color="white">
              Could Not Load Lesson
            </Heading>
            <Text color="gray.300" fontSize="md" maxW="md">
              {errorMsg || "The requested lesson is currently unavailable. You can retry generating it or return to the course curriculum."}
            </Text>
            <HStack spacing={4} pt={2}>
              <Button 
                colorScheme="purple" 
                leftIcon={<RefreshCw size={18} />} 
                onClick={loadLessonData}
                px={6}
              >
                Retry Generation
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate(`/dashboard/courses/${courseId}`)}
                px={6}
              >
                Return to Course
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    );
  }

  // 3. Render Enriched Lesson Content
  return (
    <Box maxW="5xl" mx="auto" py={6}>
      <HStack mb={8} justify="space-between" flexWrap="wrap" gap={4} p={4} bg="whiteAlpha.50" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" backdropFilter="blur(10px)">
        <Button 
          variant="ghost" 
          leftIcon={<ArrowLeft />} 
          onClick={() => navigate(`/dashboard/courses/${courseId}`)}
          _hover={{ bg: 'whiteAlpha.200', transform: 'translateX(-4px)' }}
          transition="all 0.2s"
          color="gray.300"
        >
          Back to Course
        </Button>
        <HStack>
           <Button 
             bgGradient={lesson.hinglishText ? "linear(to-r, gray.600, gray.700)" : "linear(to-r, blue.400, blue.600)"} 
             color="white" 
             leftIcon={<Languages />} 
             onClick={handleTranslate} 
             isLoading={isTranslating} 
             isDisabled={!!lesson.hinglishText}
             _hover={!lesson.hinglishText ? { transform: 'translateY(-2px)', boxShadow: '0 4px 15px rgba(66, 153, 225, 0.4)' } : {}}
             transition="all 0.2s"
           >
             {lesson.hinglishText ? 'Translated' : 'Translate to Hinglish'}
           </Button>
           <Button 
             bgGradient={!!audioUrl ? "linear(to-r, gray.600, gray.700)" : "linear(to-r, brand.400, pink.500)"} 
             color="white" 
             leftIcon={<PlayCircle />} 
             onClick={handleGenerateAudio} 
             isLoading={isGeneratingAudio} 
             isDisabled={!!audioUrl}
             _hover={!audioUrl ? { transform: 'translateY(-2px)', boxShadow: '0 4px 15px rgba(138, 43, 226, 0.4)' } : {}}
             transition="all 0.2s"
           >
             {audioUrl ? 'Audio Ready' : 'Generate Audio'}
           </Button>
           <Button 
             colorScheme={isCompleted ? "green" : "teal"} 
             variant={isCompleted ? "solid" : "outline"}
             leftIcon={<CheckCircle2 size={18} />} 
             onClick={handleToggleComplete}
             isLoading={markingComplete}
             _hover={{ transform: 'translateY(-2px)' }}
             transition="all 0.2s"
           >
             {isCompleted ? "Completed ✓" : "Mark as Complete"}
           </Button>
           <Button 
             colorScheme="green" 
             variant="outline"
             leftIcon={<Download />} 
             onClick={downloadPDF}
             _hover={{ bg: 'green.500', color: 'white', transform: 'translateY(-2px)' }}
             transition="all 0.2s"
           >
             PDF
           </Button>
        </HStack>
      </HStack>
      
      {audioUrl && (
        <Box mb={8} p={6} bgGradient="linear(to-r, gray.800, gray.900)" borderRadius="xl" border="1px solid" borderColor="brand.500" boxShadow="xl">
           <Text mb={4} color="brand.300" fontWeight="bold" display="flex" alignItems="center" gap={2}>
             <PlayCircle size={20} /> Listen to this lesson (Hinglish)
           </Text>
           <Box 
             as="audio" 
             key={audioUrl}
             controls 
             preload="auto"
             w="100%" 
             sx={{ '&::-webkit-media-controls-panel': { backgroundColor: '#cbd5e0' } }}
             onError={(e) => console.error("Audio playback error:", e)}
           >
             <source src={audioUrl} type="audio/wav" />
             Your browser does not support the audio element.
           </Box>
        </Box>
      )}

      <Box id="lesson-content" bg="gray.900" p={10} borderRadius="2xl" boxShadow="2xl" border="1px solid" borderColor="whiteAlpha.100" position="relative" overflow="hidden">
        <Box position="absolute" top="-10%" right="-10%" w="30%" h="50%" bgGradient="radial(brand.500, transparent, transparent)" opacity={0.1} filter="blur(60px)" pointerEvents="none" />
        
        <Box position="relative" zIndex={1}>
          <Heading size="2xl" mb={6} bgGradient="linear(to-r, brand.300, pink.300)" bgClip="text" fontWeight="extrabold" lineHeight="tall">
            {toSafeString(lesson.title)}
          </Heading>
          
          {Array.isArray(lesson.objectives) && lesson.objectives.length > 0 && (
            <Box mb={8} p={6} bg="whiteAlpha.50" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.200">
              <HStack spacing={3} mb={3}>
                <Icon as={Target} color="brand.300" w={5} h={5} />
                <Heading size="md" color="white">Learning Objectives</Heading>
              </HStack>
              <VStack align="stretch" spacing={2} pl={2}>
                {lesson.objectives.map((obj, oIdx) => (
                  <Text key={oIdx} color="gray.300" fontSize="md">✓ {toSafeString(obj)}</Text>
                ))}
              </VStack>
            </Box>
          )}

          {Array.isArray(lesson.keyTopics) && lesson.keyTopics.length > 0 && (
            <Box mb={8}>
              <HStack spacing={2} mb={3}>
                <Icon as={Tag} color="pink.400" w={4} h={4} />
                <Text fontWeight="semibold" fontSize="sm" color="gray.400" textTransform="uppercase" letterSpacing="wider">Key Topics</Text>
              </HStack>
              <Wrap spacing={2}>
                {lesson.keyTopics.map((topic, tIdx) => (
                  <WrapItem key={tIdx}>
                    <Badge colorScheme="purple" px={3} py={1} borderRadius="full" fontSize="sm">
                      {toSafeString(topic)}
                    </Badge>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>
          )}

          {lesson.hinglishText && (
            <Box mb={10} p={6} bg="brand.900" borderLeft="4px solid" borderColor="brand.400" borderRadius="md" boxShadow="md">
              <Text color="gray.200" fontSize="lg" lineHeight="relaxed" whiteSpace="pre-wrap">{toSafeString(lesson.hinglishText)}</Text>
            </Box>
          )}

          <LessonRenderer content={lesson.content} courseId={courseId} lessonId={lesson._id} />

          {((Array.isArray(lesson.readings) && lesson.readings.length > 0) || (Array.isArray(lesson.externalLinks) && lesson.externalLinks.length > 0)) && (
            <Box mt={12} pt={8} borderTop="1px solid" borderColor="whiteAlpha.200">
              <HStack spacing={3} mb={6}>
                <Icon as={BookOpen} color="brand.300" w={6} h={6} />
                <Heading size="lg" color="white">Suggested Readings & Resources</Heading>
              </HStack>
              <VStack align="stretch" spacing={4}>
                {lesson.readings?.map((reading, rIdx) => (
                  <Box key={rIdx} p={4} bg="whiteAlpha.50" borderRadius="lg" border="1px solid" borderColor="whiteAlpha.100">
                    <HStack justify="space-between" mb={1}>
                      <Text fontWeight="bold" color="brand.200">{toSafeString(reading.title)}</Text>
                      {reading.url && (
                        <ChakraLink href={reading.url} isExternal color="pink.300" fontSize="sm" display="flex" alignItems="center" gap={1}>
                          Visit <ExternalLink size={14} />
                        </ChakraLink>
                      )}
                    </HStack>
                    {reading.author && <Text fontSize="xs" color="gray.400" mb={1}>Author: {toSafeString(reading.author)}</Text>}
                    <Text fontSize="sm" color="gray.300">{toSafeString(reading.description)}</Text>
                  </Box>
                ))}
                {lesson.externalLinks?.map((link, lIdx) => (
                  <Box key={lIdx} p={4} bg="whiteAlpha.50" borderRadius="lg" border="1px solid" borderColor="whiteAlpha.100">
                    <HStack justify="space-between" mb={1}>
                      <Text fontWeight="bold" color="brand.200">{toSafeString(link.title)}</Text>
                      {link.url && (
                        <ChakraLink href={link.url} isExternal color="pink.300" fontSize="sm" display="flex" alignItems="center" gap={1}>
                          {toSafeString(link.source) || "Resource"} <ExternalLink size={14} />
                        </ChakraLink>
                      )}
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}