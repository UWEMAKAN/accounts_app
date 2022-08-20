export interface User {
  id: number;
  email: string;
  passwordHash: string;
  salt: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}
