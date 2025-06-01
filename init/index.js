const mongoose = require('mongoose');
const initData = require("./data.js");
const Listing = require("../models/listing.js");

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

main().then(()=>{
    console.log("Connected to MongoDB");
})
.catch((err)=>{
    console.log(err);
});

const initDB = async ()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj,owner:"6836d55c360a4eed358c7b2e"}));
    await Listing.insertMany(initData.data);
    console.log("DB initialised");
}

initDB();