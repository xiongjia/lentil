import { generalContract } from "./general";

export const contract = { general: generalContract };
export type Contract = typeof contract;

export { generalContract };
