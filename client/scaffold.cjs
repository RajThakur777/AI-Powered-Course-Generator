const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src');

const dirs = [
  'components/blocks',
  'pages',
  'hooks',
  'context',
  'utils'
];

dirs.forEach(d => {
  fs.mkdirSync(path.join(baseDir, d), { recursive: true });
});

const files = {
  '../.env': `VITE_AUTH0_DOMAIN=dev-jd1om21bsi8djwz6.us.auth0.com
VITE_AUTH0_CLIENT_ID=YOUR_CLIENT_ID
VITE_API_URL=http://localhost:5000
VITE_AUTH0_AUDIENCE=https://api.text-to-learn.com`,

  'utils/api.js': `import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: \`\${API_BASE_URL}/api\`
});

export default api;`,

  'main.jsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

const theme = extendTheme({
  config: { initialColorMode: 'dark', useSystemColorMode: false },
  colors: { brand: { 400: '#9b4dca', 500: '#8A2BE2' } }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE
      }}
    >
      <ChakraProvider theme={theme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ChakraProvider>
    </Auth0Provider>
  </React.StrictMode>
);`,

  'App.jsx': `import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Course from './pages/Course';
import Lesson from './pages/Lesson';

function App() {
  return (
    <Flex h="100vh" bg="gray.900" color="white">
      <Sidebar />
      <Box flex="1" overflowY="auto" p={8}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses/:courseId" element={<Course />} />
          <Route path="/courses/:courseId/module/:moduleIndex/lesson/:lessonIndex" element={<Lesson />} />
        </Routes>
      </Box>
    </Flex>
  );
}

export default App;`,

  'components/Sidebar.jsx': `import React from 'react';
import { Box, VStack, Button, Text, Divider } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { BookOpen, LogIn, LogOut, Home } from 'lucide-react';

export default function Sidebar() {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  return (
    <Box w="250px" bg="gray.800" h="full" p={4} borderRight="1px solid" borderColor="whiteAlpha.200">
      <VStack spacing={6} align="stretch" h="full">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="brand.500" display="flex" alignItems="center" gap={2}>
            <BookOpen /> Text2Learn
          </Text>
        </Box>
        
        <Divider borderColor="whiteAlpha.200" />
        
        <VStack align="stretch" spacing={2} flex={1}>
          <Button as={Link} to="/" variant="ghost" justifyContent="flex-start" leftIcon={<Home size={18} />}>
            Home
          </Button>
        </VStack>

        <Box>
          {isAuthenticated ? (
            <VStack align="stretch" spacing={3}>
              <Text fontSize="sm" color="gray.400" isTruncated>Hi, {user.name}</Text>
              <Button colorScheme="red" variant="outline" leftIcon={<LogOut size={18} />} onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
                Log Out
              </Button>
            </VStack>
          ) : (
            <Button colorScheme="brand" leftIcon={<LogIn size={18} />} onClick={() => loginWithRedirect()}>
              Log In
            </Button>
          )}
        </Box>
      </VStack>
    </Box>
  );
}`,

  'pages/Home.jsx': `import React, { useState } from 'react';
import { Box, Heading, Text, Input, Button, VStack, useToast, Spinner, Container } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const toast = useToast();
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    if (!isAuthenticated) {
      toast({ title: 'Please login first', status: 'warning', duration: 3000 });
      return;
    }

    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const res = await api.post('/generate/course', { topic }, {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      
      const generatedCourse = res.data.data;
      
      const saveRes = await api.post('/courses', generatedCourse, {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      
      const newCourseId = saveRes.data.data._id;
      toast({ title: 'Course Generated!', status: 'success', duration: 3000 });
      navigate(\`/courses/\${newCourseId}\`);
      
    } catch (error) {
      console.error(error);
      toast({ title: 'Generation failed', description: error.response?.data?.message || 'Error', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.md" centerContent py={20}>
      <VStack spacing={8} w="full">
        <Heading size="3xl" bgGradient="linear(to-r, brand.400, pink.400)" bgClip="text" textAlign="center">
          What do you want to learn today?
        </Heading>
        <Text fontSize="xl" color="gray.400" textAlign="center">
          Enter any topic, and our AI will generate a complete, structured course for you in seconds.
        </Text>
        
        <Box w="full" bg="whiteAlpha.100" p={6} borderRadius="xl" boxShadow="2xl" border="1px solid" borderColor="whiteAlpha.200">
          <VStack spacing={4}>
            <Input 
              size="lg" 
              placeholder="e.g. Introduction to React Hooks..." 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              bg="gray.800"
              border="none"
              _focus={{ ring: 2, ringColor: "brand.500" }}
            />
            <Button 
              size="lg" 
              w="full" 
              colorScheme="brand" 
              onClick={handleGenerate} 
              isDisabled={!topic.trim() || loading}
            >
              {loading ? <Spinner mr={2} /> : null}
              {loading ? 'Generating Course Curriculum...' : 'Generate Course'}
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}`,

  'pages/Course.jsx': `import React, { useEffect, useState } from 'react';
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
        const res = await api.get(\`/courses/\${courseId}\`, {
          headers: { Authorization: \`Bearer \${token}\` }
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
                    <Button as={Link} to={\`/courses/\${course._id}/module/\${mIdx}/lesson/\${lIdx}\`} size="sm" colorScheme="brand" variant={lesson.isEnriched ? 'solid' : 'outline'}>
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
}`,

  'pages/Lesson.jsx': `import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Heading, Spinner, Button, useToast, HStack } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { ArrowLeft, Download } from 'lucide-react';
import LessonRenderer from '../components/LessonRenderer';
import api from '../utils/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Lesson() {
  const { courseId, moduleIndex, lessonIndex } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getAccessTokenSilently } = useAuth0();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAndGenerateLesson = async () => {
      try {
        const token = await getAccessTokenSilently();
        const courseRes = await api.get(\`/courses/\${courseId}\`, {
          headers: { Authorization: \`Bearer \${token}\` }
        });
        const courseData = courseRes.data.data;
        
        const mIdx = parseInt(moduleIndex);
        const lIdx = parseInt(lessonIndex);
        const currentModule = courseData.modules[mIdx];
        const currentLessonRef = currentModule.lessons[lIdx];
        
        if (currentLessonRef.isEnriched) {
          const lessonRes = await api.get(\`/lessons/\${currentLessonRef._id}\`, {
            headers: { Authorization: \`Bearer \${token}\` }
          });
          setLesson(lessonRes.data.data);
        } else {
          const generateRes = await api.post('/generate/lesson', {
            courseId: courseData._id,
            moduleId: currentModule._id,
            lessonTitle: currentLessonRef.title
          }, { headers: { Authorization: \`Bearer \${token}\` } });
          setLesson(generateRes.data.data);
        }
      } catch (error) {
         console.error(error);
         toast({ title: 'Failed to load lesson', status: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchAndGenerateLesson();
  }, [courseId, moduleIndex, lessonIndex, getAccessTokenSilently]);

  const downloadPDF = () => {
    const input = document.getElementById('lesson-content');
    html2canvas(input, { backgroundColor: '#171923' }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(\`\${lesson.title}.pdf\`);
    });
  };

  if (loading) return <Box p={10} textAlign="center"><Spinner size="xl" /><Heading size="md" mt={4}>AI is writing your lesson...</Heading></Box>;
  if (!lesson) return <Box>Lesson not found.</Box>;

  return (
    <Box maxW="4xl" mx="auto">
      <HStack mb={6} justify="space-between">
        <Button variant="ghost" leftIcon={<ArrowLeft />} onClick={() => navigate(\`/courses/\${courseId}\`)}>
          Back to Course
        </Button>
        <Button colorScheme="green" leftIcon={<Download />} onClick={downloadPDF}>
          Download PDF
        </Button>
      </HStack>
      
      <Box id="lesson-content" bg="gray.800" p={8} borderRadius="xl" boxShadow="xl" border="1px solid" borderColor="whiteAlpha.200">
        <Heading size="2xl" mb={8} color="brand.400">{lesson.title}</Heading>
        <LessonRenderer content={lesson.content} />
      </Box>
    </Box>
  );
}`,

  'components/LessonRenderer.jsx': `import React from 'react';
import { Box, Heading, Text, VStack, Code, RadioGroup, Radio, Divider } from '@chakra-ui/react';

export default function LessonRenderer({ content }) {
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
            return (
              <Box key={idx} borderRadius="md" overflow="hidden" my={4} border="1px solid" borderColor="gray.700" bg="gray.900" p={4} textAlign="center">
                 <Text color="brand.400" mb={2}>Suggested Video Search: {block.query || block.url}</Text>
              </Box>
            );
          case 'mcq':
            return (
              <Box key={idx} p={6} bg="whiteAlpha.50" borderRadius="lg" border="1px solid" borderColor="brand.500">
                <Heading size="md" mb={4}>Quiz Time!</Heading>
                <Text mb={4}>{block.question}</Text>
                <RadioGroup>
                  <VStack align="stretch">
                    {block.options?.map((opt, oIdx) => (
                      <Radio key={oIdx} value={oIdx.toString()} colorScheme="brand">{opt}</Radio>
                    ))}
                  </VStack>
                </RadioGroup>
              </Box>
            );
          default:
            return null;
        }
      })}
    </VStack>
  );
}`
};

Object.keys(files).forEach(file => {
  fs.writeFileSync(path.join(baseDir, file), files[file]);
});

console.log('Scaffolding complete.');
