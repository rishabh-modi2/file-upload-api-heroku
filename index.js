const express =  require("express");
const upload = require("express-fileupload");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5600;
app.use(upload());
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const hbs = require("hbs");
const cloudinary = require("cloudinary").v2;


cloudinary.config({
  cloud_name:process.env.CLOUD_NAME,
  api_key:process.env.API_KEY,
  api_secret:process.env.API_SECRET
})



app.use(cors({
  origin:"*"
}))


const url = process.env.DB;

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
  title:String,
  description:String,
  thumbnail:String,
  video:String,
  Type:String,
  Catagory:String,
  date:{
    type:Date,
    default:Date.now
  }
});

const Model = new mongoose.model('Data',videoSchema);



app.post("/api/upload", async (req,res) => {
  try{
  const videopath = req.files.video;
  const posterpath = req.files.thumbnail;
    console.log(videopath);
  const title = req.body.title;
  const description = req.body.description;
const catagory = req.body.catagory;
    
 videopath.mv("./upload/"+videopath.name,(err) => {
   if(err) {
    res.json({message:"something went wrong please try again later"});
   }
 else{ 
     posterpath.mv('./upload/'+posterpath.name,(err) => {
       if(err) {
        res.json({message:"something went wrong please try again later"});
       }
       else{
      const saveVideoPath = path.join(__dirname,`./upload/${videopath.name}`);
      const saveThumpath = path.join(__dirname,`./upload/${posterpath.name}`);
    cloudinary.uploader.upload(saveVideoPath,{
      resource_type:'video',
      public_id:`_${Date.now()}`,
      chunk_size:6000000
    },(err,resultofvideo) => {
      if(err){
        console.log(err);
      }
      else{
        cloudinary.uploader.upload(saveThumpath, async (error,resutlofimage) => {
          if(err) {
            console.log(err);
          }
          else{
                const newVideo = new Model({
                  title:title,
                  description:description,
                  thumbnail:resutlofimage.secure_url,
                  video:resultofvideo.secure_url,
  Catagory : catagory,                
                  Type:videopath.mimetype
                })
                const result = await newVideo.save();
            res.json({
              message:"post uploaded successfully",
              result
            });
               }
             })
           }
        })
       }
    })
  }
 });
  }
  catch(err) {
    console.log(err);
    res.json({message:"internel server error"});
  }
})




app.get("/api/apiAllData", async (req,res) => {
  try{
  const result = await Model.find();
  res.json(result);
  }
  catch(err){
    res.json({message:"internel server error"});
  }
})



app.listen(PORT,() => {
    console.log("server is started on port number");
  })


