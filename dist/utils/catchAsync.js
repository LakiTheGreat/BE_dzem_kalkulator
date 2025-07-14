export const catchAsync = (handler) => (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch((err) => next(err));
};
//# sourceMappingURL=catchAsync.js.map