# C) NodeJS - MongoDB 드라이버 연결

- 원래는 책에서는 루비 연결인데.. 그게 필요 없기도 해서 Node.Js 에서 몽고디비를 연결해 보자. 몽고디비 커넥션 가이드를 참조 했다.

- NodeJs.Driver 를 사용하여 MongoDB 인스턴스에 어떻게 연결하는지 알아 보자.

- 튜토리얼 참조 http://mongodb.github.io/node-mongodb-native/3.4/tutorials/main/

---

**Connection URI**

- Connection URI 는 드라이버가 MongoDB 에 연결하기 위해 사용해야 하는 것 중 하나이다. MongoDB에 어떻게 연결해야하며, 접속된 동안에 어떻게 동작해야 하는지 알려 준다. 다음은 connection URI 의 예이다.

![connection_string_parts](https://user-images.githubusercontent.com/50399804/114030947-d4b3fc80-98b5-11eb-97a6-bf3531ab4bab.png)

- 위의 예제에서 protocol 의 경우, **mongodb+srv** 는 [DNS Seedlist Connection Format](https://docs.mongodb.com/manual/reference/connection-string/#std-label-connections-dns-seedlist) 을 특정한다. 자세한 것은 링크를 참조하자.

- 다음의 글자 부분 credentials 는 username 과 password 를 사용하고 있다면, 이를 포함하고 있다. 이름과 비밀번호를 사용한 인증 방법을 사용하지 않는다면 이 부분을 생략할 수 있다.

- 다음의 hostname/IP and port of instance(s) 는 이름 그대로 MongoDB 인스턴스의 hostname 혹은 IP 주소 를 나타낸다.

- 마지막 connection 글자인 connection options 는 연결과 인증으로 사용되는 패러미터들을 포함한다. 여길 [참조](https://docs.mongodb.com/drivers/node/current/fundamentals/connection/#std-label-connection-options) 하자.

- 아래의 코드는 MongoDB 에 연결하는 샘플 코드이다.

_SampleConnection.js_

```javascript
const { MongoClient } = require("mongodb");

// Connection URI
const uri =
  "mongodb://127.0.0.1:27017/?compressors=disabled&gssapiServiceName=mongodb";

// Crate a new MongoClient
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    // Establish and verify connection
    await client.db("admin").command({ ping: 1 });
    console.log("Connected successfully to server");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
```

http://mongodb.github.io/node-mongodb-native/3.4/quick-start/quick-start/

- 퀵스타트 가이드를 참조해 보자.

```
mkdir myproject
cd myproject
```

```
npm init
```

```
npm install mongodb --save
```

- 적절한 MongoDB 버전을 설치하고 데이터베이스 디렉토리인 \/data 를 만들자. mongod 프로세스를 시작하자.

---

**Connect to MongoDB**

- app.js 를 생성하고, MongoDB 드라이버를 사용하여 기본 CRUD 작업을 위해 다음의 코드를 작성해 보자.

_app.js_

```javascript
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

// Connection URL
const url = "mongodb://localhost:27017";

// Database Name
const dbName = "myproject";

// Create a new MongoClient
const client = new MongoClient(url);

// Use connect method to connect to the Server
client.connect(function (err) {
  assert.strictEqual(null, err);
  console.log("Connected successfully to server");

  const db = client.db(dbName);

  client.close();
});
```

- command line 에서 app 을 실행하자.

```
node app.js
```

- server 에 성공적으로 접속했음을 앱이 콘솔에 프린트 할 것이다.

---

**Insert a Document**

- app.js에 insertMany 메서드를 사용하여 3개의 도큐먼트를 documents 컬렉션에 추가 해보자.

```javascript
const insertDocuments = function (db, callback) {
  // Get the documents collection
  const collection = db.collection("documents");

  // Insert some documents
  collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }], function (err, result) {
    assert.strictEqual(err, null);
    assert.strictEqual(3, result.result.n);
    assert.strictEqual(3, result.ops.length);
    console.log("Inserted 3 documents into the collection");
    callback(result);
  });
};
```

_app.js_

```javascript
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

// Connection URL
const url = "mongodb://localhost:27017";

// Database Name
const dbName = "myproject";
const client = new MongoClient(url, { useNewUrlParser: true });

// Use connect method to connect to the server
client.connect(function (err) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  const db = client.db(dbName);

  insertDocuments(db, function () {
    client.close();
  });
});
```

---

**Find All Documents**

- 모든 도큐먼트를 반환하는 쿼리를 추가하자.

```javascript
const findDocuments = function (db, callback) {
  const collection = db.collection("documents");

  collection.find({}).toArray(function (err, docs) {
    assert.strictEqual(err, null);
    console.log("Found the following records");
    console.log(docs);
    callback(docs);
  });
};
```

- 이 쿼리는 **documents** 컬렉션에 있는 모든 도큐먼트를 반환한다.

```javascript
// Use connect method to connect to the Server
client.connect(function (err) {
  assert.strictEqual(null, err);
  console.log("Connected successfully to server");

  const db = client.db(dbName);

  insertDocuments(db, function () {
    findDocuments(db, function () {
      client.close();
    });
  });
});
```

---

**Find Documents with a Query Filter**

- 쿼리 필터를 추가하여 요구를 충족하는 도큐먼트만 찾아 보자.

```javascript
const findDocuments = function (db, callback) {
  // Get the documents collection
  const collection = db.collection("documents");
  // Find some documents
  collection.find({ a: 3 }).toArray(function (err, docs) {
    assert.strictEqual(err, null);
    console.log("Found the following records");
    console.log(docs);
    callback(docs);
  });
};
```

---

**Update a document**

```javascript
const updateDocument = function (db, callback) {
  // Get the documents collection
  const collection = db.collection("documents");
  // Update document where a is 2, set b equal to 1
  collection.updateOne({ a: 2 }, { $set: { b: 1 } }, function (err, result) {
    assert.strictEqual(err, null);
    assert.strictEqual(1, result.result.n);
    console.log("Updated the document with the field a equal to 2");
    callback(result);
  });
};
```

- 위의 updateOne 메서드는 a가 2인 도큐먼트를 찾아, 새 필드인 b : 1 을 추가해준다.

---

**Remove a document**

- a : 3 인 도큐먼트를 모두 제거하자.

```javascript
const removeDocument = function (db, callback) {
  // Get the documents collection
  const collection = db.collection("documents");
  // Delete document where a is 3
  collection.deleteOne({ a: 3 }, function (err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log("Removed the document with the field a equal to 3");
    callback(result);
  });
};
```

```javascript
// Use connect method to connect to the Server
client.connect(function (err) {
  assert.strictEqual(null, err);
  console.log("Connected successfully to server");

  const db = client.db(dbName);

  insertDocuments(db, function () {
    updateDocument(db, function () {
      removeDocument(db, function () {
        findDocuments(db, function () {
          client.close();
        });
      });
    });
  });
});
```

---

**Index a Collection**

- 앱의 성능 향상을 위해 **documents** 컬렉션의 a 필드에 인덱스를 만들어 보자.

```javascript
const indexCollection = function (db, callback) {
  db.collection("documents").createIndex(
    { a: 1 },
    null,
    function (err, results) {
      console.log(results);
      callback();
    }
  );
};
```

```javascript
client.connect(function (err) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  const db = client.db(dbName);

  insertDocuments(db, function () {
    indexCollection(db, function () {
      client.close();
    });
  });
});
```
