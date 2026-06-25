import { Button, List, ListRow, Spacing, Top } from '@toss/tds-mobile';
import { useEffect, useState } from 'react';
import { addRecentRoom, getRecentRooms, getRoom } from '../lib/roomStore';
import type { Room, Screen } from '../types';

interface Props {
  onNavigate: (screen: Screen) => void;
}

export function HomeScreen({ onNavigate }: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [recentRooms, setRecentRooms] = useState<Room[]>([]);

  useEffect(() => {
    const codes = getRecentRooms();
    if (codes.length === 0) return;
    Promise.all(codes.map((c) => getRoom(c)))
      .then((rooms) => setRecentRooms(rooms.filter((r): r is Room => r !== null)))
      .catch(() => {});
  }, []);

  async function handleJoin() {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) {
      setError('방 코드는 6자리입니다.');
      return;
    }
    setJoining(true);
    try {
      const room = await getRoom(trimmed);
      if (!room) {
        setError('존재하지 않는 방 코드입니다.');
        return;
      }
      addRecentRoom(trimmed);
      setError('');
      onNavigate({ type: 'room', code: trimmed });
    } catch {
      setError('서버 연결 오류. 잠시 후 다시 시도해 주세요.');
    } finally {
      setJoining(false);
    }
  }

  return (
    <div style={{ paddingBottom: 32 }}>
      <Top
        title={
          <Top.TitleParagraph size={28}>오늘 뭐 먹지</Top.TitleParagraph>
        }
        subtitleBottom={
          <Top.SubtitleParagraph size={16}>
            단톡방에서 30초 만에 점심 메뉴를 정하세요.
          </Top.SubtitleParagraph>
        }
      />

      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Button
          variant="fill"
          display="block"
          size="xlarge"
          onClick={() => onNavigate({ type: 'create' })}
        >
          방 만들기
        </Button>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            style={{
              flex: 1,
              padding: '14px 16px',
              fontSize: 17,
              border: `1.5px solid ${error ? '#F04452' : '#E5E8EB'}`,
              borderRadius: 10,
              outline: 'none',
              letterSpacing: 4,
              textTransform: 'uppercase',
              fontFamily: 'monospace',
              background: '#fff',
            }}
            placeholder="방 코드 6자리"
            maxLength={6}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          />
          <Button variant="fill" size="xlarge" onClick={handleJoin} disabled={joining}>
            {joining ? '...' : '참여'}
          </Button>
        </div>

        {error && (
          <p style={{ color: '#F04452', fontSize: 13, margin: 0 }}>{error}</p>
        )}
      </div>

      {recentRooms.length > 0 && (
        <>
          <Spacing size={24} />
          <List>
            <div
              style={{
                padding: '0 24px 8px',
                fontSize: 13,
                color: '#8B95A1',
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}
            >
              최근 방
            </div>
            {recentRooms.map((room) => {
              const preview =
                room.candidates
                  .slice(0, 3)
                  .map((c) => c.name)
                  .join(', ') || '후보 없음';
              const status = room.closed ? '마감' : `${room.votes.length}표`;
              return (
                <ListRow
                  key={room.code}
                  contents={
                    <ListRow.Texts
                      type="2RowTypeA"
                      top={preview}
                      bottom={`#${room.code} · ${status}`}
                    />
                  }
                  arrowType="right"
                  onClick={() => onNavigate({ type: 'room', code: room.code })}
                />
              );
            })}
          </List>
        </>
      )}
    </div>
  );
}
