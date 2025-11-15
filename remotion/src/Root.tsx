import {Composition} from 'remotion';
import {IntroScene} from './scenes/IntroScene';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition
			id="IntroScene"
			component={IntroScene}
			durationInFrames={300}
			fps={30}
			width={1920}
			height={1080}
		/>
	</>
);
