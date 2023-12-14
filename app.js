require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const admin = require("firebase-admin");
const ejs = require("ejs");

const app = express();
const PORT = process.env.PORT || 5500;

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvKY2GYbAdkQIVjbyPhaouHUqBEXM85Ew",
  authDomain: "faced-app-8a31f.firebaseapp.com",
  databaseURL: "https://faced-app-8a31f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "faced-app-8a31f",
  storageBucket: "faced-app-8a31f.appspot.com",
  messagingSenderId: "13752152738",
  appId: "1:13752152738:web:dd3c4609e18ab4e0135dfb",
  measurementId: "G-BQXLZLJ3LS"
};

const serviceAccount = require("./serviceAccountKey1.json");
const {getAuth} = require("firebase-admin/auth");
//const {currentUser} = require("firebase/compat");

ad=admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://faced-app-8a31f-default-rtdb.asia-southeast1.firebasedatabase.app"
});
const database=ad.database()
const csrfMiddleware = csrf({ cookie: true });

app.set('view engine', 'ejs');
app.use(express.static("static"));
app.engine("html", require("ejs").renderFile);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(csrfMiddleware);

app.all("*", (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.cookie("XSRF-TOKEN", req.csrfToken());
  next();
});
async function verifySessionCookie(sessionCookie) {
  try {
    return await admin.auth().verifySessionCookie(sessionCookie, true);
  } catch (error) {
    throw error;
  }
}

// Routes
app.get("/", (req, res) => {
  res.render("index.html");
});

app.post("/signup", (req, res) => {
    if (req.cookies && req.cookies.session) {
    const sessionCookie = `${req.cookies.session}`;
    admin.auth().verifySessionCookie(
      sessionCookie, true /** checkRevoked */).then((decodedClaims) => {
      res.render("content.html");
        res.end(JSON.stringify({ decodedClaims }));

    }).catch(error => {
      res.status(401).send(error);
    });
  } else {
    //res.status(401).send("Session empty");
   // console.log("Error verifying session:", error);
    res.redirect("/");
  }
  //res.redirect("/content");




});
app.get("/signuppage", (req, res) => {
  res.render("signup.html");
});

app.post("/signin", async (req, res) => {
  res.clearCookie("session");
  const { email, password ,displayName} = req.body;

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    console.log("User created:", userRecord);

    const database_node=database.ref();
    const user_data={
      email:email,
      FullName: displayName,
      lastLogin: Date.now()

    }
    await database_node.child('Users/' + userRecord.uid).set(user_data);
    // Generate a session cookie
    const idToken = await admin.auth().createCustomToken(userRecord.uid);
    const csrfToken = req.cookies.csrfToken; // Extract CSRF token from the request

    // Send the ID token and CSRF token to the session login endpoint
    const sessionLoginResponse = await postIdTokenToSessionLogin('/sessionLogin', idToken, csrfToken);
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const options = { maxAge: expiresIn, httpOnly: true };
    res.cookie("session", idToken, options);
    if (sessionLoginResponse.status === 'success') {
      res.render("content.html");
    } else {
      console.error("Error during session login:", sessionLoginResponse);
      res.render("error.html");
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res.redirect("error.html");
  }
});
//
// app.get("/content", async (req, res) => {
//   const sessionCookie = req.cookies.session || "";
//
//   try {
//     // Verify the session cookie using the Firebase Admin SDK
//     const decodedClaims = await verifySessionCookie(sessionCookie);
//
//     // User is authenticated, render the content page
//     res.render("content");
//   } catch (error) {
//     console.log("Error verifying session:", error);
//     res.redirect("/");
//   }
// });


app.post("/content", (req, res) => {
  if (req.cookies && req.cookies.session) {
    const sessionCookie = `${req.cookies.session}`;
    admin.auth().verifySessionCookie(
      sessionCookie, true /** checkRevoked */).then((decodedClaims) => {
      res.render("content.html");
        res.end(JSON.stringify({ decodedClaims }));

    }).catch(error => {
      res.status(401).send(error);
    });
  } else {
    res.status(401).send("Session empty");
    console.log("Error verifying session:", error);
    res.redirect("/");
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Function to simulate the postIdTokenToSessionLogin function
// You should implement this function based on your server-side needs
async function postIdTokenToSessionLogin(endpoint, idToken, csrfToken) {
  // Simulate the logic to send the ID token and CSRF token to the session login endpoint
  // Replace this with your actual server-side logic for sending a request to the session login endpoint
  return { status: 'success' }; // Simulated response for success
}

app.get("/signout", (req, res) => {
  // Clear the session cookie to sign out the user
  res.clearCookie("session");
  res.redirect("/");
});
/////////////+++++++++++==================+++++++++++//////////////////////
// const express = require("express");
// const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
// const csrf = require("csurf");
// require('dotenv').config();
// const admin = require("firebase-admin");
// const ejs = require("ejs");
// const PORT = process.env.PORT || 5500;
// const app = express();
// app.set('view engine', 'ejs');
// var serviceAccount = require("./serviceAccountKey.json");
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//    databaseURL: "https://faced-app-8a31f-default-rtdb.asia-southeast1.firebasedatabase.app"
// });
//
// const csrfMiddleware = csrf({ cookie: true });
//
//
//
// app.engine("html", require("ejs").renderFile);
// app.use(express.static("static"));
//
// app.use(bodyParser.json());
// app.use(cookieParser());
// app.use(csrfMiddleware);
//
// app.all("*", (req, res, next) => {
//   res.locals.csrfToken = req.csrfToken();
//   res.cookie("XSRF-TOKEN", req.csrfToken());
//   next();
// });
// // Routes
// app.get("/", (req, res) => {
//   res.render("index.html");
// });
//
// app.get("/signup", (req, res) => {
//   res.render("signup.html");
// });
//
// app.post("/signin", async (req, res) => {
//   const { email, password } = req.body;
//
//   try {
//     // Create a new user in Firebase Authentication
//     const userRecord = await admin.auth().createUser({
//       email,
//       password,
//     });
//
//     console.log("User created:", userRecord);
//
//     // Set a session cookie to automatically sign in the new user
//     const idToken = await admin.auth().createCustomToken(userRecord.uid);
//     const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
//     const options = { maxAge: expiresIn, httpOnly: true };
//     res.cookie("session", idToken, options);
//
//     res.redirect("/content");
//   } catch (error) {
//     console.error("Error creating user:", error);
//     res.redirect("/signup");
//   }
// });
//
// app.get("/content", (req, res) => {
//   // Check Firebase authentication
//   const sessionCookie = req.cookies.session || "";
//   admin.auth().verifyIdToken(sessionCookie)
//     .then((decodedClaims) => {
//       // User is authenticated, render the content page
//       res.render("content.html");
//     })
//     .catch((error) => {
//       console.error("Error verifying session:", error);
//       res.redirect("/");
//     });
// });
//
// app.get("/profile", (req, res) => {
//   // Check Firebase authentication
//   const sessionCookie = req.cookies.session || "";
//   admin.auth().verifyIdToken(sessionCookie)
//     .then((decodedClaims) => {
//       // User is authenticated, render the profile page with user details
//       const currentUser = decodedClaims;
//       res.render("profile", { currentUser });
//     })
//     .catch((error) => {
//       console.error("Error verifying session:", error);
//       res.redirect("/");
//     });
// });
//
// app.get("/signout", (req, res) => {
//   // Clear the session cookie to sign out the user
//   res.clearCookie("session");
//   res.redirect("/");
// });
//
// // Start the server
//
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// const firebaseConfig = {
//   apiKey: "AIzaSyAvKY2GYbAdkQIVjbyPhaouHUqBEXM85Ew",
//   authDomain: "faced-app-8a31f.firebaseapp.com",
//   databaseURL: "https://faced-app-8a31f-default-rtdb.asia-southeast1.firebasedatabase.app",
//   projectId: "faced-app-8a31f",
//   storageBucket: "faced-app-8a31f.appspot.com",
//   messagingSenderId: "13752152738",
//   appId: "1:13752152738:web:dd3c4609e18ab4e0135dfb",
//   measurementId: "G-BQXLZLJ3LS"
// };
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);



//////////////////////////////////////
// var admin = require("firebase-admin");
//
// var serviceAccount = require("path/to/serviceAccountKey.json");
//
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://faced-app-8a31f-default-rtdb.asia-southeast1.firebasedatabase.app"
// });
