import { z } from 'zod';

export const setIsStreamingEnabledRequestSchema = z.object({
	body: z.object({ is_enabled: z.boolean() }),
});
