import React from 'react';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    useDisclosure,
} from '@chakra-ui/react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    cancelRef: React.RefObject<HTMLButtonElement>;
    title: string;
    body: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    confirmButtonColorScheme?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    cancelRef,
    title,
    body,
    confirmButtonText = "Delete",
    cancelButtonText = "Cancel",
    confirmButtonColorScheme = "red",
}) => {
    return (
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        {title}
                    </AlertDialogHeader>
                    <AlertDialogBody>
                        {body}
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                            {cancelButtonText}
                        </Button>
                        <Button
                            colorScheme={confirmButtonColorScheme}
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            ml={3}
                        >
                            {confirmButtonText}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
};

export default ConfirmDialog;

// example use

{/* <ConfirmDialog
isOpen={isOpen}
onClose={onClose}
onConfirm={handleUnmatchClick}
cancelRef={cancelRef}
title="Unmatch"
body="Are you sure you want to delete this match? You can't undo this action."
/> */}