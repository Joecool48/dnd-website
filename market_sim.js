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


// objects to store progression of days, seasons, and months
daysOfWeek = {"Sunday": {}, "Monday": {}, "Tuesday": {}, "Wednesday": {}, "Thursday": {}, "Friday": {}, "Saturday": {}}
seasons = {"Summer": {}, "Fall": {}, "Winter": {}, "Spring": {}}
monthsOfYear = {"January": {}, "February": {}, "March": {}, "April": {}, "May": {}, "June": {}, "July": {}, "August": {}, "September": {}, "October": {}, "November": {}, "December": {}}

function initGameStats(db) {
    let stats = {
        "current_day": 1,
        "current_season": "Winter",
        "current_day_of_week": "Sunday",
        "current_month_of_year": "January",
        "total_population": 200,
        "wealth_categories": {
            "poor": {
                "population_percentage": .09,
                "base_wealth": new Money(0, 0, 50, 0),
                "wealth_variance": new Money(0, 0, 200, 0)
            },
            "commoner": {
                "population_percentage": .5,
                "base_wealth": new Money(0, 50, 0, 0),
                "wealth_variance": new Money(0, 200, 0)
            },
            "middle_class": {
                "population_percentage": .3,
                "base_wealth": new Money(0, 300, 0, 0),
                "wealth_variance": new Money(0, 500, 0, 0)
            },
            "rich": {
                "population_percentage": .1,
                "base_wealth": new Money(0, 2000, 0, 0),
                "wealth_variance": new Money(0, 5000, 0, 0)
            },
            "nobility": {
                "population_percentage": .01,
                "base_wealth": new Money(0, 10000, 0, 0),
                "wealth_variance": new Money(0, 20000, 0, 0)
            }
        }
        "demographics":  {
            "race": {
                "human": .7,
                "elf": .1,
                "dwarf": .1,
                "halfling": .05,
                "other": .05
            },
            "gender": {
                "male": .5,
                "female": .5
            }
        },
        "resources": {
            "Meat": new Resource(0, 0, 0, new Money(0, 0, 0, 5))
            "Vegetable": new Resource(0, 0, 0, new Money(0, 0, 0, 3))
            "Fruit": new Resource(0, 0, 0, new Money(0, 0, 0, 3))
            "Grain": new Resource(0, 0, 0, new Money(0, 0, 0, 2))
            "Sugar": new Resource(0, 0, 0, new Money(0, 0, 0, 10))
            "Milk":  new Resource(0, 0, 0, new Money(0, 0, 0, 1))
            "Egg": new Resource(0, 0, 0, new Money(0, 0, 0, 1))
        }
        "danger_level": 0,
        "kingdom_name": "Thadia Kingdom",
        "kingdom_alignment": "Nuetral Good",
        "kingdom_ruler": "Ievna Gao",
        "treasury_wealth": new Money(0, 10000, 0, 0),
        "district_names": {},
        "total_land": 10000,
        "land_for_sale": 7000,
        "initial_land_price_per_unit": new Money(0, 5, 0, 0),
        "monthly_land_tax_per_unit": new Money(0, 0, 20, 0),

    }
    writeDoc(db, "kingdom/stats", stats)
}

function updateResourceDemand(gameStats) {
    for (const resourceName of Object.keys(gameStats["resources"])) {
        let resource = gameStats["resources"][resourceName]
        resource.demand = 0
        for (const consumer of resource.getConsumers()) {
            resource.demand += consumedResources 
        }
    }
}

async function nextDay(db) {
    var gameStats = await readDoc(db, "kingdom/stats")
    updateResourceDemand(gameStats)
    updateResourceSupply()
    updateResourcePrice()
}

class Money {
    constructor(pp, gp, sp, cp) {
        this.pp = pp
        this.gp = gp
        this.sp = sp
        this.cp = cp
    }
    add(moneyObject) {
        return new Money(this.pp + moneyObject.pp, this.gp + moneyObject.gp, this.sp + moneyObject.sp, this.cp + moneyObject.cp)
    }
    sub(moneyObject) {
        let total = this.convertToCp() - moneyObject.convertToCp()
        convertToMoney(total, this)
    }
    mul(num) {
        return new Money(num * this.pp, num * this.gp, num * this.sp, num * this.cp)      
    }
    convertToCp() {
        let total = 0
        total += this.pp * 1000
        total += this.gp * 100
        total += this.sp * 10
        total += this.cp
        return total
    }
    static convertToMoney(cp, money) {
        money = new Money()
        money.pp = Math.floor(cp / 1000)
        cp -= money.pp * 1000
        money.gp = Math.floor(cp / 100)
        cp -= money.gp * 100
        money.sp = Math.floor(cp / 10)
        cp -= money.sp * 10
        money.cp = cp
        return money
    }
    floorDiv(moneyObject) {
        let total1 = this.convertToCp()
        let total2 = this.convertToCp()
        return Math.floor(total1 / total2)
    }

}

function generatePercent() {
    return Math.random()
}

class Person {
    generateRace(gameStats) {
        let totalPercent = 0
        let rand = generatePercent()
        for (const elem of Object.keys(gameStats["demographics"]["race"])) {
            totalPercent += gameStats["demographics"]["race"][elem]
            if (rand <= totalPercent) {
                this.race = elem
                break
            }
        }
    }
    
    generateGender(gameStats) {
        let totalPercent = 0
        let rand = generatePercent()
        for (const elem of Object.keys(gameStats["demographics"]["gender"])) {
            totalPercent += gameStats["demographics"]["gender"][elem]
            if (rand <= totalPercent) {
                this.gender = elem
                break
            }
        }
    }
    
    randMoney(base, variance) {
        return new Money(base.pp + Math.round(generatePercent() * variance.pp), base.gp + Math.round(generatePercent() * variance.gp), base.sp + Math.round(generatePercent() * variance.sp), base.cp + Math.round(generatePercent() * variance.cp))
    }

    generateMoney(gameStats, statusClass) {
        base_wealth = gameStats["wealth_categories"][statusClass]["base_wealth"]
        wealth_variance = gameStats["wealth_categories"][statusClass]["wealth_variance"]
        this.wealth = randMoney(base_wealth, wealth_variance)

    }

    generateWealth(gameStats) {
        let totalPercent = 0
        let rand = generatePercent()
        for (const elem of Object.keys(gameStats["wealth_categories"])) {
            totalPercent += gameStats["wealth_categories"][elem]["population_percentage"]
            if (rand <= totalPercent) {
                this.statusClass = elem
                this.wealth = this.generateMoney(gameStats, this.statusClass)
                break
            }
        }
        
    }

    generatePerson(gameStats) {
        this.generateRace(gameStats)
        this.generateGender(gameStats)
    }

    constructor(gameStats) {
        // show stats here so they are easily visible
        this.race = null
        this.gender = null
        this.wealth = 0
        this.statusClass = null
        // generate the person with random values
        this.generatePerson(gameStats)
    }
}

class Resource {
    constructor(total, supply, demand, defaultPrice) {
        //  total amount of resource available
        this.total = total
        // average amount of this resource created each day
        this.supply = supply
        // average amount of this resource that is wanted each day
        this.demand = demand
        // the base price a unit of this item usually fetches
        this.defaultPrice = defaultPrice
        // the price accounting for supply and demand for this item
        this.actualPrice = defaultPrice 
        
        this.consumers = []
        this.suppliers = []
    }
    getConsumers() {
        return this.consumers
    }
    getSuppliers() {
        return this.suppliers
    }
}

class Farm {
    initFarm(gameStats, farmWealth) {
        // A simple model for a farmer
        // A farmer will choose to produce resources he can that will optimize his profits based on his wealth and amount of land he controls. Forgetting that banks exist for a moment
        // A farmer will attempt to buy as much land he can with the amount of money he has
        // For now a farmer need not buy starting resources
        // TODO Add workers to model
        // TODO Add banking to model
        // TODO Add cost for starting resources to model

        this.farmLand = Math.clamp(farmWealth.floorDiv(gameStats["initial_land_price_per_unit"]), 0, gameStats["land_for_sale"])
        gameStats["land_for_sale"] -= this.farmLand
        this.wealth = this.wealth.sub(gameStats["initial_land_price_per_unit"].mul(this.farmLand))


    }
    constructor(gameStats, farmName, farmWealth) {
        this.economyType = "Producer"
        this.consumedResources = {}
        this.wealth = farmWealth
        this.farmName = farmName
        this.farmLand = null
        this.producedResources = {
            "Meat": 0,
            "Vegetable": 0,
            "Fruit": 0,
            "Grain": 0,
            "Sugar": 0,
            "Milk": 0,
            "Egg": 0,
        }
        // when daysTillResourcesAvailable is 0, then this much is added to the farms produced resources
        this.resourceRate = {
            "Meat": 0,
            "Vegetable": 0,
            "Fruit": 0,
            "Grain": 0,
            "Sugar": 0,
            "Milk": 0,
            "Egg": 0
        }

        // Amount of time in days till more of that resource is available
        // If more cannot be currently created then null is put there instead
        this.daysTillResourcesAvailable = {
            "Meat": null,
            "Vegetable": null,
            "Fruit": null,
            "Grain": null,
            "Sugar": null,
            "Milk": null,
            "Egg": null
        }
    }
}
