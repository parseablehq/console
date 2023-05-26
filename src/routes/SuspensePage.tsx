import Loading from '@/components/Loading';
import { Center } from '@mantine/core';
import type { FC, ReactNode } from 'react';
import { Suspense } from 'react';

interface SuspensePageProps {
	children?: ReactNode;
}

const SuspensePage: FC<SuspensePageProps> = ({ children }) => {
	return (
		<Suspense
			fallback={
				<Center style={{ flex: 1, position: 'relative' }}>
					<Loading visible position="absolute" variant="bars" />
				</Center>
			}>
			{children}
		</Suspense>
	);
};

export default SuspensePage;
