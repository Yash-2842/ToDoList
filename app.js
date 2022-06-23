//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require('mongoose');

const app = express();
const _ = require('lodash');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Yash2842:<Password>@cluster0.ivatj.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemsSchema = {
  name:String
}

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name:"Welcome To Your TodoList"
})

const item2 = new Item({
  name:"Hit The + Button To Add a New Item"
})

const item3 = new Item({
  name:"<-- Hit This To Delete An Item"
})

const defaultItems = [item1,item2,item3];

const listSchema = {
  name:String,
  items : [itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find({},(err,foundItems)=>{
    if(foundItems.length===0)
    {
      Item.insertMany(defaultItems,(err)=>{
        if(err)
          console.log(err);
        else
          console.log("Item Inserted Successfully");
      })
      res.redirect("/");
    }
    else
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  })
});

app.post("/", function(req, res){

  const ItemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name : ItemName
  });
  if(listName === 'Today'){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},(err,foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }

});

app.post("/delete",(req,res)=>{
  const itemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === 'Today')
  {
    Item.findByIdAndRemove(itemId,(err)=>{
    if(err)
      console.log(err);
    else
      console.log("Item Deleted Successfully.");
      res.redirect("/");
    })
  }else{
    List.findOneAndUpdate({name:listName},{$pull: {items : {_id: itemId}}},(err,foundItems)=>{
      if(!err)
        res.redirect("/"+listName);
    })
  }
})

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName},(err,foundList)=>{
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })
  
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port==null || port==""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started Successfully");
});
