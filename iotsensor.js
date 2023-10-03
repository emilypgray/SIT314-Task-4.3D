const plotly = require('plotly')('epgray', 'SEv5Zoj5qcgP194CyAWY');
const mongoose = require('mongoose');
const { SensorModel, sensorSchema } = require('./models/sensor');

const atlasData = {
    x: [],
    y: [],
    type: "scatter",
    name: "AtlasDB"
};

const ec2Data = {
    x: [],
    y: [],
    type: "scatter",
    name: "EC2 MongoDB"
};

const azureData = {
    x: [],
    y: [],
    type: "scatter",
    name: "Azure CosmosDB MongoDB"
};

// connection strings for: MongoDB Atlas, local MongoDB installation on EC2, and Azure Cosmos MongoDB databases
const atlasURL = 'mongodb+srv://egra5170:jMPZtL41fAwCkRxV@cluster0.i1q5aw9.mongodb.net/sit314_task4?retryWrites=true&w=majority';
const ec2URL = 'mongodb://ec2-3-27-222-168.ap-southeast-2.compute.amazonaws.com:27017/sit314_task4';
const azureURL = 'mongodb://sit314-mongodb:9xtjkPH6FSyU32vM24qkKOwL2Vf8ja5zMExQGsimvtvRn8g8zqp6qAlaqrxdRCaxQ5oZUr5LQdJHACDb7st5qQ==@sit314-mongodb.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&replicaSet=globaldb&maxIdleTimeMS=120000&appName=@sit314-mongodb@';


// function to generate random data
function generateSensorData(){
    const low = 10;
    const high = 40;
    const reading = Math.floor(Math.random() * (high-low) + low);

    const sensorData = new SensorModel({
        id: 0,
        name: "temperaturesensor",
        address: "221 Burwood Hwy, Burwood VIC 3125",
        time: Date.now(),
        temperature: reading
    });
    console.log('DATA: ')
    console.log(JSON.stringify(sensorData));
    return sensorData;
};



async function saveToDatabase(sensorData, dbURL) {
    // create a new mongoose instance 
    const mongooseInstance = new mongoose.Mongoose(); 
    const connection = mongooseInstance.createConnection(dbURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    const Sensor = connection.model('Sensor', sensorSchema);

    const startTime = Date.now();
    try {
        await connection.startSession();
        const doc = await new Sensor(sensorData).save();
        // return the time taken to establish the connection to the database
        // and to save the data
        return Date.now() - startTime;
    } catch (error) {
        console.error(`Error saving to database: ${error.message}`);
        return -1;  
    } finally {
        connection.close();
    }
}


async function saveToDatabases(sensorData) {
    let atlasTime, ec2Time, azureTime;

    // Save to Atlas
    atlasTime = await saveToDatabase(sensorData, atlasURL);
    console.log('Saved to MongoDB Atlas with time: ', atlasTime);

    // Save to EC2
    ec2Time = await saveToDatabase(sensorData, ec2URL);
    console.log('Saved to EC2 MongoDB with time: ', ec2Time);

    // Save to Azure
    azureTime = await saveToDatabase(sensorData, azureURL);
    console.log('Saved to Azure Cosmos DB MongoDB with time: ', azureTime);
    console.log();

    // get the current time
    const currentTime = (new Date()).toISOString();

    // Push to Plotly - current time plus the elapsed save times for each tof the databases
    atlasData.x.push(currentTime);
    atlasData.y.push(atlasTime);

    ec2Data.x.push(currentTime);
    ec2Data.y.push(ec2Time);

    azureData.x.push(currentTime);
    azureData.y.push(azureTime);

    var graphOptions = { filename: 'iot-performance', fileopt: 'overwrite' };
    plotly.plot([atlasData, ec2Data, azureData], graphOptions, function (err, msg) {
        if (err) return console.log(err);
        // console.log(msg);
    });
}

function main() {
    // generate the data
    const sensorData = generateSensorData();
    saveToDatabases(sensorData);
}

setInterval(main, 10000);
