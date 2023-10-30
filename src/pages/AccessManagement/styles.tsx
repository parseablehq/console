import { heights } from '@/components/Mantine/sizing';
import { HEADER_HEIGHT } from '@/constants/theme';
import { createStyles } from '@mantine/core';
export const useUsersStyles = createStyles((theme) => {
	const { spacing, radius, colors } = theme;
	const sColor = colors.brandSecondary[0];
	const defaultRadius = radius[theme.defaultRadius as string];

	return {
		container: {
			maxHeight: `calc(${heights.screen} - ${HEADER_HEIGHT*2}px - ${20}px)`,
			flex: 1,
			width: '100%',
			position: 'relative',
			margin: '10px',
			borderRadius: defaultRadius,
			border: `1px solid ${colors.gray[2]}`,
		},
		header: {
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingLeft: '20px',
			paddingRight: '20px',
			height: '70px',
			borderBottom: `1px solid ${colors.gray[2]}`,
		},

		createBtn: {
			height: '34px',
			paddingX: '15px',
			marginInlineEnd: spacing.xs,
			color: colors.gray[5],
			borderColor: colors.gray[2],
		},

		actionBtn: {
			'&:hover': {
				color: sColor,
			},
			height: '34px',
			width: '34px',
			padding: '0px',
			marginInlineEnd: spacing.xs,
			color: colors.gray[5],
			borderColor: colors.gray[2],
		},
		tableContainer: {
			height: 'calc(100% - 70px)',
		},
		tableStyle: {
			overflow: 'scroll',
			width: '100%',
			height: '100%',
			padding: 0,
		},
		theadStyle: {
			position: 'sticky',
			zIndex: 1,
			top: 0,
			height: '50px',
			'& tr>th': {
				height: '100%',
				textAlign: 'left',
				padding: '30px',
				verticalAlign: 'middle',
				border: 'none !important',
			},
		},
		trStyle: {
			'& tr:nth-of-type(odd)': {
				backgroundColor: '#ececec !important',
			},
			'& td': {
				height: '100%',
				textAlign: 'left',
				verticalAlign: 'middle',
				border: 'none !important',
			},
		},
		passwordPrims: {
			'& .mantine-Tooltip-tooltip ': {
				backgroundColor: colors.gray[5],
				color: colors.gray[0],
			},
			'& .mantine-Prism-code ': {
				backgroundColor: 'white !important',
				border: `1px solid ${colors.gray[2]} !important`,
			},
		},
		modalStyle: {
			'& .mantine-Paper-root ': {
				overflowY: 'inherit',
			},
			'& .mantine-Modal-header	': {
				borderRadius: '8px 8px 0px 0px',
				backgroundColor: colors.gray[1],
			},
			'& .mantine-Modal-title	': {
				fontWeight: 'bold',
			},
			'& .mantine-Modal-body ': {
				paddingTop: '1rem !important',
			},
		},
		passwordText: {
			fontWeight: 500,
			fontSize: '0.875rem',
		},
		modalActionBtn: {
			backgroundColor: theme.colors.brandSecondary[0],
			color: 'white',
		},
		modalCancelBtn: {
			borderColor: theme.colors.gray[2],
			color: theme.colors.gray[5],
		},
	};
});
