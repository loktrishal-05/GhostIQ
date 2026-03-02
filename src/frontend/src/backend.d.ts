import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface FrontendUserProfile {
    name: string;
}
export interface AnalysisInput {
    replyDelay: bigint;
    initiationRatio: bigint;
    toneChange: bigint;
    messageLengthReduction: bigint;
    recentMessage: string;
    seenIgnoredFrequency: bigint;
    socialMediaActivity: bigint;
}
export interface UserProfile {
    createdAt: bigint;
    principalId: string;
    analysisHistory: Array<AnalysisRecord>;
}
export interface AnalysisRecord {
    id: string;
    inputData: AnalysisInput;
    sentimentResult: string;
    riskCategory: string;
    date: bigint;
    score: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteAnalysis(id: string): Promise<string>;
    getCallerUserProfile(): Promise<FrontendUserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getHistory(): Promise<Array<AnalysisRecord>>;
    getStats(): Promise<{
        totalAnalyses: bigint;
        highestScore: bigint;
        averageScore: bigint;
    }>;
    getUser(): Promise<UserProfile | null>;
    getUserProfile(user: Principal): Promise<FrontendUserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerUser(): Promise<string>;
    saveAnalysis(record: AnalysisRecord): Promise<string>;
    saveCallerUserProfile(profile: FrontendUserProfile): Promise<void>;
}
