import React, { useEffect, useState } from 'react';
import {
  Heading,
  Box,
  Text,
  Image,
  VStack,
  HStack,
  Tag,
  Input,
  Select,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState([]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    image: '',
    startTime: '',
    endTime: '',
    categories: '',
  });

  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:3000/events'); // Modified URL
      setEvents(response.data);
      const uniqueCategories = [
        ...new Set(response.data.flatMap((event) => event.categories)),
      ];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory
      ? event.categories.includes(filterCategory)
      : true;
    return matchesSearch && matchesCategory;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddEvent = async () => {
    try {
      const eventToSubmit = {
        ...newEvent,
        categories: newEvent.categories
          .split(',')
          .map((cat) => cat.trim())
          .filter(Boolean),
      };
      await axios.post('http://localhost:3000/events', eventToSubmit); // Modified URL
      toast({
        title: 'Event added.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setNewEvent({
        title: '',
        description: '',
        image: '',
        startTime: '',
        endTime: '',
        categories: '',
      });
      fetchEvents();
    } catch (error) {
      toast({
        title: 'Failed to add event.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Error adding event:', error);
    }
  };

  return (
    <Box p={6}>
      <Heading mb={6}>Events</Heading>

      <HStack spacing={4} mb={6}>
        <Input
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          maxW="300px"
        />
        <Select
          placeholder="Filter by category"
          maxW="200px"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
        <Button colorScheme="blue" onClick={onOpen}>
          Add Event
        </Button>
      </HStack>

      <VStack spacing={6} align="stretch">
        {filteredEvents.map((event) => (
          <Box
            key={event.id}
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            onClick={() => navigate(`/events/${event.id}`)}
            cursor="pointer"
            _hover={{ bg: 'gray.50' }}
          >
            <Image src={event.image} alt={event.title} borderRadius="md" mb={4} />
            <Heading size="md">{event.title}</Heading>
            <Text mt={2}>{event.description}</Text>
            <Text mt={2} fontSize="sm" color="gray.600">
              Start: {new Date(event.startTime).toLocaleString()}
            </Text>
            <Text fontSize="sm" color="gray.600">
              End: {new Date(event.endTime).toLocaleString()}
            </Text>
            <HStack mt={2} spacing={2} wrap="wrap">
              {event.categories.map((category, index) => (
                <Tag key={index} colorScheme="blue">
                  {category}
                </Tag>
              ))}
            </HStack>
          </Box>
        ))}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Event</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  name="title"
                  value={newEvent.title}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Input
                  name="description"
                  value={newEvent.description}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Image URL</FormLabel>
                <Input
                  name="image"
                  value={newEvent.image}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Start Time</FormLabel>
                <Input
                  name="startTime"
                  type="datetime-local"
                  value={newEvent.startTime}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>End Time</FormLabel>
                <Input
                  name="endTime"
                  type="datetime-local"
                  value={newEvent.endTime}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Categories (comma separated)</FormLabel>
                <Input
                  name="categories"
                  placeholder="e.g. music, outdoor"
                  value={newEvent.categories}
                  onChange={handleInputChange}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleAddEvent}>
              Submit
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
