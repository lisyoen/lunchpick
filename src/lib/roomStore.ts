import type { Room } from '../types';

const VOTER_KEY = 'lunchpick:voter_id';
const ROOMS_KEY = 'lunchpick:rooms';
const RECENT_KEY = 'lunchpick:recent';

export function getVoterId(): string {
  let id = localStorage.getItem(VOTER_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VOTER_KEY, id);
  }
  return id;
}

function loadRooms(): Record<string, Room> {
  const raw = localStorage.getItem(ROOMS_KEY);
  return raw ? (JSON.parse(raw) as Record<string, Room>) : {};
}

function saveRooms(rooms: Record<string, Room>): void {
  localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join('');
}

export function createRoom(candidateNames: string[], deadline?: number): Room {
  const rooms = loadRooms();
  let code: string;
  do {
    code = generateCode();
  } while (rooms[code]);

  const room: Room = {
    code,
    candidates: candidateNames.map((name) => ({
      id: crypto.randomUUID(),
      name,
    })),
    votes: [],
    deadline,
    closed: false,
    createdAt: Date.now(),
    ownerId: getVoterId(),
  };
  rooms[code] = room;
  saveRooms(rooms);
  addRecentRoom(code);
  return room;
}

export function getRoom(code: string): Room | null {
  return loadRooms()[code] ?? null;
}

export function addCandidate(code: string, name: string): void {
  const rooms = loadRooms();
  if (!rooms[code] || rooms[code].closed) return;
  rooms[code].candidates.push({ id: crypto.randomUUID(), name });
  saveRooms(rooms);
}

export function removeCandidate(code: string, id: string): void {
  const rooms = loadRooms();
  if (!rooms[code] || rooms[code].closed) return;
  rooms[code].candidates = rooms[code].candidates.filter((c) => c.id !== id);
  rooms[code].votes = rooms[code].votes.filter((v) => v.candidateId !== id);
  saveRooms(rooms);
}

export function vote(code: string, voterId: string, candidateId: string): void {
  const rooms = loadRooms();
  const room = rooms[code];
  if (!room || isClosed(code)) return;

  const idx = room.votes.findIndex((v) => v.voterId === voterId);
  if (idx !== -1) {
    if (room.votes[idx].candidateId === candidateId) {
      room.votes.splice(idx, 1);
    } else {
      room.votes[idx].candidateId = candidateId;
    }
  } else {
    room.votes.push({ voterId, candidateId });
  }
  saveRooms(rooms);
}

export function getResults(
  code: string,
): { candidateId: string; name: string; votes: number }[] {
  const room = getRoom(code);
  if (!room) return [];
  return room.candidates
    .map((c) => ({
      candidateId: c.id,
      name: c.name,
      votes: room.votes.filter((v) => v.candidateId === c.id).length,
    }))
    .sort((a, b) => b.votes - a.votes);
}

export function closeRoom(code: string): void {
  const rooms = loadRooms();
  if (rooms[code]) {
    rooms[code].closed = true;
    saveRooms(rooms);
  }
}

export function isClosed(code: string): boolean {
  const room = getRoom(code);
  if (!room) return false;
  if (room.closed) return true;
  if (room.deadline && Date.now() >= room.deadline) {
    closeRoom(code);
    return true;
  }
  return false;
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
