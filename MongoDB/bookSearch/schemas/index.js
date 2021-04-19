const mongoose = require("mongoose");

const connect = () => {
  new Promise(() => {
    if (process.env.NODE_ENV !== "production") {
      mongoose.set("debug", true);
    }

    mongoose.connect(
      "mongodb://localhost/admin",
      {
        dbName: "searchBook",
        useNewUrlParser: true,
        useCreateIndex: true,
      },
      (error) => {
        if (error) console.log("몽고디비 연결 에러", error);
        else console.log("몽고디비 연결 성공");
      }
    );
  });
};

const disconnect = () => {
  new Promise(() => mongoose.disconnect());
};

mongoose.connection.on("error", (error) => {
  console.error("몽고디비 연결 에러", error);
});

mongoose.connection.on("disconnected", () => {
  console.error("몽고디비 연결이 끊켰습니다.");
});

module.exports = {
  connect,
  disconnect,
};
