const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3002, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//get all players

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      cricket_team
    ORDER BY
      player_id;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//add player to the database
app.post("/players/", async (request, response) => {
  let playerDetails = request.body;
  const { player_name, jersey_number, role } = playerDetails;

  let addPlayerQuery = `
    INSERT INTO cricket_team(player_name,jersey_number,role) 
    VALUES ('${player_name}',${jersey_number},'${role}')`;
  await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//get player by player_id
app.get("/player/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT
      *
    FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
  const book = await db.get(getPlayerQuery);
  const playersArray = await database.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//update player

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const bookDetails = request.body;
  const { player_name, jersey_number, role } = bookDetails;
  const updatePlayerQuery = `
    UPDATE
      cricket_team
    SET
      player_name='${player_name}',
      jersey_number=${jersey_number},
      role='${role}'
    WHERE
      player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated Successfully");
});

//delete player from table

app.delete("/player/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Deleted Successfully");
});

module.exports = app;
