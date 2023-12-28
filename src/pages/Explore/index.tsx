import { FC } from 'react';
import classes from './Explore.module.css';
import { Box } from '@mantine/core';
import ExploreHeader from './ExploreHeader';
import SearchSection from './SearchSection';

const Explore: FC = () => {
	return (
		<Box className={classes.container}>
			<ExploreHeader />
			<SearchSection />
		</Box>
	);
};

export default Explore;
