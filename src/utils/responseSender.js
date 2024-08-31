const responseSender = (resObj, res) =>
    res.status(resObj.status).json({
        success: resObj.success,
        message: resObj.message,
        data: resObj.data,
    });

module.exports = responseSender;
