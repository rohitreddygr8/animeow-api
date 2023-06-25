import { z } from 'zod';

import { animeValidation } from '../validations/index.js';

export type GetSearchResultsRequestQuery = z.infer<
	typeof animeValidation.getSearchResultsRequestSchema
>['query'];

export type GetAnimeInfoRequestParams = z.infer<
	typeof animeValidation.getAnimeInfoRequestSchema
>['params'];

export type GetEpisodeInfoRequestParams = z.infer<
	typeof animeValidation.getEpisodeInfoRequestSchema
>['params'];

export type GetRecentAnimeRequestParams = z.infer<
	typeof animeValidation.getRecentAnimeRequestSchema
>['params'];

export type GetPopularAnimeRequestParams = z.infer<
	typeof animeValidation.getPopularAnimeRequestSchema
>['params'];
