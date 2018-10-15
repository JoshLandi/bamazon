var mysql = require("mysql");
var inq = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",

    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    listProducts();
});

function listProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        console.log("ID| Item | Dept. | Price | Quantity");
        console.log("-----------------------------------");
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].item_id + " | " + res[i].product_name + " | " + res[i].department_name + " | " + res[i].price + " | " + res[i].stock_quantity);
        }
        console.log("-----------------------------------");
        inq.prompt({
                type: "confirm",
                message: "Would you like to make a purchase?",
                name: "yesOrNo"
            })
            .then(function (res) {
                if (res.yesOrNo) {
                    purchaseProduct();
                } else {
                    console.log("Maybe another time? =]")
                }
            });
    });
}
//Function for purchasing a product

function purchaseProduct() {
    connection.query("SELECT * FROM products", function (err, results) {
        inq
            .prompt([
                //ENTER ID OF PRODUCT YOU WISH TO PURCHASE
                {
                    type: "input",
                    message: "Enter the ID number of the product you wish to purchase",
                    name: "productID"
                },
                {
                    type: "input",
                    message: "How many units would you like?",
                    name: "quant"
                }
            ])
            .then(function (inqRes) {
                var chosenProduct = inqRes.productID;
                var chosenQuant = inqRes.quant;
                //test
                console.log("Your chosen product: " + chosenProduct + " Quantity: " + chosenQuant);
                console.log("-----------------------------------");
                //Checking store if quantity is in stock
                for (var i = 0; i < results.length; i++) {
                    if (chosenProduct == results[i].item_id) {
                        console.log("Searching quantity of " + results[i].product_name);
                        console.log("-----------------------------------");
                        if (chosenQuant < results[i].stock_quantity) {
                            var updatedInventory = results[i].stock_quantity - chosenQuant;

                            connection.query(
                                "UPDATE products SET ? WHERE ?",
                                [{
                                        stock_quantity: updatedInventory,
                                    },
                                    {
                                        item_id: results[i].item_id
                                    }
                                ]
                            )
                            console.log("Purchase successful!");
                            console.log("-----------------------------------");
                            var cost = chosenQuant * results[i].price;
                            console.log("Your cost: $" + cost);
                            console.log("-----------------------------------");
                            listProducts();
                        } else {
                            console.log("We only have " + results[i].stock_quantity + " of those left.");
                            listProducts();
                        }
                    } else {

                    }
                }
            })
    });
}