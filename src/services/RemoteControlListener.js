import TrackPlayer from 'react-native-track-player';
import { store } from '../store';
import { getRandomNumber } from '../utils';

async function backgroundPlayback(track) {
	await TrackPlayer.reset();
	await TrackPlayer.add(track);
	store.dispatch({ type: 'set_playback', payload: true });
	TrackPlayer.play();
	store.dispatch({ type: 'current_track', payload: track });
}

module.exports = async function () {
	TrackPlayer.addEventListener('remote-play', () => {
		TrackPlayer.play();
		store.dispatch({ type: 'set_playback', payload: true });
	});

	TrackPlayer.addEventListener('remote-pause', () => {
		TrackPlayer.pause();
		store.dispatch({ type: 'set_playback', payload: false });
	});

	TrackPlayer.addEventListener('remote-next', () => {
		let { playback, media } = store.getState();
		let { currentTrack, shuffle } = playback;
		let { mediaFiles } = media;
		backgroundPlayback(
			shuffle
				? media[getRandomNumber(0, media.length)]
				: currentTrack.index === mediaFiles.length - 1
				? mediaFiles[0]
				: mediaFiles[currentTrack.index + 1]
		);
	});

	TrackPlayer.addEventListener('remote-previous', () => {
		let { playback, media } = store.getState();
		let { currentTrack, shuffle } = playback;
		let { mediaFiles } = media;
		backgroundPlayback(
			shuffle
				? media[getRandomNumber(0, media.length)]
				: currentTrack.index === 0
				? mediaFiles[mediaFiles.length - 1]
				: mediaFiles[currentTrack.index - 1]
		);
	});

	TrackPlayer.addEventListener('playback-queue-ended', ({ position }) => {
		let { playback, media } = store.getState();
		let { currentTrack, shuffle, loop } = playback;
		let { mediaFiles } = media;
		if (position > 0) {
			if (loop) {
				backgroundPlayback(currentTrack);
			} else {
				backgroundPlayback(
					shuffle
						? media[getRandomNumber(0, media.length)]
						: currentTrack.index === mediaFiles.length - 1
						? mediaFiles[0]
						: mediaFiles[currentTrack.index + 1]
				);
			}
		}
	});

	TrackPlayer.addEventListener('remote-stop', () => {
		TrackPlayer.destroy();
	});
};
