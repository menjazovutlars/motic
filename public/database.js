import mysql from 'mysql';

const notes = [];

const con = mysql.createConnection({
  host: '85.10.205.173',
  user: 'team4real',
  password: 'isthistherealworld',

});

con.connect((err) => {
  if (err) throw err;
  const sql = 'SELECT * FROM sound_database.notes';
  con.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    result.forEach((row) => {
      notes.push(row);
    });
  });
});

export default notes;
