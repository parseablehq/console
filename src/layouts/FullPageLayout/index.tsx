import { heights } from '@/components/Mantine/sizing';
import { Box, Center, Image, ImageProps, Text, Title } from '@mantine/core';
import type { FC, ReactNode } from 'react';
import classes from './FullPageLayout.module.css';
import bugError from '@/assets/images/bug_error.webp';

type FullPageLayoutProps = {
	children?: ReactNode;
};

const Illustration: FC<ImageProps> = (props) => {
	return <Image src={bugError} {...props} alt="Bug" mx="auto" />;
};

const FullPageLayout: FC<FullPageLayoutProps> = (props) => {
	const { children } = props;
	return (
		<>
			<Box className={classes.desktop}>
				<Box
					style={{
						flexGrow: 1,
						minWidth: 0,
						height: heights.full,
						display: 'flex',
						alignItems: 'stretch',
					}}>
					{children}
				</Box>
			</Box>
			<Box className={classes.mobile}>
				<Center style={{ height: '100vh', width: '100vw' }}>
					<Box>
						<Illustration maw={400} />
						<Title ta={"center"}>Oops</Title>
						<Text color="dimmed" size="lg" ta="center">
							Cannot display this page on mobile devices
						</Text>
					</Box>
				</Center>
			</Box>
		</>
	);
};

export default FullPageLayout;
