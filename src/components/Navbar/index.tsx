import type { NavbarProps as MantineNavbarProps } from '@mantine/core';
import { Navbar as MantineNavbar, NavLink, Select } from '@mantine/core';
import { IconNews, IconCodeCircle2, IconCheck, IconFileAlert, IconReload, IconHelpCircle, IconLogout, IconUser } from '@tabler/icons-react';
import { FC, useEffect, useState } from 'react';
import { useNavbarStyles } from './styles';
import { useParams } from "react-router-dom";
import { useGetLogStreamList } from '@/hooks/useGetLogStreamList';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_FIXED_DURATIONS, useHeaderContext } from '@/layouts/MainLayout/Context';
import useMountedState from '@/hooks/useMountedState';
import dayjs from 'dayjs';

const links = [
	{ icon: IconNews, label: 'Logs', pathname: "/logs" },
	{ icon: IconCodeCircle2, label: 'Query', pathname: "/query" },
];

type NavbarProps = Omit<MantineNavbarProps, 'children'>;

const Navbar: FC<NavbarProps> = (props) => {
	const navigate = useNavigate();
	const { data: streams, loading, error, getData } = useGetLogStreamList();
	const [activeStream, setActiveStream] = useState("");
	const [searchValue, setSearchValue] = useState("");
	const { classes } = useNavbarStyles();
	const { container, linkBtnActive, linkBtn, selectStreambtn ,streamsBtn ,lowerContainer} = classes;
	const { streamName } = useParams();
	const {
		state: { subNavbarTogle },
	} = useHeaderContext();
	const [isSubNavbarOpen, setIsSubNavbarOpen] = useMountedState(false);
	useEffect(() => {
		const listener = subNavbarTogle.subscribe(setIsSubNavbarOpen);
		return () => {
			listener();
		};
	}, []);


	const { state: { subLogQuery, subLogSelectedTimeRange, subLogSearch, subRefreshInterval } } = useHeaderContext();

	useEffect(() => {
		if (streamName) {
			setActiveStream(streamName);
			setSearchValue(streamName);
			if (streamName !== subLogQuery.get().streamName) {
				const now = dayjs();
				subLogQuery.set((state) => {
					state.streamName = streamName || '';
					state.startTime = now.subtract(DEFAULT_FIXED_DURATIONS.milliseconds, 'milliseconds').toDate();
					state.endTime = now.toDate();
				});
				subLogSelectedTimeRange.set(DEFAULT_FIXED_DURATIONS.name);
			}
		}
		else if (streams && Boolean(streams.length)) {
			navigate(`/${streams[0].name}/logs`);
		}
	}, [streams]);

	const handleChange = (value: string) => {
		setActiveStream(value);
		setSearchValue(value);
		navigate(`/${value}/logs`);
		if (value !== subLogQuery.get().streamName) {
			const now = dayjs();
			subLogQuery.set((state) => {
				state.streamName = value || '';
				state.startTime = now.subtract(DEFAULT_FIXED_DURATIONS.milliseconds, 'milliseconds').toDate();
				state.endTime = now.toDate();
			});
			subLogSelectedTimeRange.set(DEFAULT_FIXED_DURATIONS.name);
			subLogSearch.set((state) => {
				state.search = '',
					state.filters = {}
			});
			subRefreshInterval.set(null);
		}
	};

	useEffect(() => {
		if (loading) {
			notifications.show({
				id: 'load-data',
				loading: true,
				color: '#545BEB',
				title: 'Fetching Streams',
				message: 'Streams will be loaded.',
				autoClose: false,
				withCloseButton: false,
			})
		};
		if (streams && Boolean(streams.length)) {
			notifications.update({
				id: 'load-data',
				color: 'green',
				title: 'Streams was loaded',
				message: 'Successfully Loaded!!',
				icon: <IconCheck size="1rem" />,
				autoClose: 1000,
			});
		}
		if (error) {
			notifications.update({
				id: 'load-data',
				color: 'red',
				title: 'Error Occured',
				message: 'Error Occured while fetching streams',
				icon: <IconFileAlert size="1rem" />,
				autoClose: 2000,
			});
		}

	}, [streams, error, loading]);


	return (
		<MantineNavbar {...props} withBorder zIndex={1} hiddenBreakpoint="xl" hidden={isSubNavbarOpen}>
			<MantineNavbar.Section grow className={container}>
				<NavLink label="Streams" icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
					<path d="M19 5C19 7.21 14.97 9 10 9C5.03 9 1 7.21 1 5M19 5C19 2.79 14.97 1 10 1C5.03 1 1 2.79 1 5M19 5V10M1 5V10M19 10C19 12.21 14.97 14 10 14C5.03 14 1 12.21 1 10M19 10V15C19 17.21 14.97 19 10 19C5.03 19 1 17.21 1 15V10" stroke="#211F1F" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
				} className={streamsBtn}   />
				<Select
					placeholder="Pick one"
					onChange={(value) => handleChange(value || "")}
					nothingFound="No options"
					value={activeStream}
					searchValue={searchValue}
					onSearchChange={(value) => setSearchValue(value)}
					onDropdownClose={() => setSearchValue(activeStream)}
					onDropdownOpen={() => setSearchValue("")}
					data={streams?.map((stream) => ({ value: stream.name, label: stream.name })) ?? []}
					searchable
					required
					className={selectStreambtn}
				/>
				{links.map((link) => {
					return (
						<NavLink
							label={link.label}
							icon={<link.icon size="1rem" stroke={1.5} />}
							sx={{ paddingLeft: 53 }}
							onClick={() => navigate(`/${activeStream}${link.pathname}`)}
							key={link.label}
							className={link.pathname ? window.location.pathname.includes(link.pathname) ? linkBtnActive : linkBtn : linkBtn}
						/>
					)
				})}
				{error && <div>{error}</div>}
				{error && <NavLink label="Retry" icon={<IconReload size="1rem" stroke={1.5} />} component="button" onClick={getData} sx={{ paddingLeft: 0 }} />}
			</MantineNavbar.Section>
			<MantineNavbar.Section className={lowerContainer}>
				<NavLink label="Help" icon={<IconHelpCircle size="1rem" stroke={1.5} />} component="a"  />
				<NavLink label="admin" icon={<IconUser size="1rem" stroke={1.5} />} component="a"  />
				<NavLink label="Log out" icon={<IconLogout size="1rem" stroke={1.5} />} component="a"  />
			</MantineNavbar.Section>
		</MantineNavbar>
	);
};

export default Navbar;