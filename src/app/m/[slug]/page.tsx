'use client'

import { useSetupStore } from '@lib/stores/join-room'
import MainRoom from '@lib/components/main-room'
import Setup from '@lib/components/setup-v2'
import { StreamContextProvider } from '@lib/context/stream'
import SetupV3 from '@/app/_lib/components/setup-v3'
import { NewPeerProvider } from '@lib/context/peer2';
import MainRoomV2 from '@/app/_lib/components/main-room-v2'

export default function App({ params }: { params: { slug: string } }) {
  return !useSetupStore().finishSetup ? (
    <StreamContextProvider>
      <NewPeerProvider>
        <SetupV3 params={params.slug} />
        {/* <Setup /> */}
      </NewPeerProvider>
    </StreamContextProvider>
  ) : (
    <StreamContextProvider>
      <NewPeerProvider>
        <MainRoom params={params.slug} />
      </NewPeerProvider>
    </StreamContextProvider>
  )
}
