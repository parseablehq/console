import logo from '@/assets/images/brand/logo.svg';
import Loading from '@/components/Loading';
import { useLoginForm } from '@/hooks/useLoginForm';
import { Box, Button, Divider, Image, PasswordInput, Text, TextInput, Transition } from '@mantine/core';
import { useDocumentTitle } from '@mantine/hooks';
import { FC } from 'react';
import classes from './Login.module.css';
import ForgotPassword from './ForgotPassword';
const baseURL = import.meta.env.VITE_PARSEABLE_URL ?? '/';

const Login: FC = () => {
	useDocumentTitle('Parseable | Login');

	const { getInputProps, isValid, loading, handleSubmit, error } = useLoginForm();

	const { container, formContainer, titleStyle, formInput, errorStyle, sideContainer } = classes;

	return (
		<Box
			style={{
				display: 'flex',
				flexDirection: 'row',
				width: '100vw',
				height: '100vh',
			}}>
			<Box className={sideContainer}>
				<Image w={250} src={logo} />
				<Box
					style={{
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
					}}>
					<Text size={'xl'}>Unified logs for all applications and infrastructure</Text>
					<Text color="dimmed" size={'md'}>
						Access, debug and analyze your log data here. Run sophisticated SQL queries on your log data, or look at
						tabular view.
					</Text>
				</Box>
			</Box>
			<Transition mounted transition="fade" duration={10000} timingFunction="ease">
				{(styles) => (
					<Box style={styles} className={container}>
						<form className={formContainer} onSubmit={handleSubmit()}>
							<Loading visible={loading} variant="oval" position="absolute" />
							<Text mt="md" className={titleStyle}>
								👋 Welcome back
							</Text>
							<Text mt="md" size={'sm'} color="dimmed">
								Please enter your credentials
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
							<Button type="submit" my="xl" variant="outline" w={'100%'} disabled={!isValid()}>
								Login
							</Button>

							<ForgotPassword />
							<Divider label=" Or  " labelPosition="center" my="xl" style={{ width: '100%' }} />
							<Button
								component="a"
								href={`${baseURL}api/v1/o/login?redirect=${window.location.origin}`}
								variant="outline">
								Login with OAuth
							</Button>
						</form>
					</Box>
				)}
			</Transition>
		</Box>
	);
};

export default Login;
