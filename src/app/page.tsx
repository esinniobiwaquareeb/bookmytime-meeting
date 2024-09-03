'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Peer from 'peerjs'
import { Box, Button, Flex, Heading, Text, TextField } from '@radix-ui/themes'
import { Icon } from '@iconify/react'
import { useTheme } from 'next-themes'
import { generateUUID } from '@lib/helpers/generate-id'

export default function Home() {
  const { theme } = useTheme()
  const [code, setCode] = useState<string>('')
  const router = useRouter()
  const [isRoomOccupied, setIsRoomOccupied] = useState(false)

  useEffect(() => {
    const peer = new Peer() // create a temporary peer to check room status

    peer.on('open', (id) => {
      const roomID = generateUUID()
      const conn = peer.connect(roomID)

      conn.on('open', () => {
        setIsRoomOccupied(true)
        peer.destroy()
      })

      conn.on('error', () => {
        setIsRoomOccupied(false)
        peer.destroy()
      })
    })
  }, [])

  function gotoRoom() {
    const hashId = generateUUID()
    router.push('/m/' + hashId)
  }

  function joinRoom() {
    router.push('/m/' + code)
  }

  return (
    <>
      <Box className="h-screen w-full">
        <Flex justify="center" direction="column" gap="4" align="center" height="100%">
          <Icon
            icon="fluent:video-chat-16-filled"
            width={100}
            height={100}
            color={theme === 'dark' ? 'blue' : 'light-blue'}
          />
          <Heading size="8" className="text-center text-balance">
            Meeting Scheduling for everyone
          </Heading>
          <Text as="div" size="4" className="text-center text-balance">
            Connect, Collaborate, and Schedule meetings from anywhere with BookMyTime
          </Text>
          <Flex
            justify="center"
            gap="4"
            align="center"
            className="flex-col w-full md:flex-row"
            px="4"
          >
            <Button
              variant="classic"
              size="3"
              className="cursor-pointer w-full sm:w-1/2 md:w-auto"
              onClick={isRoomOccupied ? joinRoom : gotoRoom}
            >
              <Icon icon={isRoomOccupied ? "tabler:users" : "mage:video-plus"} width={20} height={20} />
              <Text as="div" size="3" className="text-center text-balance">
                {isRoomOccupied ? "Join Meeting" : "Start Meeting"}
              </Text>
            </Button>
            <Flex
              justify="center"
              gap="4"
              align="center"
              className="flex-col w-full md:flex-row md:w-auto"
            >
              <TextField.Root
                placeholder="Enter Consultation Code"
                size="3"
                className="w-full sm:w-1/2 md:w-[240px]"
                value={code || ''}
                onChange={(e) => setCode(e.target.value)}
              >
                <TextField.Slot>
                  <Icon icon="gravity-ui:keyboard" width={20} height={20} />
                </TextField.Slot>
              </TextField.Root>
              <Button
                variant="classic"
                disabled={code?.length === 0 ? true : false}
                size="3"
                className="w-full cursor-pointer disabled:cursor-not-allowed sm:w-1/2 md:w-auto"
                onClick={joinRoom}
              >
                Join
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </>
  )
}
