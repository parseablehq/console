import type { CenterProps, TextProps } from '@mantine/core';
import { Center, Text } from '@mantine/core';
import type { FC } from 'react';
import styles from './Empty.module.css'

type EmptyProps = {
	height?: number | string;
	width?: number | string;
};

export const Empty: FC<EmptyProps> = ({ height, width }) => {
	return (
		<svg height={height} width={width} viewBox="0 0 184 152" xmlns="http://www.w3.org/2000/svg">
			<g fill="none" fillRule="evenodd">
				<g transform="translate(24 31.67)">
					<ellipse fill="#f5f5f5" cx="67.797" cy="106.89" rx="67.797" ry="12.668" />
					<path
						fill="#aeb8c2"
						d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z"
					/>
					<path
						fill="#fff"
						d="M101.537 86.214L80.63 61.102c-1.001-1.207-2.507-1.867-4.048-1.867H31.724c-1.54 0-3.047.66-4.048 1.867L6.769 86.214v13.792h94.768V86.214z"
						transform="translate(13.56)"
					/>
					<path
						fill="#f5f5f7"
						d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z"
					/>
					<path
						fill="#dce0e6"
						d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z"
					/>
				</g>
				<path
					fill="#dce0e6"
					d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z"
				/>
				<g fill="#fff" transform="translate(149.65 15.383)">
					<ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815" />
					<path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z" />
				</g>
			</g>
		</svg>
	);
};

export const EmptySimple: FC<EmptyProps> = ({ height, width }) => {
	return (
		<svg height={height} width={width} viewBox="0 0 64 41" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M32 41C49.6731 41 64 37.866 64 34C64 30.134 49.6731 27 32 27C14.3269 27 0 30.134 0 34C0 37.866 14.3269 41 32 41Z"
				fill="#F5F5F5"
			/>
			<path
				d="M55 13.76L44.854 2.258C44.367 1.474 43.656 1 42.907 1H21.093C20.344 1 19.633 1.474 19.146 2.257L9 13.761V23H55V13.76Z"
				fill="white"
				stroke="#D9D9D9"
			/>
			<path
				d="M41.613 16.931C41.613 15.326 42.607 14.001 43.84 14H55V32.137C55 34.26 53.68 36 52.05 36H11.95C10.32 36 9 34.259 9 32.137V14H20.16C21.393 14 22.387 15.323 22.387 16.928V16.95C22.387 18.555 23.392 19.851 24.624 19.851H39.376C40.608 19.851 41.613 18.543 41.613 16.938V16.931V16.931Z"
				fill="#FAFAFA"
				stroke="#D9D9D9"
			/>
		</svg>
	);
};

type EmptyBoxProps = {
	imgHeight?: number | string;
	imgWidth?: number | string;
	message?: string;
	textProps?: TextProps;
} & Omit<CenterProps, 'children'>;

const EmptyBox: FC<EmptyBoxProps> = (props) => {
	const { message, imgHeight, imgWidth, textProps, ...restProps } = props;
	const classes = styles;
	const { container, messageStyle } = classes;

	return (
		<Center className={container} {...restProps}>
			<EmptySimple height={imgHeight || 70} width={imgWidth || 100} />
			<Text className={messageStyle} {...textProps}>
				{message || 'No Data'}
			</Text>
		</Center>
	);
};

EmptySimple.defaultProps = {
	width: 64,
	height: 41,
};

Empty.defaultProps = {
	width: 184,
	height: 152,
};

export default EmptyBox;
