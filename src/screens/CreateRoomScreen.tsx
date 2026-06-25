import {
  Chip,
  ChipItem,
  FixedBottomCTA,
  Spacing,
  TopNavigation,
  TopNavigationBackButton,
} from '@toss/tds-mobile';
import { useRef, useState } from 'react';
import { createRoom, getVoterId } from '../lib/roomStore';
import type { Screen } from '../types';

interface Props {
  onNavigate: (screen: Screen) => void;
}

const DEADLINE_OPTIONS = [
  { label: '마감 없음', value: 0 },
  { label: '30분', value: 30 * 60 * 1000 },
  { label: '1시간', value: 60 * 60 * 1000 },
  { label: '2시간', value: 2 * 60 * 60 * 1000 },
];

type Step = 'edit' | 'done';

export function CreateRoomScreen({ onNavigate }: Props) {
  const [step, setStep] = useState<Step>('edit');
  const [candidates, setCandidates] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [deadlineMs, setDeadlineMs] = useState(0);
  const [createdCode, setCreatedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addCandidate() {
    const name = input.trim();
    if (!name || candidates.includes(name)) return;
    setCandidates((prev) => [...prev, name]);
    setInput('');
    inputRef.current?.focus();
  }

  function removeCandidate(name: string) {
    setCandidates((prev) => prev.filter((c) => c !== name));
  }

  function handleCreate() {
    if (candidates.length < 2) return;
    const deadline = deadlineMs > 0 ? Date.now() + deadlineMs : undefined;
    const room = createRoom(candidates, deadline);
    setCreatedCode(room.code);
    setStep('done');
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(createdCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  }

  if (step === 'done') {
    return (
      <div>
        <TopNavigation
          leading={
            <TopNavigationBackButton
              onClick={() => onNavigate({ type: 'home' })}
            />
          }
          content="방 만들기 완료"
        />
        <div
          style={{
            padding: '40px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <p style={{ margin: 0, fontSize: 15, color: '#8B95A1' }}>
            아래 코드를 단톡방에 공유하세요
          </p>
          <button
            onClick={copyCode}
            style={{
              background: '#F2F4F6',
              border: 'none',
              borderRadius: 16,
              padding: '20px 40px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              width: '100%',
            }}
          >
            <span
              style={{
                fontSize: 40,
                fontWeight: 700,
                letterSpacing: 8,
                fontFamily: 'monospace',
                color: '#191F28',
              }}
            >
              {createdCode}
            </span>
            <span style={{ fontSize: 13, color: '#8B95A1' }}>
              {copied ? '복사됨!' : '탭하여 복사'}
            </span>
          </button>
          <p style={{ margin: 0, fontSize: 14, color: '#8B95A1', textAlign: 'center' }}>
            후보: {candidates.join(', ')}
          </p>
        </div>
        <FixedBottomCTA onClick={() => onNavigate({ type: 'room', code: createdCode })}>
          투표 화면으로
        </FixedBottomCTA>
      </div>
    );
  }

  const voterId = getVoterId();
  void voterId;

  return (
    <div style={{ paddingBottom: 120 }}>
      <TopNavigation
        leading={
          <TopNavigationBackButton
            onClick={() => onNavigate({ type: 'home' })}
          />
        }
        content="방 만들기"
      />

      <div style={{ padding: '24px 24px 0' }}>
        <p
          style={{
            margin: '0 0 12px',
            fontSize: 15,
            fontWeight: 600,
            color: '#191F28',
          }}
        >
          후보 메뉴
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            ref={inputRef}
            style={{
              flex: 1,
              padding: '12px 14px',
              fontSize: 16,
              border: '1.5px solid #E5E8EB',
              borderRadius: 10,
              outline: 'none',
              background: '#fff',
            }}
            placeholder="메뉴 이름 입력"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCandidate()}
            maxLength={20}
          />
          <button
            onClick={addCandidate}
            disabled={!input.trim()}
            style={{
              padding: '0 20px',
              fontSize: 15,
              fontWeight: 600,
              background: input.trim() ? '#3182F6' : '#E5E8EB',
              color: input.trim() ? '#fff' : '#B0B8C1',
              border: 'none',
              borderRadius: 10,
              cursor: input.trim() ? 'pointer' : 'default',
              transition: 'background 0.2s',
            }}
          >
            추가
          </button>
        </div>

        {candidates.length === 0 && (
          <p style={{ fontSize: 14, color: '#B0B8C1', margin: '8px 0' }}>
            메뉴를 2개 이상 추가해 주세요.
          </p>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {candidates.map((name) => (
            <div
              key={name}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#EEF3FF',
                borderRadius: 20,
                padding: '6px 14px 6px 12px',
                fontSize: 14,
                color: '#3182F6',
                fontWeight: 500,
              }}
            >
              {name}
              <button
                onClick={() => removeCandidate(name)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 16,
                  lineHeight: 1,
                  color: '#3182F6',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label={`${name} 삭제`}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <Spacing size={28} />

        <p
          style={{
            margin: '0 0 12px',
            fontSize: 15,
            fontWeight: 600,
            color: '#191F28',
          }}
        >
          마감 시간
        </p>

        <Chip kind="select">
          {DEADLINE_OPTIONS.map((opt) => (
            <ChipItem
              key={opt.value}
              selected={deadlineMs === opt.value}
              onClick={() => setDeadlineMs(opt.value)}
            >
              {opt.label}
            </ChipItem>
          ))}
        </Chip>
      </div>

      <FixedBottomCTA
        disabled={candidates.length < 2}
        onClick={handleCreate}
      >
        {candidates.length < 2
          ? `메뉴 ${2 - candidates.length}개 더 추가하세요`
          : '투표방 만들기'}
      </FixedBottomCTA>
    </div>
  );
}
