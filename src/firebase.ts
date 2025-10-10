import admin, { type ServiceAccount } from "firebase-admin";
import serviceAccount from "../shapework-personal-79b64def1f00.json";
import { FieldValue } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK    
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
    databaseURL: "https://shapework-personal-default-rtdb.asia-southeast1.firebasedatabase.app"
  });

const db = admin.firestore();

// Function to record visitor data
const recordVisitor = async (ip: string) => {
    try {
        const collectionRef = db.collection("questions");
        const docRef = collectionRef.doc(ip);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            console.log("ip already exists");
            await docRef.update({
                number_of_visits: FieldValue.increment(1),
            });
        } else {
            await docRef.set({
                number_of_visits: 1,
            });
        }
        console.log("Visitor recorded successfully");
    } catch (error) {
        console.error("Error recording visitor:", error);
        throw error;
    }
};

// Function to get visitor data
const getVisitorData = async (ip: string) => {
    try {
        const collectionRef = db.collection("questions");
        const docRef = collectionRef.doc(ip);
        const docSnap = await docRef.get();
        return docSnap.exists ? docSnap.data() : null;
    } catch (error) {
        console.error("Error getting visitor data:", error);
        throw error;
    }
};

export { db, recordVisitor, getVisitorData };