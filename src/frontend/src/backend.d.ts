import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DailyGoals {
    nmbDone: boolean;
    sleepDone: boolean;
    schoolDone: boolean;
}
export interface StudyTopic {
    id: string;
    status: string;
    timeTargetMinutes: bigint;
    subject: string;
    createdAt: string;
    topicName: string;
}
export interface GymActivity {
    id: string;
    createdAt: string;
    description: string;
    muscleGroups: string;
    estimatedCalories: bigint;
}
export interface MeasurementRecord {
    weeklyMeasurementDate: string;
    monthlyMeasurementDate: string;
}
export interface NutritionEntry {
    id: string;
    createdAt: string;
    description: string;
    sugar: string;
    estimatedCalories: bigint;
    protein: string;
}
export interface backendInterface {
    addGymActivity(userId: string, date: string, activity: GymActivity): Promise<void>;
    addNutritionEntry(userId: string, date: string, entry: NutritionEntry): Promise<void>;
    addStudyTopic(userId: string, date: string, topic: StudyTopic): Promise<void>;
    getDailyGoals(userId: string, date: string): Promise<DailyGoals>;
    getGymActivities(userId: string, date: string): Promise<Array<GymActivity>>;
    getMeasurements(userId: string): Promise<MeasurementRecord>;
    getNutritionEntries(userId: string, date: string): Promise<Array<NutritionEntry>>;
    getStreak(userId: string): Promise<bigint>;
    getStudyTopics(userId: string, date: string): Promise<Array<StudyTopic>>;
    login(name: string, dob: string): Promise<string>;
    register(name: string, dob: string, createdAt: string): Promise<string>;
    updateDailyGoals(userId: string, date: string, goals: DailyGoals): Promise<void>;
    updateMeasurements(userId: string, weeklyDate: string, monthlyDate: string): Promise<void>;
    updateStreak(userId: string, newStreak: bigint): Promise<void>;
}
