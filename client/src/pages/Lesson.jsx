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
          setLesson(generateRes.data.data);
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
    <Box maxW="4xl" mx="auto">
      <HStack mb={6} justify="space-between" flexWrap="wrap" gap={4}>
        <Button variant="ghost" leftIcon={<ArrowLeft />} onClick={() => navigate(`/courses/${courseId}`)}>
          Back to Course
        </Button>
        <HStack>
           <Button colorScheme="blue" leftIcon={<Languages />} onClick={handleTranslate} isLoading={isTranslating} isDisabled={!!lesson.hinglishText}>
             {lesson.hinglishText ? 'Translated' : 'Translate to Hinglish'}
           </Button>
           <Button colorScheme="purple" leftIcon={<PlayCircle />} onClick={handleGenerateAudio} isLoading={isGeneratingAudio} isDisabled={!lesson.hinglishText || !!audioUrl}>
             Generate Audio
           </Button>
           <Button colorScheme="green" leftIcon={<Download />} onClick={downloadPDF}>
             PDF
           </Button>
        </HStack>
      </HStack>
      
      {audioUrl && (
        <Box mb={6} p={4} bg="gray.800" borderRadius="md" border="1px solid" borderColor="brand.500">
           <Text mb={2} color="brand.400" fontWeight="bold">Lesson Audio (Hinglish)</Text>
           <audio controls src={audioUrl} style={{ width: '100%' }} />
        </Box>
      )}

      <Box id="lesson-content" bg="gray.800" p={8} borderRadius="xl" boxShadow="xl" border="1px solid" borderColor="whiteAlpha.200">
        <Heading size="2xl" mb={8} color="brand.400">{lesson.title}</Heading>
        
        {lesson.hinglishText && (
          <Box mb={8} p={4} bg="whiteAlpha.50" borderLeft="4px solid" borderColor="brand.500">
            <Text color="gray.300" whiteSpace="pre-wrap">{lesson.hinglishText}</Text>
          </Box>
        )}

        <LessonRenderer content={lesson.content} courseId={courseId} lessonId={lesson._id} />
      </Box>
    </Box>
  );
}