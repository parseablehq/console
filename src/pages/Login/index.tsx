import logo from '@/assets/images/brand/logo.svg';
import Loading from '@/components/Loading';
import { useLoginForm } from '@/hooks/useLoginForm';
import { Box, Button, Image, PasswordInput, Text, TextInput, Transition } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC } from 'react';
import ForgotPassword from './ForgotPassword';
import { useLoginStyles } from './styles';

const Login: FC = () => {
	useDocumentTitle('Parseable | Login');

	const { getInputProps, isValid, loading, handleSubmit, error } = useLoginForm();

	const { classes } = useLoginStyles();
	const { container, formContainer, titleStyle, descriptionStyle, formInput, loginBtnStyle, errorStyle } = classes;

	return (
		<Transition mounted transition="fade" duration={10000} timingFunction="ease">
			{(styles) => (
				<Box style={styles} className={container}>
					<form className={formContainer} onSubmit={handleSubmit()}>
						<Loading visible={loading} variant="oval" position="absolute" />
						<Image maw={230} mx="auto" src={logo} alt="Parseable Logo" />
						<Text mt="xl" className={titleStyle}>
							Welcome!
						</Text>
						<Text mt="xs" className={descriptionStyle}>
							Add your credentials to login
						</Text>

						{error && (
							<Text mt="xs" className={errorStyle}>
								{error}
							</Text>
						)}
						<TextInput
							mt="xl"
							className={formInput}
							placeholder="J.Doe"
							label="Username"
							withAsterisk
							{...getInputProps('username')}
						/>
						<PasswordInput
							mt="xl"
							className={formInput}
							placeholder="**********"
							label="Password"
							withAsterisk
							{...getInputProps('password')}
						/>
						<Button type="submit" my="xl" className={loginBtnStyle} disabled={!isValid()}>
							Login
						</Button>
						<ForgotPassword />
					</form>
				</Box>
			)}
		</Transition>
	);
};

export default Login;
