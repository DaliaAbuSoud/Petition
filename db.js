// where we write all database setup. its like our middle man between database and server.
let dbUrl =
    process.env.DATABASE_URL ||
    "postgres:postgres:postgres@localhost:5432/msg-petition";
let spicedPg = require("spiced-pg");
let db = spicedPg(dbUrl);

//query method, allows us to talk to our database and we pass to it whatever you want to say to teh database.

// ************* ADD USER DATA INTO AN ESISTING ROW ****************
module.exports.addUserData = (
    firstName,
    lastName,
    email,
    password,
    city,
    country,
    age
) => {
    return db.query(
        `INSERT INTO userdata (firstName, lastName, email, hashedPass, city, country, age)
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [firstName, lastName, email, password, city, country, age]
    );
};

// *************** UPDATE EXSISTING USER DATA  ***********************
module.exports.updateUserData = (userData, id) => {
    const { firstName, lastName, hashedPass, city, country, age } = userData;
    return db.query(
        ` UPDATE userdata SET firstname=$1, lastname=$2, hashedPass=$3, city=$4, country=$5, age=$6 WHERE id=$7;`,
        [firstName, lastName, hashedPass, city, country, age, id]
    );
};

// *************** GET EXSISTING USER DATA  ***********************

module.exports.getUserData = () => {
    return db.query("SELECT * FROM userdata;");
};

// *********GET SINGLE EXSISTING USER DATA FOR ONE SPESIFIC USER ***************

module.exports.getSingleUser = (id) => {
    return db.query(`SELECT * FROM userdata WHERE id=${id};`).then((result) => {
        return result.rows[0];
    });
};

// *************** GET USER DATA BASED ON CITY ***********************

module.exports.getCityUsersData = (city) => {
    return db
        .query(`SELECT * FROM userdata WHERE city='${city}';`)
        .then((result) => {
            console.log("db result", result);
            return result.rows;
        });
};

// *************** GET USER DATA BASED ON COUNTRY ***********************

module.exports.getCountriesUsersData = (country) => {
    return db
        .query(`SELECT * FROM userdata WHERE country='${country}';`)
        .then((result) => {
            return result.rows;
        });
};

// *************** GET THE HASHED PASSWORD  ***********************

module.exports.getPasswordHash = (hashedPass) => {
    return db
        .query(
            `SELECT hashedPass FROM userdata WHERE hashedPass=${hashedPass};`
        )
        .then((result) => {
            return result.rows[0].hashedPass;
        });
};

// ********CHECKING EMIAL FOR LOGIN AUTHORIZATION  ****************

module.exports.authorizeLogin = (email) => {
    return db.query(
        `SELECT email, hashedPass, id FROM userdata WHERE email=$1`,
        [email]
    );
};

// *************** ADD SIGNATURE TO USER DATA ***********************

module.exports.setSignature = (signatureUrl, id) => {
    return db.query(` UPDATE userdata SET signatureUrl=$1 WHERE id =$2`, [
        signatureUrl,
        id,
    ]);
};

// *************** GET SIGNATURE FROM USER DATA ***********************

module.exports.getSignature = (id) => {
    return db
        .query(`SELECT signatureUrl FROM userdata WHERE id=${id};`)
        .then((result) => {
            return result.rows[0].signatureurl;
        });
};

// *************** GET TOTAL SIGNERS COUNT ***********************

module.exports.usersCount = () => {
    return db.query(`SELECT COUNT(*) FROM userdata`).then((results) => {
        return results.rows[0].count;
    });
};

// *************** REMOVE SIGNATURE  ***********************
module.exports.removeSig = (signatureUrl, id) => {
    return db.query(` UPDATE userdata SET signatureurl=$1  WHERE id=$2;`, [
        signatureUrl,
        id,
    ]);
};
