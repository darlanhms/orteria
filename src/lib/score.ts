import { z } from 'zod';
import * as Y from 'yjs';
import { WebrtcProvider, type ProviderOptions } from 'y-webrtc';

const SESSION_PREFIX = 'orteria-scoring-session-';

export const scoringSessionSchema = z.object({
  name: z.string().min(1),
  ownerName: z.string().min(1),
  possibleScores: z.string().min(1),
});

export type ScoringSessionRequest = z.infer<typeof scoringSessionSchema>;

export type ScoringUser = {
  id: string;
  name: string;
};

export type CurrentScore = {
  score: string | null;
  userId: string;
};

export type ScoringSession = {
  id: string;
  name: string;
  ownerId: string;
  users: Y.Array<ScoringUser>;
  currentScore: Y.Array<CurrentScore>;
  createdAt: Date;
};

export class ScoringSessionWebrtcProvider extends WebrtcProvider {
  constructor(id: string, ydoc: Y.Doc, options?: ProviderOptions) {
    super(SESSION_PREFIX + id, ydoc, {
      ...options,
      password: import.meta.env.VITE_WEBRTC_PASSWORD,
    });
  }
}
