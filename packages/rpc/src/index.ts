import { generalContract } from "./general";
import { integrationContract } from "./integration";

export const contract = {
  general: generalContract,
  integration: integrationContract,
};
export type Contract = typeof contract;

export { generalContract, integrationContract };
