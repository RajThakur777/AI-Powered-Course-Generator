import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  Flex,
  Badge,
  Input,
  InputGroup,
  InputRightElement,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useToast
} from '@chakra-ui/react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  BrainCircuit,
  Headphones,
  LayoutList,
  ArrowRight,
  LogIn,
  Sparkles,
  CheckCircle2,
  FileDown,
  Globe2,
  Play,
  Layers,
  Award,
  Users,
  Compass,
  Star,
  ChevronRight
} from 'lucide-react';

export default function Landing() {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const toast = useToast();
  const [demoPrompt, setDemoPrompt] = useState('');

  const sampleTopics = [
    'Machine Learning with Python',
    'Intro to React Hooks & State',
    'Basics of Copyright Law',
    'Financial Modeling 101',
    'Cybersecurity Essentials'
  ];

  const handleCtaClick = (prompt) => {
    const targetTopic = (typeof prompt === 'string' && prompt.trim()) ? prompt.trim() : demoPrompt.trim();
    if (targetTopic) {
      localStorage.setItem('pendingCourseTopic', targetTopic);
    }
    if (isAuthenticated) {
      navigate('/dashboard', { state: { topic: targetTopic } });
    } else {
      loginWithRedirect();
    }
  };

  const handleDemoGenerate = (e) => {
    e.preventDefault();
    if (!demoPrompt.trim()) {
      toast({
        title: "Enter a topic",
        description: "Please type any subject or pick one of the suggestions below.",
        status: "info",
        duration: 2500,
        isClosable: true
      });
      return;
    }
    handleCtaClick(demoPrompt);
  };

  return (
    <Box bg="#080c14" color="white" minH="100vh" overflowX="hidden" position="relative">
      {/* Background ambient lighting */}
      <Box
        position="absolute"
        top="-10%"
        left="50%"
        transform="translateX(-50%)"
        w="900px"
        h="600px"
        bgGradient="radial(rgba(138, 43, 226, 0.22), transparent 70%)"
        filter="blur(110px)"
        pointerEvents="none"
        zIndex={0}
      />
      <Box
        position="absolute"
        top="40%"
        right="-10%"
        w="700px"
        h="700px"
        bgGradient="radial(rgba(236, 72, 153, 0.12), transparent 70%)"
        filter="blur(120px)"
        pointerEvents="none"
        zIndex={0}
      />

      {/* Modern Navigation Header */}
      <Box
        as="nav"
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
        py={4}
        backdropFilter="blur(16px)"
        position="sticky"
        top={0}
        zIndex={100}
        bg="rgba(8, 12, 20, 0.85)"
      >
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <Flex
              alignItems="center"
              gap={3}
              cursor="pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <Box
                p={2.5}
                bgGradient="linear(to-br, brand.500, pink.500)"
                borderRadius="xl"
                boxShadow="0 0 25px rgba(138, 43, 226, 0.55)"
              >
                <Icon as={BookOpen} w={5} h={5} color="white" />
              </Box>
              <Box>
                <Text
                  fontSize="2xl"
                  fontWeight="900"
                  fontFamily="heading"
                  bgGradient="linear(to-r, white, brand.200, pink.300)"
                  bgClip="text"
                  letterSpacing="tight"
                >
                  Text2Learn
                </Text>
              </Box>
            </Flex>

            {/* Nav links */}
            <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
              <Text as="a" href="#features" color="gray.300" _hover={{ color: 'white' }} fontSize="sm" fontWeight="500">
                Features
              </Text>
              <Text as="a" href="#how-it-works" color="gray.300" _hover={{ color: 'white' }} fontSize="sm" fontWeight="500">
                How It Works
              </Text>
              <Text as="a" href="#preview" color="gray.300" _hover={{ color: 'white' }} fontSize="sm" fontWeight="500">
                Curriculum Demo
              </Text>
              <Text as="a" href="#faq" color="gray.300" _hover={{ color: 'white' }} fontSize="sm" fontWeight="500">
                FAQ
              </Text>
            </HStack>

            <HStack spacing={4}>
              {isAuthenticated ? (
                <Button
                  bgGradient="linear(to-r, brand.500, pink.500)"
                  color="white"
                  borderRadius="full"
                  px={6}
                  fontWeight="600"
                  _hover={{ transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(138,43,226,0.45)' }}
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </Button>
              ) : (
                <Button
                  variant="outline"
                  borderColor="whiteAlpha.300"
                  borderRadius="full"
                  px={6}
                  leftIcon={<LogIn size={18} />}
                  _hover={{ bg: 'whiteAlpha.100', borderColor: 'brand.400' }}
                  onClick={() => loginWithRedirect()}
                >
                  Sign In
                </Button>
              )}
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box position="relative" pt={{ base: 16, md: 28 }} pb={{ base: 16, md: 24 }} zIndex={1}>
        <Container maxW="container.lg" textAlign="center">
          <VStack spacing={6}>
            {/* Top Announcement Badge */}
            <Badge
              px={4}
              py={1.5}
              borderRadius="full"
              bg="rgba(138, 43, 226, 0.15)"
              border="1px solid"
              borderColor="rgba(138, 43, 226, 0.4)"
              color="brand.200"
              fontSize="xs"
              fontWeight="bold"
              letterSpacing="wider"
              textTransform="uppercase"
              display="flex"
              alignItems="center"
              gap={2}
            >
              <Icon as={Sparkles} w={3.5} h={3.5} color="brand.300" />
              Autonomous Course Creation • Powered by Gemini 3.5 & 3.8
            </Badge>

            {/* Main Punchy Heading */}
            <Heading
              size="4xl"
              fontWeight="900"
              fontFamily="heading"
              letterSpacing="tight"
              lineHeight={{ base: 1.2, md: 1.15 }}
            >
              Transform Any Topic into a <br />
              <Text as="span" bgGradient="linear(to-r, brand.300, pink.400, purple.200)" bgClip="text">
                Complete, Interactive Online Course
              </Text>
            </Heading>

            {/* Subheading */}
            <Text fontSize={{ base: 'lg', md: 'xl' }} color="gray.300" maxW="3xl" lineHeight="tall">
              Type any subject—from <em>"Quantum Computing Basics"</em> to <em>"Corporate Tax Strategies"</em>. 
              Get modular chapters, rich markdown lessons, interactive knowledge checks, YouTube videos, and Hinglish audio narration in seconds.
            </Text>

            {/* Interactive Prompt Ingestion Input Form */}
            <Box
              as="form"
              onSubmit={handleDemoGenerate}
              w="full"
              maxW="2xl"
              mt={4}
              p={2}
              bg="rgba(255, 255, 255, 0.04)"
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.12)"
              borderRadius="full"
              boxShadow="0 15px 40px rgba(0, 0, 0, 0.6)"
              backdropFilter="blur(20px)"
            >
              <InputGroup size="lg">
                <Input
                  value={demoPrompt}
                  onChange={(e) => setDemoPrompt(e.target.value)}
                  placeholder="What would you like to learn today? (e.g. Intro to Docker)"
                  border="none"
                  _focus={{ boxShadow: 'none' }}
                  fontSize={{ base: 'sm', md: 'md' }}
                  color="white"
                  pl={6}
                />
                <InputRightElement width="auto" pr={1}>
                  <Button
                    type="submit"
                    h={11}
                    px={7}
                    borderRadius="full"
                    bgGradient="linear(to-r, brand.500, pink.500)"
                    color="white"
                    fontWeight="bold"
                    rightIcon={<ArrowRight size={18} />}
                    _hover={{
                      transform: 'scale(1.02)',
                      boxShadow: '0 8px 30px rgba(138,43,226,0.5)'
                    }}
                    transition="all 0.2s"
                  >
                    Generate Course
                  </Button>
                </InputRightElement>
              </InputGroup>
            </Box>

            {/* Prompt Tag Chips */}
            <HStack spacing={2} wrap="wrap" justify="center" pt={2}>
              <Text fontSize="xs" color="gray.400" fontWeight="600" textTransform="uppercase" letterSpacing="wider">
                Trending prompts:
              </Text>
              {sampleTopics.map((topic, idx) => (
                <Button
                  key={idx}
                  size="xs"
                  variant="outline"
                  borderColor="whiteAlpha.200"
                  borderRadius="full"
                  color="gray.300"
                  _hover={{ bg: 'whiteAlpha.100', borderColor: 'brand.400', color: 'brand.200' }}
                  onClick={() => {
                    setDemoPrompt(topic);
                    handleCtaClick(topic);
                  }}
                >
                  {topic}
                </Button>
              ))}
            </HStack>

            {/* Key Trust Signals */}
            <HStack spacing={{ base: 4, md: 8 }} pt={6} color="gray.400" fontSize="sm" wrap="wrap" justify="center">
              <HStack spacing={2}>
                <Icon as={CheckCircle2} color="green.400" />
                <Text>3–6 Structured Modules</Text>
              </HStack>
              <HStack spacing={2}>
                <Icon as={CheckCircle2} color="green.400" />
                <Text>Interactive MCQs</Text>
              </HStack>
              <HStack spacing={2}>
                <Icon as={CheckCircle2} color="green.400" />
                <Text>Multilingual Audio</Text>
              </HStack>
              <HStack spacing={2}>
                <Icon as={CheckCircle2} color="green.400" />
                <Text>Offline PDF Export</Text>
              </HStack>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Interactive Curriculum Preview Showcase */}
      <Box id="preview" py={12} position="relative" zIndex={1}>
        <Container maxW="container.lg">
          <Box
            p={{ base: 6, md: 10 }}
            bg="rgba(15, 23, 42, 0.75)"
            borderRadius="3xl"
            border="1px solid"
            borderColor="whiteAlpha.200"
            boxShadow="0 25px 60px -15px rgba(0, 0, 0, 0.8)"
            backdropFilter="blur(20px)"
          >
            <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4} mb={8}>
              <Box>
                <HStack spacing={2} mb={2}>
                  <Badge colorScheme="purple" px={3} py={1} borderRadius="full">AI Generated Example</Badge>
                  <Badge colorScheme="green" px={3} py={1} borderRadius="full">Beginner • 4 Modules</Badge>
                </HStack>
                <Heading size="lg" color="white" fontFamily="heading">
                  Prompt: "Deep Dive into Docker & Microservices"
                </Heading>
                <Text color="gray.400" fontSize="sm" mt={1}>
                  Synthesized curriculum with rich code snippets, quizzes, curated YouTube lectures & narration.
                </Text>
              </Box>
              <Button
                size="md"
                bgGradient="linear(to-r, brand.500, pink.500)"
                color="white"
                borderRadius="full"
                rightIcon={<ChevronRight size={18} />}
                onClick={() => handleCtaClick('Deep Dive into Docker & Microservices')}
              >
                Try In Dashboard
              </Button>
            </Flex>

            {/* Syllabus card snippet */}
            <VStack spacing={3} align="stretch">
              <Box p={4} bg="whiteAlpha.50" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
                <Flex justify="space-between" align="center">
                  <HStack spacing={3}>
                    <Box p={2} bg="brand.900" borderRadius="lg" color="brand.300">
                      <Layers size={18} />
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="white">Module 1: Containerization Fundamentals</Text>
                      <Text fontSize="xs" color="gray.400">3 Lessons • Includes Architecture Diagram & Video Search</Text>
                    </Box>
                  </HStack>
                  <Badge colorScheme="purple">Ready</Badge>
                </Flex>
              </Box>

              <Box p={4} bg="whiteAlpha.50" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
                <Flex justify="space-between" align="center">
                  <HStack spacing={3}>
                    <Box p={2} bg="brand.900" borderRadius="lg" color="brand.300">
                      <Headphones size={18} />
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="white">Module 2: Dockerfiles, Images & Multi-stage Builds</Text>
                      <Text fontSize="xs" color="gray.400">4 Lessons • Hinglish Speech & Interactive Quiz</Text>
                    </Box>
                  </HStack>
                  <Badge colorScheme="purple">Audio Ready</Badge>
                </Flex>
              </Box>

              <Box p={4} bg="whiteAlpha.50" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100">
                <Flex justify="space-between" align="center">
                  <HStack spacing={3}>
                    <Box p={2} bg="brand.900" borderRadius="lg" color="brand.300">
                      <Award size={18} />
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="white">Module 3: Multi-container Orchestration with Compose</Text>
                      <Text fontSize="xs" color="gray.400">3 Lessons • Code examples & Final Certification Quiz</Text>
                    </Box>
                  </HStack>
                  <Badge colorScheme="green">Enriched</Badge>
                </Flex>
              </Box>
            </VStack>
          </Box>
        </Container>
      </Box>

      {/* Comprehensive Features Section */}
      <Box id="features" py={24} position="relative" zIndex={1} bg="rgba(0, 0, 0, 0.3)">
        <Container maxW="container.xl">
          <VStack spacing={16}>
            <Box textAlign="center" maxW="2xl">
              <Badge colorScheme="purple" px={3} py={1} borderRadius="full" mb={3}>Everything You Need</Badge>
              <Heading size="2xl" fontFamily="heading" mb={4}>Built for Modern Self-Learners</Heading>
              <Text color="gray.400" fontSize="lg">
                Text2Learn combines large language models with real educational pedagogy to give you an end-to-end learning environment.
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
              <FeatureCard
                icon={BrainCircuit}
                gradient="linear(to-br, purple.500, blue.500)"
                title="Curriculum Engineering"
                desc="Algorithms structure your topic into progression-focused modules (3-6 units) and progressive lessons (3-5 lessons each)."
              />
              <FeatureCard
                icon={Headphones}
                gradient="linear(to-br, pink.500, purple.600)"
                title="Multilingual TTS Audio"
                desc="Generate Hinglish audio explanations via Gemini TTS. Listen at your desk or during your daily commute."
              />
              <FeatureCard
                icon={Play}
                gradient="linear(to-br, red.500, pink.600)"
                title="Curated Video Integration"
                desc="Automatic YouTube Data API v3 querying embeds verified video lessons matching the exact chapter concepts."
              />
              <FeatureCard
                icon={LayoutList}
                gradient="linear(to-br, cyan.500, blue.600)"
                title="Knowledge Checks & Quizzes"
                desc="Instant 4-option multiple choice questions with explanations and immediate progress score persistence."
              />
              <FeatureCard
                icon={FileDown}
                gradient="linear(to-br, green.500, teal.600)"
                title="One-Click PDF Export"
                desc="Download complete lesson notes formatted with dark-mode styling for offline reading and revision."
              />
              <FeatureCard
                icon={Globe2}
                gradient="linear(to-br, orange.500, pink.500)"
                title="Hinglish AI Translation"
                desc="Bridge language barriers with contextual Indian-English translation for students who prefer bilingual learning."
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* How It Works (Step by Step) */}
      <Box id="how-it-works" py={20} position="relative" zIndex={1}>
        <Container maxW="container.lg">
          <VStack spacing={12}>
            <Box textAlign="center">
              <Heading size="2xl" fontFamily="heading" mb={4}>How Text2Learn Works</Heading>
              <Text color="gray.400" fontSize="lg">3 effortless steps from a rough idea to mastery</Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} w="full">
              <StepCard
                number="01"
                title="Type Any Topic"
                desc="Provide a concept, framework, or exam topic. No need for complex prompt engineering."
              />
              <StepCard
                number="02"
                title="AI Builds Curriculum"
                desc="Gemini creates titles, key topics, objectives, code samples, and YouTube video recommendations."
              />
              <StepCard
                number="03"
                title="Learn, Listen & Test"
                desc="Read rich text, listen to Hinglish audio narration, solve quizzes, and download PDFs."
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* FAQ Accordion */}
      <Box id="faq" py={20} bg="rgba(0,0,0,0.2)" position="relative" zIndex={1}>
        <Container maxW="container.md">
          <VStack spacing={8}>
            <Box textAlign="center">
              <Heading size="xl" fontFamily="heading" mb={3}>Frequently Asked Questions</Heading>
              <Text color="gray.400">Everything you need to know about the platform</Text>
            </Box>

            <Accordion allowMultiple w="full">
              <AccordionItem border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" mb={4} bg="gray.900" overflow="hidden">
                <h2>
                  <AccordionButton py={5} px={6} _hover={{ bg: 'whiteAlpha.50' }}>
                    <Box flex="1" textAlign="left" fontWeight="bold" fontSize="lg">
                      Can I generate a course on non-technical topics?
                    </Box>
                    <AccordionIcon color="brand.400" />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={6} px={6} color="gray.300">
                  Yes! Text2Learn adapts to any topic—from culinary arts and history to machine learning and financial regulations. It detects when code is required and generates code blocks only when relevant.
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" mb={4} bg="gray.900" overflow="hidden">
                <h2>
                  <AccordionButton py={5} px={6} _hover={{ bg: 'whiteAlpha.50' }}>
                    <Box flex="1" textAlign="left" fontWeight="bold" fontSize="lg">
                      How does the Hinglish translation and audio work?
                    </Box>
                    <AccordionIcon color="brand.400" />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={6} px={6} color="gray.300">
                  We use Google Gemini to generate natural conversational Hinglish (Hindi written in Latin script) explanations, and synthesize high-clarity 24kHz audio via the dedicated Gemini TTS model.
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" mb={4} bg="gray.900" overflow="hidden">
                <h2>
                  <AccordionButton py={5} px={6} _hover={{ bg: 'whiteAlpha.50' }}>
                    <Box flex="1" textAlign="left" fontWeight="bold" fontSize="lg">
                      Can I save and revisit my courses?
                    </Box>
                    <AccordionIcon color="brand.400" />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={6} px={6} color="gray.300">
                  Yes. With Auth0 authentication and MongoDB persistence, all courses, lesson contents, and quiz progress are permanently saved in your personal library.
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </VStack>
        </Container>
      </Box>

      {/* Call to Action Banner */}
      <Box py={24} position="relative" zIndex={1}>
        <Container maxW="container.lg">
          <Box
            p={{ base: 10, md: 16 }}
            bgGradient="linear(to-br, brand.900, gray.900)"
            borderRadius="3xl"
            border="1px solid"
            borderColor="brand.500"
            boxShadow="0 30px 80px rgba(138, 43, 226, 0.3)"
            textAlign="center"
            position="relative"
            overflow="hidden"
          >
            <VStack spacing={6}>
              <Heading size="2xl" fontFamily="heading">
                Ready to Learn Anything in Minutes?
              </Heading>
              <Text fontSize="lg" color="gray.300" maxW="xl">
                Start generating your customized course right now. No credit card required.
              </Text>
              <Button
                size="lg"
                bgGradient="linear(to-r, brand.400, pink.500)"
                color="white"
                px={10}
                py={8}
                fontSize="xl"
                borderRadius="full"
                rightIcon={<ArrowRight size={22} />}
                onClick={() => handleCtaClick('Start Learning Now')}
                _hover={{
                  transform: 'translateY(-3px)',
                  boxShadow: '0 15px 35px rgba(138,43,226,0.5)'
                }}
                transition="all 0.2s"
              >
                Launch Course Generator
              </Button>
            </VStack>
          </Box>
        </Container>
      </Box>

      {/* Modern Footer */}
      <Box py={12} borderTop="1px solid" borderColor="whiteAlpha.100" bg="#05080f">
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap={6}>
            <Flex alignItems="center" gap={3}>
              <Box p={2} bgGradient="linear(to-br, brand.400, pink.500)" borderRadius="lg">
                <Icon as={BookOpen} w={4} h={4} color="white" />
              </Box>
              <Text fontSize="lg" fontWeight="extrabold" fontFamily="heading" color="white">
                Text2Learn
              </Text>
            </Flex>
            <Text color="gray.500" fontSize="sm">
              © {new Date().getFullYear()} Text2Learn. Built with Google Gemini, React, Node.js & MongoDB.
            </Text>
            <HStack spacing={6} color="gray.400" fontSize="sm">
              <Text as="a" href="#features" _hover={{ color: 'white' }}>Features</Text>
              <Text as="a" href="#how-it-works" _hover={{ color: 'white' }}>Workflow</Text>
              <Text as="a" href="#faq" _hover={{ color: 'white' }}>FAQ</Text>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}

function FeatureCard({ icon, gradient, title, desc }) {
  return (
    <Box
      p={8}
      bg="rgba(15, 23, 42, 0.6)"
      borderRadius="2xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      _hover={{
        transform: 'translateY(-8px)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        borderColor: 'brand.400'
      }}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      position="relative"
      backdropFilter="blur(10px)"
    >
      <Box
        p={3.5}
        display="inline-block"
        bgGradient={gradient}
        borderRadius="xl"
        mb={6}
        color="white"
        boxShadow="0 10px 20px rgba(0, 0, 0, 0.3)"
      >
        <Icon as={icon} w={6} h={6} />
      </Box>
      <Heading size="md" mb={3} fontFamily="heading" color="white">
        {title}
      </Heading>
      <Text color="gray.400" lineHeight="tall" fontSize="sm">
        {desc}
      </Text>
    </Box>
  );
}

function StepCard({ number, title, desc }) {
  return (
    <Box
      p={8}
      bg="rgba(15, 23, 42, 0.4)"
      borderRadius="2xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      position="relative"
    >
      <Text
        fontSize="4xl"
        fontWeight="900"
        bgGradient="linear(to-br, brand.400, pink.500)"
        bgClip="text"
        fontFamily="heading"
        mb={3}
      >
        {number}
      </Text>
      <Heading size="md" mb={2} color="white" fontFamily="heading">
        {title}
      </Heading>
      <Text color="gray.400" fontSize="sm" lineHeight="tall">
        {desc}
      </Text>
    </Box>
  );
}
