import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { readDB } from "@/components/database";
import DefaultLayout from "@/layouts/default";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import ReactMarkdown from "react-markdown";
import styled from 'styled-components';

const StyledMarkdown = styled(ReactMarkdown)`
  color: ${({ theme }) => theme.colors.text};
  // 他のスタイルもここに追加できます
`;

const JoinPage: React.FC = () => {
    const router = useRouter();
    const { code } = router.query;
    const [isValidCode, setIsValidCode] = useState<boolean | null>(null);
    const [inviteList, setInviteList] = useState<string[]>([]);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [markdown, setMarkdown] = useState<string>("");

    useEffect(() => {
        if (code) {
            validateCode(code as string);
        }

    }, [inviteList]);

    useEffect(() => {
        const fetchData = async () => {
            const invitations = await readDB('invite');
            if (invitations) setInviteList(Object.keys(invitations));
        };
        fetchData();
    }, [code]);

    useEffect(() => {
        const fetchMarkdown = async () => {
            if (isValidCode) {
                try {
                    const response = await fetch(`/api/getMarkdown?pageId=702f9444165b4a62aa5359dc49b83669`); // ここに適切なページIDを入力してください
                    const data = await response.json();
                    if (response.ok) {
                        setMarkdown(data.markdown);
                    } else {
                        console.error('Error fetching markdown:', data.error);
                    }
                } catch (error) {
                    console.error('Error fetching markdown:', error);
                }
            }
        };
        fetchMarkdown();

    }, [isValidCode]);

    const validateCode = async (code: string) => {
        if (inviteList.includes(code)) {
            setIsValidCode(true);
        } else {
            setIsValidCode(false);
        }
    };

    if (isValidCode === null) {
        return <div>招待コードがありません</div>;
    }

    if (!isValidCode) {
        return <div>招待コードが無効です</div>;
    }

    return (
        <DefaultLayout>
            <>

                <Button onPress={onOpen}>Open Modal</Button>
                <Modal
                    size='5xl'
                    backdrop="blur"
                    isOpen={isOpen}
                    onOpenChange={onOpenChange}
                    scrollBehavior='inside'
                    classNames={{
                        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20"
                    }}
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">最後まで読んで同意してください</ModalHeader>
                                <ModalBody>
                                    {markdown ? (
                                        <StyledMarkdown className={"prose dark:prose-dark"}>{markdown}</StyledMarkdown>
                                    ) : (
                                        <p>Loading...</p>
                                    )}
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="danger" variant="light" onPress={onClose}>
                                        閉じる
                                    </Button>
                                    <Button color="primary" onPress={onClose}>
                                        同意
                                    </Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </>
        </DefaultLayout>
    );
};

export default JoinPage;