import DefaultLayout from "@/layouts/default";
import { Button } from "@nextui-org/react";


export default function NotFound() {

    const handleBackPage = () => {
        history.back();
    }

    return (
        <DefaultLayout>

            <div>エラー404 このページは存在しません</div>
            <Button onClick={handleBackPage}>戻る</Button>

        </DefaultLayout >
    );
}