import { Modal, Select, Stack, Text, TextInput } from '@mantine/core';
import classes from './styles/VizEditor.module.css';
import { Visualization } from './providers/DashboardsProvider';
import { useForm, UseFormReturnType } from '@mantine/form';
import { useCallback, useEffect, useState } from 'react';
import { visualizations } from './providers/DashboardsProvider';
import _ from 'lodash';
import { colors as defaultColors, DonutData, sanitizeDonutData } from './Charts';
import charts from './Charts';

const Viz = (props: {form: VizFormReturnType}) => {
    const {form} = props;
    const [chartData, setChartData] = useState<DonutData>([]);

    useEffect(() => {
        setChartData(sanitizeDonutData([data], form.values.colors))
    }, [data, form.values.colors])

    console.log(chartData)
	return (
		<Stack className={classes.vizContainer}>
			<Stack style={{ height: '50%' }}>
                <charts.Donut data={chartData}/>
            </Stack>
		</Stack>
	);
};

const vizLabelMap = {
    'donut-chart': 'Donut Chart',
    'pie-chart': 'Pie Chart',
    'table': 'Table',
    'line-chart': 'Line Chart',
    'bar-chart': 'Bar Chart',
}

const Config = (props: {form: VizFormReturnType, updateColors: (key: string, value: string) => void;}) => {
    const {form} = props;
    const dataKeys = _.take(_.keys(data), 5);
    const {colors} = form.values;

	return (
		<Stack className={classes.configContainer}>
			<Stack>
				<Select
					data={_.map(visualizations, (viz) => ({ label: _.get(vizLabelMap, viz, viz), value: viz }))}
					classNames={{ label: classes.fieldTitle }}
					label="Type"
					placeholder="Type"
					key="type"
					{...props.form.getInputProps('type')}
					style={{ width: '40%' }}
				/>
				<Stack gap={2}>
					<Text className={classes.fieldTitle}>Colors</Text>
					<Stack>
						{_.map(dataKeys, (dataKey) => {
							return (
								<Stack style={{flexDirection: 'row'}}>
									<TextInput value={dataKey} w="40%" disabled />
									<Select
										data={[{label: 'Default', value: ''}, ..._.map(defaultColors, (color) => ({ label: _.capitalize(color), value: color }))]}
										w="40%"
                                        defaultValue=''
                                        value={colors[dataKey] || ''}
                                        onChange={color => props.updateColors(dataKey, color || '')}
									/>
								</Stack>
							);
						})}
					</Stack>
				</Stack>
			</Stack>
		</Stack>
	);
};

const data = {
	info: 789,
	warn: 364,
	error: 456,
	debug: 123,
	critical: 78,
	notice: 567,
	alert: 231,
	emergency: 45,
	trace: 890,
	fatal: 132,
};

const useVizForm = (opts: Visualization) => {
	const form = useForm<Visualization>({
		mode: 'controlled',
		initialValues: opts,
		validate: {},
		validateInputOnChange: true,
		validateInputOnBlur: true,
	});

	const onChangeValue = useCallback((key: string, value: any) => {
		form.setFieldValue(key, value);
	}, []);

	const updateColors = useCallback(
		(key: string, value: string) => {
			form.setFieldValue('colors', {
				...form.values.colors,
				[key]: value,
			});
		},
		[form],
	);

	return { form, onChangeValue, updateColors };
};

type VizFormReturnType = UseFormReturnType<Visualization, (values: Visualization) => Visualization>;

const VizEditorModal = () => {
    const {form, updateColors} = useVizForm({type: 'donut-chart', colors: {}});
	return (
		<Modal
			opened={true}
			onClose={() => {}}
			centered
			size="80rem"
			title={'Edit Visualization'}
			styles={{ body: { padding: '0 1rem' }, header: { padding: '1rem', paddingBottom: '0' } }}
			classNames={{ title: classes.modalTitle }}>
			<Stack className={classes.container}>
				<Viz form={form}/>
				<Stack className={classes.divider} />
				<Config form={form} updateColors={updateColors}/>
			</Stack>
		</Modal>
	);
};

export default VizEditorModal;
