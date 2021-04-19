const axios = require("axios");
const { connect, disconnect } = require("./schemas");
const Book = require("./schemas/book");
const dotenv = require("dotenv");
dotenv.config();

const keywords = ["자바", "자바스크립트"];

const config = {
  headers: {
    Authorization: process.env.KAKAO_KEY,
  },
};

function getBooks(keyword) {
  return axios.get(process.env.KAKAO_URL + encodeURI(keyword), config);
}

async function startSearch(keyword) {
  try {
    let { data } = await getBooks(keyword);
    return data.documents;
  } catch (error) {
    console.log(error);
  }
}

async function startEnd() {
  connect();

  const documents = await startSearch("자바");

  Book.insertMany(documents).then(function () {
    console.log("finished");
  });

  disconnect();
}

startEnd();
