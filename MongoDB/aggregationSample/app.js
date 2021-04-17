const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

// Connection URL
const url = "mongodb://localhost:27017";

// Database Name
const dbName = "test";

// Create a new MongoClient
const client = new MongoClient(url);

client.connect(function (err) {
  assert.strictequal(null, err);
  console.log("Connected successfully to server");

  const db = client.db(dbName);

  let products = db.collection("products");

  let product = products.findOne({ slug: "wheelbarrow-9092" });

  let ratingSummary = db
    .collection("reviews")
    .aggregate([
      { $match: { product_id: product["_id"] } },
      {
        $group: {
          _id: "$product_id",
          average: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ])
    .next();

  let countsByRating = db
    .collection("reviews")
    .aggregate([
      { $match: { product_id: product["_id"] } }, // 제품 선택
      { $group: { _id: "$rating", count: { $sum: 1 } } }, // 각 등급별 리뷰수 계산
    ])
    .toArray(); //결과 커서를 배열로 변환

  db.products.aggregate([
    { $group: { _id: "$main_cat_id", count: { $sum: 1 } } },
  ]);

  db.collection("mainCategorySummary").deleteMany({});

  db.collection("products")
    .aggregate([{ $group: { _id: "$main_cat_id", count: { $sum: 1 } } }])
    .forEach(function (doc) {
      var category = db.collection("categories").findOne({ _id: doc._id });
      if (category !== null) {
        doc.category_name = category.name;
      } else {
        doc.category_name = "not found";
      }
      db.collection("mainCategorySummary").insertOne(doc);
    });

  products.aggregate([{ $project: { category_ids: 1 } }]);

  products.aggregate([
    { $project: { category_ids: 1 } }, // 카테고리 ID 배열만 다음 단계로 전달, _id 속성은 기본적으로 전달
    { $unwind: "$category_ids" }, // category_id 의 모든 배열 항목에 대한 출력 도큐먼트를 생성한다.
    { $group: { _id: "$category_ids", count: { $sum: 1 } } },
    { $out: "countsByCategory" },
  ]);

  db.collection("reviews").aggregate([
    {
      $group: {
        _id: "$user_id",
        count: { $sum: 1 },
        avg_helpful: { $avg: "$helpful_votes" },
      },
    },
  ]);

  db.orders.aggregate([
    { $match: { purchase_data: { $gre: new Date(2010, 0, 1) } } },
    {
      $group: {
        _id: {
          year: { $year: "$purchase_data" },
          month: { $month: "$purchase_data" },
        },
        count: { $sum: 1 },
        totla: { $sum: "$sub_total" },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  let upperManhattenOrder = {
    "shipping_address.zip": { $gte: 10019, $lt: 10040 },
  };
  let sumByUserId = { _id: "$user_id", total: { $sum: "$sub_total" } };

  let orderTotalLarge = { total: { $gt: 10000 } };

  let sortTotalDesc = { total: -1 };

  db.collection("orders").aggregate([
    { $match: upperManhattenOrder },
    { $group: sumByUserId },
    { $match: orderTotalLarge },
    { $sort: sortTotalDesc },
    { $out: "targetedCustomers" },
  ]);

  db.collection("orders").aggregate([
    { $group: sumByUserId },
    { $match: orderTotalLarge },
    { $limit: 10 },
  ]);

  db.collection("users").aggregate([
    { $match: { username: "kbanker" } },
    {
      $project: {
        name: { $concat: ["$first_name", " ", "$last_name"] },
        firstInitial: { $substr: ["$first_name", 0, 1] },
        usernameUpperCase: { $toUpper: "$username" },
      },
    },
  ]);

  let testSet1 = ["tools"];

  db.collection("products").aggregate([
    {
      $project: {
        productName: "$name",
        tags: 1,
        setUnion: { $setUnion: ["$tags", testSet1] },
      },
    },
  ]);
});
