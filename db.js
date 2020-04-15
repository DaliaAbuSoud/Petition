// where we write all database setup. its like our middle man between database and server.

let spicedPg = require("spiced-pg");
let db = spicedPg("postgres:postgres:postgres@localhost:5432/userdata");

let sigURL;
//query method, allows us to talk to our database and we pass to it whatever you want to say to teh database.

//this is how the database query will look like.
module.exports.getUserData = () => {
    return db.query("SELECT * FROM userdata;");
}; // this is to export the function from database so we can use the return somwhere else

module.exports.addUserData = (
    firstName,
    lastName,
    city,
    country,
    signatureUrl
) => {
    let dbtest = db.query(
        `
    INSERT INTO userdata (firstName, lastName, city, country, signatureUrl)
    VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [firstName, lastName, city, country, signatureUrl]
    );
    console.log("DBTEST:", dbtest);
    return dbtest;
};

module.exports.getSignature = (id) => {
    return db
        .query(`SELECT signatureUrl FROM userdata WHERE id=${id};`)
        .then((result) => {
            return result.rows[0].signatureUrl;
        });
};
