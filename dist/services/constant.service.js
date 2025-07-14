import prisma from '../utils/db.js';
export const getConstantByIdService = async (id) => {
    const constant = await prisma.configConstant.findUnique({
        where: {
            id: Number(id),
        },
    });
    return constant;
};
export const patchConstantService = async (id, value, label, isDeleted) => {
    const updated = await prisma.configConstant.update({
        where: { id: Number(id) },
        data: {
            ...(value !== undefined && { value }),
            ...(label !== undefined && { label }),
            ...(isDeleted !== undefined && { isDeleted }),
        },
    });
    return updated;
};
//# sourceMappingURL=constant.service.js.map