// Word Island · Firebase (results, leaderboards, class list, Pause), shared by Word Island and Treasure Quest.
// An ES module: it sets window.wiSend, wiClasses, wiWatchSettings and friends, then fires wi-send-ready.
// Firebase web settings are public by design; the Firestore rules decide who may read results.
const config = {
  apiKey: "AIzaSyCKqeNwxJa9SlOXW9Hx4OYqyn3Vkg9H4oI",
  authDomain: "english-pdpr-quiz.firebaseapp.com",
  projectId: "english-pdpr-quiz",
  appId: "1:375910903849:web:93acc4c7e71b804bc22c38"
};
const SDK = "https://www.gstatic.com/firebasejs/11.10.0/";
let ready = null;

function loadSdk() {
  if (!ready) {
    ready = Promise.all([
      import(SDK + "firebase-app.js"),
      import(SDK + "firebase-auth.js"),
      import(SDK + "firebase-firestore.js")
    ]).then(([appSdk, authSdk, storeSdk]) => {
      const app = appSdk.initializeApp(config);
      return { authSdk, storeSdk, auth: authSdk.getAuth(app), db: storeSdk.getFirestore(app) };
    }).catch((err) => {
      ready = null;
      throw err;
    });
  }
  return ready;
}

window.wiSend = async (run) => {
  const { authSdk, storeSdk, auth, db } = await loadSdk();
  // Wait for the saved sign-in, so a resend comes from the same pupil and may check its own result.
  await auth.authStateReady();
  const user = auth.currentUser || (await authSdk.signInAnonymously(auth)).user;
  const data = {
    uid: user.uid,
    ...(run.unit ? { unit: run.unit } : {}),
    name: run.name,
    cls: run.cls,
    game: run.game,
    mode: run.mode,
    stars: run.stars,
    total: run.total,
    answers: run.answers,
    createdAt: storeSdk.serverTimestamp()
  };
  // Runs saved before keys existed still get a new id.
  if (!run.key) {
    await storeSdk.addDoc(storeSdk.collection(db, "wordIsland"), data);
    return;
  }
  const ref = storeSdk.doc(db, "wordIsland", run.key);
  try {
    await storeSdk.setDoc(ref, data);
  } catch (err) {
    // A slow first try may have saved it after all. The rules refuse to overwrite a result,
    // so check whether this pupil's result is already there before trying again later.
    if (!err || err.code !== "permission-denied") throw err;
    const saved = await storeSdk.getDoc(ref).catch(() => null);
    if (!saved || !saved.exists()) throw err;
  }
  // A full round of Listen and shoot or Run and pick also goes on that game's class leaderboard,
  // under the same id. The leaderboard is a bonus, so a failed score never holds back the result above.
  if (typeof run.score === "number") {
    try {
      await storeSdk.setDoc(storeSdk.doc(db, scoreCollection(run.game), run.key), {
        uid: user.uid,
        unit: run.unit,
        cls: run.cls,
        name: run.name,
        score: run.score,
        createdAt: storeSdk.serverTimestamp()
      });
    } catch (err) {
      // "permission-denied" here means a slow first try already saved it.
      if (!err || err.code !== "permission-denied") console.warn("Word Island: score not saved.", err);
    }
  }
};

// Each game keeps its own leaderboard. Listen and shoot had one first, so it keeps the old name.
function scoreCollection(game) {
  return game === "runner" ? "wordIslandRunScores" : "wordIslandScores";
}

// The class's best scores in one game (Listen and shoot unless named) for a unit, best first.
window.wiLeaderboard = async (unit, cls, game) => {
  const { authSdk, storeSdk, auth, db } = await loadSdk();
  await auth.authStateReady();
  if (!auth.currentUser) await authSdk.signInAnonymously(auth);
  const snap = await storeSdk.getDocs(storeSdk.query(
    storeSdk.collection(db, scoreCollection(game)),
    storeSdk.where("cls", "==", cls),
    storeSdk.where("unit", "==", unit),
    storeSdk.orderBy("score", "desc"),
    storeSdk.limit(20)
  ));
  return snap.docs.map((row) => ({ name: String(row.get("name") || ""), score: Number(row.get("score")) || 0 }));
};

// Teacher explain page: Google sign-in, and the saved results (the rules let only the teacher read them).
window.wiTeacher = {
  async watch(onUser) {
    const { authSdk, auth } = await loadSdk();
    authSdk.onAuthStateChanged(auth, (user) => {
      onUser(user && !user.isAnonymous ? { email: user.email, verified: user.emailVerified } : null);
    });
  },
  async signIn() {
    const { authSdk, auth } = await loadSdk();
    const provider = new authSdk.GoogleAuthProvider();
    provider.setCustomParameters({ login_hint: "kokweng1983@gmail.com" });
    await authSdk.signInWithPopup(auth, provider);
  },
  async signOut() {
    const { authSdk, auth } = await loadSdk();
    await authSdk.signOut(auth);
  },
  // Calls onRows again whenever a pupil's result arrives; resolves to a function that stops listening.
  async watchResults(onRows, onError) {
    const { storeSdk, db } = await loadSdk();
    return storeSdk.onSnapshot(storeSdk.collection(db, "wordIsland"),
      (snap) => onRows(snap.docs.map((row) => row.data())), onError);
  }
};

// Which units each class may open, set by the teacher on the quiz Teacher results page.
window.wiClasses = async () => {
  const { storeSdk, db } = await loadSdk();
  const snap = await storeSdk.getDoc(storeSdk.doc(db, "settings", "wordIsland"));
  return snap.exists() ? snap.get("classes") : null;
};
// Live settings for the pause switch: calls onData again whenever the teacher pauses or resumes a class.
window.wiWatchSettings = async (onData) => {
  const { storeSdk, db } = await loadSdk();
  return storeSdk.onSnapshot(storeSdk.doc(db, "settings", "wordIsland"),
    (snap) => onData(snap.exists() ? snap.data() : {}),
    (err) => console.warn("Word Island: pause switch not loaded.", err));
};
// Live word search (spec 0015): the race the teacher started for a class, and this pupil's row in it.
// The rules only take a pupil's words while the race is on, so a refused join means the race is over.
window.wiLive = {
  // Resolves to { race, found, offset, uid } (offset: server clock minus this device's clock), or null.
  async join(raceId, pupil) {
    const { authSdk, storeSdk, auth, db } = await loadSdk();
    await auth.authStateReady();
    const user = auth.currentUser || (await authSdk.signInAnonymously(auth)).user;
    const raceRef = storeSdk.doc(db, "wordIslandLive", raceId);
    const snap = await storeSdk.getDoc(raceRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    const startAt = data.startAt && data.startAt.toMillis ? data.startAt.toMillis() : 0;
    const duration = Number(data.duration) || 0;
    // An old race (yesterday's, say) is skipped without asking the server, unless this clock is far out.
    if (data.stopped || data.cls !== pupil.cls || !startAt || Date.now() > startAt + (duration + 600) * 1000) return null;
    const me = storeSdk.doc(db, "wordIslandLive", raceId, "players", user.uid);
    const mine = await storeSdk.getDoc(me);
    const found = mine.exists() && Array.isArray(mine.get("found")) ? mine.get("found").filter((w) => typeof w === "string") : [];
    const now = storeSdk.serverTimestamp();
    const sent = Date.now();
    try {
      if (mine.exists()) {
        await storeSdk.updateDoc(me, { seenAt: now });
      } else {
        await storeSdk.setDoc(me, { uid: user.uid, name: pupil.name, cls: pupil.cls, found: [], count: 0, lastAt: now, seenAt: now });
      }
    } catch (err) {
      if (err && err.code === "permission-denied") return null;
      throw err;
    }
    const back = Date.now();
    // The server stamped seenAt while the write was on its way, so it is about halfway between sent and back.
    const saved = await storeSdk.getDoc(me);
    const seenAt = saved.get("seenAt");
    const offset = seenAt && seenAt.toMillis ? seenAt.toMillis() - (sent + back) / 2 : 0;
    return {
      race: {
        unit: String(data.unit || ""),
        words: Array.isArray(data.words) ? data.words.map(String) : [],
        grid: Array.isArray(data.grid) ? data.grid.map(String) : [],
        duration,
        startAt,
        stopped: Boolean(data.stopped),
        diagonal: data.diagonal === true
      },
      found,
      offset,
      uid: user.uid
    };
  },
  // Calls onRace({ stopped, places }) whenever the race changes; resolves to a function that stops listening.
  // places (uid → 1, 2, 3 …) arrives from the teacher's page once the race is over.
  async watch(raceId, onRace) {
    const { storeSdk, db } = await loadSdk();
    return storeSdk.onSnapshot(storeSdk.doc(db, "wordIslandLive", raceId),
      (snap) => {
        const places = snap.exists() ? snap.get("places") : null;
        onRace({
          stopped: snap.exists() ? Boolean(snap.get("stopped")) : true,
          places: places && typeof places === "object" ? places : null
        });
      },
      (err) => console.warn("Word Island: live race not watched.", err));
  },
  // The pupil's full list of found words, after each new one. The teacher's ranking updates from it.
  async found(raceId, list) {
    const { storeSdk, auth, db } = await loadSdk();
    if (!auth.currentUser) return;
    const now = storeSdk.serverTimestamp();
    try {
      await storeSdk.updateDoc(storeSdk.doc(db, "wordIslandLive", raceId, "players", auth.currentUser.uid),
        { found: list, count: list.length, lastAt: now, seenAt: now });
    } catch (err) {
      console.warn("Word Island: found word not saved.", err);
    }
  }
};
window.dispatchEvent(new Event("wi-send-ready"));
