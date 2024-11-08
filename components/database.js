import { collection, getDocs, getDoc, doc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export async function readDB(coll, document = null) {
    if (document) {
        console.log('document', document);
        // return await getDoc(doc(db, coll, document));
        const docRef = doc(db, coll, document);
        const result = await getDoc(docRef);
        return result.data();
    } else {
        console.log('coll', coll);
        const collRef = collection(db, coll);
        const resultSnapshot = await getDocs(collRef);
        const result = {};
        resultSnapshot.docs.forEach((doc) => {
            result[doc.id] = doc.data();
        });
        return result;
    }
};
// export const getCollectionData = async (collectionName) => {
//   const collectionRef = collection(db, collectionName);
//   const snapshot = await getDocs(collectionRef);
//   const dataList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//   return dataList;
// };
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

// export async function readDB(coll, document) {
//     if (document) {
//         const docRef = db.collection(coll).doc(document);
//         const result = await docRef.get();
//     } else {
//         const collRef = db.collection(coll);
//         const result = await collRef.get();
//     }
//     if (!result.exists()) {
//         return null;
//     } else {
//         return result.data();
//     }
// };

// export async function writeDB(coll, document, data) {
//     await setDoc(doc(db, coll, document), data);
// }