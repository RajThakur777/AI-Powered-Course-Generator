import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from '../pages/Dashboard';
import Course from '../pages/Course';
import Lesson from '../pages/Lesson';
import Library from '../pages/Library';
import Explore from '../pages/Explore';

export default function DashboardLayout() {
  return (
    <Flex h="100vh" bg="gray.900" color="white" overflow="hidden">
      <Sidebar />
      <Box flex="1" overflowY="auto" p={8}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/library" element={<Library />} />
          <Route path="/courses/:courseId" element={<Course />} />
          <Route path="/courses/:courseId/module/:moduleIndex/lesson/:lessonIndex" element={<Lesson />} />
        </Routes>
      </Box>
    </Flex>
  );
}
