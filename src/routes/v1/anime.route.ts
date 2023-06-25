import { FastifyPluginAsync, RouteHandler } from 'fastify';

import { animeController } from '../../controllers/index.js';
import { validate } from '../../middleware/index.js';
import { animeValidation } from '../../validations/index.js';

export const animeRouterPlugin: FastifyPluginAsync = async (app) => {
	app.get(
		'/search',
		{ preHandler: [validate(animeValidation.getSearchResultsRequestSchema)] },
		animeController.getSearchResults as RouteHandler,
	);

	app.get(
		'/anime/:animeId',
		{ preHandler: [validate(animeValidation.getAnimeInfoRequestSchema)] },
		animeController.getAnimeInfo as RouteHandler,
	);

	app.get(
		'/episode/:episodeId',
		{ preHandler: [validate(animeValidation.getEpisodeInfoRequestSchema)] },
		animeController.getEpisodeInfo as RouteHandler,
	);

	app.get(
		'/recent',
		{ preHandler: [validate(animeValidation.getRecentAnimeRequestSchema)] },
		animeController.getRecentAnime as RouteHandler,
	);

	app.get(
		'/popular',
		{ preHandler: [validate(animeValidation.getPopularAnimeRequestSchema)] },
		animeController.getPopularAnime as RouteHandler,
	);
};
