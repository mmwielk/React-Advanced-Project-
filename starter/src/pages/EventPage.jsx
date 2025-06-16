import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Image,
  HStack,
  Tag,
  VStack,
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
  Input,
  useDisclosure,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export const EventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [editData, setEditData] = useState({
    title: '',
    description: '',
    image: '',
    startTime: '',
    endTime: '',
    categories: '',
  });

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = React.useRef();

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`/api/events/${id}`);
      setEvent(response.data);
      setEditData({
        title: response.data.title,
        description: response.data.description,
        image: response.data.image,
        startTime: response.data.startTime.slice(0, 16),
        endTime: response.data.endTime.slice(0, 16),
        categories: response.data.categories.join(', '),
      });
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const updatedEvent = {
        ...editData,
        categories: editData.categories
          .split(',')
          .map((cat) => cat.trim())
          .filter(Boolean),
      };
      await axios.put(`/api/events/${id}`, updatedEvent);
      toast({
        title: 'Event updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      fetchEvent();
    } catch (error) {
      toast({
        title: 'Failed to update event.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Error updating event:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/events/${id}`);
      toast({
        title: 'Event deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onDeleteClose();
      navigate('/events');
    } catch (error) {
      toast({
        title: 'Failed to delete event.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Error deleting event:', error);
    }
  };

  if (!event) return <Text>Loading...</Text>;

  return (
    <Box p={6}>
      <Heading mb={4}>{event.title}</Heading>
      <Image
        src={event.image}
        alt={event.title}
        borderRadius="md"
        mb={4}
        maxH="400px"
        objectFit="cover"
      />
      <Text mb={2}>{event.description}</Text>
      <Text fontSize="sm" color="gray.600" mb={1}>
        Start: {new Date(event.startTime).toLocaleString()}
      </Text>
      <Text fontSize="sm" color="gray.600" mb={2}>
        End: {new Date(event.endTime).toLocaleString()}
      </Text>
      <HStack spacing={2} mb={4} wrap="wrap">
        {event.categories.map((category, idx) => (
          <Tag key={idx} colorScheme="blue">
            {category}
          </Tag>
        ))}
      </HStack>

      <HStack spacing={4} mb={6} align="center">
        <Image
          src={event.createdBy.image}
          alt={event.createdBy.name}
          borderRadius="full"
          boxSize="50px"
          objectFit="cover"
        />
        <Text>Created by: {event.createdBy.name}</Text>
      </HStack>

      <HStack spacing={4}>
        <Button colorScheme="blue" onClick={onOpen}>
          Edit
        </Button>
        <Button colorScheme="red" onClick={onDeleteOpen}>
          Delete
        </Button>
      </HStack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Event</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input name="title" value={editData.title} onChange={handleInputChange} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Input name="description" value={editData.description} onChange={handleInputChange} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Image URL</FormLabel>
                <Input name="image" value={editData.image} onChange={handleInputChange} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Start Time</FormLabel>
                <Input
                  type="datetime-local"
                  name="startTime"
                  value={editData.startTime}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>End Time</FormLabel>
                <Input
                  type="datetime-local"
                  name="endTime"
                  value={editData.endTime}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Categories (comma separated)</FormLabel>
                <Input name="categories" value={editData.categories} onChange={handleInputChange} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSave}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Event
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

