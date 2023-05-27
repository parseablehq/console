import { scrollTo } from '@/utils';
import { Affix, Button, Transition } from '@mantine/core';
import { useWindowScroll } from '@mantine/hooks';
import { IconArrowUp } from '@tabler/icons-react';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop: FC = () => {
	const [scroll] = useWindowScroll();
	const location = useLocation();

	useEffect(() => {
		scrollTo();
	}, [location]);

	return (
		<Affix position={{ bottom: 20, right: 20 }} withinPortal>
			<Transition transition="slide-up" mounted={scroll.y > 20}>
				{(transitionStyles) => (
					<Button
						leftIcon={<IconArrowUp size={16} />}
						style={transitionStyles}
						onClick={() => scrollTo({ behavior: 'smooth' })}>
						Scroll to top
					</Button>
				)}
			</Transition>
		</Affix>
	);
};

export default ScrollToTop;
