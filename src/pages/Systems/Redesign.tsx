import { Pill, Divider, Stack, Text, ThemeIcon } from "@mantine/core"
import classes from './styles/Systems.module.css'
import { IconActivity } from "@tabler/icons-react";
import { AreaChart } from "@mantine/charts";

const LeftSection = () => {
	return (
		<Stack className={classes.sectionContainerr}>
			<Stack style={{padding: '2rem 2rem 1rem 2rem', flexDirection: 'row', alignItems: 'center'}} gap={8}>
                <Text className={classes.leftSectionTitle}>Cluster Machines</Text>
                <Text className={classes.totalMachines}>(3)</Text>
            </Stack>
            <ServerList/>
		</Stack>
	);
};

const ServerItem1 = () => {
	return (
		<Stack className={classes.serverItem} gap={8}>
			<Stack style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
				<Pill className={classes.serverTypePill}>Querier</Pill>
				<ThemeIcon className={classes.liveIcon} variant="filled" size={24}>
					<IconActivity />
				</ThemeIcon>
			</Stack>
			<Stack>
				<Text className={classes.serverDomain}>http://my-querier.in:8000</Text>
			</Stack>
		</Stack>
	);
};

const ServerItem2 = () => {
	return (
		<Stack className={`${classes.serverItem} ${classes.serverItemActive}`} gap={12}>
			<Stack style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
				<Pill className={classes.serverTypePill}>Ingestor</Pill>
				<ThemeIcon className={classes.liveIcon} variant="filled" size={24}>
					<IconActivity />
				</ThemeIcon>
			</Stack>
			<Stack>
				<Text className={classes.serverDomain}>http://my-ingestor.in:8768</Text>
			</Stack>
		</Stack>
	);
};

const ServerItem3 = () => {
	return (
		<Stack className={classes.serverItem} gap={12}>
			<Stack style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
				<Pill className={classes.serverTypePill}>Ingestor</Pill>
				<ThemeIcon className={classes.serverDownIcon} variant="filled" size={24}>
					<IconActivity />
				</ThemeIcon>
			</Stack>
			<Stack>
				<Text className={classes.serverDomain}>http://my-querier.in:678978</Text>
			</Stack>
		</Stack>
	);
};

const ServerList = () => {
    return (
			<Stack gap={0}>
				<ServerItem1/>
				<ServerItem2/>
				<ServerItem3/>
			</Stack>
		);    
}

const BigNumber = (props) => {
	return (
		<Stack className={classes.bigNoContainer}> 
			<Text className={classes.bigNoTitle}>{props.title}</Text>
			<Text className={classes.bigNoText}>{props.value}</Text>
		</Stack>
	)
}

export const data = [
	{
	  date: 'Mar 22',
	  Apples: 2890,
	  Oranges: 2338,
	  Tomatoes: 2452,
	},
	{
	  date: 'Mar 23',
	  Apples: 2756,
	  Oranges: 2103,
	  Tomatoes: 2402,
	},
	{
	  date: 'Mar 24',
	  Apples: 3322,
	  Oranges: 986,
	  Tomatoes: 1821,
	},
	{
	  date: 'Mar 25',
	  Apples: 3470,
	  Oranges: 2108,
	  Tomatoes: 2809,
	},
	{
	  date: 'Mar 26',
	  Apples: 3129,
	  Oranges: 1726,
	  Tomatoes: 2290,
	},
  ];

const Graph = () => {
	return (
		<Stack className={classes.graphContainer}>
			<AreaChart
				h={180}
				data={data}
				dataKey="date"
				series={[
					{ name: 'Apples', color: 'indigo.6' },
				]}
				curveType="linear"
			/>
		</Stack>
	);
}

const MemoryUsageSection = () => {
	return (
		<Stack className={classes.graphSectionContainer}> 
			<Stack className={classes.graphTitleContaier}>
				<Text className={classes.graphTitle}>Memory Usage</Text>
				<Stack className={classes.graphTitleFiller}/>
			</Stack>
			<Graph/>
		</Stack>
	)
}

const BigNoSection = () => {
	return (
		<Stack className={classes.bigNoSection}>
			<BigNumber title="Events Ingested" value="0.5k" />
			<BigNumber title="S3 Size" value="3.4KiB" />
			<BigNumber title="Staging Size" value="78.9KiB" />
			<BigNumber title="Staging Files" value="2.4K" />
		</Stack>
	);
};

const RightSection = () => {
	return (
		<Stack className={classes.sectionContainerr} style={{ padding: '2rem', gap: '2rem'}}>
			<BigNoSection />
			<MemoryUsageSection/>
			<MemoryUsageSection/>
		</Stack>
	);
};

const Redesign = () => {
	return (
		<Stack className={classes.container} w="100%">
			<Stack style={{ flexDirection: 'row', width: '100%' }} gap={0}>
				<Stack style={{ width: '30%' }}>
					<LeftSection />
				</Stack>
                <Divider orientation="vertical"/>
				<Stack style={{ width: '70%' }}>
					<RightSection />
				</Stack>
			</Stack>
		</Stack>
	);
}

export default Redesign;