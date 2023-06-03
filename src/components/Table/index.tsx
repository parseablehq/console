import type { ComponentPropsWithRef, FC } from 'react';

type ThProps = {
	text: string;
	onSort?: () => void;
};

export const Th: FC<ThProps> = (props) => {
	const { text } = props;

	return (
		<th>
			<span>{text}</span>
		</th>
	);
};

type TheadProps = ComponentPropsWithRef<'thead'>;

export const Thead: FC<TheadProps> = (props) => {
	const { children, ...restProps } = props;

	return (
		<thead {...restProps}>
			<tr>{children}</tr>
		</thead>
	);
};

type TbodyProps = ComponentPropsWithRef<'tbody'>;

export const Tbody: FC<TbodyProps> = (props) => {
	const { children, ...restProps } = props;

	return <tbody {...restProps}>{children}</tbody>;
};
