import { px, Stack, Text } from "@mantine/core"
import classes from './styles/tile.module.css'
import { IconDotsVertical } from "@tabler/icons-react";
import charts, { getVizComponent } from "./Charts";
import handleCapture from "@/utils/exportImage";

const TileConatiner = () => {
    const View = getVizComponent("donut-chart")
    return (
        <Stack className={classes.tileContainer}>
            <View/>
        </Stack>
    )
}

const Tile = () => {
	return (
		<Stack h="100%" gap={0}>
			<Stack className={classes.tileHeader} gap={0}>
				<Stack gap={0} >
					<Text onClick={handleCapture} className={classes.tileTitle}>Error status</Text>
					<Text className={classes.tileDescription}>Description for the tile</Text>
				</Stack>
                <IconDotsVertical size={px('1rem')} stroke={1.5} />
			</Stack>
            <TileConatiner/>
		</Stack>
	);
}

export default Tile;