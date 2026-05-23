import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Difficulty, FlagQuestion } from '../types';
import { generateFlagQuestions } from '../data/countries';
import { supabase } from './supabase';

export type GameRoomStatus = 'waiting' | 'playing' | 'finished';

export interface GameRoom {
  id: string;
  code: string;
  host_name: string;
  difficulty: Difficulty;
  question_count: number;
  status: GameRoomStatus;
  questions: FlagQuestion[] | null;
  current_question: number;
  start_time: string | null;
  created_at: string;
}

export interface GamePlayer {
  id: string;
  room_code: string;
  player_name: string;
  score: number;
  answered: boolean;
  created_at: string;
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

export const MAX_PLAYERS_PER_ROOM = 10;

export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export async function createRoom(
  hostName: string,
  difficulty: Difficulty,
  questionCount: number,
): Promise<GameRoom> {
  const questions = generateFlagQuestions(difficulty, questionCount);
  let code = generateRoomCode();
  let attempts = 0;

  while (attempts < 8) {
    const { data, error } = await supabase
      .from('game_rooms')
      .insert({
        code,
        host_name: hostName,
        difficulty,
        question_count: questionCount,
        questions,
        status: 'waiting',
        current_question: 0,
      })
      .select()
      .single();

    if (!error && data) {
      await supabase.from('game_players').insert({
        room_code: code,
        player_name: hostName,
        score: 0,
        answered: false,
      });
      return normalizeRoom(data);
    }

    if (error?.code !== '23505') throw error;
    code = generateRoomCode();
    attempts++;
  }

  throw new Error('Impossible de générer un code unique');
}

export async function fetchRoom(code: string): Promise<GameRoom | null> {
  const { data, error } = await supabase
    .from('game_rooms')
    .select('*')
    .eq('code', code.toUpperCase())
    .maybeSingle();

  if (error) throw error;
  return data ? normalizeRoom(data) : null;
}

export async function fetchPlayers(roomCode: string): Promise<GamePlayer[]> {
  const { data, error } = await supabase
    .from('game_players')
    .select('*')
    .eq('room_code', roomCode.toUpperCase())
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as GamePlayer[];
}

export async function joinRoom(code: string, playerName: string): Promise<GameRoom> {
  const room = await fetchRoom(code);
  if (!room || room.status !== 'waiting') {
    throw new Error('INVALID_CODE');
  }

  const existing = await fetchPlayers(code);
  if (existing.some((p) => p.player_name === playerName)) {
    return room;
  }

  if (existing.length >= MAX_PLAYERS_PER_ROOM) {
    throw new Error('ROOM_FULL');
  }

  const { error } = await supabase.from('game_players').insert({
    room_code: code.toUpperCase(),
    player_name: playerName,
    score: 0,
    answered: false,
  });

  if (error) throw error;
  return room;
}

export async function startGame(roomCode: string): Promise<void> {
  const code = roomCode.toUpperCase();
  const players = await fetchPlayers(code);

  if (players.length < 2) {
    throw new Error('Au moins 2 joueurs requis');
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('game_rooms')
    .update({
      status: 'playing',
      current_question: 0,
      start_time: now,
    })
    .eq('code', code)
    .eq('status', 'waiting')
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error('Impossible de démarrer la partie');
  }

  await supabase.from('game_players').update({ answered: false }).eq('room_code', code);
}

export async function hasAnsweredQuestion(
  roomCode: string,
  playerName: string,
  questionIndex: number,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('game_answers')
    .select('id')
    .eq('room_code', roomCode.toUpperCase())
    .eq('player_name', playerName)
    .eq('question_index', questionIndex)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

export async function submitAnswer(
  roomCode: string,
  playerName: string,
  questionIndex: number,
  isCorrect: boolean,
  timeTaken: number,
  points: number,
): Promise<void> {
  const code = roomCode.toUpperCase();

  if (await hasAnsweredQuestion(code, playerName, questionIndex)) {
    return;
  }

  const { error: answerError } = await supabase.from('game_answers').insert({
    room_code: code,
    player_name: playerName,
    question_index: questionIndex,
    is_correct: isCorrect,
    time_taken: timeTaken,
  });

  if (answerError) throw answerError;

  const { data: player, error: playerError } = await supabase
    .from('game_players')
    .select('score')
    .eq('room_code', code)
    .eq('player_name', playerName)
    .single();

  if (playerError) throw playerError;

  const { error: updateError } = await supabase
    .from('game_players')
    .update({
      score: (player?.score ?? 0) + points,
      answered: true,
    })
    .eq('room_code', code)
    .eq('player_name', playerName);

  if (updateError) throw updateError;
}

export async function countAnswersForQuestion(
  roomCode: string,
  questionIndex: number,
): Promise<number> {
  const { data, error } = await supabase
    .from('game_answers')
    .select('player_name')
    .eq('room_code', roomCode.toUpperCase())
    .eq('question_index', questionIndex);

  if (error) throw error;
  return new Set((data ?? []).map((row) => row.player_name)).size;
}

export async function advanceQuestion(
  roomCode: string,
  currentIndex: number,
  totalQuestions: number,
): Promise<void> {
  const code = roomCode.toUpperCase();
  const nextIndex = currentIndex + 1;

  if (nextIndex >= totalQuestions) {
    const { data, error } = await supabase
      .from('game_rooms')
      .update({ status: 'finished' })
      .eq('code', code)
      .eq('current_question', currentIndex)
      .eq('status', 'playing')
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      throw new Error('Advance failed — room already finished or question changed');
    }

    await supabase.from('game_players').update({ answered: false }).eq('room_code', code);
    return;
  }

  const now = new Date().toISOString();
  const { data, error: roomError } = await supabase
    .from('game_rooms')
    .update({
      current_question: nextIndex,
      start_time: now,
    })
    .eq('code', code)
    .eq('current_question', currentIndex)
    .eq('status', 'playing')
    .select()
    .maybeSingle();

  if (roomError) throw roomError;
  if (!data) {
    throw new Error('Advance failed — question already advanced');
  }

  await supabase.from('game_players').update({ answered: false }).eq('room_code', code);
}

export async function replayGame(roomCode: string): Promise<void> {
  const code = roomCode.toUpperCase();
  const room = await fetchRoom(code);

  if (!room) {
    throw new Error('Partie introuvable');
  }
  if (room.status !== 'finished') {
    throw new Error('La partie n\'est pas terminée');
  }

  const questions = generateFlagQuestions(room.difficulty, room.question_count);

  const { error: answersError } = await supabase
    .from('game_answers')
    .delete()
    .eq('room_code', code);

  if (answersError) throw answersError;

  const { error: playersError } = await supabase
    .from('game_players')
    .update({ score: 0, answered: false })
    .eq('room_code', code);

  if (playersError) throw playersError;

  const { data, error: roomError } = await supabase
    .from('game_rooms')
    .update({
      status: 'waiting',
      current_question: 0,
      start_time: null,
      questions,
    })
    .eq('code', code)
    .eq('status', 'finished')
    .select()
    .maybeSingle();

  if (roomError) throw roomError;
  if (!data) {
    throw new Error('Impossible de relancer la partie');
  }
}

export function subscribeToGameRoom(
  roomCode: string,
  onRoomChange: (room: GameRoom) => void,
): RealtimeChannel {
  const code = roomCode.toUpperCase();

  return supabase
    .channel(`room-${code}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'game_rooms',
        filter: `code=eq.${code}`,
      },
      (payload) => {
        if (payload.new) {
          onRoomChange(normalizeRoom(payload.new as Record<string, unknown>));
        }
      },
    )
    .subscribe();
}

export function subscribeToGamePlayers(
  roomCode: string,
  onPlayersChange: (players: GamePlayer[]) => void,
): RealtimeChannel {
  const code = roomCode.toUpperCase();

  const fetchAllPlayers = () => {
    void fetchPlayers(code).then(onPlayersChange);
  };

  return supabase
    .channel(`players-${code}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'game_players',
        filter: `room_code=eq.${code}`,
      },
      () => {
        fetchAllPlayers();
      },
    )
    .subscribe();
}

export function removeSubscription(channel: RealtimeChannel): void {
  void supabase.removeChannel(channel);
}

function parseQuestions(raw: unknown): FlagQuestion[] | null {
  if (!raw) return null;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as FlagQuestion[]) : null;
    } catch {
      return null;
    }
  }
  return Array.isArray(raw) ? (raw as FlagQuestion[]) : null;
}

export function normalizeRoom(row: Record<string, unknown>): GameRoom {
  return {
    id: row.id as string,
    code: row.code as string,
    host_name: row.host_name as string,
    difficulty: row.difficulty as Difficulty,
    question_count: Number(row.question_count) || 0,
    status: row.status as GameRoomStatus,
    questions: parseQuestions(row.questions),
    current_question: Number(row.current_question) || 0,
    start_time: (row.start_time as string | null) ?? null,
    created_at: row.created_at as string,
  };
}
