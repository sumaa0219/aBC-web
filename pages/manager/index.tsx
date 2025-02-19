import { Tabs, Tab, Chip } from "@nextui-org/react";
import DefaultLayout from "@/layouts/default";
import { Settings } from "@/components/manage";
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
    const specificRoles = ['管理者', '開発者'];
    const sessionData = session as SessionData | any;

    if (session && sessionData.user && sessionData.highestRole && specificRoles.includes(sessionData.highestRole.name)) {
        const manageFlag = true;
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
                                <span>まだなし</span>
                            </div>
                        }
                    />
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
                </Tabs>
            </div>
        </DefaultLayout>
    );
};