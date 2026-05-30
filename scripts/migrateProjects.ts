import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";
import { firebaseConfig } from "../src/firebaseConfig";

(async () => {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const usersSnapshot = await getDocs(collection(db, "users"));
  for (const userDoc of usersSnapshot.docs) {
    const projectsSnapshot = await getDocs(collection(db, "users", userDoc.id, "projects"));
    for (const project of projectsSnapshot.docs) {
      await setDoc(doc(db, "projects", project.id), { ...project.data(), ownerId: userDoc.id }, { merge: true });
      await setDoc(doc(db, "projects", project.id, "memberships", userDoc.id), { role: "owner" }, { merge: true });
    }
  }
})();
