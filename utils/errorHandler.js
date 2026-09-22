export default (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const status = err.status || "error";

    res.status(statusCode).json({
        status,
        message: err.isOperational
            ? err.message
            : "Something went wrong"
    });
};