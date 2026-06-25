const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const rooms = new Map();

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = Array.from(
      { length: 6 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join('');
  } while (rooms.has(code));
  return code;
}

// POST /api/rooms — 방 생성
app.post('/api/rooms', (req, res) => {
  const { candidates, ownerId, deadline } = req.body;
  if (!Array.isArray(candidates) || candidates.length < 2) {
    return res.status(400).json({ error: 'candidates must have at least 2 items' });
  }
  const code = generateCode();
  const room = {
    code,
    candidates: candidates.map((name) => ({
      id: crypto.randomUUID(),
      name: String(name),
    })),
    votes: [],
    ownerId: ownerId ?? null,
    deadline: deadline ?? null,
    closed: false,
    createdAt: Date.now(),
  };
  rooms.set(code, room);
  return res.status(201).json(room);
});

// GET /api/rooms/:code — 방 조회
app.get('/api/rooms/:code', (req, res) => {
  const room = rooms.get(req.params.code.toUpperCase());
  if (!room) return res.status(404).json({ error: 'Room not found' });
  if (!room.closed && room.deadline && Date.now() >= room.deadline) {
    room.closed = true;
  }
  return res.json(room);
});

// POST /api/rooms/:code/candidates — 후보 추가
app.post('/api/rooms/:code/candidates', (req, res) => {
  const room = rooms.get(req.params.code.toUpperCase());
  if (!room) return res.status(404).json({ error: 'Room not found' });
  if (room.closed) return res.status(400).json({ error: 'Room is closed' });
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const candidate = { id: crypto.randomUUID(), name: String(name) };
  room.candidates.push(candidate);
  return res.status(201).json(candidate);
});

// DELETE /api/rooms/:code/candidates/:id — 후보 삭제
app.delete('/api/rooms/:code/candidates/:id', (req, res) => {
  const room = rooms.get(req.params.code.toUpperCase());
  if (!room) return res.status(404).json({ error: 'Room not found' });
  if (room.closed) return res.status(400).json({ error: 'Room is closed' });
  room.candidates = room.candidates.filter((c) => c.id !== req.params.id);
  room.votes = room.votes.filter((v) => v.candidateId !== req.params.id);
  return res.json({ ok: true });
});

// POST /api/rooms/:code/vote — 투표 (1인1표, 동일후보 재선택=취소, 다른후보=갱신)
app.post('/api/rooms/:code/vote', (req, res) => {
  const room = rooms.get(req.params.code.toUpperCase());
  if (!room) return res.status(404).json({ error: 'Room not found' });
  if (!room.closed && room.deadline && Date.now() >= room.deadline) {
    room.closed = true;
  }
  if (room.closed) return res.status(400).json({ error: 'Room is closed' });

  const { voterId, candidateId } = req.body;
  if (!voterId || !candidateId) return res.status(400).json({ error: 'voterId and candidateId required' });

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
  return res.json({ ok: true });
});

// POST /api/rooms/:code/close — 마감 (ownerId 일치 시)
app.post('/api/rooms/:code/close', (req, res) => {
  const room = rooms.get(req.params.code.toUpperCase());
  if (!room) return res.status(404).json({ error: 'Room not found' });
  const { voterId } = req.body;
  if (room.ownerId !== voterId) return res.status(403).json({ error: 'Not the owner' });
  room.closed = true;
  return res.json({ ok: true });
});

const PORT = process.env.PORT ?? 8787;
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`lunchpick server listening on http://0.0.0.0:${PORT}`);
});
