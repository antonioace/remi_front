import { HttpClient } from "../../shared/http-client";
import type { HttpResult } from "../../shared/types";
import type { User } from "../../auth/types";
import type { UpdateUserDto } from "../types";

export class UsersService extends HttpClient {
  constructor() {
    super("users");
  }

  async update(id: string, dto: UpdateUserDto): Promise<HttpResult<User>> {
    return this.patch<User>(`/${id}`, dto);
  }
}

export const usersService = new UsersService();
