import { readDB, writeDB } from "@/components/database";
import { useState, useEffect } from 'react';
import { Card, CardBody, Input, Button, DatePicker, NumberInput, Form, Accordion, AccordionItem } from "@heroui/react";
import { Tabs, Tab } from "@heroui/react"; // 修正: 正しいパッケージをインポート
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";
import { fetchData } from "next-auth/client/_utils";
import { QRCodeCanvas } from "qrcode.react";
import { FC } from "react";

export const Settings = () => {
    const [settingData, setSettingData] = useState<any>({});
    const [changeFlag, setChangeFlag] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            const settingdata = await readDB("settings");
            if (settingdata) {
                setSettingData(settingdata);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const updateData = async () => {
            for (let key in settingData) {
                console.log(key, settingData[key]);
                await writeDB("settings", key, settingData[key]);
            }
        };
        if (Object.keys(settingData).length > 0 && changeFlag) {
            updateData();
            changeFlag || setChangeFlag(false);
        }
    }, [settingData]);

    const handleInputChange = (keys: string[], value: string, type: string) => {
        setSettingData((prevData: any) => {
            const newData = { ...prevData };
            let current = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = type === 'number' ? Number(value) : value;
            changeFlag || setChangeFlag(true);
            return newData;
        });
    };

    const renderInputs = (data: any, parentKey: string = '') => {
        // dataを名前順にソート
        data = Object.keys(data)
            .sort()
            .reduce((obj: any, key: string) => {
                obj[key] = data[key];
                return obj;
            }, {});
        return Object.keys(data).map((key) => {
            if (key === 'descriptions') return null; // descriptionキーをスキップ

            const value = data[key];
            const fullKey = parentKey ? `${parentKey}.${key}` : key;
            const keys = fullKey.split('.');

            if (typeof value === 'object' && value !== null) {
                return (
                    <Card key={fullKey} className="mb-4 w-full">
                        <CardBody>
                            <h3>{key}</h3>
                            {data.descriptions && data.descriptions[key] && (
                                <p>{data.descriptions[key].description}</p>
                            )}
                            {renderInputs(value, fullKey)}
                        </CardBody>
                    </Card>
                );
            } else {
                const inputType = typeof value === 'number' ? 'number' : 'text';
                return (
                    <Card key={fullKey} className="mb-4 w-full">
                        <CardBody>
                            {data.descriptions && data.descriptions[key] && (
                                <p>{data.descriptions[key].description}</p>
                            )}
                            <Input
                                label={key}
                                value={value}
                                onChange={(e) => handleInputChange(keys, e.target.value, inputType)}
                                type={inputType}
                            />
                        </CardBody>
                    </Card>
                );
            }
        });
    };

    const settingKeys = Object.keys(settingData);

    return (
        <div className="flex w-full flex-col items-left">
            <Tabs aria-label="Options" isVertical={true}>
                {settingKeys.map((key) => (
                    <Tab key={key} title={key} className="w-full flex flex-col items-left">
                        {renderInputs(settingData[key], key)}
                    </Tab>
                ))}
            </Tabs>
        </div>
    );
}

export const EventToken = () => {

    interface codeData {
        code: string;
        token: number;
        maxused: number;
        used: number;
        startdate: string;
        enddate: string;
        useduser: Array<string>;
        active: boolean;
        description: string;
    }
    interface QRCodeProps {
        url: string;
    }

    const [token, setToken] = useState<number>(0);
    const [maxUsed, setMaxUsed] = useState<number>(0);
    const [startDate, setStartDate] = useState<string>(today(getLocalTimeZone()).toString());
    const [endDate, setEndDate] = useState<string>(today(getLocalTimeZone()).add({ days: 7 }).toString());
    const [description, setDescription] = useState<string>("");
    const [codes, setCodes] = useState<any>({});


    const fetchCodes = async () => {
        const codes = await readDB("codes");
        if (codes) {
            setCodes(codes);
        }
    };

    useEffect(() => {

        fetchCodes();
    }, []);

    const QRCode: FC<QRCodeProps> = (props) => {
        return (
            <QRCodeCanvas
                value={props.url}
                size={128}
                bgColor={"#FFFFFF"}
                fgColor={"#000000"}
                level={"L"}
                includeMargin={false}
                imageSettings={{
                    src: "/favicon.ico",
                    x: undefined,
                    y: undefined,
                    height: 24,
                    width: 24,
                    excavate: true,
                }}
            />
        );
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = Math.random().toString(36).slice(-11);
        const newCodeData: codeData = {
            code: code,
            token: token,
            maxused: maxUsed,
            used: 0,
            startdate: startDate,
            enddate: endDate,
            useduser: [],
            active: true,
            description: description
        };

        // ここでnewCodeDataを送信する処理を追加
        console.log(newCodeData);
        await writeDB("codes", code, newCodeData);
        fetchCodes();
    };

    const create = () => {
        return (
            <Form className="w-full max-w-xs" onSubmit={onSubmit}>
                <Card>
                    <CardBody>
                        <div className="flex flex-wrap items-end" id="create">
                            <div>
                                <p>特典コードを作成します。</p>
                            </div>
                        </div>
                        <NumberInput
                            className="max-w-xs"
                            label="トークン数"
                            isRequired
                            aria-label="Token"
                            onValueChange={(value) => setToken(value)}
                        />
                        <Input
                            label="説明"
                            isRequired
                            aria-label="Description"
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <Input
                            label="最大使用回数(0は∞)"
                            value={maxUsed.toString()}
                            isRequired
                            aria-label="MaxUsed"
                            onChange={(e) => setMaxUsed(Number(e.target.value))}
                        />
                        <DatePicker
                            defaultValue={parseDate(startDate)}
                            label="開始日時"
                            minValue={today(getLocalTimeZone())}
                            isRequired
                            onChange={(date) => date && setStartDate(date.toString())}
                        />
                        <DatePicker
                            defaultValue={parseDate(endDate)}
                            label="終了日時"
                            maxValue={today(getLocalTimeZone()).add({ days: 7 })}
                            isRequired
                            onChange={(date) => date && setEndDate(date.toString())}
                        />
                        <Button type="submit">作成</Button>
                    </CardBody>
                </Card>
            </Form>
        );
    };

    const show = () => {
        return (
            <div className="w-full">
                <Card>
                    <CardBody>
                        <div className="flex flex-wrap items-end" id="show">
                            <div>
                                <p>特典コード一覧</p>
                            </div>
                        </div>
                        <div className="w-full">
                            <Accordion>
                                {Object.keys(codes).map((key) => {
                                    const codeData = codes[key];
                                    return (
                                        <AccordionItem
                                            key={key}
                                            aria-label={codeData.code}
                                            subtitle={codeData.description}
                                            title={codeData.token.toString() + "トークン"}
                                        >
                                            <QRCode url={"https://aaaaa.com/" + codeData.code} />
                                        </AccordionItem>


                                    );
                                })}
                            </Accordion>
                        </div>
                    </CardBody >
                </Card >
            </div >
        );
    };


    return (
        <div className="flex w-full flex-col">
            <Tabs
                aria-label="Dynamic tabs"
                color="primary"
                variant="underlined"
                classNames={{
                    tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                    cursor: "w-full bg-[#22d3ee]",
                    tab: "max-w-fit px-0 h-12",
                    tabContent: "group-data-[selected=true]:text-[#06b6d4]"
                }}
            >
                <Tab
                    key="sample1"
                    title={
                        <div className="flex items-center space-x-2">
                            <span>一覧</span>
                        </div>
                    }
                >{show()}</Tab>
                <Tab
                    key="sample2"
                    title={
                        <div className="flex items-center space-x-2">
                            <span>作成</span>
                        </div>
                    }
                >{create()}
                </Tab>
            </Tabs>
        </div>
    );
}