import React from 'react';
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box maxW="xl" mx="auto" my={16} p={8} bg="gray.800" borderRadius="2xl" border="1px solid" borderColor="red.500" boxShadow="2xl" textAlign="center">
          <VStack spacing={6}>
            <Box p={4} bg="red.900" borderRadius="full">
              <AlertTriangle size={36} color="#fc8181" />
            </Box>
            <Heading size="lg" color="white">Something went wrong</Heading>
            <Text color="gray.300" fontSize="md">
              We encountered an unexpected display issue. Your progress and data are safe.
            </Text>
            <Button
              leftIcon={<RefreshCw size={18} />}
              colorScheme="purple"
              onClick={this.handleReload}
            >
              Reload Page
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
