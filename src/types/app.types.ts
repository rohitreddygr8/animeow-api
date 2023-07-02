import { z } from 'zod';

import { setIsStreamingEnabledRequestSchema } from '../validations/app.validation';

export interface SiteSettings {
	is_streaming_enabled: boolean;
}

export type SetIsStreamingEnabledRequestQuery = z.infer<
	typeof setIsStreamingEnabledRequestSchema
>['body'];
