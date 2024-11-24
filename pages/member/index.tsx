import { useState, useEffect } from 'react';
import DefaultLayout from "@/layouts/default";
import { readDB } from "@/components/database";
import { User } from "@nextui-org/react";

interface User {
    userDisplayName: string;
    userID: string;
    userHighestRole: string;
    userDisplayIcon: string;
    // 他のフィールドがある場合はここに追加
}

interface UserData {
    [key: string]: User;
}

const IndexPage = () => {
    const [userdata, setUserData] = useState<UserData>({});
    const [searchQuery, setSearchQuery] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            const usersData: any = await readDB("user");
            if (usersData) {
                setUserData(usersData);
            }
        };
        fetchData();
    }, []);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const filteredUsers = Object.keys(userdata).filter(userID => {
        const user = userdata[userID];
        return (
            user.userDisplayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.userHighestRole.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    return (
        <DefaultLayout>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '50px' }}>
                <h1 style={{ marginRight: '80px' }}>全メンバー一覧</h1>
                <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', width: '100%' }}>
                    <input
                        type="text"
                        placeholder="検索..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        style={{ padding: "10px", width: "100%", border: 'none', outline: 'none' }}
                    />
                </div>
            </div>
            {filteredUsers.map(userID => (
                <div key={userID}>
                    <User
                        name={userdata[userID].userDisplayName}
                        description={userdata[userID].userHighestRole}
                        isFocusable={true}
                        avatarProps={{
                            src: userdata[userID].userDisplayIcon
                        }}
                    />
                </div>
            ))}
        </DefaultLayout>
    );
};

export default IndexPage;