var request = require('request')
var cheerio = require('cheerio')
var firebase = require('firebase')

async function readDoc(db, doc) {
    res = await db.ref(doc).get()
    if (res.exists())
        return res.val()
    else
        console.log("Failed to get doc " + doc)
}

function writeDoc(db, doc, object) {
    db.ref(doc).set(object)
}


var url = "https://www.d20pfsrd.com/Magic-items/Wondrous-items/"

var timeout = 10000 // ms
var opts = {
    url: url,
    timeout: timeout
}


// Converts to a number by removing commas and gp tag
function convertMoneyToInt(gpPrice) {
    return Number(gpPrice.split(",").join("").split("gp").join(""))
}


// chooseableItems: A power level map, then a rarity map, then a list of items that are within the price range
// config: Details specified under initMagicItemMerchant function
// A function to simply choose an item from a list factoring in rarity of categories
function chooseItem(chooseableItems, config) {
    powerLevel = Math.random()
    rarity = Math.random()
   
    if ((powerLevel <= config["lesserItemChance"]) || (chooseableItems[powerLevel] == {}) || (chooseableItems["Greater"].length == 0))
        powerLevel = "Lesser"
    else 
        powerLevel = "Greater"
    
    if ((rarity <= config["minorItemChance"]) || (chooseableItems[powerLevel]["Medium"] == undefined && chooseableItems[powerLevel]["Major"] == undefined) || (chooseableItems[powerLevel]["Medium"].length == 0 && chooseableItems[powerLevel]["Major"].length == 0))
        rarity = "Minor"
    else if ((rarity <= config["minorItemChance"] + config["mediumItemChance"]) || (chooseableItems[powerLevel]["Major"] == undefined) || (chooseableItems[powerLevel]["Major"].length == 0))
        rarity = "Medium"
    else
        rarity = "Major"

    category = chooseableItems[powerLevel][rarity]
    if (category == undefined) 
        console.log("chooseItem: Unable to find category")
    
    rand = randomRange(0, category.length)
    return category[Math.floor(rand)]
}


// magicItems: The db object that contains all the magic items formatted like the webpage
// numItems: Total number of items to initialize with
// config:
//      lowestDefaultPrice: The lowest price item that can appear (listed price not modified by market)
//      highestDefaultPrice: The highest price item that can appear (listed price not modified by market)
//      lesserItemChance: Percentage (0-1) that a lesser item will appear
//      greaterItemChance: Percentage (0-1) that a greater item will appear
//      minorItemChance: Percentage (0-1) that a minor item will appear
//      mediumItemChance: Percentage (0-1) that a medium item will appear
//      majorItemChance: Percentage (0-1) that a major item will appear
// 
// A function to initialize the magic merchant. Will only init with items in a price range
async function initMagicItemMerchant(db, numItems, config) {
    // 80 20 and 15 30 55 split on rarity
    
    let magicItems = await readDoc(db, "web-crawler/magic-items")
    lowestDefaultPrice = config["lowestDefaultPrice"]
    highestDefaultPrice = config["highestDefaultPrice"]


    itemStock = {}
    i = 0
    
    chooseableItems = {}

    var powerLevelTypes = ["Lesser", "Greater"]
    var rarityTypes = ["Minor", "Medium", "Major"]
    var wonderousItemTypes = ["Belt", "Body", "Chest", "Eye", "Feet", "Hand", "Head",
    "Headband", "Neck", "Shoulders", "Slotless", "Wrists"]
    
    for (let powerLevelIdx = 0; powerLevelIdx < powerLevelTypes.length; powerLevelIdx++) {
        chooseableItems[powerLevelTypes[powerLevelIdx]] = {}
        chooseableItems[powerLevelTypes[powerLevelIdx]]["num_items"] = 0
        for (let rarityIdx = 0; rarityIdx < rarityTypes.length; rarityIdx++) {
            chooseableItems[powerLevelTypes[powerLevelIdx]][rarityTypes[rarityIdx]] = []
            for (let wonderousItemIdx = 0; wonderousItemIdx < wonderousItemTypes.length; wonderousItemIdx++) {
                // check if the item type is there
                let nameType = powerLevelTypes[powerLevelIdx] + " " + rarityTypes[rarityIdx] + " " + wonderousItemTypes[wonderousItemIdx]
                if (!magicItems.hasOwnProperty(nameType)) {
                    if (magicItems.hasOwnProperty(nameType + " Item"))
                        nameType += " Item"
                    else {
                        console.log("Couldnt find " + nameType)
                        continue
                    }
                }
                
                items = Object.keys(magicItems[nameType])
                for (let itemIdx = 0; itemIdx < items.length; itemIdx++) {
                    price = convertMoneyToInt(magicItems[nameType][items[itemIdx]]["price"])
                    if (price <= highestDefaultPrice && price >= lowestDefaultPrice) {
                        chooseableItems[powerLevelTypes[powerLevelIdx]][rarityTypes[rarityIdx]].push(magicItems[nameType][items[itemIdx]])
                         
                        // keep track of how many items in each category
                        chooseableItems[powerLevelTypes[powerLevelIdx]]["num_items"] += 1
                        chooseableItems[powerLevelTypes[powerLevelIdx]][rarityTypes[rarityIdx]]
                    }
                }

            }
        }
    }

    for (let itemNum = 0; itemNum < numItems; itemNum++) {
        item = chooseItem(chooseableItems, config)
        
        if (itemStock.hasOwnProperty(item["name"])) {
            itemStock[item["name"]].stock += 1
        }
        else {
            itemStock[item["name"]] = {
                "name": item["name"],
                "magic_item": item,
                "stock": 1
            }
        }
    }
    
    writeDoc(db, "kingdom/magic-item-merchant/chooseableItems", chooseableItems)
    writeDoc(db, "kingdom/magic-item-merchant/itemStock", itemStock)
    writeDoc(db, "kingdom/magic-item-merchant/generatorConfig", config)

    return itemStock
}   

async function addRandomMagicItemFromChooseable(db) {
    chooseableItems = await readDoc(db, "kingdom/magic-item-merchant/chooseableItems")
    itemStock = await readDoc(db, "kingdom/magic-item-merchant/itemStock")
    config = await readDoc(db, "kingdom/magic-item-merchant/generatorConfig")
    item = chooseItem(chooseableItems, config)
    

    if (itemStock.hasOwnProperty(item["name"])) {
        itemStock[item["name"]]["stock"] += 1
    }
    else {
        itemStock[item["name"]] = item
    }

    writeDoc(db, "kingdom/magic-item-merchant/itemStock", itemStock)
}

// objects to store progression of days, seasons, and months
daysOfWeek = {"Sunday": {}, "Monday": {}, "Tuesday": {}, "Wednesday": {}, "Thursday": {}, "Friday": {}, "Saturday": {}}
seasons = {"Summer": {}, "Fall": {}, "Winter": {}, "Spring": {}}
monthsOfYear = {"January": {}, "February": {}, "March": {}, "April": {}, "May": {}, "June": {}, "July": {}, "August": {}, "September": {}, "October": {}, "November": {}, "December": {}}

function initGameStats(db) {
    let stats = {
        "currentDay": 1,
        "currentSeason": "Winter",
        "currentDayOfWeek": "Sunday",
        "currentMonthOfYear": "January",
        "totalPopulation": 200,
        "totalWealthOfPopulation": "2000 gp",
        "demographics":  {
            "Race": {
                "Human": .7,
                "Elf": .1,
                "Dwarf": .1,
                "Other": .1
            },
            "Gender": {
                "Male": .5,
                "Female": .5
            }
        },
        "dangerLevel": 0,
        "kingdomName": "Thadia Kingdom",
        "kingdomAlignment": "Nuetral Good",
        "kingdomRuler": "Ievna Gao",
        "treasuryWealth": "10000 gp",
        "districtNames": {},
        "totalLand": 10000,
        "landForSale": 7000,
        "landPricePerMonth": "15 gp"
    }
    writeDoc(db, "kingdom/stats", stats)
}

function init() {
    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    
    
    var firebaseConfig = {
        apiKey: "AIzaSyDVM3iPjlXnnQ4nLMswD_r_PjafWrTkNe8",
        authDomain: "dnd-campaign-8de7a.firebaseapp.com",
        projectId: "dnd-campaign-8de7a",
        storageBucket: "dnd-campaign-8de7a.appspot.com",
        messagingSenderId: "574635643311",
        appId: "1:574635643311:web:def408927f0de15c4e5f5a",
        measurementId: "G-MXE66CQ8H8"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

}


// Including low AND high
function randomRange(low, high) {
    return low + (Math.random() * high)
}

async function main() {
    init()
    var db = firebase.database()


    
    magic_item_config = {
        "lowestDefaultPrice": 0,
        "highestDefaultPrice": 10000,
        "lesserItemChance": .8,
        "greaterItemChance": .2,
        "minorItemChance": .6,
        "mediumItemChance": .3,
        "majorItemChance": .1
    }

    initMagicItemMerchant(db, 5, magic_item_config)
    
    addRandomMagicItemFromChooseable(db)
    
    initGameStats(db)
}
// Bakeries depend on:
//      Demand for baked goods
//      Supply of 
function generateDistrict(db, startingWealth, population) {
    let buisnesses = {
        "Bakeries": {},
        "Bathhouses": {},
        "Barber Shops": {},
        "Vineyards": {},
        "Breweries": {},
        "Taverns": {},
        "Farms": {},
        "Stables": {},
        "Bookstores": {},
        "Butcheries": {},
        "Carpender Shops": {},
        "Hospitals": {},
        "Fisheries": {},
        "Fur Shops": {},
        "Wood Carver Shops": {},
        "Weaver Shops": {},
        "Tanner Shops": {},
        "Tailor Shops": {},
        "Shoe Shops": {},
        "Spice Shops": {},
        "Sculptor Shops": {},
        "Paint Shops": {},
        "Roofer Shops": {},
        "Masonry Shops": {},
        "Locksmith Shops": {},
        "Jewlery Shops": {},
        "Inns": {},
        "Illuminator Shops": {},
        "Mercenary Hiring Shop": {},
        "Churches": {},
        "General Stores": {},
        "Trading Merchants": {},
        "Alchemist Shops": {},
        "Wand Shops": {}
    }
}

function initShops() {
    initMagicItemMerchant()
}

var process = function (err, res, body) {
    const $ = cheerio.load(body)
    tables = {}
    $('table').has('caption').each(function() {
        var cap = $(this).find('caption').text()
        var table = $(this).find('tr')
        tables[cap] = {}
        if (cap !== "Wondrous Item type") {
            table.each(function(index, elem) {
                if (index != 0) {
                    var magic_item_name = $(this).children().eq(1).text()
                    var magic_item_price = $(this).children().eq(2).text()
                    var magic_item_link = $(this).children().eq(1).children('a')
                    magic_item_name = magic_item_name.split("/").join(" or ").split(".").join("")

                    tables[cap][magic_item_name] = {}
                    tables[cap][magic_item_name]["name"] = magic_item_name
                    tables[cap][magic_item_name]["price"] = magic_item_price
                    tables[cap][magic_item_name]["links"] = []
                    magic_item_link.each(function() {
                        tables[cap][magic_item_name]["links"].push(
                            {
                                "name": $(this).text(),
                                "link": $(this).attr("href")
                            })
                    })
                }
            })
        }
    })
    db.ref("web-crawler/magic-items").set(tables)
}
function requestMagicItems() { 
    request(opts, function (err, res, body) {
        if (err) {
            console.dir(err)
            return
        }
        var statusCode = res.statusCode
        console.log('status code: ' + statusCode)
        process(err, res, body)
        console.log("done")
    })
}

main()
