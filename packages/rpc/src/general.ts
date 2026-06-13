import { oc } from "@orpc/contract";
import { z } from "zod/v3";

export const generalContract = {
  health: oc
    .route({ method: "POST", path: "/general/health" })
    .output(z.object({ status: z.string() })),
  hello: oc
    .route({ method: "POST", path: "/general/hello" })
    .output(z.object({ message: z.string() })),
};
