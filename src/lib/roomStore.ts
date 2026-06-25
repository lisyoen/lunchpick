import type { Room } from '../types';

const VOTER_KEY = 'lunchpick:voter_id';
const RECENT_KEY = 'lunchpick:recent';

const API_BASE: string =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? 'http://localhost:8787';

// --- 로컬 전용 (localStorage) ---

export function getVoterId(): string {
  let id = localStorage.getItem(VOTER_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VOTER_KEY, id);
  }
  return id;
}

export function getRecentRooms(): string[] {
  const raw = localStorage.getItem(RECENT_KEY);
  return raw ? (JSON.parse(raw) as string[]) : [];
}

export function addRecentRoom(code: string): void {
  const recent = getRecentRooms().filter((c) => c !== code);
  recent.unshift(code);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 5)));
}

// --- 순수 유틸 (Room 객체 기반, API 불필요) ---

export function isClosed(room: Room): boolean {
  if (room.closed) return true;
  if (room.deadline && Date.now() >= room.deadline) return true;
  return false;
}

export function getResults(
  room: Room,
): { candidateId: string; name: string; votes: number }[] {
  return room.candidates
    .map((c) => ({
      candidateId: c.id,
      name: c.name,
      votes: room.votes.filter((v) => v.candidateId === c.id).length,
    }))
    .sort((a, b) => b.votes - a.votes);
}

// --- API 클라이언트 (async) ---

export async function createRoom(
  candidateNames: string[],
  deadline?: number,
): Promise<Room> {
  const ownerId = getVoterId();
  const res = await fetch(`${API_BASE}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidates: candidateNames, ownerId, deadline }),
  });
  if (!res.ok) throw new Error('방 생성 실패');
  const room = (await res.json()) as Room;
  addRecentRoom(room.code);
  return room;
}

export async function getRoom(code: string): Promise<Room | null> {
  const res = await fetch(`${API_BASE}/api/rooms/${code.toUpperCase()}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('방 조회 실패');
  return (await res.json()) as Room;
}

export async function addCandidate(code: string, name: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/rooms/${code}/candidates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('후보 추가 실패');
}

export async function removeCandidate(code: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/rooms/${code}/candidates/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('후보 삭제 실패');
}

export async function vote(
  code: string,
  voterId: string,
  candidateId: string,
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/rooms/${code}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voterId, candidateId }),
  });
  if (!res.ok) throw new Error('투표 실패');
}

export async function closeRoom(code: string, voterId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/rooms/${code}/close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voterId }),
  });
  if (!res.ok) throw new Error('마감 실패');
}
