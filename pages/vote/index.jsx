import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import DefaultLayout from "@/layouts/default";
import { readDB, writeDB } from "@/components/database";
import { Card, CardHeader, CardBody, CardFooter, Divider, Button, Image } from "@nextui-org/react";

export default function IndexPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [canVote, setCanVote] = useState(false);
    const [remainingVotes, setRemainingVotes] = useState(0);

    const [data, setData] = useState([]);
    const [userdata, setUserData] = useState({});
    const [selectedItems, setSelectedItems] = useState([]);
    const [voteCount, setVoteCount] = useState(3); // 例として3回投票できると仮定

    useEffect(() => {
        const fetchData = async () => {
            const collectionData = await readDB("agenda");
            const userData = await readDB("user");
            if (userData) {
                setUserData(userData);
            }
            if (collectionData) {
                const agendaArray = Object.keys(collectionData).map(key => ({
                    id: key,
                    ...collectionData[key]
                }));
                setData(agendaArray);
                console.log('agendaArray', agendaArray);
            }
            if (session && session.user) {
                const userInfo = await readDB('user', session.userID);
                if (userInfo) {
                    setVoteCount(userInfo.vote.count);
                }
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const now = new Date();
        const day = now.getDate();
        if (day >= 3 || day < 1) {
            setCanVote(true);
        }
    }, []);

    function fechUser(userid) {
        return userdata[userid];
    }

    const handleSelectItem = (id) => {
        setSelectedItems(prevSelectedItems => {
            if (prevSelectedItems.includes(id)) {
                return prevSelectedItems.filter(item => item !== id);
            } else {
                if (prevSelectedItems.length < voteCount) {
                    return [...prevSelectedItems, id];
                } else {
                    alert(`You can only select up to ${voteCount} items.`);
                    return prevSelectedItems;
                }
            }
        });
    };

    const handleSubmit = async () => {
        if (selectedItems.length === voteCount) {
            const confirmation = window.confirm('この操作は取り消しできません。それでも大丈夫ですか？');
            if (confirmation) {
                try {
                    if (!session || !session.user) {
                        alert('ユーザー情報が取得できませんでした。再度ログインしてください。');
                        return;
                    }

                    const userInfo = await readDB('user', session.userID);
                    if (!userInfo) {
                        alert('ユーザー情報が取得できませんでした。再度ログインしてください。');
                        return;
                    }
                    const nowtime = new Date();
                    const formattedDate = `${nowtime.getFullYear()}${String(nowtime.getMonth() + 1).padStart(2, '0')}${String(nowtime.getDate()).padStart(2, '0')}`;


                    var userVoteList = userInfo.vote.voteList || {};

                    userVoteList[formattedDate] = selectedItems;

                    userInfo.vote.voteList = userVoteList;
                    userInfo.vote.count = 0;
                    await writeDB('user', session.userID, userInfo);

                    selectedItems.forEach(async (item) => {
                        const agendaItem = await readDB('agenda', item);
                        if (agendaItem) {
                            if (!Array.isArray(agendaItem.voteUser)) {
                                if (typeof agendaItem.voteUser === 'string') {
                                    const existingUser = agendaItem.voteUser;
                                    agendaItem.voteUser = [existingUser];
                                } else {
                                    agendaItem.voteUser = [];
                                }
                            }
                            if (!agendaItem.voteUser.includes(session.userID)) {
                                agendaItem.voteUser.push(session.userID);
                            }
                            console.log(agendaItem);
                            await writeDB('agenda', item, agendaItem);
                        }
                    });
                    alert('投票が正常に送信されました。');
                    location.reload();
                } catch (error) {
                    console.error('投票の送信中にエラーが発生しました:', error);
                    alert('投票の送信中にエラーが発生しました。');
                }
            }
        } else {
            alert(`Please select ${voteCount} items before submitting.`);
        }
    };

    if (!canVote) {
        return (
            <DefaultLayout>
                <p>現在は投票期間外です。</p>
            </DefaultLayout>
        );
    }
    if (voteCount === 0) {
        return (
            <DefaultLayout>
                <p>残りの投票回数がありません。</p>
                <p>投票ありがとうございました。次回の投票期間までお待ちください。</p>
            </DefaultLayout>
        );
    }

    const isWithinDateRange = (date) => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const startDate = new Date(currentYear, currentMonth - 1, 25); // 先月の25日
        const endDate = new Date(currentYear, currentMonth, 24); // 今月の24日

        return date >= startDate && date <= endDate;

    };
    const parseDateString = (dateString) => {
        const year = parseInt(dateString.substring(0, 4), 10);
        const month = parseInt(dateString.substring(4, 6), 10) - 1; // 月は0から始まるため1を引く
        const day = parseInt(dateString.substring(6, 8), 10);
        return new Date(year, month, day);
    };

    return (
        <DefaultLayout>
            <p>投票内容</p>
            <p>残りの投票回数: {voteCount}</p>
            <div className="flex flex-col md:flex-row md:flex-wrap gap-4">
                {data.map((item) => {
                    const user = fechUser(item.author);
                    const isSelected = selectedItems.includes(item.id);
                    const itemDate = parseDateString(item.time); // item.timeをDateオブジェクトに変換
                    if (!isWithinDateRange(itemDate)) {
                        return null; // 日付が範囲外の場合は表示しない
                    }
                    return (
                        <Card key={item.id} className={`max-w-[400px] md:w-1/2 ${isSelected ? 'border border-blue-500' : ''}`}>
                            <CardHeader className="flex gap-3">
                                <Image
                                    alt="user avatar"
                                    height={40}
                                    radius="sm"
                                    src={item.autherIcon}
                                    width={40}
                                />
                                <div className="flex flex-col">
                                    <p className="text-md">{item.title}</p>
                                    <p className="text-small text-default-500">{user?.userDisplayName}</p>
                                </div>
                            </CardHeader>
                            <Divider />
                            <CardBody>
                                <p>{item.content}</p>
                            </CardBody>
                            <Divider />
                            <CardFooter>
                                <Button onClick={() => handleSelectItem(item.id)}>
                                    {isSelected ? 'Deselect' : 'Select'}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
            <Button onClick={handleSubmit} className="mt-4">
                Submit Votes
            </Button>
        </DefaultLayout>
    );
}