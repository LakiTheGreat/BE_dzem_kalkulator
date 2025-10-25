import status from 'http-status';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { createTomatoOrderService, getAllTomatoCupsService, getAllTomatoOrdersService, } from '../services/tomato.service.js';
import AppError from '../utils/AppError.js';
export const getAllTomatoCups = asyncHandler(async (req, res) => {
    const userId = Number(req.header('x-user-id'));
    const whereClause = { isDeleted: false, userId };
    const tomatoCups = await getAllTomatoCupsService(whereClause);
    res.status(status.OK).json(tomatoCups);
});
export const createTomatoOrder = asyncHandler(async (req, res) => {
    const { cupTypeId, totalExpenses, numOfCups } = req.body;
    const userId = Number(req.header('x-user-id'));
    const tomatoOrder = await createTomatoOrderService({
        cupType: cupTypeId,
        totalExpenses,
        numOfCups,
        userId,
    });
    if (!tomatoOrder) {
        throw new AppError('Tomato order was not created found', status.BAD_REQUEST);
    }
    res.status(status.OK).json(tomatoOrder);
});
export const getAllTomatoOrders = asyncHandler(async (req, res) => {
    const userId = Number(req.header('x-user-id'));
    const whereClause = { isDeleted: false, userId };
    const tomatoOrders = await getAllTomatoOrdersService(whereClause);
    res.status(status.OK).json(tomatoOrders);
});
//# sourceMappingURL=tomato.controller.js.map