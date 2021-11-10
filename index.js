const express =  require("express");
const upload = require("express-fileupload");
const app = express();
const PORT = process.env.PORT || 5600;
app.use(upload());

app.get("/",(req,res) => {
  res.send("welcome to fileupload api of videostream app");
})

app.post("/",(req,res) => {
  try{
  const filename = req.files.file;
  filename.mv('./upload/'+filename.name,(err) => {
    if(err) {
      res.json({err:err});
    }
    else{
      res.json({message:"successfull"});
    }
  })
  }
  catch(err) {
  res.send(err);
  }
})


app.listen(PORT,() => {
    console.log("server is started on port number");
  })


