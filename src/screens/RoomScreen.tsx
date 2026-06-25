import {
  Button,
  Spacing,
  TopNavigation,
  TopNavigationBackButton,
} from '@toss/tds-mobile';
import { useEffect, useState } from 'react';
import {
  closeRoom,
  getResults,
  getRoom,
  getVoterId,
  isClosed,
  vote,
} from '../lib/roomStore';
import type { Room, Screen } from '../types';

interface Props {
  code: string;
  onNavigate: (screen: Screen) => void;
}

export function RoomScreen({ code, onNavigate }: Props) {
  const [room, setRoom] = useState<Room | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const voterId = getVoterId();

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setInterval>;

    async function doRefresh() {
      if (stopped) return;
      try {
        const r = await getRoom(code);
        if (stopped) return;
        setRoom(r);
        if (r && (r.closed || (r.deadline && Date.now() >= r.deadline))) {
          stopped = true;
          clearInterval(timer);
        }
      } catch {
        // 오류 시 폴링 계속
      }
    }

    doRefresh();
    timer = setInterval(doRefresh, 4000);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [code]);

  if (room === undefined) {
    return (
      <div>
        <TopNavigation
          leading={
            <TopNavigationBackButton onClick={() => onNavigate({ type: 'home' })} />
          }
          content="로딩 중..."
        />
        <div style={{ padding: 40, textAlign: 'center', color: '#8B95A1' }}>잠시만 기다려 주세요.</div>
      </div>
    );
  }

  if (room === null) {
    return (
      <div>
        <TopNavigation
          leading={
            <TopNavigationBackButton onClick={() => onNavigate({ type: 'home' })} />
          }
          content="방을 찾을 수 없음"
        />
        <div style={{ padding: 24, textAlign: 'center', color: '#8B95A1' }}>
          방 코드가 잘못되었거나 만료되었습니다.
        </div>
      </div>
    );
  }

  const closed = isClosed(room);
  const isOwner = room.ownerId === voterId;
  const myVotedId = room.votes.find((v) => v.voterId === voterId)?.candidateId;
  const results = getResults(room);
  const totalVotes = room.votes.length;
  const maxVotes = results[0]?.votes ?? 0;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  async function handleVote(candidateId: string) {
    if (closed) return;
    try {
      await vote(code, voterId, candidateId);
      const r = await getRoom(code);
      setRoom(r);
    } catch {
      // 오류 무시 (폴링이 복구)
    }
  }

  async function handleClose() {
    try {
      await closeRoom(code, voterId);
      const r = await getRoom(code);
      setRoom(r);
    } catch {
      // 오류 무시
    }
  }

  const deadlineLabel = (() => {
    if (!room.deadline) return null;
    if (closed) return '마감됨';
    const remaining = room.deadline - Date.now();
    if (remaining <= 0) return '마감됨';
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    return mins > 0 ? `${mins}분 ${secs}초 남음` : `${secs}초 남음`;
  })();

  return (
    <div style={{ paddingBottom: closed ? 32 : 100 }}>
      <TopNavigation
        leading={
          <TopNavigationBackButton onClick={() => onNavigate({ type: 'home' })} />
        }
        content={
          <button
            onClick={copyCode}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: 700,
              color: '#191F28',
              fontFamily: 'monospace',
              letterSpacing: 2,
              padding: '4px 8px',
              borderRadius: 6,
            }}
            title="코드 복사"
          >
            {code} {copied ? '✓' : ''}
          </button>
        }
      />

      {/* 상태 바 */}
      <div
        style={{
          padding: '8px 24px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 13, color: '#8B95A1' }}>총 {totalVotes}표</span>
        {closed ? (
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#fff',
              background: '#F04452',
              borderRadius: 10,
              padding: '2px 10px',
            }}
          >
            마감
          </span>
        ) : deadlineLabel ? (
          <span style={{ fontSize: 13, color: '#F04452' }}>{deadlineLabel}</span>
        ) : null}
      </div>

      <Spacing size={8} />

      {/* 후보 목록 */}
      <div style={{ padding: '0 0' }}>
        {closed ? (
          <>
            <div
              style={{
                padding: '12px 24px 8px',
                fontSize: 13,
                color: '#8B95A1',
                fontWeight: 600,
              }}
            >
              최종 결과
            </div>
            {results.map((r, i) => {
              const pct = totalVotes > 0 ? r.votes / totalVotes : 0;
              const isWinner = i === 0 && r.votes > 0 && r.votes === maxVotes;
              return (
                <div
                  key={r.candidateId}
                  style={{
                    padding: '14px 24px',
                    borderBottom: '1px solid #F2F4F6',
                    background: isWinner ? '#F0F7FF' : 'transparent',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: isWinner ? '#3182F6' : '#E5E8EB',
                        color: isWinner ? '#fff' : '#8B95A1',
                        fontSize: 12,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span
                      style={{
                        flex: 1,
                        fontSize: 17,
                        fontWeight: isWinner ? 700 : 400,
                        color: isWinner ? '#3182F6' : '#191F28',
                      }}
                    >
                      {r.name}
                      {isWinner && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 12,
                            background: '#3182F6',
                            color: '#fff',
                            borderRadius: 8,
                            padding: '2px 8px',
                          }}
                        >
                          1위
                        </span>
                      )}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        color: '#8B95A1',
                        fontWeight: isWinner ? 600 : 400,
                      }}
                    >
                      {r.votes}표 ({Math.round(pct * 100)}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: '#F2F4F6',
                      borderRadius: 3,
                      marginLeft: 34,
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct * 100}%`,
                        background: isWinner ? '#3182F6' : '#C2D8FF',
                        borderRadius: 3,
                        transition: 'width 0.4s',
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <Spacing size={16} />
            <div style={{ padding: '0 24px' }}>
              <Button
                variant="fill"
                display="block"
                size="large"
                onClick={() => onNavigate({ type: 'create' })}
              >
                새 투표 만들기
              </Button>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                padding: '12px 24px 8px',
                fontSize: 13,
                color: '#8B95A1',
                fontWeight: 600,
              }}
            >
              투표하기 (1인 1표, 변경/취소 가능)
            </div>
            {results.map((r) => {
              const pct = totalVotes > 0 ? r.votes / totalVotes : 0;
              const isMyVote = myVotedId === r.candidateId;
              return (
                <button
                  key={r.candidateId}
                  onClick={() => handleVote(r.candidateId)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: isMyVote ? '#F0F7FF' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #F2F4F6',
                    padding: '14px 24px',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        border: isMyVote ? '6px solid #3182F6' : '2px solid #D1D6DB',
                        flexShrink: 0,
                        transition: 'border 0.2s',
                      }}
                    />
                    <span
                      style={{
                        flex: 1,
                        fontSize: 17,
                        fontWeight: isMyVote ? 600 : 400,
                        color: '#191F28',
                      }}
                    >
                      {r.name}
                    </span>
                    <span style={{ fontSize: 14, color: '#8B95A1' }}>{r.votes}표</span>
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: '#F2F4F6',
                      borderRadius: 2,
                      marginLeft: 32,
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct * 100}%`,
                        background: isMyVote ? '#3182F6' : '#C2D8FF',
                        borderRadius: 2,
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                </button>
              );
            })}

            {isOwner && (
              <div style={{ padding: '20px 24px 0' }}>
                <Button
                  variant="weak"
                  display="block"
                  size="large"
                  onClick={handleClose}
                  color="red"
                >
                  투표 마감
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
