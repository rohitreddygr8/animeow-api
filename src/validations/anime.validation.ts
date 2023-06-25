import { z } from 'zod';

export const getSearchResultsRequestSchema = z.object({
	query: z.object({
		query: z.string(),
		page: z
			.string()
			.optional()
			.transform((val) => Number(val)),
		perPage: z
			.string()
			.optional()
			.transform((val) => Number(val)),
	}),
});

export const getAnimeInfoRequestSchema = z.object({
	params: z.object({ animeId: z.string() }),
});

export const getEpisodeInfoRequestSchema = z.object({
	params: z.object({ episodeId: z.string() }),
});

export const getRecentAnimeRequestSchema = z.object({
	params: z.object({
		page: z
			.string()
			.optional()
			.transform((val) => Number(val)),
		perPage: z
			.string()
			.optional()
			.transform((val) => Number(val)),
	}),
});

export const getPopularAnimeRequestSchema = getRecentAnimeRequestSchema;
