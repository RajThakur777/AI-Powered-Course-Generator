import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, SimpleGrid, Spinner, Container, VStack, useToast } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Library() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAccessTokenSilently } = useAuth0();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await api.get('/courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(res.data.data);
      } catch (error) {
        toast({
          title: 'Failed to load library.',
          description: error.response?.data?.message || 'Error fetching courses',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [getAccessTokenSilently, toast]);

  if (loading) {
    return (
      <Box display="flex" h="100%" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="brand.500" />
      </Box>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Heading size="2xl">My Library</Heading>
        <Text color="gray.400">Here are the courses you have generated.</Text>

        {courses.length === 0 ? (
          <Box p={8} bg="whiteAlpha.100" borderRadius="xl" textAlign="center">
            <Text fontSize="lg">You haven't created any courses yet.</Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {courses.map((course) => (
              <Box 
                key={course._id} 
                p={6} 
                bg="gray.800" 
                borderRadius="xl" 
                boxShadow="xl"
                cursor="pointer"
                _hover={{ transform: 'translateY(-4px)', boxShadow: '2xl', bg: 'gray.700' }}
                transition="all 0.2s"
                onClick={() => navigate(`/dashboard/courses/${course._id}`)}
              >
                <Heading size="md" mb={2} noOfLines={2}>{course.title}</Heading>
                <Text color="gray.400" fontSize="sm" noOfLines={3} mb={4}>
                  {course.description}
                </Text>
                <Text fontSize="xs" color="brand.400" fontWeight="bold">
                  {course.modules?.length || 0} Modules
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  );
}
