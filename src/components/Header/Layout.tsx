import { FC } from 'react';
import { Outlet } from 'react-router-dom';
import classes from './Header.module.css';

const HeaderLayout: FC<any> = () => {
	const { container } = classes;

	return (
		<header className={container}>
			<Outlet />
		</header>
	);
};

export default HeaderLayout;
