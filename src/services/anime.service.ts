import { ANIME } from '@consumet/extensions';
import axios from 'axios';

const enime = axios.create({ baseURL: 'https://api.enime.moe' });
const anime = new ANIME.Enime();

export const getSearchResults = async ({
	query,
	page,
	perPage,
}: {
	query: string;
	page?: number;
	perPage?: number;
}) => {
	const { data } = await enime.get(`/search/${query}`, {
		params: { page, perPage },
	});
	return data;
};

export const getAnimeInfo = async ({ animeId }: { animeId: string }) => {
	const res = await anime.fetchAnimeInfo(animeId);
	return res;
};

export const getEpisodeSources = async ({
	episodeId,
}: {
	episodeId: string;
}) => {
	const res = await anime.fetchEpisodeSources(episodeId);
	return res;
};

console.log(
	await getEpisodeSources({ episodeId: 'cliqovrrnejrgpk01y88u3eys' }),
);

export const getPopularAnime = async ({
	page,
	perPage,
}: {
	page?: number;
	perPage?: number;
}) => {
	const { data } = await enime.get('/popular', { params: { page, perPage } });
	return data;
};

export const getRecentAnime = async ({
	page,
	perPage,
}: {
	page?: number;
	perPage?: number;
}) => {
	const { data } = await enime.get('/recent', { params: { page, perPage } });
	return data;
};
