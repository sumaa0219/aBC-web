import { Tabs, Tab, Chip } from "@heroui/react";
import DefaultLayout from "@/layouts/default";
import { Settings, EventToken } from "@/components/manage";
import { useSession } from 'next-auth/react';
import ErrorPage from 'next/error'; // ErrorPageのインポートを追加

interface SessionData {
    user: {
        name: string;
        image: string;

    };
    highestRole: {
        name: string;
    };
}

export default function App() {
    const { data: session } = useSession();
    const specificRoles = ['管理者', '開発者', "運営"];
    const sessionData = session as SessionData | any;
    let manageFlag = false;

    if (session && sessionData.user && sessionData.highestRole && specificRoles.includes(sessionData.highestRole.name)) {
        if (sessionData.highestRole.name === "管理者" || sessionData.highestRole.name === "開発者") {
            manageFlag = true;
        } else {
            manageFlag = false;
        }
    } else {
        return <ErrorPage statusCode={403} />;
    }

    return (
        <DefaultLayout>
            <div className="flex w-full flex-col">
                <Tabs
                    aria-label="Options"
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
                                <span>まだなし</span>
                            </div>
                        }
                    />
                    <Tab
                        key="sample2"
                        title={
                            <div className="flex items-center space-x-2">
                                <span>特典コード</span>
                            </div>
                        }
                    ><EventToken />
                    </Tab>
                    {manageFlag && (
                        <Tab
                            key="BOTsettings"
                            title={
                                <div className="flex items-center space-x-2">
                                    <span>BotSettings</span>
                                </div>
                            }
                        >
                            <Settings />
                        </Tab>
                    )}
                </Tabs>
            </div>

        </DefaultLayout >
    );
};