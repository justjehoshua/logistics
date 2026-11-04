import { z } from "zod";

// Same alphabet as generateTrackingNumber(): no 0/O or 1/I
export const trackingParamsSchema = z.object({
  trackingNumber: z
    .string()
    .trim()
    .toUpperCase() // people retype tracking numbers in lowercase
    .regex(/^LG[A-HJ-NP-Z2-9]{10}$/, "Invalid tracking number format"),
});

export type TrackingParams = z.infer<typeof trackingParamsSchema>;
