import express from "express";
import cors from "cors";
import pg, { Pool } from 'pg';

const app = express();
const port = 5000;

//Databse setup
const pool = new Pool({
    user : 'postgres',
    host : 'localhost',
    password : 'Ram@1706',
    database : 'journal',
    port : 5432
});

//DB Connection
pool.connect((err)=>{
    if(err){
        console.log("Database is not connected!!");
    }
    else{
        console.log("Connected to journal database!!");
    }
});

//Cors origin for breaking same origin policy
const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET,POST,PUT,DELETE",          
  allowedHeaders: ["Content-Type", "Authorization"],
};

//to receive request as json
app.use(express.json());

//CORS for breaking same origin policy
app.use(cors());

//uploading journal in db
app.post("/api/upload", async (req,res)=>{
    try{
        const {title,content} = req.body;
        const result = await pool.query('INSERT INTO journals (title, content) VALUES ($1, $2) RETURNING *',
        [title, content]);
        if(result.rows.length > 0)
            res.status(200).json({message : "Your journal posted successfully !!"});
    }catch(err){
        res.status(500).json({message : err.message});
    }
});

//getting journal from db
app.get("/api/getJournal", async (req,res)=>{
    try{
        const result = await pool.query("SELECT * FROM journals");
        if(result.rows.length > 0){
            // console.log(result);
            res.status(200).json(result);
        }
    }catch(err){
        res.json(500).json({message : "Something went wrong!!"})
    }
})

app.delete("/api/delete/:key", async(req,res)=>{
    const key = req.params.key;
    try{
        const result = await pool.query(`delete from journals where id = ${key}`);
        res.status(200).json({message : "Your journal deleted successfully !!"});
    }
    catch(err){
        console.log(err.message);
    }
})

app.get("/api/getForEdit/:key", async (req,res)=>{
    const key  = req.params.key;
    try{
        const result = await pool.query(`select * from journals where id = ${key}`);
        if(result.rowCount > 0){
            // console.log(result);
            res.status(200).json(result);
        }
    }catch(err){
        res.status(404).json({message : "Not Found"});
    }
});

app.patch("/api/edited/:key", async (req,res)=>{
    const key  = req.params.key;
    const {title,content} = req.body;
    
    try{
        const result = await pool.query(`UPDATE journals SET title = $1, content = $2 WHERE id = $3`,
            [title, content, key]);
        res.status(200).json({message : "Journal updated successfully!!!"});
    }catch(err){
        console.log("Edit err message : "+err.message);
        res.status(404).json({message : "Not Found"});
    }
});

app.get("/api/view/:key", async (req,res)=>{
    const key = req.params.key;
    try{
        const result = await pool.query(`select * from journals where id = ${key}`);
        if(result.rowCount > 0){
            // console.log("View : I got some message!!");
            res.status(200).json(result);
        }
        else{
            console.log("I am not working : I am view");
            res.status(404).json({message : "404 Not Found"});
        }
    }
    catch(err){
        console.log("Error message for view : "+err.message);
    }
});
// server listening is enabled in port 5000
app.listen(port,()=>{console.log("Server running in port 5000")});