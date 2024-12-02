import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { readDB, writeDB } from "@/components/database"; // writeDB をインポート
import DefaultLayout from "@/layouts/default";
import { Input, Select, SelectItem, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
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
    const [invitations, setInvitation] = useState<any>();
    const { isOpen: isOpen1, onOpen: onOpen1, onOpenChange: onOpenChange1 } = useDisclosure();
    const { isOpen: isOpen2, onOpen: onOpen2, onOpenChange: onOpenChange2 } = useDisclosure();
    const [markdown, setMarkdown] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [affiliation, setAffiliation] = useState<string>("");
    const [inviter, setInviter] = useState<string>("");
    const [classification, setClassification] = useState<string>("");

    const selectItems = [
        { key: "company", label: "企業" },
        { key: "social-sector", label: "ソーシャルセクター" },
        { key: "individual", label: "個人" },
        { key: "other", label: "その他" }
    ];

    useEffect(() => {
        if (code) {
            validateCode(code as string);
        }

    }, [inviteList]);

    useEffect(() => {
        const fetchData = async () => {
            const invi = await readDB('invite')
            setInvitation(invi);
        };
        fetchData();
    }, [code]);

    useEffect(() => {
        if (invitations) {
            setInviteList(Object.keys(invitations));
        }

    }, [invitations]);

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
            if (invitations[code].uses >= invitations[code].max_uses) {
                setIsValidCode(false);
            } else {
                setIsValidCode(true);
            };
        }
        else {
            setIsValidCode(false);
        }
    };

    const handleRegister = async () => {
        try {
            if (!name && !email && !affiliation && !inviter && !classification) {
                alert('全ての項目を入力してください');
                return;
            } else {
                await writeDB('invitation', code, { "name": name, "email": email, "affiliation": affiliation, "inviter": inviter, "classification": classification, "code": code, "timestamp": new Date().toISOString() });
                alert('登録が完了しました。\nメールボックスを確認してください');

                // メール送信APIを呼び出す
                const response = await fetch('/api/sendEmail', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, name, code }),
                });



                if (response.ok) {
                    console.log('Email sent successfully');
                    window.location.href = '/'; // リダイレクト

                } else {
                    console.error('Error sending email');
                }
            }
        } catch (error) {
            console.error('Error registering user:', error);
            alert('登録に失敗しました');
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
                <Button onPress={onOpen1}>招待を受け取る</Button>

                <Modal
                    size='5xl'
                    backdrop="blur"
                    isOpen={isOpen1}
                    onOpenChange={onOpenChange1}
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
                                        <>
                                            <Spinner label="利用規約を読み込んでいます...(10秒ほどかかる場合があります)" size='lg' color="primary" />
                                        </>
                                    )}
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="danger" variant="light" onPress={onClose}>
                                        閉じる
                                    </Button>
                                    {markdown ? (
                                        <Button color="primary" onPress={() => { onClose(); onOpen2(); }}>
                                            同意
                                        </Button>
                                    ) : (
                                        <Button color="primary" isDisabled onPress={() => { onClose(); onOpen2(); }}>
                                            同意
                                        </Button>
                                    )}

                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>

                <Modal
                    size='5xl'
                    backdrop="blur"
                    isOpen={isOpen2}
                    onOpenChange={onOpenChange2}
                    scrollBehavior='inside'
                    classNames={{
                        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20"
                    }}
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">登録フォーム</ModalHeader>
                                <ModalBody>
                                    <Input
                                        label="名前"
                                        placeholder="氏名(本名)を入力して下さい"
                                        variant="bordered"
                                        isRequired
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                    <Input
                                        label="メールアドレス"
                                        type='email'
                                        placeholder="メールアドレスを入力して下さい"
                                        variant="bordered"
                                        isRequired
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <Input
                                        label="所属"
                                        placeholder="なし場合は「なし」と書いてください"
                                        variant="bordered"
                                        isRequired
                                        value={affiliation}
                                        onChange={(e) => setAffiliation(e.target.value)}
                                    />
                                    <Input
                                        label="招待者"
                                        placeholder="招待者の名前を入力してください"
                                        variant="bordered"
                                        isRequired
                                        value={inviter}
                                        onChange={(e) => setInviter(e.target.value)}

                                    />
                                    <Select
                                        items={selectItems}
                                        label="どの区分で参加しますか？"
                                        placeholder="区分を選択してください"
                                        className="max-w-xs"
                                        isRequired
                                        onChange={(e) => setClassification(e.target.value)}
                                    >
                                        {(selectItems) => <SelectItem key={selectItems.label}>{selectItems.label}</SelectItem>}
                                    </Select>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="danger" variant="light" onPress={onClose}>
                                        閉じる
                                    </Button>
                                    <Button color="primary" onPress={async () => { await handleRegister(); onClose(); }}>
                                        登録
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