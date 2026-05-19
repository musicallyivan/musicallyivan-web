export const youtubeChannelUrl = 'https://youtube.com/MusicallyIvan';

export type YoutubeItem = {
	title: string;
	type: string;
	url: string;
	videoId?: string;
	thumbnail?: string;
	publishedAt?: string;
};

export type YoutubeChannel = {
	title: string;
	description: string;
	url: string;
	thumbnail?: string;
	bannerUrl?: string;
	subscriberCount?: string;
	videoCount?: string;
};

const fallbackYoutubeItems: YoutubeItem[] = [
	{ title: 'Canal Musically Ivan', type: 'Canal', url: youtubeChannelUrl },
	{ title: 'Videos de Musically Ivan', type: 'Video', url: `${youtubeChannelUrl}/videos` },
	{ title: 'Shorts de Musically Ivan', type: 'Shorts', url: `${youtubeChannelUrl}/shorts` },
	{ title: 'Buscar Musically Ivan en YouTube', type: 'Busqueda', url: 'https://www.youtube.com/results?search_query=Musically+Ivan' },
];

const fallbackChannel: YoutubeChannel = {
	title: 'Musically Ivan',
	description: 'Canal de Musically Ivan en YouTube.',
	url: youtubeChannelUrl,
};

const youtubeApiKey = import.meta.env.YOUTUBE_API_KEY;
const configuredChannelId = import.meta.env.YOUTUBE_CHANNEL_ID;

const parseDurationSeconds = (duration: string) => {
	const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
	if (!match) return 0;
	const [, hours = '0', minutes = '0', seconds = '0'] = match;
	return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
};

const youtubeGet = async (path: string, params: Record<string, string>) => {
	const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
	for (const [key, value] of Object.entries({ ...params, key: youtubeApiKey })) {
		url.searchParams.set(key, value);
	}
	const response = await fetch(url);
	if (!response.ok) throw new Error(`YouTube API ${path} failed: ${response.status}`);
	return response.json();
};

export const resolveYoutubeChannelId = async () => {
	if (configuredChannelId) return configuredChannelId;
	if (!youtubeApiKey) return undefined;

	const searchData = await youtubeGet('search', {
		part: 'snippet',
		q: 'MusicallyIvan',
		type: 'channel',
		maxResults: '1',
	});

	return searchData.items?.[0]?.id?.channelId;
};

export const fetchYoutubeChannel = async (): Promise<YoutubeChannel> => {
	if (!youtubeApiKey) return fallbackChannel;

	try {
		const channelId = await resolveYoutubeChannelId();
		if (!channelId) return fallbackChannel;

		const channelData = await youtubeGet('channels', {
			part: 'snippet,statistics,brandingSettings',
			id: channelId,
			maxResults: '1',
		});
		const channel = channelData.items?.[0];
		if (!channel) return fallbackChannel;

		return {
			title: channel.snippet?.title ?? fallbackChannel.title,
			description: channel.snippet?.description || fallbackChannel.description,
			url: youtubeChannelUrl,
			thumbnail: channel.snippet?.thumbnails?.high?.url ?? channel.snippet?.thumbnails?.medium?.url,
			bannerUrl: channel.brandingSettings?.image?.bannerExternalUrl,
			subscriberCount: channel.statistics?.subscriberCount,
			videoCount: channel.statistics?.videoCount,
		};
	} catch (error) {
		console.warn(error);
		return fallbackChannel;
	}
};

export const fetchYoutubeItems = async (): Promise<YoutubeItem[]> => {
	if (!youtubeApiKey) return fallbackYoutubeItems;

	try {
		const channelId = await resolveYoutubeChannelId();
		if (!channelId) return fallbackYoutubeItems;

		const searchData = await youtubeGet('search', {
			part: 'snippet',
			channelId,
			type: 'video',
			order: 'date',
			maxResults: '8',
		});

		const videoIds = searchData.items?.map((item) => item.id?.videoId).filter(Boolean) ?? [];
		if (videoIds.length === 0) return fallbackYoutubeItems;

		const videosData = await youtubeGet('videos', {
			part: 'snippet,contentDetails',
			id: videoIds.join(','),
			maxResults: '8',
		});

		return videosData.items.map((item): YoutubeItem => {
			const seconds = parseDurationSeconds(item.contentDetails?.duration ?? '');
			const videoId = item.id;
			const type = seconds > 0 && seconds <= 60 ? 'Shorts' : 'Video';
			return {
				title: item.snippet?.title ?? 'Video de Musically Ivan',
				type,
				videoId,
				url: `https://www.youtube.com/watch?v=${videoId}`,
				thumbnail: item.snippet?.thumbnails?.high?.url ?? item.snippet?.thumbnails?.medium?.url,
				publishedAt: item.snippet?.publishedAt,
			};
		});
	} catch (error) {
		console.warn(error);
		return fallbackYoutubeItems;
	}
};
