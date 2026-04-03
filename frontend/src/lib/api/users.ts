import { apiRequest } from "@/lib/api/client";
import type {
  CreateUserPayload,
  CreateUserResponse,
  UpdateUserPayload,
  User,
} from "@/lib/api/types";

export function getCurrentUserProfile() {
  return apiRequest<User>("/users/me");
}

export function updateCurrentUserProfile(payload: UpdateUserPayload) {
  return apiRequest<User>("/users/me", {
    method: "PATCH",
    body: payload,
  });
}

export function getUsers() {
  return apiRequest<User[]>("/users/");
}

export function createUser(payload: CreateUserPayload) {
  return apiRequest<CreateUserResponse>("/users/", {
    method: "POST",
    body: payload,
  });
}

export function getUserById(userId: string) {
  return apiRequest<User>(`/users/${userId}`);
}

export function updateUserById(userId: string, payload: UpdateUserPayload) {
  return apiRequest<User>(`/users/${userId}`, {
    method: "PATCH",
    body: payload,
  });
}
