import { Injectable } from '@nestjs/common';
import { User } from '../interfaces/user.interface.js';

export interface IUsersRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(userData: Omit<User, 'id' | 'createdAt'>): Promise<User>;
  clear(): Promise<void>; // useful for tests
}

export const USERS_REPOSITORY_TOKEN = Symbol('USERS_REPOSITORY_TOKEN');

@Injectable()
export class InMemoryUsersRepository implements IUsersRepository {
  private readonly users: User[] = [];
  private nextId = 1;

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    return user ? { ...user } : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === id);
    return user ? { ...user } : null;
  }

  async create(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const user: User = {
      id: String(this.nextId++),
      ...userData,
      email: userData.email.toLowerCase(),
      createdAt: new Date(),
    };
    this.users.push(user);
    return { ...user };
  }

  async clear(): Promise<void> {
    this.users.length = 0;
    this.nextId = 1;
  }
}
