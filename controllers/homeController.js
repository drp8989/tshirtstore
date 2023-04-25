const bigPromise = require('../middlewares/bigPromise');


exports.home = bigPromise(async (req,res) => {
    //const db = await something()
    res.status(200).json({
        success:true,
        greeting:"Hello from API",
    });
});