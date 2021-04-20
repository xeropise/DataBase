const axios = require("axios");
const { connect, disconnect } = require("./schemas");
const Book = require("./schemas/book");
const dotenv = require("dotenv");
dotenv.config();

const config = {
  headers: {
    Authorization: process.env.KAKAO_KEY,
  },
};

function getBooks(keyword) {
  return axios.get(process.env.KAKAO_URL + encodeURI(keyword), config);
}

async function searchKeyword(keyword) {
  try {
    let { data } = await getBooks(keyword);
    await Book.insertMany(data.documents, { ordered: false });
  } catch (error) {
    console.log(error);
  } finally {
  }
}

async function startEnd() {
  await connect();

  let keywords = [
    "자바",
    "파이썬",
    "자바스크립트",
    "타입스크립트",
    "몽고 디비",
  ];

  Promise.all(
    keywords.map(async (v) => {
      await searchKeyword(v); // map으로 모든 배열을 promise 로 변환
    })
  ).then(() => disconnect());
}

module.exports = startEnd;
