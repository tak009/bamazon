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
  askQuestion();
});

function askQuestion() {
  inquirer.prompt([{
    type: "list",
    name: "menuOptions",
    message: "What do you want to do?",
    choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
  }]).then(function(answer) {
    var action = answer.menuOptions;

    switch (action) {
      case "View Products for Sale":
        getProducts();
        break;
      case "View Low Inventory":
        getLowInventory();
        break;
      case "Add to Inventory":
        addInventory();
        break;
      case "Add New Product":
        addNewProduct();
        break;
    }
  });
}

function getProducts() {
  connection.query("SELECT item_id as 'Item ID', product_name as 'Product Name', price as 'Price', qty as 'Quantity' FROM products", function(err, data) {
    if (err) throw err;
    console.log("\n");
    console.table(data);
  });
}

function getLowInventory() {
  connection.query("SELECT item_id as 'Item ID', product_name as 'Product Name', price as 'Price', qty as 'Quantity' FROM products WHERE qty < 5", function(err, data) {
    if (err) throw err;
    console.log("\n");
    console.table(data);
  });
}

function addInventory() {
  inquirer.prompt([{
      type: "input",
      name: "itemID",
      message: "What is the ID of the product you would like add?"
    },
    {
      type: "input",
      name: "itemQty",
      message: "How many you would like to add?"
    }
  ]).then(function(answer) {
    var id = answer.itemID;
    var qty = parseInt(answer.itemQty);

    checkInventory(id, function(err, res){
      if (err) throw err;
      var remainint_qty = parseInt(res[0].Quantity);
      var new_qty = qty + remainint_qty;

      connection.query("UPDATE products SET qty = ? WHERE item_id = ?", [new_qty, id], function(err, data) {
        if (err) throw err;
        getProducts();
      });

    });
  });
}

function addNewProduct(){
  inquirer.prompt([{
      type: "input",
      name: "name",
      message: "What is the product name?"
    },
    {
      type: "input",
      name: "price",
      message: "What is the unit price?"
    },
    {
      type: "input",
      name: "qty",
      message: "How many units you want to add?"
    },
    {
      type: "input",
      name: "dept",
      message: "What is the department name?"
    }
  ]).then(function(answer) {
      var name = answer.name;
      var price = answer.price;
      var qty = answer.qty;
      var dept = answer.dept;

      connection.query("INSERT INTO products (product_name, price, qty, department_name) VALUES(?, ?, ?, ?)", [name, price, qty, dept], function(err, data) {
        if (err) throw err;
        console.log("\nThe product was successfully added!");
        getProducts();
      });
  });
}

function checkInventory(id, callback) {
  connection.query("SELECT qty as 'Quantity' FROM products where item_id = ?", id, function(err, data) {
    if (err) throw err;
    callback(err, data);
  });
}
