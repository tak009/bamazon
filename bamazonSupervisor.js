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
    choices: ["View Product Sales by Department", "Create New Department"]
  }]).then(function(answer) {
    var action = answer.menuOptions;

    switch (action) {
      case "View Product Sales by Department":
        viewProducts();
        break;
      case "Create New Department":
        createDepartment();
        break;
    }
  });
}

function viewProducts() {
  connection.query("SELECT d.department_id, d.department_name, d.over_head_costs, p.product_sales, d.over_head_costs - p.product_sales as total_profit FROM departments as d JOIN products as p ON d.department_name = p.department_name", function(err, data) {
    if (err) throw err;
    console.log("\n");
    console.table(data);
  });
}

function createDepartment(){
  inquirer.prompt([{
      type: "input",
      name: "deptID",
      message: "Enter the department ID:"
    },
    {
      type: "input",
      name: "deptName",
      message: "Enter the department name:"
    },
    {
      type: "input",
      name: "overHeadCosts",
      message: "Enter the overhead costs:"
    }
  ]).then(function(answer) {
      var id = answer.deptID;
      var name = answer.deptName;
      var cost = answer.overHeadCosts;

      connection.query("INSERT INTO departments (department_id, department_name, over_head_costs) VALUES(?, ?, ?)", [id, name, cost], function(err, data) {
        if (err) throw err;
        console.log("\nThe product was successfully added!");
      });
  });
}
