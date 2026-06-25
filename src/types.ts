export interface Candidate {
  id: string;
  name: string;
}

export interface Vote {
  voterId: string;
  candidateId: string;
}

export interface Room {
  code: string;
  candidates: Candidate[];
  votes: Vote[];
  deadline?: number;
  closed: boolean;
  createdAt: number;
  ownerId: string;
}

export type Screen =
  | { type: 'home' }
  | { type: 'create' }
  | { type: 'room'; code: string };
