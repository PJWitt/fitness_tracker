const express = require("express");
const usersRouter = express.Router();
const jwt = require("jsonwebtoken");

usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
});

const {
  getUser,
  getUserByUsername,
  getUserById,
  createUser,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
} = require("../db");

usersRouter.get("/me", async (req, res, next) => {
  if (!req.user) {
    return next({
      name: "userVerificationError",
      message: "Only a logged in user can access their user information!",
    });
  }

  const userMe = await getUser(req.body);

  res.send(userMe);
});

usersRouter.get("/:username/routines", async (req, res, next) => {
  try {
    console.log("test", req.params);
    const user = await getUserByUsername(req.params);

    if (!user.username) {
      next({
        name: "userVerificationError",
        message: "An Invalid Username was entered!",
      });
    }

    const userRoutines = getPublicRoutinesByUser(user);

    res.send(userRoutines);
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  // request must have both
  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password",
    });
  }

  try {
    const user = await getUserByUsername(username);
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET
    );

    const hashedPassword = user.password;
    const passwordsMatch = await bcrypt.compare(password, hashedPassword);

    if (user && passwordsMatch) {
      // create token & return to user
      res.send({
        user: user,
        message: "you're logged in!",
        token: token,
      });
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.post("/register", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const _user = await getUserByUsername(username);

    // if (_user) {
    //   next({
    //     name: "UserExistsError",
    //     message: "A user by that username already exists",
    //   });
    // }

    // if (password.length < 8) {
    //   next({
    //     name: "PasswordShort",
    //     message: "The password you chose must be atleast 8 characters long.",
    //   });
    // }

    // const user = await createUser({
    //   username,
    //   password,
    // });

    // const token = jwt.sign(
    //   {
    //     id: user.id,
    //     username,
    //   },
    //   process.env.JWT_SECRET,
    //   {
    //     expiresIn: "1w",
    //   }
    // );

    // res.send({
    //   user: user,
    //   message: "thank you for signing up",
    //   token: token,
    // });
    res.send("this is our test");
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = usersRouter;
