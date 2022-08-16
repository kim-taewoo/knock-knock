import Link from 'next/link'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

import GatheringCard from 'src/components/GatheringCard'
import SEO from 'src/components/pageLayouts/SEO'
import { trpc } from 'src/utils/trpc'
import { useUser } from 'src/shared/hooks'
import MyGroupCard from 'src/components/MyGroupCard'
import BottomSheet from 'src/components/BottomSheet'
import GuideModal from 'src/components/GuideModal'
// import SkeletonCard from 'src/components/SkeletonCard'
import { IUser } from 'src/types/User'
import { IEvent } from 'src/types/Event'

export default function Home() {
  const { user, isAuthenticated } = useUser()
  const { data: userData } = trpc.useQuery(['users.me'])

  const [visibleCreateModal, setVisibleCreateModal] = useState(false)
  const [visibleMoreButtonModal, setVisibleMoreButtonModal] = useState<IEvent | null>(null)

  const deleteMeetMutation = trpc.useMutation('events.delete-event', {
    onSuccess() {
      toast('약속을 삭제했습니다.', { autoClose: 2000 })
    },
    onError() {
      toast('다시 시도해주세요.', { autoClose: 2000 })
    },
  })

  const leaveMeetMutation = trpc.useMutation('events.my-cells', {
    onSuccess() {
      toast('약속을 떠났습니다.', { autoClose: 2000 })
    },
    onError() {
      toast('다시 시도해주세요.', { autoClose: 2000 })
    },
  })

  const onDeleteMeet = (meetId: string) => {
    deleteMeetMutation.mutate({ eventId: meetId })
    setVisibleMoreButtonModal(null)
  }

  const onLeaveMeet = (meetId: string) => {
    if (!user?.id) return
    leaveMeetMutation.mutate({ eventId: meetId, profileId: user.id, cells: '' })
    setVisibleMoreButtonModal(null)
  }

  const [showGuideModal, setShowGuideModal] = useState(false)

  const closeGuideModal = () => {
    setShowGuideModal(false)
    localStorage.setItem('hadSeenGuideModal', 'true')
  }

  useEffect(() => {
    const hadSeenGuideModal = Boolean(localStorage.getItem('hadSeenGuideModal')) || false
    setShowGuideModal(!hadSeenGuideModal)
  }, [])

  return (
    <SEO>
      <div className="w-full h-full flex flex-col relative bg-bgColor">
        <div className="w-[100%] sm:max-w-sm fixed flex justify-between items-center px-5 pt-5 z-10">
          <object data="assets/svg/logo_white.svg" />
          <div className="flex items-center">
            {isAuthenticated ? (
              <Link href="/profile">
                <div className="cursor-pointer w-[24px] h-[24px] rounded-[24px] overflow-hidden object-cover mr-3">
                  <img className="" src={`${user?.image}` ?? 'assets/images/avatar.png'} />
                </div>
              </Link>
            ) : (
              <Link href="/auth/login">
                <div className="cursor-pointer px-4 py-[2px] bg-gradient-to-r from-from to-to rounded-[54px] mr-3">
                  <span className="text-sm text-white">로그인</span>
                </div>
              </Link>
            )}
            <Link href="/search">
              <span className="cursor-pointer">
                <img src="assets/svg/search.svg" alt="icon" />
              </span>
            </Link>
          </div>
        </div>

        <div className="w-full h-[205px] flex justify-center items-center bg-textGray2">배너 이미지</div>

        <div className="mt-8">
          <h2 className="text-lg font-bold pl-5">내 약속</h2>
          <div className="mt-2 pb-2 flex flex-row overflow-x-scroll px-5">
            {userData?.events ? (
              userData?.events.map((event, index) => {
                return (
                  <GatheringCard key={index} data={event} onMoreButtonClick={() => setVisibleMoreButtonModal(event)} />
                )
              })
            ) : (
              <Link href="/meets/create">
                <div className="card bg-cardBg rounded-xl min-w-[190px] min-h-[150px] flex justify-center mt-2 px-4 cursor-pointer">
                  <span className="text-textGray font-bold">
                    새로운 약속을
                    <br />
                    만들어보세요
                  </span>
                  <span className="mt-3 font-extrabold text-to">{'→'}</span>
                </div>
              </Link>
            )}
          </div>
        </div>

        <div className="mt-8 px-5">
          <div className="flex justify-between">
            <h2 className="text-lg font-bold">내 그룹</h2>
            <Link href="/group/list">
              <span className="text-sm text-textGray">전체 보기</span>
            </Link>
          </div>
          <div className="mt-2 pb-2 flex flex-col">
            {userData?.groups && userData.groups.length > 0 ? (
              userData.groups.map((group, index) => {
                return <MyGroupCard key={index} data={group as any} />
              })
            ) : (
              <div className="w-full bg-cardBg p-3 rounded-lg mt-2">
                <span className="text-textGray font-bold">
                  {isAuthenticated ? '새로운 그룹을 만들어보세요' : '로그인 후 이용가능 합니다'}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="w-full md:max-w-sm fixed bottom-10 auto flex justify-end">
          <button className="btn btn-circle bg-primary text-white mr-5" onClick={() => setVisibleCreateModal(true)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {visibleCreateModal && (
          <BottomSheet onClose={() => setVisibleCreateModal(false)} isBackground={false}>
            <Link href="/meets/create">
              <a className="btn w-full max-w-xs bg-primary">
                <span className="text-white">약속 만들기</span>
              </a>
            </Link>
            <Link href="/group/create">
              <a className="btn w-full max-w-xs bg-white mt-2">
                <span className="text-bgColor">그룹 만들기</span>
              </a>
            </Link>
          </BottomSheet>
        )}

        {visibleMoreButtonModal && (
          <BottomSheet onClose={() => setVisibleMoreButtonModal(null)} isBackground={false}>
            {(user as IUser)?.events.some(value => value.profileId === visibleMoreButtonModal.profileId) && (
              <>
                <Link href={`/meets/edit/${visibleMoreButtonModal}`}>
                  <a className="btn w-full max-w-xs bg-primary">
                    <span className="text-white">약속 수정하기</span>
                  </a>
                </Link>
                <button
                  onClick={() => onDeleteMeet(visibleMoreButtonModal.id)}
                  className="btn w-full max-w-xs bg-white mt-2"
                >
                  <span className="text-bgColor">약속 삭제하기</span>
                </button>
              </>
            )}
            <button
              onClick={() => onLeaveMeet(visibleMoreButtonModal.id)}
              className="btn w-full max-w-xs bg-buttonGray mt-2"
            >
              <span className="text-white">떠나기</span>
            </button>
          </BottomSheet>
        )}
        {showGuideModal && <GuideModal onClose={closeGuideModal} />}
      </div>
    </SEO>
  )
}
