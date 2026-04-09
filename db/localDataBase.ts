import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("myStorage");

export default db;
