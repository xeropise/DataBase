- MongoDB 쉘을 사용한 일련의 연습을 통해 MongoDB 의 기본적인 개념을 배워 보자.

## 2.1 MongoDB 쉘 경험하기

### 2.1.1 쉘 시작하기

- mongod 으로 인스턴스를 실행하고, mongo 실행 파일을 실행해서 MongoDB 쉘을 시작하자.

```
mongo
```

### 2.1.2 데이터베이스, 컬렉션, 도큐먼트

- 도큐먼트(document) : MongoDB 에서 정보를 JSON 형태로 표현 하는 단위

- 컬렉션(collection) : 도큐먼트를 그룹해서 모아놓은 것, RDBMS 의 테이블

- 데이터베이스 : 컬렉션의 물리적인 컨테이너이다. 컬렉션들을 구분하는 네임스페이스로 사용된다.

![캡처](https://user-images.githubusercontent.com/50399804/113882020-ea62ec80-97f7-11eb-8de2-4e21a2a9e2f5.JPG)

- 튜토리얼 연습을 위한 네임스페이스를 유지하기 위해 tutorial 이라고 하는 데이터베이스로 바꿔 보자

```
use tutorial
switched to db tutorial
```

- tutorial 데이터 베이스를 생성하지도 않았는데, 어떻게 그 데이터베이스로 변경할 수 있었을까? MongoDB 에서는 데이터베이스를 만드는 것이 필요 없다.
  데이터베이스와 컬렉션은 도큐먼트가 처음 입력될 때 생성된다. 런타임 시 생성, 데이터베이스나 컬렉션이 우연히 생성될까 우려된다면 드라이버에서 지원되는 strict 모드를 통해 실수를 미연에 방지할 수 있다.

- 첫 번째 도큐먼트를 만들어 보자.

---

### 2.1.3 삽입과 질의

- 도큐먼트를 저장하기 위해서는 컬렉션을 지정해야 한다. user 컬렉션에 저장해 보자.

```
> db.users.insert({username: "smith"})
```

- 위 코드를 입력하면 약간 지연되는 느낌을 가질 수 있는데 이 코드를 실행하기 전까지는 tutorial 데이터베이스와 user 컬렉션이 하드디스크에 아직 생성되지 않은 상태이므로 초기 데이터 파일을 할당하느라 지연되었다.

- 도큐먼트 확인을 위해 다음을 실행해 보자.

```
> db.users.find()
```

**MongoDB 의 \_ID 필드**

- 도큐먼트가 생성될 때 MongoDB 객체 ID (ObjectID) 라는 특별한 값을 생성해서 도큐먼트에 자동으로 추가 한다.

- 컬렉션에 두 번째 사용자를 추가하자.

```
> db.users.insert({username: "jones"})
```

- 이제 컬렉션에 두 개의 도큐먼트가 있다. count 명령어를 사용해 보자.

```
> db.users.count()
2
```

- find 메서드에 간단한 쿼리 셀렉터라는 일치 여부를 검사하기 위한 조건으로 사용되는 도큐먼트를 넘겨, 특정 값을 찾을 수 있다.

```
> db.users.find({username: "jones"})
```

- 참고로 db.users.find() 와 db.users.find({}) 는 동일하다.

- 쿼리 셀렉터에 여러 가지 필드를 명시할 수도 있다.

```
db.users.find({
... _id : ObjectId("xxxxxxxx"),
... username: "smith"
... })
```

- $and 연산자를 사용할 수도 있다.

```
db.users.find({ $and: [
... { _id: ObjectId("xxxxxxxxx)},
... { username: "smith" }
... ]})
```

- $or 연산자도 있다.

```
db.users.find({ $or : [
... { username: "smith" },
... { username: "jones" },
... ]})
```

---

### 2.1.4 도큐먼트 업데이트

- 업데이트 쿼리는 최소 두 개의 매개변수가 필요하며, 첫 번째 매개변수는 업데이트할 도큐먼트에 대한 것, 두 번째 매개변수는 수정할 내용에 대한 것이다. 기본적으로 update() 메서드가 단일 도큐먼트를 업데이트 하지만, 여러 도큐먼트의 업데이트를 수행하거나, 전체 컬렉션을 업데이트할 수도 있다.

- 두 종류의 업데이트가 존재한다.
  - 연산자 업데이트 ( 도큐먼트의 특정 키의 값을 수정)
  - 대체 업데이트 ( 오래된 도큐먼트를 새로운 도큐먼트로 대체)

1. 연산자 업데이트

```
> db.users.update({username: "smith"}, {$set: {coutnry: "Canada"}})
```

> smith 인 도큐먼트를 찾아서 country 의 값을 Canada 로 수정

2. 대체 업데이트

```
> db.users.update({username: "smith"}, {country: "Canada"})
```

> smith 인 도큐먼트를 country 필드만을 포함하는 도큐먼트로 대체

- 모두 \_id 는 동일하지만 데이터는 달라졌음을 find() 로 확인할 수 있다. 필드를 추가하거나 값을 설정하기를 원한다면 반드시 $set 연산자를 사용하자.

- $unset 연산자를 써서 쉽게 값을 지울수도 있다.

```
> db.users.update({username: "smith"}, {$unset: {country: 1}})
```

**더 발전된 업데이트**

- $set 연산자를 다시 사용할 수도 있으나, 영화 배열 전체에 대해 다시 쓰기를 해야 하므로, 하나의 값을 추가하는 경우에는 $push 나 $addToSet 을 사용하는 것이 낫다. 두 가지 모두 배열에 아이템을 추가하는데, $addToSet 은 값을 추가할 때 중복되지 않도록 한다.

```
> db.users.update( {"favorites.movies": "Casablanca"}),
... {$addToSet: {"favorites.movies": "The Maltese Falcon"} },
... false,
... true )
```

- 첫 번째 매개변수는 쿼리 셀렉터, 두번 쨰 인수는 The Mlatese Falcon 을 $addToSet 연산자를 이용해서 리스트에 추가 한다.

- 세 번째는 false 인데 해당되는 도큐먼트가 존재하지 않을 때 update 연산지 도큐먼트를 입력해야 하는지 아닌지를 결정 한다.

- 네 번째 인수의 값인 true 는 이 업데이트가 다중 업데이트, 즉 하나 이상의 도큐먼트에 대해 업데이트가 이루어져야 함을 뜻한다. 앞에서 말했듯 MongoDB 에서는 쿼리 셀레겉의 조건에 맞는 첫 번째 도큐먼트에 대해서만 업데이트를 하느 ㄴ것이 기본설정이나, 조건에 일치하는 모든 도큐먼트에 대해 업데이트 연산을 수행하려면 다음과 같이 명시적으로 지정해야 한다.

---

### 2.1.5 데이터 삭제

- 삭제 명령에서는 매개변수가 주어지지 않으면 컬렉션의 모든 도큐먼트를 지운다.

```
> db.users.remove({});
```

- 조건에 맞는 도큠너트를 지워야할 때는 remove() 메서드에 쿼리 셀렉터를 넘겨 주면 된다.

```
> db.users.remove({"favorites.cities": "Cheyenne"})
```

- remove() 연산은 컬렉션을 지우지 않다는 것을 알아야 한다. 컬렉션 내에 존재하는 도큐먼트를 지울 뿐이며, SQL 에 DELTE 명령어와 비슷하다.

- 어느 한 컬렉션을 모든 인덱스와 함꼐 지우려고 하면 drop() 명령어를 사용하면 된다.

```
> db.users.drop()
```

---

### 2.1.6 기타 쉘 특징

- 쉘은 MongoDB 로 작업하는 것을 훨씬 쉽게 만들어 준다. 다음 명령어로 쉘에 대한 많은 정보를 얻을 수 있다.

```
> help
```

- MongoDB 쉘을 시작할 떄 사용할 수 있는 옵션 또한 존재하는데 help 플래그를 추가하면 된다.

```
> mongo --help
```

---

## 2.2 인덱스 생성과 질의

- 질의 성능을 높이기 위해서는 인덱스를 생성하는 것이 보통이다. MongoDB 인덱스는 쉘에서 쉽게 생성할 수 있다.

### 2.2.1 대용량 컬렉션 생성

- 컬렉션에 맣은 도큐먼트가 있어야만 인덱싱에 대한 예제로서 의미가 있으므로. numbers 라는 컬렉션에 20,000 개의 간단한 도큐먼트를 추가하자.

```
> for(i=0; i < 20000; i++) {
    db.numbers.save({num: i});
}
```

> save 는 나중에 알아보자

```
> db.numbers.count()

> db.numbers.find()

> db.numbers.find({num: 500})
```

**범위 쿼리**

- $gt, $lt, $gte, $lte $ne 등의 연산자를 통해 상한값과 하한 값을 지정할 수 있다.

```
> db.nubersm.find( {num: {"$gt": 20, "$lt": 25 }})
```

---

### 2.2.2 인덱싱과 explain()

- RDBMS 로 작업한 경험이 있다면 디버깅 또는 쿼리 최적화를 위한 유용한 도구인 SQL의 EXPLAIN 이 익숙할 지 모르겠다. 데이터베이스가 쿼리를 받았을 때 이를 실행하는 방법에 대해 계획을 세워야 하며, 이를 쿼리 플랜(query plan) 이라 부른다.

- EXPLAIN 은 쿼리가 사용한 인덱스가 있을 경우에 어떤 인덱스를 사용했는지를 찾아서 쿼리 경로에 대한 정보를 제공해 줌으로써 개발자로 하여금 시간이 많이 소요되는 연산을 찾아내도록 도와준다.

- MongoDB 에도 이와 비슷한 EXPLAIN 이 있는데, 이를 이해하기 위해 이미 실행한 쿼리에 대해 적용해 보자.

![캡처](https://user-images.githubusercontent.com/50399804/113876987-3cedda00-97f3-11eb-90d1-6983e9d9766d.JPG)

- explain() 의 결과를 자세히 보면, 쿼리 엔진이 4개의 결과를 반환하기 위해 컬렉션의 전부인 20,000 개의 도큐먼트 (docsExamined) 를 스캔한 것을 알 수 있다. totalKeysExamined 필드는 스캔한 인덱스 엔트리의 개수를 보여 주는데, 위의 리스트에서는 0 인 것을 확인할 수 있다.

- 스캔한 도큐먼트 수와 결과값의 큰 차이는 이 쿼리가 비효율적으로 실행되었음을 보여 준다. 이 컬렉션은 인덱스가 필요한데, createIndex() 명령을 사용하여 num 키에 대한 인덱스를 생성할 수 있다.

```
> db.numbers.createIndex({num: 1})
{
        "createdCollectionAutomatically" : false,
        "numIndexesBefore" : 1,
        "numIndexesAfter" : 2,
        "ok" : 1
}
```

- MongoDB 3.0 에서 createIndex() 는 기존의 ensureIndex() 를 대체하므로 참조하자.

- createIndex() 메서드에 도큐먼트를 매개변수로 넘겨줌으로써 인덱스 키를 정의한다. {num:1} 도큐먼트는 numbers 컬렉션에 있는 모든 도큐먼트의 num 키에 대해 오름차순 인덱스를 생성함을 뜻한다.

- 인덱스가 성공적으로 생성되었는지는 getIndexes() 메서드로 확인할 수 있다.

```
> db.numbers.getIndexes()
[
        {
                "v" : 2,
                "key" : {
                        "_id" : 1
                },
                "name" : "_id_"
        },
        {
                "v" : 2,
                "key" : {
                        "num" : 1
                },
                "name" : "num_1"
        }
]
```

- 이 컬렉션은 2 개의 인덱스를 가지고 있는데, 첫 번째 인덱스는 모든 컬렉션에서 자동으로 생성되는 표준 _id 인덱스이고, 두 번쨰 인덱스는 num 에 대한 인덱스이다. 해당 필드들에 대한 인덱스를 각각 \_id_, num_1 이라 부른다. 만약 어떤 이름도 부여하지 않는다면 자동적으로 의미 있는 이름을 부여하게 된다.

- 다시 explain() 메서드를 실행하면 이전과는 큰 차이가 있다는 것을 확인할 수 있다.

```
> db.numbers.find({num: {"$gt": 19995}}).explain("executionStats")
{
        "queryPlanner" : {
                "plannerVersion" : 1,
                "namespace" : "test.numbers",
                "indexFilterSet" : false,
                "parsedQuery" : {
                        "num" : {
                                "$gt" : 19995
                        }
                },
                "winningPlan" : {
                        "stage" : "FETCH",
                        "inputStage" : {
                                "stage" : "IXSCAN",
                                "keyPattern" : {
                                        "num" : 1
                                },
                                "indexName" : "num_1",
                                "isMultiKey" : false,
                                "multiKeyPaths" : {
                                        "num" : [ ]
                                },
                                "isUnique" : false,
                                "isSparse" : false,
                                "isPartial" : false,
                                "indexVersion" : 2,
                                "direction" : "forward",
                                "indexBounds" : {
                                        "num" : [
                                                "(19995.0, inf.0]"
                                        ]
                                }
                        }
                },
                "rejectedPlans" : [ ]
        },
        "executionStats" : {
                "executionSuccess" : true,
                "nReturned" : 4,
                "executionTimeMillis" : 1,
                "totalKeysExamined" : 4,
                "totalDocsExamined" : 4,
                "executionStages" : {
                        "stage" : "FETCH",
                        "nReturned" : 4,
                        "executionTimeMillisEstimate" : 0,
                        "works" : 5,
                        "advanced" : 4,
                        "needTime" : 0,
                        "needYield" : 0,
                        "saveState" : 0,
                        "restoreState" : 0,
                        "isEOF" : 1,
                        "docsExamined" : 4,
                        "alreadyHasObj" : 0,
                        "inputStage" : {
                                "stage" : "IXSCAN",
                                "nReturned" : 4,
                                "executionTimeMillisEstimate" : 0,
                                "works" : 5,
                                "advanced" : 4,
                                "needTime" : 0,
                                "needYield" : 0,
                                "saveState" : 0,
                                "restoreState" : 0,
                                "isEOF" : 1,
                                "keyPattern" : {
                                        "num" : 1
                                },
                                "indexName" : "num_1",
                                "isMultiKey" : false,
                                "multiKeyPaths" : {
                                        "num" : [ ]
                                },
                                "isUnique" : false,
                                "isSparse" : false,
                                "isPartial" : false,
                                "indexVersion" : 2,
                                "direction" : "forward",
                                "indexBounds" : {
                                        "num" : [
                                                "(19995.0, inf.0]"
                                        ]
                                },
                                "keysExamined" : 4,
                                "seeks" : 1,
                                "dupsTested" : 0,
                                "dupsDropped" : 0
                        }
                }
        },
        "serverInfo" : {
                "host" : "DESKTOP-IDE9V6C",
                "port" : 27017,
                "version" : "4.4.4",
                "gitVersion" : "8db30a63db1a9d84bdcad0c83369623f708e0397"
        },
        "ok" : 1
}
```

- num 에 대한 num_1 인덱스를 사용하므로 쿼리에 해당하는 4 개의 도큐먼트를 스캔하고, 쿼리 실행 시간도 줄었음을 확인할 수 있다.

- 좋아 보이지만, 물론 인덱스는 어느 정도의 대가를 감수해야 한다. 인덱스는 어느 정도의 공간이 필요하고 미세하게 insert 성능을 떨어트리지만, 쿼리 최적화를 위해 꼭 필요한 도구이다.
  자세한 것은 8장에 언급되어 있다.

---

## 2.3 기본적인 관리

- mongod 프로세스에 대한 정보를 얻는 몇 가지 방법을 알아 보자. 컬렉션이 차지하고 있는 데이터의 크기나 컬렉션에서 정의한 인덱스의 개수 같은 정보를 얻을 수도 있다.

- MongoDB 에서 제공되는 명령어는 어떤 것들인지 살펴보고, 어떻게 사용하는지 알아보자.

---

### 2.3.1 데이터베이스 정보 얻기

- MongoDB 의 한 인스턴스에 어떤 컬렉션과 데이터베이스가 존재하는지 알아야 될 수 있다.

- show dbs 는 시스템상의 모든 데이터베이스를 보여 준다.

```
> show dbs
admin   0.000GB
config  0.000GB
local   0.000GB
test    0.001GB
```

- show collections 는 현재 사용 중인 데이터베이스에서 정의된 모든 컬렉션을 보여 준다. 만일 tutorial 데이터베이스가 여전히 선택되어 있다면, 이전의 예제해서 작업했던 컬렉션을 모두 보여 줄 것이다.

```
> show collections
numbers
```

- 데이터베이스와 컬렉션에 대해서 좀 더 하위 계층의 정보를 얻기 위해서는 stat() 명령이 유용하다.

```
> db.stats()
{
        "db" : "test",
        "collections" : 1,
        "views" : 0,
        "objects" : 20000,
        "avgObjSize" : 35,
        "dataSize" : 700000,
        "storageSize" : 274432,
        "indexes" : 2,
        "indexSize" : 446464,
        "totalSize" : 720896,
        "scaleFactor" : 1,
        "fsUsedSize" : 182159151104,
        "fsTotalSize" : 248844943360,
        "ok" : 1
}
```

- 각 컬렉션에 대해서도 stats() 를 실행시킬 수 있다.

```
> db.numbers.stats()
```

> 길어서 내용 생략

---

### 2.3.2 명령어가 작동하는 방식

- MongoDB 에는 데이터베이스 명령어라고 하는 삽입, 업데이트, 삭제 질의 연산과는 구별되는 것이 있다. stats() 와 같이 데이터베이스 관리를 하기 위한 것이지만, 맵 리듀스와 같은 MongoDB 핵심 기능을 설정할 때도 사용한다.

- 데이터베이스 명령어는 각 명령의 기능과 상관없이 공통적인 것이 있는데, $cmd 라고 부르는 특별한 종류의 가상 컬렉션에 대한 쿼리로 구현된다. 이해를 위해 간단한 예를 만들어 보자.

```
> db.runCommand( {dbstats: 1} )
{
        "db" : "test",
        "collections" : 1,
        "views" : 0,
        "objects" : 20000,
        "avgObjSize" : 35,
        "dataSize" : 700000,
        "storageSize" : 274432,
        "indexes" : 2,
        "indexSize" : 446464,
        "totalSize" : 720896,
        "scaleFactor" : 1,
        "fsUsedSize" : 182161485824,
        "fsTotalSize" : 248844943360,
        "ok" : 1
}
```

- 결과는 stats() 명령을 실행한 것과 동일한데, runCommand 메서드에 매개변수로 명령을 도큐먼트로 정의하여 넘겨주면 어떤 명령이라도 간단히 실행할 수 있다.

- 컬렉션에 대해 stats 명령을 실행해 보자.

```
> db.rudb.runCommand( {collstats: "numbers"} )
```

- runCommand() 메서드가 어떻게 작동하는지 알아야 데이터베이스 명령어에 핵심에 이룰 수 있는데, MongoDB 쉘을 메서드를 실행할 때 괄호가 없는 경우 그 메서드가 어떻게 구현되는지 프린트 한다.

```
> db.runCommand
function(obj, extra, queryOptions) {
    "use strict";

    // Support users who call this function with a string commandName, e.g.
    // db.runCommand("commandName", {arg1: "value", arg2: "value"}).
    var mergedObj = this._mergeCommandOptions(obj, extra);

    // if options were passed (i.e. because they were overridden on a collection), use them.
    // Otherwise use getQueryOptions.
    var options = (typeof (queryOptions) !== "undefined") ? queryOptions : this.getQueryOptions();

    try {
        return this._runCommandImpl(this._name, mergedObj, options);
    } catch (ex) {
        // When runCommand flowed through query, a connection error resulted in the message
        // "error doing query: failed". Even though this message is arguably incorrect
        // for a command failing due to a connection failure, we preserve it for backwards
        // compatibility. See SERVER-18334 for details.
        if (ex.message.indexOf("network error") >= 0) {
            throw new Error("error doing query: failed: " + ex.message);
        }
        throw ex;
    }
}
>
```

- 책하고 전혀 다르잖아... 당황스럽다. 책에 설명에 의하면 $cmd 라는 특수한 컬렉션에 대해 실행하는 쿼리라고 데이터베이스 명령어를 바르게 정의하느 ㄴ거라고 한다... 근데 위는 아닌데?

- 이를 참조하여 stats 명령을 수동으로 실행하는 쿼리를 실행해 보자.

```
> db.$cmd.findOne( {collstats: "numbers"})
```

---

## 2.4 도움말 얻기

- db.help() 는 데이터베이스에 대해 일반적으로 수행되는 메서드 리스트를 보여준다.

- db.numbers.help() 는 컬렉션에 대해 수행되는 메서드를 보여 준다.

- 자동 탭 완선 기능도 내정되어 있다. 메서드의 첫 번쨰 문자를 입력하고 탭 키를 두 번 치면 입력한 문자로 시작되는 메서드 리스트를 볼 수 있다. get 으로 시작되는 컬렉션 메서드를 보여준다.

```
> db.numbers.get
db.numbers.getCollection(          db.numbers.getIndexKeys(           db.numbers.getIndices(             db.numbers.getPlanCache(           db.numbers.getShardDistribution(   db.numbers.getSplitKeysForChunks(
db.numbers.getDB(                  db.numbers.getIndexSpecs(          db.numbers.getMongo(               db.numbers.getQueryOptions(        db.numbers.getShardVersion(        db.numbers.getWriteConcern(
db.numbers.getFullName(            db.numbers.getIndexes(             db.numbers.getName(                db.numbers.getSecondaryOk(         db.numbers.getSlaveOk(
```

- 이외의 것들은 http://docs.mongodb.org 에서 확인할 수 있다. 공식 매뉴얼은 매우 유용한 자료로, 튜토리얼 및 레퍼런스 자료와 더블어 최신 배포에 관한 것을 확인할 수 있으며 언어별 드라이버에 관한 것도 찾을 수 있다.

- 메서드가 어떻게 구현되었는지 쉘을 통해 쉽게 알수 있다고, 앞에서 언급했는데 save() 메서드가 정확히 어떻게 구현되었는지를 알아 보자.

```
> db.numbers.save
function(obj, opts) {
    if (obj == null)
        throw Error("can't save a null");

    if (typeof (obj) == "number" || typeof (obj) == "string")
        throw Error("can't save a number or string");

    if (typeof (obj._id) == "undefined") {
        obj._id = new ObjectId();
        return this.insert(obj, opts);
    } else {
        return this.update({_id: obj._id}, obj, Object.merge({upsert: true}, opts));
    }
}
```

- save() 가 단지 insert() 와 update() 의 래퍼(wrapper) 임을 알 수 있다. obj 인수의 타입을 확인한 뒤에, 저장하려는 객체에 \_id 필드가 없다면, id 필드를 추가하고 insert() 를 호출하고. 그렇지 않을 경우에는 업데이트가 수행된다.

- 쉘의 메서드가 어떻게 구현되었는지 조사하려면 위의 방법을 자주 사용하길 바란다.
