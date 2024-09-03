/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { ChangeEvent, FC, useContext, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { Icon } from '@iconify/react'
import { Box, Button, Dialog, Flex, Grid, IconButton, Select, Text, TextField, VisuallyHidden } from '@radix-ui/themes'
import { checkPermission, isEmpty } from '@lib/helpers/checker'
import { InputOutput, statusPermissions } from '@lib/types/permissions'
import IconPermission from '@lib/components/icon-permission'
import { useRouter } from 'next/navigation'
import { usePeerStore, useSetupStore, useUserStore } from '@lib/stores/join-room'
import { StreamContext } from '@lib/context/stream'
import Peer from 'peerjs'
import { useNewPeer } from '@lib/context/peer2'

const SetupV3: FC<{ params: string }> = ({ params }) => {
  const { ref1, ref2 } = useContext(StreamContext)
  const { theme } = useTheme()
  const { roomName, name, setRoomName, setName } = useUserStore()
  const [isConnectedToRoom, setIsConnectedToRoom] = useState(false)
  const [isRoomOccupied, setIsRoomOccupied] = useState(false) // New state to track room occupancy
  const router = useRouter()

  const {
    statusPermissionCamera,
    statusPermissionMicrophone,
    isCameraActive,
    isMicrophoneActive,
    openDialogPermissionCameraDenied,
    openDialogPermissionMicrophoneDenied,
    selectCameraType,
    selectSpeakerType,
    selectMicrophoneType,
    listCameraType,
    listMicrophoneType,
    listSpeakerType,
    setFinishSetup,
    setOpenDialogPermissionCameraDenied,
    setOpenDialogPermissionMicrophoneDenied,
    setErrorMsg,
    setCameraActive,
    setMicrophoneActive,
    setSpeakerType,
    setMicrophoneType,
    setCameraType,
    setListMicrophoneType,
    setListCameraType,
    setListSpeakerType,
    setStatusPermissionCamera,
    setStatusPermissionMicrophone,
  } = useSetupStore()

  let localVideoStream: any = null
  let localAudioStream: any = null
  let myStreams: any = null

  useEffect(() => {
    const peer = new Peer() // create a temporary peer to check room status

    peer.on('open', (id) => {
      const conn = peer.connect(params)

      conn.on('open', () => {
        setIsRoomOccupied(true)
        peer.destroy()
      })

      conn.on('error', () => {
        setIsRoomOccupied(false)
        peer.destroy()
      })
    })
  }, [params])

  function handleErrorStream(error: { name: string }) {
    if (error.name === 'OverconstrainedError') {
      setErrorMsg(
        `OverconstrainedError: The constraints could not be satisfied by the available devices. Constraints: {video: true}`,
      )
    } else if (error.name === 'NotAllowedError') {
      setErrorMsg(
        'NotAllowedError: Permissions have not been granted to use your camera and ' +
        'microphone, you need to allow the page access to your devices in ' +
        'order for the demo to work.',
      )
    }
  }

  function setOnOffCamera(stream: any, status: 'on' | 'off') {
    if (status === 'on') {
      ref1.current.srcObject = stream
      setCameraActive(true)
    } else {
      const stream = ref1.current.srcObject
      const tracks = stream.getTracks()
      tracks.forEach((track: any) => {
        track.stop()
      })
      ref1.current.srcObject = null
      setCameraActive(false)
    }
  }

  async function startCamera() {
    if (statusPermissionCamera === 'denied') {
      setOpenDialogPermissionCameraDenied(true)
    } else {
      try {
        if (!isCameraActive) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: selectCameraType?.deviceId } },
          })
          localVideoStream = stream
          setOnOffCamera(localVideoStream, 'on')
        } else {
          setOnOffCamera(localVideoStream, 'off')
        }
      } catch (error: any) {
        handleErrorStream(error)
      }
    }
  }

  function setOnOffMicrophone(stream: any, status: 'on' | 'off') {
    if (status === 'on') {
      ref2.current.srcObject = stream
      setMicrophoneActive(true)
    } else {
      const stream = ref2.current.srcObject
      const tracks = stream.getTracks()
      tracks.forEach((track: any) => {
        track.stop()
      })
      ref2.current.srcObject = null
      setMicrophoneActive(false)
    }
  }

  async function startMicrophone() {
    if (statusPermissionMicrophone === 'denied') {
      setOpenDialogPermissionMicrophoneDenied(true)
    } else {
      try {
        if (!isMicrophoneActive) {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: { deviceId: { exact: selectMicrophoneType?.deviceId } },
          })
          localAudioStream = stream
          setOnOffMicrophone(localAudioStream, 'on')
        } else {
          setOnOffMicrophone(localAudioStream, 'off')
        }
      } catch (error: any) {
        handleErrorStream(error)
      }
    }
  }

  function startMicAndCam() {
    startCamera()
    startMicrophone()
  }

  async function setAllMediaStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectCameraType?.deviceId } },
        audio: { deviceId: { exact: selectMicrophoneType?.deviceId } },
      })
      myStreams = stream
      ref1.current.srcObject = stream
      setCameraActive(true)
      setMicrophoneActive(true)
    } catch (error: any) {
      handleErrorStream(error)
    }
  }

  // change camera
  async function onChangeCamera(deviceId: string) {
    // console.log(deviceId);
    const getTypeCam = listCameraType.filter((data: InputOutput) => data.deviceId === deviceId)[0]
    setCameraType(getTypeCam)
    // cek state isMicrophoneActive
    if (isCameraActive) {
      const stream = ref1.current.srcObject
      // console.log("stream off = ", stream);
      const tracks = stream.getTracks()
      tracks.forEach((track: any) => {
        track.stop()
      })
      ref1.current.srcObject = null

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectMicrophoneType?.deviceId } },
      })
      localVideoStream = newStream
      setOnOffCamera(localVideoStream, 'on')

      // console.log(stream);
    }
  }

  // get list mic,speaker,camera
  async function getListAllMediaStream() {
    try {
      const listMedia = await navigator.mediaDevices.enumerateDevices()
      // console.log("list media stream = ", listMedia);
      listMedia.forEach((device: any) => {
        if (device.kind === 'audioinput' && !isEmpty(device.deviceId)) {
          if (device.deviceId === 'default') {
            setMicrophoneType({ deviceId: device.deviceId, label: device.label })
          }
          setListMicrophoneType({ deviceId: device.deviceId, label: device.label })
        } else if (device.kind === 'audiooutput' && !isEmpty(device.deviceId)) {
          if (device.deviceId === 'default') {
            setSpeakerType({ deviceId: device.deviceId, label: device.label })
          }
          setListSpeakerType({ deviceId: device.deviceId, label: device.label })
        } else if (device.kind === 'videoinput' && !isEmpty(device.deviceId)) {
          setCameraType({ deviceId: device.deviceId, label: device.label })
          setListCameraType({ deviceId: device.deviceId, label: device.label })
        }
        7
      })
    } catch (error) {
      console.log('error list media = ', error)
    }
  }

  // check permission camera & audio
  const checkPermissions = async () => {
    try {
      const cameraPermission = await checkPermission('camera')
      // console.log('Camera permission:', cameraPermission)
      setStatusPermissionCamera(cameraPermission as statusPermissions)

      const microphonePermission = await checkPermission('microphone')
      // console.log('Microphone permission:', microphonePermission)
      setStatusPermissionMicrophone(microphonePermission as statusPermissions)
    } catch (error) {
      console.error('Error checking permissions:', error)
    }
  }

  // change microphone
  async function onChangeMicrophone(deviceId: string) {
    // console.log(deviceId);
    const getTypeMic = listMicrophoneType.filter(
      (data: InputOutput) => data.deviceId === deviceId,
    )[0]
    setMicrophoneType(getTypeMic)
    setAllMediaStream()
  }

  // change speaker
  function onChangeSpeaker(deviceId: string) {
    // console.log(deviceId);
    const getTypeSpeaker = listSpeakerType.filter(
      (data: InputOutput) => data.deviceId === deviceId,
    )[0]
    console.log(getTypeSpeaker)

    setSpeakerType(getTypeSpeaker)
    const audioDestination = selectSpeakerType?.deviceId ?? ''
    attachSinkId(ref1, audioDestination)
  }

  // Attach audio output device to video element using device/sink ID.
  function attachSinkId(localVideoElement: any, lastDeviceIdSpeaker: string) {
    if ('sinkId' in HTMLMediaElement.prototype) {
      localVideoElement.current
        .setSinkId(lastDeviceIdSpeaker)
        .then(() => {
          console.log('Success, audio output device attached: ', lastDeviceIdSpeaker)
        })
        .catch((error: any) => {
          console.log('Error attaching audio output device: ', error)
        })
    } else {
      console.log('Browser does not support output device selection.')
    }
  }

  const { peerRoom, setPeerRoom, peerUser, setPeerUser, connectedPeers, setConnectedPeers } =
    useNewPeer()

  function startMeeting() {
    setRoomName(params)
    setFinishSetup(true)
    router.push(`/m/${params}`)
  }

  function joinMeeting() {
    setRoomName(params)
    setFinishSetup(true)
    router.push(`/m/${params}`)
  }

  function finishSetup() {
    if (isRoomOccupied) {
      joinMeeting()
    } else {
      startMeeting()
    }
  }

  useEffect(() => {
    checkPermissions()
    setRoomName(params)
  }, [])

  useEffect(() => {
    const peer = new Peer(params)
    setPeerRoom(peer)
    console.log('peer room mounted setup: ', peer)

    peer.on('connection', (conn: any) => {
      setTimeout(() => {
        conn.send(`hello, you are connected to the room ${params}`)
      }, 1000)
    })

    return () => peer.destroy()
  }, [])

  useEffect(() => {
    if (peerRoom) {
      peerRoom.on('open', (id: any) => {
        console.log('Peer ID Room is: ' + id)
      })

      const peerUser = new Peer()
      setPeerUser(peerUser)

      peerUser.on('open', (id: any) => {
        console.log('Your Peer ID is: ' + id)
        setAllMediaStream()
        getListAllMediaStream()
      })
    }
  }, [peerRoom])

  useEffect(() => {
    if (peerUser) {
      console.log('peerUser = ', peerUser)

      setTimeout(() => {
        const conn = peerUser.connect(peerRoom)
        conn.on('open', () => {
          console.log('Connected to room: ' + peerRoom)
        })

        conn.on('data', (data: any) => {
          console.log('Received', data)
        })
      }, 1000)
    }
  }, [peerUser])

  return (
    <Box
      height={{ initial: '100%', sm: '100vh' }}
      width={{ initial: '100%' }}
      my={{ initial: '8', sm: '4' }}
    >
      <Flex justify="center" direction="column" gap="4" px="4" align="center" height="100%">
        <Flex
          gap={{ initial: '6', sm: '6' }}
          width={{ initial: '100%', sm: '80%', md: '80%' }}
          direction={{ initial: 'column', md: 'row' }}
          className=""
        >
          <Flex
            gap={{ initial: '4', sm: '3' }}
            width={{ initial: '100%', md: '700px' }}
            direction={{ initial: 'column' }}
            className=""
          >
            <Box
              width={{ initial: '100%' }}
              height={{ initial: '400px' }}
              className="relative rounded-lg bg-gray-800 text-white flex justify-center items-center"
            >
              <audio ref={ref2} hidden controls autoPlay playsInline></audio>
              <video
                ref={ref1}
                autoPlay
                playsInline
                className="h-[calc(100%+2px)] w-[calc(100%+2px)] object-cover aspect-video scale-x-[-1] rounded-lg"
              ></video>
            </Box>
            {/* list mic,speaker,cam */}
            <Box>
              <Grid columns={{ initial: '1', sm: '3', md: '3' }} gap="3">
                {/* Microphone Select */}
                <Select.Root
                  defaultValue="default"
                  value={selectMicrophoneType?.deviceId}
                  disabled={statusPermissionMicrophone !== 'allowed'}
                  onValueChange={onChangeMicrophone}
                >
                  <Select.Trigger
                    variant="classic"
                    radius="full"
                    className={
                      statusPermissionMicrophone !== 'allowed' ? 'opacity-20' : 'opacity-100'
                    }
                  >
                    <div className="grid grid-cols-[auto_calc(100%-20px)] gap-2">
                      <Icon icon="mage:microphone" width={18} height={18} />
                      <div className="w-auto truncate">
                        {statusPermissionMicrophone !== 'allowed'
                          ? 'Permission is required'
                          : selectMicrophoneType?.label}
                      </div>
                    </div>
                  </Select.Trigger>
                  <Select.Content position="popper">
                    {listMicrophoneType.length > 0 &&
                      listMicrophoneType.map((item: any, idx: number) => (
                        <Select.Item key={`${item.deviceId}-${idx}`} value={item.deviceId}>
                          {item.label}
                        </Select.Item>
                      ))}
                  </Select.Content>
                </Select.Root>
                {/* Speaker Select */}
                <Select.Root
                  defaultValue="default"
                  value={selectSpeakerType?.deviceId}
                  disabled={statusPermissionMicrophone !== 'allowed'}
                  onValueChange={onChangeSpeaker}
                >
                  <Select.Trigger
                    variant="classic"
                    radius="full"
                    className={
                      statusPermissionMicrophone !== 'allowed' ? 'opacity-20' : 'opacity-100'
                    }
                  >
                    <div className="grid grid-cols-[auto_calc(100%-20px)] gap-2">
                      <Icon icon="mage:volume-up" width={18} height={18} />
                      <div className="w-auto truncate">
                        {statusPermissionMicrophone !== 'allowed'
                          ? 'Permission is required'
                          : selectSpeakerType?.label}
                      </div>
                    </div>
                  </Select.Trigger>
                  <Select.Content position="popper">
                    {listSpeakerType.length > 0 &&
                      listSpeakerType.map((item: any, idx: number) => (
                        <Select.Item key={`${item.deviceId}-${idx}`} value={item.deviceId}>
                          {item.label}
                        </Select.Item>
                      ))}
                  </Select.Content>
                </Select.Root>
                {/* Camera Select */}
                <Select.Root
                  defaultValue="default"
                  value={selectCameraType?.deviceId}
                  disabled={statusPermissionCamera !== 'allowed'}
                  onValueChange={onChangeCamera}
                >
                  <Select.Trigger
                    variant="classic"
                    radius="full"
                    className={statusPermissionCamera !== 'allowed' ? 'opacity-20' : 'opacity-100'}
                  >
                    <div className="grid grid-cols-[auto_calc(100%-20px)] gap-2">
                      <Icon icon="mage:video" width={18} height={18} />
                      <div className="w-auto truncate">
                        {statusPermissionCamera !== 'allowed'
                          ? 'Permission is required'
                          : selectCameraType?.label}
                      </div>
                    </div>
                  </Select.Trigger>
                  <Select.Content position="popper">
                    {listCameraType.length > 0 &&
                      listCameraType.map((item: any, idx: number) => (
                        <Select.Item key={`${item.deviceId}-${idx}`} value={item.deviceId}>
                          {item.label}
                        </Select.Item>
                      ))}
                  </Select.Content>
                </Select.Root>
              </Grid>
            </Box>

            <Flex direction={{ initial: 'column', sm: 'row' }} gap="4">
              <Box width={{ initial: '100%', sm: '50%' }} className="opacity-60">
                <TextField.Root
                  placeholder="Enter room name"
                  size="3"
                  disabled
                  value={roomName || ''}
                >
                  <TextField.Slot>
                    <Icon icon="majesticons:door-enter" width={20} height={20} />
                  </TextField.Slot>
                </TextField.Root>
              </Box>

              <Box width={{ initial: '100%', sm: '50%' }}>
                <TextField.Root
                  placeholder="Enter your name"
                  size="3"
                  value={name || ''}
                  onChange={(e) => setName(e.target.value)}
                >
                  <TextField.Slot>
                    <Icon icon="flowbite:profile-card-solid" width={20} height={20} />
                  </TextField.Slot>
                </TextField.Root>
              </Box>
            </Flex>
          </Flex>

          <Box
            width={{ initial: '100%', md: '30%' }}
            className="flex flex-col justify-center items-center gap-4"
          >
            <Text size="6" align="center" wrap="balance">
              Ready to join?
            </Text>
            <Flex gap="4">
              <Button
                variant="classic"
                size="3"
                color="amber"
                radius="full"
                className="cursor-pointer disabled:cursor-not-allowed w-auto"
                disabled={isEmpty(name) || isEmpty(roomName)}
                onClick={finishSetup}
              >
                <Icon icon={isRoomOccupied ? "tabler:users" : "mage:video-plus"} width={20} height={20} />
                <Text as="div" size="3" className="text-center text-balance">
                  {isRoomOccupied ? "Join Meeting" : "Start Meeting"}
                </Text>
              </Button>
            </Flex>
          </Box>
        </Flex>
      </Flex>

      {/* dialog */}
      <Flex>
        <Dialog.Root
          open={openDialogPermissionCameraDenied || openDialogPermissionMicrophoneDenied}
        >
          <Dialog.Content size="4" aria-describedby="dialog-permission-denied">
            <VisuallyHidden>
              <Dialog.Title></Dialog.Title>
            </VisuallyHidden>
            <Flex gap="3" justify="end" className="absolute right-4 top-4">
              <Dialog.Close>
                <IconButton
                  variant="classic"
                  radius="full"
                  onClick={() => {
                    setOpenDialogPermissionCameraDenied(false)
                    setOpenDialogPermissionMicrophoneDenied(false)
                  }}
                >
                  <Icon icon="mage:multiply" width={24} height={24} />
                </IconButton>
              </Dialog.Close>
            </Flex>
            <Flex align="center" gap="4">
              <Image
                src="/assets/images/meet-block.svg"
                alt="image-block"
                width={200}
                height={200}
                className="rounded-lg"
              />

              <Flex direction="column" gap="4">
                <Text as="div" size="6">
                  {openDialogPermissionCameraDenied && !openDialogPermissionMicrophoneDenied
                    ? 'Meet is blocked from using your camera'
                    : !openDialogPermissionCameraDenied && openDialogPermissionMicrophoneDenied
                      ? 'Meet is blocked from using your microphone'
                      : 'Meet is blocked from using your camera and microphone.'}
                </Text>
                <ol className="list-decimal mx-4 text-balance">
                  <li className="mb-2">
                    Click the button
                    <span className=" px-2">
                      <IconPermission color={theme === 'dark' ? '#fff' : '#000'} />
                    </span>
                    page info icon in your browser address bar
                  </li>
                  <li>
                    {openDialogPermissionCameraDenied && !openDialogPermissionMicrophoneDenied
                      ? 'Turn on your camera'
                      : !openDialogPermissionCameraDenied && openDialogPermissionMicrophoneDenied
                        ? 'Turn on your microphone'
                        : 'Turn on your camera and microphone'}
                  </li>
                </ol>
              </Flex>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      </Flex>
    </Box>
  )
}
export default SetupV3
