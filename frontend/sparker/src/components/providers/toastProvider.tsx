import React, { createContext, ReactNode, useContext } from "react";
import {
	useToast,
	ToastPosition,
	UseToastOptions,
	ChakraProvider,
} from "@chakra-ui/react";

interface ToastProviderProps {
	children: ReactNode;
}

interface ShowToastOptions extends Omit<UseToastOptions, "position"> {
	position?: ToastPosition;
}

const ToastContext = createContext<
	((options: ShowToastOptions) => void) | null
>(null);

export const ToastProvider = ({ children }: ToastProviderProps) => {
	const toast = useToast();

	const showToast = ({
		title,
		description,
		status = "info",
		duration = 5000,
		isClosable = true,
		position = 'top'
	}: ShowToastOptions) => {
		toast({
			title,
			description,
			status,
			duration,
			isClosable,
			position,
		});
	};

	return (
		<ToastContext.Provider value={showToast}>
			{children}
		</ToastContext.Provider>
	);
};

export const useToastNotification = () => {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error(
			"useToastNotification must be used within a ToastProvider"
		);
	}
	return context;
};
