import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Heading, Spinner, Button, HStack, Text } from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { ArrowLeft, Download, Languages, PlayCircle } from 'lucide-react';
import LessonRenderer from '../components/LessonRenderer';
import api, { API_BASE_URL } from '../utils/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Lesson() {
  const { courseId, moduleIndex, lessonIndex } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAndGenerateLesson = async () => {
      try {
        const token = await getAccessTokenSilently();
        const courseRes = await api.get(`/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const courseData = courseRes.data.data;
        
        const mIdx = parseInt(moduleIndex);
        const lIdx = parseInt(lessonIndex);
        const currentModule = courseData.modules[mIdx];
        const currentLessonRef = currentModule.lessons[lIdx];
        
        if (currentLessonRef.isEnriched) {
          const lessonRes = await api.get(`/lessons/${currentLessonRef._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setLesson(lessonRes.data.data);
          
          if (lessonRes.data.data.audioUrl) {
            setAudioUrl(`${API_BASE_URL}${lessonRes.data.data.audioUrl}`);
          }
        } else {
          const generateRes = await api.post('/generate/lesson', {
            courseId: courseData._id,
            moduleId: currentModule._id,
            lessonTitle: currentLessonRef.title
          }, { headers: { Authorization: `Bearer ${token}` } });
          
          const generatedLessonData = generateRes.data.data;
          
          const updateRes = await api.put(`/lessons/${currentLessonRef._id}`, {
            ...generatedLessonData,
            isEnriched: true
          }, { headers: { Authorization: `Bearer ${token}` } });
          
          setLesson(updateRes.data.data);
        }
      } catch (error) {
         console.error(error);
         window.alert('Failed to load lesson');
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
      pdf.save(`${lesson.title}.pdf`);
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

  if (loading) return <Box p={10} textAlign="center"><Spinner size="xl" /><Heading size="md" mt={4}>AI is writing your lesson...</Heading></Box>;
  if (!lesson) return <Box>Lesson not found.</Box>;

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
           <Box as="audio" controls src={audioUrl} w="100%" sx={{ '&::-webkit-media-controls-panel': { backgroundColor: '#cbd5e0' } }} />
        </Box>
      )}

      <Box id="lesson-content" bg="gray.900" p={10} borderRadius="2xl" boxShadow="2xl" border="1px solid" borderColor="whiteAlpha.100" position="relative" overflow="hidden">
        <Box position="absolute" top="-10%" right="-10%" w="30%" h="50%" bgGradient="radial(brand.500, transparent, transparent)" opacity={0.1} filter="blur(60px)" pointerEvents="none" />
        
        <Box position="relative" zIndex={1}>
          <Heading size="2xl" mb={10} bgGradient="linear(to-r, brand.300, pink.300)" bgClip="text" fontWeight="extrabold" lineHeight="tall">{lesson.title}</Heading>
          
          {lesson.hinglishText && (
            <Box mb={10} p={6} bg="brand.900" borderLeft="4px solid" borderColor="brand.400" borderRadius="md" boxShadow="md">
              <Text color="gray.200" fontSize="lg" lineHeight="relaxed" whiteSpace="pre-wrap">{lesson.hinglishText}</Text>
            </Box>
          )}

          <LessonRenderer content={lesson.content} courseId={courseId} lessonId={lesson._id} />
        </Box>
      </Box>
    </Box>
  );
}