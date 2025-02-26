import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { readDB, writeDB } from "@/components/database";
import ErrorPage from 'next/error';
import DefaultLayout from "@/layouts/default";
import { useSession } from 'next-auth/react';


interface SessionData {
    user: {
        name: string;
        image: string;

    };
    highestRole: {
        name: string;
    };
}
interface codeData {
    code: string;
    token: number;
    maxused: number;
    used: number;
    startdate: string;
    enddate: string;
    useduser: Array<string>;
    applicableuser: Array<string>;
    active: boolean;
    description: string;
}

const CodePage = () => {
    const router = useRouter();
    const { code } = router.query;
    const [codeData, setCodeData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const { data: session } = useSession();
    const sessionData = session as SessionData | any;

    useEffect(() => {
        const fetchCodeData = async () => {
            if (code) {
                const data = await readDB("codes", code as string);
                setCodeData(data);
                setLoading(false);
            }
        };
        fetchCodeData();
    }, [code]);

    //今日の日付を取得
    const today = new Date();
    let message = <div></div>;

    if (loading) {
        message = <p>Loading...</p>;
    }


    if (!codeData) {
        message = <h1>コードが見つかりません。</h1>;
    } else if (codeData.active == false) {
        message = <h1>このコードは現在利用できません。</h1>;
    } else if (new Date(codeData.startdate) >= today || new Date(codeData.enddate) <= today) {
        message = <h1>このコードは有効期間外です。</h1>;
    } else if (codeData.maxused != 0 && codeData.maxused <= codeData.used) {
        message = <h1>このコードは使用回数が上限に達しています。</h1>;
    } else if (codeData.useduser.includes(sessionData.userID)) {
        message = <h1>このコードは既に使用されています。</h1>;
    } else {
        message = <div><h1>特典コードを適用しました。</h1><h1>トークンは５分ほどで付与されます。</h1></div>;
        const newCodeData: codeData = {
            ...codeData,
            used: codeData.used + 1,
            useduser: codeData.useduser.concat(sessionData.userID),
        };

        const updateCodeData = async () => {
            await writeDB("codes", code as string, newCodeData);
        };
        updateCodeData();


    }
    setTimeout(() => {
        window.close();
    }, 6000);

    return (
        <DefaultLayout>
            {message}
            <h1>なおこのタブは5秒後に自動で閉じます</h1>
        </DefaultLayout>
    )


};

export default CodePage;