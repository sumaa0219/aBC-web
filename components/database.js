import { collection, getDocs, getDoc, doc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export async function readDB(coll, document = null) {
    if (document) {
        // return await getDoc(doc(db, coll, document));
        const docRef = doc(db, coll, document);
        const result = await getDoc(docRef);
        return result.data();
    } else {
        const collRef = collection(db, coll);
        const resultSnapshot = await getDocs(collRef);
        const result = {};
        resultSnapshot.docs.forEach((doc) => {
            result[doc.id] = doc.data();
        });
        return result;
    }
};

function flattenData(data) {
    const result = {};
    for (const key in data) {
        if (Array.isArray(data[key])) {
            result[key] = data[key].join(","); // 配列をカンマ区切りの文字列に変換
        } else if (typeof data[key] === 'object' && data[key] !== null) {
            result[key] = flattenData(data[key]); // 再帰的にフラット化
        } else {
            result[key] = data[key];
        }
    }
    return result;
}

export async function writeDB(coll, document, data) {
    const flattenedData = flattenData(data);
    await setDoc(doc(db, coll, document), flattenedData);
}
