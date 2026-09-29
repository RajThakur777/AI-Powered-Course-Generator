import React from 'react';
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

export default App;