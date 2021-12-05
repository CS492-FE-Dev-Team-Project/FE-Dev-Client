import React, { useState, useEffect } from 'react';
import { Box, Flex, Button, useClipboard, useToast } from '@chakra-ui/react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import LeftMenu from '../components/leftmenu/leftmenu';
import defaultMenu from '../data/leftmenuData';
import Chat from '../components/chat';
import FloatConnectionStatus from '../components/floatConnectionStatus';
import { Lecture, Member, TabSegment, TabType, UserTabEntry } from '../types';
import { useSocket } from '../context/socket';
import { ClipboardButton } from '../components/common/Button';
// 🐛 나중에 lecture grid로 대체
import ClassCard from '../components/lobbyPage/classCard';

const ClassPage = () => {
  const { classUuid, memberType } = useParams();
  const { socket, connected } = useSocket();
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [lectureList, setLectureList] = useState<Lecture[]>([]);

  const { hasCopied, onCopy } = useClipboard(classUuid!);
  const toast = useToast();

  const [menu, setMenu] = useState<TabSegment[]>(defaultMenu);

  useEffect(() => {
    const payload = JSON.stringify({ classUuid });

    socket?.on('JoinClass', () => {
      socket?.emit('GetClassMembers', payload);
      socket?.emit('GetLectures', payload);
    });
    socket?.emit('JoinClass', payload);

    // get all members and lectures in the classroom
    socket?.on('GetClassMembers', response => {
      const { members, status } = response;
      if (status === 200) {
        // setMemberList(members);

        // Formulate tabEntries for
        const memberTabSegment: TabSegment = {
          tabTitle: 'Classmates',
          tabContents: members.map(
            (mem: Member): UserTabEntry => ({
              tabName: mem.userName,
              type: TabType.USER,
              userId: mem.id
            })
          )
        };
        setMenu([...defaultMenu, memberTabSegment]);
        // menus = [...menus, memberTabSegment];
      }
    });
    socket?.on('GetLectures', response => {
      const { lectures, status } = response;
      if (status === 200) {
        setLectureList(lectures);
      }
    });
  }, [connected]);

  const clickClipboard = () => {
    onCopy();
    toast({
      title: 'ClassId copied to your clipboard!',
      status: 'success',
      duration: 1500,
      isClosable: true
    });
  };

  const content =
    connected &&
    lectureList.length > 0 &&
    lectureList.map(
      ({ id: lectureId, lectureDate, lectureName, LiveStatus }) => (
        <Link
          to={`/class/${classUuid}/${memberType}/${lectureId}`}
          key={lectureId}
        >
          <ClassCard
            title={`${lectureName}#${lectureId}`}
            subTitle={`${LiveStatus ? 'LIVE' : 'NotLive'}-${lectureDate}`}
            color="white"
            backgroundColor="black"
          />
        </Link>
      )
    );

  return (
    <>
      <FloatConnectionStatus />
      <Flex>
        <LeftMenu menus={menu} />
        <Box w="8px" h="100vh" />
        <Box w="100%" h="100vh">
          {/* 상현님이 구현해주실 classPage lecture grid 이곳에 - Issue #99 */}
          {content}
          <Link to={`/class/${classUuid}/${memberType}/createLecture`}>
            <Button>Create new lecture</Button>
          </Link>
          <ClipboardButton onClick={clickClipboard}>
            Copy Class Id
          </ClipboardButton>
        </Box>
        {/* <Chat classUuid={classUuid!} hasHeader /> */}
      </Flex>
    </>
  );
};

export default ClassPage;
