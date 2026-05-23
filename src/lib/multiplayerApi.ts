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
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('game_rooms')
    .update({
      status: 'playing',
      current_question: 0,
      start_time: now,
    })
    .eq('code', roomCode.toUpperCase())
    .eq('status', 'waiting');

  if (error) throw error;

  await supabase
    .from('game_players')
    .update({ answered: false })
    .eq('room_code', roomCode.toUpperCase());
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
    .select('score, answered')
    .eq('room_code', code)
    .eq('player_name', playerName)
    .single();

  if (playerError) throw playerError;
  if (player?.answered) return;

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

export async function advanceQuestion(
  roomCode: string,
  currentIndex: number,
  totalQuestions: number,
): Promise<void> {
  const code = roomCode.toUpperCase();
  const nextIndex = currentIndex + 1;

  if (nextIndex >= totalQuestions) {
    const { error } = await supabase
      .from('game_rooms')
      .update({ status: 'finished' })
      .eq('code', code);

    if (error) throw error;
    return;
  }

  const now = new Date().toISOString();
  const { error: roomError } = await supabase
    .from('game_rooms')
    .update({
      current_question: nextIndex,
      start_time: now,
    })
    .eq('code', code);

  if (roomError) throw roomError;

  await supabase.from('game_players').update({ answered: false }).eq('room_code', code);
}

export interface RoomSubscriptionCallbacks {
  onRoomUpdate: (room: GameRoom) => void;
  onPlayersUpdate: (players: GamePlayer[]) => void;
}

export function subscribeToRoom(
  roomCode: string,
  callbacks: RoomSubscriptionCallbacks,
): RealtimeChannel {
  const code = roomCode.toUpperCase();

  const channel = supabase
    .channel(`room:${code}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'game_rooms',
        filter: `code=eq.${code}`,
      },
      async () => {
        const room = await fetchRoom(code);
        if (room) callbacks.onRoomUpdate(room);
      },
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'game_players',
        filter: `room_code=eq.${code}`,
      },
      async () => {
        const players = await fetchPlayers(code);
        callbacks.onPlayersUpdate(players);
      },
    )
    .subscribe();

  fetchRoom(code).then((room) => {
    if (room) callbacks.onRoomUpdate(room);
  });
  fetchPlayers(code).then(callbacks.onPlayersUpdate);

  return channel;
}

export function unsubscribeFromRoom(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}

function normalizeRoom(row: Record<string, unknown>): GameRoom {
  return {
    id: row.id as string,
    code: row.code as string,
    host_name: row.host_name as string,
    difficulty: row.difficulty as Difficulty,
    question_count: row.question_count as number,
    status: row.status as GameRoomStatus,
    questions: row.questions as FlagQuestion[] | null,
    current_question: (row.current_question as number) ?? 0,
    start_time: (row.start_time as string | null) ?? null,
    created_at: row.created_at as string,
  };
}
