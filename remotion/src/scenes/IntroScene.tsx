import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const words = ['Tired', 'Slow', 'Unmotivated'];
const wordCardColor = 'rgba(255,255,255,0.95)';
const wordForeground = '#a855f7';
const wordBoxHeight = 110;
const wordCardWidth = 520;

export const IntroScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const wordScrollStartFrame = Math.round(3.2 * fps);
	const wordScrollHold = Math.round(1.2 * fps);
	const wordScrollDuration = Math.round(0.6 * fps);
	const wordSegment = wordScrollHold + wordScrollDuration;
	const wordTimelineEffective = (words.length - 1) * wordSegment + wordScrollHold;

	const firstLineExitDuration = Math.round(0.65 * fps);
	const firstLineExitStart = wordScrollStartFrame + wordTimelineEffective;
	const secondLineStart = firstLineExitStart + firstLineExitDuration;
	const secondLineHold = Math.round(1.5 * fps);
	const thirdLineStart = secondLineStart + secondLineHold;
	const secondLineExitDuration = Math.round(0.6 * fps);
	const secondLineExitStart = thirdLineStart - secondLineExitDuration;
	const openCareUnderlineDuration = Math.round((700 / 1000) * fps);

	const dropProgress = spring({
		frame,
		fps,
		config: {
			stiffness: 90,
			damping: 16,
			mass: 1.1,
		},
		durationInFrames: 95,
	});

	const dropX = interpolate(dropProgress, [0, 1], [-360, 0], {extrapolateLeft: 'clamp'});
	const dropY = interpolate(dropProgress, [0, 1], [-300, 0], {extrapolateLeft: 'clamp'});
	const bounce = Math.sin(frame / 28) * 6;

	const firstLineEntry = clamp01(dropProgress);
	const firstLineExitProgress = clamp01((frame - firstLineExitStart) / firstLineExitDuration);
	const firstLineOpacity = firstLineEntry * (1 - firstLineExitProgress);
	const firstLineTranslateY = (1 - firstLineEntry) * 140 - firstLineExitProgress * 120;

	const wordScrollFrame = Math.max(0, frame - wordScrollStartFrame);
	const cappedWordScrollFrame = Math.min(wordScrollFrame, wordTimelineEffective);

	const secondLineEntry = spring({
		frame: frame - secondLineStart,
		fps,
		config: {
			stiffness: 90,
			damping: 22,
		},
	});
	const secondLineProgress = clamp01(secondLineEntry);
	const secondLineExitProgress = clamp01((frame - secondLineExitStart) / secondLineExitDuration);
	const secondLineOpacity = secondLineProgress * (1 - secondLineExitProgress);
	const secondLineTranslate = (1 - secondLineProgress) * 100 - secondLineExitProgress * 110;

	const thirdLineEntry = spring({
		frame: frame - thirdLineStart,
		fps,
		config: {
			stiffness: 95,
			damping: 20,
		},
	});
	const thirdLineProgress = clamp01(thirdLineEntry);
	const thirdLineOpacity = thirdLineProgress;
	const thirdLineTranslate = (1 - thirdLineProgress) * 120;

	const underlineGrowth = clamp01(frame / 70);
	const underlineWidth = interpolate(underlineGrowth, [0, 1], [0, 75]);
	const openCareUnderline = clamp01((frame - thirdLineStart) / openCareUnderlineDuration);

const computeWordScrollOffset = (scrollFrame: number) => {
	let offset = 0;
	for (let i = 1; i < words.length; i++) {
		const segmentStart = (i - 1) * wordSegment;
		const holdEnd = segmentStart + wordScrollHold;
		const scrollEnd = holdEnd + wordScrollDuration;

		if (scrollFrame < holdEnd) {
			return offset;
		}

		if (scrollFrame < scrollEnd) {
			const progress = clamp01((scrollFrame - holdEnd) / wordScrollDuration);
			return (i - 1 + progress) * wordCardWidth;
		}

		offset = i * wordCardWidth;
	}

	return offset;
};

const wordScrollOffset = computeWordScrollOffset(cappedWordScrollFrame);
const showWordCardContent = frame >= wordScrollStartFrame;

	return (
		<AbsoluteFill
			style={{
				background: 'radial-gradient(circle at 20% 20%, #192042, #050713 60%)',
				color: 'white',
				fontFamily: 'Sora, Inter, system-ui, -apple-system, sans-serif',
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background:
						'radial-gradient(circle at 80% 20%, rgba(56,189,248,0.25), transparent 45%), radial-gradient(circle at 15% 80%, rgba(168,85,247,0.28), transparent 50%)',
					filter: 'blur(10px)',
				}}
			/>
			{Array.from({length: 8}).map((_, idx) => {
				const travel = ((frame * 1.2 + idx * 50) % 460) - 230;
				return (
					<div
						key={`line-${idx}`}
						style={{
							position: 'absolute',
							width: '220%',
							height: 2,
							top: `${15 + idx * 110 + travel}px`,
							left: '-60%',
							background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
							opacity: 0.2,
							transform: `rotate(${5 + idx * 3}deg)`,
						}}
					/>
				);
			})}
			<div
				style={{
					position: 'absolute',
					inset: 60,
					borderRadius: 40,
					border: '1px solid rgba(255,255,255,0.08)',
					boxShadow: '0 30px 120px rgba(0,0,0,0.45)',
					backdropFilter: 'blur(12px)',
				}}
			/>

			<AbsoluteFill
				style={{
					padding: '220px 260px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					transform: `translate3d(${dropX}px, ${dropY + bounce}px, 0)`,
				}}
			>
				<div style={{width: '100%', maxWidth: 1200}}>
					<div style={{position: 'relative', height: 320}}>
						<div
							style={{
								fontSize: 96,
								lineHeight: 1.05,
								fontWeight: 700,
								color: 'white',
								opacity: firstLineOpacity,
								transform: `translateY(${firstLineTranslateY}px)`,
								textShadow: '0 24px 60px rgba(0,0,0,0.65)',
								position: 'absolute',
								inset: 0,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<span style={{display: 'inline-flex', alignItems: 'center', gap: 20}}>
								<span style={{paddingRight: 12}}>Feeling</span>
								<span style={{display: 'inline-flex', alignItems: 'center', gap: 12}}>
									<span
										style={{
											display: 'inline-flex',
											alignItems: 'center',
											justifyContent: 'center',
											background: wordCardColor,
											borderRadius: 28,
											padding: '8px 32px',
											height: `${wordBoxHeight}px`,
											width: `${wordCardWidth}px`,
											boxShadow: '0 25px 65px rgba(255,255,255,0.25)',
											overflow: 'hidden',
										}}
									>
										<span
											style={{
												display: 'flex',
												flexDirection: 'row',
												transform: `translateX(-${showWordCardContent ? wordScrollOffset : 0}px)`,
												willChange: 'transform',
												transition: showWordCardContent ? 'transform 0.2s linear' : undefined,
											}}
										>
											{words.map((word) => (
												<span
													key={word}
													style={{
														width: `${wordCardWidth}px`,
														height: `${wordBoxHeight}px`,
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														color: showWordCardContent ? wordForeground : 'transparent',
														fontWeight: 700,
														fontSize: 82,
												}}
												>
													{word}
												</span>
											))}
										</span>
									</span>
									<span
										style={{
											marginLeft: 10,
											color: showWordCardContent ? 'white' : 'transparent',
											opacity: firstLineOpacity,
										}}
									>
										?
									</span>
								</span>
							</span>
						</div>

						<div
							style={{
								position: 'absolute',
								left: '50%',
								bottom: 50,
								transform: 'translateX(-50%)',
								height: 6,
								width: `${underlineWidth}%`,
								background: 'linear-gradient(90deg, rgba(168,85,247,0.3), rgba(56,189,248,0.9))',
								borderRadius: 999,
								boxShadow: '0 10px 30px rgba(56,189,248,0.4)',
								opacity: firstLineOpacity,
							}}
						/>

						<div
							style={{
								fontSize: 76,
								fontWeight: 600,
								color: 'rgba(226,239,255,0.95)',
								opacity: secondLineOpacity,
								transform: `translateY(${secondLineTranslate}px)`,
								textAlign: 'center',
								position: 'absolute',
								inset: 0,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							Too much paperwork?
						</div>

						<div
							style={{
								opacity: thirdLineOpacity,
								transform: `translateY(${thirdLineTranslate}px)`,
								position: 'absolute',
								inset: 0,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<div
								style={{
									display: 'inline-flex',
									alignItems: 'center',
									gap: 12,
									fontSize: 72,
									fontWeight: 700,
									color: 'white',
									textShadow: '0 18px 40px rgba(0,0,0,0.55)',
							}}
							>
								<span>Try</span>
								<span
									style={{
										display: 'inline-flex',
										alignItems: 'center',
										justifyContent: 'center',
										width: 90,
										height: 90,
										borderRadius: 28,
										background: 'linear-gradient(135deg, #38bdf8, #c084fc)',
										boxShadow: '0 20px 45px rgba(56,189,248,0.4)',
										fontWeight: 800,
										fontSize: 34,
										color: 'white',
									}}
								>
									OC
								</span>
								<span
									style={{
										display: 'inline-block',
										position: 'relative',
										paddingBottom: 12,
									}}
								>
									OpenCare
									<span
										style={{
											position: 'absolute',
											left: 0,
											right: 0,
											bottom: 0,
											height: 6,
											borderRadius: 999,
											background: 'linear-gradient(90deg, rgba(56,189,248,0.6), rgba(168,85,247,0.9))',
											width: `${openCareUnderline * 100}%`,
										}}
									/>
								</span>
							</div>
						</div>
					</div>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
