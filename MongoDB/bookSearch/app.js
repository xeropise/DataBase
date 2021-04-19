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

  await searchKeyword("자바");
  await searchKeyword("자바스크립트");
  await searchKeyword("타입스크립트");

  disconnect();
}

startEnd();
