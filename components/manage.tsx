import { readDB, writeDB } from "@/components/database";
import { useState, useEffect } from 'react';
import { Tabs, Tab, Card, CardBody, Input } from "@nextui-org/react";

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