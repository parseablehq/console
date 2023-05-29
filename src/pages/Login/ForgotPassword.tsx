import logo from '@/assets/images/brand/logo.svg';
import { Box, Divider, Image, Space, Text, UnstyledButton, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { FC, Fragment } from 'react';
import { useForgetPassStyles } from './styles';

const steps = [
	{
		title: 'Log into your console',
		description: 'Small description of the step above to be added',
	},
	{
		title: 'Update Password',
		description: 'Small description of the step above to be added',
	},
	{
		title: 'Reset the environment',
		description: 'Small description of the step above to be added',
	},
];

const ForgotPassword: FC = () => {
	const [opened, { open, close }] = useDisclosure(false);

	const { classes } = useForgetPassStyles();

	const { forgetPassBtnText, titleStyle, descriptionStyle } = classes;

	return (
		<Fragment>
			<UnstyledButton onClick={open}>
				<Text className={forgetPassBtnText}>Forgot password?</Text>
			</UnstyledButton>
			<Modal opened={opened} onClose={close} withCloseButton={false} size="sm" centered>
				<Image maw={130} mx="auto" src={logo} alt="Parseable Logo" />
				<Space h="xl" />
				<Text className={titleStyle}>How to reset your password</Text>
				<Space h="sm" />
				<Text className={descriptionStyle}>Follow the steps below to reset your password</Text>
				<Space h="xl" />
				{steps.map((step, index) => {
					const number = index + 1;

					return <Step key={step.title} isLast={number >= steps.length} number={index + 1} {...step} />;
				})}
				<Space h="xl" />
			</Modal>
		</Fragment>
	);
};

type StepProps = {
	isLast: boolean;
	number: number;
	title: string;
	description: string;
};

const Step: FC<StepProps> = (props) => {
	const { number, title, description, isLast } = props;
	const { classes } = useForgetPassStyles();

	const { stepContainer, stepNumberContainer, stepNumber, stepVerticalLine, stepTitle, stepDescription } = classes;

	return (
		<Box className={stepContainer}>
			<Box className={stepNumberContainer}>
				<Box className={stepNumber}>{number}</Box>
				{!isLast && <span className={stepVerticalLine} />}
			</Box>
			<Box>
				<Text className={stepTitle}>{title}</Text>
				<Text className={stepDescription}>{description}</Text>
				{!isLast && <Divider my="sm" />}
			</Box>
		</Box>
	);
};

export default ForgotPassword;
