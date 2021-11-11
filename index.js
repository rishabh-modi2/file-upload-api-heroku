const express =  require("express");
const upload = require("express-fileupload");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5600;
app.use(upload());
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

app.use(cors({
  origin:"*"
}))

app.use("/source",express.static("upload"));

const url = `mongodb+srv://Animesh:723126@cluster0.oxxkg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const connectionParams={
    useNewUrlParser: true,
    useUnifiedTopology: true 
}
mongoose.connect(url,connectionParams)
    .then( () => {
        console.log('Connected to database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. \n${err}`);
    })                      

const videoSchema = new mongoose.Schema({
  videoName:String,
  fileName:String,
  posterName:String,
  title:String,
  des:String,
  date:{
    type:Date,
    default:Date.now
  }
});



const Model = new mongoose.model('Data',videoSchema);
  

app.post("/", async (req,res) => {
  try{
  const videopath = req.files.video;
  const posterpath = req.files.poster;
    
 videopath.mv("./upload/"+videopath.name,(err) => {
   if(err) {
     res.json({message:"something went wrong please try again later"});
   }
   else{
     posterpath.mv("./upload/"+posterpath.name, async (err) => {
       if(err) {
res.json({message:"something went wrong please try again later"});
       }
       else{
 const titleName = req.body.title;
 const desName = req.body.des;   
const userData = new Model({
      videoName:`/source/${videopath.name}`,
      posterName:`/source/${posterpath.name}`,
      videofileName: videopath,
      title:titleName,
      des:desName
    })
const result = await userData.save();
    res.send(result);
         
       }
     })
   }
 })
  }
  catch(err) {
    console.log(err);
    res.json({message:"internel server error"});
  }
})




app.get("/videos", async (req,res) => {
  try{
  const result = await Model.find();
  res.json(result);
  }
  catch(err){
    res.json({message:"internel server error"});
  }
})




app.get("/videos/:id", async (req,res) => {
  try{
const userId = req.params.id;
const result = await Model.find({_id:userId});
  const range = req.headers.range;
  if(!range) {
    res.json({message:"please set range header"});
  }
  else{
const videoPath = "./upload/"+ result[0].videofileName;
    console.log(videoPath)
 const videoSize = fs.statSync(videoPath).size;
const CHANK_SIZE = 10**6;
const start = Number(range.replace(/\D/g,""));
    const end = Math.min(start+CHANK_SIZE,videoSize -1);
    const contentLength = end-start+1;
    const headers = {
"Content-Range":`bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges":"bytes",
      "Content-Length":contentLength,
      "Content-Type":"video/mp4",
    }
    res.writeHead(206,headers);
    const videoStream = fs.createReadStream(videoPath,{start,end});
videoStream.pipe(res);
   ;
  }
  }
  catch(err) {
    console.log(err);
    res.json({message:"internel server error"});
  }
})



app.listen(PORT,() => {
    console.log("server is started on port number");
  })


