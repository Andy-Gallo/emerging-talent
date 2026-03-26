import { SetMetadata } from "@nestjs/common";
import { GlobalRole } from "../constants/roles";

export const ROLES_KEY = "roles";
export const Roles = (...roles: GlobalRole[]) => SetMetadata(ROLES_KEY, roles);
