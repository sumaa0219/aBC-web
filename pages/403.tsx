import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/react";


export default function NotFound() {

    const handleBackPage = () => {
        history.back();
    }

    return (
        <DefaultLayout>

            <div>エラー403 このページへのアクセス権限がありません</div>
            <Button onClick={handleBackPage}>戻る</Button>

        </DefaultLayout >
    );
}