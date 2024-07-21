const mongoose = require("mongoose");
require("dotenv").config();
const dbConnect = () =>{
    mongoose.connect(process.env.MONGODB_URL,{
        useNewUrlParser : true,
        useUnifiedTopology : true,
        
        tls: true,
        ssl: true, // Use SSL
        
    })
    .then(()=>{console.log("DB connection successfull")})
    .catch((error)=>{
        console.log("issue in DB connection");
        console.error(error.message);
        process.exit(1);


    })
}

module.exports = dbConnect;