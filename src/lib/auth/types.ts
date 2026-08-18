export type Role = "admin" | "user";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  defaultImage?: string | null;
  role: Role;
};
