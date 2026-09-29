import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Heading, Text, VStack, HStack, Badge, Spinner, Button, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../utils/api';

export default function Course() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await api.get(`/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourse(res.data.data);
      } catch (error) {
        console.error("Failed to fetch course", error);
      }
    };
    fetchCourse();
  }, [courseId, getAccessTokenSilently]);

  if (!course) return <Box p={10} textAlign="center"><Spinner size="xl" /></Box>;

  return (
    <Box maxW="4xl" mx="auto">
      <Heading mb={4}>{course.title}</Heading>
      <Text fontSize="lg" color="gray.400" mb={6}>{course.description}</Text>
      
      <HStack mb={8}>
        {course.tags?.map((tag, i) => <Badge key={i} colorScheme="brand" px={2} py={1} borderRadius="md">{tag}</Badge>)}
      </HStack>

      <Heading size="md" mb={4}>Curriculum</Heading>
      <Accordion allowMultiple defaultIndex={[0]}>
        {course.modules?.map((module, mIdx) => (
          <AccordionItem key={module._id} border="1px solid" borderColor="whiteAlpha.200" borderRadius="md" mb={4} bg="gray.800">
            <h2>
              <AccordionButton py={4} _hover={{ bg: 'whiteAlpha.100' }}>
                <Box flex="1" textAlign="left" fontWeight="bold">
                  Module {mIdx + 1}: {module.title}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} bg="gray.900">
              <VStack align="stretch" spacing={2}>
                {module.lessons?.map((lesson, lIdx) => (
                  <HStack key={lesson._id} p={3} bg="whiteAlpha.50" borderRadius="md" justify="space-between" _hover={{ bg: 'whiteAlpha.200' }}>
                    <Text>{lIdx + 1}. {lesson.title}</Text>
                    <Button as={Link} to={`/courses/${course._id}/module/${mIdx}/lesson/${lIdx}`} size="sm" colorScheme="brand" variant={lesson.isEnriched ? 'solid' : 'outline'}>
                      {lesson.isEnriched ? 'View Lesson' : 'Generate & Learn'}
                    </Button>
                  </HStack>
                ))}
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
}