import TaskManager from "@/components/task";
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

import DefaultLayout from "@/layouts/default";


const Home = () => {
    const { data: session } = useSession();
    const router = useRouter();
    // const aaa = await readDB('user', 425853700112908289);



    return (
        <DefaultLayout>
            <TaskManager />
        </DefaultLayout>
    );

};

export default Home;