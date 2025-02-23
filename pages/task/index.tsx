import DefaultLayout from "@/layouts/default";
import { useState, useEffect, use } from 'react';
import { readDB, writeDB, deleteDB } from "@/components/database";
import { Card, CardBody, CardHeader, Input, Button, Checkbox, DatePicker, Tabs, Tab, Accordion, AccordionItem, Avatar, AvatarGroup, Textarea, Select, SelectItem } from "@heroui/react";
import { DateValue, parseDate, getLocalTimeZone } from "@internationalized/date";
import { useSession } from 'next-auth/react';
import { Client } from "@notionhq/client";
import firebase from 'firebase/app';
import 'firebase/firestore';
import { Main } from "next/document";

interface Task {
    id: string;
    name: string;
    content: string;
    workingTime: string;
    limitDay: string;
    clientID: Array<string>;
    clientIcon: Array<string>;
    orderDay: string;
    supplierID: string;
    supplierIcon: string;
    workingStatus: string;
    isReport: boolean;
    limitReportDay: string;
    reportDay: string;
    rank: number;
    category: string;
    subCategory: string;
    isTokenSent: boolean;
}
interface SessionData {
    userID: string;
    user: {
        name: string;
        image: string;
    };
}


const TaskManager = () => {
    const { data: session } = useSession();
    const sessionData = session as SessionData | any;
    const [tasks, setTasks] = useState<any[]>([]);
    const [user, setUser] = useState<any>({});
    const [category, setCategory] = useState<any>({});
    const [mainCategory, setMainCategory] = useState<any[]>([]);
    const [subCategory, setSubCategory] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
    const [otherMainCategory, setOtherMainCategory] = useState<string>("");
    const [otherSubCategory, setOtherSubCategory] = useState<string>("");


    useEffect(() => {
        const fetchTasks = async () => {
            const tasksData = await readDB("tasks");
            const userInfo = await readDB("user");
            const categoryData = await readDB("categorys");
            if (tasksData) {
                setTasks(Object.values(tasksData));
            }
            if (userInfo) {
                setUser(userInfo);
            }
            if (categoryData) {
                setCategory(Object(categoryData));
                setMainCategory(Object.keys(categoryData));
            }
        };
        fetchTasks();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            if (selectedCategory === "その他") {
                setSubCategory([]);
            } else {
                setSubCategory(category[selectedCategory]["subs"]);
            }
        }
    }, [selectedCategory]);



    const [task, setTask] = useState({
        id: '',
        name: '',
        content: '',
        workingTime: '',
        limitDay: parseDate(new Date().toISOString().split('T')[0]) as DateValue | null,
        clientID: [],
        isAnnounce: false,
        isTokenSent: false,
        clientIcon: [],
        orderDay: '',
        supplierID: "",
        supplierIcon: "",
        workingStatus: '',
        isReport: false,
        limitReportDay: null as DateValue | null,
        reportDay: null as DateValue | null,
        rank: 1,
        category: '',
        subCategory: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setTask(prevTask => ({ ...prevTask, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleDateChange = (name: string, date: DateValue | null) => {
        setTask(prevTask => ({ ...prevTask, [name]: date }));
    };

    const handleRankChange = (rank: number) => {
        setTask(prevTask => ({ ...prevTask, rank }));
    };

    const handleSubmit = async () => {
        if (!task.name || !task.content || !task.workingTime || !task.limitDay || (task.isReport && !task.reportDay) || !selectedCategory || !selectedSubCategory) {
            alert("すべての必須項目を入力してください。");
            return;
        }

        var MainCategory = selectedCategory;
        var SubCategory = selectedSubCategory;

        if (selectedCategory === "その他") {
            MainCategory = otherMainCategory;
            await writeDB("categorys", MainCategory, { subs: [] });
        }
        if (selectedSubCategory === "その他") {
            SubCategory = otherSubCategory;
            await writeDB("categorys", MainCategory, { subs: [...subCategory, SubCategory] });

        }

        const formattedTask = {
            ...task,
            id: task.id || Math.random().toString(36).slice(-10),
            day: new Date().toISOString().split('T')[0],
            workingStatus: '受注待ち',
            supplierID: sessionData.userID,
            supplierIcon: sessionData.user.image,
            limitDay: task.limitDay ? task.limitDay.toString() : '',
            limitReportDay: task.limitReportDay ? task.limitReportDay.toString() : '',
            reportDay: task.reportDay ? task.reportDay.toString() : '',
            content: task.content.replace(/\n/g, '\\n'), // 改行をエスケープ
            category: MainCategory,
            subCategory: SubCategory,

        };
        await writeDB("tasks", formattedTask.id, formattedTask);
        // フォームをリセットするなどの処理
        location.reload();
    };

    const [myTasksClient, setMyTasksClient] = useState<any[]>([]);
    const [myTasksSupplier, setMyTasksSupplier] = useState<any[]>([]);




    useEffect(() => {
        const fetchMyTasks = async () => {
            const tasksData = await readDB("tasks");
            const userInfo = await readDB("user");
            if (tasksData) {
                // 自分のタスクをフィルタリングするロジックを追加
                setMyTasksClient(Object.values(tasksData).filter(task => task.clientID.includes(sessionData.userID)));
                setMyTasksSupplier(Object.values(tasksData).filter(task => task.supplierID === sessionData.userID));
            }
            if (userInfo) {
                setUser(userInfo);
            }
        };
        fetchMyTasks();
    }, []);




    const showTask = (tasks: Task[], user: any, mode: string) => {

        const getUserName = (id: string) => {
            if (!user[id]) {
                setTimeout(() => {
                    getUserName(id);
                }, 200); // 1秒待ってから再度実行
                return "";
            }
            return user[id].userDisplayName;
        };

        const getColorByStatus = (status: string) => {
            switch (status) {
                case "受注待ち":
                    return "default";
                case "作業中":
                    return "primary";
                case "完了":
                    return "success";
                case "遅延":
                    return "warning";
                case "キャンセル":
                    return "danger";
            }
        };

        const handleTaskOrder = async (taskID: string) => {
            const taskData = await readDB("tasks", taskID);
            const task = taskData as Task;

            console.log(task);

            if (task.workingStatus === "受注待ち") {
                task.workingStatus = "作業中";
                task.clientID = [sessionData.userID];
                task.clientIcon = [sessionData.user.image || ""];
                task.orderDay = new Date().toISOString().split('T')[0];
                await writeDB("tasks", taskID, task);
                location.reload();
            } else if (task.workingStatus === "作業中" && task.clientID.length > 0) {
                if (confirm("すでに他のユーザーが受注しています。このタスクを他のユーザーと共同で受注しますか？")) {

                    task.clientID.push(sessionData.userID);
                    task.clientIcon.push(sessionData.user.image || "");
                }
                await writeDB("tasks", taskID, task);
                location.reload();
            }
        }

        const handleTaskDelete = async (taskID: string) => {
            await deleteDB("tasks", taskID);
            location.reload();
        }

        const handleTaskComplete = async (taskID: string) => {
            const taskData = await readDB("tasks", taskID);
            const task = taskData as Task;

            if (task.workingStatus === "作業中") {
                task.workingStatus = "完了";
                await writeDB("tasks", taskID, task);
                location.reload();
            }
        }



        return (
            <Accordion isCompact>
                {tasks.map((task, index) => (
                    <AccordionItem
                        key={index}
                        aria-label={task.name}
                        startContent={
                            <AvatarGroup isBordered max={4}>
                                {task.clientIcon.map((icon, index) => (
                                    <Avatar
                                        isBordered
                                        color={getColorByStatus(task.workingStatus)}
                                        radius="lg"
                                        key={index}
                                        src={icon} // 適切なURLフィールドに変更してください
                                    />
                                ))}
                            </AvatarGroup>
                        }
                        subtitle={"作業目安時間:" + task.workingTime} // 適切なサブタイトルフィールドに変更してください
                        title={task.name + "  (" + task.workingStatus + ")"}
                    >
                        <Card>
                            <CardHeader className="flex gap-3">
                                <Avatar
                                    isBordered
                                    radius="lg"
                                    src={task.supplierIcon} // 適切なURLフィールドに変更してください                 ※変更して
                                />
                                <div className="flex flex-col">
                                    <p className="text-default-900">{getUserName(task.supplierID)}</p>
                                    <p className="text-small text-default-500">依頼者</p>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <p>タスクID: {task.id}</p>
                                <p>受注者:</p>
                                {task.clientID.length == null || typeof task.clientID == "string" ? (
                                    <p key={task.id} className="text-md">{getUserName(task.clientID[0])}</p>
                                ) : (

                                    task.clientID.map((id: string) => (
                                        <p key={id} className="text-md">●{getUserName(id)}</p>
                                    ))
                                )}
                                <p>カテゴリ: {task.category} - {task.subCategory}</p>
                                <p>受注日: {task.orderDay}</p>
                                <p>期限日: {task.limitDay}</p>
                                {task.isReport && <p className="text-md" style={{ color: 'red' }}>報告あり</p>}
                                {task.isReport && <p>報告日: {task.reportDay}</p>}
                                <p>ランク:
                                    {[1, 2, 3].map((star) => (
                                        <span
                                            key={star}
                                            style={{
                                                cursor: 'pointer',
                                                color: star <= task.rank ? '#FFD700' : 'black',
                                                padding: '2px',
                                                margin: '2px'
                                            }}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </p>
                                <p>内容: {task.content.replace(/\\n/g, '\n')}</p>
                                {mode === "client" && (

                                    task.clientID.includes(sessionData.userID) ? null : (
                                        <Button
                                            color="primary"
                                            onClick={() => {
                                                if (confirm("本当に受注しますか？")) {
                                                    handleTaskOrder(task.id as string);
                                                }
                                            }}
                                            style={{ float: 'right' }}
                                        >
                                            受注
                                        </Button>
                                    )

                                )}
                                {mode === "supplier" && (
                                    <div>
                                        {task.workingStatus != "完了" && (
                                            <div>
                                                <div>
                                                    <Button
                                                        color="danger"
                                                        onClick={() => {
                                                            if (confirm("このタスクを本当に削除しますか？")) {
                                                                handleTaskDelete(task.id as string);
                                                            }
                                                        }}
                                                        style={{ float: 'right' }}
                                                    >
                                                        削除
                                                    </Button>
                                                </div>
                                                <div>
                                                    <Button
                                                        color="primary"
                                                        onClick={() => {
                                                            if (confirm("このタスクを完了させますか？")) {
                                                                handleTaskComplete(task.id as string);
                                                            }
                                                        }}
                                                        style={{ float: 'right' }}
                                                    >
                                                        完了
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                )}
                            </CardBody>
                        </Card>
                    </AccordionItem>
                ))}
            </Accordion>
        );
    }



    return (
        <DefaultLayout>
            <Tabs>
                <Tab title="タスク一覧">
                    <div>
                        <h2>タスク一覧</h2>
                        {showTask(tasks, user, "client")}
                    </div>
                </Tab>
                <Tab title="タスク追加">
                    <Card>
                        <CardBody>
                            <Input name="name" label="タスク名" onChange={handleChange} isRequired />
                            <Select
                                isRequired
                                className="max-w-xs"
                                label="カテゴリ"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <>
                                    {mainCategory.map((category) => (
                                        <SelectItem key={category}>{category}</SelectItem>
                                    ))}
                                    <SelectItem key={"その他"}>その他</SelectItem>
                                </>
                            </Select>
                            {selectedCategory === "その他" && (
                                <Input
                                    className="mt-4"
                                    label="カテゴリの新規追加"
                                    value={otherMainCategory}
                                    onChange={(e) => setOtherMainCategory(e.target.value)}
                                />
                            )}
                            <Select
                                isRequired
                                className="max-w-xs"
                                label="サブカテゴリ"
                                value={selectedSubCategory}
                                onChange={(e) => setSelectedSubCategory(e.target.value)}
                            >
                                <>
                                    {subCategory.map((subCategory) => (
                                        <SelectItem key={subCategory}>{subCategory}</SelectItem>
                                    ))}
                                    <SelectItem key={"その他"}>その他</SelectItem>
                                </>
                            </Select>
                            {selectedSubCategory === "その他" && (
                                <Input
                                    className="mt-4"
                                    label="サブカテゴリの新規追加"
                                    value={otherSubCategory}
                                    onChange={(e) => setOtherSubCategory(e.target.value)}
                                />
                            )}

                            <Textarea name="content" label="タスク内容" onChange={handleChange} placeholder="わかりやすく簡潔に" isRequired />
                            <Input name="workingTime" label="目安の作業時間" onChange={handleChange} placeholder="例)1時間" isRequired />
                            <DatePicker
                                label="期限日"
                                value={task.limitDay}
                                onChange={(date) => handleDateChange('limitDay', date)}
                                isRequired
                                className="max-w-[284px]"
                            />
                            <Checkbox name="isReport" checked={task.isReport} onChange={handleChange} isRequired >要報告</Checkbox>
                            {task.isReport && (
                                <>
                                    <DatePicker
                                        label="報告日"
                                        value={task.reportDay}
                                        onChange={(date) => handleDateChange('reportDay', date)}
                                        isRequired
                                        className="max-w-[284px]"
                                    />
                                </>
                            )}
                            <div>
                                <label htmlFor="task-rank">作業難易度</label>
                                <div id="task-rank">
                                    {[1, 2, 3].map((star) => (
                                        <span
                                            key={star}
                                            onClick={() => handleRankChange(star)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') handleRankChange(star);
                                            }}
                                            role="button"
                                            tabIndex={0}
                                            style={{
                                                cursor: 'pointer',
                                                color: star <= task.rank ? '#FFD700' : 'black',
                                                padding: '2px',
                                                margin: '2px'
                                            }}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <Button onClick={() => {
                                if (confirm("タスクを追加しますか？\n追加後は編集、削除はできません。")) {
                                    handleSubmit();
                                }
                            }}>タスク追加</Button>

                        </CardBody>
                    </Card>
                </Tab>
                <Tab title="タスク">
                    <div>
                        <h2>受注したタスク</h2>
                        {showTask(myTasksClient, user, "client")}
                        <h2>依頼したタスク</h2>
                        {showTask(myTasksSupplier, user, "supplier")}
                    </div>
                </Tab>
            </Tabs>
        </DefaultLayout>
    );
};

export default TaskManager;