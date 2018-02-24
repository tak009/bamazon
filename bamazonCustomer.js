var inquirer = require("inquirer");
var mysql = require("mysql");
var cTable = require("console.table");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  displayInventory();
});

function displayInventory() {
  connection.query("SELECT item_id as 'ID', product_name as 'Product Name', department_name as 'Department', price as 'Price', qty as 'Quantity', product_sales as 'Product Sales' FROM products", function(err, data) {
    if (err) throw err;
    console.log("\n");
    console.table(data);
    askQuestion();
  });
}

function checkInventory(id, callback) {
  //var invenQuantity = function(id, callback) {
  connection.query("SELECT price, qty FROM products where item_id = ?", id, function(err, data) {
    if (err) throw err;
    callback(err, data);
  });
}

function updateInventory (id, qty, total_sales, callback) {
  connection.query("UPDATE products SET qty = ?, product_sales = ? WHERE item_id = ?", [qty, total_sales, id], function(err, data) {
    if (err) throw err;
    callback(err, data);
  });

}

function askQuestion() {
  inquirer.prompt([{
      type: "input",
      name: "itemID",
      message: "What is the ID of the product you would like to buy?"
    },
    {
      type: "input",
      name: "itemQuantity",
      message: "How many units you would like to buy?"
    }
  ]).then(function(answer) {
    var id = answer.itemID;
    var demand_qty = parseInt(answer.itemQuantity);

    //invenQuantity(id, function(err,res){
    checkInventory(id, function(err, res) {
      if (err) throw err;
      var remainint_qty = res[0].qty;
      var unit_price = res[0].price;

      if (demand_qty > remainint_qty) {
        console.log("Insufficient quantity!\n");
        connection.end();
      }
      else {
        var qty = remainint_qty - demand_qty;
        var total_sales = unit_price * demand_qty;

        updateInventory(id, qty, total_sales, function(err, res){
          if (err) throw err;
          displayInventory();

        });
      }
    });
  });
}
