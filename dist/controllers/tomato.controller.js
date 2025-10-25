import status from 'http-status';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { createTomatoOrderService, deleteTomatoOrderService, getAllTomatoCupsService, getAllTomatoOrdersService, getTomatoOrderByIdService, updateTomatoOrderService, } from '../services/tomato.service.js';
import AppError from '../utils/AppError.js';
export const getTomatoOrderById = asyncHandler(async (req, res) => {
    const userId = Number(req.header('x-user-id'));
    const id = Number(req.params.id);
    if (isNaN(id)) {
        throw new AppError('Invalid ID', status.BAD_REQUEST);
    }
    const tomatoTransaction = await getTomatoOrderByIdService(id, userId);
    if (!tomatoTransaction) {
        throw new AppError('TomatoTransaction not found', status.NOT_FOUND);
    }
    res.status(status.OK).json(tomatoTransaction);
});
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
export const updateTomatoOrder = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const userId = Number(req.header('x-user-id'));
    if (isNaN(id)) {
        throw new AppError('Invalid ID', status.BAD_REQUEST);
    }
    const { numOfCups, totalExpense } = req.body;
    const updatedOrder = await updateTomatoOrderService(id, {
        numOfCups,
        totalExpense,
    }, userId);
    if (!updatedOrder) {
        throw new AppError('TomatoOrder not found', status.NOT_FOUND);
    }
    res.status(status.OK).json(updatedOrder);
});
export const deleteTomatoOrder = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const userId = Number(req.header('x-user-id'));
    if (isNaN(id)) {
        throw new AppError('Invalid ID', status.BAD_REQUEST);
    }
    const deletedOrder = await deleteTomatoOrderService(id, userId);
    if (!deletedOrder) {
        throw new AppError('TomatoOrder not found', status.NOT_FOUND);
    }
    res.status(status.OK).json(deletedOrder);
});
//# sourceMappingURL=tomato.controller.js.map