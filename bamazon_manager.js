var inquirer = require("inquirer");
var mysql = require("mysql");
var console_table = require("console.table");

// Open connection to Bamazon database through Node package 'mysql'
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "Bamazon"
})

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected to Bamazon on Port 3306\n");
  runInquirer();
});

// Display the store manager's options to view and control the store's products and inventory
var managerOptions = [
   {
      name: 'option',
      type: 'list',
      message: 'What would you like to do?',
      choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Exit'],
      filter: function (val) {
         return val.toLowerCase();
        }
   }
];

// Run Inquirer to receive the manager's selected action and then execute
var runInquirer = function() {

    inquirer.prompt(managerOptions).then(function(answer) {

       switch(answer.option) {

          case 'view products for sale': {
            console.log(" ");
            var query = 'SELECT ItemID, ProductName, Price, StockQuantity FROM Bamazon.Products';
            connection.query(query, function(err, result) {
                console.table(result);
                runInquirer();
              });
             break;
            }

          case 'view low inventory': {
            console.log(" ");
            var query = 'SELECT ItemID, ProductName, Price, StockQuantity FROM Bamazon.Products WHERE StockQuantity < 10';
            connection.query(query, function(err, result) {
                console.table(result);
                runInquirer();
             });
             break;
            }

          case 'add to inventory': {
             var addInventory = [
             {
                type: 'input', 
                name: 'item',
                message: 'Please enter product ID: '
             },
             {
                type: 'input',
                name: 'quantity',
                message: 'Quantity to add: ',
                validate: function (value) {
                   var valid = !isNaN(parseFloat(value));
                   return valid || 'Please enter a number';
                },
                filter: Number
             }
             ];

             inquirer.prompt(addInventory).then(function(addInventory) {
                var new_quantity = (addInventory.quantity);
                var prevQuantity = 0;
                connection.query('SELECT * FROM Bamazon.Products WHERE ?', {itemID:addInventory.item},
                   function(err, result) {

                      prevQuantity = (result[0].StockQuantity);
                      new_quantity = new_quantity + prevQuantity;

                      connection.query('UPDATE Bamazon.Products SET ? WHERE ?', 
                      [{
                         StockQuantity: new_quantity
                      }, 
                      {
                         ItemID: addInventory.item
                      }], 

                      function(err, result) {
                        console.log("\nThe new quantity of Product ID " + addInventory.item + " is: " + new_quantity);
                        console.log("\nDatabase updated\n");
                      var query = 'SELECT ItemID, ProductName, Price, StockQuantity FROM Bamazon.Products';
                      connection.query(query, function(err, result) {
                      console.table(result);
                      runInquirer();
                        });
                      }
                    );
                });
              });
              break;
          }

          case 'add new product': {
             var addNewProduct = [
             {
                type: 'input',
                name: 'item',
                message: 'Please enter New Product ID to add to list of products: '
             },
             {
                type: 'input',
                name: 'product',
                message: 'Enter the New Product Name: '
             },
             {
                type: 'input',
                name: 'department',
                message: 'Enter the Store Department: '
             },
             {
                type: 'input',
                name: 'price',
                message: 'Enter the Price of Item: ',  
                validate: function (value) {
                   var valid = !isNaN(parseFloat(value));
                   return valid || 'Please enter a number';
                },
                filter: Number
             },
             {
                type: 'input',
                name: 'quantity',
                message: 'Enter the Stock Quantity: ',
                validate: function (value) {
                   var valid = !isNaN(parseFloat(value));
                   return valid || 'Please enter a number';
                },
                filter: Number
             }]

             inquirer.prompt(addNewProduct).then(function(actionAddProduct) {
                connection.query('INSERT INTO Bamazon.Products SET ?', {
                   ItemID: actionAddProduct.item, 
                   ProductName: actionAddProduct.product, 
                   DepartmentName: actionAddProduct.department,
                   Price: actionAddProduct.price, 
                   StockQuantity: actionAddProduct.quantity}, function(err, result) {
                      if (err) {
                         console.log(err);
                        } 
                        else {
                          console.log("\nAdding new product.\n")
                          var query = 'SELECT ItemID, ProductName, Price, StockQuantity FROM Bamazon.Products';
                          connection.query(query, function(err, result) {
                          console.table(result);
                          runInquirer();
                            });
                          }
                    });   
                });
                break;
              }

// Close the mysql connection to the store's database.
          case 'exit': {
             console.log("\nClosing connection to Sales Database.\n");
             connection.end();
            }

          default: {
             break;
            }
        }
    });
  }
