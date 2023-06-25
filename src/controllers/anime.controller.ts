import { RouteHandler } from 'fastify';
import httpStatus from 'http-status';

import { animeService } from '../services/index.js';
import {
	GetAnimeInfoRequestParams,
	GetEpisodeInfoRequestParams,
	GetPopularAnimeRequestParams,
	GetRecentAnimeRequestParams,
	GetSearchResultsRequestQuery,
} from '../types/index.js';

export const getSearchResults: RouteHandler<{
	Querystring: GetSearchResultsRequestQuery;
}> = async (request, reply) => {
	const { query, page, perPage } = request.query;

	try {
		const data = await animeService.getSearchResults({ query, page, perPage });
		return reply.status(httpStatus.OK).send(data);
	} catch (err) {
		reply.log.error(err);
		return reply.status(httpStatus.INTERNAL_SERVER_ERROR).send();
	}
};

export const getAnimeInfo: RouteHandler<{
	Params: GetAnimeInfoRequestParams;
}> = async (request, reply) => {
	try {
		const { animeId } = request.params;
		const data = await animeService.getAnimeInfo({ animeId });
		return reply.status(httpStatus.OK).send(data);
	} catch (err) {
		reply.log.error(err);
		return reply.status(httpStatus.INTERNAL_SERVER_ERROR).send();
	}
};

export const getEpisodeInfo: RouteHandler<{
	Params: GetEpisodeInfoRequestParams;
}> = async (request, reply) => {
	try {
		const { episodeId } = request.params;
		const data = await animeService.getEpisodeSources({ episodeId });
		return reply.status(httpStatus.OK).send(data);
	} catch (err) {
		reply.log.error(err);
		return reply.status(httpStatus.INTERNAL_SERVER_ERROR).send();
	}
};

export const getRecentAnime: RouteHandler<{
	Params: GetRecentAnimeRequestParams;
}> = async (request, reply) => {
	try {
		const { page, perPage } = request.params;
		const data = await animeService.getRecentAnime({ page, perPage });
		return reply.status(httpStatus.OK).send(data);
	} catch (err) {
		reply.log.error(err);
		return reply.status(httpStatus.INTERNAL_SERVER_ERROR).send();
	}
};

export const getPopularAnime: RouteHandler<{
	Params: GetPopularAnimeRequestParams;
}> = async (request, reply) => {
	try {
		const { page, perPage } = request.params;
		const data = await animeService.getPopularAnime({ page, perPage });
		return reply.status(httpStatus.OK).send(data);
	} catch (err) {
		reply.log.error(err);
		return reply.status(httpStatus.INTERNAL_SERVER_ERROR).send();
	}
};
