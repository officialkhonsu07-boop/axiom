import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  DailyGoals,
  GymActivity,
  NutritionEntry,
  StudyTopic,
} from "../backend.d";
import { useActor } from "./useActor";

const today = () => new Date().toISOString().split("T")[0];

export function useStudyTopics(userId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<StudyTopic[]>({
    queryKey: ["study", userId, today()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getStudyTopics(userId, today());
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useAddStudyTopic(userId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (topic: StudyTopic) =>
      actor!.addStudyTopic(userId, today(), topic),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["study", userId] }),
  });
}

export function useGymActivities(userId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<GymActivity[]>({
    queryKey: ["gym", userId, today()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getGymActivities(userId, today());
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useAddGymActivity(userId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (activity: GymActivity) =>
      actor!.addGymActivity(userId, today(), activity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gym", userId] }),
  });
}

export function useNutritionEntries(userId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<NutritionEntry[]>({
    queryKey: ["nutrition", userId, today()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getNutritionEntries(userId, today());
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useAddNutritionEntry(userId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entry: NutritionEntry) =>
      actor!.addNutritionEntry(userId, today(), entry),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nutrition", userId] }),
  });
}

export function useDailyGoals(userId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<DailyGoals>({
    queryKey: ["goals", userId, today()],
    queryFn: async () => {
      if (!actor || !userId)
        return { sleepDone: false, nmbDone: false, schoolDone: false };
      return actor.getDailyGoals(userId, today());
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useUpdateDailyGoals(userId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (goals: DailyGoals) =>
      actor!.updateDailyGoals(userId, today(), goals),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals", userId] }),
  });
}

export function useStreak(userId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["streak", userId],
    queryFn: async () => {
      if (!actor || !userId) return BigInt(0);
      return actor.getStreak(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useUpdateStreak(userId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (streak: bigint) => actor!.updateStreak(userId, streak),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["streak", userId] }),
  });
}

export function useMeasurements(userId: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["measurements", userId],
    queryFn: async () => {
      if (!actor || !userId)
        return { weeklyMeasurementDate: "", monthlyMeasurementDate: "" };
      return actor.getMeasurements(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}
