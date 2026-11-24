import type { Participant } from '../../types/participant'

interface ParticipantListProps {
  participants: Participant[]
  labelWeight?: 'bold' | 'medium'
  className?: string
}

export default function ParticipantList({
  participants,
  labelWeight = 'bold',
  className = '',
}: ParticipantListProps) {
  const weight = labelWeight === 'bold' ? 'font-bold' : 'font-medium'
  return (
    <section className={className}>
      <h3 className={`text-[13px] leading-4 text-black ${weight}`}>함께할 사람들</h3>
      <div className="mt-5 flex h-10 items-center gap-3">
        <ul className="flex min-w-0 flex-1 gap-3 overflow-x-auto">
          {participants.map((p) => (
            <li
              key={p.id}
              title={p.nickname}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[20px] bg-primary-light text-[12px] font-bold text-primary-ink"
            >
              {p.nickname.slice(0, 2)}
            </li>
          ))}
        </ul>
        <span className="shrink-0 text-[12px] text-muted">{participants.length}명 참여 중</span>
      </div>
    </section>
  )
}
