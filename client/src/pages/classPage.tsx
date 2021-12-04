import React, { useState, useEffect } from 'react';
import { Box, Flex, Button } from '@chakra-ui/react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import LeftMenu from '../components/leftmenu/leftmenu';
import menus from '../data/leftmenuData';
import Chat from '../components/chat';
import FloatConnectionStatus from '../components/floatConnectionStatus';
import { Lecture, Member } from '../types';
import { useSocket } from '../context/socket';

// 🐛 나중에 lecture grid로 대체
import LectureCarousel from '../components/lecturecarousel/lecturecarousel';

const ClassPage = () => {
  const { classUuid, memberType } = useParams();
  const { socket, connected } = useSocket();
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [lectureList, setLectureList] = useState<Lecture[]>([]);

  useEffect(() => {
    const payload = JSON.stringify({ classUuid });

    socket?.on('JoinClass', () => {
      socket?.emit('GetClassMembers', payload);
      socket?.emit('GetLectures', payload);
    });
    socket?.emit('JoinClass', payload);

    // get all members and lectures in the classroom
    socket?.on('GetClassMembers', memberArr => {
      setMemberList(memberArr);
    });
    socket?.on('GetLectures', response => {
      const { lectures, status } = response;
      if (status === 200) {
        setLectureList(lectures);
      }
    });
  }, [connected]);

  return (
    <>
      <FloatConnectionStatus />
      <Flex>
        <LeftMenu menus={menus} />
        <Box w="8px" h="100vh" />
        <Box w="100%" h="100vh" bgColor="gray.100">
          <LectureCarousel lectureList={lectureList} />
          <Link to={`/class/${classUuid}/${memberType}/createLecture`}>
            <Button>Create new lecture</Button>
          </Link>
        </Box>
        {/* <Chat classUuid={classUuid!} hasHeader /> */}
      </Flex>
    </>
  );
};

export default ClassPage;
