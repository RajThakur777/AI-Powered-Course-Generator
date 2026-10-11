import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Box, Heading, Text, VStack, HStack, Badge, Spinner, Button, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, IconButton, useToast, Progress as ChakraProgress } from '@chakra-ui/react';
import { Trash2, CheckCircle2, Award } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../utils/api';

export default function Course() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [courseProgress, setCourseProgress] = useState(null);
  const { user, getAccessTokenSilently } = useAuth0();
  const toast = useToast();
  const navigate = useNavigate();

  const fetchCourse = async () => {
    try {
      const token = await getAccessTokenSilently();
      const res = await api.get(`/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourse(res.data.data);

      // Fetch progress
      try {
        const progRes = await api.get(`/progress/course/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourseProgress(progRes.data.data);
      } catch (pErr) {
        console.warn("Could not load course progress:", pErr);
      }
    } catch (error) {
      console.error("Failed to fetch course", error);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId, getAccessTokenSilently]);

  const handleDeleteModule = async (moduleId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this module? This action cannot be undone.")) return;
    
    try {
      const token = await getAccessTokenSilently();
      await api.delete(`/modules/${moduleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({
        title: 'Module deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchCourse(); // refresh course data
    } catch (error) {
      toast({
        title: 'Failed to delete module',
        description: error.response?.data?.message || 'Error deleting module',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm("Are you sure you want to delete this ENTIRE course? This action cannot be undone.")) return;
    
    try {
      const token = await getAccessTokenSilently();
      await api.delete(`/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({
        title: 'Course deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/dashboard/library');
    } catch (error) {
      toast({
        title: 'Failed to delete course',
        description: error.response?.data?.message || 'Error deleting course',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteLesson = async (lessonId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    
    try {
      const token = await getAccessTokenSilently();
      await api.delete(`/lessons/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({
        title: 'Lesson deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchCourse(); // refresh course data
    } catch (error) {
      toast({
        title: 'Failed to delete lesson',
        description: error.response?.data?.message || 'Error deleting lesson',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!course) {
    return (
      <Box maxW="5xl" mx="auto" py={20} textAlign="center">
        <VStack spacing={4}>
          <Box p={3} bg="brand.900" borderRadius="xl" border="1px solid" borderColor="brand.500">
            <Spinner size="xl" color="brand.300" thickness="4px" />
          </Box>
          <Text color="gray.400" fontSize="lg">Loading Course Curriculum...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box maxW="5xl" mx="auto" py={8} px={4}>
      <Box p={8} borderRadius="2xl" bgGradient="linear(to-br, gray.800, gray.900)" boxShadow="2xl" border="1px solid" borderColor="whiteAlpha.100" mb={10} position="relative" overflow="hidden">
        <Box position="absolute" top="-20%" left="-10%" w="40%" h="150%" bgGradient="radial(brand.500, transparent, transparent)" opacity={0.15} filter="blur(60px)" zIndex={0} pointerEvents="none" />
        
        <Box position="relative" zIndex={1}>
          <HStack justify="space-between" align="center" mb={4} wrap="wrap" gap={4}>
            <Heading size="3xl" bgGradient="linear(to-r, brand.300, pink.300)" bgClip="text" fontWeight="extrabold" letterSpacing="tight">{course.title}</Heading>
            {course.creator?.auth0Id === user?.sub && (
              <Button 
                variant="outline"
                colorScheme="red"
                size="sm" 
                borderRadius="full"
                px={5}
                leftIcon={<Trash2 size={16} />}
                _hover={{ bg: 'red.500', color: 'white', transform: 'translateY(-2px)', boxShadow: 'md' }}
                transition="all 0.2s"
                onClick={handleDeleteCourse}
              >
                Delete Course
              </Button>
            )}
          </HStack>
          <Text fontSize="xl" color="gray.300" mb={8} maxW="3xl" lineHeight="tall">{course.description}</Text>
          
          <HStack mb={6} wrap="wrap" gap={3}>
            {course.tags?.map((tag, i) => (
              <Badge key={i} colorScheme="pink" px={4} py={2} borderRadius="full" textTransform="none" fontSize="sm" fontWeight="bold" bg="whiteAlpha.100" color="pink.200" border="1px solid" borderColor="pink.500">
                {tag}
              </Badge>
            ))}
          </HStack>

          {courseProgress && (
            <Box mt={6} pt={6} borderTop="1px solid" borderColor="whiteAlpha.200">
              <HStack justify="space-between" mb={2} wrap="wrap">
                <HStack spacing={2}>
                  <Award size={18} color="#a651ff" />
                  <Text fontWeight="bold" fontSize="sm" color="gray.300">
                    Course Progress: {courseProgress.completedLessons} of {courseProgress.totalLessons} Lessons Completed
                  </Text>
                </HStack>
                <Text fontWeight="extrabold" color="brand.300" fontSize="sm">
                  {courseProgress.percentage}%
                </Text>
              </HStack>
              <ChakraProgress
                value={courseProgress.percentage}
                size="sm"
                borderRadius="full"
                colorScheme="purple"
                bg="blackAlpha.600"
              />
            </Box>
          )}
        </Box>
      </Box>

      <Heading size="lg" mb={6} color="brand.200" display="flex" alignItems="center" gap={3}>
        <Box as="span" p={2} bg="brand.900" borderRadius="md" border="1px solid" borderColor="brand.500">📚</Box> Course Curriculum
      </Heading>
      
      <Accordion allowMultiple>
        {course.modules?.map((module, mIdx) => (
          <AccordionItem key={module._id} border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" mb={6} bg="gray.900" overflow="hidden" boxShadow="lg">
            <h2>
              <AccordionButton py={6} px={6} _hover={{ bg: 'whiteAlpha.50' }} transition="all 0.2s">
                <Box flex="1" textAlign="left" fontWeight="bold" fontSize="xl" color="white">
                  <Text as="span" color="brand.400" mr={3}>Module {mIdx + 1}:</Text> {module.title}
                </Box>
                <HStack spacing={4}>
                  {course.creator?.auth0Id === user?.sub && (
                    <IconButton 
                      icon={<Trash2 size={18} />} 
                      colorScheme="red" 
                      variant="ghost" 
                      size="sm" 
                      borderRadius="full"
                      color="red.400"
                      _hover={{ bg: 'red.500', color: 'white', transform: 'scale(1.1)' }}
                      transition="all 0.2s"
                      aria-label="Delete module" 
                      onClick={(e) => handleDeleteModule(module._id, e)}
                    />
                  )}
                  <AccordionIcon color="brand.400" fontSize="2xl" />
                </HStack>
              </AccordionButton>
            </h2>
            <AccordionPanel pb={6} px={6} bg="blackAlpha.400">
              <VStack align="stretch" spacing={3}>
                {module.lessons?.map((lesson, lIdx) => {
                  const lessonProg = courseProgress?.progress?.find(
                    (p) => (p.lesson?._id || p.lesson) === lesson._id
                  );
                  const isDone = !!lessonProg?.completed;
                  const quizScore = lessonProg?.quizScore;

                  return (
                    <HStack 
                      key={lesson._id} 
                      p={4} 
                      bg="whiteAlpha.50" 
                      borderRadius="lg" 
                      justify="space-between" 
                      _hover={{ bg: 'whiteAlpha.200', transform: 'translateX(4px)', borderColor: 'brand.500' }} 
                      border="1px solid"
                      borderColor={isDone ? "green.600" : "transparent"}
                      transition="all 0.3s ease"
                      boxShadow="sm"
                    >
                      <HStack spacing={4}>
                        <Box 
                          w={8} 
                          h={8} 
                          borderRadius="full" 
                          bg={isDone ? "green.900" : "brand.900"} 
                          color={isDone ? "green.300" : "brand.300"} 
                          border="1px solid"
                          borderColor={isDone ? "green.500" : "brand.500"}
                          display="flex" 
                          alignItems="center" 
                          justifyContent="center" 
                          fontWeight="bold" 
                          fontSize="sm"
                        >
                          {isDone ? <CheckCircle2 size={16} /> : lIdx + 1}
                        </Box>
                        <Box>
                          <Text fontWeight="medium" fontSize="lg" color="gray.200">{lesson.title}</Text>
                          {isDone && (
                            <HStack spacing={2} mt={0.5}>
                              <Badge colorScheme="green" fontSize="xs">Completed</Badge>
                              {quizScore !== null && quizScore !== undefined && (
                                <Badge colorScheme="purple" fontSize="xs">Quiz: {quizScore}%</Badge>
                              )}
                            </HStack>
                          )}
                        </Box>
                      </HStack>
                      <HStack spacing={2}>
                        <Button 
                          as={Link} 
                          to={`/dashboard/courses/${course._id}/module/${mIdx}/lesson/${lIdx}`} 
                          size="sm" 
                          colorScheme={isDone ? "green" : (lesson.isEnriched ? "brand" : "purple")} 
                          variant={isDone ? 'solid' : (lesson.isEnriched ? 'solid' : 'outline')}
                          borderRadius="full"
                          px={6}
                          _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                        >
                          {isDone ? 'Review Lesson' : (lesson.isEnriched ? 'View Lesson' : 'Generate & Learn')}
                        </Button>
                        {course.creator?.auth0Id === user?.sub && (
                          <IconButton 
                            icon={<Trash2 size={16} />} 
                            colorScheme="red" 
                            variant="ghost" 
                            size="sm" 
                            borderRadius="full"
                            color="red.400"
                            _hover={{ bg: 'red.500', color: 'white', transform: 'scale(1.1)' }}
                            transition="all 0.2s"
                            aria-label="Delete lesson" 
                            onClick={(e) => { e.preventDefault(); handleDeleteLesson(lesson._id, e); }}
                          />
                        )}
                      </HStack>
                    </HStack>
                  );
                })}
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
}