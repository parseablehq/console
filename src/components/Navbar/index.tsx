import type { NavbarProps as MantineNavbarProps } from '@mantine/core';
import { Navbar as MantineNavbar, NavLink ,Select} from '@mantine/core';
import { IconNews , IconCodeCircle2, IconDatabase ,IconCheck ,IconFileAlert, IconReload } from '@tabler/icons-react';
import { FC ,useEffect, useState} from 'react';
import { useNavbarStyles } from './styles';
import { useParams } from "react-router-dom";
import { useGetLogStreamList } from '@/hooks/useGetLogStreamList';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
const links = [
	{ icon: IconNews , label: 'Logs', pathname: "/logs" },
	{ icon: IconCodeCircle2, label: 'Query', pathname: "/query" },
];

type NavbarProps = Omit<MantineNavbarProps, 'children'>;

const Navbar: FC<NavbarProps> = (props) => {
	const navigate = useNavigate();
	const { data: streams, loading, error, getData } = useGetLogStreamList();
	const [activeStream, setActiveStream] = useState("");
	const [searchValue, setSearchValue] = useState("");
	const { classes } = useNavbarStyles();
	const { container ,linkBtnActive, linkBtn ,selectStreambtn} = classes;
	const { streamName } = useParams();

	useEffect(() => {
		if(streamName) {
			setActiveStream(streamName);
			setSearchValue(streamName);
		}
		else if (streams && !!streams.length) {
			navigate(`/${streams[0].name}/logs`);
		}
	}, [streams]);

	const handleChange = (value: string) => {
		setActiveStream(value);
		setSearchValue(value);
	};

	useEffect(() => {
		if(loading){
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
		if(streams && !!streams.length){
			notifications.update({
			  id: 'load-data',
			  color: 'green',
			  title: 'Streams was loaded',
			  message: 'Successfully Loaded!!',
			  icon: <IconCheck size="1rem" />,
			  autoClose: 1000,
			});
		  }
		  if(error){
			notifications.update({
			  id: 'load-data',
			  color: 'red',
			  title: 'Error Occured',
			  message: 'Error Occured while fetching streams',
			  icon: <IconFileAlert  size="1rem" />,
			  autoClose: 2000,
			});
		  }

		}, [streams , error , loading]);
	  

	return (
		<MantineNavbar {...props} withBorder={true} zIndex={1}>
			<MantineNavbar.Section grow className={container}>
				<NavLink label="Streams" icon={<IconDatabase size="1rem" stroke={1.5} />} component="a" sx={{ paddingLeft: 0 }} />
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
					sx={{ paddingBottom: "10px" }}
					className={selectStreambtn}
				/>
				{links.map((link) => {
					return (
						<NavLink
							label={link.label}
							icon={<link.icon size="1rem" stroke={1.5} />}
							sx={{ paddingLeft: 30 }}
							onClick={() => navigate(`/${activeStream}${link.pathname}`)}
							key={link.label}
							className={link.pathname ? window.location.pathname.includes(link.pathname) ? linkBtnActive : linkBtn : linkBtn}
							/>
					)
				})}
				{error && <div>{error}</div>}
				{error &&<NavLink label="Retry" icon={<IconReload  size="1rem" stroke={1.5} />} component="button" onClick={getData} sx={{ paddingLeft: 0 }} /> }
			</MantineNavbar.Section>

		</MantineNavbar>
	);
};

export default Navbar;