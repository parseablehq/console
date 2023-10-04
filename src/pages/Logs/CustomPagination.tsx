import { useGetQueryCount } from '@/hooks/useGetQueryCount';
import useMountedState from '@/hooks/useMountedState';
import { useHeaderContext } from '@/layouts/MainLayout/Context';
import { Group, Pagination, Tooltip } from '@mantine/core';

import dayjs from 'dayjs';
import { FC, useEffect } from 'react';

type PaginationProps = {
	currentStartTime: Date | null;
	setCurrentStartTime: (date: Date | null) => void;
	pageLogData: any;
	goToPage: (page: number, limit: number) => void;
	setCurrentCount: (currentCount: number) => void;
};
const CustomPagination: FC<PaginationProps> = (props) => {
	const { currentStartTime, pageLogData, goToPage, setCurrentStartTime, setCurrentCount } = props;
	return (
		<>
			<Pagination.Root
				total={pageLogData?.totalPages || 1}
				value={pageLogData?.page || 1}
				onChange={(page) => {
					goToPage(page, pageLogData?.limit || 1);
				}}>
				<Group spacing={5} position="center">
					<Pagination.Previous />
					<Pagination.Items />
					<Pagination.Next />
				</Group>
			</Pagination.Root>
		</>
	);
};

export default CustomPagination;
