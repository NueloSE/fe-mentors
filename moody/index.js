/* === Imports === */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc, doc, deleteDoc,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* === Firebase Setup === */
const firebaseConfig = {
  apiKey: "AIzaSyBF479ECm6Ozc-gPJkvPic3KK7_bt6hb24",
  authDomain: "moody-eb8d9.firebaseapp.com",
  projectId: "moody-eb8d9",
  storageBucket: "moody-eb8d9.firebasestorage.app",
  messagingSenderId: "152906978328",
  appId: "1:152906978328:web:600c3e67ea33a866b4df6d",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

/* === UI === */

/* == UI - Elements == */

const viewLoggedOut = document.getElementById("logged-out-view");
const viewLoggedIn = document.getElementById("logged-in-view");

const signInWithGoogleButtonEl = document.getElementById(
  "sign-in-with-google-btn"
);

const emailInputEl = document.getElementById("email-input");
const passwordInputEl = document.getElementById("password-input");

const signInButtonEl = document.getElementById("sign-in-btn");
const createAccountButtonEl = document.getElementById("create-account-btn");

const signoutBtn = document.getElementById("signout-btn");
const userImage = document.getElementById("user-image");
const userGreeting = document.getElementById("greet-user");

const updatedUsernameEl = document.getElementById("updated-username");
const updatedImageUrlEl = document.getElementById("updated-image-url");
const updateBtn = document.getElementById("update-btn");

const emojiEls = document.getElementsByClassName("mood-emoji-btn");
const postInputEl = document.getElementById("post-input");
const postBtn = document.getElementById("post-btn");

const filterButtonEls = document.getElementsByClassName("filter-btn");
const allFilterBtnEl = document.getElementById("all-filter-btn");

// const fetchPostsBtn = document.getElementById("fetch-posts-btn");
const postsEl = document.getElementById("posts");

/* == UI - Event Listeners == */

signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle);

signInButtonEl.addEventListener("click", authSignInWithEmail);
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmail);
signoutBtn.addEventListener("click", authSignOut);
updateBtn.addEventListener("click", updateUserProfile);
postBtn.addEventListener("click", postBtnPressed);
// fetchPostsBtn.addEventListener("click", fetchOnceAndRenderPostsFromDB);

for (let emojiEl of emojiEls) {
  emojiEl.addEventListener("click", selectMood);
}

for (let filterButtonEl of filterButtonEls) {
  filterButtonEl.addEventListener("click", selectFilter);
}

let moodState = 0;
let collectionName = "posts";

/* === Main Code === */

onAuthStateChanged(auth, (user) => {
  if (user) {
    showLoggedInView();
    showProfileImage(userImage, user);
    showUserGreeting(userGreeting, user);

    fetchAllPosts(user);
    updateFilterButtonStyle(allFilterBtnEl);
    // fetchInRealtimeAndRenderPostFromDB(user)
  } else {
    showLoggedOutView();
  }
});

/* === Functions === */

/* = Functions - Firebase - Authentication = */

function authSignInWithGoogle() {
  signInWithPopup(auth, provider)
    .then((result) => {
      console.log("Signed in with Google");
    })
    .catch((error) => {
      console.error(error.message);
    });
}

function authSignInWithEmail() {
  const email = emailInputEl.value;
  const password = passwordInputEl.value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      clearAuthField();
    })
    .catch((error) => {
      console.log(error.message);
    });
}

function authCreateAccountWithEmail() {
  const email = emailInputEl.value;
  const password = passwordInputEl.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up
      const user = userCredential.user;

      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(errorMessage);
    });
}

function authSignOut() {
  signOut(auth)
    .then(() => {
      console.log("Sign-out successful");
    })
    .catch((error) => {
      console.error(error.message);
    });
}

/* Functions - Firebase - Cloud Firestore */

async function addPostToDB(postBody, user) {
  try {
    const docRef = await addDoc(collection(db, "posts"), {
      body: postBody,
      userId: user.uid,
      createdAt: serverTimestamp(),
      mood: moodState,
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

async function updatePostInDB(postId, newBody) {

  const postRef = doc(db,  collectionName, postId);

  await updateDoc(postRef, {
    body: newBody
  })
  
}

/*
async function fetchOnceAndRenderPostsFromDB() {
  clearAll(postsEl);

  const querySnapshot = await getDocs(collection(db, "posts"));
  querySnapshot.forEach((doc) => {
    renderPost(postsEl, doc.data());
  });
}*/

function clearAll(element) {
  element.innerHTML = "";
}

function replaceNewlinesWithBrTags(inputString) {
  return inputString.replace(/\n/g, "<br>");
}

function postBtnPressed() {
  const postInput = postInputEl.value;
  if (postInput && moodState) {
    const user = auth.currentUser;
    addPostToDB(postInput, user);
    clearInputFeilds(postInputEl);
    resetAllModeElements(emojiEls);
  }
}

/* == Functions - UI Functions == */

function fetchInRealtimeAndRenderPostFromDB(query) {
  // const postRef = collection(db, "posts");

  // const q = query(postRef, where( "userId", "==", user.uid), orderBy("createdAt", "desc"))

  onSnapshot(query, (querySnapshot) => {
    clearAll(postsEl);
    querySnapshot.forEach((doc) => {
      renderPost(postsEl, doc);
    });
  });
}

function fetchTodayPosts(user) {
  const startDay = new Date();
  startDay.setHours(0, 0, 0, 0);

  const endDay = new Date();
  endDay.setHours(23, 59, 59, 999);

  clearAll(postsEl);
  const postRef = collection(db, collectionName);
  const q = query(
    postRef,
    where("userId", "==", user.uid),
    where("createdAt", ">=", startDay),
    where("createdAt", "<=", endDay),
    orderBy("createdAt", "desc")
  );

  fetchInRealtimeAndRenderPostFromDB(q);
}

function fetchWeekPosts(user) {
  const startOfWeek = new Date();
  startOfWeek.setHours(0, 0, 0, 0);

  if (startOfWeek.getDay() === 0) {
    // If today is Sunday
    startOfWeek.setDate(startOfWeek.getDate() - 6); // Go to previous Monday
  } else {
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
  }

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const postsRef = collection(db, collectionName);

  const q = query(
    postsRef,
    where("userId", "==", user.uid),
    where("createdAt", ">=", startOfWeek),
    where("createdAt", "<=", endOfDay),
    orderBy("createdAt", "desc")
  );

  fetchInRealtimeAndRenderPostFromDB(q);
}

function fetchMonthPosts(user) {
  const startOfMonth = new Date();
  startOfMonth.setHours(0, 0, 0, 0);
  startOfMonth.setDate(1);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const postsRef = collection(db, collectionName);

  const q = query(
    postsRef,
    where("userId", "==", user.uid),
    where("createdAt", ">=", startOfMonth),
    where("createdAt", "<=", endOfDay),
    orderBy("createdAt", "desc")
  );

  fetchInRealtimeAndRenderPostFromDB(q);
}

function fetchAllPosts(user) {
  /* Challenge:
        This function should fetch ALL posts from the database and render them using the fetchRealtimeAndRenderPostsFromDB function.
    */
  const postsRef = collection(db, collectionName);

  const q = query(
    postsRef,
    where("userId", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  fetchInRealtimeAndRenderPostFromDB(q);
}

function createPostHeader(postData) {
  const emojis = ["bad", "awful", "neutral", "good", "amazing"];
  const headerDiv = document.createElement("div");
  headerDiv.className = "header";

  const headerDate = document.createElement("h3");
  headerDate.textContent = displayDate(postData.createdAt);
  const emojiImage = document.createElement("img");
  emojiImage.src = `./assets/emoji/${emojis[postData.mood - 1]}.png`;
  headerDiv.appendChild(headerDate);
  headerDiv.appendChild(emojiImage);

  return headerDiv;
}

function createPostBody(postData) {
  const postBody = document.createElement("p");
  postBody.textContent = replaceNewlinesWithBrTags(postData.body);

  return postBody;
}

function createPostUpdateButton(wholeDoc) {

  const postId = wholeDoc.id
  const postData = wholeDoc.data()

  //  <button class="edit-color">Edit</button>;
  const button = document.createElement('button');
  button.className = 'edit-color'
  button.textContent = 'Edit'

  button.addEventListener('click', function() {
    const newBody = prompt("Edit the post", postData.body)

    if (newBody) {
      updatePostInDB(postId, newBody)
    }
  })

  return button

}

async function deletePostFromDB(postId) {
    await deleteDoc(doc(db, 'posts', postId))
  }

function createDeletePostButton(wholeDoc) {
  // <button class=".delete-color">delete</button>
  const postId = wholeDoc.id; 
  const deletePostBtn = document.createElement("button");
  deletePostBtn.className = 'delete-color'
  deletePostBtn.textContent = "Delete"
  deletePostBtn.addEventListener('click', function () {
    deletePostFromDB(postId);
  })

  return deletePostBtn;
}

function createPostFooter(wholeDoc) {
  /* 
        <div class="footer">
            <button>Edit</button>
            <button>Delete</button>
        </div>
    */
  const footerDiv = document.createElement("div");
  footerDiv.className = "footer";
  footerDiv.appendChild(createPostUpdateButton(wholeDoc));
  footerDiv.appendChild(createDeletePostButton(wholeDoc));

  return footerDiv;
}

function renderPost(postsElement, wholeDoc) {

  const postData = wholeDoc.data()
  const postDiv = document.createElement("div");
  postDiv.className = "post";
  postDiv.appendChild(createPostHeader(postData));
  postDiv.appendChild(createPostBody(postData));
  postDiv.appendChild(createPostFooter(wholeDoc));

  postsElement.appendChild(postDiv)

  /*postsElement.innerHTML += `
    <div class="post">
                <div class="header">
                    <h3>${displayDate(postData.createdAt)}</h3>
                    <img src=${`./assets/emoji/${
                      emojis[postData.mood - 1]
                    }.png`} alt="">
                </div>
                <p>
                    ${replaceNewlinesWithBrTags(postData.body)}
                </p>
            </div>
            `;*/

  
}

function showLoggedOutView() {
  hideView(viewLoggedIn);
  showView(viewLoggedOut);
}

function showLoggedInView() {
  hideView(viewLoggedOut);
  showView(viewLoggedIn);
}

function showView(view) {
  view.style.display = "flex";
}

function hideView(view) {
  view.style.display = "none";
}

function clearInputFeilds(field) {
  field.value = "";
}

function clearAuthField() {
  clearInputFeilds(emailInputEl);
  clearInputFeilds(passwordInputEl);
}

function showProfileImage(imgEle, user) {
  if (user.photoURL) {
    imgEle.src = user.photoURL;
  } else {
    imgEle.src = "./assets/images/user-icon.png";
    imgEle.alt = "default image ";
  }
}

function showUserGreeting(greetEle, user) {
  const displayName = user.displayName;
  if (displayName) {
    const firstName = displayName.split(" ")[0];
    greetEle.textContent = `Hey ${firstName}, how are you?`;
  } else {
    greetEle.textContent = "Hey friend, how are you?";
  }
}

function displayDate(firebaseDate) {
  if (!firebaseDate) {
    return "Processing Date";
  }
  const date = firebaseDate.toDate();

  const day = date.getDate();
  const year = date.getFullYear();

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const month = monthNames[date.getMonth()];

  let hours = date.getHours();
  let minutes = date.getMinutes();
  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;

  return `${day} ${month} ${year} - ${hours}:${minutes}`;
}

function updateUserProfile() {
  const newUsername = updatedUsernameEl.value;
  const newImageUrl = updatedImageUrlEl.value;

  updateProfile(auth.currentUser, {
    displayName: newUsername,
    photoURL: newImageUrl,
  })
    .then(() => {
      console.log("successfully updated");
      showProfileImage(userImage, user);
      showUserGreeting(userGreeting, user);
    })
    .catch((error) => {
      console.error(error.message);
    });
}

function selectMood(e) {
  const selectMoodId = e.currentTarget.id;
  changeMoodStyleAfterSelection(selectMoodId, emojiEls);

  moodState = returnMoodValueFromElement(selectMoodId);
}

function changeMoodStyleAfterSelection(emojiId, emojiArray) {
  for (let emoji of emojiArray) {
    if (emoji.id === emojiId) {
      emoji.classList.remove("unselected-emoji");
      emoji.classList.add("selected-emoji");
    } else {
      emoji.classList.remove("selected-emoji");
      emoji.classList.add("unselected-emoji");
    }
  }
}

function resetAllModeElements(allMoodElements) {
  for (let moodEmojiEl of allMoodElements) {
    moodEmojiEl.classList.remove("unselected-emoji");
    moodEmojiEl.classList.remove("selected-emoji");
  }

  moodState = 0;
}

function returnMoodValueFromElement(emojiIdString) {
  return +emojiIdString.slice(-1);
}

function resetAllFilterButtons(filterEls) {
  for (let filterEl of filterEls) {
    filterEl.classList.remove("selected-filter");
  }
}

function updateFilterButtonStyle(selectedBtn) {
  selectedBtn.classList.add("selected-filter");
}

function fetchPostFromPeriod(user, period) {
  if (period === "today") {
    fetchTodayPosts(user);
  } else if (period === "week") {
    fetchWeekPosts(user);
  } else if (period === "month") {
    fetchMonthPosts(user);
  } else {
    fetchAllPosts(user);
  }
}

function selectFilter(event) {
  const user = auth.currentUser;

  const selectFilterId = event.target.id;
  const selectedFilterPeriod = selectFilterId.split("-")[0];

  resetAllFilterButtons(filterButtonEls);
  updateFilterButtonStyle(event.target);

  fetchPostFromPeriod(user, selectedFilterPeriod);
}
