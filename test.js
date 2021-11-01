log(Date.now())
sleep(2000)
log(Date.now())





// let db = sqlite.open("./data/data.db", {version: 3})

    //    db.execSQL("CREATE TABLE IF NOT EXISTS WXMSG(" +
    //        "`id` INTEGER PRIMARY KEY AUTOINCREMENT, " +
    //        "`time` TEXT NOT NULL, " +
    //        "`name` INTEGER NOT NULL, " +
    //        "`vcode` INTEGER NOT NULL, " +
    //        "`money` INTEGER NOT NULL, " +
    //        "`msg` INTEGER" +
    //    ")");
// log("插入张三: ", db.insert("WXMSG", {
//     msg: '9018'
// }))


// 插入三个数据
// log("插入张三: ", db.insert("STUDENT", {
//     name: "张三",
//     age: 18,
//     score: 90
// }))

// // 查询数据
// log("所有数据: ", db.rawQuery("SELECT * FROM STUDENT", null).all());
// log("第一个数据: ", db.rawQuery("SELECT * FROM STUDENT", null).single());

// // 修改数据
// log("修改李四分数: ", db.update("STUDENT", {score: 70}, "name = ?", ["李四"]));
// log("修改后李四: ", db.rawQuery("SELECT * FROM STUDENT WHERE name = ?", ["李四"]).single());

// // 删除数据
// log("删除分数>80的学生: ", db.delete("STUDENT", "score > 80", null));
// // 删除后遍历数据
// log("删除后:");
// let cursor = db.rawQuery("SELECT * FROM STUDENT", null);
// while(cursor.moveToNext()) {
//     log(cursor.pick());
// }
// // 记得关闭cursor
// cursor.close();

// 还要关闭数据库
db.close()